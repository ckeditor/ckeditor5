/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingmodenavigationcommand
 */

import type { Model, Range } from 'ckeditor5/src/engine';
import { Command, type Editor } from 'ckeditor5/src/core';

/**
 * The command that allows navigation across the exceptions in the edited document.
 */
export default class RestrictedEditingModeNavigationCommand extends Command {
	/**
	 * The direction of the command.
	 */
	private _direction: RestrictedEditingModeNavigationDirection;

	/**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param direction The direction that the command works.
	 */
	constructor( editor: Editor, direction: RestrictedEditingModeNavigationDirection ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode and in restricted editing mode.
		this.affectsData = false;
		this._direction = direction;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	public override execute(): void {
		const position = getNearestExceptionRange( this.editor.model, this._direction );

		if ( !position ) {
			return;
		}

		this.editor.model.change( writer => {
			writer.setSelection( position );
		} );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */
	private _checkEnabled(): boolean {
		return !!getNearestExceptionRange( this.editor.model, this._direction );
	}
}

/**
 * Returns the range of the exception marker closest to the last position of the model selection.
 */
function getNearestExceptionRange( model: Model, direction: RestrictedEditingModeNavigationDirection ): Range | undefined {
	const selection = model.document.selection;
	const selectionPosition = selection.getFirstPosition()!;
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
		return;
	}

	// Get the marker closest to the selection position among many. To know that, we need to sort
	// them first.
	return markerRanges
		.sort( ( rangeA, rangeB ) => {
			if ( direction === 'forward' ) {
				return rangeA.start.isAfter( rangeB.start ) ? 1 : -1;
			} else {
				return rangeA.start.isBefore( rangeB.start ) ? 1 : -1;
			}
		} )
		.shift();
}

/**
 * Directions in which the
 * {@link module:restricted-editing/restrictededitingmodenavigationcommand~RestrictedEditingModeNavigationCommand} can work.
 */
export type RestrictedEditingModeNavigationDirection = 'forward' | 'backward';
