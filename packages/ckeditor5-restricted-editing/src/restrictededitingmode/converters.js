/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmode/converters
 */

import Matcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import { getMarkerAtPosition } from './utils';

const HIGHLIGHT_CLASS = 'restricted-editing-exception_selected';

/**
 * Adds a visual highlight style to a restricted editing exception that the selection is anchored to.
 *
 * The highlight is turned on by adding the `.restricted-editing-exception_selected` class to the
 * exception in the view:
 *
 * * The class is removed before the conversion starts, as callbacks added with the `'highest'` priority
 * to {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} events.
 * * The class is added in the view post-fixer, after other changes in the model tree are converted to the view.
 *
 * This way, adding and removing the highlight does not interfere with conversion.
 *
 * @param {module:core/editor/editor~Editor} editor
 */
export function setupExceptionHighlighting( editor ) {
	const view = editor.editing.view;
	const model = editor.model;
	const highlightedMarkers = new Set();

	// Adding the class.
	view.document.registerPostFixer( writer => {
		const modelSelection = model.document.selection;

		const marker = getMarkerAtPosition( editor, modelSelection.anchor );

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

/**
 * A post-fixer that prevents removing a collapsed marker from the document.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Function}
 */
export function resurrectCollapsedMarkerPostFixer( editor ) {
	// This post-fixer shouldn't be necessary after https://github.com/ckeditor/ckeditor5/issues/5778.
	return writer => {
		let changeApplied = false;

		for ( const [ name, data ] of editor.model.document.differ._changedMarkers ) {
			if ( name.startsWith( 'restrictedEditingException' ) && data.newRange.root.rootName == '$graveyard' ) {
				writer.updateMarker( name, {
					range: writer.createRange( writer.createPositionAt( editor.model.document.selection.focus ) )
				} );

				changeApplied = true;
			}
		}

		return changeApplied;
	};
}

/**
 * A post-fixer that extends a marker when the user types on its boundaries.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Function}
 */
export function extendMarkerOnTypingPostFixer( editor ) {
	// This post-fixer shouldn't be necessary after https://github.com/ckeditor/ckeditor5/issues/5778.
	return writer => {
		let changeApplied = false;

		for ( const change of editor.model.document.differ.getChanges() ) {
			if ( change.type == 'insert' && change.name == '$text' ) {
				changeApplied = _tryExtendMarkerStart( editor, change.position, change.length, writer ) || changeApplied;
				changeApplied = _tryExtendMarkedEnd( editor, change.position, change.length, writer ) || changeApplied;
			}
		}

		return false;
	};
}

/**
 * A view highlight-to-marker conversion helper.
 *
 * @param {Object} config Conversion configuration.
 * @param {module:engine/view/matcher~MatcherPattern} [config.view] A pattern matching all view elements which should be converted. If not
 * set, the converter will fire for every view element.
 * @param {String|module:engine/model/element~Element|Function} config.model The name of the model element, a model element
 * instance or a function that takes a view element and returns a model element. The model element will be inserted in the model.
 * @param {module:utils/priorities~PriorityString} [config.converterPriority='normal'] Converter priority.
 */
export function upcastHighlightToMarker( config ) {
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

// Extend marker if change detected on marker's start position.
function _tryExtendMarkerStart( editor, position, length, writer ) {
	const markerAtStart = getMarkerAtPosition( editor, position.getShiftedBy( length ) );

	if ( markerAtStart && markerAtStart.getStart().isEqual( position.getShiftedBy( length ) ) ) {
		writer.updateMarker( markerAtStart, {
			range: writer.createRange( markerAtStart.getStart().getShiftedBy( -length ), markerAtStart.getEnd() )
		} );

		return true;
	}

	return false;
}

// Extend marker if change detected on marker's end position.
function _tryExtendMarkedEnd( editor, position, length, writer ) {
	const markerAtEnd = getMarkerAtPosition( editor, position );

	if ( markerAtEnd && markerAtEnd.getEnd().isEqual( position ) ) {
		writer.updateMarker( markerAtEnd, {
			range: writer.createRange( markerAtEnd.getStart(), markerAtEnd.getEnd().getShiftedBy( length ) )
		} );

		return true;
	}

	return false;
}
