---
category: builds-integration
order: 40
---

# Advanced setup

The {@link builds/guides/integration/installation Installation} guide describes the easiest ways to run CKEditor builds in your project and the {@link builds/guides/development/custom-builds Custom builds} guide explains how to add or remove features from the build or change webpack configuration.

In this guide, we would like to show you ways to closer integrate CKEditor with your application. Thanks to that, you will be able to optimize the bundling process of your project and customize the builds in a more convenient way.

## Bundler

CKEditor 5 is currently built using [webpack](https://webpack.js.org) (>=2.x.x). All builds, examples and demos are generated using this bundler. It should also be possible to build CKEditor using other bundlers (if they are configured properly), such as [Rollup](https://github.com/rollup/rollup) or [Browserify](http://browserify.org/) but those setups are not officially supported yet. Also, the [`@ckeditor/ckeditor5-dev-webpack-plugin`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-webpack-plugin), which allows localizing the editor, is available only for webpack. More work on this subject will be done after v1.0.0.

Therefore, **the prerequisite to this guide is that you are using webpack as your build tool**.

## Scenario 1. Integrating existing builds

This is the simplest scenario. It assumes that you want to use {@link builds/guides/overview#Available-builds one of the existing builds} "as-is" (you can, of course, still {@link builds/guides/integration/configuration configure the editor}). It also gives the fastest build times.

<info-box>
	At the current stage, builds are only available in English. {@link features/ui-language Setting editor UI language} requires rebuilding the editor which means that this scenario is quite limited.
</info-box>

First, install the build of your choice {@link builds/guides/integration/installation#npm from npm}:

```bash
npm install --save @ckeditor/ckeditor5-build-classic
```

Now, simply import the editor build into your code:

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

Since you are using an already built editor (so a result of passing CKEditor 5's source through webpack), you don't need any additional webpack configuration. In this case CKEditor works as a ready-to-use library.

## Scenario 2. Building from source

This scenario allows you to fully control the building process of CKEditor. This means that you will not actually use the builds anymore, but instead build CKEditor from source directly into your project. Such an integration method gives you the full control of which features will be included and how webpack will be configured.

<info-box>
	Similar results to what this method allows can be achieved by {@link builds/guides/development/custom-builds customizing an existing build} and integrating your custom build like in scenario 1. That method will give faster build times (since CKEditor will be built once and committed), however, it requires maintaining a separate repository and installing the code from that repository in your project (e.g. by publishing a new npm package or using tools like [Lerna](https://github.com/lerna/lerna)). This makes it less convenient than the method described in this scenario.
</info-box>

First of all, you need to install source packages that you will use. If you base your integration on one of the existing builds you can take them from that build's `package.json` (see e.g. [classic build's `package.json`](https://github.com/ckeditor/ckeditor5-build-classic/tree/master/package.json)). At this moment you can choose the editor creator and features you want.

Copy these dependencies to your `package.json` and call `npm install` to install them. The `dependencies` (or `devDependencies`) section of `package.json` should look more or less like this:

```js
"dependencies": {
	// ...

    "@ckeditor/ckeditor5-editor-classic": "^0.8.0",
    "@ckeditor/ckeditor5-essentials": "^0.3.0",
    "@ckeditor/ckeditor5-autoformat": "^0.6.0",
    "@ckeditor/ckeditor5-basic-styles": "^0.9.0",
    "@ckeditor/ckeditor5-block-quote": "^0.2.0",
    "@ckeditor/ckeditor5-heading": "^0.10.0",
    "@ckeditor/ckeditor5-image": "^0.7.0",
    "@ckeditor/ckeditor5-link": "^0.8.0",
    "@ckeditor/ckeditor5-list": "^0.7.0",
    "@ckeditor/ckeditor5-paragraph": "^0.9.0"

    // ...
}
```

The second step is install dependencies needed to build the editor. The list may differ if you want to customize how the webpack config, but this is the typical setup:

```js
npm install --save \
	@ckeditor/ckeditor5-dev-webpack-plugin \
	css-loader  \
	node-sass \
	raw-loader \
	sass-loader \
	style-loader \
	webpack
```

You may also want to install [`babel-minify-webpack-plugin`](https://github.com/webpack-contrib/babel-minify-webpack-plugin) if you plan to minify ES6+ code.

### Webpack configuration

Now, you can configure webpack. There are couple of things which you need to take care of when building CKEditor:

* Handling SASS files of CKEditor's theme. They are included in the CKEditor source using `import 'path/to/theme.sass'` statements, so you need a [proper loaders](https://webpack.js.org/loaders/).
* Similarly, you need to handle bundling SVG icons, which are also imported directly into the source. For that you need the [`raw-loader`](https://webpack.js.org/loaders/raw-loader/).
* Finally, to localize the editor you need to use the [`@ckeditor/ckeditor5-dev-webpack-plugin`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-webpack-plugin) webpack plugin.

The minimal config, assuming that you use the same methods of handling assets as CKEditor builds, will look like this:

```js
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );

module.exports = {
	plugins: [
		// ...

		new CKEditorWebpackPlugin( {
			// See https://ckeditor5.github.io/docs/nightly/ckeditor5/latest/features/ui-language.html
			languages: [ 'pl' ]
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
				// Or /ckeditor5-[^/]+\/theme\/[^/]+\.scss$/ if you want to limit this loader
				// to CKEditor 5's theme only.
				test: /\.scss$/,

				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							minimize: true
						}
					},
					'sass-loader'
				]
			}
		]
	}
};
```

### Running the editor – method 1.

Now, you can import all the needed plugins and the creator directly to your code and use it there. The easiest way to do so is to copy it from the `src/ckeditor.js` file available in every build repository.

```js
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockquotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImagecaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImagestylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImagetoolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.build = {
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
	config: {
		toolbar: [
			'headings',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'undo',
			'redo'
		],
		image: {
			toolbar: [
				'imageStyleFull',
				'imageStyleSide',
				'|',
				'imageTextAlternative'
			]
		}
	}
};
```

Such a module will export an editor creator class which has all the plugins and configuration that you need already built in. To use such editor, simply import that class and call the static `.create()` method like in all {@link builds/guides/integration/basic-api#Creating-an-editor examples}.

### Running the editor – method 2.

The second variant how to run the editor is to use the creator class directly, without creating an intermediary subclass. The above code would translate to:

```js
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockquotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImagecaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImagestylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImagetoolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar';
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

		// So is the rest of the default config.
		toolbar: [
			'headings',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'undo',
			'redo'
		],
		image: {
			toolbar: [
				'imageStyleFull',
				'imageStyleSide',
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

Finally, you can build your app. Simply run webpack on your project and the editor will be a part of it.

### Option – extracting CSS

One of the most common requirements is to extract CKEditor's CSS to a separate file (it is included in the output JS file by default). To do that, you can use the [`extract-text-webpack-plugin`](https://www.npmjs.com/package/extract-text-webpack-plugin) plugin:

```bash
npm install --save extract-text-webpack-plugin
```

And add it to your webpack config:

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
				test: /\.scss$/,
				use: ExtractTextPlugin.extract( {
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								minimize: true
							}
						},
						'sass-loader'
					]
				} )
			}
		]
	}
};
```

Webpack will now create a separate file called `styles.css` which you will need to load manually in your HTML (using the `<link rel="stylesheet">` tag).
