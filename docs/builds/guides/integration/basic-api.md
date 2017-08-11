---
# Scope:
# * Guide developers through the basic API to achieve their very first results with CKEditor.

title: Basic API
category: builds-integration
order: 20
---

## Creators

Each CKEditor 5 build provides a class that handles the creation of editor instances ininfo a page. For this reason they are called "creators". Every creator comes with a static `create()` method.

The following are creator class names for each build:

* Classic Editor &ndash; {@link module:editor-classic/classiceditor~ClassicEditor}
* Inline Editor &ndash; {@link module:editor-inline/inlineeditor~InlineEditor}
* Medium-like Editor &ndash; {@link module:editor-medium-like/mediumlikeeditor~MediumLikeEditor}

Most of the examples in the documentation use the `ClassicEditor` class, but things should work in a similar way with other creator classes.

Because builds are distributed as [UMD modules](https://github.com/umdjs/umd), these classes can be retrieved:

* by a [CommonJS](http://wiki.commonjs.org/wiki/CommonJS)-compatible loader (e.g. [Webpack](https://webpack.js.org) or [Browserify](http://browserify.org/)),
* by [RequireJS](http://requirejs.org/) (or any other AMD library),
* from the global namespace if none of the above loaders is available.

For example:

```js
// In CommonJS environment.
const ClassicEditor = require( '@ckeditor/ckeditor5-build-classic/build/ckeditor.js' );
ClassicEditor.create; // [Function]

// If AMD is present, you can do this.
require( '/(ckeditor path)/build/ckeditor.js', ClassicEditor => {
	ClassicEditor.create; // [Function]
} );

// As a global.
ClassicEditor.create; // [Function]
```

Depending on which build you are using, creating an editor in the page is then a breeze:

In the HTML code:

```html
<textarea id="text-editor">
	&lt;p&gt;Here goes the initial content of the editor.&lt;/p&gt;
</textarea>
```

In the script:

```js
ClassicEditor.create( document.querySelector( '#text-editor' ) )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

In the above case, the `<textarea>` element is hidden and replaced with an editor. The `<textarea>` data is used to initialize the editor content. A `<div>` element can be used in the same fashion.

<info-box tip>
	Every creator may accept different parameters and handle initialization differently. For instance, the classic editor will replace a given element with an editor, while the inline editor will use the given element to initialize the editor on it. See each editor's documentation to learn the details.

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

## What’s more?

CKEditor offers a rich API to interact with editors. Check out the {@link TODO API documentation} for more.
