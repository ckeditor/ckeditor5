---
category: framework-contributing
order: 10
---

# Development environment

The CKEditor 5 codebase is divided into multiple [npm](http://npmjs.com/) packages, each developed in a separate Git repository. The main package is [`ckeditor5`](https://github.com/ckeditor/ckeditor5) which installs all project dependencies and various development-related resources such as:

* the testing environment setup,
* configuration for [Mr. Git](https://www.npmjs.com/package/mrgit) (a multi-repo management tool) and [Yarn](https://yarnpkg.com/) (a dependency management tool),
* translation management tools,
* documentation generator,
* and release tools.

You can find all the official packages listed in [CKEditor 5 development repository's README](https://github.com/ckeditor/ckeditor5#packages).

## Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) 6.9.0+
* [Git](https://git-scm.com/)

## Setting up the CKEditor development environment

First, you need to install a couple of tools which you will be using later:

* [mrgit](https://www.npmjs.com/package/mrgit) &mdash; A multi-repo management tool,
* [Yarn](https://yarnpkg.com/) &mdash; A dependency management tool.

It is best to install them globally in your system for an easier use later on:

```bash
npm install -g yarn mrgit
```

**Note:** [Read how to avoid using `sudo` to install packages globally](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md) or use [nvm](https://github.com/creationix/nvm).

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

In order to work with development versions of all the official packages, it is recommended to use `mrgit`. This tool will clone all package repositories to the `packages/` directory. Then, those packages need to be installed in a way understandable by Node.js-compliant tools (like webpack or Browserify). In order to achieve that we use Yarn's feature called [workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) which creates symlinks to these packages.

First, clone all the repositories:

```bash
mrgit sync
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

Finally, install all external dependencies (such as the test runner) and create symlinks to CKEditor 5 packages available in the `packages/` directory with this one command:

```bash
yarn install
```

You can check that CKEditor 5 packages which are part of the development environment (so those except [development tools](https://github.com/ckeditor/ckeditor5-dev) and some closed source packages) should be linked:

```bash
(master ae6f43a) p@m /workspace/misc/ckeditor5> ls -la node_modules/\@ckeditor/
total 0
drwxr-xr-x    54 p  staff   1728 11 sty 14:41 .
drwxr-xr-x  1115 p  staff  35680 11 sty 14:41 ..
drwxr-xr-x     7 p  staff    224 11 sty 14:41 ckeditor-cloud-services-collaboration
drwxr-xr-x     6 p  staff    192 11 sty 14:41 ckeditor-cloud-services-core
lrwxr-xr-x     1 p  staff     41 11 sty 14:41 ckeditor5-adapter-ckfinder -> ../../packages/ckeditor5-adapter-ckfinder
lrwxr-xr-x     1 p  staff     34 11 sty 14:41 ckeditor5-alignment -> ../../packages/ckeditor5-alignment
lrwxr-xr-x     1 p  staff     35 11 sty 14:41 ckeditor5-autoformat -> ../../packages/ckeditor5-autoformat
lrwxr-xr-x     1 p  staff     33 11 sty 14:41 ckeditor5-autosave -> ../../packages/ckeditor5-autosave
lrwxr-xr-x     1 p  staff     37 11 sty 14:41 ckeditor5-basic-styles -> ../../packages/ckeditor5-basic-styles
lrwxr-xr-x     1 p  staff     36 11 sty 14:41 ckeditor5-block-quote -> ../../packages/ckeditor5-block-quote
lrwxr-xr-x     1 p  staff     38 11 sty 14:41 ckeditor5-build-balloon -> ../../packages/ckeditor5-build-balloon
lrwxr-xr-x     1 p  staff     38 11 sty 14:41 ckeditor5-build-classic -> ../../packages/ckeditor5-build-classic
lrwxr-xr-x     1 p  staff     49 11 sty 14:41 ckeditor5-build-decoupled-document -> ../../packages/ckeditor5-build-decoupled-document
lrwxr-xr-x     1 p  staff     37 11 sty 14:41 ckeditor5-build-inline -> ../../packages/ckeditor5-build-inline
lrwxr-xr-x     1 p  staff     33 11 sty 14:41 ckeditor5-ckfinder -> ../../packages/ckeditor5-ckfinder
lrwxr-xr-x     1 p  staff     34 11 sty 14:41 ckeditor5-clipboard -> ../../packages/ckeditor5-clipboard
lrwxr-xr-x     1 p  staff     39 11 sty 14:41 ckeditor5-cloud-services -> ../../packages/ckeditor5-cloud-services
drwxr-xr-x     7 p  staff    224 11 sty 14:41 ckeditor5-collaboration-core
drwxr-xr-x     7 p  staff    224 11 sty 14:41 ckeditor5-comments
lrwxr-xr-x     1 p  staff     29 11 sty 14:41 ckeditor5-core -> ../../packages/ckeditor5-core
drwxr-xr-x     8 p  staff    256 11 sty 14:41 ckeditor5-dev-docs
drwxr-xr-x     9 p  staff    288 11 sty 14:41 ckeditor5-dev-env
drwxr-xr-x     9 p  staff    288 11 sty 14:41 ckeditor5-dev-tests
drwxr-xr-x     8 p  staff    256 11 sty 14:41 ckeditor5-dev-utils
drwxr-xr-x     8 p  staff    256 11 sty 14:41 ckeditor5-dev-webpack-plugin
lrwxr-xr-x     1 p  staff     35 11 sty 14:41 ckeditor5-easy-image -> ../../packages/ckeditor5-easy-image
lrwxr-xr-x     1 p  staff     39 11 sty 14:41 ckeditor5-editor-balloon -> ../../packages/ckeditor5-editor-balloon
lrwxr-xr-x     1 p  staff     39 11 sty 14:41 ckeditor5-editor-classic -> ../../packages/ckeditor5-editor-classic
lrwxr-xr-x     1 p  staff     41 11 sty 14:41 ckeditor5-editor-decoupled -> ../../packages/ckeditor5-editor-decoupled
lrwxr-xr-x     1 p  staff     38 11 sty 14:41 ckeditor5-editor-inline -> ../../packages/ckeditor5-editor-inline
lrwxr-xr-x     1 p  staff     31 11 sty 14:41 ckeditor5-engine -> ../../packages/ckeditor5-engine
lrwxr-xr-x     1 p  staff     30 11 sty 14:41 ckeditor5-enter -> ../../packages/ckeditor5-enter

... and so on
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
mrgit sync

# To install missing dependencies:
yarn install
```

From time to time, if the list of dependencies in any of the packages changed, new package has been added to `ckeditor5` or you just want to make sure that you have the repository up to date, run the `reinstall` script:

```bash
git pull
yarn run reinstall
```

The `reinstall` script first calls `yarn run clean` to remove `node_modules/` directories from all packages (including `ckeditor5`) and then `yarn run bootstrap` which is a shorthand for `mrgit sync && yarn install`.

### Working with multiple repositories

Mr. Git implements many useful commands, such as:

* `mrgit exec 'command'` – executing a shell command in all repositories,
* `mrgit checkout <branch>` – checking all repositories to given branch (or hash),
* `mrgit status` – displaying information about all repositories.

Read more about those commands in [mrgit's documentation](https://github.com/cksource/mrgit).

Mr. Git has been developed by the [CKSource team](https://cksource.com/) and we are relying on it heavily, hence you can expect more features and improvements to come. However, it is not a CKEditor-specific tool and should be suitable for any multi-repository project (though it best fits JavaScript projects).

### Using `mrgit` for custom packages

If you are developing custom packages or forked any of the official packages and want `mrgit` to work with it, change the dependencies configuration in [`mrgit.json`](https://github.com/ckeditor/ckeditor5/blob/master/mrgit.json). Note that `mrgit` is able to clone the package from any Git URL. Refer to [its documentation](https://github.com/cksource/mrgit) for more details.

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

To help test localized editors, the task accepts two optional configurations: `--language="en"` and `--additionalLanguages="ar,pl,..."`. The former sets the main language used by test editors. By default it is `"en"` and it in most scenarios you do not need to change it. The later brings more languages to manual tests, e.g. which is helpful when working with {@link features/ui-language#righttoleft-rtl-languages-support right–to–left languages in the user interface}.

You can read more about the {@link framework/guides/contributing/testing-environment Testing environment}.

## Generating documentation

To build the documentation you need to run the `docs` task:

```bash
yarn run docs
```

The documentation will be available in `build/docs/`.

This task accepts the following arguments:

* `--skip-api` &mdash; Skips building the API documentation (which takes the majority of the total time).
* `--skip-snippets` &mdash; Skips building live snippets.
* `--snippets=snippet-name` &mdash; Whitelist snippets to build (accepts glob patterns).
* `--skip-validation` &mdash; Skips the final link validation.
* `--watch` &mdash; Runs the documentation generator in a watch mode. It covers guides (it does not cover API docs).
* `--production` &mdash; Minifies the assets and performs other actions which are unnecessary during CKEditor 5 development.
* `--verbose` &mdash; Prints out more information.

Note: These arguments must be passed after additional `--`:

```
yarn run docs --skip-api
```

## Generating content styles

It is possible to generate a stylesheet containing content styles brought by all CKEditor 5 features. In order to do that, execute:

```bash
yarn docs:content-styles
```
The stylesheet will be saved in the `build/content-styles` folder.

To learn more, refer to the {@link builds/guides/integration/content-styles Content styles} guide.

## Bisecting through a multi-repository

CKEditor 5 is a multi-repository project. It means that [`git bisect`](https://git-scm.com/docs/git-bisect) (which is super handy when tracking which commit introduced a bug) will not work out of the box.

Fortunately, every commit made to any of the `master` branches of all CKEditor 5 subpackages will update this subpackage's hash in `mrgit.json` in the [`master-revisions`](https://github.com/ckeditor/ckeditor5/commits/master-revisions) branch.

Thanks to that, `master-revisions` contains an ordered history of all changes which makes it possible to go back to any point in history:

```bash
# Make sure to update this branch.
git co master-revisions
git pull

# Check out 30 commits back.
git co master-revisions~30

# Check out subpackages to correct hashes.
mrgit co
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
