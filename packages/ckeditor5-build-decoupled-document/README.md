CKEditor 5 document editor build
========================================

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-build-decoupled-document.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document)
[![Coverage Status](https://coveralls.io/repos/github/ckeditor/ckeditor5/badge.svg?branch=master)](https://coveralls.io/github/ckeditor/ckeditor5?branch=master)
[![Build Status](https://travis-ci.com/ckeditor/ckeditor5.svg?branch=master)](https://app.travis-ci.com/github/ckeditor/ckeditor5)
![Dependency Status](https://img.shields.io/librariesio/release/npm/@ckeditor/ckeditor5-build-decoupled-document)

The document editor build for CKEditor 5, featuring the decoupled UI editor implementation. Read more about the [document editor build](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#document-editor) and see the [demo](https://ckeditor.com/docs/ckeditor5/latest/examples/builds/document-editor.html).

![CKEditor 5 decoupled document editor build screenshot](https://c.cksource.com/a/1/img/npm/ckeditor5-build-decoupled-document.png)

## Documentation

See:

* [Installation](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start.html) for how to install this package and what it contains.
* [Editor lifecycle](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/editor-lifecycle.html) for how to create an editor and interact with it.
* [Configuration](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/configuration.html) for how to configure the editor.
* [Creating custom builds](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start.html#building-the-editor-from-source) for how to customize the build (configure and rebuild the editor bundle).

## Quick start

First, install the build from npm:

```bash
npm install --save @ckeditor/ckeditor5-build-decoupled-document
```

And use it in your website:

```html
<div id="toolbar-container"></div>
<div id="editor">
	<p>This is the editor content.</p>
</div>
<script src="./node_modules/@ckeditor/ckeditor5-build-decoupled-document/build/ckeditor.js"></script>
<script>
	DecoupledEditor
		.create( document.querySelector( '#editor' ) )
		.then( editor => {
			// The toolbar needs to be explicitly appended.
			document.querySelector( '#toolbar-container' ).appendChild( editor.ui.view.toolbar.element );

			window.editor = editor;
		} )
		.catch( error => {
			console.error( 'There was a problem initializing the editor.', error );
		} );
</script>
```

Or in your JavaScript application:

```js
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

// Or using the CommonJS version:
// const DecoupledEditor = require( '@ckeditor/ckeditor5-build-decoupled-document' );

DecoupledEditor
	.create( document.querySelector( '#editor' ) )
	.then( editor => {
		// The toolbar needs to be explicitly appended.
		document.querySelector( '#toolbar-container' ).appendChild( editor.ui.view.toolbar.element );

		window.editor = editor;
	} )
	.catch( error => {
		console.error( 'There was a problem initializing the editor.', error );
	} );
```

**Note:** If you are planning to integrate CKEditor 5 deep into your application, it is actually more convenient and recommended to install and import the source modules directly (like it happens in `ckeditor.js`). Read more in the [Advanced setup guide](https://ckeditor.com/docs/ckeditor5/latest/installation/advanced/advanced-setup.html).

## License

Licensed under the terms of [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, please check the `LICENSE.md` file or [https://ckeditor.com/legal/ckeditor-oss-license](https://ckeditor.com/legal/ckeditor-oss-license).
