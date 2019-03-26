---
category: framework-guides
order: 40
---

# Development tools

In this guide you will learn about developer tools that will help you develop and debug editor plugins and features.

## CKEditor 5 inspector

The official [CKEditor 5 inspector](https://github.com/ckeditor/ckeditor5-inspector) provides rich debugging tools for editor internals like {@link framework/guides/architecture/editing-engine#model model}, {@link framework/guides/architecture/editing-engine#view view}, and  {@link framework/guides/architecture/core-editor-architecture#commands commands}.

It allows observing changes to the data structures and the selection live in the editor which is particularly helpful when developing new editor features or getting to understand the existing ones.

{@img assets/img/framework-development-tools-inspector.jpg Screenshot of a CKEditor 5 inspector attached to an editor instance.}

### Importing the inspector

You can import the inspector as an [`@ckeditor/ckeditor5-inspector`](https://www.npmjs.com/package/@ckeditor/ckeditor5-inspector) package into your project:

```
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

### Enabling the inspector

Attach the inspector to the editor instance when {@link builds/guides/integration/basic-api#creating-an-editor created} using the `CKEditorInspector.attach()` method:

```js
ClassicEditor
	.create( ... )
	.then( editor => {
		CKEditorInspector.attach( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

The inspector will show up at the bottom of the screen.

### Inspecting multiple editors

You can inspect multiple editor instances at a time by calling `CKEditorInspector.attach()` for each one of them. Then you can switch the inspector context to inspect different editors.

You can specify the name of the editor when attaching to make working with multiple instances easier:

```js
// Inspecting two editor instances at the same time.
CKEditorInspector.attach( 'header-editor' editor );
CKEditorInspector.attach( 'body-editor' editor );
```

The editor switcher is in the upper–right corner of the inspector panel.

### Demo

Click the <b>"Inspect editor"</b> button below to attach the inspector to the editor:

{@snippet framework/development-tools/inspector}

### Contributing to the inspector

The source code of CKEditor 5 inspector and its issue tracker is available on GitHub in https://github.com/ckeditor/ckeditor5-inspector.

## Testing helpers

The `getData()` and `setData()` functions exposed by {@link module:engine/dev-utils/model model dev utils} and {@link module:engine/dev-utils/view view dev utils} are useful development helpers.

They allow "stringifying" {@link framework/guides/architecture/editing-engine#model model} and {@link framework/guides/architecture/editing-engine#view view} structures, selections, ranges, and positions as well as loading them from a string. They are often used when writing tests.

<info-box>
	Both tools are designed for prototyping, debugging, and testing purposes. Do not use them in production-grade code.
</info-box>

For instance, to take a peek at the editor model, you could use the {@link module:engine/dev-utils/model#static-function-getData `getData()`} helper:

```js
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

// ...

ClassicEditor
	.create( '<p>Hello <b>world</b>!</p>' )
	.then( editor => {
		console.log( getData( editor.model ) );

		// -> '<paragraph>[]Hello <$text bold="true">world</$text>!</paragraph>'
	} );
```

See the helper documentation to learn more about useful options.
