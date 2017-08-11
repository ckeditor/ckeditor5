---
# Scope:
# * Introduction to custom builds and why one would create them.
# * Step-by-step instructions on creating a custom build.

title: Custom builds
category: builds-development
order: 10
---

# Creating custom builds

A build is a simple [npm](https://www.npmjs.com) package (usually developed in a Git repository) with a predefined set of dependencies. Out of this repository, distribution files can be generated through the build process.

Some of the reasons for creating custom builds are:

* Adding features which are not included in the existing builds, either from a third party or custom developed.
* Removing unnecessary features present in a build.
* Changing the {@link TODO builds/guides/integration/basic-api.html#Creators editor creator}.
* Changing the editor theme.
* Changing the localization language of the editor.
* Enabling bug fixes which are still not a part of any public release.

## Forking an existing build

Start with [forking](https://help.github.com/articles/fork-a-repo/) one of the official builds (it will serve as the starting point for your custom one) and then clone your fork:

```
git clone https://github.com/<your-username>/ckeditor5-build-classic.git
```

To make updating easier you may optionally add the original build repository to your Git remotes:

```
git remote add upstream https://github.com/ckeditor/ckeditor5-build-classic.git
```

<info-box hint>
	If you do not want to fork the official build, you can just clone it. However, you will not be able to commit and push your customizations back to [GitHub](https://github.com).
</info-box>

## Build anatomy

Every build contains the following files:

* `package.json` &ndash; The definition of the npm package. It specifies the package name, version, dependencies, license, etc.
* `build-config.js` &ndash; The configuration of this particular CKEditor 5 build.
* `ckeditor.js` &ndash; The bundler's "entry file". A CommonJS module which tells the bundler (like [webpack](https://webpack.js.org)) which CKEditor modules should be included in the bundle and what should that bundle export). By default, it is created based on the build configuration but you may also modify it manually.
* `build/*` &ndash; The directory with ready-to-use bundles. There are two bundles:
	* The most optimized, ES6 one, in: `build/ckeditor.js`.
	* The ES5 one in: `build/ckeditor.compat.js`.

## Customizing a build

In order to customize a build you need to:

* Install missing dependencies.
* Update the `build-config.js`.
* Update the builds (which includes updating `ckeditor.js` and editor bundles in `build/*`).

### Installing dependencies

The easiest way to install missing dependencies is by typing:

```
npm install --save <package-name>
```

This will install the package and add it to `package.json`. You can also edit `package.json` manually.

<info-box hint>
	Due to a non-deterministic way how npm installs packages, it is recommended to run `rm -rf node_modules && npm install` when in doubt. This will prevent some packages from getting installed more than once in `node_modules/` (which might lead to broken builds).

	You can also give [Yarn](https://yarnpkg.com/lang/en/) a try.
</info-box>

### Updating build configuration

If you added or removed dependencies, you will also need to modify the `build-config.js` file. Based on it the bundler entry file (`ckeditor.js`) will be created. You can also opt out from automatically creating the entry file and modify `ckeditor.js` manually, which can be useful in some non-standard cases.

Either way, every plugin that you want to include in the bundle should be included at this stage. You can also change the editor creator and specify the default editor configuration. For instance, your build configuration might look like this:

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

After you changed the build configuration or updated some dependencies, it is time to rebuild the bundle. This will run a bundler (webpack) with a proper configuration (see `webpack.config.js` and `webpack.compat.config.js`).

If you wish to create the bundles based on the build configuration (`build-config.js`) run:

```
npm run build
```

This command will update the entry file (`ckeditor.js`) and create two bundles – `build/ckeditor.js` and `build/ckeditor.compat.js`.

If you want to skip updating the entry file (in case you modified it manually) run:

```
npm run build-ckeditor
npm run build-ckeditor-compat
```

## Updating the build

You may decide to update your build at any time. Since it is a fork of the official build, you can simply merge the changes that happened meanwhile in that build, using Git commands:

```
git fetch upstream
git merge upstream/master
```

You should handle eventual conflicts and verify the merged changes. After that, just follow the previous instructions for creating your build and test it.

<info-box hint>
	It is recommended to run `rm -rf node_modules && npm install` after you fetched changes from the upstream or updated versions of dependencies in `package.json` manually. This will prevent npm from installing packages more than once (which may lead to broken builds).
</info-box>

## Publishing your builds

If you think that your custom builds can be useful to others, it is a great idea to publish them on GitHub and npm. When doing so, just be sure to give them meaningful names that would fit the `ckeditor5-build-(the name)` pattern, making them easy to find. To avoid conflicts with other existing builds you can use [scoped packages](https://docs.npmjs.com/misc/scope).

After your build is out, [ping us on Twitter](https://twitter.com/ckeditor)!
