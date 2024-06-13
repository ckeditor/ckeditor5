---
title: Markdown output
meta-title: Markdown output | CKEditor 5 Documentation
meta-description: The Markdown plugin lets you switch the default CKEditor 5 output from HTML to Markdown.
category: features
---

The Markdown plugin lets you switch the default output from HTML to Markdown. This way you can produce lightweight text documents with a simple formatting syntax that is popular among developers.

## Demo

The editor below is configured to output GitHub Flavored Markdown. Edit the content and see how the Markdown output changes (you can find it below the editor).

<info-box info>
	Please note that the source editing feature in the demo below is a {@link features/source-editing separate plugin}. If you would like to use it in your integration, you need to install it separately.
</info-box>

{@snippet features/markdown}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

 Coupled with the {@link features/autoformat autoformatting} feature, the Markdown plugin offers the full-fledged Markdown WYSIWYG editing experience, as described in the ["CKEditor&nbsp;5: the best open source Markdown editor"](https://ckeditor.com/blog/CKEditor-5-the-best-open-source-Markdown-editor/) blog post. Visit the [free online Markdown editor](https://onlinemarkdowneditor.dev/) to see this solution implemented.

Please remember that Markdown syntax is really simple and it does not cover all the rich-text features. Some features provided by CKEditor&nbsp;5 will thus work as intended only when output to HTML as they have no Markdown equivalent.

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/quick-start installing the editor}, add the {@link module:markdown-gfm/markdown~Markdown} plugin to the editor configuration. It will change the default {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor} to the {@link module:markdown-gfm/gfmdataprocessor~GFMDataProcessor}:

```js
import { ClassicEditor, Bold, Italic, Essentials, Markdown } from 'ckeditor5';
// More imports.
// ...

ClassicEditor
	.create( document.querySelector( '#snippet-markdown' ), {
		plugins: [
			Markdown,
			Essentials,
			Bold,
			Italic,
			// More plugins.
			// ...
		],
		// More of editor's configuration.
		// ...
	} )
	.then( /* ... */ )
	.catch( /* ... */ );

```

## Extending formatting support
If you need more extensive Markdown support for formatting elements (for example, having the `title` attribute on links represented as `[Foo Bar](https://foo.bar "My link title")`), you can also install {@link features/general-html-support General HTML Support}. This advanced feature allows the integrators to provide additional tags, elements, and attributes, not yet supported by other CKEditor&nbsp;5 plugins and extend the formatting capabilities.

## The Markdown data processor

The Markdown plugin uses a {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor} (implemented by the {@link module:markdown-gfm/gfmdataprocessor~GFMDataProcessor} class) which changes the default output from HTML to Markdown. This means that you can {@link module:core/editor/editor~Editor#setData set} or {@link module:core/editor/editor~Editor#getData get} data from the editor in the Markdown format:

```js
editor.getData(); // -> 'This is [CKEditor&nbsp;5](https://ckeditor.com).'

editor.setData( 'This is **bold**.' );
```

The data processor outputs the GFM Markdown syntax. "GFM" stands for "GitHub Flavored Markdown" &ndash; a Markdown dialect used by [GitHub](https://github.com). Markdown lacks any formal specification (although the [CommonMark](https://commonmark.org/) initiative aims to close this gap) and has many dialects, often incompatible with one another.

When converting the output produced by this data processor, make sure to use a compatible Markdown-to-HTML converter (for example, the [marked](https://www.npmjs.com/package/marked) library).

<info-box info>
	While the CKEditor&nbsp;5 architecture supports changing the data format, in most scenarios we do recommend sticking to the default format which is HTML (supported by the {@link module:engine/dataprocessor/htmldataprocessor~HtmlDataProcessor}). HTML remains [the best standard for rich-text data](https://medium.com/content-uneditable/a-standard-for-rich-text-data-4b3a507af552).

	And please do remember &ndash; using Markdown [does not automatically make your application or website secure](https://github.com/ckeditor/ckeditor5-markdown-gfm/issues/16#issuecomment-375752994).
</info-box>

## Known issues

<info-box info>
	Please bear in mind that the Markdown data processor does not support all rich text features. The [Markdown syntax](https://daringfireball.net/projects/markdown/syntax) is really simple and only supports limited formatting options.

	This means that advanced formatting like list styles, table styles, or page break markers will be stripped in the effecting data. These are not supported by Markdown and therefore cannot be converted from HTML to Markdown.
</info-box>

While the Markdown plugin is stable and ready to use, some issues are still being worked on. Feel free to upvote 👍&nbsp; these on GitHub if you would like to see this introduced.

* Pasting Markdown-formatted content does not automatically convert the pasted syntax markers into properly formatted content. GitHub issues: [#2321](https://github.com/ckeditor/ckeditor5/issues/2321), [#2322](https://github.com/ckeditor/ckeditor5/issues/2322).
* The Markdown code generated with the Markdown output feature will not properly render {@link features/tables#nesting-tables nested tables}. GitHub issue: [#9475](https://github.com/ckeditor/ckeditor5/issues/9475).

## Related features

Some other ways to output the edited content include:

* {@link features/source-editing#markdown-source-view Source editing} &ndash; Allows for Markdown source edition if configured accordingly.
* {@link features/export-word Export to Word} &ndash; Generate editable `.docx` files out of your editor-created content.
* {@link features/export-pdf Export to PDF} &ndash; Generate portable PDF files out of your editor-created content.
* {@link features/autoformat Autoformatting} &ndash; Use Markdown syntax shortcodes to automatically format your content as you type!
* {@link features/paste-markdown Paste Markdown} &ndash; Paste Markdown-formatted content straight into the editor.

## Contribute

The source code of this feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-markdown-gfm](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-markdown-gfm).
