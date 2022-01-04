---
# Scope:
# - Guidance on all possible installation options.

category: getting-started
order: 10
modified_at: 2021-12-20
---

# Quick start

## Using predefined builds

Creating an editor using a {@link installation/advanced/predefined-builds predefined CKEditor 5 build} is very simple and can be described in two steps:

1. Load the desired editor via the `<script>` tag.
2. Call the static `create()` method to create the editor.

Check the {@link installation/advanced/predefined-builds predefined build} guide for details on the builds themselves and {@link installation/advanced/predefined-builds#installing-a-build installing specific builds}.

<!-- We should consider making OB into a separate guide -->

## Creating custom builds with Online builder

Although the CKEditor 5 WYSIWYG editor comes with handy preconfigured builds, sometimes these predefined versions are not enough and a need for custom builds arises. Some of the reasons for creating custom builds are:

* Adding {@link installation/advanced/plugins plugin-driven features} which are not included in the existing builds.
* Removing unnecessary features present in a build.
* Designing {@link installation/getting-started/configuration#toolbar-setup customized toolbar experience}.
* Changing the {@link installation/advanced/predefined-builds#available-builds editor type build}.
* Changing the {@link features/ui-language localization language} of the editor.

This is where the online builder comes to aid the users needs.

### Using online builder to create custom CKEditor 5 WYSIWYG editor build

The [online builder](https://ckeditor.com/ckeditor-5/online-builder/) lets you download CKEditor 5 builds and also allows you to create your own, customized builds (with a different set of plugins) in a few easy steps, through a simple and intuitive UI.

#### Choosing editor type

The following CKEditor 5 Builds are currently available to choose from:

 * {@link installation/advanced/predefined-builds#classic-editor Classic editor}
 * {@link installation/advanced/predefined-builds#inline-editor Inline editor}
 * {@link installation/advanced/predefined-builds#balloon-editor Baloon editor}
 * {@link installation/advanced/predefined-builds#balloon-block-editor Baloon block editor}
 * {@link installation/advanced/predefined-builds#document-editor Document editor}

 Refer to the documentation to check what kind of WYSIWYG editor suits your needs best. Once you choose the desired editor type, press the **Next step** button on the top right.

 For the sake of clarity, this guide will use the Classic build as an example.

 {@img assets/img/online-builder-01-editor-type-choice.png 778 Editor type selection.}

#### Choosing plugins

The basic build comes with a predefined set of plugins grouped in the bar at the top of the page. Take a moment to check these options out. You can freely remove the ones that will not be used in your build.

{@img assets/img/online-builder-02-predefined-plugins.png 778 Predefined plugins. Feel free to remove unneded ones.}

Below the top bar with preselected plugins, you will find a large collection of features that can be added to the custom build. Choose the ones that best suit your needs.

{@img assets/img/online-builder-03-plugin-choice.png 778 Predefined plugins. SOme of the plugins to choose from.}

<info-box hint>
	Note that some of the plugins require other plugins to work. These dependencies are mentioned in the **Require plugin** section of the description box for each plugin. If this section is not present - the plugin doesn't need any other plugin to work.
</info-box>

Once you choose all the desired plugins, press the **Next step** button on the top right.

#### Toolbar composition

Next step allows you to compose the toolbar. A simple drag-and-drop workspace allows for adding buttons (representing the plugins chosen in the previous step) to the toolbars. The user may change the order of the buttons and group them accordingly.

{@img assets/img/online-builder-04-toolbar-configurator.png 753 The toolbar drag-and-drop configurator.}

<info-box hint>
	Some of the buttons are pre-placed on the layout but grayed-out. You still need, however, to drag them from the lower bar into the upper bar - they will become focused and can be then moved around.
</info-box>

Once you finish designing the toolbar, press the **Next step** button on the top right.

#### Choosing the default language

Scroll the list of available languages and check the one you want to be the main language of your editor build.

{@img assets/img/online-builder-05-language-selection.png 367 Language selector list.}

<info-box hint>
	All other languages will still be available in the `translations` folder.
</info-box>

#### Download the customized build

This is as simple as it gets: just press the **Start** button to download your customized package.

Refer to the [Installation page](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/installation.html#zip-download) for further instructions on installing the custom build.

## Creating custom builds

A build is a simple [npm](https://www.npmjs.com) package (usually developed in a Git repository) with a predefined set of dependencies. Out of this repository, distribution files can be generated through the build process.

Some of the reasons for creating custom builds are:

* Adding features which are not included in the existing builds, either from a third party or custom developed.
* Removing unnecessary features present in a build.
* Changing the {@link installation/getting-started/basic-api#creating-an-editor editor creator}.
* Changing the {@link framework/guides/theme-customization editor theme}.
* Changing the {@link features/ui-language localization language} of the editor.
* Enabling bug fixes which are still not a part of any public release.

<info-box hint>
	If you are looking for an easy way to create a custom build of CKEditor 5, check also the [online builder](https://ckeditor.com/ckeditor-5/online-builder/), which allows you to create easily a custom build through a simple and intuitive UI.
</info-box>

### Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) 12.0.0+
* npm 5.7.1+ (**note:** some npm 5+ versions were known to cause [problems](https://github.com/npm/npm/issues/16991), especially with deduplicating packages; upgrade npm when in doubt)
* [Git](https://git-scm.com/)

### Forking an existing build

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

	Alternatively, instead of creating a custom build you can {@link installation/advanced/advanced-setup#scenario-2-building-from-source integrate CKEditor 5 directly from source}. This option allows for even more flexibility and requires less overhead (you will not need to fork the official build). However, it requires that you fully control the `webpack.config.js` file (which is not that easy in some environments &mdash; for example in [`angular-cli`](https://cli.angular.io/) or [`create-react-app`](https://github.com/facebook/create-react-app)).
</info-box>

<info-box warning>
	It is important that you use the `stable` branch of a build, not the `master` branch. The `master` branch might contain changes which are not yet compatible with the versions of CKEditor 5 source packages that were published on npm.
</info-box>

### Build anatomy

Every build contains the following files:

* `build/ckeditor.js` &ndash; The ready-to-use editor bundle, containing the editor and all plugins.
* `src/ckeditor.js` &ndash; The source entry point of the build. Based on it the `build/ckeditor.js` file is created by [webpack](https://webpack.js.org). It defines the editor creator, the list of plugins and the default configuration of a build.
* `webpack-config.js` &ndash; webpack configuration used to build the editor.

### Customizing a build

In order to customize a build you need to:

* Install missing dependencies.
* Update the `src/ckeditor.js` file.
* Update the build (the editor bundle in `build/`).

#### Installing dependencies

First, you need to install dependencies which are already specified in the build's `package.json`:

```bash
npm install
```

Then, you can add missing dependencies (i.e. packages you want to add to your build). The easiest way to do so is by typing:

```bash
npm install --save-dev <package-name>
```

This will install the package and add it to `package.json`. You can also edit `package.json` manually. Keep in mind however, that all packages (excluding `@ckeditor/ckeditor5-dev-*`) {@link installation/getting-started/installing-plugins#requirements must have the same version as the base editor package}.

<info-box hint>
	Due to the non-deterministic way how npm installs packages, it is recommended to run `rm -rf node_modules && npm install` when in doubt. This will prevent some packages from getting installed more than once in `node_modules/` (which might lead to broken builds).

	You can also give [Yarn](https://yarnpkg.com/lang/en/) a try.
</info-box>

#### Updating build configuration

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

#### Rebuilding the bundle

After you changed the webpack entry file or updated some dependencies, it is time to rebuild the bundle. This will run a bundler (webpack) with a proper configuration (see `webpack.config.js`).

To do that, execute the following command:

```bash
yarn run build
```

You can validate whether your new build works by opening the `sample/index.html` file in a browser (via HTTP, not as a local file). Make sure to **clear the cache**.

### Updating the build

You may decide to update your build at any time. Since it is a fork of the official build, you can simply merge the changes that happened meanwhile in that build, using Git commands:

```bash
git fetch upstream
git merge upstream/stable
```

You should handle eventual conflicts and verify the merged changes. After that, just follow the previous instructions for creating your build and test it.

<info-box hint>
	It is recommended to run `rm -rf node_modules && npm install` after you fetched changes from the upstream or updated versions of dependencies in `package.json` manually. This will prevent npm from installing packages more than once (which may lead to broken builds).
</info-box>

### Publishing your builds

If you think that your custom builds can be useful to others, it is a great idea to publish them on GitHub and npm. When doing so, just be sure to give them meaningful names that would fit the `ckeditor5-build-(the name)` pattern, making them easy to find. To avoid conflicts with other existing builds you can use [scoped packages](https://docs.npmjs.com/misc/scope). We also recommend using the "ckeditor5" and "ckeditor5-build" [keywords](https://docs.npmjs.com/files/package.json#keywords) to make your build [easier to find](https://www.npmjs.com/search?q=keywords:ckeditor5-build&page=1&ranking=optimal).

After your build is out, [ping us on Twitter](https://twitter.com/ckeditor)!

## Installation

### Download options

There are several options to download CKEditor 5 builds:

* [CDN](#cdn)
* [npm](#npm)
* [Online builder](#online-builder)
* [Zip download](#zip-download)

For the list of available builds check the {@link installation/advanced/predefined-builds#available-builds Overview} page.

After downloading the editor jump to the {@link installation/getting-started/basic-api Basic API guide} to see how to create editors.

#### CDN

Builds can be loaded inside pages directly from [CKEditor CDN](https://cdn.ckeditor.com/#ckeditor5), which is optimized for worldwide super fast content delivery. When using CDN no download is actually needed.

#### npm

All builds are released on npm. [Use this search link](https://www.npmjs.com/search?q=keywords%3Ackeditor5-build%20maintainer%3Ackeditor) to view all official build packages available in npm.

Installing a build with npm is as simple as calling one of the following commands in your project:

```bash
npm install --save @ckeditor/ckeditor5-build-classic
# Or:
npm install --save @ckeditor/ckeditor5-build-inline
# Or:
npm install --save @ckeditor/ckeditor5-build-balloon
# Or:
npm install --save @ckeditor/ckeditor5-build-balloon-block
# Or:
npm install --save @ckeditor/ckeditor5-build-decoupled-document
```

CKEditor will then be available at `node_modules/@ckeditor/ckeditor5-build-[name]/build/ckeditor.js`. It can also be imported directly to your code by `require( '@ckeditor/ckeditor5-build-[name]' )`.

#### Online builder

The [online builder](https://ckeditor.com/ckeditor-5/online-builder/) lets you download CKEditor 5 builds and also allows you to create your own, customized builds (with a different set of plugins) in a few easy steps, through a simple and intuitive UI.

#### Zip download

Go to the [CKEditor 5 builds download page](https://ckeditor.com/ckeditor-5-builds/download/) and download your preferred build. For example, you may download the `ckeditor5-build-classic-1.0.0.zip` file for the Classic editor build.

Extract the `.zip` file into a dedicated directory inside your project. It is recommended to include the editor version in the directory name to ensure proper cache invalidation once a new version of CKEditor is installed.

##### Included files

* `ckeditor.js` &ndash; The ready-to-use editor bundle, containing the editor and all plugins.
* `ckeditor.js.map` &ndash; The source map for the editor bundle.
* `translations/` &ndash; The editor UI translations (see {@link features/ui-language Setting the UI language}).
* `README.md` and `LICENSE.md`

### Loading the API

After downloading and installing a CKEditor 5 build in your application, it is time to make the editor API available in your pages. For that purpose, it is enough to load the API entry point script:

```html
<script src="[ckeditor-build-path]/ckeditor.js"></script>
```

Once the CKEditor script is loaded, you can {@link installation/getting-started/basic-api use the API} to create editors in your page.

<info-box>
	The `build/ckeditor.js` file is generated in the [UMD format](https://github.com/umdjs/umd) so you can also import it into your application if you use CommonJS modules (like in Node.js) or AMD modules (like in Require.js). Read more in the {@link installation/getting-started/basic-api#umd-support Basic API guide}.

	Also, for a more advanced setup, you may wish to bundle the CKEditor script with other scripts used by your application. See {@link installation/advanced/advanced-setup Advanced setup} for more information about it.
</info-box>

<info-box>
	There are other installation and integration methods available. For more information check {@link installation/getting-started/quick-start#installation Installation} and {@link installation/getting-started/basic-api Basic API} guides.
</info-box>

### Next steps

Check the {@link installation/getting-started/configuration Configuration guide} to learn how to configure the editor &mdash; for example, change the default toolbar.
