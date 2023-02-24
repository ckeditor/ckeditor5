---
category: framework
order: 40
---

# Development tools

In this guide you will learn about developer tools that will help you develop and debug CKEditor 5 plugins and features.

## CKEditor 5 inspector

The official [CKEditor 5 inspector](https://github.com/ckeditor/ckeditor5-inspector) provides a set of rich debugging tools for editor internals like {@link framework/architecture/editing-engine#model model}, {@link framework/architecture/editing-engine#view view}, and {@link framework/architecture/core-editor-architecture#commands commands}.

It allows you to observe changes to the data structures and the selection live in the editor, which is particularly helpful when developing new rich-text editor features or getting to understand the existing ones.

{@img assets/img/framework-development-tools-inspector.jpg Screenshot of the CKEditor 5 inspector attached to a WYSIWYG editor instance.}

### Importing the inspector

You can import the inspector as an [`@ckeditor/ckeditor5-inspector`](https://www.npmjs.com/package/@ckeditor/ckeditor5-inspector) package into your project:

```bash
npm install --save-dev @ckeditor/ckeditor5-inspector
```

and then either import it as a module:

```js
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
```

or as a plain `<script>` tag in the HTML of your application:

```html
<script src="../node_modules/@ckeditor/ckeditor5-inspector/build/inspector.js"></script>
```

### Inspector as a bookmarklet

If you do not wish to import the inspector, you can create a bookmarklet in your browser instead that will allow you to open it on any page without interference with its source code.

**Important note: this method will not work if the page has Content Security Policy enabled.**

To create such a bookmarklet, paste the following code as the URL of a new bookmark in the browser of your choice:

```js
javascript:(function(){let script=document.createElement('script');script.src='https://unpkg.com/@ckeditor/ckeditor5-inspector/build/inspector.js';script.onload=()=>CKEditorInspector.attachToAll();document.head.appendChild(script);})()
```

Now you can load CKEditor 5 inspector by using the newly created bookmark.

### Enabling the inspector

Attach the inspector to the editor instance when {@link installation/getting-started/editor-lifecycle#creating-an-editor-with-create created} using the `CKEditorInspector.attach()` method:

```js
ClassicEditor
	.create( /* ... */ )
	.then( editor => {
		CKEditorInspector.attach( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

The inspector will show up at the bottom of the screen.

### Inspecting multiple editors

You can inspect multiple CKEditor 5 instances at a time by calling `CKEditorInspector.attach()` for each one of them. Then you can switch the inspector context to inspect different editor instances.

You can specify the name of the editor when attaching to make working with multiple instances easier:

```js
// Inspecting two editor instances at the same time.
CKEditorInspector.attach( 'header-editor', editor );
CKEditorInspector.attach( 'body-editor', editor );
```

The editor switcher is in the upper–right corner of the inspector panel.

### Demo

Click the <b>"Inspect editor"</b> button below to attach the inspector to the editor:

{@snippet framework/development-tools/inspector}

### Compatibility

The inspector works with CKEditor 5 [v12.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v12.0.0)+.

### Contributing to the inspector

The source code of CKEditor 5 inspector and its issue tracker is available on GitHub in [https://github.com/ckeditor/ckeditor5-inspector](https://github.com/ckeditor/ckeditor5-inspector).

## Mr. Git

[Mr. Git](https://github.com/cksource/mrgit) is a multi-repo manager for git. In CKEditor 5, it can be used for easy development and testing of various CKEditor&nbsp;5-related repositories, such as [ckeditor5-dev](https://github.com/ckeditor/ckeditor5-dev) or [ckeditor5-linters-config](https://github.com/ckeditor/ckeditor5-linters-config).

### Setup

In order to use the tool, install it globally from the npm.

```bash
npm install -g mrgit
```

Then, put a file named `mrgit.json` in the root of the `ckeditor5` repository. This is an example content of this file:

```json
{
	"packages": "external/",
	"dependencies": {
		"ckeditor5-linters-config": "ckeditor/ckeditor5-linters-config@latest",
		"ckeditor5-dev": "ckeditor/ckeditor5-dev@latest"
	},
	"presets": {
		"dev": {
			"ckeditor5-dev": "ckeditor/ckeditor5-dev"
		},
		"example-feature": {
			"ckeditor5-linters-config": "ckeditor/ckeditor5-linters-config#i/1-example-feature",
			"ckeditor5-dev": "ckeditor/ckeditor5-dev#i/1-example-feature"
		}
	}
}
```

<info-box>
    Support for tags and presets is available since `mrgit` [`v2.0.0`](https://github.com/cksource/mrgit/releases/tag/v2.0.0)+.
</info-box>

### Usage

In the example configuration file listed above we have defined base dependencies that should be used. These use the `@latest` tag, which means that the latest release tag will be used, which generally should coincide with the latest version available on npm. After calling `mrgit sync`, these dependencies will be cloned and made available locally in the specified (latest) version.

Alternatively, you can use one of the presets defined in the latter section of the file, eg. the `dev` preset. To do so, execute `mrgit sync --preset dev` &ndash; this will use versions specified in the preset instead. `ckeditor/ckeditor5-dev` does not have any tag or branch specified, so the `master` branch will be used by default.

Since only `ckeditor5-dev` is specified in this preset, version used for `ckeditor5-linters-config` will be the same as specified in the default `dependencies` section. Using this mechanism, it is possible to easily switch between production and development versions of the dependencies used by the `ckeditor5` repository.

For all available commands and configuration options, see the [Mr. Git documentation](https://github.com/cksource/mrgit#mr-git).

## Testing helpers

The `getData()` and `setData()` functions exposed by {@link module:engine/dev-utils/model model developer utilities} and {@link module:engine/dev-utils/view view developer utilities} are useful development helpers.

They allow for "stringifying" the {@link framework/architecture/editing-engine#model model} and {@link framework/architecture/editing-engine#view view} structures, selections, ranges, and positions as well as for loading them from a string. They are often used when writing tests.

<info-box>
	Both tools are designed for prototyping, debugging, and testing purposes. Do not use them in production-grade code.
</info-box>

For instance, to take a peek at the editor model, you could use the {@link module:engine/dev-utils/model~getData `getData()`} helper:

```js
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

// More imports.
// ...

ClassicEditor
	.create( '<p>Hello <b>world</b>!</p>' )
	.then( editor => {
		console.log( getData( editor.model ) );

		// -> '<paragraph>[]Hello <$text bold="true">world</$text>!</paragraph>'
	} );
```

See the helper documentation to learn more about useful options.

## Package generator

For a quick jump start on development of a plugin, use the [CKEditor5 Package Generator](https://www.npmjs.com/package/ckeditor5-package-generator).

See the {@link framework/package-generator/using-package-generator documentation} to learn more.
