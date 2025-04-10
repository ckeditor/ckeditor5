---
menu-title: Paste plain text
meta-title: Paste plain text | CKEditor 5 Documentation
category: features-pasting
order: 30
---

# Pasting plain text

With the plain text pasting feature, text pasted using the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> keystroke will match the formatting of the content you paste it into.

## Demo

Copy some text from one of the styled paragraphs below and press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> to paste it into another paragraph. See how the pasted text matches the paragraph's style. Next, compare what happens when you paste the text without pressing <kbd>Shift</kbd>.

{@snippet features/paste-plain-text}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

The plain text pasting feature is implemented by the `PastePlainText` plugin which is a part of the `Clipboard` plugin.

It detects the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> keystroke during the paste and causes the pasted text to inherit the styles of the content it was pasted into. In this sense, the feature can also be described as "pasting without formatting" &ndash; the source formatting of the pasted text gets replaced with the target formatting of the text it was pasted into.

Pasting plain text with a double line break will turn the break into a paragraph. A single line break will instead be turned into a soft break upon pasting.

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { Bold, ClassicEditor, Clipboard } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Clipboard, Bold, /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

The {@link module:clipboard/pasteplaintext~PastePlainText `PastePlainText`} plugin will activate along with the clipboard plugin.

## Support for other applications

You can find more information regarding compatibility with other applications in [this ticket](https://github.com/ckeditor/ckeditor5/issues/1184#issuecomment-409828069).

If you think that support for any of the applications needs improvements, please add 👍  and comments in the following issues:

* [Support pasting from Excel](https://github.com/ckeditor/ckeditor5/issues/2513).
* [Support pasting from Libre Office](https://github.com/ckeditor/ckeditor5/issues/2520).
* [Support pasting from Pages](https://github.com/ckeditor/ckeditor5/issues/2527).

Feel free to open a [new feature request](https://github.com/ckeditor/ckeditor5/issues/new/choose) for other similar applications, too!

## Related features

CKEditor&nbsp;5 supports a wider range of paste features, including:
* {@link features/paste-markdown Paste Markdown} &ndash; Paste Markdown-formatted content straight into the editor.
* {@link features/paste-from-office Paste from Office} &ndash; Paste content from Microsoft Word and keep the original structure and formatting.
* {@link features/paste-from-google-docs Paste from Google Docs} &ndash; Paste content from Google Docs, maintaining the original formatting and structure.
* {@link features/import-word Import from Word} &ndash; Convert Word files directly into HTML content.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard).
