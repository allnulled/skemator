# skemator

To build diagrams via scripting.

## Index

- [Introduction](#introduction)
- [Installation](#installation)
- [Get started](#get-started)
- [Usage](#usage)
   - [CLI](#cli)
   - [API](#api)
   - [Browser](#browser)
- [Language](#language)
- [Versioning](#versioning)
- [Issues](#issues)
- [License](#license)

## Introduction

Welcome to the **`skemator` official documentation**.

By `skemator`, we can refer to:

  - **Skemator Project**: this whole set of tools.
  - **Skemator Language**: the programming language implementation of `skemator`.
  - **Skemator CLI**: the command-line interface of `skemator`.
  - **Skemator API**: the abstract programming interface of `skemator`.

## Installation

`$ npm i -g skemator`

## Get started

To start working with `skemator`, create the following file called `example1.skm`:

```
#L2R
[This]
 [is]
  ==>[imagination]=i1
   [or]=o1
    [reality]=r1
  ==>[reality]=r2
   [or]=o2
    [imagination]=i2
@i1 .-> @i2
@r1 .-> @r2

```

(Use double quotes to wrap special characters, like `.`, `-`, or others that can arise errors.)


Then, from the console, you can type this to generate an image from your `*.skm` file:

`$ skemator compile example1.skm --png`

Automatically, a `example1.png` will be generated beside `example1.skm`. It should look like:

![A complete diagram](./test/example.png)

## Usage

Below, the CLI and API usages are explained.

### CLI

The `skemator CLI` brings some powerful shortcuts. With it, we can:

- Compile `*.skm` to `*.mmd`, `*.png`, `*.svg`, `*.pdf`
- Compile `*.plantuml` to `*.png`
- Compile `index.md` to `book.md`
- Compile `*.bkm` to a real files and folders

So, this tool can be useful for anyone who works with `skm`, `bkm`, `plantuml` and `md`.

#### Help

The help for all the commands:

```
Usage:
  skemator <command> <args> [options]

Commands:
  skemator compile <files..>      Compile skemator files
  skemator compile:uml <files..>  Compile plantuml files
  skemator compile:book <file>    Compile markdown files recursively in 1
  skemator create:book <folder>   Create a book in a folder (by a script
                                  optionally)

Options:
  --version  Show version number                                       [boolean]
  --verbose                                           [boolean] [default: false]
  --help     Show help                                                 [boolean]
```

The help to compile a `*.skm` file to `*.mmd` (and `*.pdf`, `*.png`, `*.svg`):

```
skemator compile <files..>

Compile skemator files

Options:
  --version    Show version number                                     [boolean]
  --verbose                                           [boolean] [default: false]
  --help       Show help                                               [boolean]
  --pdf                                               [boolean] [default: false]
  --png                                               [boolean] [default: false]
  --svg                                               [boolean] [default: false]
  --watch, -w                                         [boolean] [default: false]
  --command                                                 [default: "compile"]
```

The help to compile a `*.uml` or `*.plantuml` file into `*.png`:

```
skemator compile:uml <files..>

Compile plantuml files

Options:
  --version    Show version number                                     [boolean]
  --verbose                                           [boolean] [default: false]
  --help       Show help                                               [boolean]
  --watch, -w                                         [boolean] [default: false]
  --command                                              [default: "compileUML"]
```

The help to compile a book (into a `book.md` file from an `index.md` file):

```
skemator compile:book <file>

Compile markdown files recursively in 1

Options:
  --version    Show version number                                     [boolean]
  --verbose                                           [boolean] [default: false]
  --help       Show help                                               [boolean]
  --title                                             [boolean] [default: false]
  --index                                             [boolean] [default: false]
  --watch, -w                                         [boolean] [default: false]
  --command                                             [default: "compileBook"]
```

The help to create a book (optionally using a `*.bkm` script):

```
skemator create:book <folder>

Create a book in a folder (by a script optionally)

Options:
  --version     Show version number                                    [boolean]
  --verbose                                           [boolean] [default: false]
  --help        Show help                                              [boolean]
  --script, -s                                          [string] [default: null]
  --watch, -w                                         [boolean] [default: false]
  --command                                              [default: "createBook"]
```

#### Compile example

Example: it compiles `first.skm second.skm third.skm` and generates the `*.mmd *.png *.svg *.pdf` files.

`$ skemator compile first.skm second.smk third.skm --png --svg --pdf`

#### Watch example

Example: it watches `first.skm second.skm third.skm` for changes and generates the `*.mmd *.png *.svg *.pdf` files.

`$ skemator compile first.skm second.smk third.skm --png --svg --pdf --watch`

### API

The API shares all the options accepted by the CLI, but passed in a JavaScript object to the `Skemator.execute` static method as unique parameter. The `command` property is reserved by this software, and it indicates which method needs to be statically invoked by the `Skemator` class, and this way we can dispatch all the commands from the same method.3

#### Import module

```js
const Skemator = require("skemator");
```

#### Compile example

Example: compiles `first.skm second.skm third.skm` and generates the `*.mmd *.png *.svg *.pdf` files.

```js
Skemator.execute({
  command: "compile",
  files: ["first.skm", "second.smk", "third.skm"]
  png: true,
  svg: true,
  pdf: true
});
```

#### Watch example

Example: watches `first.skm second.skm third.skm` for changes and generates the `*.mmd *.png *.svg *.pdf` files.

```js
Skemator.execute({
  command: "watch",
  files: ["first.skm", "second.smk", "third.skm"]
  png: true,
  svg: true,
  pdf: true
});
```

### Browser

Browser is not supported yet.

<!--

For browser usage, import normally the package.

#### Compile (from browser) example

In browsers, we only have this method, which in Windows gives problems...

```js
Skemator.fromSkematorToSvg("#L2R\n[Hello]\n [World]\n  [!]=0\n").then(code => {
  console.log(code.svg);
  console.log(code.mmd);
});
```
-->

## Language

Every script read by this tool follows a specific set of grammar rules.

Every script is composed by the header (options, currently the direction) and the body.

### Script options

Each option has a new line character ('\n') at the end of it.

#### Diagram direction option

One of:

- `#L2R`: from left to right
- `#R2L`: from right to left
- `#T2B`: from top to bottom
- `#B2T`: from bottom to top

### Script body

Every body of a script is composed by sentences.

Every sentence is finished with a new line character (`\n`).

Below, the different types of sentences are explained.

#### Sentence type 1: Node sentence

Node: `  --some message-->[Node]=id`

...where...

- `  ` is the tabulation. **Optional**.
- `--some message` is the message of the relation with its parent. **Optional**.
- `-->` is the type of the relation with its parent. Optional, but needed for the message. It can be:
  - `-->` which is an arrow
  - `.->` which is a dotted arrow
  - `==>` which is a bold arrow
  - `---` which is a line
- `[Node]` is the of the node (`[`, `]`) and its text content (`Node`). **Required**. It can be:
  - `[...]` which is a square
  - `<...>` which is a diammond
  - `{...}` which is a rounded square
  - `(...)` which is a circle
- `=id` is the identifier for the node. **Optional**.

...or, alternatively...

Node: `  --some message-->@id`

...where...

- `  ` is the tabulation. **Optional**. It indicates in which level of the main tree is set this node. With the tabulation, we implicitly overstand a relation between this node and its corresponding parent in the tree, and this way we do not need to explicitly code every time this implicit relation.
- `--some message` is the message of the relation with its parent. **Optional**.
- `-->` is the type of the relation with its parent. **Optional**, but needed for the message.
- `@id` is the identifier for the node. **Required**.

#### Sentence type 2: Relation sentence

Node: `[Some node]--some message-->@someOtherNode`

...where...

- `[Some node]` is the node source of the relation. **Required**. Any type of node is accepted.
- `--some message` is the message of the relation with its parent. **Optional**.
- `-->` is the type of the relation with its parent. **Required**.
- `@someOtherNode` is the node destination of the relation. **Required**. Any type of node is accepted.

*Note: each sentence ends with a new line (`\n`), included the last one.*

## Versioning

This projects adheres to the [semmantic versioning 2.0](https://semver.org/) of `MAJOR.MINOR.PATCH`.

## Issues

Please, share the issues you found in the corresponding section of the package. Thank you.

## Changelog

Changes from version to version are available in the `CHANGELOG.md` file in the root.

## License

This license is tied to the license of [mermaid](#) and other libraries.

But the part developed by me is `WTFL` (which means *meh*).

