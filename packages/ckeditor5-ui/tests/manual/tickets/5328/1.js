/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar } from '@ckeditor/ckeditor5-table';
import BalloonPanelView from '../../../../src/panel/balloon/balloonpanelview.js';

// Set initial scroll for the outer container element.
document.querySelector( '.container-outer:not( .container-outer--large )' ).scrollTop = 420;
document.querySelector( '.container-outer:not( .container-outer--large )' ).scrollLeft = 460;

ClassicEditor
	.create( document.querySelector( '#editor-stick' ), {
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		plugins: [ ArticlePluginSet, TableToolbar, TableCaption, TableCellProperties, TableColumnResize, TableProperties ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', 'link', '|', 'insertTable' ],
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
			]
		},
		ui: {
			poweredBy: {
				position: 'inside'
			},
			viewportOffset: {
				top: 30
			}
		}
	} )
	.then( editor => {
		const panel = new BalloonPanelView();

		editor.ui.view.body.add( panel );
		panel.element.innerHTML = 'Balloon content.';

		editor.ui.view.element.querySelector( '.ck-editor__editable' ).scrollTop = 360;

		panel.pin( {
			target: editor.ui.view.element.querySelector( '.ck-editor__editable p strong' ),
			limiter: editor.ui.getEditableElement()
		} );

		window.stickEditor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Editor with scroll
ClassicEditor
	.create( document.querySelector( '#editor-with-scroll' ), {
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		plugins: [ ArticlePluginSet, TableToolbar, TableCaption, TableCellProperties, TableColumnResize, TableProperties ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', 'link', '|', 'insertTable' ],
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
			]
		},
		ui: {
			viewportOffset: {
				top: 0
			}
		}
	} )
	.then( editor => {
		const panel = new BalloonPanelView();

		editor.ui.view.body.add( panel );
		panel.element.innerHTML = 'Balloon content.';

		editor.ui.view.element.querySelector( '.ck-editor__editable' ).scrollTop = 360;

		panel.pin( {
			target: editor.ui.view.element.querySelector( '.ck-editor__editable p strong' ),
			limiter: editor.ui.getEditableElement()
		} );

		window.scrollEditor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Editor "out of the box"
ClassicEditor
	.create( document.querySelector( '#editor-out-of-the-box' ), {
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		plugins: [ ArticlePluginSet, TableToolbar, TableCaption, TableCellProperties, TableColumnResize, TableProperties ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', 'link', '|', 'insertTable' ],
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
			]
		},
		ui: {
			viewportOffset: {
				top: 0
			}
		}
	} )
	.then( editor => {
		window.outOfTheBoxEditor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

