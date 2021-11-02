---
menu-title: Using package generator
category: framework-guides
order: 35
modified_at: 2021-11-01
---

# Using package generator

The [`ckeditor5-package-generator`](https://www.npmjs.com/package/ckeditor5-package-generator) is a tool for developers, and it creates a working package with the development environment that allows writing new plugins for CKEditor 5.

## Quick start

To create a new package without installing the tool, execute the following command:

```bash
npx ckeditor5-package-generator <packageName> [--verbose] [--use-npm]
```

The `<packageName>` argument is required and must follow these rules:

* The provided name must match the schema: `@scope/ckeditor5-*`, where [@scope](https://docs.npmjs.com/about-scopes) is an owner of the package.
* The package name must start with the `ckeditor5-` prefix.
* Allowed characters are numbers (`0-9`), lowercase letters (`a-z`) and symbols: `-` `.` `_`.

As a result of executing the command, a new directory with a package will be created. The directory's name will be equal to the specified package name without the `@scope` part, and it will contain an example plugin and the development environment.

Available modifiers for the command are:

* `--verbose` &ndash; (alias: `-v`) whether to prints additional logs about the current executed task.
* `--use-npm` &ndash; whether to use `npm` instead of `yarn` when installing dependencies in a newly created package.

After successfully creating the new package, enter it by executing the following command:

```
// assuming that your package was created with `ckeditor5-foo` as its name
cd ckeditor5-foo
```

Then run the test environment for the plugin by executing:

```
npm run start
```

There, the plugin can be seen within the example editor.

## Structure of the project

An overview of the project's directory structure:

```plain-text
├─ sample
│  ├─ dll.html             # The editor initialized using the DLL builds.
│  ├─ index.html           # The sample file.
│  └─ ckeditor.js          # The editor initialization script.
├─ src
│  ├─ index.js             # The modules exported by the package when using the DLL builds.
│  ├─ myplugin.js          # Very basic plugin that utilizes the CKEditor 5 framework.
│  └─ **/*.js              # All JavaScript source files should be saved here.
├─ tests
│  ├─ index.js             # Tests for the plugin.
│  ├─ myplugin.js
│  └─ **/*.js              # All tests should be saved here.
├─ theme
│  ├─ icons
│  │  ├─ ckeditor.svg      # The CKEditor 5 icon displayed in the toolbar.
│  │  └─ **/*.svg          # All icon files should be saved here.
│  └─ **/*.css             # All CSS files should be saved here.
│
├─ .editorconfig           # See link below for details.
├─ .eslintrc.js            # ESLint configuration file.
├─ .gitattributes          # See link below for details.
├─ .gitignore              # See link below for details.
├─ .stylelintrc            # Stylelint configuration file.
├─ ckeditor5-metadata.json # See link below for details.
├─ LICENSE.md              # All created packages fall under the MIT license.
├─ package.json            # See link below for details.
└─ README.md               # Description of your project and usage instructions.
```

Guides for developing some files:
* [.editorconfig](https://editorconfig.org/)
* [.gitattributes](https://git-scm.com/docs/gitattributes)
* [.gitignore](https://git-scm.com/docs/gitignore)
* {@link framework/guides/contributing/package-metadata ckeditor5-metadata.json}
* [package.json](https://docs.npmjs.com/cli/v7/configuring-npm/package-json)

## Npm scripts

Npm scripts are a convenient way to provide commands in a project. They are defined in the `package.json` file and shared with other people contributing to the project. It ensures that developers use the same command with the same options (flags).

All the scripts can be executed by running `npm run <script>`. Pre and post commands with matching names will be run for those as well.

The following scripts are available in the package.

### `start`

Starts a HTTP server with the live-reload mechanism that allows previewing and testing plugins available in the package.

When the server has been started, the default browser will open the developer sample. This can be disabled by passing the `--no-open` option to that command.

Examples:

```bash
# Starts the server and open the browser.
npm run start

# Disable auto-opening the browser.
npm run start -- --no-open
```

### `test`

Allows executing unit tests for the package, specified in the `tests/` directory. The command accepts the following modifiers:

* `--coverage` &ndash; to create the code coverage report,
* `--watch` &ndash; to observe the source files (the command does not end after executing tests),
* `--source-map` &ndash; to generate source maps of sources,
* `--verbose` &ndash; to print additional webpack logs.

Examples:

```bash
# Execute tests.
npm run test

# Generate code coverage report after each change in the sources.
npm run test -- --coverage --test
```

### `lint`

Runs ESLint, which analyzes the code (all `*.js` files) to quickly find problems.

Examples:

```bash
# Execute ESLint.
npm run lint
```

### `stylelint`

Similar to the `lint` task, stylelint analyzes the CSS code (`*.css` files in the `theme/` directory) in the package.

Examples:

```bash
# Execute stylelint.
npm run stylelint
```

### `dll:build`

Creates a DLL-compatible package build which can be loaded into an editor using {@link builds/guides/development/dll-builds DLL builds}.

Examples:

```bash
# Build the DLL file that is ready to publish.
npm run dll:build

# Build the DLL file and listen to changes in its sources.
npm run dll:build -- --watch
```

### `dll:serve`

Creates a simple HTTP server (without the live-reload mechanism) that allows verifying whether the DLL build of the package is compatible with the CKEditor 5 {@link builds/guides/development/dll-builds DLL builds}.

Examples:

```bash
# Starts the HTTP server and opens the browser.
npm run dll:serve
```

### `prepare` and `prepublishOnly`

Npm supports some special [life cycle scripts](https://docs.npmjs.com/cli/v7/using-npm/scripts#life-cycle-scripts) that allow performing operations on your package before it is published. In the context of the generated package, they just create a DLL-compatible package build.

## How to change ESLint configuration?

To change ESLint config, edit the [.eslintrc.js](https://github.com/ckeditor/ckeditor5-package-generator/blob/master/.eslintrc.js) file. It is also a good idea to check out the [ESLint docs](https://eslint.org/docs/rules/).

### Why the predefined ESLint rules are recommended?

To make CKEditor 5 plugins compatible with each other, we needed to introduce limitations when importing files from packages. To learn more, visit the {@link builds/guides/development/dll-builds DLL guide} and {@link framework/guides/contributing/code-style#dll-builds-ckeditor5-rulesckeditor-imports see detailed explanation} about the limitation.

## Translations

Packages created by this tool, just like the entirety of the CKEditor 5 ecosystem include full support for localization. If you wish to include translations for your package, {@link framework/guides/deep-dive/localization visit the docs page} and learn more.

## Reporting issues

If you found a problem with CKEditor 5 or the package generator, please, report an issue:

* [CKEditor 5](https://github.com/ckeditor/ckeditor5/issues/new/choose)
* [The package generator](https://github.com/ckeditor/ckeditor5-package-generator/issues/new)
