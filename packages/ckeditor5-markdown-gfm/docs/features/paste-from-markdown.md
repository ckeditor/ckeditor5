---
menu-title: Paste from Markdown
meta-title: Paste from Markdown | CKEditor 5 Documentation
category: features-pasting
order: 40
modified_at: 2023-11-10
---

{@snippet features/build-markdown-source}

# Paste from Markdown

xxxTODOs:

* Description what the PasteFromMarkdownExperimental is. What does it do, and why is it marked as experimental?
* How to use it?
* Demo (see below). It would be good to have some predefined content: “Copy and paste to see results.”
* Please, share your feedback that may impact the final shape of the plugin.

## Demo

xxx

{@snippet features/paste-from-markdown}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
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
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
// More imports.
// ...

import { Markdown } from '@ckeditor/ckeditor5-markdown-gfm';

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

* list issues

## Related features

CKEditor&nbsp;5 supports a wider range of paste features, including:
* {@link features/paste-from-office Paste from Office} &ndash; Paste content from Microsoft Word and maintain the original structure and formatting.
* {@link features/paste-from-google-docs Paste from Google Docs} &ndash; Paste content from Google Docs, maintaining the original formatting and structure.
* {@link features/paste-plain-text Paste plain text} &ndash; Paste text without formatting that will inherit the style of the content it was pasted into.
* {@link features/import-word Import from Word} &ndash; Convert Word files directly into HTML content.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard).
