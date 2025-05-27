/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

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

import PasteFromOffice from '../../../../src/pastefromoffice.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, Strikethrough, Underline, Table, TableToolbar, PageBreak, CloudServices, TableColumnResize,
			TableProperties, TableCellProperties, EasyImage, PasteFromOffice, FontColor, FontBackgroundColor, ImageUpload ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'strikethrough', 'underline', 'link',
			'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'pageBreak', 'undo', 'redo' ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
