---
category: alternative-setups
order: 10
---
# Integrating from source using webpack

<info-box>
	CKEditor 5 is currently built using [webpack@5](https://webpack.js.org/). All builds, examples and demos are generated using this bundler. It should also be possible to build CKEditor 5 using other bundlers (if they are configured properly), such as [Rollup](https://github.com/rollup/rollup) or [Browserify](http://browserify.org/), but these setups are not officially supported yet. However, there is integration for {@link installation/advanced/integrating-from-source-vite Vite}. It is still in an experimental phase and supports a limited number of features. For example, the [`@ckeditor/ckeditor5-dev-translations`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-translations) that allows to localize the editor is only available for webpack. More work on this subject will be done in the future.

	Therefore, a prerequisite to this guide is that you are using webpack as your build tool.
</info-box>

This scenario allows you to fully control the building process of CKEditor 5. This means that you will not actually use the builds anymore, but instead build CKEditor from source directly into your project. This integration method gives you full control over which features will be included and how webpack will be configured.

<info-box>
	Similar results to what this method allows can be achieved by {@link installation/getting-started/quick-start-other#building-the-editor-from-source customizing an existing build} and integrating your custom build. This will give faster build times (since CKEditor 5 will be built once and committed), however, it requires maintaining a separate repository and installing the code from that repository into your project (e.g. by publishing a new npm package or using tools like [Lerna](https://github.com/lerna/lerna)). This makes it less convenient than the method described in this scenario.
</info-box>

First of all, you need to install source packages that you will use. If you base your integration on one of the existing builds, you can take them from that build's `package.json` file (see e.g. [classic build's `package.json`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-build-classic/package.json)). At this moment you can choose the editor creator and the features you want. Keep in mind, however, that all packages (excluding `@ckeditor/ckeditor5-dev-*`) {@link installation/plugins/installing-plugins#requirements must have the same version as the base editor package}.

Copy these dependencies to your `package.json` and call `npm install` to install them. The `dependencies` (or `devDependencies`) section of `package.json` should look more or less like this:

```js
"dependencies": {
	// More dependencies.
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

    // More dependencies.
	// ...
}
```

The second step is to install dependencies needed to build the editor. The list may differ if you want to customize the webpack configuration, but this is a typical setup:

```bash
npm install --save \
	@ckeditor/ckeditor5-dev-translations \
	@ckeditor/ckeditor5-dev-utils \
	css-loader@5 \
	postcss-loader@4 \
	raw-loader@4 \
	style-loader@2 \
	webpack@5 \
	webpack-cli@4
```

## Webpack configuration

You can now configure webpack. There are a couple of things that you need to take care of when building CKEditor 5:

* Handling CSS files of the CKEditor theme. They are included in the CKEditor 5 sources using `import 'path/to/styles.css'` statements, so you need [proper loaders](https://webpack.js.org/loaders/).
* Similarly, you need to handle bundling SVG icons, which are also imported directly into the source. For that you need the [`raw-loader`](https://webpack.js.org/loaders/raw-loader/).
* Finally, to localize the editor you need to use the [`@ckeditor/ckeditor5-dev-translations`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-translations) webpack plugin.

The minimal configuration, assuming that you use the same methods of handling assets as CKEditor 5 builds, will look like this:

```js
const { CKEditorTranslationsPlugin } = require( '@ckeditor/ckeditor5-dev-translations' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
	plugins: [
		// More plugins.
		// ...

		new CKEditorTranslationsPlugin( {
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
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: styles.getPostCssConfig( {
								themeImporter: {
									themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
								},
								minify: true
							} )
						}
					}
				]
			}
		]
	}
};
```

<info-box>
    If you cannot use the latest webpack (at the moment of writing this guide, it is 5), the provided configuration will also work with webpack 4.
</info-box>

#### Webpack Encore

If you use [Webpack Encore](https://github.com/symfony/webpack-encore), you can use the following configuration:

```js
const { CKEditorTranslationsPlugin } = require( '@ckeditor/ckeditor5-dev-translations' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

Encore.
	// Your configuration.
	// ...

	.addPlugin( new CKEditorTranslationsPlugin( {
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
		options: {
			postcssOptions: styles.getPostCssConfig( {
				themeImporter: {
					themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
				},
				minify: true
			} )
		}
	} )
```

## Running the editor – method 1

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
			'uploadImage',
			'blockQuote',
			'undo',
			'redo'
		]
	},
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			'|',
			'toggleImageCaption',
			'imageTextAlternative'
		]
	},
	language: 'en'
};
```

This module will export an editor creator class which has all the plugins and configuration that you need already built-in. To use such editor, simply import that class and call the static `.create()` method like in all {@link installation/getting-started/editor-lifecycle#creating-an-editor-with-create examples}.

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

## Running the editor – method 2

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
			'uploadImage',
			'blockQuote',
			'undo',
			'redo'
		],
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
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

## Building

Finally, you can build your application. Run webpack on your project and the rich-text editor will be a part of it.

## Option: Minifying JavaScript

Webpack 4 introduced the [concept of modes](https://webpack.js.org/concepts/mode/). It comes with two predefined modes: `development` and `production`. The latter automatically enables [`uglifyjs-webpack-plugin`](https://www.npmjs.com/package/uglifyjs-webpack-plugin) which takes care of JavaScript minification. Therefore, it is enough to execute `webpack` with the `--mode production` option or set `mode: 'production'` in your `webpack.config.js` to optimize the build.

<info-box>
	Prior to version 1.2.7 `uglifyjs-webpack-plugin` had a bug which caused webpack to crash with the following error: `TypeError: Assignment to constant variable`. If you experienced this error, make sure that your `node_modules` contains an up-to-date version of this package (and that webpack uses this version).

	CKEditor 5 builds use [`Terser`](https://github.com/terser/terser) instead of `uglifyjs-webpack-plugin` because [the latter one is not supported anymore](https://github.com/ckeditor/ckeditor5/issues/1353).
</info-box>

## Option: Extracting CSS

One of the most common requirements is to extract CKEditor 5 CSS to a separate file (by default it is included in the output JavaScript file). To do that, you can use [`mini-css-extract-plugin`](https://www.npmjs.com/package/mini-css-extract-plugin):

```bash
npm install --save \
	mini-css-extract-plugin \
	css-loader@5
```

And add it to your webpack configuration:

```js
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

module.exports = {
	// More configuration. 
	// ...

	plugins: [
		// More plugins.
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
						options: {
							postcssOptions: styles.getPostCssConfig( {
								themeImporter: {
									themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
								},
								minify: true
							} )
						}
					}
				]
			}
		]
	}
};
```

Webpack will now create a separate file called `styles.css` which you will need to load manually into your HTML (using the `<link rel="stylesheet">` tag).

## Option: Building to ES5 target

CKEditor 5 is written in ECMAScript 2015 (also called ES6). All browsers in which CKEditor 5 is {@link support/browser-compatibility currently supported} have sufficient ES6 support to run CKEditor 5. Thanks to that, CKEditor 5 builds are also published in the original ES6 format.

However, it may happen that your environment requires ES5. For instance, if you use tools like the original [UglifyJS](https://github.com/mishoo/UglifyJS) which do not support ES6+ yet, you may need to transpile CKEditor 5 source to ES5. This will create ~80% bigger builds but will ensure that your environment can process CKEditor 5 code.

In order to create an ES5 build of CKEditor 5 you can use [Babel](https://babeljs.io/):

```bash
npm install --save babel-loader @babel/core @babel/preset-env regenerator-runtime
```

Then, add this item to webpack [`module.rules`](https://webpack.js.org/configuration/module/#module-rules) section:

```js
module: {
	rules: [
		{
			// Match files from the `ckeditor5` package but also `ckeditor5-*` packages.
			test: /(ckeditor5(?:-[^\/\\]+)?)[\/\\].+\.js$/,
			use: [
				{
					loader: 'babel-loader',
					options: {
						presets: [ require( '@babel/preset-env' ) ]
					}
				}
			]
		},
		// More rules.
		// ...
	]
}
```

And load [`regenerator-runtime`](https://www.npmjs.com/package/regenerator-runtime) (needed to make ES6 generators work after transpilation) by adding it as the first [entry point](https://webpack.js.org/configuration/entry-context/#entry):

```js
entry: [
	require.resolve( 'regenerator-runtime/runtime.js' ),

	// Your entries.
	// ...
]
```

<info-box>
	This setup ensures that the source code is transpiled to ES5. However, it does not ensure that all ES6 polyfills are loaded. Therefore, if you would like to, for example, give [bringing IE11 compatibility](https://github.com/ckeditor/ckeditor5/issues/330) a try, make sure to also load [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/).
</info-box>

<info-box>
	The [`babel-preset-env`](https://github.com/babel/babel-preset-env) package lets you choose the environment that you want to support and transpiles ES6+ features to match that environment's capabilities. Without configuration it will produce ES5 builds.
</info-box>
