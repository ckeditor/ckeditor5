---
title: Autoformatting
category: features
---

The autoformat feature lets you quickly format your content with Markdown-like shortcodes. This way you do not need to use toolbar buttons or dropdowns for the most common formatting features.

## Demo

Use the editor provided below to test the autoformatting feature. Try using Markdown shortcodes while typing, for example:

1. Delete all editor content.
2. Press <kbd>#</kbd> and then <kbd>Space</kbd>.
3. The current line will be instantly turned into a heading and you can keep on typing without interruption.

If needed, you can revert the automatic change by pressing <kbd>Backspace</kbd>.

{@snippet features/autoformat}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Block formatting

The following block formatting options are available:

* {@link features/lists Bulleted list} &ndash; Start a line with `*` or `-` followed by a space.
* {@link features/lists Numbered list} &ndash; Start a line with `1.` or `1)` followed by a space.
* {@link features/todo-lists To-do list} &ndash; Start a line with `[ ]` or `[x]` followed by a space to insert an unchecked or checked list item, respectively.
* {@link features/headings Headings} &ndash; Start a line with `#` or `##` or `###` followed by a space to create a heading 1, heading 2, or heading 3 (up to heading 6 if {@link module:heading/heading~HeadingConfig#options} defines more headings).
* {@link features/block-quote Block quote} &ndash; Start a line with `>` followed by a space.
* {@link features/code-blocks Code block} &ndash; Start a line with `` ``` ``.
* {@link features/horizontal-line Horizontal line} &ndash; Start a line with `---`.

## Inline formatting

The following {@link features/basic-styles basic styles} inline formatting options are available:

* Bold &ndash; Type `**text**` or `__text__`,
* Italic &ndash; Type `*text*` or `_text_`,
* Code &ndash; Type ``` `text` ```,
* Strikethrough &ndash; Type `~~text~~`.

## Installation

<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}. The installation instructions are for developers interested in building their own, custom editor.
</info-box>

To add this feature to your editor install the [`@ckeditor/ckeditor5-autoformat`](https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat) package:

```bash
npm install --save @ckeditor/ckeditor5-autoformat
```

And add it to your plugin list:

```js
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Autoformat, /* ... */ ],
		toolbar: [ /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box hint>
	Remember to add proper features to the editor configuration. Autoformatting will be enabled only for the commands that are included in the actual configuration. For example, `bold` autoformatting will not work if there is no `bold` command registered in the editor.
</info-box>

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Creating custom autoformatters

The {@link module:autoformat/autoformat~Autoformat} feature bases on {@link module:autoformat/blockautoformatediting~blockAutoformatEditing} and {@link module:autoformat/inlineautoformatediting~inlineAutoformatEditing} tools to create the autoformatters mentioned above.

You can use these tools to create your own autoformatters. Check the [`Autoformat` feature's code](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-autoformat/src/autoformat.js) as an example.

## Known issues

While the autoformatting feature is stable and ready to use, some issues were reported for it. Feel free to upvote 👍&nbsp; them on GitHub if they are important for you:
* Pasting Markdown-formatted content does not automatically convert the pasted syntax markers into properly formatted content. GitHub issues: [#2321](https://github.com/ckeditor/ckeditor5/issues/2321), [#2322](https://github.com/ckeditor/ckeditor5/issues/2322).
* Setting a specific code block language is not supported yet (it defaults to plain text on insertion). GitHub issue: [#8598](https://github.com/ckeditor/ckeditor5/issues/8598).

## Related features

In addition to enabling automatic text formatting, you may want to check the following productivity features:

* {@link features/text-transformation Automatic text transformation} &ndash; Enables automatic turning of snippets such as `(tm)` into `™` and `"foo"` into `“foo”`.
* {@link features/link#autolink-feature Autolink} &ndash; Turns the links and email addresses typed or pasted into the editor into active URLs.
* {@link features/mentions Mentions} &ndash; Brings support for smart autocompletion.
* {@link features/markdown Markdown output} &ndash; Lets the user output the content as Markdown instead of HTML and [use CKEditor 5 as a WYSIWYG Markdown editor](https://ckeditor.com/blog/CKEditor-5-the-best-open-source-Markdown-editor/).
* {@link features/source-editing#markdown-source-view Source editing} &ndash; Allows for Markdown source edition if configured accordingly.

Coupled with the {@link features/markdown Markdown output} feature, the autoformatting feature allows for the full-fledged Markdown WYSIWYG editing experience, as described in the ["CKEditor 5: the best open source Markdown editor"](https://ckeditor.com/blog/CKEditor-5-the-best-open-source-Markdown-editor/) blog post. Visit the [free online Markdown editor](https://onlinemarkdowneditor.dev/) to see this solution implemented.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-autoformat](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-autoformat).
