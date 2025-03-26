/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Keep the guide listing updated with each change.

import {
	ClassicEditor,
	Alignment,
	Autoformat,
	Bold,
	Code,
	Italic,
	Strikethrough,
	Subscript,
	Superscript,
	Underline,
	BlockQuote,
	CKBox,
	CKBoxImageEdit,
	CloudServices,
	CodeBlock,
	Essentials,
	FindAndReplace,
	Font,
	GeneralHtmlSupport,
	Heading,
	Highlight,
	HorizontalLine,
	HtmlEmbed,
	AutoImage,
	Image,
	ImageCaption,
	ImageInsert,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	PictureEditing,
	Indent,
	IndentBlock,
	AutoLink,
	Link,
	LinkImage,
	List,
	ListProperties,
	TodoList,
	MediaEmbed,
	Mention,
	PageBreak,
	Paragraph,
	PasteFromOffice,
	RemoveFormat,
	ShowBlocks,
	TextTransformation,
	SourceEditing,
	SpecialCharacters,
	SpecialCharactersEssentials,
	Style,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar
} from 'ckeditor5';
import {
	CaseChange,
	TableOfContents,
	ExportPdf,
	ExportWord,
	FormatPainter,
	ImportWord,
	PasteFromOfficeEnhanced,
	SlashCommand,
	Template
} from 'ckeditor5-premium-features';
import { WProofreader } from '@webspellchecker/wproofreader-ckeditor5';
import {
	TOKEN_URL,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';

// Templates icons.
import articleImageRightIcon from '@assets/img/article-image-right.svg';
import financialReportIcon from '@assets/img/financial-report.svg';
import formalLetterIcon from '@assets/img/formal-letter.svg';
import resumeIcon from '@assets/img/resume.svg';
import richTableIcon from '@assets/img/rich-table.svg';

ClassicEditor
	.create( document.querySelector( '#keyboard-support' ), {
		// cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
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
				'../../assets/ckeditor5/ckeditor5.css',
				'../../assets/ckeditor5-premium-features/ckeditor5-premium-features.css',
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
			stylesheets: [
				'../../assets/ckeditor5/ckeditor5.css',
				'../../assets/ckeditor5-premium-features/ckeditor5-premium-features.css'
			],
			fileName: 'export-word-demo.docx',
			appID: 'cke5-docs',
			converterOptions: {
				document: {
					size: 'A4',
					orientation: 'portrait',
					margin: {
						top: '20mm',
						bottom: '20mm',
						right: '12mm',
						left: '12mm'
					}
				}
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
					description: 'Simple heading with text and image.',
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
		}
	} )
	.then( editor => {
		window.editor = editor;
		// Prevent showing a warning notification when user is pasting a content from MS Word or Google Docs.
		window.preventPasteFromOfficeNotification = true;

		attachTourBalloon( {
			target: findToolbarItem(
				editor.ui.view.toolbar,
				item => item.label && item.label === 'Accessibility help'
			),
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
