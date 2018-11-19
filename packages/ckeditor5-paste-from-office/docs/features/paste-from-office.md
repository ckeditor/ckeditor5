---
menu-title: Paste from Word
category: features
---

{@snippet features/build-paste-from-office-source}

# Pasting content from Microsoft Word

The Paste from Word feature is provided through the {@link module:paste-from-office/pastefromoffice~PasteFromOffice} plugin.

This feature allows you to paste content from Microsoft Word and maintain original structure and formatting. After creating a document in Microsoft Word you can simply copy it to CKEditor and retain basic text styling, heading levels, links, lists, tables and images.

When the plugin is enabled, it automatically detects Word content and transforms its structure and formatting to clean HTML which is then transformed into semantic content by the editor.

<info-box info>
	Pasted content may be additionally modified or filtered by altering clipboard content on {@link module:clipboard/clipboard~Clipboard#event:inputTransformation `view.Document#inputTransformation`} event.
</info-box>

## Demo

To test how Paste from Office works, download the [sample Word document](../assets/CKEditor5.PFO.Sample.Recognition_of_Achievement.docx), open it in Microsoft Word, copy the content and paste it into CKEditor below.

{@snippet features/paste-from-office}

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom rich text editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-paste-from-office`](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office) package:

```text
npm install --save @ckeditor/ckeditor5-paste-from-office
```

Then add `PasteFromOffice` plugin to your plugin list:

```js
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ PasteFromOffice, Bold, ... ]
	} )
	.then( ... )
	.catch( ... );
```

## Support for different text editors

While the main focus of the `Paste from Office` plugin is on correctly transforming content pasted from Microsoft Word it also provides basic support for other text editors (see [this comment covering support for other text editors](https://github.com/ckeditor/ckeditor5/issues/1184#issuecomment-409828069)).

Pasting content from Microsoft Excel will keep the correct table structure. Pasting content from Google Docs maintains basic styles, headings, links, tables and images. Other known text editors like Libre Office or Pages also have its basic formatting preserved.

If you think that any of the above needs improvements, you may add `+1` in the related issues (see issues for improving paste support from [Excel](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/23), [Google Docs](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/20), [Libre Office](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/35) or [Pages](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/36)). If there is any text editor you would like to see a support for, you may open [new feature request](https://github.com/ckeditor/ckeditor5-paste-from-office/issues/new).
