---
# Scope:
# * Introduction to custom builds and why one would create them.
# * Step-by-step instructions on creating a custom build.

menu-title: Custom builds
category: builds-development
order: 10
---

# Creating custom builds

A build is a simple [npm](https://www.npmjs.com) package (usually developed in a Git repository) with a predefined set of dependencies. Out of this repository, distribution files can be generated through the build process.

Some of the reasons for creating custom builds are:

* Adding features which are not included in the existing builds, either from a third party or custom developed.
* Removing unnecessary features present in a build.
* Changing the {@link builds/guides/integration/basic-api#Creators editor creator}.
* Changing the {@link framework/guides/theme-customization editor theme}.
* Changing the {@link features/ui-language localization language} of the editor.
* Enabling bug fixes which are still not a part of any public release.

## Forking an existing build

Start with [forking](https://help.github.com/articles/fork-a-repo/) one of the official builds (it will serve as the starting point for your custom one) and then clone your fork:

```bash
git clone -b stable https://github.com/<your-username>/ckeditor5-build-classic.git
```

To make updating easier you may optionally add the original build repository to your Git remotes:

```bash
git remote add upstream https://github.com/ckeditor/ckeditor5-build-classic.git
```

<info-box hint>
	If you do not want to fork the official build, you can just clone it. However, you will not be able to commit and push your customizations back to GitHub.

	Alternatively, instead of creating a custom build you can {@link builds/guides/integration/advanced-setup#Scenario-2-Building-from-source integrate CKEditor 5 directly from source}. This option allows even greater flexibility and requires less overhead (you will not need to fork the official build).
</info-box>

<info-box warning>
	It is important that you use the `stable` branch of a build, not the `master` branch. The `master` branch might contain changes which are not yet compatible with the versions of CKEditor 5 source packages which were published on npm.
</info-box>

## Build anatomy

Every build contains the following files:

* `build/ckeditor.js` &ndash; The ready-to-use editor bundle, containing the editor and all plugins.
* `src/ckeditor.js` &ndash; The source entry point of the build. It can be used for complex bundling and development. Based on it the `build/ckeditor.js` file is created by [webpack](https://webpack.js.org).
* `build-config.js` &ndash; The configuration of this particular CKEditor 5 build, based on which the `src/ckeditor.js` file is created.
* `webpack-config.js` &ndash; webpack configuration used to build the editor.

## Customizing a build

In order to customize a build you need to:

* Install missing dependencies.
* Update the `build-config.js` file.
* Update the builds (which includes updating `src/ckeditor.js` and the editor bundle in `build/`).

### Installing dependencies

The easiest way to install missing dependencies is by typing:

```bash
npm install --save <package-name>
```

This will install the package and add it to `package.json`. You can also edit `package.json` manually.

<info-box hint>
	Due to a non-deterministic way how npm installs packages, it is recommended to run `rm -rf node_modules && npm install` when in doubt. This will prevent some packages from getting installed more than once in `node_modules/` (which might lead to broken builds).

	You can also give [Yarn](https://yarnpkg.com/lang/en/) a try.
</info-box>

### Updating build configuration

If you added or removed dependencies, you will also need to modify the `build-config.js` file. Based on it the bundler entry file (`src/ckeditor.js`) will be created. You can also opt out from automatically creating the entry file and modify `src/ckeditor.js` manually, which can be useful in some non-standard cases.

Either way, every plugin that you want to include in the bundle should be included at this stage. You can also change the editor creator and specify the default editor configuration. For instance, your build configuration might look like this:

```js
'use strict';

module.exports = {
	// The editor creator to use.
	editor: '@ckeditor/ckeditor5-editor-classic/src/classiceditor',

	// The name under which the editor will be exported.
	moduleName: 'ClassicEditor',

	// Plugins to include in the build.
	plugins: [
		'@ckeditor/ckeditor5-essentials/src/essentials',

		'@ckeditor/ckeditor5-autoformat/src/autoformat',
		'@ckeditor/ckeditor5-basic-styles/src/bold',
		'@ckeditor/ckeditor5-basic-styles/src/italic',
		'@ckeditor/ckeditor5-heading/src/heading',
		'@ckeditor/ckeditor5-link/src/link',
		'@ckeditor/ckeditor5-list/src/list',
		'@ckeditor/ckeditor5-paragraph/src/paragraph',

		'ckeditor5-custom-package/src/customplugin',
		'../relative/path/to/some/othercustomplugin'
	],

	// Editor configuration.
	config: {
		toolbar: [ 'headings', 'bold', 'italic', 'custombutton' ],

		// UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
		language: 'en'
	}
};
```

### Rebuilding the bundle

After you changed the build configuration or updated some dependencies, it is time to rebuild the bundle. This will run a bundler (webpack) with a proper configuration (see `webpack.config.js`).

If you wish to create a bundle based on the build configuration (`build-config.js`), run:

```bash
npm run build
```

This command will update the entry file (`src/ckeditor.js`) and create the bundle &mdash; `build/ckeditor.js`.

If you want to skip updating the entry file (in case you modified it manually), run:

```bash
npm run build-ckeditor
```

You can validate whether your new build works by opening the `sample/index.html` file in a browser (via HTTP, not as a local file). Make sure to **clear the cache**.

## Updating the build

You may decide to update your build at any time. Since it is a fork of the official build, you can simply merge the changes that happened meanwhile in that build, using Git commands:

```bash
git fetch upstream
git merge upstream/stable
```

You should handle eventual conflicts and verify the merged changes. After that, just follow the previous instructions for creating your build and test it.

<info-box hint>
	It is recommended to run `rm -rf node_modules && npm install` after you fetched changes from the upstream or updated versions of dependencies in `package.json` manually. This will prevent npm from installing packages more than once (which may lead to broken builds).
</info-box>

## Publishing your builds

If you think that your custom builds can be useful to others, it is a great idea to publish them on GitHub and npm. When doing so, just be sure to give them meaningful names that would fit the `ckeditor5-build-(the name)` pattern, making them easy to find. To avoid conflicts with other existing builds you can use [scoped packages](https://docs.npmjs.com/misc/scope). We also recommend using the "ckeditor5" and "ckeditor5-build" [keywords](https://docs.npmjs.com/files/package.json#keywords) to make your build [easier to find](https://www.npmjs.com/search?q=keywords:ckeditor5-build&page=1&ranking=optimal).

After your build is out, [ping us on Twitter](https://twitter.com/ckeditor)!
