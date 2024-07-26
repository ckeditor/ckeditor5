---
category: installation-methods
menu-title: (Legacy) Customized installation
meta-title: Customized installation | Legacy CKEditor 5 documentation
order: 30
modified_at: 2022-03-15
---

# (Legacy) Customized installation

<info-box warning>
	⚠️  We changed installation methods and this legacy guide is kept for users' convenience. If you want to learn more about these changes, please refer to the {@link updating/nim-migration/customized-builds Migrating from customized builds} guide.
</info-box>

## Introduction

This guide will teach you how to run your own CKEditor&nbsp;5 instance. Below you can find two unique paths describing the installation process. Choose one (or both!) and start your CKEditor&nbsp;5 journey!

Available paths:

* [Online builder path](#creating-custom-builds-with-online-builder) &ndash; The most beginner-friendly and quickest path.
* [Building from the source path](#building-the-editor-from-source) &ndash; An advanced path including using `npm` and webpack.

## Creating custom builds with online builder

<info-box warning>
	The old online builder was deprecated in favour of the new [Builder](https://ckeditor.com/ckeditor-5/builder?redir=docs) with live preview and new installation methods setup. We encourage the {@link updating/nim-migration/customized-builds migration to the new methods}.
	If you still want to use the old setup, check the [updating packages](#updating-packages) section on how to update packages in the setup you have from the old online builder.
</info-box>

### Build anatomy

Every build contains the following files:

* `build/ckeditor.js` &ndash; The ready-to-use editor bundle, containing the editor and all plugins.
* `src/ckeditor.ts` &ndash; The source entry point of the build. Based on it the `build/ckeditor.js` file is created by [webpack](https://webpack.js.org). It defines the editor creator, the list of plugins, and the default configuration of a build.
* `sample/index.html` &ndash; The page where the editor script is attached.
* `webpack-config.js` &ndash; The webpack configuration used to build the editor.
* `tsconfig.json` &ndash; The configuration used by the TypeScript compiler.

To customize a build you need to:

* Install missing dependencies.
* Update the `src/ckeditor.ts` file.
* Update the build (the editor bundle in `build/`).

### Installing dependencies

First, you need to install dependencies that are already specified in the build's `package.json`:

```bash
npm install
```

Then, you can add missing dependencies (that is, packages you want to add to your build). The easiest way to do so is by typing:

```bash
npm install @ckeditor/ckeditor5-alignment
```

### Updating packages

1. Open the folder from the old online builder.
2. Open the `package.json` file.
3. Update all CKEditor packages in the `dependencies` (`@ckeditor/ckeditor5-*`) to the latest version. For example:
	```diff
	- "@ckeditor/ckeditor5-basic-styles": "39.0.2",
	+ "@ckeditor/ckeditor5-basic-styles": "42.0.0",
	```

	Make sure all packages have **the same version**, you will run into errors in the runtime otherwise.

5. Run `npm update` in the root dir.
6. Run `npm run build` in the root dir.

The updated build file is ready in `build/ckeditor.js`.

### Updating build configuration

If you installed or uninstalled dependencies, you need to modify the `src/ckeditor.ts` file too. At this stage, you should have a complete list of plugins for the bundle. You can also change the editor creator and specify the default editor configuration. For instance, your webpack entry file (`src/ckeditor.ts`) may look like this:

```ts
// The editor creator to use.
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import {
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload
} from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';



class Editor extends ClassicEditor {
	// Plugins to include in the build.
	public static override builtinPlugins = [
		Alignment,
		Autoformat,
		BlockQuote,
		Bold,
		CloudServices,
		Essentials,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		Indent,
		Italic,
		Link,
		List,
		MediaEmbed,
		Paragraph,
		PasteFromOffice,
		Table,
		TableToolbar,
		TextTransformation
	];

	public static override defaultConfig = {
		toolbar: {
			items: [
				'alignment',
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'imageUpload',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'undo',
				'redo'
			]
		},

		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'en',
		image: {
			toolbar: [
				'imageTextAlternative',
				'toggleImageCaption',
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	};
}

export default Editor;
```

### Rebuilding the bundle

After modifying the configuration or source code, you can rebuild the project to apply the changes. You most likely already have a build script in `package.json`. To run it, execute the following command:

```bash
npm run build
```

### Running the editor

You can validate whether your new build works by opening the `sample/index.html` file in a browser (via HTTP, not as a local file). Make sure to **clear the cache**.

## Building the editor from source

This scenario allows you to fully control the building process of CKEditor&nbsp;5. This means that you will not actually use the builds introduced in the previous path, but instead build CKEditor from source directly into your project. This integration method gives you full control over which features will be included and how webpack will be configured.

This is an advanced path that assumes that you are familiar with npm and that your project uses npm already. If not, see the [npm documentation](https://docs.npmjs.com/getting-started/what-is-npm) or call `npm init` in an empty directory and check the result.

### Setting up the environment

Before moving to the integration, you need to prepare three files that will be filled with code presented in this guide. Create the `webpack.config.js`, `app.js`, and `index.html` files.

Then, install the packages needed to build CKEditor&nbsp;5:

```bash
npm install --save \
	css-loader@5 \
	postcss-loader@4 \
	raw-loader@4 \
	style-loader@2 \
	webpack@5 \
	webpack-cli@4
```

The minimal webpack configuration needed to enable building CKEditor&nbsp;5 is:

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
	},

	// Useful for debugging.
	devtool: 'source-map',

	// By default webpack logs warnings if the bundle is bigger than 200kb.
	performance: { hints: false }
};
```

<info-box>
    If you cannot use the latest webpack (at the moment of writing this guide, it is 5), the provided configuration will also work with webpack 4. There is also a whole guide dedicated to {@link getting-started/advanced/integrating-from-source-vite Integration from source using Vite}.
</info-box>

### Creating an editor

You can now install some of the CKEditor&nbsp;5 Framework packages which will allow you to initialize a simple rich-text editor. Keep in mind, however, that all packages (excluding `@ckeditor/ckeditor5-dev-*`) must have the same version as the base editor package.

You can start with the {@link examples/builds/classic-editor classic editor} with a small set of features.

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
	This guide is using the ES6 modules syntax. If you are not familiar with it, check out [this article](http://exploringjs.com/es6/ch_modules.html).
</info-box>

<info-box warning>
	In this guide, the editor class is used directly, so you use `@ckeditor/ckeditor5-editor-classic` instead of `@ckeditor/ckeditor5-build-classic`.

	No {@link getting-started/legacy-getting-started/predefined-builds predefined editor builds} are used, because adding new plugins to these requires rebuilding them anyway.
</info-box>

```js
// app.js

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

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
	Use `webpack --mode production` if you want to build a minified and optimized application. Learn more about it in the [webpack documentation](https://webpack.js.org/concepts/mode/).

	**Note:** Prior to version 1.2.7, `uglifyjs-webpack-plugin` (the default minifier used by webpack) had a bug that caused webpack to crash with the following error: `TypeError: Assignment to constant variable`. If you experienced this error, make sure that your `node_modules` contain an up-to-date version of this package (and that webpack uses this version).

	**Note:** CKEditor&nbsp;5 builds use [`Terser`](https://github.com/terser/terser) instead of `uglifyjs-webpack-plugin` because [the latter one seems to no longer be supported](https://github.com/ckeditor/ckeditor5/issues/1353).
</info-box>

If everything worked, you should see:

```
p@m /workspace/quick-start> ./node_modules/.bin/webpack --mode development
Hash: c96beab038124d61568f
Version: webpack 5.58.1
Time: 3023ms
Built at: 2022-03-02 17:37:38
        Asset      Size  Chunks             Chunk Names
    bundle.js  2.45 MiB    main  [emitted]  main
bundle.js.map  2.39 MiB    main  [emitted]  main
[./app.js] 638 bytes {main} [built]
[./node_modules/webpack/buildin/global.js] (webpack)/buildin/global.js 489 bytes {main} [built]
[./node_modules/webpack/buildin/harmony-module.js] (webpack)/buildin/harmony-module.js 573 bytes {main} [built]
    + 491 hidden modules
```

### Running the editor

Finally, it is time to create an HTML page:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>CKEditor 5 Quick start guide</title>
	</head>
	<body>
		<div id="editor">
			<p>The editor content goes here.</p>
		</div>

		<script src="dist/bundle.js"></script>
	</body>
</html>
```

Open this page in your browser and you should see the simple WYSIWYG editor up and running. Make sure to check the browser console in case anything seems wrong.

{@img assets/img/framework-quick-start-classic-editor.png 976 Screenshot of CKEditor&nbsp;5 classic editor with bold and italic features.}

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and more.
</info-box>
