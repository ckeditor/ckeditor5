---
menu-title: Paste plain text
category: features-pasting
order: 30
---

{@snippet features/build-paste-source}

# Pasting plain text

With the plain text pasting feature, text pasted using the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> keystroke will match the formatting of the content you paste it into.

## Demo

Paste plain text between the styled paragraphs below using the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> to test the style inheritance. Paste without the <kbd>Shift</kbd> modifier to retain unstyled text. You can copy this very paragraph or one from the demo for convenience.

{@snippet features/paste-plain-text}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Additional feature information

The plain text pasting feature is implemented by the `PastePlainText` plugin which is a part of the `Clipboard` plugin.

It detects the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> keystroke during the paste and causes the pasted text to inherit the styles of the content it was pasted into. In this sense, the feature can also be described as "pasting without formatting" &mdash; the source formatting of the pasted text gets replaced with the target formatting of the text it was pasted into.

Pasting plain text with a double line break will turn the break into a paragraph. A single line break will instead be turned into a soft break upon pasting.

## Installation

<info-box info>
	This feature is required by the clipboard plugin and is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}. The installation instructions are for developers interested in building their own custom rich-text editor.
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-clipboard`](https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard) package:

```
npm install --save @ckeditor/ckeditor5-clipboard
```

Then add the {@link module:clipboard/clipboard~Clipboard `Clipboard`} plugin to your plugin list:

```js
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Clipboard, Bold, /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

The {@link module:clipboard/pasteplaintext~PastePlainText `PastePlainText`} plugin will activate along with the clipboard plugin.

## Support for other applications

You can find more information regarding compatibility with other applications in [this ticket](https://github.com/ckeditor/ckeditor5/issues/1184#issuecomment-409828069).

If you think that support for any of the applications needs improvements, please add 👍  and comments in the following issues:

* [Support pasting from Excel](https://github.com/ckeditor/ckeditor5/issues/2513).
* [Support pasting from Libre Office](https://github.com/ckeditor/ckeditor5/issues/2520).
* [Support pasting from Pages](https://github.com/ckeditor/ckeditor5/issues/2527).

Feel free to open a [new feature request](https://github.com/ckeditor/ckeditor5/issues/new/choose) for other similar applications, too!

## Related features

CKEditor 5 supports a wider range of paste features, including:
* {@link features/paste-from-word Paste from Word} &ndash; Paste content from Microsoft Word and maintain the original structure and formatting.
* {@link features/paste-from-google-docs Paste from Google Docs} &ndash; Paste content from Google Docs, maintaining the original formatting and structure.
* {@link features/import-word Import from Word} &ndash; Convert Word files directly into HTML content.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-clipboard).
