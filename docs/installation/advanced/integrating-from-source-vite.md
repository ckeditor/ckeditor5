---
category: alternative-setups
order: 15
---
# Integrating from source using Vite

<info-box>
	Before you move on, remember that CKEditor 5 integration with Vite is still in the experimental phase. Most features available with Webpack are available with Vite, but not all. Vite does not produce translation files, so you're limited to one language - English. Similarly, it does not build DLL-compatible files. You can't create a DLL plugin like our package generator. Also, Vite process styles with other application styles. It causes an issue with Export to Word/PDF where styles are not automatically collected.
</info-box>

This scenario allows you to fully control the building process of CKEditor 5. This means that you will not actually use the builds anymore, but instead build CKEditor from source directly into your project. This integration method gives you full control over which features will be included and how Vite will be configured.

## Scaffolding Vite project

First of all, you need to initialize a Vite project. You can use an official scaffolding tool for this purpose.

<info-box>
	Vite requires Node.js version 14.18+, 16+. However, some templates require a higher Node.js version to work, please upgrade if your package manager warns about it.
</info-box>

The following command will initialize a basic Vite template inside the `ckeditor5-vite-example` folder.

```bash
# npm 6.x
npm create vite@latest ckeditor5-vite-example --template vanilla

# npm 7+, extra double-dash is needed
npm create vite@latest ckeditor5-vite-example -- --template vanilla
```
 
 ## Installing necessary dependencies

After initializing the project, you can start installing packages. Fundamentally, you need three things: an editor base, editor plugins, and a Vite plugin for CKEditor. This example will use Classic Editor. In terms of plugins, you can use whatever you want. If you need inspiration, you can base your integration on one of the existing builds. There is a list of packages in the [classic build's](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-build-classic/package.json) `package.json` file. But remember that all packages (excluding `@ckeditor/ckeditor5-dev-*`) must have the same version as the base editor package.

You can install packages using npm like `npm install @ckeditor/ckeditor5-editor-classic`, or copy dependencies from the build repo and typing `npm install`. The `dependencies` section of your `package.json` should look similar to this:

```js
"dependencies": {
	// Dependencies.
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

## Vite configuration

When your editor has all the necessary plugins, you can move on to integration with Vite. There is also an official plugin for this purpose. It handles loading the SVG icons and styles from the packages and the theme package. You can install it via the below command.

```js
npm install --save @ckeditor/ckeditor5-vite-plugin
```

The plugin is installed but won't work yet, so you need to add it to the Vite configuration. First, add the `vite.config.js` file at the root of your project (or use an existing one). Then, modify the file by adding the following lines of code.

```js
// vite.config.js

import { defineConfig } from 'vite';
import ckeditor5 from '@ckeditor/vite-plugin-ckeditor5';

export default defineConfig( {
	plugins: [
		ckeditor5( { theme: require.resolve( '@ckeditor/ckeditor5-theme-lark' ) } )
	]
} );
```

The configuration slightly differs for ESM projects. If you try to start the dev server using the `npm run dev` command, you may encounter an error: `require.resolve is not a function`. In this case, you need some additional lines of code.

```js
// vite.config.js

import { createRequire } from 'node:module';
const require = createRequire( import.meta.url );
```

Now your setup is complete, and you can start using the editor.

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

Finally, you can build your application. Import script with the editor into `index.html`. Run Vite (by typing `npm run dev`) on your project and the rich-text editor will be a part of it.