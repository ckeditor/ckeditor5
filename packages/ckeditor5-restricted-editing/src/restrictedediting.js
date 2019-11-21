/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictedediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Matcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import RestrictedEditingUI from './restrictededitingui';

import '../theme/restrictedediting.css';

const HIGHLIGHT_CLASS = 'ck-restricted-editing-exception_selected';

/**
 * @extends module:core/plugin~Plugin
 */
export default class RestrictedEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RestrictedEditing';
	}

	static get requires() {
		return [ RestrictedEditingUI ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		let createdMarkers = 0;

		editor.conversion.for( 'upcast' ).add( upcastHighlightToMarker( {
			view: {
				name: 'span',
				classes: 'ck-restricted-editing-exception'
			},
			model: () => {
				createdMarkers++;

				return `restricted-editing-exception:${ createdMarkers }`;
			}
		} ) );

		editor.conversion.for( 'downcast' ).markerToHighlight( {
			model: 'restricted-editing-exception',
			// Use callback to return new object every time new marker instance is created - otherwise it will be seen as the same marker.
			view: () => ( {
				name: 'span',
				classes: 'ck-restricted-editing-exception',
				priority: -10
			} )
		} );

		this._setupExceptionHighlighting();
	}

	_setupExceptionHighlighting() {
		const editor = this.editor;
		const view = editor.editing.view;
		const model = editor.model;
		const highlightedMarkers = new Set();

		// Adding the class.
		view.document.registerPostFixer( writer => {
			const modelSelection = model.document.selection;

			for ( const marker of model.markers.getMarkersAtPosition( modelSelection.anchor ) ) {
				for ( const viewElement of editor.editing.mapper.markerNameToElements( marker.name ) ) {
					writer.addClass( HIGHLIGHT_CLASS, viewElement );
					highlightedMarkers.add( viewElement );
				}
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
