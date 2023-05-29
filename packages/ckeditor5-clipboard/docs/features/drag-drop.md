---
menu-title: Drag and drop
category: features-pasting
order: 40
---

{@snippet features/build-drag-drop-source}

# Drag and drop

The drag and drop feature lets you drag and drop text, images, tables, and other content within the editor. You can also drag and drop HTML and plain-text content from outside the editor.

## Demo

The demo below lets you drag contacts from the list to the editor. The contacts are inserted into the editor as custom widgets representing the [h-card microformat](http://microformats.org/wiki/h-card).

{@snippet features/drag-drop}

Photos: [Wikipedia.org](http://en.wikipedia.org).

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

The source code of the above snippet is available here: [`drag-drop.js`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard/docs/_snippets/features/drag-drop.js), [`drag-drop.html`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard/docs/_snippets/features/drag-drop.html).

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
import { Clipboard } from "@ckeditor/ckeditor5-clipboard";

ClassicEditor.create(document.querySelector("#editor"), {
	plugins: [Clipboard, Bold /* ... */],
})
	.then(/* ... */)
	.catch(/* ... */);
```

The {@link module:clipboard/dragdrop~DragDrop `DragDrop`} plugin will activate along with the clipboard plugin.

## Experimental drag and drop of blocks

In the version `38.0.0` we introduced experimental plugins for dragging blocks inside the editor. This allows you to select an entire block or blocks, and move them before or after other blocks.

<info-box warning>
	This is an **experimental feature**, it is available for users, developers, and enthusiasts, who want to test out new functionality and provide feedback to the product team. Usage in production environments may result in errors.
</info-box>

What works in the experimental release:

* Selection of the text, elements, multiple block, and moving them blocks.
* Placement of blocks inside other blocks: tables, blockquote, etc.
* The pilcrow icon in the Ballon block editor behaves as a drag handle.

Enable the drag and drop of blocks by adding to your plugins list the {@link module:clipboard/dragdropexperimental~DragDropExperimental `DragDropExperimental`} and additionally the {@link module:clipboard/dragdropblocktoolbar~DragDropBlockToolbar `DragDropBlockToolbar`} for a Balloon block editor.

Feedback for the drag and drop of block is gathered in [issue #7731](https://github.com/ckeditor/ckeditor5/issues/7731). If you have some thoughts what should work better, leave us a comment!

### Classic editor demo

Select a block or blocks, and drag them across the document. You can place blocks in the other blocks like tables and blockquotes.

{@snippet features/experimental-drag-drop}

Here's the configuration that will allow you to enable the blocks drag and drop in the Classic editor:

```js
import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { Clipboard, DragDropExperimental } from "@ckeditor/ckeditor5-clipboard";

ClassicEditor.create(document.querySelector("#editor"), {
	plugins: [Clipboard, DragDropExperimental /* ... */],
})
	.then(/* ... */)
	.catch(/* ... */);
```

### Balloon block editor demo

In a Balloon block editor you can also drag block with the drag handle. Select or focus on the block, and then drag the block with the pilcrow icon.

{@snippet features/experimental-balloon-drag-drop}

Here's the configuration that will allow you to enable the blocks drag and drop in the Balloon block editor:

```js
import { BalloonEditor } from "@ckeditor/ckeditor5-editor-balloon";
import {
	DragDropExperimental,
	DragDropBlockToolbar,
} from "@ckeditor/ckeditor5-clipboard";
import { BlockToolbar } from "@ckeditor/ckeditor5-ui";

BalloonEditor.create(document.querySelector("#editor"), {
	plugins: [
		Clipboard,
		DragDropExperimental,
		DragDropBlockToolbar,
		BlockToolbar,
		/* ... */
	],
})
	.then(/* ... */)
	.catch(/* ... */);
```

## Related features

* CKEditor 5 supports dropping images from the file system thanks to the {@link features/image-upload image upload} feature.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard).
