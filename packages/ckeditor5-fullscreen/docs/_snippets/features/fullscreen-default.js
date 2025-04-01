/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	TOKEN_URL,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';

import { handleDocIdInUrl } from './_utils/document-id-in-url.js';
import buildUserTokenUrl from './_utils/buildusertokenurl.js';
import generateComments from './_utils/generatecomments.js';
import generateSuggestions from './_utils/generatesuggestions.js';
import { randomUserFromAPI } from './_utils/randomuser.js';

import { FullscreenEditor } from './fullscreen-build.js';

// templates icons
import articleImageRightIcon from '@assets/img/article-image-right.svg';
import financialReportIcon from '@assets/img/financial-report.svg';
import formalLetterIcon from '@assets/img/formal-letter.svg';
import resumeIcon from '@assets/img/resume.svg';
import richTableIcon from '@assets/img/rich-table.svg';

const channelId = handleDocIdInUrl();
const csConfig = {
	tokenUrl: 'https://33333.cke-cs.com/token/dev/dbIg4Hr2bqf5bSV3wuzN8bW8td7OAStvLjRlJof9ZW13cUXRHRraVJsD8J9J',
	uploadUrl: 'https://33333.cke-cs.com/easyimage/upload/',
	webSocketUrl: '33333.cke-cs.com/ws'
};

const initialCommentsData = {
	user: {
		id: '1',
		name: 'John Doe',
		email: 'john.doe@example.com'
	},
	comments: {
		thread1: [
			'<p>We need to insert a table with late fees.</p>'
		],
		thread2: [
			'<p>Here\'s a place for the description of services.</p>'
		]
	}
};

const initialSuggestionsData = {
	user: {
		id: '2',
		name: 'Zoe Doe',
		email: 'zoe.doe@example.com'
	},
	suggestions: [
		{
			id: 's1',
			type: 'insertion',
			data: null
		}
	]
};

const initialData = `
	<h2 class="document-title">SERVICES AGREEMENT</h2>
	<p>
		This Contract for Services Agreement (the “<i>Agreement</i>”) is made and entered into as of [date] (the
		“<i>Effective Date</i>”), by and between [Client Name], a [state] corporation with its principal place of business
		at [address] (the “<i>Client</i>”), and [Service Provider Name], a [state] corporation with its principal place of
		business at [address] (the “<i>Service Provider</i>”).
	</p>
	<h3>Scope of Services</h3>
	<p>
		The Service Provider shall provide the following services to the CLIENT (the “<i>Services</i>”):
	</p>
	<p>
		<comment-start name="${ channelId }-thread2"></comment-start>
		[Insert description of services]
		<comment-end name="${ channelId }-thread2"></comment-end>
	</p>
	<h3>Term</h3>
	<p>
		This Agreement shall commence on the Effective Date and shall continue until [Insert date], unless earlier
		terminated as provided herein (the “<i>Term</i>”).
	</p>
	<h3>Compensation</h3>
	<p>
		In consideration of the Services to be provided by the Service Provider, the Client shall pay the Service Provider
		the fees set forth in <a href="http://example.com">Exhibit A</a> attached hereto and incorporated herein by
		reference (the “<i>Fees</i>”).
	</p>
	<p>
		The Client shall pay the Fees within [Insert number] days of receipt of an invoice from the Service Provider.
	</p>
	<p>
		If any Fees are not paid when due, the Service Provider may, in its sole discretion, suspend or terminate the
		Services.
	</p>
	<h4 class="document-subtitle">
		<comment-start name="${ channelId }-thread1"></comment-start>
		Late Fees
		<comment-end name="${ channelId }-thread1"></comment-end>
	</h4>
	<p>
		If any payment is not received by the Service Provider within [Insert number] days of its due date, the Client shall
		pay a late fee equal to [Insert percentage] of the unpaid amount. The following table sets forth the specific late
		fee percentages that will apply based on the number of days the payment is past due:
	</p>
	<figure class="table" data-suggestion-end-after="insertion:${ channelId }-s1:2"
		data-suggestion-start-before="insertion:${ channelId }-s1:2">
		<table>
			<thead>
				<tr>
					<th>Days Past Due</th>
					<th>Late Fee Percentage</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>1-30 days</td>
					<td>[Insert percentage]</td>
				</tr>
				<tr>
					<td>31-60 days</td>
					<td>[Insert percentage]</td>
				</tr>
				<tr>
					<td>61-90 days</td>
					<td>[Insert percentage]</td>
				</tr>
				<tr>
					<td>Over 90 days</td>
					<td>[Insert percentage]</td>
				</tr>
			</tbody>
		</table>
	</figure>
	<p>
		The Client agrees that the late fees set forth in this table are reasonable and necessary to compensate the Service
		Provider for the costs and expenses it will incur as a result of any late payments. The Service Provider reserves
		the right to waive or reduce any late fees in its sole discretion.
	</p>
	<h3>Termination</h3>
	<p>
		This Agreement may be terminated:&nbsp;
	</p>
	<ol style="list-style-type:lower-latin;">
		<li>
			<p>By either party upon [Insert number] days’ written notice to the other party;</p>
		</li>
		<li>
			<p>By the Client upon the occurrence of a material breach by the Service Provider of this Agreement that is not
				cured within [Insert number] days after written notice thereof is given to the Service Provider; or</p>
		</li>
		<li>
			<p>By the Service Provider upon the occurrence of a material breach by the Client of this Agreement that is not
				cured within [Insert number] days after written notice thereof is given to the Client.</p>
		</li>
	</ol>
	<h3 class="document-subtitle">Effect of Termination</h3>
	<p>
		Upon termination of this Agreement for any reason, the Service Provider shall immediately cease providing the
		Services, and the Client shall pay the Service Provider for all Services performed prior to the effective date of
		termination.
	</p>
	<h3>Confidentiality</h2>
	<p>
		The Service Provider agrees to keep confidential all information and materials disclosed by the Client to the
		Service Provider in connection with the Services (the “<i>Confidential Information</i>”).
	</p>
	<p>
		The Service Provider shall not use the Confidential Information for any purpose other than to perform the
		Services.
	</p>
	<p>
		The Service Provider shall take reasonable measures to protect the confidentiality of the Confidential
		Information.
	</p>
	<h3>Exceptions</h3>
	<p>
		The obligations of confidentiality set forth in this Agreement shall not apply to any Confidential Information
		that:
	</p>
	<ol style="list-style-type:lower-latin;">
		<li>
			<p>is already known to the Service Provider prior to its disclosure by the Client;</p>
		</li>
		<li>
			<p>is or becomes publicly known through no fault of the Service Provider; or</p>
		</li>
		<li>
			<p>is obtained by the Service Provider from a third party without a breach of any
				obligation of confidentiality.</p>
		</li>
	</ol>
	<h3>Representations and Warranties</h3>
	<p>
		The Service Provider represents and warrants that it has the necessary expertise, qualifications, and experience
		to perform the Services.
	</p>
	<p>
		The Client represents and warrants that it has the legal right to engage the Service Provider to perform the
		Services.
	</p>
	<h3 class="document-subtitle">Disclaimer of Other Warranties</h3>
	<p>
		Except for the express warranties set forth in this Agreement, the Service Provider makes no other warranties,
		express or implied, with respect to the Services, including, without limitation, any implied warranties of
		merchantability or fitness for a particular purpose.
	</p>
`;

generateComments( csConfig, channelId, initialCommentsData )
	.catch( error => console.error( error ) )
	.then( generateSuggestions( csConfig, channelId, initialSuggestionsData ) )
	.catch( error => console.error( error ) )
	.then( () => randomUserFromAPI() )
	.then( randomUser => {
		csConfig.tokenUrl = buildUserTokenUrl( csConfig.tokenUrl, randomUser );

		FullscreenEditor
			.create( document.querySelector( '#default_editor' ), {
				initialData,
				ui: {
					viewportOffset: {
						top: getViewportTopOffsetConfig()
					}
				},
				toolbar: {
					items: [
						'fullscreen',
						'|',
						'undo', 'redo',
						'|',
						'previousPage',
						'nextPage',
						'pageNavigation',
						'|',
						'comment', 'commentsArchive', 'trackChanges', 'revisionHistory',
						'|',
						'exportPdf', 'exportWord', 'importWord',
						'|',
						'formatPainter', 'findAndReplace', 'selectAll', 'wproofreader',
						'|',
						'heading',
						'|',
						'style',
						'|',
						'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
						'|',
						'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code',
						'|',
						'removeFormat',
						'|',
						'specialCharacters', 'horizontalLine', 'pageBreak',
						'|',
						'link', 'bookmark', 'insertImage', 'ckbox', 'insertTable', 'tableOfContents',
						'insertTemplate', 'highlight', 'blockQuote', 'mediaEmbed', 'codeBlock', 'htmlEmbed',
						'|',
						'alignment',
						'|',
						'bulletedList', 'numberedList', 'multiLevelList', 'outdent', 'indent'
					]
				},
				pagination: {
					pageWidth: '21cm',
					pageHeight: '29.7cm',
					pageMargins: {
						top: '20mm',
						bottom: '20mm',
						right: '12mm',
						left: '12mm'
					}
				},
				exportPdf: {
					dataCallback: editor => editor.getData( {
						showSuggestionHighlights: true,
						showCommentHighlights: true
					} ),
					stylesheets: [
						'../assets/pagination-fonts.css',
						'../assets/ckeditor5/ckeditor5.css',
						'../assets/ckeditor5-premium-features/ckeditor5-premium-features.css',
						'../assets/pagination.css'
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
						'../assets/ckeditor5/ckeditor5.css',
						'../assets/ckeditor5-premium-features/ckeditor5-premium-features.css'
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
						'imageTextAlternative',
						'toggleImageCaption',
						'|',
						'imageStyle:inline',
						'imageStyle:wrapText',
						'imageStyle:breakText', '|',
						'resizeImage',
						'|',
						'ckboxImageEdit'
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
								'@apple', '@bears', '@brownie', '@cake', '@cake', '@candy',
								'@canes', '@chocolate', '@cookie', '@cotton', '@cream',
								'@cupcake', '@danish', '@donut', '@dragée', '@fruitcake',
								'@gingerbread', '@gummi', '@ice', '@jelly-o', '@liquorice',
								'@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding',
								'@sesame', '@snaps', '@soufflé', '@sugar', '@sweet', '@topping', '@wafer'
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
						'tableColumn',
						'tableRow',
						'mergeTableCells',
						'tableProperties',
						'tableCellProperties',
						'toggleTableCaption'
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
									<img src="../assets/img/ckeditor-logo.png">
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
										<img src="../assets/img/user-avatar.png">
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
								<p><strong>Company name,</strong><br><strong>Street Name, Number</strong>
								<br>
								<strong>Post code, City</strong></p>
								<p>&nbsp;</p>
								<p>Dear [First name],</p>
								<p>
									Content of the letter. Content of the letter. Content of the letter. Content of the letter.
									Content of the letter. Content of the letter. Content of the letter. Content of the letter.
									Content of the letter. Content of the letter. Content of the letter. Content of the letter.
									Content of the letter. Content of the letter. Content of the letter. Content of the letter.
									Content of the letter. Content of the letter. Content of the letter. Content of the letter.
									Content of the letter. Content of the letter. Content of the letter. Content of the letter.
									Content of the letter. Content of the letter. Content of the letter. Content of the letter.&nbsp;
								</p>
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
				documentOutline: {
					container: document.querySelector( '#default_document-outline-container' )
				},
				wproofreader: {
					serviceId: '1:Eebp63-lWHbt2-ASpHy4-AYUpy2-fo3mk4-sKrza1-NsuXy4-I1XZC2-0u2F54-aqYWd1-l3Qf14-umd',
					lang: 'auto',
					srcUrl: 'https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js'
				},
				ckbox: {
					tokenUrl: TOKEN_URL,
					forceDemoLabel: true,
					allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ]
				},
				collaboration: {
					channelId
				},
				cloudServices: csConfig,
				sidebar: {
					container: document.querySelector( '#default_sidebar-container' )
				},
				comments: {
					editorConfig: {
						extraPlugins: []
					}
				},
				revisionHistory: {
					editorContainer: document.querySelector( '#default_demo-container' ),
					viewerContainer: document.querySelector( '#default_revision-viewer-container' ),
					viewerEditorElement: document.querySelector( '#default_revision-viewer-editor' ),
					viewerSidebarContainer: document.querySelector( '#default_revision-viewer-sidebar' )
				},
				presenceList: {
					container: document.querySelector( '#default_presence' )
				},
				fullscreen: {
					onEnterCallback: container => container.classList.add( 'formatted', 'live-snippet' )
				}
			} )
			.then( editor => {
				document.querySelector( '#default_toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
				editor.plugins.get( 'AnnotationsUIs' ).switchTo( 'narrowSidebar' );

				window.editorDefault = editor;

				// Prevent showing a warning notification when user is pasting a content from MS Word or Google Docs.
				window.preventPasteFromOfficeNotification = true;

				return editor;
			} )
			.then( editor => {
				document.querySelector( '#default_live-snippet__loader' ).classList.add( 'fadeout' );
				document.querySelector( '#default_live-snippet__container' ).classList.add( 'loaded' );

				attachTourBalloon( {
					target: findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Enter fullscreen mode' ),
					text: 'Click here to enter fullscreen mode.',
					editor,
					tippyOptions: {
						placement: 'bottom-start'
					}
				} );
			} )
			.catch( err => {
				console.error( err );
			} );
	} );
