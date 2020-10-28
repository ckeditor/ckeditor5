---
menu-title: Paste plain text
category: features-pasting
order: 30
---

{@snippet features/build-paste-source}

# Pasting plain text

The plain text pasting feature is provided through the {@link module:clipboard/clipboard~Clipboard} plugin, which is responsible for the integration with the native clipboard and intercepts all native events like `copy`, `cut` or `drop` and handles them on its side. The goal is to not allow the browser to touch the content in the rich text editor which would lead to the browser messing it up.

The plain text pasting itself is further aided by the {@link module:clipboard/clipboard~PastePlainText} plugin. It detects the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> keystroke during the paste and causes the pasted plain text to inherit the styles of the content it was pasted into.

Pasting plain text with a double line break will turn it into a paragraph. This is a change from the previous behavior, when a single line break resulted in creating a paragraph. As of now, a single line break will be turned into a soft break upon pasting.

## Demo

Paste plain text between the styled paragraphs below using the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> to test the style inheritance. Paste without modifier to retain styleless text. You can copy this very paragraph or one from the demo for convenience.

{@snippet features/paste-plaintext}

## Related features

CKEditor 5 supports a wider range of paste features, including:
* {@link features/paste-from-word Paste from Word} &ndash; Allows you to paste content from Microsoft Word and maintain the original structure and formatting.
* {@link features/paste-from-google-docs Paste from Google Docs} &ndash; Allows you to paste content from Google Docs maintaining the original formatting and structure.

## Installation

<info-box info>
	This feature is enabled by default in all official builds. <!-- The installation instructions are for developers interested in building their own custom rich-text editor. -->
</info-box>

## Support for other applications

You can find more information regarding compatibility with other applications in [this ticket](https://github.com/ckeditor/ckeditor5/issues/1184#issuecomment-409828069).

If you think that support for any of the applications needs improvements, please add 👍  and comments in the following issues:

* [Support pasting from Excel](https://github.com/ckeditor/ckeditor5/issues/2513).
* [Support pasting from Libre Office](https://github.com/ckeditor/ckeditor5/issues/2520).
* [Support pasting from Pages](https://github.com/ckeditor/ckeditor5/issues/2527).

Feel free to open a [new feature request](https://github.com/ckeditor/ckeditor5/issues/new/choose) for other similar applications, too!
