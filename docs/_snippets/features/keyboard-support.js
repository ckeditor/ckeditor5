/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, open, console, LICENSE_KEY */

// Keep the guide listing updated with each change.

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Code, Italic, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CaseChange } from '@ckeditor/ckeditor5-case-change';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { TableOfContents } from '@ckeditor/ckeditor5-document-outline';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { ExportPdf } from '@ckeditor/ckeditor5-export-pdf';
import { ExportWord } from '@ckeditor/ckeditor5-export-word';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { Font } from '@ckeditor/ckeditor5-font';
import { FormatPainter } from '@ckeditor/ckeditor5-format-painter';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { AutoImage,
	Image,
	ImageCaption,
	ImageInsert,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	PictureEditing
} from '@ckeditor/ckeditor5-image';
import { ImportWord } from '@ckeditor/ckeditor5-import-word';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { AutoLink, Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { List, ListProperties, TodoList } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { PasteFromOfficeEnhanced } from '@ckeditor/ckeditor5-paste-from-office-enhanced';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { ShowBlocks } from '@ckeditor/ckeditor5-show-blocks';
import { SlashCommand } from '@ckeditor/ckeditor5-slash-command';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { SpecialCharacters, SpecialCharactersEssentials } from '@ckeditor/ckeditor5-special-characters';
import { Style } from '@ckeditor/ckeditor5-style';
import { Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar } from '@ckeditor/ckeditor5-table';
import { Template } from '@ckeditor/ckeditor5-template';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import WProofreader from '@webspellchecker/wproofreader-ckeditor5/src/wproofreader.js';

// Additional protection for internal license keys CF#2555.
window.open.closed = 1;

// import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

// Allow using internal license keys in this sample. See CF#2555.
open.closed = 1;

// Templates icons.
import articleImageRightIcon from '../../assets/img/article-image-right.svg';
import financialReportIcon from '../../assets/img/financial-report.svg';
import formalLetterIcon from '../../assets/img/formal-letter.svg';
import resumeIcon from '../../assets/img/resume.svg';
import richTableIcon from '../../assets/img/rich-table.svg';

ClassicEditor
	.create( document.querySelector( '#keyboard-support' ), {
		// cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		poweredBy: {
			position: 'inside',
			side: 'left',
			label: 'This is'
		},
		plugins: [
			Autoformat, BlockQuote, Bold, Heading, CaseChange, Image, ImageCaption, FormatPainter,
			ImageStyle, ImageToolbar, Indent, Italic, Link, List, MediaEmbed,
			Paragraph, Table, TableToolbar, Alignment, AutoImage, AutoLink,
			CKBox, CKBoxImageEdit, CloudServices, Code, CodeBlock, Essentials, ExportPdf,
			ExportWord, ImportWord, FindAndReplace, Font, Highlight, HorizontalLine,
			HtmlEmbed, ImageInsert, ImageResize, ImageUpload, IndentBlock, GeneralHtmlSupport,
			LinkImage, ListProperties, TodoList, Mention, PageBreak, PasteFromOffice,
			PasteFromOfficeEnhanced, PictureEditing, RemoveFormat, ShowBlocks, SlashCommand, SourceEditing,
			SpecialCharacters, SpecialCharactersEssentials, Style, Strikethrough, Subscript, Superscript,
			TableCaption, TableCellProperties, TableColumnResize,
			TableProperties, TableOfContents, Template, TextTransformation,
			Underline, WProofreader
		],
		toolbar: {
			items: [
				'accessibilityHelp',
				'|',
				'undo', 'redo',
				'|',
				'heading',
				'|',
				'fontSize', 'fontFamily',
				{
					label: 'Font color',
					icon: 'plus',
					items: [ 'fontColor', 'fontBackgroundColor' ]
				},
				'|',
				'bold', 'italic', 'underline',
				{
					label: 'Formatting',
					icon: 'text',
					items: [ 'strikethrough', 'subscript', 'superscript', 'code', 'horizontalLine', '|', 'removeFormat' ]
				},
				'specialCharacters', 'pageBreak',
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
				'bulletedList',	'numberedList',	'todoList', 'outdent', 'indent'
			]
		},
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
		style: {
			definitions: [
				{
					name: 'Article category',
					element: 'h3',
					classes: [ 'category' ]
				},
				{
					name: 'Title',
					element: 'h2',
					classes: [ 'document-title' ]
				},
				{
					name: 'Subtitle',
					element: 'h3',
					classes: [ 'document-subtitle' ]
				},
				{
					name: 'Info box',
					element: 'p',
					classes: [ 'info-box' ]
				},
				{
					name: 'Side quote',
					element: 'blockquote',
					classes: [ 'side-quote' ]
				},
				{
					name: 'Marker',
					element: 'span',
					classes: [ 'marker' ]
				},
				{
					name: 'Spoiler',
					element: 'span',
					classes: [ 'spoiler' ]
				},
				{
					name: 'Code (dark)',
					element: 'pre',
					classes: [ 'fancy-code', 'fancy-code-dark' ]
				},
				{
					name: 'Code (bright)',
					element: 'pre',
					classes: [ 'fancy-code', 'fancy-code-bright' ]
				}
			]
		},
		exportPdf: {
			stylesheets: [
				'../../assets/pagination-fonts.css',
				'EDITOR_STYLES',
				'../../snippets/features/pagination/snippet.css',
				'../../assets/pagination.css'
			],
			fileName: 'export-pdf-demo.pdf',
			appID: 'cke5-docs',
			converterOptions: {
				format: 'Tabloid',
				margin_top: '20mm',
				margin_bottom: '20mm',
				margin_right: '24mm',
				margin_left: '24mm',
				page_orientation: 'portrait'
			},
			tokenUrl: false
		},
		exportWord: {
			stylesheets: [ 'EDITOR_STYLES' ],
			fileName: 'export-word-demo.docx',
			appID: 'cke5-docs',
			converterOptions: {
				format: 'B4',
				margin_top: '20mm',
				margin_bottom: '20mm',
				margin_right: '12mm',
				margin_left: '12mm',
				page_orientation: 'portrait'
			},
			tokenUrl: false
		},
		fontFamily: {
			supportAllValues: true
		},
		fontSize: {
			options: [ 10, 12, 14, 'default', 18, 20, 22 ],
			supportAllValues: true
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
				'resizeImage', '|', 'ckboxImageEdit'
			]
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
					minimumCharacters: 0
				}
			]
		},
		importWord: {
			tokenUrl: false,
			defaultStyles: true
		},
		placeholder: 'Type or paste your content here!',
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
			]
		},
		template: {
			definitions: [
				{
					title: 'Document with an image',
					description: 'Simple heading with text and and and image.',
					icon: articleImageRightIcon,
					data: `<h2>Title of the document</h2>
						<figure class="image image-style-align-right image_resized" style="width:26.32%;">
							<img src="../../assets/img/ckeditor-logo.png">
							<figcaption>A caption of the image.</figcaption>
						</figure>
						<p>The content of the document.&nbsp;</p>`
				},
				{
					title: 'Annual financial report',
					description: 'A report that spells out the company\'s financial condition.',
					icon: financialReportIcon,
					data: `<figure class="table">
						<table style="border:2px solid hsl(0, 0%, 0%);">
							<thead>
								<tr>
									<th style="text-align:center;" rowspan="2">Metric name</th>
									<th style="text-align:center;" colspan="4">Year</th>
								</tr>
								<tr>
									<th style="background-color:hsl(90, 75%, 60%);text-align:center;">2019</th>
									<th style="background-color:hsl(90, 75%, 60%);text-align:center;">2020</th>
									<th style="background-color:hsl(90, 75%, 60%);text-align:center;">2021</th>
									<th style="background-color:hsl(90, 75%, 60%);text-align:center;">2022</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th><strong>Revenue</strong></th>
									<td>$100,000.00</td>
									<td>$120,000.00</td>
									<td>$130,000.00</td>
									<td>$180,000.00</td>
								</tr>
								<tr>
									<th style="background-color:hsl(0, 0%, 90%);"><strong>Operating expenses</strong></th>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
								</tr>
								<tr>
									<th><strong>Interest</strong></th>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
								</tr>
								<tr>
									<th style="background-color:hsl(0, 0%, 90%);"><strong>Net profit</strong></th>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
								</tr>
							</tbody>
						</table>
					</figure>`
				},
				{
					title: 'Resume',
					description: 'A quick overview of candidate\'s professional qualifications.',
					icon: resumeIcon,
					data: `<figure class="image image_resized" style="width:11.42%;">
							<picture>
								<img src="../../assets/img/user-avatar.png">
							</picture>
						</figure>
						<h2 style="text-align:center;">John Doe</h2>
						<p style="text-align:center;"><i>Address, Phone, e-mail, social media</i></p>
						<h3>Profile</h3>
						<p>A quick summary of who you are and what you specialize in.</p>
						<h3>Employment history</h3>
						<ul>
							<li>
								<p><strong>MARCH 2021 - CURRENT&nbsp;</strong></p>
								<p>Position (Company name, city)</p>
								<ul>
									<li>Most important accomplishments.</li>
									<li>Most important &nbsp;responsibilities.</li>
								</ul>
							</li>
							<li>
								<p><strong>JANUARY 2019 - MARCH 2021&nbsp;</strong></p>
								<p>Position (Company name, city)</p>
								<ul>
									<li>Most important accomplishments.</li>
									<li>Most important &nbsp;responsibilities.</li>
								</ul>
							</li>
						</ul>
						<h3>Skills</h3>
						<ul>
							<li>A list of your skills.</li>
						</ul>
						<h3>Education</h3>
						<ul>
							<li>
								<p><strong>MAY 2018</strong></p>
								<p>Name of University, Degree</p>
							</li>
							<li>
								<p><strong>JULY 2015</strong></p>
								<p>Name of University, Degree</p>
							</li>
						</ul>`
				},
				{
					title: 'Formal business letter',
					description: 'A clear letter template for business communication.',
					icon: formalLetterIcon,
					data: () => `<p style="text-align:right;">${ new Date().toLocaleDateString() }</p>
						<p><strong>Company name,</strong><br><strong>Street Name, Number</strong><br><strong>Post code, City</strong></p>
						<p>&nbsp;</p>
						<p>Dear [First name],</p>
						<p>Content of the letter. Content of the letter. Content of the letter. Content of the letter.
						Content of the letter.
						Content of the letter. Content of the letter. Content of the letter. Content of the letter. Content of the letter.
						Content of the letter. Content of the letter. Content of the letter. Content of the letter. Content of the letter.
						Content of the letter. Content of the letter. Content of the letter. Content of the letter. Content of the letter.
						Content of the letter. Content of the letter. Content of the letter. Content of the letter. Content of the letter.
						Content of the letter. Content of the letter. Content of the letter. Content of the letter. Content of the letter.
						Content of the letter. Content of the letter. Content of the letter. Content of the letter.&nbsp;</p>
						<p>Kind regards,</p>
						<p>Name Surname<br>Position, Company<br>Phone, E-mail</p>`
				},
				{
					title: 'Rich table',
					description: 'A table with a colorful header.',
					icon: richTableIcon,
					data: `<figure class="table" style="width:100%;">
						<table style="border:5px solid hsl(240, 75%, 60%);">
							<thead>
								<tr>
									<th style="background-color:hsl(240, 75%, 60%);text-align:center;"><span
											style="color:hsl(0, 0%, 100%);">Column 1</span></th>
									<th style="background-color:hsl(240, 75%, 60%);text-align:center;"><span
											style="color:hsl(0, 0%, 100%);">Column 2</span></th>
									<th style="background-color:hsl(240, 75%, 60%);text-align:center;"><span
											style="color:hsl(0, 0%, 100%);">Column 3</span></th>
									<th style="background-color:hsl(240, 75%, 60%);text-align:center;"><span
											style="color:hsl(0, 0%, 100%);">Column 4</span></th>
									<th style="background-color:hsl(240, 75%, 60%);text-align:center;"><span
											style="color:hsl(0, 0%, 100%);">Column 5</span></th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
								</tr>
								<tr>
									<td style="background-color:hsl(0, 0%, 90%);">&nbsp;</td>
									<td style="background-color:hsl(0, 0%, 90%);">&nbsp;</td>
									<td style="background-color:hsl(0, 0%, 90%);">&nbsp;</td>
									<td style="background-color:hsl(0, 0%, 90%);">&nbsp;</td>
									<td style="background-color:hsl(0, 0%, 90%);">&nbsp;</td>
								</tr>
								<tr>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
								</tr>
								<tr>
									<td style="background-color:hsl(0, 0%, 90%);">&nbsp;</td>
									<td style="background-color:hsl(0, 0%, 90%);">&nbsp;</td>
									<td style="background-color:hsl(0, 0%, 90%);">&nbsp;</td>
									<td style="background-color:hsl(0, 0%, 90%);">&nbsp;</td>
									<td style="background-color:hsl(0, 0%, 90%);">&nbsp;</td>
								</tr>
								<tr>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
									<td>&nbsp;</td>
								</tr>
							</tbody>
						</table>
						<figcaption>Caption of the table</figcaption>
					</figure>`
				}
			]
		},
		wproofreader: {
			serviceId: '1:Eebp63-lWHbt2-ASpHy4-AYUpy2-fo3mk4-sKrza1-NsuXy4-I1XZC2-0u2F54-aqYWd1-l3Qf14-umd',
			lang: 'auto',
			srcUrl: 'https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js'
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true,
			allowExternalImagesEditing: [ /^data:/, 'origin' ]
		},
		licenseKey: LICENSE_KEY
	} )
	.then( editor => {
		window.editor = editor;
		// Prevent showing a warning notification when user is pasting a content from MS Word or Google Docs.
		window.preventPasteFromOfficeNotification = true;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.label && item.label === 'Accessibility help' ),
			text: 'Click to display keyboard shortcuts.',
			editor,
			tippyOptions: {
				placement: 'top-start'
			}
		} );
	} )
	.catch( err => {
		console.error( err );
	} );
