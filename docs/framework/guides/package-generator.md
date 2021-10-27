---
menu-title: Using package generator
category: framework-guides
order: 35
---

# Using package generator

The `ckeditor5-package-generator` is a tool for developers, and it creates a working package with the development environment that allows writing new plugins for CKEditor 5.

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

After succesfully creating the new package, enter it by executing the following command:

```
// assuming that your package was created with `ckeditor5-foo` as its name
cd ckeditor5-foo
```

Then run the test enviroment for the plugin by executing:

```
yarn run start
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
├─ .editorconfig
├─ ...
└─ README.md
```

## Npm scripts

The following scripts are available in the package:

* `test` &ndash; prepares an entry file and passes it to the [karma](https://karma-runner.github.io/) test runner,
* `start` &ndash; prepares the [development server](https://webpack.js.org/configuration/dev-server/) with the live-reloading mechanism,
* `dll:build` &ndash; prepares a file compatible with [CKEditor 5 DLL](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/dll-builds.html) that exposes plugins from the package.

There are two ways to integrate these scripts, either with [npm scripts](https://docs.npmjs.com/cli/v7/using-npm/scripts) or Node.js scripts.

### Integration with npm scripts

Add the following tasks in `package.json`, in the `#scripts` section:

```json
{
  "dll:build": "ckeditor5-package-tools dll:build",
  "start": "ckeditor5-package-tools start",
  "test": "ckeditor5-package-tools test",
}
```

### Integration with Node.js scripts

The "test" task.

```js
'use strict';

const packageTools = require( '@ckeditor/ckeditor5-package-tools' );

packageTools.test( /* Ckeditor5PackageToolsOptions */ );
```

The "start" task:

```js
'use strict';

const packageTools = require( '@ckeditor/ckeditor5-package-tools' );

packageTools.start( /* Ckeditor5PackageToolsOptions */ );
```

The "dll:build" task:

```js
'use strict';

const packageTools = require( '@ckeditor/ckeditor5-package-tools' );

packageTools[ 'dll:build' ]( /* Ckeditor5PackageToolsOptions */ );
```

The `Ckeditor5PackageToolsOptions` object interface is described in the [`lib/utils/parse-arguments.js`](https://github.com/ckeditor/ckeditor5-package-generator/blob/master/packages/ckeditor5-package-tools/lib/utils/parse-arguments.js) file.

## Testing helpers

[`Testing helpers`](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/development-tools.html#testing-helpers).

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

For more info on DLL builds, [visit the docs page](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/dll-builds.html).

## Translations

For more info on translations, [visit the docs page](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/localization.html).

## Developing tools in the repository

When creating a new package with the `--dev` option, the local version of the `@ckeditor/ckeditor5-package-tools` will be installed instead of its npm version.

However, applying changes in the local repository does not impact an already created package. Hence, you need to create a [link](https://docs.npmjs.com/cli/link/) between the local repository and the new package.

```bash
# The assumption here is your current working directory points to the root directory in the repository.
cd packages/ckeditor5-package-tools
yarn link

# Then, go to the newly created package.
cd /path/to/new/package/ckeditor5-foo
yarn link @ckeditor/ckeditor5-package-tools
```

Now, the newly created package uses changes from the local repository.

## Reporting issues

If you found a problem with CKEditor 5 or the package generator, please, report an issue:

* [CKEditor 5](https://github.com/ckeditor/ckeditor5/issues/new/choose)
* [The package generator](https://github.com/ckeditor/ckeditor5-package-generator/issues/new)
