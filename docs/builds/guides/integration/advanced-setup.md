---
category: builds-integration
order: 60
---

# Advanced setup

The {@link builds/guides/integration/installation Installation} guide describes the easiest ways to run CKEditor builds in your project and the {@link builds/guides/integration/installing-plugins Installing plugins} guide explains how to customize an existing build (e.g. to add a plugin).

In this guide, we would like to show you ways to closer integrate CKEditor 5 with your application and further customize builds. Thanks to that, you will be able to optimize the bundling process of your project and customize the builds in a more convenient way.

We will start from covering the requirements of the build process, including webpack configuration. Then, we will cover practical examples:

* [Scenario 1: Creating a custom build](#scenario-1-creating-a-custom-build) &mdash; explains how to create a custom build of CKEditor 5 from scratch and maintain it over time.
* [Scenario 2: Integrating from source](#scenario-2-integrating-from-source) &mdash; explains how to integrate CKEditor 5 from source directly into your application (without creating a separate build).
* [Option: Minifying JavaScript](#option-minifying-javascript) &mdash; explains how to configure webpack to minify output JavaScript files.
* [Option: Extracting CSS](#option-extracting-css) &mdash; explains how to configure webpack to generate standalone `.css` file.
* [Option: Building to ES5 target](#option-building-to-es5-target) &mdash; explains how to configure webpack and babel to transpile output code to ES5.
* [Option: Using two different editors](#option-using-two-different-editors) &mdash; explains how to create a build that allows using two different editors on one page.
* [Option: Using Webpack Encore](#option-using-webpack-encore) &mdash; explains how to configure webpack via [Webpack Encore](https://symfony.com/doc/current/frontend.html).

## Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) 8.0.0+
* npm 5.0.0+

Besides that, CKEditor 5 relies heavily on [webpack](https://webpack.js.org/), the most popular build tool for JavaScript applications.

### Webpack

CKEditor 5 is currently built using [webpack@4](https://webpack.js.org). All builds, examples and demos are generated using this bundler. While it should be possible to use other bundlers (like [Rollup](https://github.com/rollup/rollup) or [Browserify](http://browserify.org/)), porting [`@ckeditor/ckeditor5-dev-webpack-plugin`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-webpack-plugin) that allows localizing the editor or the PostCSS configuration may require a major effort and hence is not recommended.

There are a couple of things that you need to take care of when building CKEditor 5:

* Handling CSS files of the CKEditor theme. They are included in the CKEditor 5 sources using `import './path/to/styles.css'` statements, so you need [proper loaders](https://webpack.js.org/loaders/) configured to handle `.css` files. Additionally, CKEditor 5 makes use of many [PostCSS](https://postcss.org/) features that also needs to be configured.
* Similarly, you need to handle bundling SVG icons, which are also imported directly into the source. For that you need the [`raw-loader`](https://webpack.js.org/loaders/raw-loader/) configured to handle `.svg` files.
* Finally, to localize the editor you need to use the [`@ckeditor/ckeditor5-dev-webpack-plugin`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-webpack-plugin) webpack plugin.

The minimal configuration, solving all three aspects, will look like this:

```js
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
	plugins: [
		// ...

		new CKEditorWebpackPlugin( {
			// See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
			language: 'pl'
		} )
	],

	module: {
		rules: [
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
				use: [ 'raw-loader' ]
			},
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
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

<info-box>
	The above configuration uses `test` regular expressions that load `.svg` and `.css` files only from `ckeditor5-*` packages to avoid handle SVG and CSS files of your app. You may want to tune these patterns to handle other files too, especially when implementing custom plugins outside `ckeditor5-*` packages.

	The minimal configuration that is used e.g. in builds where there is no risk of conflicts is this:

	```js
	test: /\.svg$/,
	test: /\.css$/
	```
</info-box>

## Scenario 1: Creating a custom build

A custom build is an extension of what you can achieve with the {@link builds/guides/integration/installing-plugins#online-builder online builder}. In fact, a build generated with the online builder can become your custom build.

The goal of this section, though, is to show you how you could maintain a custom build over time. We assume that you work on a project that is maintained in a Git (or alternative) repository and you would like to store the source files of a build (and perhaps the build itself too) in this repository.

Let's see how you can create a build from scratch, taking care of each of the steps for the greatest control on the process.

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

		// https://webpack.js.org/configuration/entry-context/
		entry: path.resolve( __dirname, 'src', 'ckeditor.js' ),

		// https://webpack.js.org/configuration/output/
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

	<info-box>
		This guide is using the ES6 modules syntax. If you are not familiar with it, check out this [article](http://exploringjs.com/es6/ch_modules.html).
	</info-box>

	<info-box warning>
		Note that in this guide the editor class is used directly (this is &mdash; we use `@ckeditor/ckeditor5-editor-classic` instead of `@ckeditor/ckeditor5-build-classic`).
	</info-box>

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

### Step 7. Upgrading dependencies

The easiest way to upgrade CKEditor 5 to the newest version is to use the [`node-check-updates`](https://www.npmjs.com/package/npm-check-updates) tool, reinstall dependencies and rebuild the editor:

```
npx ncu -u "/.*\/ckeditor5-.*/"
```

The above command will update the versions of packages matching `*/ckeditor5-*` pattern in your `package.json`.

<info-box>
	Optionally, you can also upgrade other dependencies, like `webpack`, `raw-loader`, etc. However, you need to be cautious regarding major releases of these packages as their API might change. In case of any doubts, you can always refer back to this guide to see the latest working setup.

	To upgrade all dependencies to their latest major versions (potential breaking changes):

	```
	npx ncu -u
	```

	or without accepting breaking changes:

	```
	npx ncu -u --semverLevel=major
	```
</info-box>

Now, reinstall dependencies:

```
rm -rf node_modules
npm install
```

And build the editor again:

```
npn run build
```

We also **advise checking the [changelog](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md)** to learn about the latest changes.


### Conclusions

A custom build follows the same structure to the ZIP packages generated with the [online builder](#online-builder) and the [source of the official builds](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-build-classic). This means that you can use one of these as a starting point for your custom build.

A custom build allows you to control all aspects of how CKEditor 5 is built as you maintain control over the webpack configuration and the "entry file" (`src/ckeditor.js`).

The only disadvantages are that you have to introduce an additional build step to your application and that you cannot freely interact with modules from `@ckeditor/ckeditor5-*` packages directly from your application's source code (which would lead to {@link framework/guides/support/error-codes#error-ckeditor-duplicated-modules module duplication errors}). All interaction needs to happen through the API exposed by the `build/ckeditor.js` file.


## Scenario 2: Integrating from source

This scenario allows you to fully control the building process of CKEditor. This means that you will not actually use the builds anymore, but instead build CKEditor from source directly into your project. This integration method gives you full control over which features will be included and how webpack will be configured.

<info-box>
	The requirement is that your application uses webpack as its bundler and that you control webpack configuration.

	If either of these is not true in your case, we recommend the alternative methods of integrating CKEditor 5, such as [creating a custom build](#scenario-2-creating-a-custom-build).
</info-box>

### Installing dependencies

First of all, you need to install source packages that you will use. If you base your integration on one of the existing builds or a build generated with the [online builder](https://ckeditor.com/ckeditor-5/online-builder/), you can take them from that build's `package.json` file (see e.g. [classic build's `package.json`](https://github.com/ckeditor/ckeditor5-build-classic/tree/master/package.json)). At this moment you can choose the editor creator and the features you want.

Copy these dependencies to your `package.json` and call `npm install` to install them. The `dependencies` (or `devDependencies`) section of `package.json` should look more or less like this:

```js
"dependencies": {
	// ...

    "@ckeditor/ckeditor5-adapter-ckfinder": "^x.y.z",
    "@ckeditor/ckeditor5-autoformat": "^x.y.z",
    "@ckeditor/ckeditor5-basic-styles": "^x.y.z",
    "@ckeditor/ckeditor5-block-quote": "^x.y.z",
    "@ckeditor/ckeditor5-easy-image": "^x.y.z",
    "@ckeditor/ckeditor5-editor-classic": "^x.y.z",
    "@ckeditor/ckeditor5-essentials": "^x.y.z",
    "@ckeditor/ckeditor5-heading": "^x.y.z",
    "@ckeditor/ckeditor5-image": "^x.y.z",
    "@ckeditor/ckeditor5-link": "^x.y.z",
    "@ckeditor/ckeditor5-list": "^x.y.z",
    "@ckeditor/ckeditor5-paragraph": "^x.y.z",
    "@ckeditor/ckeditor5-theme-lark": "^x.y.z",
    "@ckeditor/ckeditor5-upload": "^x.y.z"

    // ...
}
```

The second step is to install dependencies needed to build the editor. The list may differ if you want to customize the webpack configuration, but this is a typical setup:

```bash
npm install --save \
	@ckeditor/ckeditor5-dev-webpack-plugin \
	@ckeditor/ckeditor5-dev-utils \
	postcss-loader@3 \
	raw-loader@3 \
	style-loader@1 \
	webpack@4 \
	webpack-cli@3 \
```

### Webpack configuration

Now, you need to adjust your webpack configuration. The minimal setup was covered in the [Bunlder](#bundler) section above. Apply respective changes to your setup in order to handle CKEditor 5's source.

### Running the editor

You can now import editor modules directly into your JavaScript code. Assuming that you use ES6 modules, the code would look like this:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapterPlugin from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import EasyImagePlugin from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImageCaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUploadPlugin from '@ckeditor/ckeditor5-image/src/imageupload';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';

// We can now instantiate the editor.
ClassicEditor
	.create( document.querySelector( '#editor'), {
		// All plugins are passed directly to .create().
		plugins: [
			EssentialsPlugin,
			AutoformatPlugin,
			BoldPlugin,
			ItalicPlugin,
			BlockQuotePlugin,
			HeadingPlugin,
			ImagePlugin,
			ImageCaptionPlugin,
			ImageStylePlugin,
			ImageToolbarPlugin,
			EasyImagePlugin,
			ImageUploadPlugin,
			LinkPlugin,
			ListPlugin,
			ParagraphPlugin,
			UploadAdapterPlugin
		],

		// So is the rest of the default configuration.
		toolbar: [
			'heading',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'imageUpload',
			'blockQuote',
			'undo',
			'redo'
		],
		image: {
			toolbar: [
				'imageStyle:full',
				'imageStyle:side',
				'|',
				'imageTextAlternative'
			]
		}
	} )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

### Building

Finally, you can build your application. Run webpack on your project and the rich text editor will be a part of it.

### Option: Custom plugins

If you would like to implement a custom plugin in this setup, there is no need to create full-blown npm packages. You can place your plugins directly in your application's source. Since all the code (your application, official CKEditor 5 packages and your custom plugins) are built together in one step, you have full freedom on how to integrate these parts together.

<info-box>
	You may need to adjust the webpack loader's `test` regular expressions if you want to load custom plugins' SVG and CSS files.
</info-box>

## Going deeper

### Option: Minifying JavaScript

Webpack 4 introduced the [concept of modes](https://webpack.js.org/concepts/mode/). It comes with two predefined modes: `development` and `production`. The latter automatically enables [`uglifyjs-webpack-plugin`](https://www.npmjs.com/package/uglifyjs-webpack-plugin) which takes care of JavaScript minification. Therefore, it is enough to execute `webpack` with the `--mode production` option or set `mode: 'production'` in your `webpack.config.js` to optimize the build.

<info-box>
	Prior to version 1.2.7 `uglifyjs-webpack-plugin` had a bug which caused webpack to crash with the following error: `TypeError: Assignment to constant variable.`. If you experienced this error, make sure that your `node_modules` contains an up-to-date version of this package (and that webpack uses this version).

	CKEditor 5 Builds use [`Terser`](https://github.com/terser/terser) instead of `uglifyjs-webpack-plugin` because [the later one seems to be unsupported anymore](https://github.com/ckeditor/ckeditor5/issues/1353).
</info-box>

### Option: Extracting CSS

One of the most common requirements is to extract CKEditor 5 CSS to a separate file (by default it is included in the output JavaScript file). To do that, you can use [`mini-css-extract-plugin`](https://www.npmjs.com/package/mini-css-extract-plugin):

```bash
npm install --save \
	mini-css-extract-plugin \
	css-loader
```

And add it to your webpack configuration:

```js
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

module.exports = {
	// ...

	plugins: [
		// ...

		new MiniCssExtractPlugin( {
			filename: 'styles.css'
		} )
	],

	module: {
		rules: [
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
				use: [ 'raw-loader' ]
			},
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: styles.getPostCssConfig( {
							themeImporter: {
								themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
							},
							minify: true
						} )
					}
				]
			}
		]
	}
};
```

Webpack will now create a separate file called `styles.css` which you will need to load manually into your HTML (using the `<link rel="stylesheet">` tag).

### Option: Building to ES5 target

CKEditor 5 is written in ECMAScript 2015 (also called ES6). All browsers in which CKEditor 5 is {@link builds/guides/support/browser-compatibility currently supported} have sufficient ES6 support to run CKEditor 5. Thanks to that, CKEditor 5 Builds are also published in the original ES6 format.

However, it may happen that your environment requires ES5. For instance, if you use tools like the original [UglifyJS](https://github.com/mishoo/UglifyJS) which do not support ES6+ yet, you may need to transpile CKEditor 5 source to ES5. This will create ~80% bigger builds but will ensure that your environment can process CKEditor 5 code.

<info-box>
	In the [production mode](https://webpack.js.org/concepts/mode/) webpack uses [`uglifyjs-webpack-plugin`](https://www.npmjs.com/package/uglifyjs-webpack-plugin) which supports ES6+ code. This is because it does not use the original [UglifyJS](https://github.com/mishoo/UglifyJS) plugin (which does not support ES6+), but instead it uses the [`uglify-es`](https://github.com/mishoo/UglifyJS2/tree/harmony) package.

	We recommend upgrading your setup to webpack@4 and its built-in modes which allows you to avoid transpiling the source to ES5.
</info-box>

In order to create an ES5 build of CKEditor 5 you can use [Babel](https://babeljs.io/):

```bash
npm install --save babel-loader @babel/core @babel/preset-env regenerator-runtime
```

Then, add this item to webpack [`module.rules`](https://webpack.js.org/configuration/module/#module-rules) section:

```js
module: {
	rules: [
		{
			test: /ckeditor5-[^\/\\]+[\/\\].+\.js$/,
			use: [
				{
					loader: 'babel-loader',
					options: {
						presets: [ require( '@babel/preset-env' ) ]
					}
				}
			]
		},
		...
	]
}
```

And load [`regenerator-runtime`](https://www.npmjs.com/package/regenerator-runtime) (needed to make ES6 generators work after transpilation) by adding it as the first [entry point](https://webpack.js.org/configuration/entry-context/#entry):

```js
entry: [
	require.resolve( 'regenerator-runtime/runtime.js' ),

	// Your entries...
]
```

<info-box>
	This setup ensures that the source code is transpiled to ES5. However, it does not ensure that all ES6 polyfills are loaded. Therefore, if you would like to, for example, give [bringing IE11 compatibility](https://github.com/ckeditor/ckeditor5/issues/330) a try, make sure to also load [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/).
</info-box>

<info-box>
	The [`babel-preset-env`](https://github.com/babel/babel-preset-env) package lets you choose the environment that you want to support and transpiles ES6+ features to match that environment's capabilities. Without configuration it will produce ES5 builds.
</info-box>

### Option: Using two different editors

The ability to use two or more types of rich text editors on one page is a common requirement. For instance, you may want to use the {@link builds/guides/overview#classic-editor classic editor} next to a couple of {@link builds/guides/overview#inline-editor inline editors}.

**Do not load two builds on one page.** This is a mistake which leads to:

* Code duplication. Both builds share up to 99% of the code, including CSS and SVGs. By loading them twice you make your page unnecessarily heavy.
* Duplicated CSS may lead to conflicts and, thus, broken UI of the editors.
* Translation repository gets duplicated entries which may cause loading incorrect strings with translations.

If you want to load two different editors on one page you need to make sure that they are built together (once). This can be achieved in at least two ways:

* [Integrating CKEditor 5 from source](#scenario-2-integrating-from-source) directly into your application. Since you build you application once, the editors that you use will be built together, too.
* [Creating a "super build" of CKEditor 5](#creating-super-builds). Instead of creating a build which exports just one editor, you can create a build which exports two or more at the same time.

#### Creating "super builds"

There is no limit for how many editor classes a single build can export. By default, the official builds export a single editor class only. However, they can easily import more.

First, learn {@link builds/guides/integration/installing-plugins#customizing-a-build how to customize a build} or [create a custom build from scratch](#scenario-1-creating-a-custom-build).

Now, assuming that your starting point was the [`ckeditor5-build-classic`](http://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-build-classic) build and want to add {@link module:editor-inline/inlineeditor~InlineEditor} to it, go the build directory:

```bash
cd ckeditor5-my-custom-super-build
npm install
```

Add the missing editor package and install it:

```
npm install --save-dev @ckeditor/ckeditor5-editor-inline
```

Once all the dependencies are installed, modify the webpack's entry point which is the `src/ckeditor.js` file. For now it was exporting just a single class:

```js
// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

// ...

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	// ...
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	// ...
};
```

Let's make it export an object with two classes: `ClassicEditor` and `InlineEditor`. To make both constructors work in the same way (load the same plugins and default configuration) you also need to assign `builtinPlugins` and `defaultConfig` static properties to both of them:

```js
// The editor creators to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import InlineEditorBase from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';

// ...

class ClassicEditor extends ClassicEditorBase {}
class InlineEditor extends InlineEditorBase {}

// Plugins to include in the build.
const plugins = [
	// ...
];

ClassicEditor.builtinPlugins = plugins;
InlineEditor.builtinPlugins = plugins;

// Editor configuration.
const config = {
	// ...
};

ClassicEditor.defaultConfig = config;
InlineEditor.defaultConfig = config;

export default {
	ClassicEditor, InlineEditor
};
```

Since you now export an object with two properties (`ClassicEditor` and `InlineEditor`), it is also reasonable to rename the global variable to which webpack will assign this object. So far it was called `ClassicEditor`. A more adequate name now would be for example `CKEDITOR`. This variable is defined in `webpack.config.js` in the `output.library` setting:

```diff
diff --git a/webpack.config.js b/webpack.config.js
index c57e371..04fc9fe 100644
--- a/webpack.config.js
+++ b/webpack.config.js
@@ -21,7 +21,7 @@ module.exports = {

     output: {
         // The name under which the editor will be exported.
-        library: 'ClassicEditor',
+        library: 'CKEDITOR',

         path: path.resolve( __dirname, 'build' ),
         filename: 'ckeditor.js',
```

Once you changed the `src/ckeditor.js` and `webpack.config.js` files it is time to rebuild the build:

```bash
npm run build
```

Finally, when webpack finishes compiling your super build, you can change the `samples/index.html` file to test both editors:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – super build</title>
	<style>
		body {
			max-width: 800px;
			margin: 20px auto;
		}
	</style>
</head>
<body>

<h1>CKEditor 5 – super build</h1>

<div id="classic-editor">
	<h2>Sample</h2>

	<p>This is an instance of the <a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#classic-editor">classic editor build</a>.</p>
</div>

<div id="inline-editor">
	<h2>Sample</h2>

	<p>This is an instance of the <a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#inline-editor">inline editor build</a>.</p>
</div>

<script src="../build/ckeditor.js"></script>
<script>
	CKEDITOR.ClassicEditor
		.create( document.querySelector( '#classic-editor' ) )
		.catch( err => {
			console.error( err.stack );
		} );

	CKEDITOR.InlineEditor
		.create( document.querySelector( '#inline-editor' ) )
		.catch( err => {
			console.error( err.stack );
		} );
</script>

</body>
</html>
```

### Option: Using Webpack Encore

If you use [Webpack Encore](https://github.com/symfony/webpack-encore), you can use the following configuration:

```js
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

Encore.
	// ... your configuration ...

	.addPlugin( new CKEditorWebpackPlugin( {
		// See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
		language: 'pl'
	} ) )

	// Use raw-loader for CKEditor 5 SVG files.
	.addRule( {
		test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
		loader: 'raw-loader'
	} )

	// Configure other image loaders to exclude CKEditor 5 SVG files.
	.configureLoaderRule( 'images', loader => {
		loader.exclude = /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/;
	} )

	// Configure PostCSS loader.
	.addLoader({
		test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
		loader: 'postcss-loader',
		options: styles.getPostCssConfig( {
			themeImporter: {
				themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
			}
		} )
	} )
```
