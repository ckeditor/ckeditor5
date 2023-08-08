---
menu-title: Paste from Office
category: features-pasting
order: 10
---

{@snippet features/build-paste-from-office-demo-source}

# Pasting content from Microsoft Office

The two paste from Office features let you paste content from Microsoft Word and Microsoft Excel and preserve its original structure and formatting. There is the basic, open-source Paste from Office feature and the more advanced, premium paste from Office enhanced feature. You can read more about the differences between these two further in this guide.


<info-box>
	The **paste from Office enhanced** premium feature is a part of the {@link features/productivity-pack Productivity Pack} available only for customers with a commercial license. [Contact us](https://ckeditor.com/contact/?sales=true#contact-form) for more details.

	You can also sign up for the [CKEditor Premium Features 30-day free trial](https://orders.ckeditor.com/trial/premium-features) to test the feature.
</info-box>

## Demo

Use these sample documents to test pasting from Microsoft Office:

* [Sample Word document](../../assets/Sample_Word_document.docx)
* [Sample Excel spreadsheet](../../assets/Sample_Excel_spreadsheet.xlsx)

To test pasting from Office, download the sample documents and open them in Microsoft Office applications. Then, copy the content and paste it into the editor below. Use the tab to switch between the basic plugin and the premium paste from Office enhanced version.

<div class="tabs" id="snippet-paste-from-office">
	<ul class="tabs__list" role="tablist">
		<li class="tabs__list__tab ">
			<a aria-controls="tab-basic" aria-selected="false" href="#demo-tab-basic" id="demo-tab-basic" role="tab" class="tabs__list__tab-text">Basic paste from Office</a>
		</li>
		<li class="tabs__list__tab enhanced-editor-tab tabs__list__tab_selected">
			<a aria-controls="tab-enhanced" aria-selected="true" href="#demo-tab-enhanced" id="demo-tab-enhanced" role="tab" class="tabs__list__tab-text"><span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium feature</span></span>&nbsp;Paste from Office enhanced</a>
		</li>
	</ul>
<div role="tabpanel" aria-labelledby="tab-basic" class="tabs__panel">

{@snippet features/paste-from-office-demo-basic}

</div>
<div role="tabpanel" aria-labelledby="tab-enhanced" class="tabs__panel enhanced-editor-panel tabs__panel_selected">

{@snippet features/paste-from-office-demo-enhanced}

</div>
</div>

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Features comparison

Paste from Office enhanced retains rich content pasted from Microsoft Office applications. See below the full table of supported styles and formatting.

<details open>
<summary><strong>Microsoft Word</strong></summary>

**Note:** The name of each group in the table corresponds to the category in Word's "Modify style" user interface. If a specific formatting is supported natively (without using the [General HTML Support](#installation-2) feature), a plugin name responsible for the formatting is provided in parentheses.

<table class="comparison-table">
	<colgroup>
		<col>
		<col>
		<col>
		<col>
		<col>
	</colgroup>
	<thead>
		<tr>
			<th rowspan="2">Group</th>
			<th rowspan="2">Formatting</th>
			<th rowspan="2"><a href="#paste-from-office">Paste from Office</a></th>
			<th colspan="2"><a href="#paste-from-office-enhanced"><span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium feature</span></span>&nbsp;Paste from Office enhanced</a></th>
		</tr>
		<tr>
			<th>Native support</th>
			<th>With <a href="#installation-2">General HTML Support</a></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th rowspan="17">Font</th>
			<td>Font family</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/font FontFamily}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Font style (weight, italic)</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Bold}</code>, <code>{@link features/basic-styles Italic}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Font size</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/font FontSize}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Text color</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/font FontColor}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Underline</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Underline}</code>)&nbsp;<a href="#word-font-underline-color"><sup>[1]</sup></a></td>
			<td>✅&nbsp;Yes&nbsp;<a href="#word-font-underline-color"><sup>[1]</sup></a></td>
		</tr>
		<tr>
			<td>Advanced underline</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Underline}</code>)&nbsp;<a href="#word-font-underline-advanced"><sup>[2]</sup></td>
			<td>✅&nbsp;Yes&nbsp;<a href="#word-font-underline-advanced"><sup>[2]</sup></td>
		</tr>
		<tr>
			<td>Emphasis mark</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Strikethrough</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Strikethrough}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Double strikethrough</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Strikethrough}</code>)&nbsp;<a href="#word-font-strike"><sup>[3]</sup></td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Strikethrough}</code>)&nbsp;<a href="#word-font-strike"><sup>[3]</sup></td>
		</tr>
		<tr>
			<td>Superscript</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Superscript}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Subscript</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Subscript}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Small caps</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>All caps</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Hidden</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Character scale</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
		</tr>
		<tr>
			<td>Character spacings</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Advanced typography</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
		</tr>
		<tr>
			<th rowspan="8">Paragraph</th>
			<td>Alignment</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/text-alignment Alignment}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Indentation left</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/indent IndentBlock}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Indentation right</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Spacing before</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Spacing after</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Line spacing</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Line spacing at</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>No space between same–style paragraphs</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<th rowspan="2">Tabs</th>
			<td>Alignment</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;<a href="#word-tabs"><sup>[4]</sup></a></td>
			<td>✅&nbsp;Yes&nbsp;<a href="#word-tabs"><sup>[4]</sup></a></td>
		</tr>
		<tr>
			<td>Leader</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;<a href="#word-tabs"><sup>[4]</sup></a></td>
			<td>✅&nbsp;Yes&nbsp;<a href="#word-tabs"><sup>[4]</sup></a></td>
		</tr>
		<tr>
			<th rowspan="8">Borders and shading</th>
			<td>Style</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Colour</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Width</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Side</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>From text</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Fill</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Pattern style</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;<a href="#word-borders-and-shading-pattern-style"><sup>[5]</sup></a></td>
		</tr>
		<tr>
			<td>Pattern colour</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<th rowspan="2">Language</th>
			<td>Language</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/language TextPartLanguage}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Do not check spelling</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
		</tr>
		<tr>
			<th rowspan="4">Frame</th>
			<td>Text wrapping</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
		</tr>
		<tr>
			<td>Size</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
		</tr>
		<tr>
			<td>Horizontal</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
		</tr>
		<tr>
			<td>Vertical</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
		</tr>
		<tr>
			<th>Bullet points and Numbering</th>
			<td>General</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/lists List}</code>)&nbsp;<a href="#word-lists"><sup>[7]</sup></a></td>
			<td>✅&nbsp;Yes&nbsp;<a href="#word-lists"><sup>[7]</sup></a></td>
		</tr>
	</tbody>
</table>

<info-box>
	* <span id="word-font-underline-color">[1]</span> Underline color is ignored.
	* <span id="word-font-underline-advanced">[2]</span> Pasted as simple underline
	* <span id="word-font-strike">[3]</span> Pasted as single strikethrough.
	* <span id="word-tabs">[4]</span> Tabs are non-interactive.
	* <span id="word-border-style">[5]</span> Not all Word border styles have CSS counterparts.
	* <span id="word-borders-and-shading-pattern-style">[6]</span> The overall density is preserved but the pattern details are lost.
	* <span id="word-lists">[7]</span> Partial support.
</info-box>

</details>

<details open>
<summary><strong>Microsoft Excel</strong></summary>

**Note:** The name of each group in the table corresponds to the category in the Excel's "Format cells" user interface. If a specific formatting is supported natively (without using the [General HTML Support](#installation-2) feature), a plugin name responsible for the formatting is provided in the parentheses.

<table class="comparison-table">
	<colgroup>
		<col>
		<col>
		<col>
		<col>
		<col>
	</colgroup>
	<thead>
		<tr>
			<th rowspan="2">Group</th>
			<th rowspan="2">Formatting</th>
			<th rowspan="2"><a href="#paste-from-office">Paste from Office</a></th>
			<th colspan="2"><a href="#paste-from-office-enhanced"><span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium feature</span></span>&nbsp;Paste from Office enhanced</a></th>
		</tr>
		<tr>
			<th>Native support</th>
			<th>With <a href="#installation-2">General HTML Support</a></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th rowspan="4">Alignment</th>
			<td>Horizontal alignment</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/tables TableCellProperties}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Vertical alignment</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/tables TableCellProperties}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Indent</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/tables TableCellProperties}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Orientation (angle)</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
		</tr>
		<tr>
			<th rowspan="9">Font</th>
			<td>Family</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/font FontFamily}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Style</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Bold}</code>, <code>{@link features/basic-styles Italic}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Size</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/font FontSize}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Underline</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Underline}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Advanced underline (e.g. double)</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
		</tr>
		<tr>
			<td>Colour</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/font FontColor}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Strikethrough</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Strikethrough}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Superscript</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Superscript}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Subscript</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/basic-styles Subscript}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<th rowspan="4">Border</th>
			<td>Border color</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/tables TableCellProperties}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Border width</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/tables TableCellProperties}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Border style</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;<a href="#excel-border-style"><sup>[1]</sup></a></td>
			<td>✅&nbsp;Yes&nbsp;<a href="#excel-border-style"><sup>[1]</sup></a></td>
		</tr>
		<tr>
			<td>Borders across cell (diagonal)</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
		</tr>
		<tr>
			<th rowspan="3">Fill</th>
			<td>Background</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/tables TableCellProperties}</code>)</td>
			<td>✅&nbsp;Yes</td>
		</tr>
		<tr>
			<td>Pattern color</td>
			<td>❌&nbsp;No</td>
			<td>✅&nbsp;Yes&nbsp;(<code>{@link features/tables TableCellProperties}</code>)&nbsp;<a href="#excel-fill-pattern-color"><sup>[2]</sup></a></td>
			<td>✅&nbsp;Yes&nbsp;<a href="#excel-fill-pattern-color"><sup>[2]</sup></a></td>
		</tr>
		<tr>
			<td>Pattern style</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
			<td>❌&nbsp;No</td>
		</tr>
	</tbody>
</table>

<info-box>
	* <span id="excel-border-style">[1]</span> Not all Excel border styles have CSS counterparts.
	* <span id="excel-fill-pattern-color">[2]</span> It overrides the cell background.
</info-box>

</details>

## Support for other MS Office applications

At the current stage, the focus of `@ckeditor/ckeditor5-paste-from-office` and `@ckeditor/ckeditor5-paste-from-office-enhanced` packages is on supporting content that comes from Microsoft Word, Microsoft Excel, and {@link features/paste-from-google-docs Google Docs}. However, it does not mean that pasting from other similar applications (such as Microsoft PowerPoint) is not supported.

By default, CKEditor&nbsp;5 will support pasting rich-text content from these applications, however, some styles and formatting may be lost, depending on the source application. Also, other minor bugs may appear.

You can find more information regarding compatibility with other applications in [this ticket](https://github.com/ckeditor/ckeditor5/issues/1184#issuecomment-409828069).

If you think that support for any of the applications needs improvements, please add 👍&nbsp; and comments in the following issues:

* [Support pasting from Libre Office](https://github.com/ckeditor/ckeditor5/issues/2520).
* [Support pasting from Pages](https://github.com/ckeditor/ckeditor5/issues/2527).

Feel free to open a [new feature request](https://github.com/ckeditor/ckeditor5/issues/new/choose) for other similar applications, too!

## Paste from Office

### Installation

<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}. The installation instructions are for developers interested in building their own custom rich-text editor.
</info-box>

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-paste-from-office`](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office) package:

```bash
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

### Additional feature information

<info-box info>
	The Paste from Office plugin only preserves content formatting and structures that are included in your CKEditor&nbsp;5 build. This means that you may need to add missing features such as font color or text alignment to your build. Read more in the [Automatic content filtering](#automatic-content-filtering) section below.
</info-box>

Thanks to the paste from Office feature, you can copy and paste Microsoft Word documents into CKEditor&nbsp;5 and maintain basic text styling, heading levels, links, lists, tables, and images.

When the plugin is enabled, it automatically detects Microsoft Word content and transforms its structure and formatting to clean HTML which is then transformed into semantic content by the editor.

The {@link module:paste-from-office/pastefromoffice~PasteFromOffice} plugin also allows you to paste content from Google Docs. See the {@link features/paste-from-google-docs pasting content from Google Docs guide} to learn more.

### Automatic content filtering

With CKEditor&nbsp;5 you do not need to worry about pasting messy content from Microsoft Word (or any other possible sources). Thanks to the CKEditor&nbsp;5 {@link framework/index custom data model}, only content that is specifically handled by the loaded rich-text editor features will be preserved.

This means that if you did not enable, for instance, {@link features/font font family and font size} features, this sort of formatting will be automatically stripped off when you paste content from Microsoft Word and other sources (e.g. other websites). See the [features comparison table](#features-comparison).

### Known issues

If the pasted document contains both images and styled text (e.g. headings), it may happen that the images are not pasted properly. Unfortunately, for some operating systems, browsers, and Word versions the image data is not available in the clipboard in this case.

It is advised to try and paste the image separately from the body of the text if this error occurs.

If the image is represented in the Word content by the VML syntax (like this one: `<v:shape><v:imagedata src="...."/></v:shape>`), it will not be pasted either as this notation is not supported by CKEditor&nbsp;5. If you'd like to see this feature implemented, add a 👍&nbsp; reaction to [this GitHub issue](https://github.com/ckeditor/ckeditor5/issues/9245).

## Paste from Office enhanced

<info-box>
	The paste from Office enhanced premium feature <!-- is a part of the {@link features/productivity-pack Productivity Pack} --> available only for customers with a commercial license. [Contact us](https://ckeditor.com/contact/?sales=true#contact-form) for more details.

	You can also sign up for the [CKEditor Premium Features 30-day free trial](https://orders.ckeditor.com/trial/premium-features) to test the feature.
</info-box>

### Installation

To add the paste from Office enhanced feature to your editor, install [`@ckeditor/ckeditor5-paste-from-office`](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office), [`@ckeditor/ckeditor5-paste-from-office-enhanced`](https://www.npmjs.com/package/@ckeditor/ckeditor5-paste-from-office-enhanced), and [`@ckeditor/ckeditor5-html-support`](https://www.npmjs.com/package/@ckeditor/ckeditor5-html-support) packages:

```bash
npm install --save \
	@ckeditor/ckeditor5-paste-from-office \
	@ckeditor/ckeditor5-paste-from-office-enhanced \
	@ckeditor/ckeditor5-html-support
```

<info-box info>
	Note that the `GeneralHtmlSupport` plugin is optional but recommended for optimal pasted styles retention and accuracy. [Learn more](#configuration).
</info-box>

We highly recommend you also add other editor packages to get as much native support for pasted content as possible. You can learn more about editor features that work out–of–the–box with content pasted from Microsoft Office in a [dedicated section](#features-comparison). To install recommended packages, execute the following command:

```bash
npm install --save \
	@ckeditor/ckeditor5-alignment \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-font \
	@ckeditor/ckeditor5-indent \
	@ckeditor/ckeditor5-table \
	@ckeditor/ckeditor5-language
```

Then add the `PasteFromOffice`, `PasteFromOfficeEnhanced`, and `GeneralHtmlSupport` plugins to your plugin list as well as other editor features that support content pasted from Microsoft Office (`Bold`, `Italic`, `FontColor`, `Indent`, etc.):

```js
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { PasteFromOfficeEnhanced } from '@ckeditor/ckeditor5-paste-from-office-enhanced';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Bold, Italic, Underline, Strikethrough, Subscript, Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { FontColor, FontBackgroundColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Table, TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { TextPartLanguage } from '@ckeditor/ckeditor5-language';
// Other imports...

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			// Load the open-source feature.
			PasteFromOffice,

			// Load the enhanced feature.
			PasteFromOfficeEnhanced,

			// Load the recommended General HTML Support feature.
			GeneralHtmlSupport,

			// Load other recommended editor features.
			Alignment, Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
			FontColor, FontBackgroundColor, FontFamily, FontSize, Indent,
			Table, TableProperties, TableCellProperties,
			TextPartLanguage,

			/* ... */
		],

		// Provide activation key (see explanation below).
		licenseKey: 'your-license-key'

		// See the "Configuration" section below to learn how to configure
		// the editor for the best performance.
		// ...
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Finally, [update the configuration](#configuration).

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins}.
</info-box>

### Activating the feature

In order to use this premium feature, you need to activate it with proper credentials. Please refer to the {@link support/license-key-and-activation License key and activation} guide for details.

### Configuration

<info-box info>
	For more technical details, check the {@link module:template/template~TemplateConfig#definitions plugin configuration reference}.
</info-box>

Paste from Office enhanced does not come with its own configuration. Still, we highly recommend other editor features be loaded and configured in a certain way for optimal pasted styles retention and performance:

- [General HTML Support](https://ckeditor5.github.io/docs/nightly/ckeditor5/latest/features/html/general-html-support.html) – Enabling and [configuring](https://ckeditor5.github.io/docs/nightly/ckeditor5/latest/features/html/general-html-support.html#enabling-all-html-features) this feature will allow you to make the most of the paste from Office enhanced by retaining advanced formatting that would otherwise be rejected by core editor features. See the [content compatibility table](#features-comparison) to learn more.
- [Font size and family](https://ckeditor5.github.io/docs/nightly/ckeditor5/latest/features/font.html) – Loading and configuring these features will ensure maximal compatibility of fonts in the pasted content.

The recommended configuration is as follows:

```js
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { PasteFromOfficeEnhanced } from '@ckeditor/ckeditor5-paste-from-office-enhanced';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Bold, Italic, Underline, Strikethrough, Subscript, Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { FontColor, FontBackgroundColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Table, TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { TextPartLanguage } from '@ckeditor/ckeditor5-language';
// Other imports...

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			// Load the open-source feature.
			PasteFromOffice,

			// Load the enhanced feature.
			PasteFromOfficeEnhanced,

			// Load the recommended General HTML Support feature.
			GeneralHtmlSupport,

			// Load other recommended editor features.
			Alignment, Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
			FontColor, FontBackgroundColor, FontFamily, FontSize, Indent,
			Table, TableProperties, TableCellProperties,
			TextPartLanguage,

			/* ... */
		],

		// Provide activation key.
		licenseKey: 'your-license-key',

		// Configuration of the GeneralHtmlSupport plugin to allow extra content into the editor.
		// This configuration will preserve styles and formatting normally unsupported by core editor features.
		htmlSupport: {
			allow: [
				{
					name: /^.*$/,
					styles: true,
					attributes: true,
					classes: true
				}
			]
		},

		// Configuration of the FontFamily plugin.
		fontFamily: {
			// Allow all fonts from Microsoft Office documents
			// including those that are unknown to CKEditor.
			supportAllValues: true
		},

		// Configuration of the FontSize plugin.
		fontSize: {
			options: [
				8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
			],

			// Allow all font sizes from Microsoft Office documents
			// including those that are unknown to CKEditor.
			supportAllValues: true
		},

		// Add UI buttons and dropdowns for extra editor features if you used the feature set
		// from "Installation" section.
		toolbar: [
			// ...
			'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript',
			'|',
			'alignment', 'outdent', 'indent',
			'|',
			'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
			'|',
			'insertTable',
			'|',
			'textPartLanguage',
			// ...
		],

		// Add UI buttons and dropdowns for extra table features if you used the feature set
		// from "Installation" section.
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', '|', 'tableProperties', 'tableCellProperties'
			]
		},

		// ...
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Known issues

* There is a known issue with cell widths being incorrect upon pasting from Microsoft Excel. [Learn more](https://github.com/ckeditor/ckeditor5/issues/14521).
* Headings pasted from Microsoft Word with a normal font weight configured in styles will be rendered using a bold font due to default stylesheets provided by the editor.
* A bold text pasted from Microsoft Excel may be occasionally displayed as normal for specific font faces.
* There is a known issue with font family, font size, and text part language values being displayed incorrectly in the CKEditor UI. [Learn more](https://github.com/cksource/ckeditor5-internal/issues/3452)

## Related features

CKEditor&nbsp;5 supports a wider range of paste features, including:
* {@link features/paste-from-google-docs Paste from Google Docs} &ndash; Paste content from Google Docs, maintaining the original formatting and structure.
* {@link features/paste-plain-text Paste plain text} &ndash; Paste text without formatting that will inherit the style of the content it was pasted into.
* {@link features/import-word Import from Word} &ndash; Convert Word files directly into HTML content. You can read more about the differences between the paste from Office and import from Word features in the {@link features/features-comparison dedicated comparison guide}.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-paste-from-office](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-paste-from-office).

<style>
	.comparison-table td, .comparison-table th {
		border: 1px solid #d0d0d0;
		vertical-align: middle;
		text-align: center;
	}

	.comparison-table td code, .comparison-table th code {
		white-space: nowrap;
	}

	.comparison-table colgroup col {
		width: 20%;
	}

	.comparison-table colgroup col:first-child {
		width: 10%;
	}

	.comparison-table colgroup col:nth-child(3) {
		background: #f5f5f5;
	}

	.comparison-table colgroup col:nth-child(4),
	.comparison-table colgroup col:nth-child(5) {
		background: #fff7dc;
		border-top: 3px solid #e8ce7a;
		border-bottom: 3px solid #e8ce7a;
	}

	.comparison-table colgroup col:nth-child(4) {
		border-left: 3px solid #e8ce7a;
	}

	.comparison-table colgroup col:nth-child(5) {
		border-right: 3px solid #e8ce7a;
	}

	.comparison-table tr.comparison-table_row-supported td:first-of-type {
		background: #dcf1c3;
	}

	.comparison-table tbody td sup {
		top: -0.5em;
		position: relative;
		font-size: 75%;
		line-height: 0;
		vertical-align: baseline;
	}
</style>
