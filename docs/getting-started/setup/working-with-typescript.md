---
# Scope:
# * Introduction to TypeScript in CKEditor&nbsp;5
# * List and clarify the things that need attention when using TypeScript.

category: setup
menu-title: TypeScript support
meta-title: TypeScript support | CKEditor 5 documentation
modified_at: 2024-02-22
order: 70
---

# TypeScript support in CKEditor&nbsp;5

CKEditor&nbsp;5 is built using TypeScript and has native type definitions. All the official packages distributed using NPM and CDN contain type definitions.

<info-box hint>
	Starting with the v37.0.0 release, CKEditor 5 has built-in type definitions. We build all the packages using TypeScript 5.0, however, the editor should also work with an older version, such as 4.9.

	Using TypeScript is just an option. If you do not need its features, you can continue using CKEditor&nbsp;5 in JavaScript.
</info-box>

## Why use CKEditor&nbsp;5 with TypeScript

Using TypeScript comes with some advantages:

* It helps produce clean and maintainable code
* It introduces code autocompletion and type suggestions for CKEditor&nbsp;5 APIs
* If you are developing custom plugins and using CKEditor&nbsp;5 Framework intensively, the TypeScript compiler will help you catch common type errors and increase the code quality

## CKEditor&nbsp;5 TypeScript setup

Running CKEditor&nbsp;5 does not differ much when using TypeScript compared to the JavaScript environment. You may consider using type assertion or type casting to satisfy the TypeScript compiler.

### Running the editor

Here is an example of the classic editor type initialization:

```ts
import { ClassicEditor } from 'ckeditor5'

const editorPlaceholder = document.querySelector( '#editor' ) as HTMLElement;

ClassicEditor.create( editorPlaceholder ).catch( error => {
	console.error( error );
} );
```

### Installing plugins

When using TypeScript you need to import all modules provided by CKEditor&nbsp;5 using a package entry point instead of a path to a module.

```ts
// Instead of:
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

// Do:
import { Bold } from 'ckeditor5';
```

This approach ensures that TypeScript correctly loads all module augmentation code necessary to make certain types work.

Here is an example of importing a plugin into the editor:

```ts
import { ClassicEditor, BlockQuote } from 'ckeditor5';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ BlockQuote, /* ... */ ],
	toolbar: [ 'blockQuote', /* ... */ ]
} )
.then( /* ... */ );
```

### Types for Angular, React, and Vue 3 components

The latest versions of our official components for Angular, React, and Vue 3 were migrated to TypeScript and use native CKEditor&nbsp;5's type definitions. You do not need to provide custom definitions anymore. You can use the following guides:

* {@link getting-started/integrations/angular Angular component}
* {@link getting-started/integrations/react React component}
* {@link getting-started/integrations/vuejs-v3 Vue.js 3+ component}

## Developing plugins using TypeScript

CKEditor&nbsp;5's API is extensive and complex, but using TypeScript can make it easier to work with.

You can use the {@link framework/development-tools/package-generator/typescript-package package generator} to scaffold TypeScript-based plugins.

You can easily include a custom plugin in your editor like this:

```ts
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { 
  ClassicEditor,
  Bold,
  Essentials,
  Heading,
  Italic,
  Paragraph,
  List,
  Plugin,
  ButtonView
} from 'ckeditor5';
import 'ckeditor5/dist/index.css';

class Timestamp extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'timestamp', () => {
			// The button will be an instance of ButtonView.
			const button = new ButtonView();

			button.set( {
				label: 'Timestamp',
				withText: true
			} );

			//Execute a callback function when the button is clicked
			button.on( 'execute', () => {
				const now = new Date();

				//Change the model using the model writer
				editor.model.change( writer => {

					//Insert the text at the user's current position
					editor.model.insertContent( writer.createText( now.toString() ) );
				} );
			} );

			return button;
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, Timestamp ],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', 'timestamp' ]
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

See the {@link tutorials/creating-simple-plugin-timestamp Creating a basic plugin} tutorial to learn how it was created.
