'use strict';

import * as path from 'path';
import { spawn, execFile, ChildProcess } from 'child_process';
import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient';
import * as semver from 'semver';
import * as net from 'net';

export function activate(context: vscode.ExtensionContext) {

    // Check if PHP is available and version is ^7.0.0
    execFile('php', ['--version'], (err: NodeJS.ErrnoException, stdout: Buffer, stderr: Buffer) => {

        if (err) {
            if (err.code === 'ENOENT') {
                vscode.window.showErrorMessage('PHP executable not found. You need PHP 7 installed and in your PATH');
            } else {
                vscode.window.showErrorMessage('Error spawning PHP: ' + err.message);
                console.error(err);
            }
            return;
        }

        // Parse version and discard OS info like 7.0.8--0ubuntu0.16.04.2
        let version = stdout.toString().match(/^PHP ([^\s]+)/)[1].split('-')[0];
        // Convert PHP prerelease format like 7.0.0rc1 to 7.0.0-rc1
        if (!/^\d+.\d+.\d+$/.test(version)) {
            version = version.replace(/(\d+.\d+.\d+)/, '$1-');
        }
        if (semver.lt(version, '7.0.0')) {
            vscode.window.showErrorMessage('The language server needs at least PHP 7 installed and in your PATH. Version found: ' + version);
            return;
        }

        const serverOptions = () => new Promise<ChildProcess | StreamInfo>((resolve, reject) => {
            function spawnServer(...args: string[]): ChildProcess {
                // The server is implemented in PHP
                const serverPath = context.asAbsolutePath(path.join('vendor', 'felixfbecker', 'language-server', 'bin', 'php-language-server.php'));
                const childProcess = spawn('php', [serverPath, ...args]);
                childProcess.stderr.on('data', (chunk: Buffer) => {
                    console.error(chunk + '');
                });
                childProcess.stdout.on('data', (chunk: Buffer) => {
                    console.log(chunk + '');
                });
                return childProcess;
            }
            if (process.platform === 'win32') {
                // Use a TCP socket on Windows because of blocking STDIO
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
                    const address = '127.0.0.1:' + server.address().port;
                    spawnServer('--tcp', address);
                });
            } else {
                // Use STDIO on Linux / Mac
                resolve(spawnServer());
            }
        });

        // Options to control the language client
        let clientOptions: LanguageClientOptions = {
            // Register the server for php documents
            documentSelector: ['php']
            // synchronize: {
            //     // Synchronize the setting section 'php' to the server
            //     configurationSection: 'php',
            //     // Notify the server about file changes to composer.json files contain in the workspace
            //     fileEvents: workspace.createFileSystemWatcher('**/composer.json')
            // }
        };

        // Create the language client and start the client.
        const disposable = new LanguageClient('PHP Language Client', serverOptions, clientOptions).start();

        // Push the disposable to the context's subscriptions so that the
        // client can be deactivated on extension deactivation
        context.subscriptions.push(disposable);
    });
}
