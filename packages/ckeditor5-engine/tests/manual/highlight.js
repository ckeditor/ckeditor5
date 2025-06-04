/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils.js';

class FancyWidget extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		// Configure schema.
		schema.register( 'fancywidget', {
			isObject: true
		} );
		schema.extend( 'fancywidget', { allowIn: '$root' } );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'fancywidget',
			view: ( modelItem, { writer } ) => {
				const widgetElement = writer.createContainerElement( 'figure', { class: 'fancy-widget' } );
				writer.insert( writer.createPositionAt( widgetElement, 0 ), writer.createText( 'widget' ) );

				return toWidget( widgetElement, writer );
			}
		} );

		conversion.for( 'upcast' ).elementToElement( {
			view: 'figure',
			model: 'fancywidget'
		} );
	}
}

ClassicEditor.create( global.document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic, List, Table, FancyWidget ],
	toolbar: [ 'heading', '|', 'undo', 'redo', 'bold', 'italic', 'numberedList', 'bulletedList', 'insertTable' ]
} )
	.then( editor => {
		window.editor = editor;

		editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: 'marker',
			view: data => ( {
				classes: 'highlight-' + data.markerName.split( ':' )[ 1 ]
			} )
		} );

		document.getElementById( 'add-marker-yellow' ).addEventListener( 'mousedown', evt => {
			addMarker( editor, 'yellow' );
			evt.preventDefault();
		} );

		document.getElementById( 'add-marker-blue' ).addEventListener( 'mousedown', evt => {
			addMarker( editor, 'blue' );
			evt.preventDefault();
		} );

		document.getElementById( 'add-marker-red' ).addEventListener( 'mousedown', evt => {
			addMarker( editor, 'red' );
			evt.preventDefault();
		} );

		document.getElementById( 'remove-marker-yellow' ).addEventListener( 'mousedown', evt => {
			removeMarker( editor, 'yellow' );
			evt.preventDefault();
		} );

		document.getElementById( 'remove-marker-blue' ).addEventListener( 'mousedown', evt => {
			removeMarker( editor, 'blue' );
			evt.preventDefault();
		} );

		document.getElementById( 'remove-marker-red' ).addEventListener( 'mousedown', evt => {
			removeMarker( editor, 'red' );
			evt.preventDefault();
		} );

		document.getElementById( 'remove-markers' ).addEventListener( 'mousedown', evt => {
			const markers = editor.model.markers;

			editor.model.change( writer => {
				for ( const marker of markers ) {
					writer.removeMarker( marker );
				}
			} );

			evt.preventDefault();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function addMarker( editor, color ) {
	editor.model.change( writer => {
		const range = editor.model.document.selection.getFirstRange();
		writer.addMarker( 'marker:' + color, { range, usingOperation: false } );
	} );
}

function removeMarker( editor, color ) {
	editor.model.change( writer => {
		writer.removeMarker( 'marker:' + color );
	} );
}
