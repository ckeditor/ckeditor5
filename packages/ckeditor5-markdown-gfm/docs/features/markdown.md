---
title: Markdown output
category: features
---

The {@link module:markdown-gfm/markdown~Markdown} plugin allows switching the default CKEditor 5 output from HTML to Markdown. This allows for producing lightweight text documents with a simple formatting syntax, widespread among the programming and development communities and popular in many environments (e.g. GitHub). Coupled with the {@link features/autoformat autoformatting} feature, it allows for the full-fledged Markdown WYSIWYG editing experience, as described in the ["CKEditor 5: the best open source Markdown editor"](https://ckeditor.com/blog/CKEditor-5-the-best-open-source-Markdown-editor/) blog post.

Please remember that Markdown syntax is very simple and it does not cover all the rich-text features. Some features provided by CKEditor 5 will thus work as intended only when output to HTML as they have no Markdown equivalent.

<info-box info>
	You can learn more about the possible practical applications of Markdown editing with CKEditor 5 in [this dedicated blog post depicting the idea, solutions and a case study](https://ckeditor.com/blog/CKEditor-5-the-best-open-source-Markdown-editor/).
</info-box>


## Demo

The CKEditor 5 instance below is configured to output GitHub Flavored Markdown. Use the editor to create your content and see the Markdown output displayed as you type below the editor.

{@snippet features/markdown}

## Related features

Some other ways to output the edited content include:

* {@link features/export-word Export to Word} &ndash; Generate editable `.docx` files out of your editor-created content.
* {@link features/export-pdf Export to PDF} &ndash; Generate portable PDF files out of your editor-created content.
* {@link features/autoformat Autoformatting} &ndash; Use Markdown syntax shortcodes to automatically format your content as you type!
* {@link features/source-editing#markdown-source-view Source editing} &ndash; Allows for Markdown source edition if configured accordingly.

## The Markdown data processor

The Markdown plugins uses a {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor} (implemented by the {@link module:markdown-gfm/gfmdataprocessor~GFMDataProcessor} class) which changes the default output from HTML to Markdown. This means that you can {@link module:core/editor/utils/dataapimixin~DataApi#setData set} or {@link module:core/editor/utils/dataapimixin~DataApi#getData get} data from the editor in the Markdown format:

```js
editor.getData(); // -> 'This is [CKEditor 5](https://ckeditor.com).'

editor.setData( 'This is **bold**.' );
```

The data processor outputs the GFM Markdown syntax. "GFM" stands for "GitHub Flavored Markdown" &mdash; a Markdown dialect used by [GitHub](https://github.com). Markdown lacks any formal specification (although the [CommonMark](https://commonmark.org/) initiative aims to close this gap) and has many dialects, often incompatible with one another.

When converting the output produced by this data processor, make sure to use a compatible Markdown-to-HTML converter (e.g. the [marked](https://www.npmjs.com/package/marked) library).

<info-box info>
	This feature is experimental. While the CKEditor 5 architecture supports changing the data format, in most scenarios we do recommend sticking to the default format which is HTML (supported by the {@link module:engine/dataprocessor/htmldataprocessor~HtmlDataProcessor}). HTML remains [the best standard for rich-text data](https://medium.com/content-uneditable/a-standard-for-rich-text-data-4b3a507af552).

	And please do remember &mdash; using Markdown [does not automatically make your application or website secure](https://github.com/ckeditor/ckeditor5-markdown-gfm/issues/16#issuecomment-375752994).
</info-box>

## Installation

To enable this data processor in your editor, install the [`@ckeditor/ckeditor5-markdown-gfm`](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm) package:

```
npm install --save @ckeditor/ckeditor5-markdown-gfm
```

Then add the {@link module:markdown-gfm/markdown~Markdown} plugin to the editor configuration, which will change the default {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor} to the {@link module:markdown-gfm/gfmdataprocessor~GFMDataProcessor}:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
// ...

import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';

ClassicEditor
	.create( document.querySelector( '#snippet-markdown' ), {
		plugins: [
			Markdown,

			Essentials,
			Bold,
			Italic,
			// ...
		],
		// ...
	} )
	.then( ... )
	.catch( ... );

```

## Known issues

<info-box info>
	Please bear in mind that the Markdown data processor does not support all rich text features. The [Markdown syntax](https://daringfireball.net/projects/markdown/syntax) is very simple and only supports limited formatting options.

	This means that advanced formatting like list styles, table styles or page break markers will be stripped in the effecting data. These are not supported by Markdown and therefore cannot be converted from HTML to Markdown.
</info-box>

While the Markdown plugin is stable and ready to use, some issues are still being worked on. Feel free to upvote 👍&nbsp; these on GitHub if you would like to see this introduced.

* Pasting Markdown-formatted content does not automatically convert the pasted syntax markers into properly formatted content. GitHub issues: [#2321](https://github.com/ckeditor/ckeditor5/issues/2321), [#2322](https://github.com/ckeditor/ckeditor5/issues/2322).
* The Markdown code generated with the Markdown output feature will not properly render {@link features/table#nesting-tables nested tables}. GitHUb issue: [#9475](https://github.com/ckeditor/ckeditor5/issues/9475).

## Contribute

The source code of this feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-markdown-gfm.
