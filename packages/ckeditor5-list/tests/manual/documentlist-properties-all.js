/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { AutoImage, ImageResize, ImageUpload, Image, ImageCaption, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { HtmlComment } from '@ckeditor/ckeditor5-html-support';
import { LinkImage, Link } from '@ckeditor/ckeditor5-link';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { TableCaption, Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import { List } from '../../src/list.js';
import { ListProperties } from '../../src/listproperties.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		...( {
			plugins: [
				Essentials, BlockQuote, Bold, Heading, Image, ImageCaption, ImageStyle, ImageToolbar, Indent, Italic, Link,
				MediaEmbed, Paragraph, Table, TableToolbar, CodeBlock, TableCaption, EasyImage, ImageResize, LinkImage,
				AutoImage, HtmlEmbed, HtmlComment, Alignment, PageBreak, HorizontalLine, ImageUpload,
				CloudServices, SourceEditing, List, ListProperties
			],
			toolbar: [
				'sourceEditing', '|',
				'numberedList', 'bulletedList', '|',
				'outdent', 'indent', '|',
				'heading', '|',
				'bold', 'italic', 'link', '|',
				'blockQuote', 'uploadImage', 'insertTable', 'mediaEmbed', 'codeBlock', '|',
				'htmlEmbed', '|',
				'alignment', '|',
				'pageBreak', 'horizontalLine', '|',
				'undo', 'redo'
			],
			cloudServices: CS_CONFIG,
			table: {
				contentToolbar: [
					'tableColumn', 'tableRow', 'mergeTableCells', 'toggleTableCaption'
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
						label: 'Original size',
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
					'imageStyle:inline', 'imageStyle:breakText', 'imageStyle:wrapText', '|',
					'resizeImage'
				]
			},
			placeholder: 'Type the content here!',
			htmlEmbed: {
				showPreviews: true,
				sanitizeHtml: html => ( { html, hasChange: false } )
			}
		} ),
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

document.getElementById( 'chbx-show-borders' ).addEventListener( 'change', () => {
	document.body.classList.toggle( 'show-borders' );
} );
