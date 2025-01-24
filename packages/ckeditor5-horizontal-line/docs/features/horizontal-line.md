---
category: features
menu-title: Horizontal line
meta-title: Horizontal line | CKEditor 5 Documentation
---

# Horizontal line

The horizontal line feature lets you visually divide your content into sections by inserting horizontal lines (also known as horizontal rules). It is an easy way to organize the content or indicate a change of topic.

## Demo

To insert a horizontal line in the demo below, use the toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/horizontal-line.svg Horizontal line}. Alternatively, start a new line with `---`. The {@link features/autoformat autoformatting feature} will turn it into a horizontal line.

{@snippet features/horizontal-line}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, HorizontalLine } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ HorizontalLine, /* ... */ ],
		toolbar: [ 'horizontalLine', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Related features

CKEditor&nbsp;5 has more features that can help you better organize your document content:
* {@link features/headings Headings} &ndash; Organize your content into thematic sections.
* {@link features/page-break Page break} &ndash; Divide your document into pages.
* {@link features/title Document title} &ndash; Clearly separate the title from the body.
* {@link features/lists Lists} &ndash;  Create ordered (numbered) and unordered (bulleted) lists.
* {@link features/autoformat Autoformatting} &ndash; Format the content on the go with Markdown code.

## Common API

The {@link module:horizontal-line/horizontalline~HorizontalLine} plugin registers:
* the UI button component (`'horizontalLine'`),
* the `'horizontalLine'` command implemented by {@link module:horizontal-line/horizontallinecommand~HorizontalLineCommand}.

You can execute the command using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Inserts a horizontal line into the selected content.
editor.execute( 'horizontalLine' );
```

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-horizontal-line](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-horizontal-line).
