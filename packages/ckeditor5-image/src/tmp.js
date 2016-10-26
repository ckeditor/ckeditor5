/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document, window */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';
import testUtils from '/tests/utils/_utils/utils.js';
import Feature from '/ckeditor5/core/feature.js';
import buildModelConverter from '/ckeditor5/engine/conversion/buildmodelconverter.js';
import buildViewConverter from '/ckeditor5/engine/conversion/buildviewconverter.js';
import ViewContainerElement from '/ckeditor5/engine/view/containerelement.js';
import ViewRange from '/ckeditor5/engine/view/range.js';
import ModelElement from '/ckeditor5/engine/model/element.js';
import ModelRange from '/ckeditor5/engine/model/range.js';
import ModelLiveRange from '/ckeditor5/engine/model/liverange.js';
import ClickObserver from '/ckeditor5/engine/view/observer/clickobserver.js';

let editor, editable, observer;

class BasicImage extends Feature {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;
		const view  = editing.view;
		const document = editor.document;
		const selected = new Set();

		// Handle clicks on view elements.
		view.addObserver( ClickObserver );
		editor.editing.view.on( 'click', ( eventInfo, domEventData ) => {
			const target = domEventData.target;

			if ( target.name == 'img' ) {
				const viewRange = ViewRange.createOn( target );
				const modelRange = ModelLiveRange.createFromRange( editing.mapper.toModelRange( viewRange ) );

				document.enqueueChanges( ( ) => {
					document.selection.setRanges( [ modelRange ] );
				} );
			}
		} );

		// Handle selection conversion.
		editing.modelToView.on( 'selection', ( evt, data, consumable, conversionApi ) => {
			const viewSelection = conversionApi.viewSelection;
			const range = data.selection.getFirstRange();
			const nodeAfterStart = range.start.nodeAfter;

			// remove selection from all selected widgets
			for ( let viewElement of selected ) {
				viewElement.setStyle( 'border', '2px solid yellow' );
			}

			// This could be just one element instead of set.
			selected.clear();

			if ( !data.selection.isCollapsed && nodeAfterStart && nodeAfterStart.name == 'image' && ModelRange.createOn( nodeAfterStart ).isEqual( range ) ) {
				viewSelection.setFake( true, { label: 'image fake selection' } );
				const viewElement = conversionApi.mapper.toViewElement( nodeAfterStart );
				viewElement.setStyle( 'border', '2px solid red' );
				selected.add( viewElement );
			}
		}, { priority: 'low' } );

		// Allow bold attribute on all inline nodes.
		// document.schema.allow( { name: '$inline', attributes: [ 'span' ] } );
		document.schema.registerItem( 'image', '$block' );
		document.schema.allow( { name: 'image', attributes: [ 'src', 'alt' ] } );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromElement( 'image' )
			.toElement( ( data ) => {
				return widgetize( new ViewContainerElement( 'img', {
					src: data.item.getAttribute( 'src' ),
					alt: data.item.getAttribute( 'alt' ),
					style: 'border: 2px solid yellow',
					class: 'ck-image'
				} ) );
			} );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'img' ).consuming( { name: true, attributes: [ 'src', 'alt' ] } )
			.toElement( ( viewElement ) => new ModelElement( 'image', {
				src: viewElement.getAttribute( 'src' ),
				alt: viewElement.getAttribute( 'alt' )
			} ) );
	}
}

function initEditor() {
	ClassicEditor.create( document.querySelector( '#editor' ), {
		features: [ 'enter', 'typing', 'paragraph', 'undo', 'heading', Test, BasicImage ],
		toolbar: [ 'headings' ]
	} )
		.then( newEditor => {
			window.editor = editor = newEditor;
			window.editable = editable = editor.editing.view.getRoot();

			observer = testUtils.createObserver();
			observer.observe( 'Editable', editable, [ 'isFocused' ] );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

initEditor();

function widgetize( element ) {
	element.isWidget = true;

	return element;
}
