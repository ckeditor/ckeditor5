/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplaceediting
 */

import { Plugin } from 'ckeditor5/src/core';

const HIGHLIGHT_CLASS = 'find-result_selected';

function isPositionInRangeBoundaries( range, position ) {
	return range.containsPosition( position ) || range.end.isEqual( position ) || range.start.isEqual( position );
}

/**
 * Implements editing part for find and replace plugin. For example conversion, commands etc.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FindAndReplaceEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FindAndReplaceEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._defineConverters();
	}

	/**
	 * @private
	 */
	_defineConverters() {
		const { editor } = this;
		const { view } = editor.editing;
		const { model } = editor;
		const highlightedMarkers = new Set();

		const getMarkerAtPosition = position =>
			[ ...editor.model.markers ].find( marker => {
				return isPositionInRangeBoundaries( marker.getRange(), position ) && marker.name.startsWith( 'findResult:' );
			} );

		view.document.registerPostFixer( writer => {
			const modelSelection = model.document.selection;

			const marker = getMarkerAtPosition( modelSelection.focus );

			if ( !marker ) {
				return;
			}

			[ ...editor.editing.mapper.markerNameToElements( marker.name ) ].forEach( viewElement => {
				writer.addClass( HIGHLIGHT_CLASS, viewElement );
				highlightedMarkers.add( viewElement );
			} );
		} );

		function removeHighlight() {
			view.change( writer => {
				[ ...highlightedMarkers.values() ].forEach( item => {
					writer.removeClass( HIGHLIGHT_CLASS, item );
					highlightedMarkers.delete( item );
				} );
			} );
		}

		// Removing the class.
		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			// Make sure the highlight is removed on every possible event, before conversion is started.
			dispatcher.on( 'insert', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'remove', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'attribute', removeHighlight, { priority: 'highest' } );
			dispatcher.on( 'selection', removeHighlight, { priority: 'highest' } );
		} );
	}
}
