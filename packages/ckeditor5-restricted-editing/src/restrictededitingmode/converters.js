/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmode/converters
 */

import Matcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import { getMarker } from './utils';

const HIGHLIGHT_CLASS = 'ck-restricted-editing-exception_selected';

/**
 *
 * @param editor
 */
export function setupMarkersConversion( editor ) {
	// The restricted editing does not attach additional data to the zones so there's no need for smarter markers management.
	// Also, the markers will only be created when  when loading the data.
	let markerNumber = 0;

	editor.conversion.for( 'upcast' ).add( upcastHighlightToMarker( {
		view: {
			name: 'span',
			classes: 'ck-restricted-editing-exception'
		},
		model: () => {
			markerNumber++; // Starting from restricted-editing-exception:1 marker.

			return `restricted-editing-exception:${ markerNumber }`;
		}
	} ) );

	// Currently the marker helpers are tied to other use-cases and do not render collapsed marker as highlight.
	// That's why there are 2 downcast converters for them:
	// 1. The default marker-to-highlight will wrap selected text with `<span>`.
	editor.conversion.for( 'downcast' ).markerToHighlight( {
		model: 'restricted-editing-exception',
		// Use callback to return new object every time new marker instance is created - otherwise it will be seen as the same marker.
		view: () => ( {
			name: 'span',
			classes: 'ck-restricted-editing-exception',
			priority: -10
		} )
	} );

	// 2. But for collapsed marker we need to render it as an element.
	// Additionally the editing pipeline should always display a collapsed markers.
	editor.conversion.for( 'editingDowncast' ).markerToElement( {
		model: 'restricted-editing-exception',
		view: ( markerData, viewWriter ) => viewWriter.createUIElement( 'span', {
			class: 'ck-restricted-editing-exception ck-restricted-editing-exception_collapsed'
		} )
	} );

	editor.conversion.for( 'dataDowncast' ).markerToElement( {
		model: 'restricted-editing-exception',
		view: ( markerData, viewWriter ) => viewWriter.createEmptyElement( 'span', {
			class: 'ck-restricted-editing-exception'
		} )
	} );
}

/**
 * Adds a visual highlight style to a restricted editing exception the selection is anchored to.
 *
 * Highlight is turned on by adding the `.ck-restricted-editing-exception_selected` class to the
 * exception in the view:
 *
 * * The class is removed before the conversion has started, as callbacks added with the `'highest'` priority
 * to {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} events.
 * * The class is added in the view post fixer, after other changes in the model tree were converted to the view.
 *
 * This way, adding and removing the highlight does not interfere with conversion.
 */
export function setupExceptionHighlighting( editor ) {
	const view = editor.editing.view;
	const model = editor.model;
	const highlightedMarkers = new Set();

	// Adding the class.
	view.document.registerPostFixer( writer => {
		const modelSelection = model.document.selection;

		const marker = getMarker( editor, modelSelection.anchor );

		if ( !marker ) {
			return;
		}

		for ( const viewElement of editor.editing.mapper.markerNameToElements( marker.name ) ) {
			writer.addClass( HIGHLIGHT_CLASS, viewElement );
			highlightedMarkers.add( viewElement );
		}
	} );

	// Removing the class.
	editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
		// Make sure the highlight is removed on every possible event, before conversion is started.
		dispatcher.on( 'insert', removeHighlight, { priority: 'highest' } );
		dispatcher.on( 'remove', removeHighlight, { priority: 'highest' } );
		dispatcher.on( 'attribute', removeHighlight, { priority: 'highest' } );
		dispatcher.on( 'selection', removeHighlight, { priority: 'highest' } );

		function removeHighlight() {
			view.change( writer => {
				for ( const item of highlightedMarkers.values() ) {
					writer.removeClass( HIGHLIGHT_CLASS, item );
					highlightedMarkers.delete( item );
				}
			} );
		}
	} );
}

function upcastHighlightToMarker( config ) {
	return dispatcher => dispatcher.on( 'element:span', ( evt, data, conversionApi ) => {
		const { writer } = conversionApi;

		const matcher = new Matcher( config.view );
		const matcherResult = matcher.match( data.viewItem );

		// If there is no match, this callback should not do anything.
		if ( !matcherResult ) {
			return;
		}

		const match = matcherResult.match;

		// Force consuming element's name (taken from upcast helpers elementToElement converter).
		match.name = true;

		const { modelRange: convertedChildrenRange } = conversionApi.convertChildren( data.viewItem, data.modelCursor );
		conversionApi.consumable.consume( data.viewItem, match );

		const markerName = config.model( data.viewItem );
		const fakeMarkerStart = writer.createElement( '$marker', { 'data-name': markerName } );
		const fakeMarkerEnd = writer.createElement( '$marker', { 'data-name': markerName } );

		// Insert in reverse order to use converter content positions directly (without recalculating).
		writer.insert( fakeMarkerEnd, convertedChildrenRange.end );
		writer.insert( fakeMarkerStart, convertedChildrenRange.start );

		data.modelRange = writer.createRange(
			writer.createPositionBefore( fakeMarkerStart ),
			writer.createPositionAfter( fakeMarkerEnd )
		);
		data.modelCursor = data.modelRange.end;
	} );
}
