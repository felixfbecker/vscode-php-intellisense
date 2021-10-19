import execa from 'execa'
import { ChildProcess, spawn } from 'mz/child_process'
import * as net from 'net'
import * as path from 'path'
import * as semver from 'semver'
import * as url from 'url'
import * as vscode from 'vscode'
import { LanguageClient, LanguageClientOptions, RevealOutputChannelOn, StreamInfo } from 'vscode-languageclient'
const composerJson = require('../composer.json')

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const conf = vscode.workspace.getConfiguration('php')
    const executablePath =
        conf.get<string>('executablePath') ||
        conf.get<string>('validate.executablePath') ||
        (process.platform === 'win32' ? 'php.exe' : 'php')

    const memoryLimit = conf.get<string>('memoryLimit') || '4095M'

    if (memoryLimit !== '-1' && !/^\d+[KMG]?$/.exec(memoryLimit)) {
        const selected = await vscode.window.showErrorMessage(
            'The memory limit you\'d provided is not numeric, nor "-1" nor valid php shorthand notation!',
            'Open settings'
        )
        if (selected === 'Open settings') {
            await vscode.commands.executeCommand('workbench.action.openGlobalSettings')
        }
        return
    }

    // Check path (if PHP is available and version is ^7.0.0)
    let stdout: string
    try {
        stdout = await execa.stdout(executablePath, ['--version'], { preferLocal: false })
    } catch (err) {
        if (err.code === 'ENOENT') {
            const selected = await vscode.window.showErrorMessage(
                'PHP executable not found. Install PHP 7 and add it to your PATH or set the php.executablePath setting',
                'Open settings'
            )
            if (selected === 'Open settings') {
                await vscode.commands.executeCommand('workbench.action.openGlobalSettings')
            }
        } else {
            vscode.window.showErrorMessage('Error spawning PHP: ' + err.message)
            console.error(err)
        }
        return
    }

    // Parse version and discard OS info like 7.0.8--0ubuntu0.16.04.2
    const match = stdout.match(/^PHP ([^\s]+)/m)
    if (!match) {
        vscode.window.showErrorMessage('Error parsing PHP version. Please check the output of php --version')
        return
    }
    let version = match[1].split('-')[0]
    // Convert PHP prerelease format like 7.0.0rc1 to 7.0.0-rc1
    if (!/^\d+.\d+.\d+$/.test(version)) {
        version = version.replace(/(\d+.\d+.\d+)/, '$1-')
    }
    if (semver.lt(version, composerJson.config.platform.php)) {
        vscode.window.showErrorMessage(
            'The language server needs at least PHP 7.1 installed. Version found: ' + version
        )
        return
    }

    let client: LanguageClient

    const serverOptions = () =>
        new Promise<ChildProcess | StreamInfo>((resolve, reject) => {
            // Use a TCP socket because of problems with blocking STDIO
            const server = net.createServer(socket => {
                // 'connection' listener
                console.log('PHP process connected')
                socket.on('end', () => {
                    console.log('PHP process disconnected')
                })
                server.close()
                resolve({ reader: socket, writer: socket })
            })
            // Listen on random port
            server.listen(0, '127.0.0.1', () => {
                // The server is implemented in PHP
                const childProcess = spawn(executablePath, [
                    context.asAbsolutePath(
                        path.join('vendor', 'felixfbecker', 'language-server', 'bin', 'php-language-server.php')
                    ),
                    '--tcp=127.0.0.1:' + server.address().port,
                    '--memory-limit=' + memoryLimit,
                ])
                childProcess.stderr.on('data', (chunk: Buffer) => {
                    const str = chunk.toString()
                    console.log('PHP Language Server:', str)
                    client.outputChannel.appendLine(str)
                })
                // childProcess.stdout.on('data', (chunk: Buffer) => {
                //     console.log('PHP Language Server:', chunk + '');
                // });
                childProcess.on('exit', (code, signal) => {
                    client.outputChannel.appendLine(
                        `Language server exited ` + (signal ? `from signal ${signal}` : `with exit code ${code}`)
                    )
                    if (code !== 0) {
                        client.outputChannel.show()
                    }
                })
                return childProcess
            })
        })

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for php documents
        documentSelector: [{ scheme: 'file', language: 'php' }, { scheme: 'untitled', language: 'php' }],
        revealOutputChannelOn: RevealOutputChannelOn.Never,
        uriConverters: {
            // VS Code by default %-encodes even the colon after the drive letter
            // NodeJS handles it much better
            code2Protocol: uri => url.format(url.parse(uri.toString(true))),
            protocol2Code: str => vscode.Uri.parse(str),
        },
        synchronize: {
            // Synchronize the setting section 'php' to the server
            configurationSection: 'php',
            // Notify the server about changes to PHP files in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.php'),
        },
    }

    // Create the language client and start the client.
    client = new LanguageClient('php-intellisense', 'PHP Language Server', serverOptions, clientOptions)
    const disposable = client.start()

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable)
}
