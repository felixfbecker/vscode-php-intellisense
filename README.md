# PHP IntelliSense

> **⚠ Work In Progress**

[![Latest Release](https://vsmarketplacebadge.apphb.com/version-short/felixfbecker.php-intellisense.svg)](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-intellisense) [![Installs](https://vsmarketplacebadge.apphb.com/installs/felixfbecker.php-intellisense.svg)](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-intellisense) [![Rating](https://vsmarketplacebadge.apphb.com/rating-short/felixfbecker.php-intellisense.svg)](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-intellisense) [![Build Status](https://travis-ci.org/felixfbecker/vscode-php-intellisense.svg?branch=master)](https://travis-ci.org/felixfbecker/vscode-php-intellisense) [![Dependency Status](https://gemnasium.com/felixfbecker/vscode-php-intellisense.svg)](https://gemnasium.com/felixfbecker/vscode-php-intellisense) [![Gitter](https://badges.gitter.im/felixfbecker/vscode-php-intellisense.svg)](https://gitter.im/felixfbecker/vscode-php-intellisense?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Advanced PHP IntelliSense for Visual Studio Code.
In opposite to the included PHP IntelliSense and other PHP extensions, this uses an AST to parse the source code
instead of relying on naive regular expression parsing.

## Features

### Find all symbols
![Find all symbols demo](images/documentSymbol.gif)

## Todo
 - Autocompletion
 - Rename
 - Goto definition
 - Format document
 - Hover
 - Follow composer autoloading

## Build and Run From Source
Clone whole repository and in root directory execute:
```bash
composer install 
npm install
npm run compile
code .
```
The last command will open the folder in VS Code. Hit `F5` to launch an Extension Development Host with the extension.

## Contributing

This is just the VS Code extension that spawns the actual language server. The language server itself is implemented purely in PHP [in its own repository](https://github.com/felixfbecker/php-language-server).
