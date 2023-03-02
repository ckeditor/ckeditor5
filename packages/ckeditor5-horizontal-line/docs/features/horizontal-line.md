---
category: features
menu-title: Horizontal line
---

# Horizontal line

The horizontal line feature lets you visually divide your content into sections by inserting horizontal lines (also known as horizontal rules). It is an easy way to organize the content or indicate a change of topic.

## Demo

To insert a horizontal line in the demo below, use the toolbar button {@icon @ckeditor/ckeditor5-horizontal-line/theme/icons/horizontalline.svg Horizontal line}. Alternatively, start a new line with `---` to insert a horizontal line thanks to the {@link features/autoformat autoformatting feature}.

{@snippet features/horizontal-line}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	The horizontal line feature is enabled by default in the {@link installation/getting-started/predefined-builds#superbuild superbuild} only.
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-horizontal-line`](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-line) package:

```plaintext
npm install --save @ckeditor/ckeditor5-horizontal-line
```

And add it to your plugin list configuration:

```js
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ HorizontalLine, /* ... */ ],
		toolbar: [ 'horizontalLine', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Related features

CKEditor 5 has more features that can help you better organize your document content:
* {@link features/headings Headings} &ndash; Organize your content into thematic sections.
* {@link features/page-break Page break} &ndash; Divide your document into pages.
* {@link features/title Document title} &ndash; Clearly separate the title from the body.
* {@link features/lists Lists} &ndash;  Create ordered (numbered) and unordered (bulleted) lists.
* {@link features/autoformat Autoformatting} &ndash; Format the content on the go with Markdown code.

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
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-horizontal-line](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-horizontal-line).
