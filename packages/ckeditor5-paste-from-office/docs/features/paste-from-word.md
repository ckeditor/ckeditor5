---
menu-title: Paste from Word
category: features
---

{@snippet features/build-paste-from-office-source}

# Pasting content from Microsoft Word

The Paste from Word feature is provided through the {@link module:paste-from-office/pastefromoffice~PasteFromOffice} plugin.

This feature allows you to paste content from Microsoft Word and maintain original structure and formatting. After creating a document in Microsoft Word you can simply copy it to CKEditor and retain basic text styling, heading levels, links, lists, tables and images.

When the plugin is enabled, it automatically detects Word content and transforms its structure and formatting to clean HTML which is then transformed into semantic content by the editor.

## Demo

To test how Paste from Office works, download the [sample Word document](../assets/CKEditor5.PFO.Sample.Recognition_of_Achievement.docx), open it in Microsoft Word, copy the content and paste it into CKEditor below.

{@snippet features/paste-from-office}

## Automatic content filtering

With CKEditor 5 you do not need to worry about pasting a messy content from Microsfoft Word (and all other possible sources). Thanks to CKEditor 5's {@link framework/guides/overview custom data model}, only content which is specifically handled by the loaded editor features will be preserved.

This means that if you did not enable, for instance, {@link features/font font family and font size} features, that formatting will be automatically stripped off when you paste content from Microsoft Word and other sources (e.g. other websites).

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom rich text editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-paste-from-office`](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office) package:

```text
npm install --save @ckeditor/ckeditor5-paste-from-office
```

Then add {@link module:paste-from-office/pastefromoffice~PasteFromOffice `PasteFromOffice`} plugin to your plugin list:

```js
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ PasteFromOffice, Bold, ... ]
	} )
	.then( ... )
	.catch( ... );
```

## Support for other office applications

At the current stage, the `@ckeditor/ckeditor5-paste-from-office`'s focus is on supporting content which comes from Microsoft Word. However, that does not mean that pasting from other office applications (such as Microsoft Excel or Google Docs) is not supported.

By default, CKEditor 5 will support pasting from those applications, however, some styles and formatting may be lost, depending on a source application. Also, other minor bugs may appear.

You can find more information regarding compatibility with other aplplications in [this ticket](https://github.com/ckeditor/ckeditor5/issues/1184#issuecomment-409828069).

If you think that any of the above needs improvements, please add 👍 in the following issues:

* [support pasting from Excel](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/23),
* [support pasting from Google Docs](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/20),
* [support pasting from Libre Office](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/35)
* [support pasting from Pages](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/36).

You may also open [new feature request](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/new) for other office applications.
