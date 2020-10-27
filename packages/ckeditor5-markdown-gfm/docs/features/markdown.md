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
	"GFM" stands for "GitHub Flavored Markdown" &mdash; a Markdown dialect used by [GitHub](https://github.com). Markdown lacks any formal specification and has many dialects, often incompatible with each other. When converting the output produced by this data processor make sure to use a compatible Markdown to HTML converter (e.g. the [marked](https://www.npmjs.com/package/marked) library).
</info-box>

<info-box info>
	This feature is still experimental but a stable version is coming soon.

	While the CKEditor 5 architecture supports changing the data format, in most scenarios we do recommend sticking to the default format which is HTML (supported by the {@link module:engine/dataprocessor/htmldataprocessor~HtmlDataProcessor}). HTML remains [the best standard for rich-text data](https://medium.com/content-uneditable/a-standard-for-rich-text-data-4b3a507af552).

	And please do remember – using Markdown [does not automatically make your application/website secure](https://github.com/ckeditor/ckeditor5-markdown-gfm/issues/16#issuecomment-375752994).
</info-box>

## Demo

{@snippet features/markdown}

## Related features

Some other ways to output the edited content include:

* {@link features/export-word Export to Word} &ndash; Generate editable `.docx` files out of your editor-created content.
* {@link features/export-pdf Export to PDF} &ndash; Generate portable PDF files out of your editor-created content.
* {@link features/autoformat Autoformatting} &ndash; Use markdown-like markers as you type and CKEditor 5 will automatically format your content!

## Installation

To enable this data processor in your editor install the [`@ckeditor/ckeditor5-markdown-gfm`](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm) package:

```
npm install --save @ckeditor/ckeditor5-markdown-gfm
```

Then, you can enable this data processor by using {@link module:markdown-gfm/markdown~Markdown} plugin which will change default {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor} with {@link module:markdown-gfm/gfmdataprocessor~GFMDataProcessor}:

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
