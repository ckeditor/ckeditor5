---
# Scope:
# * Guide developers through the basic API to achieve their very first results with CKEditor.

title: Basic API
category: builds-integration
order: 20
---

Each CKEditor 5 build provides a different class that handles the creation of editor instances:

* Classic editor – {@link module:editor-classic/classiceditor~ClassicEditor}
* Inline editor – {@link module:editor-inline/inlineeditor~InlineEditor}
* Balloon editor – {@link module:editor-balloon/ballooneditor~BalloonEditor}

Most of the examples in the documentation use the `ClassicEditor` class, but things should work in a similar way with other builds.

## Creating an editor

Regardless of chosen build, creating an editor is done using a static `create()` method.

### Example – Classic editor

In your HTML page add an element that CKEditor should replace:

```html
<textarea name="content" id="editor">
	&lt;p&gt;Here goes the initial content of the editor.&lt;/p&gt;
</textarea>
```

Then call {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} to replace `<textarea>` with a {@link builds/guides/overview#Classic-editor Classic editor}:

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

In the above case, the `<textarea>` element is hidden and replaced with an editor. The `<textarea>` data is used to initialize the editor content. A `<div>` element can be used in the same fashion.

### Example – Inline editor

Similarly to the previous example, add an element where CKEditor should initialize:

```html
<div id="editor">
	&lt;p&gt;Here goes the initial content of the editor.&lt;/p&gt;
</div>
```

Then call {@link module:editor-inline/inlineeditor~InlineEditor#create `InlineEditor.create()`} to attach {@link builds/guides/overview#Inline-editor Inline editor} to a `<div>` element:

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

<info-box tip>
	Every editor class may accept different parameters in the `create()` method and may handle initialization differently. For instance, the classic editor will replace a given element with an editor, while the inline editor will use the given element to initialize the editor on it. See each editor's documentation to learn the details.

	The interface of the editor class is not enforced either. Since different implementations of editors may vary heavily in terms of functionality, the editor class implementers have full freedom regarding the API. Therefore, the examples in this guide may not work with some editor classes.
</info-box>

## Interacting with the editor

Once the editor is created, it is possible to interact with it through its API. The `editor` variable from the examples above should enable that.

### Setting the editor data

To replace the editor content with new data, just use the `setData` method:

```js
editor.setData( '<p>Some text.</p>' );
```

### Getting the editor data

If the editor content needs to be retrieved for any reason, like for sending it to the server through an Ajax call, simply use the `getData` method:

```js
const data = editor.getData();
```

### Destroying the editor

In modern applications, it is common to create and remove elements from the page interactively through JavaScript. CKEditor instances should be destroyed in such cases by using the `destroy()` method:

```js
editor.destroy()
	.catch( error => {
		console.log( error );
	} );
```

Once destroyed, resources used by the editor instance are released and the original element used to create the editor is automatically displayed and updated to reflect the final editor data.

## UMD support

Because builds are distributed as [UMD modules](https://github.com/umdjs/umd), it is worth noting that editor classes can be retrieved in various ways:

* by a [CommonJS](http://wiki.commonjs.org/wiki/CommonJS)-compatible loader (e.g. [webpack](https://webpack.js.org) or [Browserify](http://browserify.org/)),
* by [RequireJS](http://requirejs.org/) (or any other AMD library),
* from the global namespace if none of the above loaders is available.

For example:

```js
// In CommonJS environment.
const ClassicEditor = require( '@ckeditor/ckeditor5-build-classic/build/ckeditor' );
ClassicEditor.create( ... ); // [Function]

// If AMD is present, you can do this.
require( [ 'path/to/ckeditor5-build-classic/build/ckeditor' ], ClassicEditor => {
	ClassicEditor.create( ... ); // [Function]
} );

// As a global variable.
ClassicEditor.create( ... ); // [Function]

// As an ES6 module (if using webpack or Rollup).
import ClassicEditor from '@ckeditor/ckeditor5-build-classic/build/ckeditor';
ClassicEditor.create( ... ); // [Function]
```

## What's more?

CKEditor offers a rich API to interact with editors. Check out the {@link api/index API documentation} for more.
