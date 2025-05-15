---
title: Autoformatting
meta-title: Autoformatting | CKEditor 5 Documentation
category: features
---

The autoformat feature lets you quickly format your content with Markdown-like shortcodes. This way you do not need to use toolbar buttons or dropdowns for the most common formatting features.

## Demo

Test the autoformatting feature in the editor below. Try using Markdown shortcodes while typing. For example:

1. Start a new line.
2. Press <kbd>#</kbd> and then <kbd>Space</kbd>.

The line will automatically turn into a heading.

If needed, you can revert the automatic change by pressing <kbd>Backspace</kbd>.

{@snippet features/autoformat}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Block formatting

The following block formatting options are available:

* {@link features/lists Bulleted list} &ndash; Start a line with `*` or `-` followed by a space.
* {@link features/lists Numbered list} &ndash; Start a line with `1.` or `1)` followed by a space.
* {@link features/todo-lists To-do list} &ndash; Start a line with `[ ]` or `[x]` followed by a space to insert an unchecked or checked list item, respectively.
* {@link features/headings Headings} &ndash; Start a line with `#` or `##` or `###` followed by a space to create a heading 1, heading 2, or heading 3 (up to heading 6 if {@link module:heading/headingconfig~HeadingConfig#options} defines more headings).
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
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, Autoformat } from 'ckeditor5';

ClassicEditor.
	create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Autoformat, /* ... */ ],
		toolbar: [ /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

<info-box hint>
	Remember to add proper features to the editor configuration. Autoformatting will be enabled only for the commands that are included in the actual configuration. For example, `bold` autoformatting will not work if there is no `bold` command registered in the editor.
</info-box>

## Creating custom autoformatters

The {@link module:autoformat/autoformat~Autoformat} feature bases on {@link module:autoformat/blockautoformatediting~blockAutoformatEditing} and {@link module:autoformat/inlineautoformatediting~inlineAutoformatEditing} tools to create the autoformatters mentioned above.

You can use these tools to create your own autoformatters. Check the [`Autoformat` feature's code](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-autoformat/src/autoformat.ts) as an example.

## Known issues

While the autoformatting feature is stable and ready to use, some issues were reported for it. Feel free to upvote 👍&nbsp; them on GitHub if they are important for you:
* Pasting Markdown-formatted content does not automatically convert the pasted syntax markers into properly formatted content. GitHub issues: [#2321](https://github.com/ckeditor/ckeditor5/issues/2321), [#2322](https://github.com/ckeditor/ckeditor5/issues/2322).
* Setting a specific code block language is not supported yet (it defaults to plain text on insertion). GitHub issue: [#8598](https://github.com/ckeditor/ckeditor5/issues/8598).

## Related features

In addition to enabling automatic text formatting, you may want to check the following productivity features:

* {@link features/text-transformation Automatic text transformation} &ndash; Enables automatic turning of snippets such as `(tm)` into `™` and `"foo"` into `“foo”`.
* {@link features/link#autolink-feature Autolink} &ndash; Turns the links and email addresses typed or pasted into the editor into active URLs.
* {@link features/mentions Mentions} &ndash; Brings support for smart autocompletion.
* {@link features/slash-commands Slash commands} &ndash; Allows to execute a predefined command by writing its name or alias directly in the editor.
* {@link features/markdown Markdown output} &ndash; Lets the user output the content as Markdown instead of HTML and [use CKEditor&nbsp;5 as a WYSIWYG Markdown editor](https://ckeditor.com/blog/CKEditor-5-the-best-open-source-Markdown-editor/).
* {@link features/source-editing#markdown-source-view Source editing} &ndash; Allows for Markdown source edition if configured accordingly.

Coupled with the {@link features/markdown Markdown output} feature, the autoformatting feature allows for the full-fledged Markdown WYSIWYG editing experience, as described in the ["CKEditor&nbsp;5: the best open source Markdown editor"](https://ckeditor.com/blog/CKEditor-5-the-best-open-source-Markdown-editor/) blog post. Visit the [free online Markdown editor](https://onlinemarkdowneditor.dev/) to see this solution implemented.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-autoformat](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-autoformat).
