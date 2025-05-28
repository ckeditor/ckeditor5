/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak.js';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties.js';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties.js';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import Bookmark from '@ckeditor/ckeditor5-bookmark/src/bookmark.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import PasteFromOffice from '../../src/pastefromoffice.js';

import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

const htmlDiv = document.querySelector( '#html' );
const textDiv = document.querySelector( '#text' );
const dataDiv = document.querySelector( '#data' );
const rtfDiv = document.querySelector( '#rtf' );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			ArticlePluginSet,
			Strikethrough,
			Underline,
			GeneralHtmlSupport,
			Table,
			TableToolbar,
			PageBreak,
			TableProperties,
			TableCellProperties,
			TableColumnResize,
			ImageUpload,
			CloudServices,
			EasyImage,
			PasteFromOffice,
			FontColor,
			FontBackgroundColor,
			ListProperties,
			Bookmark
		],
		bookmark: {
			enableNonEmptyAnchorConversion: false
		},
		list: { properties: { styles: true, startIndex: true } },
		toolbar: [ 'heading', '|', 'bold', 'italic', 'strikethrough', 'underline', 'link', 'bookmark',
			'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'pageBreak', 'undo', 'redo' ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
		},
		cloudServices: CS_CONFIG,
		htmlSupport: {
			allow: [
				{
					name: /.*/,
					attributes: true,
					classes: true,
					styles: true
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		const clipboard = editor.plugins.get( 'ClipboardPipeline' );

		editor.editing.view.document.on( 'paste', ( evt, data ) => {
			console.clear();

			console.log( '----- paste -----' );
			console.log( data );
			console.log( 'text/html\n', data.dataTransfer.getData( 'text/html' ) );
			console.log( 'text/rtf\n', data.dataTransfer.getData( 'text/rtf' ) );
			console.log( 'text/plain\n', data.dataTransfer.getData( 'text/plain' ) );

			htmlDiv.innerText = data.dataTransfer.getData( 'text/html' );
			textDiv.innerText = data.dataTransfer.getData( 'text/plain' );
			rtfDiv.innerText = data.dataTransfer.getData( 'text/rtf' );
		} );

		clipboard.on( 'inputTransformation', ( evt, data ) => {
			console.log( '----- clipboardInput -----' );
			console.log( 'stringify( data.dataTransfer )\n', stringifyView( data.content ) );

			dataDiv.innerText = stringifyView( data.content );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
