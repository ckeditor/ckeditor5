---
category: alternative-setups
menu-title: (Legacy) Integrating from source using Vite
meta-title: Integrating CKEditor 5 from source using Vite | Legacy CKEditor 5 documentation
order: 15
modified_at: 2023-02-06
---
# (Legacy) Integrating from source using Vite

<info-box warning>
	⚠️  We changed installation methods and this legacy guide is kept for users' convenience. If you want to learn more about these changes, please refer to the {@link updating/nim-migration/migration-to-new-installation-methods Migrating to new installation methods} guide.
</info-box>

This scenario allows you to fully control the building process of CKEditor&nbsp;5. This means that you will not actually use the builds anymore, but instead build CKEditor from source directly into your project. This integration method gives you full control over which features will be included and how Vite will be configured.

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
	npm 6 and below do not require an extra double-dash in the command above.
</info-box>

Select the appropriate Vite template to use TypeScript in your project.

```bash
npm create vite@latest ckeditor5-vite-example -- --template vanilla-ts
```

 ## Installing necessary dependencies

After initializing the project, you can start installing packages. Fundamentally, you need a list of three things before you start bundling:
* an editor base
* editor plugins
* editor theme

This example will use Classic Editor as an editor base and the default CKEditor&nbsp;5 theme, lark. In terms of plugins, you can use whatever you want. If you need inspiration, you can base your integration on one of the existing builds. There is a list of packages in the [classic build's](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-build-classic/package.json) `package.json` file. All packages (excluding `@ckeditor/ckeditor5-dev-*`) must have the same version as the base editor package.

You can install packages individually like `npm install @ckeditor/ckeditor5-editor-classic`, or copy dependencies from the build repository and type `npm install`. An example list of plugins may look like this:

```bash
npm install --save @ckeditor/ckeditor5-theme-lark \
  @ckeditor/ckeditor5-autoformat \
  @ckeditor/ckeditor5-basic-styles \
  @ckeditor/ckeditor5-block-quote \
  @ckeditor/ckeditor5-editor-classic \
  @ckeditor/ckeditor5-essentials \
  @ckeditor/ckeditor5-heading \
  @ckeditor/ckeditor5-link \
  @ckeditor/ckeditor5-list \
  @ckeditor/ckeditor5-paragraph
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

### JavaScript

You can now import all the needed plugins and configurations into your code. If you scaffolded your project using a Vite template, add the `ckeditor.js` file in the `src` folder. Then, modify the file by adding the following lines of code.

```js
// ckeditor.js

import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.builtinPlugins = [
    Essentials,
    Autoformat,
    Bold,
    Italic,
    BlockQuote,
    Heading,
    Link,
    List,
    Paragraph
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

This module will export an editor creator class which has all the plugins and configurations that you need already built-in. To use such an editor, simply import that class and call the static `.create()` method like in all {@link getting-started/setup/editor-lifecycle#creating-an-editor-with-create examples}. Then, replace the content of `main.js` with the following code:

```js
// main.js

import ClassicEditor from './src/ckeditor';

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

### TypeScript

If you scaffolded your project using a Vite template with TypeScript, add the `ckeditor.ts` file in the `src` folder. Then, modify the file by adding the following lines of code.

```ts
// ckeditor.ts

import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.builtinPlugins = [
    Essentials,
    Autoformat,
    Bold,
    Italic,
    BlockQuote,
    Heading,
    Link,
    List,
    Paragraph
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

Then, you can use the configured editor. Replace the content of `main.ts` with the following code.

```ts
// main.ts

import ClassicEditor from './src/ckeditor';

ClassicEditor
    // Note that you do not have to specify the plugin and toolbar configuration — using defaults from the build.
    .create( document.querySelector( '#app' ) as HTMLElement )
    .then( editor => {
        console.log( 'Editor was initialized', editor );
    } )
    .catch( error => {
        console.error( error.stack );
    } );
```

## Running the editor – method 2

### JavaScript

The second variant of how to run the editor is to use the creator class directly, without creating an intermediary subclass. The above code would translate to:

```js
// main.js

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

ClassicEditor
    .create( document.querySelector( '#app' ), {
        // The plugins are now passed directly to .create().
        plugins: [
            Essentials,
            Autoformat,
            Bold,
            Italic,
            BlockQuote,
            Heading,
            Link,
            List,
            Paragraph,
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

### TypeScript

You can also translate the above code using TypeScript.

```ts
// main.ts

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

ClassicEditor
    .create( document.querySelector( '#app') as HTMLElement, {
        // The plugins are now passed directly to .create().
        plugins: [
            Essentials,
            Autoformat,
            Bold,
            Italic,
            BlockQuote,
            Heading,
            Link,
            List,
            Paragraph,
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

Finally, you can build your application. Import the script with the editor into `index.html` if you did not use the scaffolded template. Run Vite (by typing `npm run dev`) on your project and the rich-text editor will be a part of it.
