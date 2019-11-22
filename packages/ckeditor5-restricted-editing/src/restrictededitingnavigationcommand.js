/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingnavigationcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The command that allows navigation across the exceptions in the editor content.
 *
 * @extends module:core/command~Command
 */
export default class RestrictedEditingNavigationCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {String} direction Direction the command works. Can be either `'forward'` or `'backward'`.
	 */
	constructor( editor, direction ) {
		super( editor );

		/**
		 * A direction of the command. Can be `'forward'` or `'backward'`.
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
		const position = getNearestExceptionPosition( this.editor.model, this._direction );

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
		return !!getNearestExceptionPosition( this.editor.model, this._direction );
	}
}

// Returns the start position of the exception marker closest to the last position of the
// model selection.
//
// @param {module:engine/model/model~Model} model
// @param {String} direction Either "forward" or "backward".
// @returns {module:engine/model/position~Position|null}
function getNearestExceptionPosition( model, direction ) {
	const selection = model.document.selection;
	const selectionPosition = selection.getFirstPosition();
	const markerStartPositions = [];

	// Get all exception marker positions that start after/before the selection position.
	for ( const marker of model.markers.getMarkersGroup( 'restricted-editing-exception' ) ) {
		const markerRange = marker.getRange();
		const markerRangeStart = markerRange.start;
		const isMarkerRangeTouching = selectionPosition.isTouching( markerRange.start ) || selectionPosition.isTouching( markerRange.end );

		// <paragraph>foo <marker≥b[]ar</marker> baz</paragraph>
		// <paragraph>foo <marker≥b[ar</marker> ba]z</paragraph>
		// <paragraph>foo <marker≥bar</marker>[] baz</paragraph>
		// <paragraph>foo []<marker≥bar</marker> baz</paragraph>
		if ( markerRange.containsPosition( selectionPosition ) || isMarkerRangeTouching ) {
			continue;
		}

		if ( direction === 'forward' && markerRangeStart.isAfter( selectionPosition ) ) {
			markerStartPositions.push( markerRangeStart );
		} else if ( direction === 'backward' && markerRangeStart.isBefore( selectionPosition ) ) {
			markerStartPositions.push( markerRangeStart );
		}
	}

	if ( !markerStartPositions.length ) {
		return null;
	}

	// Get the marker closest to the selection position among many.
	return markerStartPositions.sort( ( posA, posB ) => {
		if ( direction === 'forward' ) {
			return posA.isAfter( posB ) ? 1 : -1;
		} else {
			return posA.isBefore( posB ) ? 1 : -1;
		}
	} ).shift();
}
