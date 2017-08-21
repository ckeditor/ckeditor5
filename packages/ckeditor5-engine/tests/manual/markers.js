/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

import buildModelConverter from '../../src/conversion/buildmodelconverter';
import Position from '../../src/model/position';
import Range from '../../src/model/range';

const markerNames = [];
let model = null;
let _uid = 1;

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Bold, Italic, List, Heading, Undo ],
		toolbar: [ 'headings', 'bold', 'italic', 'bulletedList', 'numberedList', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
		model = window.editor.editing.model;

		buildModelConverter().for( editor.editing.modelToView )
			.fromMarker( 'highlight' )
			.toHighlight( data => {
				const color = data.markerName.split( ':' )[ 1 ];

				return {
					class: 'h-' + color,
					priority: 1
				};
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

		model.enqueueChanges( () => {
			const root = model.getRoot();
			const range = new Range( new Position( root, [ 0, 10 ] ), new Position( root, [ 0, 16 ] ) );
			const name = 'highlight:yellow:' + uid();

			markerNames.push( name );
			model.markers.set( name, range );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function uid() {
	return _uid++;
}

function addHighlight( color ) {
	model.enqueueChanges( () => {
		const range = Range.createFromRange( model.selection.getFirstRange() );
		const name = 'highlight:' + color + ':' + uid();

		markerNames.push( name );
		model.markers.set( name, range );
	} );
}

function removeHighlight() {
	model.enqueueChanges( () => {
		const pos = model.selection.getFirstPosition();

		for ( let i = 0; i < markerNames.length; i++ ) {
			const name = markerNames[ i ];
			const marker = model.markers.get( name );
			const range = marker.getRange();

			if ( range.containsPosition( pos ) || range.start.isEqual( pos ) || range.end.isEqual( pos ) ) {
				model.markers.remove( name );

				markerNames.splice( i, 1 );
				break;
			}
		}
	} );
}

function moveSelectionToStart() {
	const range = model.selection.getFirstRange();

	if ( range.isFlat ) {
		model.enqueueChanges( () => {
			model.batch().move( range, new Position( model.getRoot(), [ 0, 0 ] ) );
		} );
	}
}

function moveSelectionByOffset( offset ) {
	const range = model.selection.getFirstRange();
	const pos = offset < 0 ? range.start : range.end;

	if ( range.isFlat ) {
		model.enqueueChanges( () => {
			model.batch().move( range, pos.getShiftedBy( offset ) );
		} );
	}
}
