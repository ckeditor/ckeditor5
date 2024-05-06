---
menu-title: Installing plugins
meta-title: Installing plugins | CKEditor 5 documentation
category: setup
modified_at: 2024-05-06
order: 30
---

# Installing plugins

CKEditor&nbsp;5 plugins, responsible for various features, are distributed with the main CKEditor&nbsp;5 [npm](https://www.npmjs.com) package. We implemented them in a modular way. It means a single plugin may contain multiple JavaScript files. Do not hesitate and explore available CKEditor&nbsp;5 features &ndash; they are waiting for you to install them!

## Requirements

To enrich the CKEditor&nbsp;5 by installing plugins, you will require:

<!-- Please confirm for new installation methods -->
* [Node.js](https://nodejs.org/en/) 18.0.0+
* [npm](https://www.npmjs.com/) 5.7.1+ (**note:** some npm 5+ versions were known to cause [problems](https://github.com/npm/npm/issues/16991), especially with deduplicating packages; upgrade npm when in doubt)

If you are here looking for a way to install plugins, there is a chance you have the CKEditor&nbsp;5 already installed. But if you do not, refer to the {@link getting-started/quick-start Quick Start} guide.

## Adding a plugin to an editor

### Installing a package

All open-source packages are included in the `ckeditor5` package. There is no need to install additional files. All premium plugins are installed with the `ckeditor5premium-features` package.

### Updating the editor's configuration

To add a plugin to your editor, you need to follow three steps:

1. Import the installed package in the file with the CKEditor configuration.
2. Add the imported plugin to the list of plugins. There are two ways to achieve that: using the {@link module:core/editor/editor~Editor.builtinPlugins `builtinPlugins`} property or passing a plugin to the {@link module:core/editor/editor~Editor.create `create()`} method. Adding a plugin through the property lets you automatically enable it in all editor instances using this editor class. Passing the plugin to the method will affect only one instance.
3. Configure the toolbar if the installed plugin requires UI.

```ts
// <path-to-your-build>/src/ckeditor.ts or file containing editor configuration if you are integrating an editor from source.

// Open-source plugins.
import {
	ClassicEditor,
	Alignment,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	CloudServices,
	Essentials,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table, TableToolbar,
	TextTransformation
	} from 'ckeditor5';
// Premium plugin.
import { ExportPdf } from 'ckeditor5-premium-features';



class Editor extends ClassicEditor {
	public static override builtinPlugins = [
		Alignment,  // Adding the package to the list of plugins.
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
		TextTransformation,
		ExportPdf
	];

	// Editor configuration.
	public static override defaultConfig = {
		toolbar: {
			items: [
				'alignment',  // Displaying the proper UI element in the toolbar.
				'heading',
				'|',
				'exportPdf',
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
