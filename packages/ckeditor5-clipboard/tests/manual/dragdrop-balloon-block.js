/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic, Code } from '@ckeditor/ckeditor5-basic-styles';
import { Heading, HeadingButtonsUI } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar, ImageResize, ImageInsert, AutoImage, ImageUpload } from '@ckeditor/ckeditor5-image';
import { Link, LinkImage, AutoLink } from '@ckeditor/ckeditor5-link';
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { Paragraph, ParagraphButtonUI } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar, TableProperties, TableCellProperties, TableCaption, TableColumnResize } from '@ckeditor/ckeditor5-table';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { BalloonEditor } from '@ckeditor/ckeditor5-editor-balloon';
import { BlockToolbar } from '@ckeditor/ckeditor5-ui';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

BalloonEditor
	.create( document.querySelector( '#editor-balloon' ), {
		plugins: [
			Essentials, List, Paragraph, Heading, BlockQuote, Bold, Italic, Code,
			Image, ImageResize, ImageStyle, ImageToolbar, ImageCaption, HorizontalLine,
			HeadingButtonsUI, ParagraphButtonUI, BlockToolbar, Table, TableToolbar,
			CloudServices, ImageUpload, EasyImage, ImageInsert, AutoImage, PageBreak,
			Link, LinkImage, AutoLink, ListProperties, CodeBlock, HtmlEmbed, Alignment,
			TableProperties, TableCellProperties, TableCaption, TableColumnResize
		],
		cloudServices: CS_CONFIG,
		blockToolbar: [
			'heading', '|',
			'bold', 'italic', 'code', 'link', '|',
			'bulletedList', 'numberedList', '|',
			'blockQuote', 'insertImage', 'insertTable', 'codeBlock', 'htmlEmbed', '|',
			'alignment', '|',
			'pageBreak', 'horizontalLine', '|',
			'undo', 'redo'
		],
		image: {
			toolbar: [
				'imageTextAlternative', 'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:breakText', 'imageStyle:wrapText', '|',
				'resizeImage'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
			]
		}
	} )
	.then( editor => {
		window.editorBalloon = editor;

		CKEditorInspector.attach( { balloon: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
