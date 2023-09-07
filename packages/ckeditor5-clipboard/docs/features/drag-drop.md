---
menu-title: Drag and drop
meta-title: Drag and drop | CKEditor 5 Documentation
meta-description: Learn all about using the drag and drop mechanism to manage content and uploads in CKEditor 5
category: features
---

{@snippet features/build-drag-drop-source}

# Drag and drop

The drag and drop feature lets you drag and drop text, images, tables, and other content within the editor. You can also drag and drop HTML and plain-text content from outside the editor.

## Demo

The demo below lets you drag contacts from the list to the editor. The contacts are inserted into the editor as custom widgets representing the [h-card microformat](http://microformats.org/wiki/h-card).

{@snippet features/drag-drop}

Photos: [Wikipedia.org](http://en.wikipedia.org).

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

The source code of the above snippet is available here: [`drag-drop.js`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard/docs/_snippets/features/drag-drop.js), [`drag-drop.html`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard/docs/_snippets/features/drag-drop.html).

## File upload via drag and drop

When the {@link features/ckbox CKBox file manager} is enabled in your CKEditor&nbsp;5 integration, you can upload files and images using the drag and drop mechanism. You can test this solution in the {@link features/ckbox#demo CKBox demo}.

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
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Clipboard, Bold, /* ... */ ],
})
	.then( /* ... */ )
	.catch( /* ... */ );
```

The {@link module:clipboard/dragdrop~DragDrop `DragDrop`} plugin will activate along with the clipboard plugin.

## Drag and drop of content blocks

In the v38.0.0 release, we introduced plugins that enable dragging content blocks such as paragraphs, tables, or lists inside the editor. This allows you to select an entire block or multiple blocks, and move them before or after other blocks.

<info-box warning>
	This block drag and drop is still an **experimental feature**. It is available for users, developers, and enthusiasts, who want to test the new functionality and provide feedback to the product team. Usage in production environments may result in errors.
</info-box>

Functions introduced in the initial release include:

* Selection of the text, elements, multiple blocks, and moving these around.
* Placement of blocks inside other blocks such as tables, blockquotes, etc.
* The pilcrow icon 	{@icon @ckeditor/ckeditor5-core/theme/icons/pilcrow.svg} in the balloon block editor now behaves as a drag handle.

Feedback for the drag and drop of blocks is gathered in [issue #7731](https://github.com/ckeditor/ckeditor5/issues/7731). If you have any thoughts on what should work better, leave us a comment!

### Classic editor demo

Select a block or blocks, and drag them across the document. You can place blocks inside other blocks, such as tables and blockquotes.

{@snippet features/block-drag-drop}

#### Installation

To enable the block drag and drop in a classic editor, you need to add the {@link module:clipboard/dragdropexperimental~DragDropExperimental `DragDropExperimental`} module to your editor configuration:

```js
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Clipboard, DragDropExperimental } from '@ckeditor/ckeditor5-clipboard';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Clipboard, DragDropExperimental, /* ... */ ],
})
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Balloon block editor demo

In the balloon block editor, you can also drag content blocks using the drag handle. Select or focus on the block, and then drag the block with the pilcrow icon {@icon @ckeditor/ckeditor5-core/theme/icons/pilcrow.svg}.

{@snippet features/block-balloon-drag-drop}

#### Installation

To enable the block drag and drop in a balloon block editor, you need to add the {@link module:clipboard/dragdropexperimental~DragDropExperimental `DragDropExperimental`} and the {@link module:clipboard/dragdropblocktoolbar~DragDropBlockToolbar `DragDropBlockToolbar`} modules to your editor configuration::

```js
import { BalloonEditor } from '@ckeditor/ckeditor5-editor-balloon';
import {
	DragDropExperimental,
	DragDropBlockToolbar,
} from '@ckeditor/ckeditor5-clipboard';
import { BlockToolbar } from '@ckeditor/ckeditor5-ui';

BalloonEditor.create(document.querySelector( '#editor' ), {
	plugins: [
		Clipboard,
		DragDropExperimental,
		DragDropBlockToolbar,
		BlockToolbar,
		/* ... */
	],
})
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Related features

* CKEditor&nbsp;5 supports dropping images from the file system thanks to the {@link features/image-upload image upload} feature.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard).
