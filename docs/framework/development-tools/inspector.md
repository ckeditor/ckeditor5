---
menu-title: Inspector
category: development-tools
meta-title: CKEditor 5 inspector | CKEditor 5 Framework Documentation
order: 1
modified_at: 2022-08-16
---

# CKEditor 5 inspector

The official [CKEditor 5 inspector](https://github.com/ckeditor/ckeditor5-inspector) provides a set of rich debugging tools for editor internals like {@link framework/architecture/editing-engine#model model}, {@link framework/architecture/editing-engine#view view}, and {@link framework/architecture/core-editor-architecture#commands commands}.

It allows you to observe changes to the data structures and the selection live in the editor, which is particularly helpful when developing new rich-text editor features or getting to understand the existing ones.

{@img assets/img/framework-development-tools-inspector.jpg Screenshot of the CKEditor 5 inspector attached to a WYSIWYG editor instance.}

## Importing the inspector

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

## Inspector as a bookmarklet

If you do not wish to import the inspector, you can create a bookmarklet in your browser instead that will allow you to open it on any page without interference with its source code.

**Important note: this method will not work if the page has the Content Security Policy enabled.**

To create such a bookmarklet, paste the following code as the URL of a new bookmark in the browser of your choice:

```js
javascript:(function(){let script=document.createElement('script');script.src='https://unpkg.com/@ckeditor/ckeditor5-inspector/build/inspector.js';script.onload=()=>CKEditorInspector.attachToAll();document.head.appendChild(script);})()
```

Now you can load CKEditor 5 inspector by using the newly created bookmark.

## Enabling the inspector

Attach the inspector to the editor instance when {@link getting-started/setup/editor-lifecycle#creating-an-editor-with-create created} using the `CKEditorInspector.attach()` method:

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

## Inspecting multiple editors

You can inspect multiple CKEditor 5 instances at a time by calling `CKEditorInspector.attach()` for each one of them. Then you can switch the inspector context to inspect different editor instances.

You can specify the name of the editor when attaching to make working with multiple instances easier:

```js
// Inspecting two editor instances at the same time.
CKEditorInspector.attach( { 'header-editor': editor } );
CKEditorInspector.attach( { 'body-editor': editor } );
```

The editor switcher is in the upper–right corner of the inspector panel.

### Demo

Click the <b>"Inspect editor"</b> button below to attach the inspector to the editor:

{@snippet framework/development-tools/inspector}

### Compatibility

The inspector works with CKEditor 5 [v12.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v12.0.0)+.

### Contributing to the inspector

The source code of CKEditor 5 inspector and its issue tracker is available on GitHub in [https://github.com/ckeditor/ckeditor5-inspector](https://github.com/ckeditor/ckeditor5-inspector).
