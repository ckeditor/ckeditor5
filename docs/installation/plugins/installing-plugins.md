---
menu-title: Installing plugins
meta-title: Installing plugins | CKEditor 5 documentation
category: plugins
order: 30
---

# Installing plugins

CKEditor&nbsp;5 plugins, responsible for various features, are distributed through [npm](https://www.npmjs.com) packages. We implemented them in a modular way. It means a single plugin may contain multiple JavaScript files. Do not hesitate and explore available CKEditor&nbsp;5 features &ndash; they are waiting for you to install them!

<info-box hint>
	If you are looking for an easy way to create a custom build of CKEditor&nbsp;5 without installing anything, check the [online builder](https://ckeditor.com/ckeditor-5/online-builder/). It allows you to create a build with a custom set of plugins through a simple and intuitive UI.
</info-box>

## Requirements

To enrich the CKEditor&nbsp;5 by installing plugins, you will require:

* [Node.js](https://nodejs.org/en/) 18.0.0+
* [npm](https://www.npmjs.com/) 5.7.1+ (**note:** some npm 5+ versions were known to cause [problems](https://github.com/npm/npm/issues/16991), especially with deduplicating packages; upgrade npm when in doubt)

<info-box warning>
	When installing CKEditor&nbsp;5 Framework packages, you need to make sure their versions match the version of the base editor package. For example: if you would like to install the `@ckeditor/ckeditor5-alignment` package and your other packages are outdated, like at version `38.0.0`, you should consider updating your editor and all other packages to the latest `{@var ckeditor5-version}` version. You might also install the alignment package at version `38.0.0` (which is not advised, actually). Otherwise, if package versions are different, this will result in an [`ckeditor-duplicated-modules error`](https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-ckeditor-duplicated-modules).

	The simplest way to avoid such situations is to always use the latest `{@var ckeditor5-version}` versions of the official packages. If you already stumbled upon this error, you can use [`npm-check-updates`](https://www.npmjs.com/package/npm-check-updates), which is a handy tool for keeping your packages up to date.

	**NOTE:** The above rule does not apply to packages named `@ckeditor/ckeditor5-dev-*`.
</info-box>

If you are here looking for a way to install plugins, there is a chance you have the CKEditor already installed. But if you do not, you have two options: create a custom build with an {@link installation/getting-started/quick-start-other online builder} or {@link installation/advanced/integrating-from-source-webpack integrate the editor from the source}.

## Adding a plugin to an editor

You can start adding plugins if you are in a directory with the CKEditor&nbsp;5 build or the root folder of your application if you are integrating the editor from the source. Every plugin has its corresponding npm package. To install any plugin, you can use this template in a terminal:

```bash
npm install <plugin-name>
```

### Installing a package

Let's say you want to install the alignment package. It adds text alignment functionality to your editor. You can install it using the following command:

```bash
npm install @ckeditor/ckeditor5-alignment
```

The command will install the package and add it to `package.json`. You can also edit `package.json` manually. All packages (excluding `@ckeditor/ckeditor5-dev-*`) {@link installation/plugins/installing-plugins#requirements must have the same version as the base editor package}.

<info-box hint>
	Due to the non-deterministic way how npm installs packages, it is recommended to run `rm -rf node_modules && npm install` when in doubt. This will prevent some packages from getting installed more than once in `node_modules/` (which might lead to broken builds).

	You can also give [Yarn](https://yarnpkg.com/lang/en/) a try.
</info-box>

### Updating the editor's configuration

To add a plugin to your editor, you need to follow three steps:

1. Import the installed package in the file with the CKEditor configuration.
2. Add the imported plugin to the list of plugins. There are two ways to achieve that: using the {@link module:core/editor/editor~Editor.builtinPlugins `builtinPlugins`} property or passing a plugin to the {@link module:core/editor/editor~Editor.create `create()`} method. Adding a plugin through the property lets you automatically enable it in all editor instances using this editor class. Passing the plugin to the method will affect only one instance.
3. Configure the toolbar if the installed plugin requires UI.

```ts
// <path-to-your-build>/src/ckeditor.ts or file containing editor configuration if you are integrating an editor from source.

// The editor creator to use.
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Alignment } from '@ckeditor/ckeditor5-alignment';  // Importing the package.
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
		TextTransformation
	];

	// Editor configuration.
	public static override defaultConfig = {
		toolbar: {
			items: [
				'alignment',  // Displaying the proper UI element in the toolbar.
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

### Building an editor

If you are using builds you need to rebuild your editor. To do that, call the `webpack` executable in a folder containing your build:

```bash
./node_modules/.bin/webpack --mode development
```

You can also install `webpack-cli` globally (using `npm install -g`) and run it via a globally available `webpack`.

Alternatively, you can add it as an [npm script](https://docs.npmjs.com/misc/scripts):

```json
// package.json

"scripts": {
	"build": "webpack --mode development"
}
```

And use it with:

```bash
npm run build
```

If you are integrating an editor from the source into your application, this step should be handled by build scripts used in your project.

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
