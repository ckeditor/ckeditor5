---
menu-title: Paste plain text
category: features-pasting
order: 30
---

# Pasting plain text

The Paste from Word feature is provided through the {@link module:clipboard/clipboard~Clipboard} plugin), which is responsible for the integration with the native clipboard and intercepts all native events like `copy`, `cut` or `drop` and handles them on its side. The goal is to not allow the browser to touch the content in the rich text editor which would lead to the browser messing it up.

The plain text pasting itself is further aided by the {@link module:clipboard/clipboard~PastePlainText} plugin. It detects the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> keystroke during the paste and causes the pasted plain text to inherit the styles of the content it was pasted into.

Pasting plain text with a double line break will turn it into a paragraph. This is a change from the previous behavior, when a single line break resulted in creating a paragraph. As of now, a single line break will be turned into a soft break upon pasting.

## Demo

To test how Paste from Office works, download the [sample Word document](../../assets/CKEditor5.PFO.Sample.Recognition_of_Achievement.docx), open it in Microsoft Word, copy the content, and paste it into CKEditor 5 below.

{@snippet features/paste-from-office}

## Installation

<info-box info>
	This feature is enabled by default in all official builds. The installation instructions are for developers interested in building their own custom rich-text editor.
</info-box>

## Support for other applications

At the current stage, the focus of the `@ckeditor/ckeditor5-paste-from-office` package is on supporting content that comes from Microsoft Word and {@link features/paste-from-google-docs Google Docs}. However, it does not mean that pasting from other similar applications (such as Microsoft Excel) is not supported.

By default, CKEditor 5 will support pasting rich-text content from these applications, however, some styles and formatting may be lost, depending on the source application. Also, other minor bugs may appear.

You can find more information regarding compatibility with other applications in [this ticket](https://github.com/ckeditor/ckeditor5/issues/1184#issuecomment-409828069).

If you think that support for any of the applications needs improvements, please add 👍 and comments in the following issues:

* [Support pasting from Excel](https://github.com/ckeditor/ckeditor5/issues/2513).
* [Support pasting from Libre Office](https://github.com/ckeditor/ckeditor5/issues/2520).
* [Support pasting from Pages](https://github.com/ckeditor/ckeditor5/issues/2527).

Feel free to open a [new feature request](https://github.com/ckeditor/ckeditor5/issues/new/choose) for other similar applications, too!
