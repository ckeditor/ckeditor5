/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';

import PasteFromOffice from '../../src/pastefromoffice';

import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const htmlDiv = document.querySelector( '#html' );
const textDiv = document.querySelector( '#text' );
const dataDiv = document.querySelector( '#data' );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			ArticlePluginSet,
			Strikethrough,
			Underline,
			Table,
			TableToolbar,
			PageBreak,
			TableProperties,
			TableCellProperties,
			ImageUpload,
			CloudServices,
			EasyImage,
			PasteFromOffice,
			FontColor,
			FontBackgroundColor,
			ListProperties
		],
		list: { properties: { styles: true, startIndex: true } },
		toolbar: [ 'heading', '|', 'bold', 'italic', 'strikethrough', 'underline', 'link',
			'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'pageBreak', 'undo', 'redo' ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;

		const clipboard = editor.plugins.get( 'ClipboardPipeline' );

		editor.editing.view.document.on( 'paste', ( evt, data ) => {
			console.clear();

			console.log( '----- paste -----' );
			console.log( data );
			console.log( 'text/html\n', data.dataTransfer.getData( 'text/html' ) );
			console.log( 'text/plain\n', data.dataTransfer.getData( 'text/plain' ) );

			htmlDiv.innerText = data.dataTransfer.getData( 'text/html' );
			textDiv.innerText = data.dataTransfer.getData( 'text/plain' );
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
