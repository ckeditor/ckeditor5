---
title: Markdown output
category: features
---

The {@link module:markdown-gfm/gfmdataprocessor~GFMDataProcessor} class implements a {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor} which changes CKEditor output from HTML to Markdown. This means that you can {@link module:core/editor/utils/dataapimixin~DataApi#setData set} or {@link module:core/editor/utils/dataapimixin~DataApi#getData get} data from the editor in the Markdown format:

```js
editor.getData(); // -> 'This is [CKEditor 5](https://ckeditor.com).'

editor.setData( 'This is **bold**.' );
```

<info-box info>
	"GFM" stands for "GitHub Flavored Markdown" &mdash; a Markdown dialect used by [GitHub](https://github.com). Markdown lacks any formal specification (although the [CommonMark](https://commonmark.org/) initiative aims to close this gap) and has many dialects, often incompatible with one another. When converting the output produced by this data processor, make sure to use a compatible Markdown-to-HTML converter (e.g. the [marked](https://www.npmjs.com/package/marked) library).
</info-box>

<info-box info>
	This feature is still experimental but a stable version is coming soon.

	While the CKEditor 5 architecture supports changing the data format, in most scenarios we do recommend sticking to the default format which is HTML (supported by the {@link module:engine/dataprocessor/htmldataprocessor~HtmlDataProcessor}). HTML remains [the best standard for rich-text data](https://medium.com/content-uneditable/a-standard-for-rich-text-data-4b3a507af552).

	And please do remember &mdash; using Markdown [does not automatically make your application or website secure](https://github.com/ckeditor/ckeditor5-markdown-gfm/issues/16#issuecomment-375752994).
</info-box>

## Demo

The CKEditor 5 instance below is configured to output GitHub Flavored Markdown. Use the editor to create your content and see the Markdown output displayed as you type below the editor.

{@snippet features/markdown}

## Related features

Some other ways to output the edited content include:

* [Export to Word](https://ckeditor.com/docs/ckeditor5/latest/features/export-word.html) &ndash; Generate editable `.docx` files out of your editor-created content.
* [Export to PDF](https://ckeditor.com/docs/ckeditor5/latest/features/export-pdf.html) &ndash; Generate portable PDF files out of your editor-created content.
* {@link features/autoformat Autoformatting} &ndash; Use Markdown-like markers to automatically format your content as you type!

## Installation

To enable this data processor in your editor, install the [`@ckeditor/ckeditor5-markdown-gfm`](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm) package:

```
npm install --save @ckeditor/ckeditor5-markdown-gfm
```

Then, you can enable this data processor by using the {@link module:markdown-gfm/markdown~Markdown} plugin which will change the default {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor} to the {@link module:markdown-gfm/gfmdataprocessor~GFMDataProcessor}:

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

## Contribute

The source code of this feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-markdown-gfm.
