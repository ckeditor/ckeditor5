---
menu-title: Drag and drop
category: features-pasting
order: 40
---

# Drag and drop

The drag and drop feature lets you drag and drop text, images, tables, and other content within the editor. You can also drag and drop HTML and plain-text content from outside the editor.

## Demo

The sample below allows you to drag contacts from the list to the editor below. They are inserted into the editor as custom widgets representing the [h-card microformat](http://microformats.org/wiki/h-card).

{@snippet features/drag-drop}

Photos: [Wikipedia.org](http://en.wikipedia.org).

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

The source code of the above snippet is available here: [`drag-drop.js`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard/docs/_snippets/features/drag-drop.js), [`drag-drop.html`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard/docs/_snippets/features/drag-drop.html).

## Additional feature information

The drag and drop feature is implemented by the `DragDrop` plugin which is a part of the `Clipboard` feature.

See the screencast below for what you can expect from drag and drop support of text and blocks in CKEditor 5. Use the [demo](#demo) EDITOR to play with dragging content from outside the editor into a document.

{@img assets/img/drag-drop.gif A screencast of drag and drop of text and blocks in CKEditor 5.}

## Installation

<info-box info>
	This feature is required by the clipboard plugin and is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}. These installation instructions are for developers interested in building their own custom rich-text editor.
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-clipboard`](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard) package:

```
npm install --save @ckeditor/ckeditor5-clipboard
```

Then add the {@link module:clipboard/clipboard~Clipboard `Clipboard`} plugin to your plugin list:

```js
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Clipboard, Bold, /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

The {@link module:clipboard/dragdrop~DragDrop `DragDrop`} plugin will activate along with the clipboard plugin.

## Known issues

At the moment, the drag and drop feature supports textual content as well as widgets. Bringing support for blocks of any type is tracked in [issue #7731](https://github.com/ckeditor/ckeditor5/issues/7731). If you would like to see this feature implemented, make sure you add a 👍 &nbsp; to the issue on GitHub.

## Related features

* CKEditor 5 supports dropping images from the file system thanks to the {@link features/image-upload image upload} feature.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard).
