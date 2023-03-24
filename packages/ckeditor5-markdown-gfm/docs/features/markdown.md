---
title: Markdown output
category: features
---

The Markdown plugin lets you switch the default output from HTML to Markdown. This way you can produce lightweight text documents with a simple formatting syntax that is popular among developers.

## Demo

The CKEditor 5 instance below is configured to output GitHub Flavored Markdown. Use the editor to create your content and see the Markdown output displayed as you type below the editor.

<info-box info>
	Please observe that the source editing feature in the demo below is a {@link features/source-editing separate plugin}. If you would like to use it in your integration, it needs to be installed separately.
</info-box>

{@snippet features/markdown}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Additional feature information

 Coupled with the {@link features/autoformat autoformatting} feature, the Markdown plugin offers the full-fledged Markdown WYSIWYG editing experience, as described in the ["CKEditor 5: the best open source Markdown editor"](https://ckeditor.com/blog/CKEditor-5-the-best-open-source-Markdown-editor/) blog post. Visit the [free online Markdown editor](https://onlinemarkdowneditor.dev/) to see this solution implemented.

Please remember that Markdown syntax is very simple and it does not cover all the rich-text features. Some features provided by CKEditor 5 will thus work as intended only when output to HTML as they have no Markdown equivalent.

## Extending formatting support
If you need more extensive Markdown support for formatting elements (for example, having the `title` attribute on links represented as `[Foo Bar](https://foo.bar "My link title")`), you can also install {@link features/general-html-support General HTML Support}. This advanced feature allows the integrators to provide additional tags, elements, and attributes, not yet supported by other CKEditor 5 plugins and extend the formatting capabilities.

## The Markdown data processor

The Markdown plugin uses a {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor} (implemented by the {@link module:markdown-gfm/gfmdataprocessor~GFMDataProcessor} class) which changes the default output from HTML to Markdown. This means that you can {@link module:core/editor/utils/dataapimixin~DataApi#setData set} or {@link module:core/editor/utils/dataapimixin~DataApi#getData get} data from the editor in the Markdown format:

```js
editor.getData(); // -> 'This is [CKEditor 5](https://ckeditor.com).'

editor.setData( 'This is **bold**.' );
```

The data processor outputs the GFM Markdown syntax. "GFM" stands for "GitHub Flavored Markdown" &mdash; a Markdown dialect used by [GitHub](https://github.com). Markdown lacks any formal specification (although the [CommonMark](https://commonmark.org/) initiative aims to close this gap) and has many dialects, often incompatible with one another.

When converting the output produced by this data processor, make sure to use a compatible Markdown-to-HTML converter (e.g. the [marked](https://www.npmjs.com/package/marked) library).

<info-box info>
	While the CKEditor 5 architecture supports changing the data format, in most scenarios we do recommend sticking to the default format which is HTML (supported by the {@link module:engine/dataprocessor/htmldataprocessor~HtmlDataProcessor}). HTML remains [the best standard for rich-text data](https://medium.com/content-uneditable/a-standard-for-rich-text-data-4b3a507af552).

	And please do remember &mdash; using Markdown [does not automatically make your application or website secure](https://github.com/ckeditor/ckeditor5-markdown-gfm/issues/16#issuecomment-375752994).
</info-box>

## Installation

<info-box info>
	This feature is not available in any of the {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

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
// More imports.
// ...

import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';

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
		// More of editor's config.
		// ...
	} )
	.then( /* ... */ )
	.catch( /* ... */ );

```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Known issues

<info-box info>
	Please bear in mind that the Markdown data processor does not support all rich text features. The [Markdown syntax](https://daringfireball.net/projects/markdown/syntax) is very simple and only supports limited formatting options.

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

## Contribute

The source code of this feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-markdown-gfm](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-markdown-gfm).
