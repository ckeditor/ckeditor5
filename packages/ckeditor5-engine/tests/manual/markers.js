/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';

import Position from '../../src/model/position.js';
import Range from '../../src/model/range.js';

const markerNames = [];
let model = null;
let _uid = 1;

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Bold, Italic, List, Heading, Undo ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
		model = editor.model;

		editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: 'highlight',
			view: data => {
				const color = data.markerName.split( ':' )[ 1 ];

				return {
					classes: 'h-' + color,
					priority: 1
				};
			}
		} );

		editor.conversion.for( 'dataDowncast' ).markerToHighlight( {
			model: 'highlight',
			view: data => {
				const color = data.markerName.split( ':' )[ 1 ];

				return {
					classes: 'h-' + color,
					priority: 1
				};
			}
		} );

		window.document.getElementById( 'add-yellow' ).addEventListener( 'mousedown', e => {
			e.preventDefault();
			addHighlight( 'yellow' );
		} );

		window.document.getElementById( 'add-red' ).addEventListener( 'mousedown', e => {
			e.preventDefault();
			addHighlight( 'red' );
		} );

		window.document.getElementById( 'remove-marker' ).addEventListener( 'mousedown', e => {
			e.preventDefault();
			removeHighlight();
		} );

		window.document.getElementById( 'move-to-start' ).addEventListener( 'mousedown', e => {
			e.preventDefault();
			moveSelectionToStart();
		} );

		window.document.getElementById( 'move-left' ).addEventListener( 'mousedown', e => {
			e.preventDefault();
			moveSelectionByOffset( -1 );
		} );

		window.document.getElementById( 'move-right' ).addEventListener( 'mousedown', e => {
			e.preventDefault();
			moveSelectionByOffset( 1 );
		} );

		model.change( writer => {
			const root = model.document.getRoot();
			const range = new Range( new Position( root, [ 0, 10 ] ), new Position( root, [ 0, 16 ] ) );
			const name = 'highlight:yellow:' + uid();

			markerNames.push( name );
			writer.addMarker( name, { range, usingOperation: false, affectsData: true } );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function uid() {
	return _uid++;
}

function addHighlight( color ) {
	model.change( writer => {
		const range = model.document.selection.getFirstRange();
		const name = 'highlight:' + color + ':' + uid();

		markerNames.push( name );
		writer.addMarker( name, { range, usingOperation: false } );
	} );
}

function removeHighlight() {
	model.change( writer => {
		const pos = model.document.selection.getFirstPosition();

		for ( let i = 0; i < markerNames.length; i++ ) {
			const name = markerNames[ i ];
			const marker = model.markers.get( name );
			const range = marker.getRange();

			if ( range.containsPosition( pos ) || range.start.isEqual( pos ) || range.end.isEqual( pos ) ) {
				writer.removeMarker( name );

				markerNames.splice( i, 1 );
				break;
			}
		}
	} );
}

function moveSelectionToStart() {
	const range = model.document.selection.getFirstRange();

	if ( range.isFlat ) {
		model.change( writer => {
			writer.move( range, new Position( model.document.getRoot(), [ 0, 0 ] ) );
		} );
	}
}

function moveSelectionByOffset( offset ) {
	const range = model.document.selection.getFirstRange();
	const pos = offset < 0 ? range.start : range.end;

	if ( range.isFlat ) {
		model.change( writer => {
			writer.move( range, pos.getShiftedBy( offset ) );
		} );
	}
}
