---
category: framework-contributing
order: 10
---

# Development environment

The CKEditor 5 codebase is divided into multiple [npm](http://npmjs.com/) packages. The main package is [`ckeditor5`](https://github.com/ckeditor/ckeditor5) which installs all project dependencies and various development-related resources such as:

* the testing environment setup,
* configuration for [Yarn](https://yarnpkg.com/),
* translation management tools,
* documentation generator,
* and release tools.

The main package's GitHub repository also [hosts all other CKEditor5 sub-packages](https://github.com/ckeditor/ckeditor5/tree/master/packages).

You can find all the official packages listed in the [CKEditor 5 repository's README](https://github.com/ckeditor/ckeditor5#packages).

<info-box info>
	Prior to version **19.0.0** CKEditor 5 was developed in a multi-repository architecture. If you would like to work with an older multi-repository release, please refer to the [older Development environment guide](/docs/ckeditor5/19.0.0/framework/guides/contributing/development-environment.html) for multi-repository oriented instructions.
</info-box>

## Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) 8.0.0+
* [Git](https://git-scm.com/)

## Setting up the CKEditor development environment

First, you need to install  [Yarn](https://yarnpkg.com/) that will be used for dependency management.

It is best to install it globally in your system for an easier use later on:

```
npm install -g yarn
```

**Note:** [Read how to avoid using `sudo` to install packages globally](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md) or use [nvm](https://github.com/creationix/nvm).

Then clone the [CKEditor 5 repository](https://github.com/ckeditor/ckeditor5):

```
git clone https://github.com/ckeditor/ckeditor5.git
cd ckeditor5
```

And install all CKEditor 5 packages from the [npm registry](http://npmjs.com/).

```
yarn install
```

## Running tests

In order to run tests, you need to use the `test` and `manual` tasks.

```
yarn run test --watch --coverage --source-map --files=engine
```

or, shorter:

```
yarn run test -- -wcs --files=engine
```

This command will run the [`ckeditor5-engine`](https://github.com/ckeditor/ckeditor5-engine) package's tests.

**Note:** It is not possible to run tests of all packages with code coverage at once because the size of the project (the number of test files and source modules) exceeds webpack's capabilities (it runs out of memory).

To create a server for manual tests use the `manual` task:

```
yarn run manual
```

To help test localized editors, the task accepts two optional configurations: `--language="en"` and `--additionalLanguages="ar,pl,..."`. The former sets the main language used by test editors. By default it is `"en"` and in most scenarios you do not need to change it. The latter brings more languages to manual tests, which is helpful e.g. when working with {@link features/ui-language#righttoleft-rtl-languages-support right–to–left languages in the user interface}.

You can read more about the {@link framework/guides/contributing/testing-environment Testing environment}.

## Generating documentation

To build the documentation, you need to run the `docs` task:

```
yarn run docs
```

The documentation will be available in `build/docs/`.

This task accepts the following arguments:

* `--skip-api` &ndash; Skips building the API documentation (which takes the majority of the total time).
* `--skip-snippets` &ndash; Skips building live snippets.
* `--snippets=snippet-name` &ndash; Whitelists snippets to build (accepts glob patterns).
* `--skip-validation` &ndash; Skips the final link validation.
* `--watch` &ndash; Runs the documentation generator in a watch mode. It covers guides but it does not cover API docs.
* `--production` &ndash; Minifies the assets and performs other actions which are unnecessary during CKEditor 5 development.
* `--verbose` &ndash; Prints out more information.

Note: These arguments must be passed after additional `--`:

```
yarn run docs --skip-api
```

After building documentation, you can quickly start an HTTP server to serve them:

```
yarn run docs:serve
```

## Generating content styles

It is possible to generate a stylesheet containing content styles brought by all CKEditor 5 features. In order to do that, execute:

```
yarn docs:content-styles
```

The stylesheet will be saved in the `build/content-styles` folder.

To learn more, refer to the {@link builds/guides/integration/content-styles Content styles} guide.

## Additional information for contributors

### SVG icons

By default, CKEditor 5 supports SVG icons found in the `ckeditor5-*/theme/icons` folders. Unfortunately, most of the SVG editing software produces the output with comments, obsolete tags, and complex paths, which bloats the DOM and makes the builds heavy for no good reason.

To remove the excess data and prevent [certain issues](https://github.com/ckeditor/ckeditor5-ui/issues/245), **all new icons should be optimized before joining the code base**. To do that, you can use the `clean-up-svg-icons` script in the [root of the project](#setting-up-the-ckeditor-development-environment), a wrapper for the [SVGO](https://github.com/svg/svgo) tool:

```
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
