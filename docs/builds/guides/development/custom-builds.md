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
* Changing the {@link builds/guides/integration/basic-api#creating-an-editor editor creator}.
* Changing the {@link framework/guides/theme-customization editor theme}.
* Changing the {@link features/ui-language localization language} of the editor.
* Enabling bug fixes which are still not a part of any public release.

<info-box hint>
	If you are looking for an easy way to create a custom build of CKEditor 5, check also the [online builder](https://ckeditor.com/ckeditor-5/online-builder/), which allows you to create easily a custom build through a simple and intuitive UI. Check the {@link builds/guides/development/online-builder step-by-step guide} on how to use it.
</info-box>

## Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) 6.9.0+
* npm 4+ (**note:** some npm 5+ versions were known to cause [problems](https://github.com/npm/npm/issues/16991), especially with deduplicating packages; upgrade npm when in doubt)
* [Git](https://git-scm.com/)

## Forking an existing build

Start with [forking](https://help.github.com/articles/fork-a-repo/) [the main `ckeditor5` repository](https://github.com/ckeditor/ckeditor5) (it will serve as the starting point for your customizations) and then clone your fork:

```bash
git clone -b stable git@github.com:<your-username>/ckeditor5.git
```

Builds are available in the `packages/` directory. The directories are named `ckeditor5-build-*`.
For example, use the following command to get to the classic build:

```bash
cd packages/ckeditor5-build-classic
```

To make updating easier you may optionally add the original build repository to your Git remotes:

```bash
git remote add upstream https://github.com/ckeditor/ckeditor5.git
```

<info-box hint>
	If you do not want to fork the official build, you can just clone it. However, you will not be able to commit and push your customizations back to GitHub.

	Alternatively, instead of creating a custom build you can {@link builds/guides/integration/advanced-setup#scenario-2-building-from-source integrate CKEditor 5 directly from source}. This option allows for even more flexibility and requires less overhead (you will not need to fork the official build). However, it requires that you fully control the `webpack.config.js` file (which is not that easy in some environments &mdash; for example in [`angular-cli`](https://cli.angular.io/) or [`create-react-app`](https://github.com/facebook/create-react-app)).
</info-box>

<info-box warning>
	It is important that you use the `stable` branch of a build, not the `master` branch. The `master` branch might contain changes which are not yet compatible with the versions of CKEditor 5 source packages that were published on npm.
</info-box>

## Build anatomy

Every build contains the following files:

* `build/ckeditor.js` &ndash; The ready-to-use editor bundle, containing the editor and all plugins.
* `src/ckeditor.js` &ndash; The source entry point of the build. Based on it the `build/ckeditor.js` file is created by [webpack](https://webpack.js.org). It defines the editor creator, the list of plugins and the default configuration of a build.
* `webpack-config.js` &ndash; webpack configuration used to build the editor.

## Customizing a build

In order to customize a build you need to:

* Install missing dependencies.
* Update the `src/ckeditor.js` file.
* Update the build (the editor bundle in `build/`).

### Installing dependencies

First, you need to install dependencies which are already specified in the build's `package.json`:

```bash
npm install
```

Then, you can add missing dependencies (i.e. packages you want to add to your build). The easiest way to do so is by typing:

```bash
npm install --save-dev <package-name>
```

This will install the package and add it to `package.json`. You can also edit `package.json` manually.

<info-box hint>
	Due to the non-deterministic way how npm installs packages, it is recommended to run `rm -rf node_modules && npm install` when in doubt. This will prevent some packages from getting installed more than once in `node_modules/` (which might lead to broken builds).

	You can also give [Yarn](https://yarnpkg.com/lang/en/) a try.
</info-box>

### Updating build configuration

If you added or removed dependencies, you will also need to modify the `src/ckeditor.js` file.

Every plugin that you want to include in the bundle should be added at this stage. You can also change the editor creator and specify the default editor configuration. For instance, your webpack entry file (`src/ckeditor.js`) may look like this:

```js
'use strict';

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import CustomPlugin from 'ckeditor5-custom-package/src/customplugin';
import OtherCustomPlugin from '../relative/path/to/some/othercustomplugin';

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	EssentialsPlugin,
	AutoformatPlugin,
	BoldPlugin,
	ItalicPlugin,
	HeadingPlugin,
	LinkPlugin,
	ListPlugin,
	ParagraphPlugin,

	CustomPlugin,
	OtherCustomPlugin
];

ClassicEditor.defaultConfig = {
	toolbar: [ 'heading', '|', 'bold', 'italic', 'custombutton' ],

	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
```

### Rebuilding the bundle

After you changed the webpack entry file or updated some dependencies, it is time to rebuild the bundle. This will run a bundler (webpack) with a proper configuration (see `webpack.config.js`).

To do that, execute the following command:

```bash
yarn run build
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
