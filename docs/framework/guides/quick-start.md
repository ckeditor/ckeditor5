---
category: framework-guides
order: 20
---

# Quick start

This guide will show you how to initialize CKEditor 5 rich-text editor from source.

## How to install the framework?

The CKEditor 5 Framework is made of several [npm packages](https://npmjs.com). To install it you need:

* [Node.js](https://nodejs.org/en/) 8.0.0+
* npm 5.0.0+

## Let's start!

This guide assumes that you are familiar with npm and your project uses npm already. If not, see the [npm documentation](https://docs.npmjs.com/getting-started/what-is-npm) or call `npm init` in an empty directory and keep your fingers crossed.

First, install packages needed to build CKEditor 5:

```bash
npm install --save \
	postcss-loader@3 \
	raw-loader@3 \
	style-loader@1 \
	webpack@4 \
	webpack-cli@3
```

The minimal webpack configuration needed to enable building CKEditor 5 is:

```js
// webpack.config.js

'use strict';

const path = require( 'path' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
	// https://webpack.js.org/configuration/entry-context/
	entry: './app.js',

	// https://webpack.js.org/configuration/output/
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'bundle.js'
	},

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
					}
				]
			}
		]
	},

	// Useful for debugging.
	devtool: 'source-map',

	// By default webpack logs warnings if the bundle is bigger than 200kb.
	performance: { hints: false }
};
```

## Creating an editor

You can now install some of the CKEditor 5 Framework packages which will allow you to initialize a simple rich-text editor. You can start with the {@link examples/builds/classic-editor classic editor} with a small set of features.

```bash
npm install --save \
	@ckeditor/ckeditor5-dev-utils \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-paragraph \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-theme-lark
```

Based on these packages you can create a simple application.

<info-box>
	This guide is using the ES6 modules syntax. If you are not familiar with it, check out this [article](http://exploringjs.com/es6/ch_modules.html).
</info-box>

<info-box warning>
	Note that in this guide the editor class is used directly (i.e. we use `@ckeditor/ckeditor5-editor-classic` instead of `@ckeditor/ckeditor5-build-classic`).

	No {@link builds/guides/overview editor builds} are used because adding new plugins to them requires rebuilding them anyway. This can be done by {@link builds/guides/integration/installing-plugins customizing a build} or by including CKEditor 5 source into your application (like in this guide).
</info-box>

```js
// app.js

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

You can now run webpack to build the application. To do that, call the `webpack` executable:

```bash
./node_modules/.bin/webpack --mode development
```

You can also install `webpack-cli` globally (using `npm install -g`) and run it via a globally available `webpack`.

Alternatively, you can add it as an [npm script](https://docs.npmjs.com/misc/scripts):

```js
"scripts": {
	"build": "webpack --mode development"
}
```

And use it with:

```bash
yarn run build
```

npm adds `./node_modules/.bin/` to the `PATH` automatically, so in this case you do not need to install `webpack-cli` globally.

<info-box>
	Use `webpack --mode production` if you want to build a minified and optimized application. See more in the [webpack documentation](https://webpack.js.org/concepts/mode/).

	**Note:** Prior to version 1.2.7, `uglifyjs-webpack-plugin` (the default minifier used by webpack) had a bug which caused webpack to crash with the following error: `TypeError: Assignment to constant variable.`. If you experienced this error, make sure that your `node_modules` contains an up-to-date version of this package (and that webpack uses this version).

	**Note:** CKEditor 5 Builds use [`Terser`](https://github.com/terser/terser) instead of `uglifyjs-webpack-plugin` because [the later one seems to be unsupported anymore](https://github.com/ckeditor/ckeditor5/issues/1353).
</info-box>

If everything worked correctly, you should see:

```
p@m /workspace/quick-start> ./node_modules/.bin/webpack --mode development
Hash: c96beab038124d61568f
Version: webpack 4.15.1
Time: 3023ms
Built at: 2018-07-05 17:37:38
        Asset      Size  Chunks             Chunk Names
    bundle.js  2.45 MiB    main  [emitted]  main
bundle.js.map  2.39 MiB    main  [emitted]  main
[./app.js] 638 bytes {main} [built]
[./node_modules/webpack/buildin/global.js] (webpack)/buildin/global.js 489 bytes {main} [built]
[./node_modules/webpack/buildin/harmony-module.js] (webpack)/buildin/harmony-module.js 573 bytes {main} [built]
    + 491 hidden modules
```

## Running the editor

Finally, it is time to create an HTML page:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>CKEditor 5 Framework – Quick start</title>
	</head>
	<body>
		<div id="editor">
			<p>Editor content goes here.</p>
		</div>

		<script src="dist/bundle.js"></script>
	</body>
</html>
```

Open this page in your browser and you should see the simple WYSIWYG editor up and running. Make sure to check the browser console in case anything seems wrong.

{@img assets/img/framework-quick-start-classic-editor.png 976 Screenshot of CKEditor 5 classic editor with bold and italic features.}

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## What's next?

If you finished this guide, you should definitely check out the {@link framework/guides/creating-simple-plugin Creating a simple plugin} guide that will teach you some basics of developing features in the CKEditor 5 ecosystem.

If you are more into reading about the CKEditor 5 architecture, check out the {@link framework/guides/architecture/intro Introduction to CKEditor 5 architecture}.
