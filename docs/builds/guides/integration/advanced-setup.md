---
category: builds-integration
order: 40
---

# Advanced setup

The {@link builds/guides/integration/installation Installation} guide describes the easiest ways to run CKEditor builds in your project and the {@link builds/guides/development/custom-builds Custom builds} guide explains how to add or remove features from the build or change webpack configuration.

In this guide, we would like to show you ways to closer integrate CKEditor with your application. Thanks to that, you will be able to optimize the bundling process of your project and customize the builds in a more convenient way.

## Requirements

In order to start developing CKEditor 5 you will require:

* [Node.js](https://nodejs.org/en/) >= 6.0.0
* npm 4.x (**note:** using npm 5 [causes](https://github.com/lerna/lerna/issues/938) some [problems](https://github.com/npm/npm/issues/16991))
* [Git](https://git-scm.com/)

## Bundler

CKEditor 5 is currently built using [webpack](https://webpack.js.org) (>=4.x.x). All builds, examples and demos are generated using this bundler. It should also be possible to build CKEditor using other bundlers (if they are configured properly), such as [Rollup](https://github.com/rollup/rollup) or [Browserify](http://browserify.org/), but these setups are not officially supported yet. Also, the [`@ckeditor/ckeditor5-dev-webpack-plugin`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-webpack-plugin) that allows to localize the editor is only available for webpack. More work on this subject will be done after v1.0.0.

Therefore, **a prerequisite to this guide is that you are using webpack as your build tool**.

## Scenario 1: Integrating existing builds

This is the simplest scenario. It assumes that you want to use {@link builds/guides/overview#available-builds one of the existing builds} "as-is" (you can, of course, still {@link builds/guides/integration/configuration configure the editor}). It also gives the fastest build times.

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

Since you are using an already built editor (so a result of passing CKEditor 5's source through webpack), you do not need any additional webpack configuration. In this case CKEditor works as a ready-to-use library.

## Scenario 2: Building from source

This scenario allows you to fully control the building process of CKEditor. This means that you will not actually use the builds anymore, but instead build CKEditor from source directly into your project. This integration method gives you full control over which features will be included and how webpack will be configured.

<info-box>
	Similar results to what this method allows can be achieved by {@link builds/guides/development/custom-builds customizing an existing build} and integrating your custom build like in scenario 1. This will give faster build times (since CKEditor will be built once and committed), however, it requires maintaining a separate repository and installing the code from that repository into your project (e.g. by publishing a new npm package or using tools like [Lerna](https://github.com/lerna/lerna)). This makes it less convenient than the method described in this scenario.
</info-box>

First of all, you need to install source packages that you will use. If you base your integration on one of the existing builds, you can take them from that build's `package.json` file (see e.g. [classic build's `package.json`](https://github.com/ckeditor/ckeditor5-build-classic/tree/master/package.json)). At this moment you can choose the editor creator and the features you want.

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
	postcss-loader \
	raw-loader \
	style-loader \
	webpack@^4.12.2 \
	webpack-cli@^3.0.8 \
```

You may also want to install [`babel-minify-webpack-plugin`](https://github.com/webpack-contrib/babel-minify-webpack-plugin) if you plan to minify ES6+ code.

### Webpack configuration

You can now configure webpack. There are a couple of things that you need to take care of when building CKEditor:

* Handling CSS files of the CKEditor theme. They are included in the CKEditor sources using `import 'path/to/styles.css'` statements, so you need [proper loaders](https://webpack.js.org/loaders/).
* Similarly, you need to handle bundling SVG icons, which are also imported directly into the source. For that you need the [`raw-loader`](https://webpack.js.org/loaders/raw-loader/).
* Finally, to localize the editor you need to use the [`@ckeditor/ckeditor5-dev-webpack-plugin`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-webpack-plugin) webpack plugin.

The minimal configuration, assuming that you use the same methods of handling assets as CKEditor builds, will look like this:

```js
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
	plugins: [
		// ...

		new CKEditorWebpackPlugin( {
			// See https://docs.ckeditor.com/ckeditor5/latest/features/ui-language.html
			language: 'pl'
		} )
	],

	module: {
		rules: [
			{
				// Or /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg$/ if you want to limit this loader
				// to CKEditor 5 icons only.
				test: /\.svg$/,

				use: [ 'raw-loader' ]
			},
			{
				// Or /ckeditor5-[^/]+\/theme\/[\w-/]+\.css$/ if you want to limit this loader
				// to CKEditor 5 theme only.
				test: /\.css$/,
				use: [
					{
						loader: 'style-loader',
						options: {
							singleton: true
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

### Running the editor – method 1

You can now import all the needed plugins and the creator directly into your code and use it there. The easiest way to do so is to copy it from the `src/ckeditor.js` file available in every build repository.

```js
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadadapterPlugin from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockquotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import EasyimagePlugin from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImagecaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImagestylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImagetoolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageuploadPlugin from '@ckeditor/ckeditor5-image/src/imageupload';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.build = {
	plugins: [
		EssentialsPlugin,
		UploadadapterPlugin,
		AutoformatPlugin,
		BoldPlugin,
		ItalicPlugin,
		BlockquotePlugin,
		EasyimagePlugin,
		HeadingPlugin,
		ImagePlugin,
		ImagecaptionPlugin,
		ImagestylePlugin,
		ImagetoolbarPlugin,
		ImageuploadPlugin,
		LinkPlugin,
		ListPlugin,
		ParagraphPlugin
	],
	config: {
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
	}
};

```

This module will export an editor creator class which has all the plugins and configuration that you need already built-in. To use such editor, simply import that class and call the static `.create()` method like in all {@link builds/guides/integration/basic-api#creating-an-editor examples}.

```js
import ClassicEditor from './ckeditor';

ClassicEditor
	// Note that you do not have to specify the plugin and toolbar configuraiton — using defaults from the build.
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
import UploadadapterPlugin from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockquotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import EasyimagePlugin from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImagecaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImagestylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImagetoolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageuploadPlugin from '@ckeditor/ckeditor5-image/src/imageupload';
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
			BlockquotePlugin,
			HeadingPlugin,
			ImagePlugin,
			ImagecaptionPlugin,
			ImagestylePlugin,
			ImagetoolbarPlugin,
			LinkPlugin,
			ListPlugin,
			ParagraphPlugin
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

Finally, you can build your application. Run webpack on your project and the editor will be a part of it.

### Option: Extracting CSS

One of the most common requirements is to extract CKEditor's CSS to a separate file (by default it is included in the output JavaScript file). To do that, you can use the [`extract-text-webpack-plugin`](https://www.npmjs.com/package/extract-text-webpack-plugin) plugin:

```bash
npm install --save extract-text-webpack-plugin
```

And add it to your webpack configuration:

```js
const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );

module.exports = {
	// ...

	plugins: [
		// ...

		new ExtractTextPlugin( 'styles.css' )
	],

	module: {
		rules: [
			{
				test: /\.svg$/,
				use: [ 'raw-loader' ]
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract( {
					fallback: 'style-loader',
					use: [
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
				} )
			}
		]
	}
};
```

Webpack will now create a separate file called `styles.css` which you will need to load manually into your HTML (using the `<link rel="stylesheet">` tag).

### Option: Building to ES5 target

CKEditor 5 is written in ECMAScript 2015 (also called ES6). All browsers in which CKEditor 5 is {@link builds/guides/support/browser-compatibility currently supported} have sufficient ES6 support to run CKEditor 5. Thanks to that, CKEditor 5 Builds are also published in the original ES6 format.

However, it may happen that your environment requires ES5. For instance, if you use tools like [UglifyJS](https://github.com/mishoo/UglifyJS) which do not support ES6+ yet, you may need to transpile CKEditor 5 source to ES5. This will create ~80% bigger builds but will ensure that your environment can process CKEditor 5 code.

In order to create an ES5 build of CKEditor 5 you can use [Babel](https://babeljs.io/):

```bash
npm install --save babel-loader babel-core babel-preset-env regenerator-runtime
```

Then, add this item to webpack [`module.rules`](https://webpack.js.org/configuration/module/#module-rules) section:

```js
module: {
	rules: [
		{
			test: /\.js$/,
			use: [
				{
					loader: 'babel-loader',
					options: {
						presets: [ require( 'babel-preset-env' ) ]
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
