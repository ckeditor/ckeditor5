---
category: alternative-setups
order: 15
modified_at: 2023-02-06
---
# Integrating from source using Vite

<info-box>
	Before you move on, remember that CKEditor 5 integration with Vite is still in the experimental phase. Most features available with webpack are available with Vite, but not all. Vite does not produce translation files, so you are limited to one language &ndash; English. Similarly, it does not build DLL-compatible files. You cannot create a DLL plugin like our package generator. Also, Vite process styles with other application styles. It causes an issue with Export to Word/PDF where styles are not automatically collected.
</info-box>

This scenario allows you to fully control the building process of CKEditor 5. This means that you will not actually use the builds anymore, but instead build CKEditor from source directly into your project. This integration method gives you full control over which features will be included and how Vite will be configured.

## Scaffolding Vite project

First of all, you need to initialize a Vite project. You can use an official scaffolding tool for this purpose.

<info-box>
	Vite requires Node.js version 14.18+, 16+. However, some templates require a higher Node.js version to work, please upgrade if your package manager warns about it.
</info-box>

The following command will initialize a basic Vite template inside the `ckeditor5-vite-example` folder.

```bash
npm create vite@latest ckeditor5-vite-example -- --template vanilla
```

<info-box>
	NPM 6 and below doesn't require an extra double-dash in the command above.
</info-box>


 ## Installing necessary dependencies

After initializing the project, you can start installing packages. Fundamentally, you need a list of three things before we start bundling:
* an editor base
* editor plugins
* editor theme

This example will use Classic Editor as an editor base and the default CKEditor 5 theme - lark. In terms of plugins, you can use whatever you want. If you need inspiration, you can base your integration on one of the existing builds. There is a list of packages in the [classic build's](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-build-classic/package.json) `package.json` file. But remember that all packages (excluding `@ckeditor/ckeditor5-dev-*`) must have the same version as the base editor package.

You can install packages individually like `npm install @ckeditor/ckeditor5-editor-classic`, or copy dependencies from the build repo and type `npm install`. The `dependencies` section of your `package.json` should look similar to this:

```js
"dependencies": {
	// Dependencies.
	// ...

    "@ckeditor/ckeditor5-autoformat": "^x.y.z",
    "@ckeditor/ckeditor5-basic-styles": "^x.y.z",
    "@ckeditor/ckeditor5-block-quote": "^x.y.z",
    "@ckeditor/ckeditor5-editor-classic": "^x.y.z",
    "@ckeditor/ckeditor5-essentials": "^x.y.z",
    "@ckeditor/ckeditor5-heading": "^x.y.z",
    "@ckeditor/ckeditor5-link": "^x.y.z",
    "@ckeditor/ckeditor5-list": "^x.y.z",
    "@ckeditor/ckeditor5-paragraph": "^x.y.z",
    "@ckeditor/ckeditor5-theme-lark": "^x.y.z",

    // More dependencies.
	// ...
}
```

## Vite configuration

When your editor has all the necessary plugins, you can move on to integration with Vite. There is also an official plugin for this purpose. It handles loading the SVG icons and styles from the packages and the theme package. You can install it via the below command.

```bash
npm install --save @ckeditor/vite-plugin-ckeditor5
```

The plugin is installed but will not work yet, so you need to add it to the Vite configuration. First, add the `vite.config.js` file at the root of your project (or use an existing one). Then, modify the file by adding the following lines of code.

```js
// vite.config.js
import { createRequire } from 'node:module';
const require = createRequire( import.meta.url );

import { defineConfig } from 'vite';
import ckeditor5 from '@ckeditor/vite-plugin-ckeditor5';

export default defineConfig( {
	plugins: [
		ckeditor5( { theme: require.resolve( '@ckeditor/ckeditor5-theme-lark' ) } )
	]
} );
```

Now your setup is complete, and you can run your application.

```bash
npm run dev
```

## Running the editor – method 1

You can now import all the needed plugins and configurations into your code. If you scaffolded your project using a Vite template, add `ckeditor.js` file at the root of your project. Then, modify the file by adding the following lines of code.

```js
// ckeditor.js

import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.builtinPlugins = [
    EssentialsPlugin,
    AutoformatPlugin,
    BoldPlugin,
    ItalicPlugin,
    BlockQuotePlugin,
    HeadingPlugin,
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
            'blockQuote',
            'undo',
            'redo'
        ]
    },
    language: 'en'
};
```

This module will export an editor creator class which has all the plugins and configurations that you need already built-in. To use such an editor, simply import that class and call the static `.create()` method like in all {@link installation/getting-started/editor-lifecycle#creating-an-editor-with-create examples}. If you scaffolded your project using a Vite template, replace the content of `main.js` with the following code:

```js
// main.js

import ClassicEditor from './ckeditor';

ClassicEditor
	// Note that you do not have to specify the plugin and toolbar configuration — using defaults from the build.
	.create( document.querySelector( '#app' ) )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

## Running the editor – method 2

The second variant of how to run the editor is to use the creator class directly, without creating an intermediary subclass. The above code would translate to:

```js
// main.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';

ClassicEditor
    .create( document.querySelector( '#app'), {
        // The plugins are now passed directly to .create().
        plugins: [
            EssentialsPlugin,
            AutoformatPlugin,
            BoldPlugin,
            ItalicPlugin,
            BlockQuotePlugin,
            HeadingPlugin,
            LinkPlugin,
            ListPlugin,
            ParagraphPlugin,
        ],

        // So is the rest of the default configuration.
        toolbar: [
            'heading',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            'blockQuote',
            'undo',
            'redo'
        ]
    } )
    .then( editor => {
        console.log( editor );
    } )
    .catch( error => {
        console.error( error );
    } );

```

## Building

Finally, you can build your application. Import the script with the editor into `index.html` if you didn't use the scaffolded template. Run Vite (by typing `npm run dev`) on your project and the rich-text editor will be a part of it.
