---
menu-title: Paste from Word
category: features-pasting
classes: main__content--no-toc
toc: false
order: 10
---

{@snippet features/build-paste-from-office-source}

# Pasting content from Microsoft Word

The Paste from Word feature is provided through the {@link module:paste-from-office/pastefromoffice~PasteFromOffice} plugin.

This feature allows you to paste content from Microsoft Word and maintain the original structure and formatting. After creating a document in Microsoft Word you can simply copy it to CKEditor 5 and retain basic text styling, heading levels, links, lists, tables and images.

When the plugin is enabled, it automatically detects Word content and transforms its structure and formatting to clean HTML which is then transformed into semantic content by the editor.

<info-box info>
	The Paste from Office plugin only preserves content formatting and structures that are included in your CKEditor 5 build. This means that you may need to add missing features such as font color or text alignment to your build. Read more in the [Automatic content filtering](#automatic-content-filtering) section below.
</info-box>

<info-box info>
	The {@link module:paste-from-office/pastefromoffice~PasteFromOffice} plugin also allows you to paste content from Google Docs. See the {@link features/paste-from-google-docs Pasting content from Google Docs} guide to learn more.
</info-box>

## Demo

To test how Paste from Office works, download the [sample Word document](../../assets/CKEditor5.PFO.Sample.Recognition_of_Achievement.docx), open it in Microsoft Word, copy the content, and paste it into CKEditor 5 below.

{@snippet features/paste-from-office}

## Automatic content filtering

With CKEditor 5 you do not need to worry about pasting messy content from Microsoft Word (or any other possible sources). Thanks to the CKEditor 5 {@link framework/guides/overview custom data model}, only content which is specifically handled by the loaded rich-text editor features will be preserved.

This means that if you did not enable, for instance, {@link features/font font family and font size} features, this sort of formatting will be automatically stripped off when you paste content from Microsoft Word and other sources (e.g. other websites).

## Installation

<info-box info>
	This feature is enabled by default in all official builds. The installation instructions are for developers interested in building their own custom rich-text editor.
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-paste-from-office`](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office) package:

```bash
npm install --save @ckeditor/ckeditor5-paste-from-office
```

Then add the {@link module:paste-from-office/pastefromoffice~PasteFromOffice `PasteFromOffice`} plugin to your plugin list:

```js
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ PasteFromOffice, Bold, ... ]
	} )
	.then( ... )
	.catch( ... );
```

## Support for other applications

At the current stage, the focus of the `@ckeditor/ckeditor5-paste-from-office` package is on supporting content that comes from Microsoft Word and {@link features/paste-from-google-docs Google Docs}. However, it does not mean that pasting from other similar applications (such as Microsoft Excel) is not supported.

By default, CKEditor 5 will support pasting rich-text content from these applications, however, some styles and formatting may be lost, depending on the source application. Also, other minor bugs may appear.

You can find more information regarding compatibility with other applications in [this ticket](https://github.com/ckeditor/ckeditor5/issues/1184#issuecomment-409828069).

If you think that support for any of the applications needs improvements, please add 👍 and comments in the following issues:

* [Support pasting from Excel](https://github.com/ckeditor/ckeditor5/issues/2513).
* [Support pasting from Libre Office](https://github.com/ckeditor/ckeditor5/issues/2520).
* [Support pasting from Pages](https://github.com/ckeditor/ckeditor5/issues/2527).

Feel free to open a [new feature request](https://github.com/ckeditor/ckeditor5/issues/new/choose) for other similar applications, too!
