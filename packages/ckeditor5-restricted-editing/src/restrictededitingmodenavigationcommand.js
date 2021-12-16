/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmodenavigationcommand
 */

import { Command } from 'ckeditor5/src/core';

/**
 * The command that allows navigation across the exceptions in the edited document.
 *
 * @extends module:core/command~Command
 */
export default class RestrictedEditingModeNavigationCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {String} direction The direction that the command works. Can be either `'forward'` or `'backward'`.
	 */
	constructor( editor, direction ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode and in restricted editing mode.
		this.affectsData = false;

		/**
		 * The direction of the command. Can be `'forward'` or `'backward'`.
		 *
		 * @readonly
		 * @private
		 * @member {String}
		 */
		this._direction = direction;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const position = getNearestExceptionRange( this.editor.model, this._direction );

		this.editor.model.change( writer => {
			writer.setSelection( position );
		} );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		return !!getNearestExceptionRange( this.editor.model, this._direction );
	}
}

// Returns the range of the exception marker closest to the last position of the
// model selection.
//
// @param {module:engine/model/model~Model} model
// @param {String} direction Either "forward" or "backward".
// @returns {module:engine/model/range~Range|null}
function getNearestExceptionRange( model, direction ) {
	const selection = model.document.selection;
	const selectionPosition = selection.getFirstPosition();
	const markerRanges = [];

	// Get all exception marker positions that start after/before the selection position.
	for ( const marker of model.markers.getMarkersGroup( 'restrictedEditingException' ) ) {
		const markerRange = marker.getRange();

		// Checking parent because there two positions <paragraph>foo^</paragraph><paragraph>^bar</paragraph>
		// are touching but they will represent different markers.
		const isMarkerRangeTouching =
			selectionPosition.isTouching( markerRange.start ) && selectionPosition.hasSameParentAs( markerRange.start ) ||
			selectionPosition.isTouching( markerRange.end ) && selectionPosition.hasSameParentAs( markerRange.end );

		// <paragraph>foo <marker≥b[]ar</marker> baz</paragraph>
		// <paragraph>foo <marker≥b[ar</marker> ba]z</paragraph>
		// <paragraph>foo <marker≥bar</marker>[] baz</paragraph>
		// <paragraph>foo []<marker≥bar</marker> baz</paragraph>
		if ( markerRange.containsPosition( selectionPosition ) || isMarkerRangeTouching ) {
			continue;
		}

		if ( direction === 'forward' && markerRange.start.isAfter( selectionPosition ) ) {
			markerRanges.push( markerRange );
		} else if ( direction === 'backward' && markerRange.end.isBefore( selectionPosition ) ) {
			markerRanges.push( markerRange );
		}
	}

	if ( !markerRanges.length ) {
		return null;
	}

	// Get the marker closest to the selection position among many. To know that, we need to sort
	// them first.
	return markerRanges.sort( ( rangeA, rangeB ) => {
		if ( direction === 'forward' ) {
			return rangeA.start.isAfter( rangeB.start ) ? 1 : -1;
		} else {
			return rangeA.start.isBefore( rangeB.start ) ? 1 : -1;
		}
	} ).shift();
}
