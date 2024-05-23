---
# Scope:
# * Introduction to TypeScript in CKEditor&nbsp;5
# * List and clarify the things that need attention when using TypeScript.

category: setup
menu-title: TypeScript support
meta-title: TypeScript support | CKEditor 5 documentation
modified_at: 2024-05-06
order: 80
---

# TypeScript support in CKEditor&nbsp;5

CKEditor&nbsp;5 is built using TypeScript and has native type definitions. All the official packages distributed using npm contain type definitions.

<info-box hint>
	We build all the packages using TypeScript 5.0, however, the editor should also work with an older version, such as 4.9. TypeScript is not following semantic versioning, so test your code accordingly.

	Using TypeScript is just an option. If you do not need its features, you can continue using CKEditor&nbsp;5 in JavaScript.
</info-box>

## Why use CKEditor&nbsp;5 with TypeScript

Using TypeScript comes with some advantages:

* It helps produce clean and maintainable code.
* It introduces code autocompletion and type suggestions for CKEditor&nbsp;5 APIs.
* If you are developing custom plugins and using CKEditor&nbsp;5 Framework intensively, the TypeScript compiler will help you catch common type errors and increase the code quality.

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

### Types for Angular, React, and Vue 3 components

The latest versions of our official components for Angular, React, and Vue 3 were migrated to TypeScript and use native CKEditor&nbsp;5's type definitions. You do not need to provide custom definitions anymore. You can use the following guides:

* {@link getting-started/integrations/angular Angular component}
* {@link getting-started/integrations/react React component}
* {@link getting-started/integrations/vuejs-v3 Vue.js 3+ component}

## Developing plugins with TypeScript

CKEditor&nbsp;5's API is extensive and complex, but using TypeScript can make it easier to work with.

You can use the {@link framework/development-tools/package-generator/typescript-package package generator} to scaffold TypeScript-based plugins.

Writing a simple plugin will be similar to writing it in vanilla JavaScript, but you need to add [TypeScript augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) to give the compiler additional information about your plugin.

Depending on your plugin, augment the following interfaces:

* {@link module:core/editor/editorconfig~EditorConfig}, which informs that a new plugin extends the configuration.
* {@link module:core/plugincollection~PluginsMap}, which informs that an additional plugin is available; useful when using `editor.plugins.get(&nbsp;'...'&nbsp;)`.
* {@link module:core/commandcollection~CommandsMap}, which informs that an additional command is available; useful when using `editor.commands.get(&nbsp;'...'&nbsp;)`.

The augmentation can be placed in a file with your editor setup. You can also create a separate file, for example `augmentation.ts`, and import it.

The following is an example from our {@link tutorials/creating-simple-plugin-timestamp Creating a basic plugin} tutorial to which we added a UTC configuration option.

```ts
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
import 'ckeditor5/index.css';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {
		timestamp?: { utc: boolean };
	}

	interface PluginsMap {
		[ Timestamp.pluginName ]: Timestamp;
	}
}

class Timestamp extends Plugin {
	public static get pluginName() {
		return 'Timestamp' as const;
	}

	public init(): void {
		const editor = this.editor;

		const utc = editor.config.get( 'timestamp.utc' );

		editor.ui.componentFactory.add( 'timestamp', () => {
			const button = new ButtonView();

			button.set( {
				label: 'Timestamp',
				withText: true
			} );

			button.on( 'execute', () => {
				const now = new Date();

				const date = utc ? now.toUTCString() : now.toString(); // If the configuration option is present, we show a UTC timestamp.

				editor.model.change( writer => {
					editor.model.insertContent( writer.createText( date ) );
				} );
			} );

			return button;
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ) as HTMLElement, {
		plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, Timestamp ],
		toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList', 'timestamp' ],
		timestamp: { utc: true } // This will be autocompleted and type checked thanks to our augmentation.
	} )
	.then( editor => {
		console.log( 'Editor was initialized', editor );
		console.log( editor.plugins.get( 'Timestamp' ) ); // This will have type Timestamp thanks to our augmentation.
	} )
	.catch( error => {
		console.error( error.stack );
	} );
```

## Adding an unofficial JavaScript plugin

The CKEditor&nbsp;5 is a TypeScript project, and all plugins provided by CKEditor&nbsp;5 also use TypeScript. However, there are ways to use JavaScript packages with the editor.

### Community types

Even if the package you want to use is in JavaScript, there is a chance there are already types you can use. [Definitely Typed](https://github.com/DefinitelyTyped/DefinitelyTyped) is a central repository of TypeScript definitions for non-typed npm packages. To install community types for your JavaScript package, try the following command:

```bash
npm install --save-dev @types/<package-name>
```

If you successfully installed those types, there is nothing more to do. You should no longer see TypeScript compiler errors, and your project should be ready to build.

### Custom declarations

If you create a custom plugin, community types will not be available. In that case, you need to add your custom definitions.

First, create a declaration file `.d.ts` in your project. For example, you can place it in `types/index.d.ts`. Then inside the file, define the module as shown in the example below.

```ts
// index.d.ts

declare module 'path' { // Module name.
  export function normalize( p: string ): string; // API exposed by the module.
  export function join( ...paths: any[] ): string;
}
```

Finally, make sure the TypeScript compiler is aware of your declarations. Put the path to the directory with your file inside the `include` array.

```json
// tsconfig.json

{
	"include": [ "./src", "./types" ],
	"compilerOptions": {
		// Compiler options.
		// ...
	}
	// More options.
	// ...
}
```

### Suppressing errors

If there are no community types and creating declarations is not an option, there is still a way to build a TypeScript project with a JavaScript package. Just add a reserved TypeScript comment above the JavaScript package.

```ts
// @ts-ignore
import { foo } from 'javascript-package';
```

This comment suppresses all errors that originate from the following line.
