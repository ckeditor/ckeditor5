/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

import { Strikethrough, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { Table, TableToolbar, TableProperties, TableCellProperties, TableColumnResize } from '@ckeditor/ckeditor5-table';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';

import { PasteFromOffice } from '../../../../src/pastefromoffice.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { ImageUpload } from '@ckeditor/ckeditor5-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';

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
