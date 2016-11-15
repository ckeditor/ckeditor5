/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CKEditorError from '../../utils/ckeditorerror.js';
import Range from './range.js';
import Position from './position.js';
import mix from '../../utils/mix.js';
import EmitterMixin from '../../utils/emittermixin.js';

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

		/**
		 * Specifies whether selection instance is fake.
		 *
		 * @private
		 * @member {Boolean} engine.view.Selection#_isFake
		 */
		this._isFake = false;

		/**
		 * Fake selection's label.
		 *
		 * @private
		 * @member {String} engine.view.Selection#_fakeSelectionLabel
		 */
		this._fakeSelectionLabel = '';
	}

	/**
	 * Sets this selection instance to be marked as `fake`. A fake selection does not render as browser native selection
	 * over selected elements and is hidden to the user. This way, no native selection UI artifacts are displayed to
	 * the user and selection over elements can be represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM (and be
	 * properly handled by screen readers).
	 *
	 * @fires engine.view.Selection#change
	 * @param {Boolean} [value=true] If set to true selection will be marked as `fake`.
	 * @param {Object} [options] Additional options.
	 * @param {String} [options.label=''] Fake selection label.
	 */
	setFake( value = true, options = {} ) {
		this._isFake = value;
		this._fakeSelectionLabel = value ? options.label || '' : '';

		this.fire( 'change' );
	}

	/**
	 * Returns true if selection instance is marked as `fake`.
	 *
	 * @see {@link engine.view.Selection#setFake}
	 * @returns {Boolean}
	 */
	get isFake() {
		return this._isFake;
	}

	/**
	 * Returns fake selection label.
	 *
	 * @see {@link engine.view.Selection#setFake}
	 * @returns {String}
	 */
	get fakeSelectionLabel() {
		return this._fakeSelectionLabel;
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
	 * {@link engine.view.EditableElement EditableElement} instance that contains this selection, or `null`
	 * if the selection is not inside an editable element.
	 *
	 * @type {engine.view.EditableElement|null}
	 */
	get editableElement() {
		if ( this.anchor ) {
			return this.anchor.editableElement;
		}

		return null;
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
		if ( !( range instanceof Range ) ) {
			throw new CKEditorError( 'view-selection-invalid-range: Invalid Range.' );
		}

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
	 * Checks whether, this selection is equal to given selection. Selections are equal if they have same directions,
	 * same number of ranges and all ranges from one selection equal to a range from other selection.
	 *
	 * @param {engine.view.Selection} otherSelection Selection to compare with.
	 * @returns {Boolean} `true` if selections are equal, `false` otherwise.
	 */
	isEqual( otherSelection ) {
		if ( this.isFake != otherSelection.isFake ) {
			return false;
		}

		if ( this.isFake && this.fakeSelectionLabel != otherSelection.fakeSelectionLabel ) {
			return false;
		}

		if ( this.rangeCount != otherSelection.rangeCount ) {
			return false;
		} else if ( this.rangeCount === 0 ) {
			return true;
		}

		if ( !this.anchor.isEqual( otherSelection.anchor ) || !this.focus.isEqual( otherSelection.focus ) ) {
			return false;
		}

		// Every range from this selection...
		return Array.from( this.getRanges() ).every( ( rangeA ) => {
			// ... has a range in other selection...
			return Array.from( otherSelection.getRanges() ).some( ( rangeB ) => {
				// ... which it is equal to.
				return rangeA.isEqual( rangeB );
			} );
		} );
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
			if ( !( range instanceof Range ) ) {
				throw new CKEditorError( 'view-selection-invalid-range: Invalid Range.' );
			}

			this._pushRange( range );
		}

		this._lastRangeBackward = !!isLastBackward;
		this.fire( 'change' );
	}

	/**
	 * Sets this selection's ranges and direction to the ranges and direction of the given selection.
	 *
	 * @param {engine.view.Selection} otherSelection
	 */
	setTo( otherSelection ) {
		this._isFake = otherSelection._isFake;
		this._fakeSelectionLabel = otherSelection._fakeSelectionLabel;

		this.setRanges( otherSelection.getRanges(), otherSelection.isBackward );
	}

	/**
	 * Sets collapsed selection in the specified location.
	 *
	 * The location can be specified in the same form as {@link engine.view.Position.createAt} parameters.
	 *
	 * @fires engine.view.Selection#change
	 * @param {engine.view.Item|engine.view.Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link engine.view.Item view item}.
	 */
	collapse( itemOrPosition, offset ) {
		const pos = Position.createAt( itemOrPosition, offset );
		const range = new Range( pos, pos );

		this.setRanges( [ range ] );
	}

	/**
	 * Collapses selection to the selection's {@link engine.view.Selection#getFirstPosition first position}.
	 * All ranges, besides the collapsed one, will be removed. Nothing will change if there are no ranges stored
	 * inside selection.
	 *
	 * @fires engine.view.Selection#change
	 */
	collapseToStart() {
		const startPosition = this.getFirstPosition();

		if ( startPosition !== null ) {
			this.setRanges( [ new Range( startPosition, startPosition ) ] );
		}
	}

	/**
	 * Collapses selection to the selection's {@link engine.view.Selection#getLastPosition last position}.
	 * All ranges, besides the collapsed one, will be removed. Nothing will change if there are no ranges stored
	 * inside selection.
	 *
	 * @fires engine.view.Selection#change
	 */
	collapseToEnd() {
		const endPosition = this.getLastPosition();

		if ( endPosition !== null ) {
			this.setRanges( [ new Range( endPosition, endPosition ) ] );
		}
	}

	/**
	 * Sets {@link engine.view.Selection#focus} to the specified location.
	 *
	 * The location can be specified in the same form as {@link engine.view.Position.createAt} parameters.
	 *
	 * @fires engine.view.Selection#change:range
	 * @param {engine.view.Item|engine.view.Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link engine.view.Item view item}.
	 */
	setFocus( itemOrPosition, offset ) {
		if ( this.anchor === null ) {
			/**
			 * Cannot set selection focus if there are no ranges in selection.
			 *
			 * @error view-selection-setFocus-no-ranges
			 */
			throw new CKEditorError( 'view-selection-setFocus-no-ranges: Cannot set selection focus if there are no ranges in selection.' );
		}

		const newFocus = Position.createAt( itemOrPosition, offset );

		if ( newFocus.compareWith( this.focus ) == 'same' ) {
			return;
		}

		const anchor = this.anchor;

		this._ranges.pop();

		if ( newFocus.compareWith( anchor ) == 'before' ) {
			this.addRange( new Range( newFocus, anchor ), true );
		} else {
			this.addRange( new Range( anchor, newFocus ) );
		}
	}

	/**
	 * Creates and returns an instance of `Selection` that is a clone of given selection, meaning that it has same
	 * ranges and same direction as this selection.
	 *
	 * @params {engine.view.Selection} otherSelection Selection to be cloned.
	 * @returns {engine.view.Selection} `Selection` instance that is a clone of given selection.
	 */
	static createFromSelection( otherSelection ) {
		const selection = new Selection();
		selection.setTo( otherSelection );

		return selection;
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
				 * @error selection-range-intersects
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
