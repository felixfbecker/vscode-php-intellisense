'use strict';

import * as path from 'path';

import { ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient';

export function activate(context: ExtensionContext) {

    // The server is implemented in PHP
    const serverPath = context.asAbsolutePath(path.join('vendor', 'felixfbecker', 'language-server', 'bin', 'php-language-server.php'));

    const serverOptions: ServerOptions = {
        command: 'php',
        args: [serverPath]
    };

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
}
