---
menu-title: Paste from Office
meta-title: Paste from Office | CKEditor 5 Documentation
meta-description: CKEditor 5 lets you handle content that you paste from Word and paste from Excel.
category: features-pasting
order: 10
---

# Paste from Office

Paste from Office features let you paste content from Microsoft Word and Microsoft Excel and preserve its original structure and formatting. This is the basic, open-source Paste from Office feature. You can also try the more advanced, premium {@link features/paste-from-office-enhanced enhanced Paste from Office} feature.

## Demo

Use these sample documents to test pasting from Microsoft Office Word and Excel:

* [Sample Word document](../../assets/PasteFromOfficeEnhancedWordSample.docx)
* [Sample Excel spreadsheet](../../assets/PasteFromOfficeEnhancedExcelSample.xlsx)

To test pasting from Office, download the sample documents and open them in Microsoft Office applications. Then, copy the content and paste it into the editor below.

{@snippet features/paste-from-office}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Enhanced paste from Office

Refer to the {@link features/paste-from-office-enhanced#content-formatting-support enhanced Paste from Office} guide for a full comparison of supported styles and formatting between the basic and premium versions.

## Additional feature information

<info-box info>
	The Paste from Office plugin only preserves content formatting and structures that are included in your CKEditor&nbsp;5 setup. This means that you may need to add missing features such as font color or text alignment. Read more in the [Automatic content filtering](#automatic-content-filtering) section below.
</info-box>

Thanks to the paste from Office feature, you can copy and paste Microsoft Word documents into CKEditor&nbsp;5 and maintain basic text styling, heading levels, links, lists, tables, and images.

When the plugin is enabled, it automatically detects Microsoft Word content and transforms its structure and formatting to clean HTML which is then transformed into semantic content by the editor.

The {@link module:paste-from-office/pastefromoffice~PasteFromOffice} plugin also allows you to paste content from Google Docs. See the {@link features/paste-from-google-docs pasting content from Google Docs guide} to learn more.

## Support for other office applications

At the current stage, the focus of `@ckeditor/ckeditor5-paste-from-office` and `@ckeditor/ckeditor5-paste-from-office-enhanced` packages is on supporting content that comes from Microsoft Word, Microsoft Excel, and {@link features/paste-from-google-docs Google Docs}. However, it does not mean that pasting from other similar applications (such as Microsoft PowerPoint) is not supported.

By default, CKEditor&nbsp;5 will support pasting rich-text content from these applications, however, some styles and formatting may be lost, depending on the source application. Also, other minor bugs may appear.

You can find more information regarding compatibility with other applications in [this ticket](https://github.com/ckeditor/ckeditor5/issues/1184#issuecomment-409828069).

If you think that support for any of the applications needs improvements, please add 👍&nbsp; and comments in the following issues:

* [Support pasting from Libre Office](https://github.com/ckeditor/ckeditor5/issues/2520).
* [Support pasting from Pages](https://github.com/ckeditor/ckeditor5/issues/2527).

Feel free to open a [new feature request](https://github.com/ckeditor/ckeditor5/issues/new/choose) for other similar applications, too!

## Automatic content filtering

With CKEditor&nbsp;5 you do not need to worry about pasting messy content from Microsoft Word (or any other possible sources). Thanks to the CKEditor&nbsp;5 {@link framework/index custom data model}, only content that is specifically handled by the loaded rich-text editor features will be preserved.

This means that if you did not enable, for instance, {@link features/font font family and font size} features, this sort of formatting will be automatically stripped off when you paste content from Microsoft Word and other sources (like other websites).

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, PasteFromOffice } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ PasteFromOffice, /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Known issues

If the pasted document contains both images and styled text (like headings), images are sometimes not pasted properly. Unfortunately, for some operating systems, browsers, and Word versions the image data is not available in the clipboard in this case.

It is advised to try and paste the image separately from the body of the text if this error occurs.

If the image is represented in the Word content by the VML syntax (like this one: `<v:shape><v:imagedata src="...."/></v:shape>`), it will not be pasted either as this notation is not supported by CKEditor&nbsp;5. If you'd like to see this feature implemented, add a 👍&nbsp; reaction to [this GitHub issue](https://github.com/ckeditor/ckeditor5/issues/9245).

## Related features

CKEditor&nbsp;5 supports a wider range of paste features, including:
* {@link features/paste-from-office-enhanced Enhanced paste from Office} &ndash; Enhanced paste from Office is a premium version of the plugin that offers far greater capabilities.
* {@link features/paste-from-google-docs Paste from Google Docs} &ndash; Paste content from Google Docs, maintaining the original formatting and structure.
* {@link features/paste-plain-text Paste plain text} &ndash; Paste text without formatting that will inherit the style of the content it was pasted into.
* {@link features/import-word Import from Word} &ndash; Convert Word files directly into HTML content. You can read more about the differences between the paste from Office and import from Word features in the {@link features/features-comparison dedicated comparison guide}.
* {@link features/paste-markdown Paste Markdown} &ndash; Paste Markdown-formatted content straight into the editor.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-paste-from-office](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-paste-from-office).
