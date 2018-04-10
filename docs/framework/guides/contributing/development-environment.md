---
category: framework-contributing
order: 10
---

# Development environment

The CKEditor 5 codebase is divided into multiple [npm](http://npmjs.com/) packages, each developed in a separate Git repository. The main package is [ckeditor5](https://github.com/ckeditor/ckeditor5) which installs all project dependencies and various development-related resources such as:

* the testing environment setup,
* configuration for [mgit](https://www.npmjs.com/package/mgit2) (a multi-repo management tool) and [Lerna.js](https://github.com/lerna/lerna) (a multi-package management tool),
* translation management tools,
* documentation generator,
* and release tools.

You can find all the official packages listed in [CKEditor 5 development repository's README](https://github.com/ckeditor/ckeditor5#packages).

## Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) >= 6.0.0
* npm 4.x (**note:** using npm 5 [causes](https://github.com/lerna/lerna/issues/938) some [problems](https://github.com/npm/npm/issues/16991))
* [Git](https://git-scm.com/)

## Setting up the CKEditor development environment

First, you need to install a couple of tools which you will be using later:

* [mgit](https://www.npmjs.com/package/mgit2) (a multi-repo management tool),
* [Lerna.js](https://github.com/lerna/lerna) (a multi-package management tool).

It is best to install them globally in your system for an easier use later on:

```bash
npm install -g lerna mgit2
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
npm install
```

This may take a [while](https://github.com/npm/npm/issues/10380)...

### Switching to development version of packages

The above steps should install all the packages from npm, which means that you will have the latest releases of all of them. They are available in `node_modules/@ckeditor/` (we are using [scoped packages](https://docs.npmjs.com/misc/scope), hence the unusual directory).

In order to work with development versions of all the official packages, it is recommended to use mgit and Lerna. The former will clone all package repositories and the latter will be able to symlink them, so they create a correct directory structure, understandable by Node.js-compliant tools (like webpack or Browserify).

First, clone all the repositories:

```bash
mgit bootstrap
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
lerna bootstrap
```

Running Lerna may take a while because it installs all package dependencies. It will also warn you about circular dependencies between packages which you can ignore.

Now, all CKEditor packages (except the [dev tools](https://github.com/ckeditor/ckeditor5-dev)) should be cross-symlinked:

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
npm run test -- --files=core
```

### Fetching changes

Whenever you want to update all packages to their latest versions call:

```bash
# To update the ckeditor5 repository itself:
git pull

# To update pull changes to all the packages:
mgit update
```

From time to time, if the list of dependencies in any of the packages changed, you will need to call Lerna again to symlink them:

```bash
lerna bootstrap
```

You can also speed it up if you know which package has changed:

```bash
lerna bootstrap --scope=@ckeditor/ckeditor5-core
```

### Using mgit for custom packages

If you are developing custom packages or forked any of the official packages and want mgit to work with it, change the dependencies configuration in [`mgit.json`](https://github.com/ckeditor/ckeditor5/blob/master/mgit.json). Note that mgit is able to clone the package from any Git URL. Refer to [its documentation](https://github.com/cksource/mgit2) for more details.

### Troubleshooting problems with Lerna

Lerna does pretty complicated things on already complicated npm ecosystem. If you happen to run into some issues when calling `lerna bootstrap`, here are some tips:

* Look for `npm-debug.log` files in the main package and subpackages. They may point to an obvious issue like a typo in some `package.json`.
* Sometimes repeating `lerna bootstrap` may help.
* If nothing else works, do `lerna clean && lerna bootstrap`.

### Final word about mgit and Lerna

Besides the already mentioned features, mgit allows you to [execute shell commands](https://github.com/cksource/mgit2#exec) on all packages (e.g. check their status). It has been developed by the [CKSource team](https://cksource.com) and we are relying on it heavily, hence you can expect more features and improvements to come. However, it is not a CKEditor-specific tool and should be suitable for any multi-repo project (though it best fits JavaScript projects).

Lerna is a tool used by many well-known projects such as [Babel.js](https://github.com/babel/babel). It has an amazing community and, relying on it ourselves, we hope that it will become a standard for managing multi-package projects.

## Running tests

In order to run tests you need to use the `test` and `test:manual` tasks.

```bash
npm test -- --watch --coverage --source-map --files=engine
```

or, shorter:

```bash
npm test -- -wcs --files=engine
```

This command will run the [`ckeditor5-engine`](https://github.com/ckeditor/ckeditor5-engine) package's tests.

**Note:** It is not possible to run tests of all packages with code coverage at once because the size of the project (the number of test files and source modules) exceeds webpack's capabilities (it runs out of memory).

To create a server for manual tests use the `test:manual` task:

```bash
npm run test:manual
```

It accepts the `--source-map` (`-s`) option. Note that it watches for changes only in the JavaScript files (see the [bug](https://github.com/ckeditor/ckeditor5-dev/issues/52)).

You can read more about the {@link framework/guides/contributing/testing-environment Testing environment}.

## Generating documentation

To build the documentation you need to run the `docs` task:

```bash
npm run docs
```

The documentation will be available in `build/docs/`.

This task accepts two arguments which can speed up the process:

* `--skip-api` &ndash; Skips building API docs (which takes the majority of the total time).
* `--skip-snippets` &ndash; Skips building live snippets.
* `--skip-validation` &ndash; Skips the final links validation.

Note: These arguments must be passed after additional `--`: `npm run docs -- --skip-api`.

## Bisecting through a multi-repository

CKEditor 5 is a multi-repository project. It means that [`git bisect`](https://git-scm.com/docs/git-bisect) (which is super handy when tracking which commit introduced a bug) will not work out of the box.

Fortunately, every commit made to any of `master` branches of all CKEditor 5 subpackages will update this subpackage's hash in `mgit.json` in the [`master-revisions`](https://github.com/ckeditor/ckeditor5/commits/master-revisions) branch.

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

To remove the excess data and prevent [certain issues](https://github.com/ckeditor/ckeditor5-ui/issues/245), **all new icons should be optimized before joining the code base**. The right utility to do this is Node–based [SVGO](https://github.com/svg/svgo) and the usage is as simple as:

```bash
npm install -g svgo
cd ckeditor5-package-name/theme/icons
svgo --enable removeTitle -i .
```

SVGO reduces the icon size up to 70%, depending on the software used to create it and the general complexity of the image.
