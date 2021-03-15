---
menu-title: Drag and drop
category: features-pasting
order: 40
---

# Drag and drop

The drag and drop feature is implemented by the {@link module:clipboard/dragdrop~DragDrop} plugin which is a part of the {@link module:clipboard/clipboard~Clipboard} feature.

{@img assets/img/drag-drop.gif Drag & drop demo.}

## Demo

The sample below allows you to drag contacts from the list on the right-hand side to the editor on the left-hand side. They are inserted into the editor as custom widgets representing the [h-card microformat](http://microformats.org/wiki/h-card).

{@snippet features/drag-drop}

Photos: [Wikipedia.org](http://en.wikipedia.org).

Source code of the above snippet is available here: [`drag-drop.js`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard/docs/_snippets/features/drag-drop.js), [`drag-drop.html`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard/docs/_snippets/features/drag-drop.html).

## Related features

CKEditor 5 supports dropping images from the file system by the {@link features/image-upload Image upload} feature.

## Installation

<info-box info>
	This feature is required by the clipboard plugin and is enabled by default in all official builds. The installation instructions are for developers interested in building their own custom rich-text editor.
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

