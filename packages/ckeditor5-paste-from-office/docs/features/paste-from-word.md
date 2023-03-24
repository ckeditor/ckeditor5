---
menu-title: Paste from Word
category: features-pasting
order: 10
---

{@snippet features/build-paste-from-office-source}

# Pasting content from Microsoft Word

The paste from Word feature lets you paste content from Microsoft Word and preserve its original structure and formatting.

<info-box info>
	The Paste from Office plugin only preserves content formatting and structures that are included in your CKEditor 5 build. This means that you may need to add missing features such as font color or text alignment to your build. Read more in the [Automatic content filtering](#automatic-content-filtering) section below.
</info-box>

## Demo

To test how Paste from Office works, download the [sample Word document](../../assets/CKEditor5.PFO.Sample.Recognition_of_Achievement.docx), open it in Microsoft Word, copy the content, and paste it into CKEditor 5 below.

{@snippet features/paste-from-office}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Additional feature information

Thanks to the paste from Word feature, you can copy and paste a Microsoft Word document into CKEditor 5 and maintain basic text styling, heading levels, links, lists, tables, and images.

When the plugin is enabled, it automatically detects Word content and transforms its structure and formatting to clean HTML which is then transformed into semantic content by the editor.

The {@link module:paste-from-office/pastefromoffice~PasteFromOffice} plugin also allows you to paste content from Google Docs. See the {@link features/paste-from-google-docs pasting content from Google Docs guide} to learn more.

## Automatic content filtering

With CKEditor 5 you do not need to worry about pasting messy content from Microsoft Word (or any other possible sources). Thanks to the CKEditor 5 {@link framework/index custom data model}, only content that is specifically handled by the loaded rich-text editor features will be preserved.

This means that if you did not enable, for instance, {@link features/font font family and font size} features, this sort of formatting will be automatically stripped off when you paste content from Microsoft Word and other sources (e.g. other websites).

## Installation

<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}. The installation instructions are for developers interested in building their own custom rich-text editor.
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-paste-from-office`](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office) package:

```
npm install --save @ckeditor/ckeditor5-paste-from-office
```

Then add the {@link module:paste-from-office/pastefromoffice~PasteFromOffice `PasteFromOffice`} plugin to your plugin list:

```js
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ PasteFromOffice, Bold, /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

## Support for other applications

At the current stage, the focus of the `@ckeditor/ckeditor5-paste-from-office` package is on supporting content that comes from Microsoft Word and {@link features/paste-from-google-docs Google Docs}. However, it does not mean that pasting from other similar applications (such as Microsoft Excel) is not supported.

By default, CKEditor 5 will support pasting rich-text content from these applications, however, some styles and formatting may be lost, depending on the source application. Also, other minor bugs may appear.

You can find more information regarding compatibility with other applications in [this ticket](https://github.com/ckeditor/ckeditor5/issues/1184#issuecomment-409828069).

If you think that support for any of the applications needs improvements, please add 👍&nbsp; and comments in the following issues:

* [Support pasting from Excel](https://github.com/ckeditor/ckeditor5/issues/2513).
* [Support pasting from Libre Office](https://github.com/ckeditor/ckeditor5/issues/2520).
* [Support pasting from Pages](https://github.com/ckeditor/ckeditor5/issues/2527).

Feel free to open a [new feature request](https://github.com/ckeditor/ckeditor5/issues/new/choose) for other similar applications, too!

## Known issues

If the pasted document contains both images and styled text (e.g. headings), it may happen that the images are not pasted properly. Unfortunately, for some operating system, browser, and Word versions the image data is not available in the clipboard in this case.

It is advised to try and paste the image separately from the body of the text if this error occurs.

If the image is represented in the Word content by the VML syntax (like this one: `<v:shape><v:imagedata src="...."/></v:shape>`), it will not be pasted either as this notation is not supported by CKEditor 5. If you'd like to see this feature implemented, add a 👍&nbsp; reaction to [this GitHub issue](https://github.com/ckeditor/ckeditor5/issues/9245).

## Related features

CKEditor 5 supports a wider range of paste features, including:
* {@link features/paste-from-google-docs Paste from Google Docs} &ndash; Paste content from Google Docs, maintaining the original formatting and structure.
* {@link features/paste-plain-text Paste plain text} &ndash; Paste text without formatting that will inherit the style of the content it was pasted into.
* {@link features/import-word Import from Word} &ndash; Convert Word files directly into HTML content. You can read more about the differences between paste from Word and import from Word in the {@link features/features-comparison dedicated comparison guide}.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-paste-from-office](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-paste-from-office).
