/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/selection
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Range from './range';
import Position from './position';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import Element from './element';
import count from '@ckeditor/ckeditor5-utils/src/count';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';

/**
 * Class representing selection in tree view.
 *
 * Selection can consist of {@link module:engine/view/range~Range ranges} that can be added using
 * {@link module:engine/view/selection~Selection#addRange addRange}
 * and {@link module:engine/view/selection~Selection#setRanges setRanges} methods.
 * Both methods create copies of provided ranges and store those copies internally. Further modifications to passed
 * ranges will not change selection's state.
 * Selection's ranges can be obtained via {@link module:engine/view/selection~Selection#getRanges getRanges},
 * {@link module:engine/view/selection~Selection#getFirstRange getFirstRange}
 * and {@link module:engine/view/selection~Selection#getLastRange getLastRange}
 * methods, which return copies of ranges stored inside selection. Modifications made on these copies will not change
 * selection's state. Similar situation occurs when getting {@link module:engine/view/selection~Selection#anchor anchor},
 * {@link module:engine/view/selection~Selection#focus focus}, {@link module:engine/view/selection~Selection#getFirstPosition first} and
 * {@link module:engine/view/selection~Selection#getLastPosition last} positions - all will return copies of requested positions.
 */
export default class Selection {
	/**
	 * Creates new selection instance.
	 *
	 * @param {Iterable.<module:engine/view/range~Range>} [ranges] An optional array of ranges to set.
	 * @param {Boolean} [isLastBackward] An optional flag describing if last added range was selected forward - from start to end
	 * (`false`) or backward - from end to start (`true`). Defaults to `false`.
	 */
	constructor( ranges, isLastBackward ) {
		/**
		 * Stores all ranges that are selected.
		 *
		 * @protected
		 * @member {Array.<module:engine/view/range~Range>}
		 */
		this._ranges = [];

		/**
		 * Specifies whether the last added range was added as a backward or forward range.
		 *
		 * @protected
		 * @member {Boolean}
		 */
		this._lastRangeBackward = false;

		/**
		 * Specifies whether selection instance is fake.
		 *
		 * @private
		 * @member {Boolean}
		 */
		this._isFake = false;

		/**
		 * Fake selection's label.
		 *
		 * @private
		 * @member {String}
		 */
		this._fakeSelectionLabel = '';

		if ( ranges ) {
			this.setRanges( ranges, isLastBackward );
		}
	}

	/**
	 * Sets this selection instance to be marked as `fake`. A fake selection does not render as browser native selection
	 * over selected elements and is hidden to the user. This way, no native selection UI artifacts are displayed to
	 * the user and selection over elements can be represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM (and be
	 * properly handled by screen readers).
	 *
	 * @fires change
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
	 * @see #setFake
	 * @returns {Boolean}
	 */
	get isFake() {
		return this._isFake;
	}

	/**
	 * Returns fake selection label.
	 *
	 * @see #setFake
	 * @returns {String}
	 */
	get fakeSelectionLabel() {
		return this._fakeSelectionLabel;
	}

	/**
	 * Selection anchor. Anchor may be described as a position where the selection starts. Together with
	 * {@link #focus focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. Anchor is always the start or end of the most recent added range.
	 * It may be a bit unintuitive when there are multiple ranges in selection.
	 *
	 * @see #focus
	 * @type {module:engine/view/position~Position}
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
	 * @see #anchor
	 * @type {module:engine/view/position~Position}
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
	 * Specifies whether the {@link #focus} precedes {@link #anchor}.
	 *
	 * @type {Boolean}
	 */
	get isBackward() {
		return !this.isCollapsed && this._lastRangeBackward;
	}

	/**
	 * {@link module:engine/view/editableelement~EditableElement EditableElement} instance that contains this selection, or `null`
	 * if the selection is not inside an editable element.
	 *
	 * @type {module:engine/view/editableelement~EditableElement|null}
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
	 * {@link module:engine/view/range~Range#start start} to {@link module:engine/view/range~Range#end end}
	 * or from {@link module:engine/view/range~Range#end end} to {@link module:engine/view/range~Range#start start}.
	 * The flag is used to set {@link #anchor anchor} and {@link #focus focus} properties.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-selection-range-intersects` if added range intersects
	 * with ranges already stored in Selection instance.
	 *
	 * @fires change
	 * @param {module:engine/view/range~Range} range
	 * @param {Boolean} isBackward
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
	 * @returns {Iterator.<module:engine/view/range~Range>}
	 */
	* getRanges() {
		for ( const range of this._ranges ) {
			yield Range.createFromRange( range );
		}
	}

	/**
	 * Returns copy of the first range in the selection. First range is the one which
	 * {@link module:engine/view/range~Range#start start} position {@link module:engine/view/position~Position#isBefore is before} start
	 * position of all other ranges (not to confuse with the first range added to the selection).
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {module:engine/view/range~Range|null}
	 */
	getFirstRange() {
		let first = null;

		for ( const range of this._ranges ) {
			if ( !first || range.start.isBefore( first.start ) ) {
				first = range;
			}
		}

		return first ? Range.createFromRange( first ) : null;
	}

	/**
	 * Returns copy of the last range in the selection. Last range is the one which {@link module:engine/view/range~Range#end end}
	 * position {@link module:engine/view/position~Position#isAfter is after} end position of all other ranges (not to confuse
	 * with the last range added to the selection). Returns `null` if no ranges are added to selection.
	 *
	 * @returns {module:engine/view/range~Range|null}
	 */
	getLastRange() {
		let last = null;

		for ( const range of this._ranges ) {
			if ( !last || range.end.isAfter( last.end ) ) {
				last = range;
			}
		}

		return last ? Range.createFromRange( last ) : null;
	}

	/**
	 * Returns copy of the first position in the selection. First position is the position that
	 * {@link module:engine/view/position~Position#isBefore is before} any other position in the selection ranges.
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {module:engine/view/position~Position|null}
	 */
	getFirstPosition() {
		const firstRange = this.getFirstRange();

		return firstRange ? Position.createFromPosition( firstRange.start ) : null;
	}

	/**
	 * Returns copy of the last position in the selection. Last position is the position that
	 * {@link module:engine/view/position~Position#isAfter is after} any other position in the selection ranges.
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {module:engine/view/position~Position|null}
	 */
	getLastPosition() {
		const lastRange = this.getLastRange();

		return lastRange ? Position.createFromPosition( lastRange.end ) : null;
	}

	/**
	 * Checks whether, this selection is equal to given selection. Selections are equal if they have same directions,
	 * same number of ranges and all ranges from one selection equal to a range from other selection.
	 *
	 * @param {module:engine/view/selection~Selection} otherSelection Selection to compare with.
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

		for ( const thisRange of this._ranges ) {
			let found = false;

			for ( const otherRange of otherSelection._ranges ) {
				if ( thisRange.isEqual( otherRange ) ) {
					found = true;
					break;
				}
			}

			if ( !found ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Checks whether this selection is similar to given selection. Selections are similar if they have same directions, same
	 * number of ranges, and all {@link module:engine/view/range~Range#getTrimmed trimmed} ranges from one selection are
	 * equal to any trimmed range from other selection.
	 *
	 * @param {module:engine/view/selection~Selection} otherSelection Selection to compare with.
	 * @returns {Boolean} `true` if selections are similar, `false` otherwise.
	 */
	isSimilar( otherSelection ) {
		if ( this.isBackward != otherSelection.isBackward ) {
			return false;
		}

		const numOfRangesA = count( this.getRanges() );
		const numOfRangesB = count( otherSelection.getRanges() );

		// If selections have different number of ranges, they cannot be similar.
		if ( numOfRangesA != numOfRangesB ) {
			return false;
		}

		// If both selections have no ranges, they are similar.
		if ( numOfRangesA == 0 ) {
			return true;
		}

		// Check if each range in one selection has a similar range in other selection.
		for ( let rangeA of this.getRanges() ) {
			rangeA = rangeA.getTrimmed();

			let found = false;

			for ( let rangeB of otherSelection.getRanges() ) {
				rangeB = rangeB.getTrimmed();

				if ( rangeA.start.isEqual( rangeB.start ) && rangeA.end.isEqual( rangeB.end ) ) {
					found = true;
					break;
				}
			}

			// For `rangeA`, neither range in `otherSelection` was similar. So selections are not similar.
			if ( !found ) {
				return false;
			}
		}

		// There were no ranges that weren't matched. Selections are similar.
		return true;
	}

	/**
	 * Removes all ranges that were added to the selection.
	 *
	 * @fires change
	 */
	removeAllRanges() {
		if ( this._ranges.length ) {
			this._ranges = [];
			this.fire( 'change' );
		}
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link #anchor anchor} and {@link #focus focus}.
	 * Accepts a flag describing in which way the selection is made (see {@link #addRange addRange}).
	 *
	 * @fires change
	 * @param {Iterable.<module:engine/view/range~Range>} newRanges Iterable object of ranges to set.
	 * @param {Boolean} [isLastBackward] Flag describing if last added range was selected forward - from start to end
	 * (`false`) or backward - from end to start (`true`). Defaults to `false`.
	 */
	setRanges( newRanges, isLastBackward ) {
		this._ranges = [];

		for ( const range of newRanges ) {
			if ( !( range instanceof Range ) ) {
				throw new CKEditorError( 'view-selection-invalid-range: Invalid Range.' );
			}

			this._pushRange( range );
		}

		this._lastRangeBackward = !!isLastBackward;
		this.fire( 'change' );
	}

	/**
	 * Sets this selection's ranges and direction to the specified location based on the given
	 * {@link module:engine/view/selection~Selection selection}, {@link module:engine/view/position~Position position},
	 * {@link module:engine/view/range~Range range} or an iterable of {@link module:engine/view/range~Range ranges}.
	 *
	 * @param {module:engine/view/selection~Selection|module:engine/view/position~Position|
	 * Iterable.<module:engine/view/range~Range>|module:engine/view/range~Range} selectable
	 */
	setTo( selectable ) {
		if ( selectable instanceof Selection ) {
			this._isFake = selectable._isFake;
			this._fakeSelectionLabel = selectable._fakeSelectionLabel;
			this.setRanges( selectable.getRanges(), selectable.isBackward );
		} else if ( selectable instanceof Range ) {
			this.setRanges( [ selectable ] );
		} else if ( isIterable( selectable ) ) {
			// We assume that the selectable is an iterable of ranges.
			this.setRanges( selectable );
		} else {
			// We assume that the selectable is a position.
			this.setRanges( [ new Range( selectable ) ] );
		}
	}

	/**
	 * Sets this selection in the provided element.
	 *
	 * @param {module:engine/view/element~Element} element
	 */
	setIn( element ) {
		this.setRanges( [ Range.createIn( element ) ] );
	}

	/**
	 * Sets this selection on the provided item.
	 *
	 * @param {module:engine/view/item~Item} item
	 */
	setOn( item ) {
		this.setRanges( [ Range.createOn( item ) ] );
	}

	/**
	 * Sets collapsed selection at the specified location.
	 *
	 * The location can be specified in the same form as {@link module:engine/view/position~Position.createAt} parameters.
	 *
	 * @fires change
	 * @param {module:engine/view/item~Item|module:engine/view/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	setCollapsedAt( itemOrPosition, offset ) {
		const pos = Position.createAt( itemOrPosition, offset );
		const range = new Range( pos, pos );

		this.setRanges( [ range ] );
	}

	/**
	 * Collapses selection to the selection's {@link #getFirstPosition first position}.
	 * All ranges, besides the collapsed one, will be removed. Nothing will change if there are no ranges stored
	 * inside selection.
	 *
	 * @fires change
	 */
	collapseToStart() {
		const startPosition = this.getFirstPosition();

		if ( startPosition !== null ) {
			this.setRanges( [ new Range( startPosition, startPosition ) ] );
		}
	}

	/**
	 * Collapses selection to the selection's {@link #getLastPosition last position}.
	 * All ranges, besides the collapsed one, will be removed. Nothing will change if there are no ranges stored
	 * inside selection.
	 *
	 * @fires change
	 */
	collapseToEnd() {
		const endPosition = this.getLastPosition();

		if ( endPosition !== null ) {
			this.setRanges( [ new Range( endPosition, endPosition ) ] );
		}
	}

	/**
	 * Moves {@link #focus} to the specified location.
	 *
	 * The location can be specified in the same form as {@link module:engine/view/position~Position.createAt} parameters.
	 *
	 * @fires change
	 * @param {module:engine/view/item~Item|module:engine/view/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	moveFocusTo( itemOrPosition, offset ) {
		if ( this.anchor === null ) {
			/**
			 * Cannot set selection focus if there are no ranges in selection.
			 *
			 * @error view-selection-moveFocusTo-no-ranges
			 */
			throw new CKEditorError(
				'view-selection-moveFocusTo-no-ranges: Cannot set selection focus if there are no ranges in selection.'
			);
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
	 * Returns the selected element. {@link module:engine/view/element~Element Element} is considered as selected if there is only
	 * one range in the selection, and that range contains exactly one element.
	 * Returns `null` if there is no selected element.
	 *
	 * @returns {module:engine/view/element~Element|null}
	 */
	getSelectedElement() {
		if ( this.rangeCount !== 1 ) {
			return null;
		}

		const range = this.getFirstRange();
		const nodeAfterStart = range.start.nodeAfter;
		const nodeBeforeEnd = range.end.nodeBefore;

		return ( nodeAfterStart instanceof Element && nodeAfterStart == nodeBeforeEnd ) ? nodeAfterStart : null;
	}

	/**
	 * Creates and returns an instance of `Selection` that is a clone of given selection, meaning that it has same
	 * ranges and same direction as this selection.
	 *
	 * @params {module:engine/view/selection~Selection} otherSelection Selection to be cloned.
	 * @returns {module:engine/view/selection~Selection} `Selection` instance that is a clone of given selection.
	 */
	static createFromSelection( otherSelection ) {
		const selection = new Selection();
		selection.setTo( otherSelection );

		return selection;
	}

	/**
	 * Adds range to selection - creates copy of given range so it can be safely used and modified.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-selection-range-intersects` if added range intersects
	 * with ranges already stored in selection instance.
	 *
	 * @private
	 * @param {module:engine/view/range~Range} range
	 */
	_pushRange( range ) {
		for ( const storedRange of this._ranges ) {
			if ( range.isIntersecting( storedRange ) ) {
				/**
				 * Trying to add a range that intersects with another range from selection.
				 *
				 * @error selection-range-intersects
				 * @param {module:engine/view/range~Range} addedRange Range that was added to the selection.
				 * @param {module:engine/view/range~Range} intersectingRange Range from selection that intersects with `addedRange`.
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
 * Fired whenever selection ranges are changed through {@link ~Selection Selection API}.
 *
 * @event change
 */
