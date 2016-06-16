/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../../utils/ckeditorerror.js';
import Range from './range.js';
import Position from './position.js';
import mix from '../../utils/mix.js';
import EmitterMixin from '../../utils/emittermixin.js';
import EditableElement from './editableelement.js';

/**
 * Class representing selection in tree view.
 *
 * Selection can consist of {@link engine.view.Range ranges} that can be added using
 * {@link engine.view.Selection#addRange addRange} and {@link engine.view.Selection#setRanges setRanges} methods.
 * Both methods create copies of provided ranges and store those copies internally. Further modifications to passed
 * ranges will not change selection's state.
 * Selection's ranges can be obtained via {@link engine.view.Selection#getRanges getRanges},
 * {@link engine.view.Selection#getFirstRange getFirstRange} and {@link engine.view.Selection#getLastRange getLastRange}
 * methods, which return copies of ranges stored inside selection. Modifications made on these copies will not change
 * selection's state. Similar situation occurs when getting {@link engine.view.Selection#anchor anchor},
 * {@link engine.view.Selection#focus focus}, {@link engine.view.Selection#getFirstPosition first} and
 * {@link engine.view.Selection#getLastPosition last} positions - all will return copies of requested positions.
 *
 * @memberOf engine.view
 */
export default class Selection {
	/**
	 * Creates new selection instance.
	 */
	constructor() {
		/**
		 * Stores all ranges that are selected.
		 *
		 * @protected
		 * @member {Array.<engine.view.Range>} engine.view.Selection#_ranges
		 */
		this._ranges = [];

		/**
		 * Specifies whether the last added range was added as a backward or forward range.
		 *
		 * @protected
		 * @member {Boolean} engine.view.Selection#_lastRangeBackward
		 */
		this._lastRangeBackward = false;
	}

	/**
	 * Selection anchor. Anchor may be described as a position where the selection starts. Together with
	 * {@link engine.view.Selection#focus focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. Anchor is always the start or end of the most recent added range.
	 * It may be a bit unintuitive when there are multiple ranges in selection.
	 *
	 * @see engine.view.Selection#focus
	 * @type {engine.view.Position}
	 */
	get anchor() {
		if ( !this._ranges.length ) {
			return null;
		}
		const range = this._ranges[ this._ranges.length - 1 ];
		const anchor = this._lastRangeBackward ? range.end : range.start;

		return Position.createFromPosition( anchor );
	}

	/**
	 * Selection focus. Focus is a position where the selection ends.
	 *
	 * @see engine.view.Selection#anchor
	 * @type {engine.view.Position}
	 */
	get focus() {
		if ( !this._ranges.length ) {
			return null;
		}
		const range = this._ranges[ this._ranges.length - 1 ];
		const focus = this._lastRangeBackward ? range.start : range.end;

		return Position.createFromPosition( focus );
	}

	/**
	 * Returns whether the selection is collapsed. Selection is collapsed when there is exactly one range which is
	 * collapsed.
	 *
	 * @type {Boolean}
	 */
	get isCollapsed() {
		return this.rangeCount === 1 && this._ranges[ 0 ].isCollapsed;
	}

	/**
	 * Returns number of ranges in selection.
	 *
	 * @type {Number}
     */
	get rangeCount() {
		return this._ranges.length;
	}

	/**
	 * Specifies whether the {@link engine.view.Selection#focus} precedes {@link engine.view.Selection#anchor}.
	 *
	 * @type {Boolean}
	 */
	get isBackward() {
		return !this.isCollapsed && this._lastRangeBackward;
	}

	/**
	 * Adds a range to the selection. Added range is copied. This means that passed range is not saved in the
	 * selection instance and you can safely operate on it.
	 *
	 * Accepts a flag describing in which way the selection is made - passed range might be selected from
	 * {@link engine.view.Range#start start} to {@link engine.view.Range#end end}
	 * or from {@link engine.view.Range#end end} to {@link engine.view.Range#start start}.
	 * The flag is used to set {@link engine.view.Selection#anchor anchor} and
	 * {@link engine.view.Selection#focus focus} properties.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `view-selection-range-intersects` if added range intersects
	 * with ranges already stored in Selection instance.
	 *
	 * @fires engine.view.Selection#change
	 * @param {engine.view.Range} range
	 */
	addRange( range, isBackward ) {
		this._pushRange( range );
		this._lastRangeBackward = !!isBackward;
		this.fire( 'change' );
	}

	/**
	 * Returns an iterator that contains copies of all ranges added to the selection.
	 *
	 * @returns {Iterator.<engine.view.Range>}
	 */
	*getRanges() {
		for ( let range of this._ranges ) {
			yield Range.createFromRange( range );
		}
	}

	/**
	 * Returns copy of the first range in the selection. First range is the one which
	 * {@link engine.view.Range#start start} position {@link engine.view.Position#isBefore is before} start
	 * position of all other ranges (not to confuse with the first range added to the selection).
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {engine.view.Range|null}
	 */
	getFirstRange() {
		let first = null;

		for ( let range of this._ranges ) {
			if ( !first || range.start.isBefore( first.start ) ) {
				first = range;
			}
		}

		return first ? Range.createFromRange( first ) : null;
	}

	/**
	 * Returns copy of the last range in the selection. Last range is the one which {@link engine.view.Range#end end}
	 * position {@link engine.view.Position#isAfter is after} end position of all other ranges (not to confuse
	 * with the last range added to the selection). Returns `null` if no ranges are added to selection.
	 *
	 * @returns {engine.view.Range|null}
	 */
	getLastRange() {
		let last = null;

		for ( let range of this._ranges ) {
			if ( !last || range.end.isAfter( last.end ) ) {
				last = range;
			}
		}

		return last ? Range.createFromRange( last ) : null;
	}

	/**
	 * Returns copy of the first position in the selection. First position is the position that
	 * {@link engine.view.Position#isBefore is before} any other position in the selection ranges.
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {engine.view.Position|null}
	 */
	getFirstPosition() {
		const firstRange = this.getFirstRange();

		return firstRange ? Position.createFromPosition( firstRange.start ) : null;
	}

	/**
	 * Returns copy of the last position in the selection. Last position is the position that
	 * {@link engine.view.Position#isAfter is after} any other position in the selection ranges.
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {engine.view.Position|null}
	 */
	getLastPosition() {
		const lastRange = this.getLastRange();

		return lastRange ? Position.createFromPosition( lastRange.end ) : null;
	}

	/**
	 * Two selections equal if they have the same ranges and directions.
	 *
	 * @param {engine.view.Selection} otherSelection Selection to compare with.
	 * @returns {Boolean} True if selections equal.
	 */
	isEqual( otherSelection ) {
		const rangeCount = this.rangeCount;

		if ( rangeCount != otherSelection.rangeCount ) {
			return false;
		}

		for ( let i = 0; i < this.rangeCount; i++ ) {
			if ( !this._ranges[ i ].isEqual( otherSelection._ranges[ i ] ) ) {
				return false;
			}
		}

		return this._lastRangeBackward === otherSelection._lastRangeBackward;
	}

	/**
	 * Removes all ranges that were added to the selection.
	 *
	 * @fires engine.view.Selection#change
	 */
	removeAllRanges() {
		if ( this._ranges.length ) {
			this._ranges = [];
			this.fire( 'change' );
		}
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link engine.view.Selection#anchor anchor} and
	 * {@link engine.view.Selection#focus focus}. Accepts a flag describing in which way the selection is made
	 * (see {@link engine.view.Selection#addRange addRange}).
	 *
	 * @fires engine.view.Selection#change
	 * @param {Array.<engine.view.Range>} newRanges Array of ranges to set.
	 * @param {Boolean} [isLastBackward] Flag describing if last added range was selected forward - from start to end
	 * (`false`) or backward - from end to start (`true`). Defaults to `false`.
	 */
	setRanges( newRanges, isLastBackward ) {
		this._ranges = [];

		for ( let range of newRanges ) {
			this._pushRange( range );
		}

		this._lastRangeBackward = !!isLastBackward;
		this.fire( 'change' );
	}

	/**
	 * Set this selection's ranges and direction to the ranges and direction of the given selection.
	 *
	 * @param {engine.view.Selection} otherSelection Other selection.
	 */
	setTo( otherSelection ) {
		this.removeAllRanges();

		for ( let range of otherSelection.getRanges() ) {
			this._pushRange( range );
		}

		this._lastRangeBackward = otherSelection._lastRangeBackward;
	}

	/**
	 * Collapses selection to the {@link engine.view.Selection#getFirstPosition first position} in stored ranges.
	 * All ranges will be removed beside one collapsed range. Nothing will be changed if there are no ranges stored
	 * inside selection.
	 *
	 * @fires engine.view.Selection#change
	 */
	collapseToStart() {
		const startPosition = this.getFirstPosition();

		if ( startPosition !== null ) {
			this.setRanges( [ new Range( startPosition, startPosition ) ] );
			this.fire( 'change' );
		}
	}

	/**
	 * Collapses selection to the {@link engine.view.Selection#getLastPosition last position} in stored ranges.
	 * All ranges will be removed beside one collapsed range. Nothing will be changed if there are no ranges stored
	 * inside selection.
	 *
	 * @fires engine.view.Selection#change
	 */
	collapseToEnd() {
		const endPosition = this.getLastPosition();

		if ( endPosition !== null ) {
			this.setRanges( [ new Range( endPosition, endPosition ) ] );
			this.fire( 'change' );
		}
	}

	/**
	 * Returns {@link engine.view.EditableElement EditableElement} instance that contains this selection.
	 *
	 * @returns {engine.view.EditableElement|null} Returns closest EditableElement or null if none is found.
	 */
	getEditableElement() {
		if ( this.rangeCount ) {
			let editable = this.getFirstPosition().parent;

			while ( !( editable instanceof EditableElement ) ) {
				if ( editable.parent ) {
					editable = editable.parent;
				} else {
					return null;
				}
			}

			return editable;
		}

		return null;
	}

	/**
	 * Adds range to selection - creates copy of given range so it can be safely used and modified.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `view-selection-range-intersects` if added range intersects
	 * with ranges already stored in selection instance.
	 *
	 * @private
	 * @param {engine.view.Range} range
	 */
	_pushRange( range ) {
		for ( let storedRange of this._ranges ) {
			if ( range.isIntersecting( storedRange ) ) {
				/**
				 * Trying to add a range that intersects with another range from selection.
				 *
				 * @error view-selection-range-intersects
				 * @param {engine.view.Range} addedRange Range that was added to the selection.
				 * @param {engine.view.Range} intersectingRange Range from selection that intersects with `addedRange`.
				 */
				throw new CKEditorError(
					'view-selection-range-intersects: Trying to add a range that intersects with another range from selection.',
					{ addedRange: range, intersectingRange: storedRange }
				);
			}
		}

		this._ranges.push( Range.createFromRange( range ) );
	}
}

mix( Selection, EmitterMixin );

/**
 * Fired whenever selection ranges are changed through {@link engine.view.Selection Selection API}.
 *
 * @event engine.view.Selection#change
 */
