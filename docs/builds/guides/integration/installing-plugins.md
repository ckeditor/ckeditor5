---
menu-title: Installing plugins
category: builds-integration
order: 50
---

## TODO

* Change the README in packaged downloaded from online builder
* Review installation.md, advanced-setup.md, overview.md, plugins.md, quick-start.md
* Link to this guide at the end of installation.md
* Add redirect from the old custom-builds.md to this guide.
* Remove custom-builds.md.
* Create a bootstrap task that could create all these files via `npx ckeditor5-bootstrap-build`.

---

# Installing plugins

While {@link builds/guides/integration/installation installing one of the existing builds} is a convenient way to start using CKEditor 5, soon you may want to do one of the following:

* install additional plugins (official, 3rd party, or your custom ones) to add missing functionalities,
* remove unnecessary plugins in order to optimize the build size,
* {@link TODO create a "super build"} containing more than one editor type,
* customize any other aspect of the build ({@link TODO change the built-in UI language}, {@link TODO extract styles to a separate file}).

To achieve any of this, you need to change the configuration and perform the build step.

This guide covers three main ways to customize a build. We start from the simplest one (using the online builder) and then cover more flexible options (cloning a build and integrating the editor from source):

* [Online builder](#online-builder) &mdash; If you use one of the existing builds and want to add one of the official plugins, remove plugins or change the built-in language, this is the simplest option. This option is recommended if you are new to the JavaScript build stack (npm, webpack) or JavaScript itself.
* [Creating a custom build](#custom-build) &mdash; The minimal structure of a build's source contains just a three files. You can create such a setup manually and included it in a subdirectory of your repository (or put them anywhere else). This setup is recommended if you cannot integrate the editor from source, as it does not require adjusting your webpack configuration.
* [Integrating the editor from source](#integrating-from-source) &mdash; This is by far the most powerful and optimal way to use CKEditor 5. In this scenario you can import and interact with it or any of its modules (e.g. in order to implement a custom plugin) just like you interact with your source modules. However, it requires adjusting your webpack configuration which is not always feasible.

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

The build downloaded from the online builder is ready-to-use (the `build/` directory is populated). However, you can still use it as a starting point to further adjustments (e.g. installing 3rd party plugins).

Follow the instructions in included `README.md` in order to further customize your build.

## Custom build

A custom build is an extension of what you can achieve with the [online builder](#online-builder). In fact, a build generated with the online builder can become your custom build.

The goal of this section, though, is to show you how you could maintain a custom build over time. We assume that you work on a project that is maintained in a Git (or alternative) repository and you would like to store the source files of a build (and perhaps the build itself too) in this repository.

### Step 1. Build files

Let's create a `vendor/ckeditor/` directory with these 3 files:

* `vendor/ckeditor/package.json`

	```js
	{
	  "name": "ckeditor5-custom-build",
	  "version": "0.0.1",
	  "private": true,
	  "scripts": {
	    "build": "webpack --mode production"
	  }
	}
	```

* `vendor/ckeditor/webpack.config.js`:

	```js
	'use strict';

	const path = require( 'path' );
	const webpack = require( 'webpack' );
	const { bundler, styles } = require( '@ckeditor/ckeditor5-dev-utils' );
	const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
	const TerserWebpackPlugin = require( 'terser-webpack-plugin' );

	module.exports = {
		devtool: 'source-map',
		performance: { hints: false },

		entry: path.resolve( __dirname, 'src', 'ckeditor.js' ),

		output: {
			// The name under which the editor will be exported.
			library: 'ClassicEditor',

			path: path.resolve( __dirname, 'build' ),
			filename: 'ckeditor.js',
			libraryTarget: 'umd',
			libraryExport: 'default'
		},

		optimization: {
			minimizer: [
				new TerserWebpackPlugin( {
					sourceMap: true,
					terserOptions: {
						output: {
							// Preserve CKEditor 5 license comments.
							comments: /^!/
						}
					},
					extractComments: false
				} )
			]
		},

		plugins: [
			new CKEditorWebpackPlugin( {
				// UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
				// When changing the built-in language, remember to also change it in the editor's configuration (src/ckeditor.js).
				language: 'en',
				additionalLanguages: 'all'
			} ),
			new webpack.BannerPlugin( {
				banner: bundler.getLicenseBanner(),
				raw: true
			} )
		],

		module: {
			rules: [
				{
					test: /\.svg$/,
					use: [ 'raw-loader' ]
				},
				{
					test: /\.css$/,
					use: [
						{
							loader: 'style-loader',
							options: {
								injectType: 'singletonStyleTag',
								attributes: {
									'data-cke': true
								}
							}
						},
						{
							loader: 'postcss-loader',
							options: styles.getPostCssConfig( {
								themeImporter: {
									themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
								},
								minify: true
							} )
						},
					]
				}
			]
		}
	};
	```

* `vendor/ckeditor/src/ckeditor.js`:

	```js
	import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
	import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
	import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
	import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
	import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';

	class Editor extends ClassicEditor {}

	// Plugins to include in the build.
	Editor.builtinPlugins = [
		Essentials,
		Paragraph,
		Bold,
		Italic
	];

	// Default editor configuration
	// (it can be overridden when initializing the editor).
	ClassicEditor.defaultConfig = {
		toolbar: {
			items: [
				'bold',
				'italic',
				'|',
				'undo',
				'redo'
			]
		},
		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'en'
	};

	export default Editor;
	```

### Step 2. Dependencies

Now, let's install missing dependencies (while being in `vendor/ckeditor/`):

```bash
npm install --save \
	@ckeditor/ckeditor5-dev-utils \
	@ckeditor/ckeditor5-dev-webpack-plugin \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-paragraph \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-theme-lark \
	postcss-loader@3 \
	raw-loader@3 \
	style-loader@1 \
	webpack@4 \
	webpack-cli@3
```

### Step 3. Build the editor

To build the editor run the following command (while being in `vendor/ckeditor/`):

```bash
npm run build
```

### Step 4. Test your build

To test your build you can create a simple test file in `vendor/ckeditor/sample/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – sample</title>
	<style>
		body {
			max-width: 800px;
			margin: 20px auto;
		}
	</style>
</head>
<body>
	<h1>CKEditor 5 – sample</h1>
	<div id="editor">
		<p>This is an instance of <strong>CKEditor 5</strong>.</p>
	</div>
	<script src="../build/ckeditor.js"></script>
	<script>
		ClassicEditor.create( document.querySelector( '#editor' ) )
			.then( editor => {
				window.editor = editor;
			} )
			.catch( error => {
				console.error( 'There was a problem initializing the editor.', error );
			} );
	</script>
</body>
</html>
```

You can now open this file in your browser 🎉

### Step 5. Installing a plugin

Let's say that you want to install the {@link features/link Link feature}.

First install the package:

```bash
npm install --save @ckeditor/ckeditor5-link
```

Then, add the plugin to the builtin plugin list in `vendor/ckeditor/src/ckeditor.js`:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';

import Link from '@ckeditor/ckeditor5-link/src/link.js'; // <- ADD

class Editor extends ClassicEditor {}

// Plugins to include in the build.
Editor.builtinPlugins = [
	Essentials,
	Paragraph,
	Bold,
	Italic,
	Link // <- ADD
];

// Default editor configuration
// (it can be overridden when initializing the editor).
Editor.defaultConfig = {
	toolbar: {
		items: [
			'bold',
			'italic',
			'link', // <- ADD
			'|',
			'undo',
			'redo'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};

export default Editor;
```

Rebuild the build:

```bash
npm run build
```

And refresh the sample (make sure to clear the cache!). There should be the link button in the toolbar.

### Step 6. Adding a custom plugin

In this setup it is also possible to add custom plugins. You can keep their source for instance in `vendor/ckeditor/plugins/`.

For a complete tutorial on implementing your first custom plugin see {@link framework/guides/creating-simple-plugin Creating a simple plugin}. In this section we will go quickly through the most important parts.

First, install the missing dependency:

```js
npm install --save @ckeditor/ckeditor5-core
```

Implement your plugin (`vendor/ckeditor/plugins/customplugin.js`):

```js
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class CustomPlugin extends Plugin {
	init() {
		console.log( 'My CustomPlugin works 🎉' );
	}
}
```

Edit `vendor/ckeditor/src/ckeditor.js` again:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';

import Link from '@ckeditor/ckeditor5-link/src/link.js';

import CustomPlugin from '../plugins/customplugin.js'; // <- ADD

class Editor extends ClassicEditor {}

// Plugins to include in the build.
Editor.builtinPlugins = [
	Essentials,
	Paragraph,
	Bold,
	Italic,
	Link,
	CustomPlugin // <- ADD
];

// Default editor configuration
// (it can be overridden when initializing the editor).
Editor.defaultConfig = {
	toolbar: {
		items: [
			'bold',
			'italic',
			'link',
			'|',
			'undo',
			'redo'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};

export default Editor;
```

Rebuild the build:

```bash
npm run build
```

And refresh the demo (remember about the cache!) again. You should see `"My CustomPlugin works 🎉"` on the console.

### Conclusions

A custom build follows the same structure to the ZIP packages generated with the [online builder](#online-builder) and the [source of the official builds](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-build-classic). This means that you can use one of these as a starting point for your custom build.

A custom build allows you to control all aspects of how CKEditor 5 is built as you maintain control over the webpack configuration and the "entry file" (`src/ckeditor.js`).

The only disadvantages are that you have to introduce an additional build step to your application and that you cannot freely interact with modules from `@ckeditor/ckeditor5-*` packages directly from your application's source code (which would lead to {@link framework/guides/support/error-codes#error-ckeditor-duplicated-modules module duplication errors}). All interaction needs to happen through the API exposed by the `build/ckeditor.js` file.

## Integrating from source


























CKEditor 5 plugins are distributed through [npm](https://www.npmjs.com) packages and are implemented in a modular way, which means that a single plugin may consist of multiple JavaScript files.

In this guide you can learn how to add plugins to your editor in the two most common scenarios:

* When you use an {@link builds/guides/overview editor build},
* When you {@link framework/guides/quick-start build your editor from source}.

<info-box hint>
	If you are looking for an easy way to create a custom build of CKEditor 5 without installing anything, check the [online builder](https://ckeditor.com/ckeditor-5/online-builder/), which allows you to create easily a build with a custom set of plugins through a simple and intuitive UI.
</info-box>

## Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) 6.9.0+
* npm 4+ (**note:** some npm 5+ versions were known to cause [problems](https://github.com/npm/npm/issues/16991), especially with deduplicating packages; upgrade npm when in doubt)

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
