---
category: framework-contributing
order: 10
---

# Development environment

The CKEditor 5 codebase is divided into multiple [npm](http://npmjs.com/) packages, each developed in a separate Git repository. The main package is [`ckeditor5`](https://github.com/ckeditor/ckeditor5) which installs all project dependencies and various development-related resources such as:

* the testing environment setup,
* configuration for [mgit](https://www.npmjs.com/package/mgit2) (a multi-repo management tool) and [Yarn](https://yarnpkg.com/) (a dependency management tool),
* translation management tools,
* documentation generator,
* and release tools.

You can find all the official packages listed in [CKEditor 5 development repository's README](https://github.com/ckeditor/ckeditor5#packages).

## Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) 6.9.0+
* [Yarn](https://yarnpkg.com/) 1.2.0+
* [Git](https://git-scm.com/)

## Setting up the CKEditor development environment

First, you need to install a couple of tools which you will be using later:

* [mgit](https://www.npmjs.com/package/mgit2) &ndash; A multi-repo management tool,
* [Yarn](https://yarnpkg.com/) &ndash; A dependency management tool.

It is best to install them globally in your system for an easier use later on:

```bash
npm install -g yarn mgit2
```

Note: You may need to use `sudo` on Linux and macOS.

Then clone the [main repository](https://github.com/ckeditor/ckeditor5):

```bash
git clone https://github.com/ckeditor/ckeditor5.git
cd ckeditor5
```

And install all CKEditor 5 packages from the [npm registry](http://npmjs.com/).

**Note:** If you plan to use the developement version of CKEditor 5 packages (see the [next section](#switching-to-development-version-of-packages)), you can skip this step to save time.

```bash
yarn install
```

### Switching to development version of packages

The steps above should install all the packages from npm, which means that you will have the latest releases of all of them. They are available in `node_modules/@ckeditor/` (we are using [scoped packages](https://docs.npmjs.com/misc/scope), hence the unusual directory).

In order to work with development versions of all the official packages, it is recommended to use mgit. The former will clone all package repositories and the latter will be able to symlink them, so they create a correct directory structure, understandable by Node.js-compliant tools (like webpack or Browserify).

First, clone all the repositories:

```bash
mgit sync
```

Expected result:

```bash
(master 340feac) p@m /workspace/ckeditor5> tree -L 1 packages/
packages/
├── ckeditor5-autoformat
├── ckeditor5-basic-styles
├── ckeditor5-clipboard
...
└── ckeditor5-utils
```

Finally, link them:

```bash
yarn install
```

Running Yarn may take a while because it installs all package dependencies.

Now, all CKEditor packages (except the [development tools](https://github.com/ckeditor/ckeditor5-dev)) should be cross-symlinked:

```bash
(master 340feac) p@m /workspace/ckeditor5> ls -la node_modules/\@ckeditor/ckeditor5-utils/node_modules/\@ckeditor/
total 16
drwxr-xr-x    5 p  staff   170 31 Jan 10:37 .
drwxr-xr-x  292 p  staff  9928 20 Jan 00:20 ..
lrwxr-xr-x    1 p  staff    23 31 Jan 10:37 ckeditor5-core -> ../../../ckeditor5-core
drwxr-xr-x    7 p  staff   238 20 Jan 00:20 ckeditor5-dev-docs
lrwxr-xr-x    1 p  staff    25 31 Jan 10:37 ckeditor5-engine -> ../../../ckeditor5-engine
```

If everything worked correctly, you should be able to run some tests:

```bash
yarn run test --files=core
```

### Fetching changes

Whenever you want to update all packages to their latest versions call:

```bash
# To update the ckeditor5 repository itself:
git pull

# To update pull changes to all the packages:
mgit sync
```

From time to time, if the list of dependencies in any of the packages changed, you will need to call Yarn again to symlink them:

```bash
yarn install
```

### Using mgit for custom packages

If you are developing custom packages or forked any of the official packages and want mgit to work with it, change the dependencies configuration in [`mgit.json`](https://github.com/ckeditor/ckeditor5/blob/master/mgit.json). Note that mgit is able to clone the package from any Git URL. Refer to [its documentation](https://github.com/cksource/mgit2) for more details.

### Final word about mgit

Besides the already mentioned features, mgit allows you to [execute shell commands](https://github.com/cksource/mgit2#exec) on all packages (e.g. check their status). It has been developed by the [CKSource team](https://cksource.com/) and we are relying on it heavily, hence you can expect more features and improvements to come. However, it is not a CKEditor-specific tool and should be suitable for any multi-repository project (though it best fits JavaScript projects).

## Running tests

In order to run tests you need to use the `test` and `manual` tasks.

```bash
yarn run test --watch --coverage --source-map --files=engine
```

or, shorter:

```bash
yarn run test -- -wcs --files=engine
```

This command will run the [`ckeditor5-engine`](https://github.com/ckeditor/ckeditor5-engine) package's tests.

**Note:** It is not possible to run tests of all packages with code coverage at once because the size of the project (the number of test files and source modules) exceeds webpack's capabilities (it runs out of memory).

To create a server for manual tests use the `manual` task:

```bash
yarn run manual
```

It accepts the `--source-map` (`-s`) option. Note that it watches for changes in the JavaScript files only (see the [bug](https://github.com/ckeditor/ckeditor5-dev/issues/52)).

You can read more about the {@link framework/guides/contributing/testing-environment Testing environment}.

## Generating documentation

To build the documentation you need to run the `docs` task:

```bash
yarn run docs
```

The documentation will be available in `build/docs/`.

This task accepts the following arguments:

* `--skip-api` &ndash; Skips building the API documentation (which takes the majority of the total time).
* `--skip-snippets` &ndash; Skips building live snippets.
* `--skip-validation` &ndash; Skips the final link validation.
* `--watch` &ndash; Runs the documentation generator in a watch mode. It covers guides (it does not cover API docs).
* `--production` &ndash; Minifies the assets and performs other actions which are unnecessary during CKEditor 5 development.
* `--verbose` &ndash; Prints out more information.

Note: These arguments must be passed after additional `--`:

```
yarn run docs --skip-api
```

## Bisecting through a multi-repository

CKEditor 5 is a multi-repository project. It means that [`git bisect`](https://git-scm.com/docs/git-bisect) (which is super handy when tracking which commit introduced a bug) will not work out of the box.

Fortunately, every commit made to any of the `master` branches of all CKEditor 5 subpackages will update this subpackage's hash in `mgit.json` in the [`master-revisions`](https://github.com/ckeditor/ckeditor5/commits/master-revisions) branch.

Thanks to that, `master-revisions` contains an ordered history of all changes which makes it possible to go back to any point in history:

```bash
# Make sure to update this branch.
git co master-revisions
git pull

# Check out 30 commits back.
git co master-revisions~30

# Check out subpackages to correct hashes.
mgit co
```

Once you found the point in history which interests you, you can go straight to a commit in a subpackage and PR. For example:

```bash
(detached:bisect/bad~1 cb2feef ?1) p@m /workspace/ckeditor5> git bisect good
ab5b5494e5eba7beb4a3bac4ea9c5e6d59a610f5 is the first bad commit
commit ab5b5494e5eba7beb4a3bac4ea9c5e6d59a610f5
Author: Travis CI User <travis@example.org>
Date:   Tue Apr 11 16:45:47 2017 +0000

    Revision: https://github.com/ckeditor/ckeditor5-image/commit/02869eb4478a2f538006c128b30b9727617af665

:100644 100644 611526d5c4beae7046b0a08ec36843cbbe642175 35acdd8ba971d8127dd462a9c8c1162a54f00d58 M	mgit.json
```

Leads to [`ckeditor/ckeditor5-image@02869eb`](https://github.com/ckeditor/ckeditor5-image/commit/02869eb) which leads to [ckeditor/ckeditor5-image#95](https://github.com/ckeditor/ckeditor5-image/pull/95).

## Additional information for contributors

### SVG icons

By default, CKEditor 5 supports SVG icons found in the `ckeditor5-*/theme/icons` folders. Unfortunately, most of the SVG editing software produces the output with comments, obsolete tags, and complex paths, which bloats the DOM and makes the builds heavy for no good reason.

To remove the excess data and prevent [certain issues](https://github.com/ckeditor/ckeditor5-ui/issues/245), **all new icons should be optimized before joining the code base**. To do that, you can use the `clean-up-svg-icons` script in the [root of the project](#setting-up-the-ckeditor-development-environment), a wrapper for the [SVGO](https://github.com/svg/svgo) tool:

```bash
cd path/to/ckeditor5

# Optimize all SVG files in the folder.
npm run clean-up-svg-icons path/to/icons/*.svg

# Optimize a single SVG file.
npm run clean-up-svg-icons path/to/icon/icon.svg
```

The script reduces the icon size up to 70%, depending on the software used to create it and the general complexity of the image.

**Note**: You may still need to tweak the source code of the SVG files manually after using the script:

* The icons should have the `viewBox` attribute (instead of `width` and `height`). The `removeDimensions` SVGO plugin will not remove `width` and `height` if there is no `viewBox` attribute so make sure it is present.
* Sometimes SVGO leaves empty (transparent) groups `<g>...</g>`. They should be removed from the source.
* Make sure the number of `<path>` elements is minimal. Merge paths whenever possible in the image processor before saving the file.
