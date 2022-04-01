---
menu-title: Drag and drop
category: features-pasting
order: 40
---

# Drag and drop

The drag and drop feature brings support for dragging and dropping textual content as well as block objects (like images or tables) within the rich-text editor. It also allows for dropping HTML and plain text content from outside of the editor into CKEditor 5.

This feature is implemented by the {@link module:clipboard/dragdrop~DragDrop} plugin which is a part of the {@link module:clipboard/clipboard~Clipboard} feature.

See the screencast below for what you can expect from drag and drop support of text and blocks in CKEditor 5. Use the [demo](#demo) below to play with dragging content from outside the editor into a document.

{@img assets/img/drag-drop.gif A screencast of drag and drop of text and blocks in CKEditor 5.}

<info-box info>
	This feature is enabled by default in all {@link installation/advanced/predefined-builds predefined builds}.
</info-box>

## Demo

The sample below allows you to drag contacts from the list to the editor below. They are inserted into the editor as custom widgets representing the [h-card microformat](http://microformats.org/wiki/h-card).

{@snippet features/drag-drop}

Photos: [Wikipedia.org](http://en.wikipedia.org).

The source code of the above snippet is available here: [`drag-drop.js`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard/docs/_snippets/features/drag-drop.js), [`drag-drop.html`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard/docs/_snippets/features/drag-drop.html).

## Related features

CKEditor 5 supports dropping images from the file system thanks to the {@link features/image-upload image upload} feature.

## Installation

<info-box info>
	This feature is required by the clipboard plugin and is enabled by default in all predefined builds. These installation instructions are for developers interested in building their own custom rich-text editor.
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
		plugins: [ Clipboard, Bold, ... ]
	} )
	.then( ... )
	.catch( ... );
```

The {@link module:clipboard/dragdrop~DragDrop `DragDrop`} plugin will activate along with the clipboard plugin.

## Known issues

At the moment, the drag and drop feature supports textual content as well as widgets. Bringing support for any types of blocks is tracked in [issue #7731](https://github.com/ckeditor/ckeditor5/issues/7731). If you  would like to see this feature implemented, make sure you add a 👍 &nbsp; to the issue on GitHub.

