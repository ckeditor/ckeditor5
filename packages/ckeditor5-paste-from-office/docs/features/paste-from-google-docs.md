---
menu-title: Paste from Google Docs
meta-title: Paste from Google Docs | CKEditor 5 Documentation
category: features-pasting
order: 20
---

{@snippet features/build-paste-from-office-source}

# Pasting content from Google Docs

The paste from Google Docs feature lets you paste content from Google Docs and preserve its original structure and formatting.

<info-box info>
	The Paste from Office plugin only preserves content formatting and structures that are included in your CKEditor&nbsp;5 build. This means that you may need to add missing features such as font color or text alignment to your build. Read more in the [Automatic content filtering](#automatic-content-filtering) section below.
</info-box>

## Demo

To test pasting from Google Docs, open the [sample Google Docs document](https://docs.google.com/document/d/1a9YzJidjxRPrxY9BL4ZReNFkPAgd_ItnZoFxcjSiJ4U/edit?usp=sharing). Then copy its content and paste it into the editor below.

{@snippet features/paste-from-office}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

Thanks to the paste from Google Docs feature, you can copy and paste a Google Docs document into CKEditor&nbsp;5 and maintain basic text styling, heading levels, links, lists, tables, and images.

When the plugin is enabled, it automatically detects Google Docs content and transforms its structure and formatting to clean HTML which is then transformed into semantic content by the editor.

The {@link module:paste-from-office/pastefromoffice~PasteFromOffice} plugin also allows you to paste content from Microsoft Word. See the {@link features/paste-from-office pasting content from Microsoft Office} guide to learn more.

## Automatic content filtering

With CKEditor&nbsp;5 you do not need to worry about pasting messy content from Google Docs (or any other possible sources). Thanks to the CKEditor&nbsp;5 {@link framework/index custom data model}, only content that is specifically handled by the loaded rich-text editor features will be preserved.

This means that if you did not enable, for instance, {@link features/font font family and font size} features, this sort of formatting will be automatically stripped off when you paste content from Google Docs and other sources (e.g. other websites).

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
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';

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

At the current stage, the focus of the `@ckeditor/ckeditor5-paste-from-office` package is on supporting content that comes from {@link features/paste-from-office Microsoft Word} and Google Docs. However, it does not mean that pasting from other similar applications (such as Microsoft Excel) is not supported.

By default, CKEditor&nbsp;5 will support pasting rich-text content from these applications, however, some styles and formatting may be lost, depending on the source application. Also, other minor bugs may appear.

You can find more information regarding compatibility with other applications in [this ticket](https://github.com/ckeditor/ckeditor5/issues/1184#issuecomment-409828069).

If you think that support for any of the applications needs improvements, please add 👍 and comments in the following issues:

* [Support pasting from Excel](https://github.com/ckeditor/ckeditor5/issues/2513).
* [Support pasting from Libre Office](https://github.com/ckeditor/ckeditor5/issues/2520).
* [Support pasting from Pages](https://github.com/ckeditor/ckeditor5/issues/2527).

Feel free to open a [new feature request](https://github.com/ckeditor/ckeditor5/issues/new/choose) for other similar applications, too!

## Related features

CKEditor&nbsp;5 supports a wider range of paste features, including:
* {@link features/paste-plain-text Paste plain text} &ndash; Paste text without formatting that will inherit the style of the content it was pasted into.
* {@link features/paste-from-office Paste from Office} &ndash; Paste content from Microsoft Word and maintain the original structure and formatting.
* {@link features/paste-from-office-enhanced paste from Office enhanced} &ndash; Paste from Office enhanced is a premium version of the plugin that offers far greater capabilities.
* {@link features/import-word Import from Word} &ndash; Convert Word files directly into HTML content.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-paste-from-office](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-paste-from-office).
