CKEditor&nbsp;5 multi-root editor build
==============================================

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-build-multi-root.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root)
[![Coverage Status](https://coveralls.io/repos/github/ckeditor/ckeditor5/badge.svg?branch=master)](https://coveralls.io/github/ckeditor/ckeditor5?branch=master)
[![Build Status](https://travis-ci.com/ckeditor/ckeditor5.svg?branch=master)](https://app.travis-ci.com/github/ckeditor/ckeditor5)

The multi-root editor build for CKEditor&nbsp;5. Read more about the [multi-root editor build](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#multi-root-editor) and see the [demo](https://ckeditor.com/docs/ckeditor5/latest/examples/builds/multi-root-editor.html).

## Documentation

See:

* [Installation](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start.html) for how to install this package and what it contains.
* [Editor lifecycle](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/editor-lifecycle.html) for how to create an editor and interact with it.
* [Configuration](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/configuration.html) for how to configure the editor.
* [Creating custom builds](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start.html#building-the-editor-from-source) for how to customize the build (configure and rebuild the editor bundle).

## Quick start

First, install the build from npm:

```bash
npm install --save @ckeditor/ckeditor5-build-multi-root
```

And use it in your website:

```html
<div id="toolbar"></div>
<div id="header">
	<p>Content for header.</p>
</div>
<div id="content">
	<p>Main editor content.</p>
</div>
<div class="boxes">
	<div class="box box-left editor">
		<div id="left-side">
			<p>Content for left-side box.</p>
		</div>
	</div>
	<div class="box box-right editor">
		<div id="right-side">
			<p>Content for right-side box.</p>
		</div>
	</div>
</div>
<script src="./node_modules/@ckeditor/ckeditor5-build-multi-root/build/ckeditor.js"></script>
<script>
	MultiRootEditor
			.create( {
				header: document.getElementById( 'header' ),
				content: document.getElementById( 'content' ),
				leftSide: document.getElementById( 'left-side' ),
				rightSide: document.getElementById( 'right-side' )
			} )
			.then( editor => {
				window.editor = editor;

				// Append toolbar to a proper container.
				const toolbarContainer = document.getElementById( 'toolbar' );
				toolbarContainer.appendChild( editor.ui.view.toolbar.element );
			} )
			.catch( error => {
				console.error( 'There was a problem initializing the editor.', error );
			} );
</script>

```

Or in your JavaScript application:

```js
import MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';

// Or using the CommonJS version:
// const MultiRootEditor = require( '@ckeditor/ckeditor5-build-multi-root' );

MultiRootEditor
	.create( {
		header: document.getElementById( 'header' ),
		content: document.getElementById( 'content' ),
		leftSide: document.getElementById( 'left-side' ),
		rightSide: document.getElementById( 'right-side' )
	} )
	.then( editor => {
		window.editor = editor;

		// Append toolbar to a proper container.
		const toolbarContainer = document.getElementById( 'toolbar' );
		toolbarContainer.appendChild( editor.ui.view.toolbar.element );
	} )
	.catch( error => {
		console.error( 'There was a problem initializing the editor.', error );
	} );
```

**Note:** If you are planning to integrate CKEditor&nbsp;5 deep into your application, it is actually more convenient and recommended to install and import the source modules directly (like it happens in `ckeditor.js`). Read more in the [Advanced setup guide](https://ckeditor.com/docs/ckeditor5/latest/installation/advanced/advanced-setup.html).

## License

Licensed under the terms of [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, please check the `LICENSE.md` file or [https://ckeditor.com/legal/ckeditor-oss-license](https://ckeditor.com/legal/ckeditor-oss-license).
