---
title: Block toolbar
category: features
---

The {@link module:ui/toolbar/block/blocktoolbar~BlockToolbar} plugin provides an additional [configurable](#configuration) toolbar on the left-hand side of the content area (the gutter). The toolbar is represented by a button with a pilcrow, or a paragraph mark, &#182;. It is positioned next to the block element that the selection is anchored to (e.g. a paragraph), following the caret as the user edits the content and navigates the document.

Since the toolbar is always connected to the block of content, it naturally accomodates the features that modify entire blocks (e.g. create headers or paragraphs) rather than inline styles (e.g. bold, italic, etc.).

## Example

<info-box hint>
	Move the caret around to see the block toolbar button following the selection. Click the button to use the toolbar.
</info-box>

{@snippet features/blocktoolbar}

## Configuration

The content of the toolbar can be defined using the {@link module:core/editor/editorconfig~EditorConfig#blockToolbar} configuration. See the [installation instructions](#installation) to learn more.

To adjust the position of the block toolbar button to match the styles of your website, use the CSS `transform` property:

```css
.ck.ck-block-toolbar-button {
	transform: translateX( -10px );
}
```

## Installation

<info-box hint>
	Remember to add relevant features to the editor configuration first. The block toolbar provides a space for the buttons, it does not bring the actual features. For example, the `heading1` button will not work if there is no {@link features/headings Headings} feature in the editor.
</info-box>

To add this feature to your editor install the [`@ckeditor/ckeditor5-ui`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ui) package:

```bash
npm install --save @ckeditor/ckeditor5-ui
```

And add it to your plugin list:

```js
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ BlockToolbar, ParagraphButtonUI, HeadingButtonsUI, ... ],
		blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3', '|', 'bulletedList', 'numberedList' ]
		toolbar: [ ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/development/installing-plugins installing plugins}.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-ui.
