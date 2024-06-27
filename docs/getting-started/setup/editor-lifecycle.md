---
category: setup
meta-title: Editor lifecycle | CKEditor 5 documentation
order: 20
modified_at: 2024-06-25
---

# Editor lifecycle

Each CKEditor&nbsp;5 **type** provides a different **editor class** that handles the creation of editor instances. Most of the examples in the documentation use the {@link module:editor-classic/classiceditor~ClassicEditor `ClassicEditor`} class, but things should work similarly with other types.

## Creating an editor with `create()`

Regardless of the chosen type, creating an editor is done using the static `create()` method. Usually, you start with an HTML element that will be a place where an editor will render itself on a page.

<info-box hint>
	Every editor class may accept different parameters in the `create()` method and may handle the initialization differently. For instance, the classic editor will **replace** the given element with an editor, while the inline editor will use the given element to initialize an editor on it. The decoupled document editor needs to initialize the toolbar separately from the editable area. See each editor's documentation to learn the details.
</info-box>

### Example: Classic editor

Add an element that CKEditor&nbsp;5 should replace on your HTML page:

```html
<div id="editor">
	<p>Here goes the initial content of the editor.</p>
</div>
```

Then you call {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} to **replace** the `<div>` element with a classic editor:

```js
import { ClassicEditor, Essentials } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, /* ... */ ],
	} )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

After creation, the editor will appear on the page in the selected area.

<info-box hint>
	Inline and balloon editors types are initialized in the same way.
</info-box>

### Example: Decoupled editor

Add the elements where CKEditor&nbsp;5 should initialize the toolbar and the editable to your page:

```html
<!-- The toolbar will be rendered in this container. -->
<div id="toolbar-container"></div>

<!-- This container will become the editable. -->
<div id="editor">
	<p>This is the initial editor content.</p>
</div>
```

Then call the {@link module:editor-decoupled/decouplededitor~DecoupledEditor#create `DecoupledEditor.create()`} method to create a decoupled editor instance with the toolbar and the editable in two separate containers:

```js
import { DecoupledEditor, Essentials } from 'ckeditor5';

DecoupledEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, /* ... */ ],
	} )
	.then( editor => {
		const toolbarContainer = document.querySelector( '#toolbar-container' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );
	} )
	.catch( error => {
		console.error( error );
	} );
```

## Getting the editor's instance

The simplest way is to save the reference to the editor somewhere after you create it. This is often done by using a window or some state management object. You will often see lines like this in our documentation.

```js
// Editor's creation steps.
// ...
.then( editor => {
	window.editor = editor;
})

// Or with the await (if your setup supports it):
const editor = await ClassicEditor.create( /* ... */  );
```

## Destroying the editor with `destroy()`

In modern applications, it is common to create and remove elements from the page interactively through JavaScript. In such cases, CKEditor&nbsp;5 instances should be destroyed by using the `destroy()` method:

```js
editor
	.destroy()
	.catch( error => {
		console.log( error );
	} );
```

Once destroyed, resources used by the editor instance are released and the original element used to create the editor is automatically displayed and updated to reflect the final editor data.
