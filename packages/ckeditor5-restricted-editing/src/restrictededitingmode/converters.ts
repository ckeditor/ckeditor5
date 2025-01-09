/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module restricted-editing/restrictededitingmode/converters
 */

import type { Editor } from 'ckeditor5/src/core.js';
import {
	Matcher,
	type DowncastWriter,
	type MatcherPattern,
	type ModelPostFixer,
	type Position,
	type UpcastDispatcher,
	type Writer,
	type ViewElement
} from 'ckeditor5/src/engine.js';

import { getMarkerAtPosition } from './utils.js';

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
 */
export function setupExceptionHighlighting( editor: Editor ): void {
	const view = editor.editing.view;
	const model = editor.model;
	const highlightedMarkers = new Set<ViewElement>();

	// Adding the class.
	view.document.registerPostFixer( ( writer: DowncastWriter ): boolean => {
		const modelSelection = model.document.selection;

		const marker = getMarkerAtPosition( editor, modelSelection.anchor! );

		if ( !marker ) {
			return false;
		}

		for ( const viewElement of editor.editing.mapper.markerNameToElements( marker.name )! ) {
			writer.addClass( HIGHLIGHT_CLASS, viewElement );
			highlightedMarkers.add( viewElement );
		}

		return false;
	} );

	// Removing the class.
	editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
		// Make sure the highlight is removed on every possible event, before conversion is started.
		dispatcher.on( 'insert', removeHighlight, { priority: 'highest' } );
		dispatcher.on( 'remove', removeHighlight, { priority: 'highest' } );
		dispatcher.on( 'attribute', removeHighlight, { priority: 'highest' } );
		dispatcher.on( 'cleanSelection', removeHighlight );

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
 */
export function resurrectCollapsedMarkerPostFixer( editor: Editor ): ModelPostFixer {
	// This post-fixer shouldn't be necessary after https://github.com/ckeditor/ckeditor5/issues/5778.
	return writer => {
		let changeApplied = false;

		for ( const { name, data } of editor.model.document.differ.getChangedMarkers() ) {
			if ( name.startsWith( 'restrictedEditingException' ) && data.newRange && data.newRange.root.rootName == '$graveyard' ) {
				writer.updateMarker( name, {
					range: writer.createRange( writer.createPositionAt( data.oldRange!.start ) )
				} );

				changeApplied = true;
			}
		}

		return changeApplied;
	};
}

/**
 * A post-fixer that extends a marker when the user types on its boundaries.
 */
export function extendMarkerOnTypingPostFixer( editor: Editor ): ModelPostFixer {
	// This post-fixer shouldn't be necessary after https://github.com/ckeditor/ckeditor5/issues/5778.
	return writer => {
		let changeApplied = false;
		const schema = editor.model.schema;

		for ( const change of editor.model.document.differ.getChanges() ) {
			if ( change.type == 'insert' && schema.checkChild( '$block', change.name ) ) {
				changeApplied = _tryExtendMarkerStart( editor, change.position, change.length, writer ) || changeApplied;
				changeApplied = _tryExtendMarkedEnd( editor, change.position, change.length, writer ) || changeApplied;
			}
		}

		return changeApplied;
	};
}

/**
 * A view highlight-to-marker conversion helper.
 *
 * @param config Conversion configuration.
 */
export function upcastHighlightToMarker( config: { view: MatcherPattern; model: () => string } ) {
	return ( dispatcher: UpcastDispatcher ): void => dispatcher.on( 'element:span', ( evt, data, conversionApi ) => {
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

		const markerName = config.model();
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

/**
 * Extend marker if change detected on marker's start position.
 */
function _tryExtendMarkerStart( editor: Editor, position: Position, length: number, writer: Writer ): boolean {
	const markerAtStart = getMarkerAtPosition( editor, position.getShiftedBy( length ) );

	if ( markerAtStart && markerAtStart.getStart().isEqual( position.getShiftedBy( length ) ) ) {
		writer.updateMarker( markerAtStart, {
			range: writer.createRange( markerAtStart.getStart().getShiftedBy( -length ), markerAtStart.getEnd() )
		} );

		return true;
	}

	return false;
}

/**
 * Extend marker if change detected on marker's end position.
 */
function _tryExtendMarkedEnd( editor: Editor, position: Position, length: number, writer: Writer ): boolean {
	const markerAtEnd = getMarkerAtPosition( editor, position );

	if ( markerAtEnd && markerAtEnd.getEnd().isEqual( position ) ) {
		writer.updateMarker( markerAtEnd, {
			range: writer.createRange( markerAtEnd.getStart(), markerAtEnd.getEnd().getShiftedBy( length ) )
		} );

		return true;
	}

	return false;
}
