---
menu-title: Paste Markdown
meta-title: Paste Markdown | CKEditor 5 Documentation
meta-description: The paste Markdown feature lets users paste Markdown-formatted content straight into CKEditor 5.
category: features-pasting
order: 40
modified_at: 2023-11-24
---

# Paste Markdown

The paste Markdown feature lets users paste Markdown-formatted content straight into the editor. It will be then converted into rich text on the fly.

<info-box warning>
	This feature is still in the experimental phase. See the [known issues](#known-issues) section to learn more.
</info-box>

## Demo

Paste some Markdown-formatted content into the demo editor below and see it turn into rich text on the fly. You can copy [this document](%BASE_PATH%/assets/markdown.txt) for convenience.

{@snippet features/paste-from-markdown}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	This feature is not available in any of the {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

To enable this data processor in your editor, install the [`@ckeditor/ckeditor5-markdown-gfm`](https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm) package:

```
npm install --save @ckeditor/ckeditor5-markdown-gfm
```

Then add the {@link module:markdown-gfm/pastefrommarkdownexperimental~PasteFromMarkdownExperimental} plugin to the editor configuration:

```js
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
// More imports.
// ...

import { PasteFromMarkdownExperimental } from '@ckeditor/ckeditor5-markdown-gfm';

ClassicEditor
	.create( document.querySelector( '#snippet-markdown' ), {
		plugins: [
			PasteFromMarkdownExperimental,
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

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Known issues

While the paste Markdown feature is already stable enough to use, it still needs some more testing. We are now focused on testing it in connection with other tools and plugins. If you have any observations, suggestions, or feedback you want to share, feel free to put them in [this GitHub issue](https://github.com/ckeditor/ckeditor5/issues/2321).

## Related features

CKEditor&nbsp;5 supports a wider range of paste features, including:
* {@link features/paste-from-office Paste from Office} &ndash; Paste content from Microsoft Word and keep the original structure and formatting.
* {@link features/paste-from-google-docs Paste from Google Docs} &ndash; Paste content from Google Docs, maintaining the original formatting and structure.
* {@link features/paste-plain-text Paste plain text} &ndash; Paste text without formatting that will inherit the style of the content it was pasted into.
* {@link features/autoformat Autoformatting} &ndash; Format your content on the go with Markdown-like shortcodes.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-markdown-gfm](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-markdown-gfm)
