---
category: features
menu-title: Horizontal line
---

# Horizontal line

The {@link module:horizontal-line/horizontalline~HorizontalLine} plugin allows inserting a horizontal line into the rich-text editor.

Often known as the horizontal rule, it provides a visual way to separate the content. It may indicate a thematic shift (like a change of topic) between paragraphs or parts of the story or just be a simple graphic separator to help organize the content.

## Demo

To insert a horizontal line in the demo below, use the toolbar button {@icon @ckeditor/ckeditor5-horizontal-line/theme/icons/horizontalline.svg Horizontal line}. Alternatively, start new line with `---` to insert a horizontal line thanks to the {@link features/autoformat autoformatting feature}.

{@snippet features/horizontal-line}

## Related features

There are more CKEditor 5 features that can help you organize your document content better:
* {@link features/headings Headings} &ndash; Organize your content into thematic sections.
* {@link features/page-break Page break} &ndash; Divide your document into pages.
* {@link features/title Document title} &ndash; Clearly separate the title from the body.
* {@link features/lists Lists} &ndash;  Create ordered (numbered) and unordered (bulleted) lists.
* {@link features/autoformat Autoformatting} &ndash; Format the content on the go with Markdown code.

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-horizontal-line`](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line) package:

```plaintext
npm install --save @ckeditor/ckeditor5-horizontal-line
```

And add it to your plugin list configuration:

```js
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ HorizontalLine, ... ],
		toolbar: [ 'horizontalLine', ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link installation/getting-started/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:horizontal-line/horizontalline~HorizontalLine} plugin registers:
* the UI button component (`'horizontalLine'`),
* the `'horizontalLine'` command implemented by {@link module:horizontal-line/horizontallinecommand~HorizontalLineCommand}.

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Inserts a horizontal line into the selected content.
editor.execute( 'horizontalLine' );
```

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-horizontal-line.
