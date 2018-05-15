
import * as path from 'path';
import { spawn, execFile, ChildProcess } from 'mz/child_process';
import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient';
import * as semver from 'semver';
import * as net from 'net';
import * as url from 'url';

export async function activate(context: vscode.ExtensionContext): Promise<void> {

    const conf = vscode.workspace.getConfiguration('php');
    const executablePath = conf.get<string>('executablePath') || 'php';

    const memoryLimit = conf.get<string>('memoryLimit') || '4095M';

    if (memoryLimit !== '-1' && !/^\d+[KMG]?$/.exec(memoryLimit)) {
        const selected = await vscode.window.showErrorMessage(
            'The memory limit you\'d provided is not numeric, nor "-1" nor valid php shorthand notation!',
            'Open settings'
        );
        if (selected === 'Open settings') {
            await vscode.commands.executeCommand('workbench.action.openGlobalSettings');
        }
        return;
    }

    // Check path (if PHP is available and version is ^7.0.0)
    let stdout: string;
    try {
        [stdout] = await execFile(executablePath, ['--version']);
    } catch (err) {
        if (err.code === 'ENOENT') {
            const selected = await vscode.window.showErrorMessage(
                'PHP executable not found. Install PHP 7 and add it to your PATH or set the php.executablePath setting',
                'Open settings'
            );
            if (selected === 'Open settings') {
                await vscode.commands.executeCommand('workbench.action.openGlobalSettings');
            }
        } else {
            vscode.window.showErrorMessage('Error spawning PHP: ' + err.message);
            console.error(err);
        }
        return;
    }

    // Parse version and discard OS info like 7.0.8--0ubuntu0.16.04.2
    const match = stdout.match(/^PHP ([^\s]+)/m);
    if (!match) {
        vscode.window.showErrorMessage('Error parsing PHP version. Please check the output of php --version');
        return;
    }
    let version = match[1].split('-')[0];
    // Convert PHP prerelease format like 7.0.0rc1 to 7.0.0-rc1
    if (!/^\d+.\d+.\d+$/.test(version)) {
        version = version.replace(/(\d+.\d+.\d+)/, '$1-');
    }
    if (semver.lt(version, '7.0.0')) {
        vscode.window.showErrorMessage('The language server needs at least PHP 7 installed. Version found: ' + version);
        return;
    }

    const serverOptions = () => new Promise<ChildProcess | StreamInfo>((resolve, reject) => {
        // Use a TCP socket because of problems with blocking STDIO
        const server = net.createServer(socket => {
            // 'connection' listener
            console.log('PHP process connected');
            socket.on('end', () => {
                console.log('PHP process disconnected');
            });
            server.close();
            resolve({ reader: socket, writer: socket });
        });
        // Listen on random port
        server.listen(0, '127.0.0.1', () => {
            // The server is implemented in PHP
            const childProcess = spawn(executablePath, [
                context.asAbsolutePath(path.join('vendor', 'felixfbecker', 'language-server', 'bin', 'php-language-server.php')),
                '--tcp=127.0.0.1:' + server.address().port,
                '--memory-limit=' + memoryLimit
            ]);
            childProcess.stderr.on('data', (chunk: Buffer) => {
                console.error(chunk + '');
            });
            childProcess.stdout.on('data', (chunk: Buffer) => {
                console.log(chunk + '');
            });
            return childProcess;
        });
    });

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for php documents
        documentSelector: [
            { scheme: 'file', language: 'php' },
            { scheme: 'untitled', language: 'php' }
        ],
        uriConverters: {
            // VS Code by default %-encodes even the colon after the drive letter
            // NodeJS handles it much better
            code2Protocol: uri => url.format(url.parse(uri.toString(true))),
            protocol2Code: str => vscode.Uri.parse(str)
        },
        synchronize: {
            // Synchronize the setting section 'php' to the server
            configurationSection: 'php',
            // Notify the server about changes to PHP files in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.php')
        }
    };

    // Create the language client and start the client.
    const disposable = new LanguageClient('PHP Language Server', serverOptions, clientOptions).start();

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
}
