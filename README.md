# PHP IntelliSense

[![Latest Release](https://vsmarketplacebadge.apphb.com/version-short/felixfbecker.php-intellisense.svg)](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-intellisense) [![Installs](https://vsmarketplacebadge.apphb.com/installs/felixfbecker.php-intellisense.svg)](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-intellisense) [![Rating](https://vsmarketplacebadge.apphb.com/rating-short/felixfbecker.php-intellisense.svg)](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-intellisense) [![Build Status](https://travis-ci.org/felixfbecker/vscode-php-intellisense.svg?branch=master)](https://travis-ci.org/felixfbecker/vscode-php-intellisense) [![Dependency Status](https://gemnasium.com/felixfbecker/vscode-php-intellisense.svg)](https://gemnasium.com/felixfbecker/vscode-php-intellisense) [![Minimum PHP Version](https://img.shields.io/badge/php-%3E%3D%207.0-8892BF.svg)](https://php.net/) [![Gitter](https://badges.gitter.im/felixfbecker/vscode-php-intellisense.svg)](https://gitter.im/felixfbecker/vscode-php-intellisense?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Advanced PHP IntelliSense for Visual Studio Code.

**Note: This is just the VS Code extension that spawns the actual language server. The language server itself is implemented purely in PHP [in its own repository](https://github.com/felixfbecker/php-language-server), all features need to be implemented there and all issues should be reported there.**

## Installation

You need at least PHP 7 installed for the extension to work. You can either add it to your PATH or set the `php.executablePath` setting. 

I recommend to disable VS Code's built-in PHP IntelliSense by setting `php.suggest.basic` to `false` to avoid duplicate suggestions.

## Features

### Completion
![Completion search demo](images/completion.gif)

### Workspace symbol search
![Workspace symbol search demo](images/workspaceSymbol.gif)

### Find all References
![Find References demo](images/references.png)

### Go to Definition
![Go To Definition demo](images/definition.gif)

### Hover
![Hover class demo](images/hoverClass.png)

![Hover parameter demo](images/hoverParam.png)

### Find all symbols
![Find all symbols demo](images/documentSymbol.gif)

### Format code
![Format code demo](images/formatDocument.gif)

### Column-accurate error reporting
![Error reporting demo](images/publishDiagnostics.png)


## Todo
 - Rename
 - Signature help

## Contributing

Clone whole repository and in root directory execute:
```bash
composer install 
npm install
npm run compile
code .
```
The last command will open the folder in VS Code. Hit `F5` to launch an Extension Development Host with the extension.
For working on the language server, the easiest way is to replace the language server installation from composer in `vendor/felixfbecker/language-server` with a symlink to your local clone.

**For guidance on how to work on the language server, please see the [language server repository](https://github.com/felixfbecker/php-language-server).**
