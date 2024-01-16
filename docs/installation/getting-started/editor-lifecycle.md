---
category: getting-started
meta-title: Editor's lifecycle | CKEditor 5 documentation
order: 60
---

# Editor's lifecycle

<info-box hint>
**Quick recap**

In the {@link installation/getting-started/configuration previous guide} you have explored available configuration options of the editor. This article shows the lifecycle methods to create and destroy the editor.
</info-box>

Each CKEditor 5 **type** provides a different **editor class** that handles the creation of editor instances. Most of the examples in the documentation use the {@link module:editor-classic/classiceditor~ClassicEditor `ClassicEditor`} class, but things should work similarly with other types.

## Creating an editor with `create()`

Regardless of the chosen type, creating an editor is done using the static `create()` method. Usually, you start with an HTML element that will be a place where an editor will render itself on a page.

<info-box tip>
Every editor class may accept different parameters in the `create()` method and may handle the initialization differently. For instance, the classic editor will **replace** the given element with an editor, while the inline editor will use the given element to initialize an editor on it. The decoupled document needs to initialize the toolbar separately from the editable area. See each editor's documentation to learn the details.
</info-box>

### Example – classic editor

Add an element that CKEditor should replace to your HTML page:

```html
<div id="editor">
	<p>Here goes the initial content of the editor.</p>
</div>
```

Then you call {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} to **replace** the `<div>` element with a {@link installation/getting-started/predefined-builds#classic-editor classic editor}:

```js
ClassicEditor.create( document.querySelector( '#editor' ) )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

After creation, the editor will appear on the page in the selected area.

<info-box tip>
Inline, balloon, and balloon block editors are initialized in the same way.
</info-box>

### Example – decoupled editor

Add the elements where CKEditor should initialize the toolbar and the editable to your page:

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
DecoupledEditor.create( document.querySelector( '#editor' ) )
	.then( editor => {
		const toolbarContainer = document.querySelector( '#toolbar-container' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );
	} )
	.catch( error => {
		console.error( error );
	} );
```

## Getting the editor's instance

The simplest way is save the reference to the editor somewhere after you create it. This is often done by using a window or some state management object. You will often see lines like this in our documentation.

```js
// Editor's creation steps.
// ...
.then( editor => {
	window.editor = editor;
})

// Or with the await (if your setup supports it):
const editor = await ClassicEditor( /* ... */  );
```

## Destroying the editor with `destroy()`

In modern applications, it is common to create and remove elements from the page interactively through JavaScript. In such cases, CKEditor 5 instances should be destroyed by using the `destroy()` method:

```js
editor.destroy().catch( error => {
	console.log( error );
} );
```

Once destroyed, resources used by the editor instance are released and the original element used to create the editor is automatically displayed and updated to reflect the final editor data.

<info-box hint>
**What's next**

Now you know how to initialize the editor instance. But an editor without the ability to get its content is not particularly useful. It is time to learn how to work with the editor's data {@link installation/getting-started/getting-and-setting-data in the following guide}.
</info-box>
