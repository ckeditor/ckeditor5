/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import RealTimeCollaborativeEditing from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativeediting';
import RealTimeCollaborativeComments from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativecomments';
import RealTimeCollaborativeTrackChanges from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativetrackchanges';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import Comments from '@ckeditor/ckeditor5-comments/src/comments';
import TrackChanges from '@ckeditor/ckeditor5-track-changes/src/trackchanges';

import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableSelection from '@ckeditor/ckeditor5-table/src/tableselection';
import TableClipboard from '@ckeditor/ckeditor5-table/src/tableclipboard';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';

import TableColumnResize from '../../src/tablecolumnresize';

// We need dynamic channel to not interfere with other tests and testers.
const channelId = Date.now();

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			Superscript,
			Subscript,
			Underline,
			Strikethrough,
			RealTimeCollaborativeEditing,
			RealTimeCollaborativeComments,
			RealTimeCollaborativeTrackChanges,
			CloudServices,
			Comments,
			TrackChanges,
			Table,
			TableToolbar,
			TableSelection,
			TableClipboard,
			TableProperties,
			TableCellProperties,
			TableCaption,
			TableColumnResize
		],
		toolbar: [
			'heading', 'insertTable', '|',
			'bold', 'italic', 'link', 'superscript', 'subscript', 'underline', 'strikethrough', '|',
			'bulletedList', 'numberedList', 'blockQuote', '|',
			'undo', 'redo', 'selectAll', 'insertTable', 'trackChanges', 'comment'
		],
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
		cloudServices: {
			// PROVIDE CORRECT VALUES HERE:
			tokenUrl: 'https://33333.cke-cs.com/token/dev/dbIg4Hr2bqf5bSV3wuzN8bW8td7OAStvLjRlJof9ZW13cUXRHRraVJsD8J9J',
			uploadUrl: 'https://33333.cke-cs.com/easyimage/upload/',
			webSocketUrl: '33333.cke-cs.com/ws'
		},
		collaboration: {
			channelId: 'doc' + channelId
		},
		comments: {
			editorConfig: {}
		},
		sidebar: {
			container: document.querySelector( '#sidebar' )
		}
	} )
	.then( editor => {
		editor.execute( 'trackChanges' );
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
