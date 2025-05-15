---
menu-title: Drag and drop
meta-title: Drag and drop | CKEditor 5 Documentation
meta-description: Learn all about using the drag and drop mechanism to manage content and uploads in CKEditor 5
category: features
---

# Drag and drop

The drag and drop feature lets you drag and drop both text and content blocks such as paragraphs, tables, or lists inside the editor. This allows you to select an entire block or multiple blocks, and move them before or after other blocks. You can also drag and drop HTML and plain text content from outside the editor and use it to upload images.

## Demo

The demo below lets you drag contacts from the list to the editor. The contacts are inserted into the editor as custom widgets representing the [h-card microformat](http://microformats.org/wiki/h-card). You can also select and drag around existing content inside the editor.

{@snippet features/drag-drop}

Photos: [Wikipedia.org](http://en.wikipedia.org).

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

The source code of the above snippet is available here: [`drag-drop.js`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard/docs/_snippets/features/drag-drop.js), [`drag-drop.html`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard/docs/_snippets/features/drag-drop.html). You can find the configuration of the editor used in the demo here: [`build-drag-drop-source.js`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-clipboard/docs/_snippets/features/build-drag-drop-source.js). The code for the custom plugin responsible for handling the h-cards is available here: [`hcard.js`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-clipboard/docs/_snippets/features/hcard.js).

## File upload via drag and drop

When the {@link features/ckbox CKBox file manager} is enabled in your CKEditor&nbsp;5 integration, you can upload files and images using the drag and drop mechanism. You can test this solution in the {@link features/ckbox#demo CKBox demo}.

## Drag and drop of content blocks

The drag and drop plugin fully supports dragging content blocks such as paragraphs, tables, or lists inside the editor by default. This allows you to select an entire block or multiple blocks, and move them before or after other blocks.

The drag and drop functions include:

* Selection of the text, elements, multiple blocks, and moving these around.
* Placement of blocks inside other blocks such as tables, blockquotes, etc.
* The braille dots panel icon {@icon @ckeditor/ckeditor5-icons/theme/icons/drag-indicator.svg Drag indicator}  in the [balloon block editor](#balloon-block-editor-demo) now behaves as a drag handle.

### Classic editor demo

Select a block or blocks, and drag them across the document. You can place blocks inside other blocks, such as tables and blockquotes.

{@snippet features/block-drag-drop}

### Balloon block editor demo

In the balloon block editor, you can also drag content blocks using the drag handle. Select or focus on the block, and then drag the block with the braille dots panel icon {@icon @ckeditor/ckeditor5-icons/theme/icons/drag-indicator.svg Drag indicator}.

{@snippet features/block-balloon-drag-drop}

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, Clipboard } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Clipboard, Bold, /* ... */ ],
	})
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

The {@link module:clipboard/dragdrop~DragDrop `DragDrop`} plugin will activate along with the clipboard plugin.

## Styling the drag and drop

The drag and drop target line color is managed by the CSS variable (`--ck-clipboard-drop-target-color`). You can use the following snippet to change the color of the line:

```css
:root {
	--ck-clipboard-drop-target-color: green;
}
```

## Related features

* CKEditor&nbsp;5 supports dropping images from the file system thanks to the {@link features/image-upload image upload} feature.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard).
