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

Output:

<ck:code-block id="snippet-paste-from-markdown-output" language="markdown">
	## Markdown 🛫

	Paste some Markdown-formatted content and see the output below.
</ck:code-block>

<snippet-footer>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</snippet-footer>

## Installation

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, Bold, Italic, Essentials, PasteFromMarkdownExperimental } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#snippet-markdown' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [
			PasteFromMarkdownExperimental,
			Essentials,
			Bold,
			Italic,
			// More plugins.
			// ...
		],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );

```
</code-switcher>

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
