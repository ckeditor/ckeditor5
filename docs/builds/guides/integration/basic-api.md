---
# Scope:
# * Guide developers through the basic API to achieve their very first results with CKEditor.

title: Basic API
category-id: builds-integration
---

## Creators

Each CKEditor 5 build provides a class that handles the creation of editor instances inside a page. For this reason they’re called “creators”. Every creator comes with a static `create()` method.

The following are creator class names for each build:

* Classic Editor: {@link module:editor-classic/classiceditor~ClassicEditor}
* Inline Editor: {@link module:editor-inline/inlineeditor~InlineEditor}

Most of the examples in the documentation use the `ClassicEditor` class, but things should work in the same way with other creator classes.

Because builds are distributed as [UMD modules](https://github.com/umdjs/umd), these classes can be retrieved:

* by [CommonJS](http://wiki.commonjs.org/wiki/CommonJS) compatible loader (e.g. [Webpack](https://webpack.js.org) or [Browserify](http://browserify.org/)),
* by [RequireJS](http://requirejs.org/) (or any other AMD library),
* from the global namespace if any of the above loaders is not available.

 For example:

```js
// If AMD is present, you can do this.
require( '/(ckeditor path)/ckeditor.js', ( ClassicEditor ) => {
	ClassicEditor.create; // [Function]
} );

// Or in all cases, just access it as a global.
ClassicEditor.create; // [Function]
```

Having the above in mind, depending on which build you’re using, creating an editor in the page is a breeze:

In the HTML:

```
<textarea id="text-editor">
	&lt;p&gt;Here goes the initial contents of the editor.&lt;/p&gt;
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

In the above case, the `<textarea>` element is hidden and replaced with an editor. The `<textarea>` data is used to initialize the editor contents. A `<div>` element could have been used in the same fashion.

<side-box info>
	Every creator may accept different parameters and handle initialization differently. For instance, the classic editor will replace a given element with an editor, while the inline editor will use the given element to initialize the editor on it. See each editor's documentation to learn the details.

	The interface of the editor class isn't enforced either. Since different implementations of editors may vary heavily in terms of functionality, the editor class implementers have full freedom regarding the API. Therefore, the examples in this guide may not work with some editor classes.
</side-box>

## Interacting with the editor

Once the editor is created, it is possible to interact with it through its API. The `editor` variable, from the above examples, should enable that.

### Setting the editor data

To replace the editor contents with new data, just use the `setData` method:

```js
editor.setData( '<p>Some text.</p>' );
```

### Getting the editor data

If the editor contents need to be retrieved for any reason, like for the scope of sending it to the server through an Ajax call, simply use the `getData` method:

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
