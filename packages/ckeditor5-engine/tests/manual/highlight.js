/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import buildModelConverter from '../../src/conversion/buildmodelconverter';
import buildViewConverter from '../../src/conversion/buildviewconverter';
import ModelRange from '../../src/model/range';
import ModelElement from '../../src/model/element';
import ViewContainerElement from '../../src/view/containerelement';
import ViewText from '../../src/view/text';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

class FancyWidget extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		const editor = this.editor;
		const doc = editor.document;
		const schema = doc.schema;
		const data = editor.data;
		const editing = editor.editing;

		// Configure schema.
		schema.registerItem( 'fancywidget' );
		schema.allow( { name: 'fancywidget', inside: '$root' } );
		schema.objects.add( 'fancywidget' );

		// Build converter from model to view for editing pipeline.
		buildModelConverter().for( editing.modelToView )
			.fromElement( 'fancywidget' )
			.toElement( () => {
				const widgetElement = new ViewContainerElement( 'figure', { class: 'fancy-widget' }, new ViewText( 'widget' ) );

				return toWidget( widgetElement );
			} );

		// Build converter from view element to model element for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'figure' )
			.toElement( () => new ModelElement( 'fancywidget' ) );
	}
}

ClassicEditor.create( global.document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic, List, FancyWidget ],
	toolbar: [ 'headings', 'undo', 'redo', 'bold', 'italic', 'numberedList', 'bulletedList' ]
} )
	.then( editor => {
		window.editor = editor;

		buildModelConverter()
			.for( editor.editing.modelToView )
			.fromMarker( 'marker' )
			.toHighlight( data => ( { class: 'highlight-' + data.markerName.split( ':' )[ 1 ] } ) );

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
			const markers = editor.document.markers;

			editor.document.enqueueChanges( () => {
				for ( const marker of markers ) {
					markers.remove( marker );
				}
			} );

			evt.preventDefault();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function addMarker( editor, color ) {
	const model = editor.document;

	editor.document.enqueueChanges( () => {
		const range = ModelRange.createFromRange( model.selection.getFirstRange() );
		model.markers.set( 'marker:' + color, range );
	} );
}

function removeMarker( editor, color ) {
	const model = editor.document;

	editor.document.enqueueChanges( () => {
		model.markers.remove( 'marker:' + color );
	} );
}
