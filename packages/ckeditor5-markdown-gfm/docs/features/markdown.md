---
title: Markdown output
category: features
---

The {@link module:markdown-gfm/gfmdataprocessor~GFMDataProcessor} class implements a {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor} which changes CKEditor output from HTML to Markdown. This means that you can {@link module:core/editor/standardeditor~StandardEditor#setData set} or {@link module:core/editor/standardeditor~StandardEditor#getData get} data from the editor in the Markdown format:

```js
editor.getData(); // -> 'This is [CKEditor 5](https://ckeditor5.github.io).'

editor.setData( 'This is **bold**.' );
```

<info-box info>
	"GFM" stands for "GitHub Flavored Markdown" &mdash; a Markdown dialect used by [GitHub](https://github.com). Markdown lacks any formal specification and has many dialects, often incompatible with each other. When converting the output produced by this data processor make sure to use a compatible Markdown to HTML converter (e.g. the [marked](https://www.npmjs.com/package/marked) library).
</info-box>

## Installation

To enable this data processor in your editor install the [`@ckeditor/ckeditor5-markdown-gfm`](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm) package:

```
npm install --save @ckeditor/ckeditor5-markdown-gfm
```

Then, you can enable this data processor by creating a simple plugin which will load it:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePreset from '@ckeditor/ckeditor5-presets/src/article';

import GFMDataProcessor from '@ckeditor/ckeditor5-markdown-gfm/src/gfmdataprocessor';

// Simple plugin which loads the data processor.
function Markdown( editor ) {
	editor.data.processor = new GFMDataProcessor();
}

ClassicEditor
	.create( document.querySelector( '#snippet-markdown' ), {
		plugins: [ ArticlePreset, Markdown ],
		// ...
	} )
	.then( ... )
	.catch( ... );

```

## Demo

{@snippet features/markdown}

## Contribute

The source code of this feature is available on GitHub in https://github.com/ckeditor/ckeditor5-markdown-gfm.
