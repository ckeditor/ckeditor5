---
menu-title: Using package generator
category: framework-guides
order: 35
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
│  ├─ dll.html         # The editor initialized using the DLL builds. Check README for details.
│  ├─ index.html       # The sample file.
│  └─ ckeditor.js      # The editor initialization script.
├─ src
│  ├─ index.js         # The modules exported by the package when using the DLL builds.
│  ├─ myplugin.js      # The plugin that shows the very basic usage of the CKEditor 5 framework.
│  └─ **/*.js          # All JavaScript source files should be saved here.
├─ tests
│  ├─ index.js         # Tests for the plugin.
│  ├─ myplugin.js
│  └─ **/*.js          # All tests should be saved here.
├─ theme
│  ├─ icons
│  │  ├─ ckeditor.svg  # The CKEditor 5 icon displayed in the toolbar.
│  │  └─ **/*.svg      # All icon files should be saved here.
│  └─ **/*.css         # All CSS files should be saved here.
│
├─ .editorconfig       # https://editorconfig.org/
├─ .eslintrc.js        # Eslint configuration file.
├─ .gitattributes      # https://git-scm.com/docs/gitattributes
├─ .gitignore          # https://git-scm.com/docs/gitignore
├─ .stylelintrc        # Stylelint configuration file.
├─ LICENSE.md          # All packages created with the tool are available under the MIT license.
├─ package.json        # https://docs.npmjs.com/cli/v7/configuring-npm/package-json
└─ README.md           # Description of your project and usage instructions.
```

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
# Execute eslint.
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

Creates a DLL-compatible package build which can be loaded into an editor using [DLL builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/dll-builds.html).

Examples:

```bash
# Build the DLL file that is ready to publish.
npm run dll:build

# Build the DLL file and listen to changes in its sources.
npm run dll:build -- --watch
```

### `dll:serve`

Creates a simple HTTP server (without the live-reload mechanism) that allows verifying whether the DLL build of the package is compatible with the CKEditor 5 [DLL builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/dll-builds.html).

Examples:

```bash
# Starts the HTTP server and opens the browser.
npm run dll:serve
```

### `prepare` and `prepublishOnly`

If you need to perform operations on your package before it is used, in a way that is not dependent on the operating system or architecture of the target system, use a `prepare` script. This includes tasks such as:

* Creating minified versions of JavaScript source code.
* Fetching remote resources that your package will use.

Examples:

```bash
#
npm run prepare
```

> Since `npm@1.1.71`, the npm CLI has run the `prepublish` script for both `npm publish` and `npm install`, because it's a convenient way to prepare a package for use (some common use cases are described in the section below). It has also turned out to be, in practice, very confusing. As of `npm@4.0.0`, a new event has been introduced, `prepare`, that preserves this existing behavior. A new event, `prepublishOnly` has been added as a transitional strategy to allow users to avoid the confusing behavior of existing npm versions and only run on `npm publish` (for instance, running the tests one last time to ensure they're in good shape).

[npm Docs](https://docs.npmjs.com/cli/v7/using-npm/scripts#prepare-and-prepublish)

## How to change eslint configuration?

To change eslint config, edit the [.eslintrc.js](https://github.com/ckeditor/ckeditor5-package-generator/blob/master/.eslintrc.js) file. It is also a good idea to check out the [eslint docs](https://eslint.org/docs/rules/).

## Why do we force using eslint (e.g. DLL limitations)?

To make CKEditor 5 plugins compatible with each other, we needed to introduce limitations when importing files from packages - [`More info here`](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/contributing/code-style.html#dll-builds-ckeditor5-rulesckeditor-imports).

## Publishing

After generating the changelog, you are ready for publishing packages.

First, you need to bump their versions:

```bash
npm run release:bump-version
```

You can also use the `--dry-run` option to see what this task does.

After bumping versions, you can publish changes:

```bash
npm run release:publish
```

As in the previous task, the `--dry-run` option is also available.

## DLL – what is it and why does it exist?

The purpose of a DLL build is to allow adding plugins to an editor build without having to rebuild (recompile) the build itself.

So far, the two most common integration methods included:

* Using pre-compiled builds. This can be either one of the official builds or a custom build. In this case, adding a plugin requires recompiling the entire build.
* Integrating the editor from source. In this case, if you want to add a plugin, your application needs to be recompiled.

In some advanced use cases, the list of available plugins cannot be limited &mdash; it should be possible to add plugins without any access to Node.js. In other words, plugins should be built (compiled) separately from the editor's core.

This is where the DLL builds come to the rescue.

DLL builds are based on the [DLL webpack](https://webpack.js.org/plugins/dll-plugin/) plugin that provides a CKEditor 5 **base DLL** and a set of **[DLL consumer plugins](https://webpack.js.org/plugins/dll-plugin/#dllreferenceplugin)**.

Currently, CKEditor 5 does not come with a ready-to-use DLL build. Using this integration method requires creating it on your own, based on the tools available in the {@link framework/guides/contributing/development-environment CKEditor 5 development environment}.

Follow the [Ship CKEditor 5 DLLs](https://github.com/ckeditor/ckeditor5/issues/9145) issue for updates (and add 👍&nbsp; if you are interested in this functionality).

For more info on DLL builds, [visit the docs page](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/dll-builds.html).

## Translations

All CKEditor 5 WYSIWYG editor features support message localization. It means that the user interface of any feature can be translated into various languages and regions depending on the user's preferences.

CKEditor 5 translation system is open to third-party plugins. Any custom features that you introduce can be localized. The system also provides a way to add missing or overwrite existing translations and supports translating plural forms.

For more info on translations, [visit the docs page](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/localization.html).

## Developing tools in the repository

When creating a new package with the `--dev` option, the local version of the `@ckeditor/ckeditor5-package-tools` will be installed instead of its npm version.

However, applying changes in the local repository does not impact an already created package. Hence, you need to create a [link](https://docs.npmjs.com/cli/link/) between the local repository and the new package.

```bash
# The assumption here is your current working directory points to the root directory in the repository.
cd packages/ckeditor5-package-tools
npm link

# Then, go to the newly created package.
cd /path/to/new/package/ckeditor5-foo
npm link @ckeditor/ckeditor5-package-tools
```

Now, the newly created package uses changes from the local repository.

## Reporting issues

If you found a problem with CKEditor 5 or the package generator, please, report an issue:

* [CKEditor 5](https://github.com/ckeditor/ckeditor5/issues/new/choose)
* [The package generator](https://github.com/ckeditor/ckeditor5-package-generator/issues/new)
