---
category: builds-integration
order: 60
---

# Advanced setup

The {@link builds/guides/integration/installation Installation} guide describes the easiest ways to run CKEditor builds in your project and the {@link builds/guides/development/custom-builds Custom builds} guide explains how to add or remove features from the build or change webpack configuration.

In this guide, we would like to show you ways to closer integrate CKEditor 5 with your application. Thanks to that, you will be able to optimize the bundling process of your project and customize the builds in a more convenient way.

## Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) 6.9.0+
* npm 4+ (**note:** some npm 5+ versions were known to cause [problems](https://github.com/npm/npm/issues/16991), especially with deduplicating packages; upgrade npm when in doubt)
* [Git](https://git-scm.com/)

## Bundler

CKEditor 5 is currently built using [webpack@4](https://webpack.js.org). All builds, examples and demos are generated using this bundler. It should also be possible to build CKEditor using other bundlers (if they are configured properly), such as [Rollup](https://github.com/rollup/rollup) or [Browserify](http://browserify.org/), but these setups are not officially supported yet. Also, the [`@ckeditor/ckeditor5-dev-webpack-plugin`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-webpack-plugin) that allows to localize the editor is only available for webpack. More work on this subject will be done in the future.

Therefore, **a prerequisite to this guide is that you are using webpack as your build tool**.

## Scenario 1: Integrating existing builds

This is the simplest scenario. It assumes that you want to use {@link builds/guides/overview#available-builds one of the existing builds} "as-is" (you can, of course, still {@link builds/guides/integration/configuration configure the rich text editor}). It also gives the fastest build times.

First, install the build of your choice {@link builds/guides/integration/installation#npm from npm}:

```bash
npm install --save @ckeditor/ckeditor5-build-classic
```

Now, import the editor build into your code:

```js
// Using ES6 imports:
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Or CJS imports:
const ClassicEditor = require( '@ckeditor/ckeditor5-build-classic' );
```

And use it:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ) )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

Since you are using an already built editor (so a result of passing CKEditor 5 source through webpack), you do not need any additional webpack configuration. In this case CKEditor works as a ready-to-use library.

## Scenario 2: Building from source

This scenario allows you to fully control the building process of CKEditor. This means that you will not actually use the builds anymore, but instead build CKEditor from source directly into your project. This integration method gives you full control over which features will be included and how webpack will be configured.

<info-box>
	Similar results to what this method allows can be achieved by {@link builds/guides/development/custom-builds customizing an existing build} and integrating your custom build like in scenario 1. This will give faster build times (since CKEditor will be built once and committed), however, it requires maintaining a separate repository and installing the code from that repository into your project (e.g. by publishing a new npm package or using tools like [Lerna](https://github.com/lerna/lerna)). This makes it less convenient than the method described in this scenario.
</info-box>

First of all, you need to install source packages that you will use. If you base your integration on one of the existing builds, you can take them from that build's `package.json` file (see e.g. [classic build's `package.json`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-build-classic/package.json)). At this moment you can choose the editor creator and the features you want.

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

You can now configure webpack. There are a couple of things that you need to take care of when building CKEditor 5:

* Handling CSS files of the CKEditor theme. They are included in the CKEditor 5 sources using `import 'path/to/styles.css'` statements, so you need [proper loaders](https://webpack.js.org/loaders/).
* Similarly, you need to handle bundling SVG icons, which are also imported directly into the source. For that you need the [`raw-loader`](https://webpack.js.org/loaders/raw-loader/).
* Finally, to localize the editor you need to use the [`@ckeditor/ckeditor5-dev-webpack-plugin`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-webpack-plugin) webpack plugin.

The minimal configuration, assuming that you use the same methods of handling assets as CKEditor 5 builds, will look like this:

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

#### Webpack Encore

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

### Running the editor – method 1

You can now import all the needed plugins and the creator directly into your code and use it there. The easiest way to do so is to copy it from the `src/ckeditor.js` file available in every build repository.

```js
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
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

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.builtinPlugins = [
	EssentialsPlugin,
	UploadAdapterPlugin,
	AutoformatPlugin,
	BoldPlugin,
	ItalicPlugin,
	BlockQuotePlugin,
	EasyImagePlugin,
	HeadingPlugin,
	ImagePlugin,
	ImageCaptionPlugin,
	ImageStylePlugin,
	ImageToolbarPlugin,
	ImageUploadPlugin,
	LinkPlugin,
	ListPlugin,
	ParagraphPlugin
];

ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
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
	language: 'en'
};
```

This module will export an editor creator class which has all the plugins and configuration that you need already built-in. To use such editor, simply import that class and call the static `.create()` method like in all {@link builds/guides/integration/basic-api#creating-an-editor examples}.

```js
import ClassicEditor from './ckeditor';

ClassicEditor
	// Note that you do not have to specify the plugin and toolbar configuration — using defaults from the build.
	.create( document.querySelector( '#editor' ) )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

### Running the editor – method 2

The second variant how to run the editor is to use the creator class directly, without creating an intermediary subclass. The above code would translate to:

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

ClassicEditor
	.create( document.querySelector( '#editor'), {
		// The plugins are now passed directly to .create().
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

## Scenario 3: Using two different editors

The ability to use two or more types of rich text editors on one page is a common requirement. For instance, you may want to use the {@link builds/guides/overview#classic-editor classic editor} next to a couple of {@link builds/guides/overview#inline-editor inline editors}.

**Do not load two builds on one page.** This is a mistake which leads to:

* Code duplication. Both builds share up to 99% of the code, including CSS and SVGs. By loading them twice you make your page unnecessarily heavy.
* Duplicated CSS may lead to conflicts and, thus, broken UI of the editors.
* Translation repository gets duplicated entries which may cause loading incorrect strings with translations.

### Solutions

If you want to load two different editors on one page you need to make sure that they are built together (once). This can be achieved in at least two ways:

* [Integrating CKEditor 5 from source](#running-the-editor-method-2) directly into your application. Since you build you application once, the editors that you use will be built together, too.
* [Creating a "super build" of CKEditor 5](#creating-super-builds). Instead of creating a build which exports just one editor, you can create a build which exports two or more at the same time.

### Creating "super builds"

There is no limit for how many editor classes a single build can export. By default, the official builds export a single editor class only. However, they can easily import more.

You can start from forking (or copying) an existing build like in the {@link builds/guides/development/custom-builds "Creating custom builds"} guide. Let's say you forked and cloned the [`ckeditor5`](http://github.com/ckeditor /ckeditor5) repository and want to add {@link module:editor-inline/inlineeditor~InlineEditor} to the classic build:

```bash
git clone -b stable git@github.com:<your-username>/ckeditor5.git
cd ckeditor5/packages/ckeditor5-build-classic
npm install
```

Now it is time to add the missing editor package and install it:

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
yarn run build
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
