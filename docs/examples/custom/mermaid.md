---
category: cklabs
order: 20
contributeUrl: false
modified_at: 2021-12-09
---

# Mermaid



{@snippet examples/mermaid}

By default, CKEditor 5 filters out any content that is unsupported by its plugins and configuration. Check out the {@link features/general-html-support General HTML Support (“GHS”)} feature that allows you to enable HTML features that are not explicitly supported by any other dedicated CKEditor 5 plugins.

<info-box>
	While this demo has the {@link features/import-word import from Word} feature enabled, please consider that the comments and track changes features are not enabled and hence these elements will not show up in the content. Read more about handling such situations in the import from Word's {@link features/features-comparison#collaboration-features features comparison} guide. You can test these features working together in the [official import from Word demo](https://ckeditor.com/import-from-word/demo/).

	Please pay attention to the fact that in order for Import from Word to work correctly, the {@link features/document-lists document list} plugin must be enabled instead of the {@link features/lists regular lists} plugin. It means, also, that the {@link features/todo-lists to-do lists} feature will not work with this configuration.
</info-box>

## Editor example configuration

To set up the full-featured demo locally, you need to follow the {@link installation/getting-started/quick-start-other#building-the-editor-from-source Building the editor from source} guide. However, you need to use the configuration files provided below:

<details>
<summary>Packages installation</summary>

```bash
npm install --save \
	@ckeditor/ckeditor5-alignment \
	@ckeditor/ckeditor5-autoformat \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-block-quote \
	@ckeditor/ckeditor5-ckbox \
	@ckeditor/ckeditor5-cloud-services \
	@ckeditor/ckeditor5-code-block \
	@ckeditor/ckeditor5-dev-utils \
	@ckeditor/ckeditor5-document-outline \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-export-pdf \
	@ckeditor/ckeditor5-export-word \
	@ckeditor/ckeditor5-find-and-replace \
	@ckeditor/ckeditor5-font \
	@ckeditor/ckeditor5-format-painter \
	@ckeditor/ckeditor5-heading \
	@ckeditor/ckeditor5-highlight \
	@ckeditor/ckeditor5-horizontal-line \
	@ckeditor/ckeditor5-html-embed \
	@ckeditor/ckeditor5-image \
	@ckeditor/ckeditor5-indent \
	@ckeditor/ckeditor5-language \
	@ckeditor/ckeditor5-link \
	@ckeditor/ckeditor5-list \
	@ckeditor/ckeditor5-media-embed \
	@ckeditor/ckeditor5-mention \
	@ckeditor/ckeditor5-page-break \
	@ckeditor/ckeditor5-paste-from-office \
	@ckeditor/ckeditor5-remove-format \
	@ckeditor/ckeditor5-slash-command \
	@ckeditor/ckeditor5-source-editing \
	@ckeditor/ckeditor5-special-characters \
	@ckeditor/ckeditor5-table \
	@ckeditor/ckeditor5-table-of-contents \
	@ckeditor/ckeditor5-template \
	@ckeditor/ckeditor5-theme-lark \
	@ckeditor/ckeditor5-typing \
	@ckeditor/ckeditor5-word-count \
	@webspellchecker/wproofreader-ckeditor5
```

</details>

<details>
<summary>Editor configuration script (app.js in the customized installation guide)</summary>

```js
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Code, Italic, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { ExportPdf } from '@ckeditor/ckeditor5-export-pdf';
import { ExportWord } from '@ckeditor/ckeditor5-export-word';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { Font } from '@ckeditor/ckeditor5-font';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { AutoImage, Image, ImageCaption, ImageInsert, ImageResize, ImageStyle, ImageToolbar, ImageUpload, PictureEditing } from '@ckeditor/ckeditor5-image';
import { ImportWord } from '@ckeditor/ckeditor5-import-word';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { TextPartLanguage } from '@ckeditor/ckeditor5-language';
import { AutoLink, Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { List, ListProperties, TodoList } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { SpecialCharacters, SpecialCharactersEssentials } from '@ckeditor/ckeditor5-special-characters';
import { Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { WordCount } from '@ckeditor/ckeditor5-word-count';
import WProofreader from '@webspellchecker/wproofreader-ckeditor5/src/wproofreader';

// templates icons
import articleImageRightIcon from '../../assets/img/article-image-right.svg';
import financialReportIcon from '../../assets/img/financial-report.svg';
import formalLetterIcon from '../../assets/img/formal-letter.svg';
import resumeIcon from '../../assets/img/resume.svg';
import richTableIcon from '../../assets/img/rich-table.svg';
import todoIcon from '../../assets/img/todo.svg';

ClassicEditor
	.create( document.querySelector( '#full-featured-editor' ), {
		ckbox: {
			// This editor configuration includes the CKBox feature.
			// Provide correct configuration values to use it.
			tokenUrl: 'https://example.com/cs-token-endpoint'
			// Read more about CKBox - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/ckbox.html.
			// For other image upload methods see the guide - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html.
		},
		plugins: [
			Autoformat, BlockQuote, Bold, Heading, Image, ImageCaption, FormatPainter,
			ImageStyle, ImageToolbar, Indent, Italic, Link, DocumentList, MediaEmbed,
			Paragraph, Table, TableToolbar, Alignment, AutoImage, AutoLink,
			CKBox, CloudServices, Code, CodeBlock, Essentials, ExportPdf,
			ExportWord, ImportWord, FindAndReplace, Font, Highlight, HorizontalLine,
			HtmlEmbed, ImageInsert, ImageResize, ImageUpload, IndentBlock,
			LinkImage, DocumentListProperties, Mention, PageBreak, PasteFromOffice,
			PictureEditing, RemoveFormat, SlashCommand, SourceEditing, SpecialCharacters,
			SpecialCharactersEssentials, Strikethrough, Subscript, Superscript,
			TableCaption, TableCellProperties, TableColumnResize,
			TableProperties, TableOfContents, Template, TextTransformation,
			Underline, WordCount, WProofreader
		],
		toolbar: {
			items: [
				'undo', 'redo',
				'|',
				'sourceEditing',
				'|',
				'exportPdf', 'exportWord', 'importWord',
				'|',
				'formatPainter', 'findAndReplace', 'selectAll', 'wproofreader',
				'|',
				'heading',
				'|',
				'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
				'-',
				'bold', 'italic', 'underline',
				{
					label: 'Formatting',
					icon: 'text',
					items: [ 'strikethrough', 'subscript', 'superscript', 'code', '|', 'removeFormat' ]
				},
				'|',
				'specialCharacters', 'horizontalLine', 'pageBreak',
				'|',
				'link', 'insertImage', 'ckbox', 'insertTable', 'tableOfContents', 'insertTemplate',
				{
					label: 'Insert',
					icon: 'plus',
					items: [ 'highlight', 'blockQuote', 'mediaEmbed', 'codeBlock', 'htmlEmbed' ]
				},
				'|',
				'alignment',
				'|',
				'bulletedList',	'numberedList',	'outdent', 'indent'
			],
			shouldNotGroupWhenFull: true
		},
		exportPdf: {
			stylesheets: [
				'EDITOR_STYLES',
				// Add your custom styles here
				// Read more in the documentation:
				// https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html#plugin-option
			],
			fileName: 'export-pdf-demo.pdf',
			converterOptions: {
				format: 'Tabloid',
				margin_top: '20mm',
				margin_bottom: '20mm',
				margin_right: '24mm',
				margin_left: '24mm',
				page_orientation: 'portrait'
			},
			// PROVIDE CORRECT VALUES HERE:
			tokenUrl: 'https://example.com/cs-token-endpoint'
		},
		exportWord: {
			stylesheets: [ 'EDITOR_STYLES' ],
			fileName: 'export-word-demo.docx',
			converterOptions: {
				format: 'B4',
				margin_top: '20mm',
				margin_bottom: '20mm',
				margin_right: '12mm',
				margin_left: '12mm',
				page_orientation: 'portrait'
			},
			// PROVIDE CORRECT VALUES HERE:
			tokenUrl: 'https://example.com/cs-token-endpoint'
		},
		fontFamily: {
			supportAllValues: true
		},
		fontSize: {
			options: [ 10, 12, 14, 'default', 18, 20, 22 ],
			supportAllValues: true
		},
		htmlEmbed: {
			showPreviews: true
		},
		image: {
			styles: [
				'alignCenter',
				'alignLeft',
				'alignRight'
			],
			resizeOptions: [
				{
					name: 'resizeImage:original',
					label: 'Original',
					value: null
				},
				{
					name: 'resizeImage:50',
					label: '50%',
					value: '50'
				},
				{
					name: 'resizeImage:75',
					label: '75%',
					value: '75'
				}
			],
			toolbar: [
				'imageTextAlternative', 'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'imageStyle:side', '|',
				'resizeImage'
			],
			insert: {
				integrations: [
					'insertImageViaUrl'
				]
			}
		},
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		},
		link: {
			decorators: {
				addTargetToExternalLinks: true,
				defaultProtocol: 'https://',
				toggleDownloadable: {
					mode: 'manual',
					label: 'Downloadable',
					attributes: {
						download: 'file'
					}
				}
			}
		},
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [
						'@apple', '@bears', '@brownie', '@cake', '@cake', '@candy', '@canes', '@chocolate', '@cookie', '@cotton', '@cream',
						'@cupcake', '@danish', '@donut', '@dragée', '@fruitcake', '@gingerbread', '@gummi', '@ice', '@jelly-o',
						'@liquorice', '@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding', '@sesame', '@snaps', '@soufflé',
						'@sugar', '@sweet', '@topping', '@wafer'
					],
					minimumCharacters: 1
				}
			]
		},
		template: {
			definitions: [
				{
					title: 'The title of the template',
					description: 'A longer description of the template',
					data: '<p>Data inserted into the content</p>'
				},
				{
					// ...
				},
				// More template definitions.
				// ...
			]
		},
		importWord: {
		// PROVIDE CORRECT VALUES HERE:
			tokenUrl: 'https://example.com/cs-token-endpoint'
		},
		placeholder: 'Type or paste your content here!',
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
			]
		},
		wproofreader: {
		// PROVIDE CORRECT VALUE HERE:
			serviceId: 'service ID',
			lang: 'auto',
			srcUrl: 'https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js'
		},
		licenseKey: 'your-license-key'
		// PROVIDE CORRECT VALUES HERE
	} )
	.then( editor => {
		window.editor = editor;
		// Prevent showing a warning notification when user is pasting a content from MS Word or Google Docs.
		window.preventPasteFromOfficeNotification = true;

		document.querySelector( '.ck.ck-editor__main' ).appendChild( editor.plugins.get( 'WordCount' ).wordCountContainer );
	} )
	.catch( err => {
		console.error( err );
	} );
```

</details>

<details>
<summary>Editor content listing (index.html in the customized installation guide)</summary>

```html
<style>
	.ck.ck-word-count {
		display: flex;
		justify-content: flex-end;

		background: var(--ck-color-toolbar-background);
		padding: var(--ck-spacing-small) var(--ck-spacing-standard);
		border: 1px solid var(--ck-color-toolbar-border);
		border-top-width: 0;
		border-radius: 0 0 var(--ck-border-radius);
	}

	.ck.ck-word-count .ck-word-count__words {
		margin-right: var(--ck-spacing-standard);
	}

	.ck.ck-rounded-corners .ck.ck-editor__main > .ck-editor__editable,
	.ck.ck-rounded-corners .ck-source-editing-area textarea {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
</style>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>CKEditor 5 Full-featured editor</title>
	</head>
	<body>
		<div id="full-featured-editor">
			Editor content is inserted here.
		</div>

		<script src="dist/bundle.js"></script>
		<!-- include CKBox from CDN -->
		<script src="https://cdn.ckbox.io/ckbox/latest/ckbox.js"></script>
	</body>
</html>
```

</details>
