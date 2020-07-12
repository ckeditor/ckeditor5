---
category: builds-integration
order: 50
---

# Installing plugins

---

## TODO

* Change the README in packaged downloaded from online builder
* Review installation.md, advanced-setup.md, overview.md, plugins.md, quick-start.md
* Link to this guide at the end of installation.md
* Add redirect from the old custom-builds.md to this guide.
* Remove custom-builds.md.
* Create a bootstrap task that could create all these files via `npx ckeditor5-bootstrap-build`.
* Make official builds and ones built with the online builder resemble each other as closely as possible.
* Check the READMEs of the official builds and the online builder.

---

While {@link builds/guides/integration/installation installing one of the existing builds} is a convenient way to start using CKEditor 5, soon you may want to do one of the following:

* install additional plugins (official, 3rd party, or your custom ones) to add missing functionalities,
* remove unnecessary plugins in order to optimize the build size,
* {@link TODO create a "super build"} containing more than one editor type,
* customize any other aspect of the build ({@link TODO change the built-in UI language}, {@link TODO extract styles to a separate file}).

To achieve any of this, you need to change the configuration and perform the build step.

This guide covers the simplest way to customize a build:

* Starting with the [online builder](#online-builder) &mdash; If you would like to use one of the existing builds but you want to add one of the official plugins, remove plugins or change the built-in language, this is the simplest option. This option is recommended if you are new to the JavaScript build stack (npm, webpack) or JavaScript itself.
* [Customizing a build](#customizing-a-build) &mdash; The package created with the online builder can be further customized locally. This way, you can add 3rd party and custom plugins or change webpack configuration to tune various aspects of the build process (minification, CSS extraction, etc.).

If these options are not suitable for you, see the {@link builds/guides/integration/advanced-setup Advanced setup} guide that covers the build process in greater detail and explains how to incorporate it into your application's build process (see {@link builds/guides/integration/advanced-setup#scenario-2-integrating-from-source "Integrating from source"}).

## Requirements

In order to start customizing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) 8.0.0+
* npm 5.0.0+

## Online builder

The [online builder](https://ckeditor.com/ckeditor-5/online-builder/) lets you download CKEditor 5 builds and also allows you to create your own, customized builds (with a different set of plugins) in a few easy steps, through a simple and intuitive UI.

For security reasons, the online builder offers only the official plugins. Its UI does not allow creating "super builds" or customize webpack configuration. However, you can do that after downloading one of the builds.

The downloaded ZIP package contains:

* `build/` &mdash; a directory with a ready-to-use build (`build/ckeditor.js`) and translations.
* `sample/` &mdash; a sample on which you can test the build.
* `src/ckeditor.js` &mdash; a source of the build that defines which editor and plugins should be included.
* `package.json` &mdash; definition of this build's dependencies (CKEditor 5 packages to install as well as build tools).
* `webpack.config.js` &mdash; webpack configuration.
* `README.md` and `LICENSE.md` with additional information.

The build downloaded from the online builder is ready-to-use (the `build/` directory is populated). However, you can still use it as a starting point to further adjustments (e.g. installing plugins).

Follow the instructions in included `README.md` in order to further customize your build.

## Customizing a build

* link to custom build from scratch

## Integrating from source

* fwd to advanced setup

























CKEditor 5 plugins are distributed through [npm](https://www.npmjs.com) packages and are implemented in a modular way, which means that a single plugin may consist of multiple JavaScript files.

In this guide you can learn how to add plugins to your editor in the two most common scenarios:

* When you use an {@link builds/guides/overview editor build},
* When you {@link framework/guides/quick-start build your editor from source}.

<info-box hint>
	If you are looking for an easy way to create a custom build of CKEditor 5 without installing anything, check the [online builder](https://ckeditor.com/ckeditor-5/online-builder/), which allows you to create easily a build with a custom set of plugins through a simple and intuitive UI.
</info-box>

## Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) 8.0.0+
* npm 5.0.0+

## Adding a plugin to a build

Adding plugins to existing builds is done through their customization. Editor builds are maintained in their respective GitHub repositories. Therefore, assuming that you want to customize the [classic editor build](https://npmjs.com/package/@ckeditor/ckeditor5-build-classic) you need to:

1. Clone the build repository.
2. Install the plugin package.
3. Add it to the build configuration.
4. Bundle the build.

```bash
git clone -b stable https://github.com/ckeditor/ckeditor5-build-classic.git
cd ckeditor5-build-classic
npm install
```

Now, install the plugin package:

```bash
npm install --save-dev @ckeditor/ckeditor5-alignment
```

Edit the `src/ckeditor.js` file to add your plugin to the list of plugins which will be included in the build and to add your feature's button to the toolbar:

```js
// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';     // <--- ADDED

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	EasyImage,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Link,
	List,
	Paragraph,
	Alignment                                                            // <--- ADDED
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'alignment',                                                 // <--- ADDED
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'imageUpload',
			'blockQuote',
			'undo',
			'redo'
		]
	},
	image: {
		toolbar: [
			'imageStyle:full',
			'imageStyle:side',
			'|',
			'imageTextAlternative'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
```

Finally, bundle the build:

```bash
yarn run build
```

If everything worked, the editor build (which is available in the `build/` directory) should be updated.

You can open the `sample/index.html` file in your browser to see whether the plugin was installed correctly.

This was a quick version of how a build can be customized. Read more about {@link builds/guides/development/custom-builds customizing existing editor builds} in a separate guide.

## Adding a plugin to an editor

If you {@link framework/guides/quick-start build the editor from source}, then the process of installing a new plugin boils down to these three steps:

1. Installing the plugin package.
2. Adding it to your editor's configuration.
3. Building your project.

For example, if you wish to install the text alignment feature:

```bash
npm install --save-dev @ckeditor/ckeditor5-alignment
```

Edit the code that initializes the editor:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';     // <--- ADDED

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic, Alignment ],     // <--- MODIFIED
		toolbar: [ 'bold', 'italic', 'alignment' ]                       // <--- MODIFIED
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

After rebuilding your project, the new feature will be available in the editor.

<info-box warning>
	One of the possible mistakes is trying to add a plugin in this way to an existing (bundled) editor build. Installing an existing build and then trying to add a plugin to it may not work if that plugin needs to import any of the source editor modules.

	The reason why this method will not work is that dependencies of the added plugin may duplicate the code already bundled in the used editor build. In the best scenario, this is going to raise the overall code size. In the worst scenario, an application built this way may be unstable.
</info-box>

## Difference between both methods

What is the difference between adding a plugin to an editor build and adding a plugin by passing the `config.plugins` option to the static `create()` method?

The first method builds the plugin into the editor class. This means that you can then initialize the editor without passing `config.plugins` at all and the editor will automatically enable all built-in plugins:

```js
// Assuming you use e.g. webpack which can load UMD modules by using ES6 syntax.
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Look, ma! No plugins!
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

All this works because a typical `src/ckeditor.js` module that you can find in every editor build repository (see for example [`@ckeditor/ckeditor5-build-classic`](https://github.com/ckeditor/ckeditor5-build-classic/blob/stable/src/ckeditor.js)) looks like this:

```js
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
// ...

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	// ...
];

ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'bold',
			// ...
		]
	},
	// ...
};
```

This code imports the source of the classic editor and extends it with a static `builtinPlugins` and `defaultConfig` properties where it defines a set of plugins and configuration to be used by this editor class.

In this approach, all editor instances created by using this editor build will by default load all these built-in plugins and configuration.

<info-box>
	You can still use the {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`} and {@link module:core/editor/editorconfig~EditorConfig#plugins `config.plugins`} options to override the default configuration.
</info-box>

When building the editor from source and not using a build as a base, you can also use the static `builtinPlugins` and `defaultConfig` properties of editor classes. However, in this situation it is usually more convenient to simply pass all the plugins directly to the static `create()` method:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic ],
		toolbar: [ 'bold', 'italic' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

So, in short, both methods use very similar mechanisms. However, adding a plugin through the static `builtinPlugins` property (which happens in editor builds) lets you automatically enable it in all editor instances created using this editor class, while passing a plugin to `create()` will naturally affect only one instance.
