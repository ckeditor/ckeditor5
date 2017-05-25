---
# Scope:
# * Introduction on custom builds and why one would create them.
# * Simple step by step on creating a custom build.

title: Custom builds
category: builds-development
order: 10
---

# Creating custom builds

In a few words, a build is a simple [npm](https://www.npmjs.com) package (usually developed in a Git repository) with a predefined set of dependencies. Out of this repository, distribution files can be generated through a build process.

These are some of the reasons for creating custom builds:

* Adding features which are not included in the existing builds, either from third party or custom developed.
* Removing unnecessary features present in a build.
* Change the {@link TODO builds/guides/integration/basic-api.html#Creators editor creator}.
* Changing the editor theme.
* Changing the localization language of the editor.
* Enabling bug fixes which are not part of any public release still.

## Forking existing build

[Fork](https://help.github.com/articles/fork-a-repo/) one of the official builds (it’ll serve as the starting point for your custom one) and then clone your fork:

```
git clone https://github.com/<your-username>/ckeditor5-build-classic.git
```

You may optionally add the original build repository to your git remotes, to make updating easier:

```
git remote add upstream https://github.com/ckeditor/ckeditor5-build-classic.git
```

<side-box tip>
	If you don't want to fork the official build, you can just clone it. However, you won't be able to commit and push your customizations back to [GitHub](https://github.com).
</side-box>

## Build's anatomy

Every build contains the following files:

* `package.json` – npm package's definition (it specifies the package name, version, dependencies, license, etc.).
* `build-config.js` – configuration of this particular CKEditor 5 build.
* `ckeditor.js` – bundler's "entry file". A CommonJS module which tells the bundler (like [Webpack](https://webpack.js.org)) which CKEditor modules should be included in the bundle and what should that bundle export). By default, it's created based on the build configuration but you may also modify it manually.
* `build/*` – directory with ready-to-use bundles. There are two bundles:
	* the most optimized, ES6 one in `build/ckeditor.js`,
	* and ES5 one in `build/ckeditor.compat.js`.

## Customizing a build

In order to customize a build you need to:

* install missing dependencies,
* update the `build-config.js`,
* updating builds (which includes updating `ckeditor.js` and editor bundles in `build/*`).

### Installing dependencies

The easiest way to install missing dependencies is by typing:

```
npm install --save <package-name>
```

This will install the package and add it to `package.json`. You can also edit `package.json` manually.

<side-box tip>
	Due to a non-deterministic way how npm installs packages, it's recommended to run `rm -rf node_modules && npm install` when in doubt. This will prevent some packages to get installed more than once in `node_modules/` what might lead to broken builds.

	You can also give [yarn](https://yarnpkg.com/lang/en/) a try.
<side-box>

### Updating build configuration

If you added or removed dependencies, you will also need to modify the `build-config.js` file. Based on it the bundler entry file (`ckeditor.js`) will be created. You can also opt-out from automatically creating the entry file and modify `ckeditor.js` manually which can be useful in some non-standard cases.

Either way, every plugin which you want to include in the bundle should be included at this stage. You can also change the editor creator and specify editor's default config. For instance, your build config can look like this:

```
'use strict';

module.exports = {
	editor: '@ckeditor/ckeditor5-editor-classic/src/classic',
	moduleName: 'ClassicEditor',
	plugins: [
		'@ckeditor/ckeditor5-presets/src/essentials',

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
	config: {
		toolbar: [ 'headings', 'bold', 'italic', 'custombutton' ]
	}
};
```

### Rebuilding the bundle

After you changed the build configuration or updated some dependencies, it's time to rebuild the bundle. This will run a bundler (Webpack) with a proper configuration (see `webpack.config.js` and `webpack.compat.config.js`).

If you wish to create the bundles based on the build configuration (`build-config.js`) run:

```
npm run build
```

This command will update the entry file (`ckeditor.js`) and create two bundles – `build/ckeditor.js` and `build/ckeditor.compat.js`.

If you want to use to skip updating the entry file (in case you modified it manually) run:

```
npm run build-ckeditor
npm run build-ckeditor-compat
```

## Updating build

You may decide to update your build at any time. Being it a fork of an official build, it is just a matter of merging changes that happened meanwhile in that build, by using git features:

```
git fetch upstream
git merge upstream/master
```

You should handle eventual conflicts and verify the merged changes. After that, just follow the previous instructions for creating your build and test it.

<side-box tip>
	It's recommended to run `rm -rf node_modules && npm install` after you fetched changes from the upstream or updated versions of dependencies in `package.json` manually. This will prevent npm from installing packages more than once which may lead to broken builds.
</side-box>

## Publishing your builds

If you think that your custom builds can be useful to others, it is a great idea to publish them in GitHub and npm. When doing so, just be sure to find nice names for them and to fit them in the `ckeditor5-build-(the name)` pattern, making it easy to find them to everyone. To avoid conflicts with other existing builds you can use [scoped packages](https://docs.npmjs.com/misc/scope).

After your build is out, [ping us on Twitter](https://twitter.com/ckeditor)!
