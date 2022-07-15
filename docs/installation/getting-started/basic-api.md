---
# Scope:
# * Guide developers through the basic API to achieve their very first results with CKEditor.

category: getting-started
order: 40
---

# Basic API

<info-box hint>
**Quick recap**

In the {@link installation/getting-started/installing-plugins previous tutorial} you have explored available features and learned how to add them to your editor. This article shows the basic API which you can use for the interaction with the editor.
</info-box>

Each CKEditor 5 **build** provides a different **editor class** that handles the creation of editor instances:

* Classic editor &ndash; {@link module:editor-classic/classiceditor~ClassicEditor}
* Inline editor &ndash; {@link module:editor-inline/inlineeditor~InlineEditor}
* Balloon editor &ndash; {@link module:editor-balloon/ballooneditor~BalloonEditor}
* Document editor &ndash; {@link module:editor-decoupled/decouplededitor~DecoupledEditor}

Most of the examples in the documentation use the `ClassicEditor` class, but things should work in a similar way with other builds.

<info-box>
	A CKEditor 5 build compiles a specific editor class and a set of plugins. Using builds is the simplest way to include the editor in your application, but you can also {@link installation/advanced/integrating-from-source use the editor classes and plugins directly} for greater flexibility.
</info-box>

## Creating an editor with `create()`

Regardless of the chosen build, creating an editor is done using the static `create()` method.

### Example – classic editor

Add an element that CKEditor should replace to your HTML page:

```html
<div id="editor">
	<p>Here goes the initial content of the editor.</p>
</div>
```

Then call {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} to **replace** the `<textarea>` element with a {@link installation/advanced/predefined-builds#classic-editor classic editor}:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ) )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

In this case the `<textarea>` element is hidden and replaced with an editor. The `<textarea>` data is used to initialize the editor content. A `<div>` element can be used in the same way.

### Example – inline editor

Similarly to the previous example, add an element where CKEditor 5 should initialize to your page:

```html
<div id="editor">
	<p>Here goes the initial content of the editor.</p>
</div>
```

Then call {@link module:editor-inline/inlineeditor~InlineEditor#create `InlineEditor.create()`} to **attach** {@link installation/advanced/predefined-builds#inline-editor inline editor} to the `<div>` element:

```js
InlineEditor
	.create( document.querySelector( '#editor' ) )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

### Example – balloon editor

The procedure is the same as for inline editor. The only difference is that you need to use the {@link module:editor-balloon/ballooneditor~BalloonEditor#create `BalloonEditor.create()`} method.

Add an element where CKEditor should initialize to your page:

```html
<div id="editor">
	<p>Here goes the initial content of the editor.</p>
</div>
```

Then call {@link module:editor-balloon/ballooneditor~BalloonEditor#create `BalloonEditor.create()`} to **attach** {@link installation/advanced/predefined-builds#balloon-editor balloon editor} to the `<div>` element:

```js
BalloonEditor
	.create( document.querySelector( '#editor' ) )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

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
DecoupledEditor
	.create( document.querySelector( '#editor' ) )
	.then( editor => {
		const toolbarContainer = document.querySelector( '#toolbar-container' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );
	} )
	.catch( error => {
		console.error( error );
	} );
```

<info-box tip>
	Every editor class may accept different parameters in the `create()` method and may handle the initialization differently. For instance, classic editor will replace the given element with an editor, while inline editor will use the given element to initialize an editor on it. See each editor's documentation to learn the details.

	The interface of the editor class is not enforced either. Since different implementations of editors may vary heavily in terms of functionality, the editor class implementers have full freedom regarding the API. Therefore, the examples in this guide may not work with some editor classes.
</info-box>

## Interacting with the editor

Once the editor is created, it is possible to interact with it through its API. The `editor` variable from the examples above should enable that.

### Setting the editor data with `setData()`

To replace the editor content with new data, use the `setData()` method:

```js
editor.setData( '<p>Some text.</p>' );
```

### Getting the editor data with `getData()`

If the editor content needs to be retrieved for any reason, like for sending it to the server through an Ajax call, use the `getData()` method:

```js
const data = editor.getData();
```

### Destroying the editor with `destroy()`

In modern applications, it is common to create and remove elements from the page interactively through JavaScript. In such cases CKEditor 5 instances should be destroyed by using the `destroy()` method:

```js
editor.destroy()
	.catch( error => {
		console.log( error );
	} );
```

Once destroyed, resources used by the editor instance are released and the original element used to create the editor is automatically displayed and updated to reflect the final editor data.

### Listening to changes

The {@link module:engine/model/document~Document#change:data `Document#change:data`} event is fired when the document changes in such a way that is "visible" in the editor data.

```js
editor.model.document.on( 'change:data', () => {
    console.log( 'The data has changed!' );
} );
```

There is also a group of changes like selection position changes or marker changes which do not affect the result of `editor.getData()`. To listen to all these changes, you can use a wider {@link module:engine/model/document~Document#change `Document#change`} event.

## UMD support

Because builds are distributed as [UMD modules](https://github.com/umdjs/umd), editor classes can be retrieved in various ways:

* by a [CommonJS](http://wiki.commonjs.org/wiki/CommonJS)-compatible loader (e.g. [webpack](https://webpack.js.org) or [Browserify](http://browserify.org/)),
* by [RequireJS](http://requirejs.org/) (or any other AMD library),
* from the global namespace if none of the above loaders is available.

For example:

```js
// In the CommonJS environment.
const ClassicEditor = require( '@ckeditor/ckeditor5-build-classic' );
ClassicEditor.create( ... ); // [Function]

// If AMD is present, you can do this.
require( [ 'path/to/ckeditor5-build-classic/build/ckeditor' ], ClassicEditor => {
	ClassicEditor.create( ... ); // [Function]
} );

// As a global variable.
ClassicEditor.create( ... ); // [Function]

// As an ES6 module (if using webpack or Rollup).
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
ClassicEditor.create( ... ); // [Function]
```

<info-box hint>
**What's next?**

Having read this guide, you know how to communicate with the editor, but remember that CKEditor 5 offers a rich API to interact with it. Check out the {@link api/index API documentation} for more.

If you would like to integrate your CKEditor 5 installation with the Angular, React and Vue.js JavaScript frameworks, {@link installation/frameworks/overview we have a dedicated guide for that}.

Whatever the installation method and approach, it is important to know how you can maintain your editor, so take a look at the {@link installation/getting-started/maintenance last article from this section} to learn more.
</info-box>
