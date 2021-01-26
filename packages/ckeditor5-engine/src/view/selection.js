/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/selection
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Range from './range';
import Position from './position';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import Node from './node';
import count from '@ckeditor/ckeditor5-utils/src/count';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';
import DocumentSelection from './documentselection';

/**
 * Class representing an arbirtary selection in the view.
 * See also {@link module:engine/view/documentselection~DocumentSelection}.
 *
 * New selection instances can be created via the constructor or one these methods:
 *
 * * {@link module:engine/view/view~View#createSelection `View#createSelection()`},
 * * {@link module:engine/view/upcastwriter~UpcastWriter#createSelection `UpcastWriter#createSelection()`}.
 *
 * A selection can consist of {@link module:engine/view/range~Range ranges} that can be set by using
 * the {@link module:engine/view/selection~Selection#setTo `Selection#setTo()`} method.
 */
export default class Selection {
	/**
	 * Creates new selection instance.
	 *
	 * **Note**: The selection constructor is available as a factory method:
	 *
	 * * {@link module:engine/view/view~View#createSelection `View#createSelection()`},
	 * * {@link module:engine/view/upcastwriter~UpcastWriter#createSelection `UpcastWriter#createSelection()`}.
	 *
	 * 		// Creates empty selection without ranges.
	 *		const selection = writer.createSelection();
	 *
	 *		// Creates selection at the given range.
	 *		const range = writer.createRange( start, end );
	 *		const selection = writer.createSelection( range );
	 *
	 *		// Creates selection at the given ranges
	 * 		const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
	 *		const selection = writer.createSelection( ranges );
	 *
	 *		// Creates selection from the other selection.
	 *		const otherSelection = writer.createSelection();
	 *		const selection = writer.createSelection( otherSelection );
	 *
	 *		// Creates selection from the document selection.
	 *		const selection = writer.createSelection( editor.editing.view.document.selection );
	 *
	 * 		// Creates selection at the given position.
	 *		const position = writer.createPositionFromPath( root, path );
	 *		const selection = writer.createSelection( position );
	 *
	 *		// Creates collapsed selection at the position of given item and offset.
	 *		const paragraph = writer.createContainerElement( 'paragraph' );
	 *		const selection = writer.createSelection( paragraph, offset );
	 *
	 *		// Creates a range inside an {@link module:engine/view/element~Element element} which starts before the
	 *		// first child of that element and ends after the last child of that element.
	 *		const selection = writer.createSelection( paragraph, 'in' );
	 *
	 *		// Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends
	 *		// just after the item.
	 *		const selection = writer.createSelection( paragraph, 'on' );
	 *
	 * `Selection`'s constructor allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 *		// Creates backward selection.
	 *		const selection = writer.createSelection( range, { backward: true } );
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 *		// Creates fake selection with label.
	 *		const selection = writer.createSelection( range, { fake: true, label: 'foo' } );
	 *
	 * @param {module:engine/view/selection~Selectable} [selectable=null]
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Offset or place when selectable is an `Item`.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 * @param {Boolean} [options.fake] Sets this selection instance to be marked as `fake`.
	 * @param {String} [options.label] Label for the fake selection.
	 */
	constructor( selectable = null, placeOrOffset, options ) {
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

		this.setTo( selectable, placeOrOffset, options );
	}

	/**
	 * Returns true if selection instance is marked as `fake`.
	 *
	 * @see #setTo
	 * @returns {Boolean}
	 */
	get isFake() {
		return this._isFake;
	}

	/**
	 * Returns fake selection label.
	 *
	 * @see #setTo
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

		return anchor.clone();
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

		return focus.clone();
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
	 * Returns an iterable that contains copies of all ranges added to the selection.
	 *
	 * @returns {Iterable.<module:engine/view/range~Range>}
	 */
	* getRanges() {
		for ( const range of this._ranges ) {
			yield range.clone();
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

		return first ? first.clone() : null;
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

		return last ? last.clone() : null;
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

		return firstRange ? firstRange.start.clone() : null;
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

		return lastRange ? lastRange.end.clone() : null;
	}

	/**
	 * Checks whether, this selection is equal to given selection. Selections are equal if they have same directions,
	 * same number of ranges and all ranges from one selection equal to a range from other selection.
	 *
	 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} otherSelection
	 * Selection to compare with.
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
	 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} otherSelection
	 * Selection to compare with.
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

		return this.getFirstRange().getContainedElement();
	}

	/**
	 * Sets this selection's ranges and direction to the specified location based on the given
	 * {@link module:engine/view/selection~Selectable selectable}.
	 *
	 *		// Sets selection to the given range.
	 *		const range = writer.createRange( start, end );
	 *		selection.setTo( range );
	 *
	 *		// Sets selection to given ranges.
	 * 		const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
	 *		selection.setTo( range );
	 *
	 *		// Sets selection to the other selection.
	 *		const otherSelection = writer.createSelection();
	 *		selection.setTo( otherSelection );
	 *
	 *	 	// Sets selection to contents of DocumentSelection.
	 *		selection.setTo( editor.editing.view.document.selection );
	 *
	 * 		// Sets collapsed selection at the given position.
	 *		const position = writer.createPositionAt( root, path );
	 *		selection.setTo( position );
	 *
	 * 		// Sets collapsed selection at the position of given item and offset.
	 *		selection.setTo( paragraph, offset );
	 *
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 *		selection.setTo( paragraph, 'in' );
	 *
	 * Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends just after the item.
	 *
	 *		selection.setTo( paragraph, 'on' );
	 *
	 * 		// Clears selection. Removes all ranges.
	 *		selection.setTo( null );
	 *
	 * `Selection#setTo()` method allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 *		// Sets selection as backward.
	 *		selection.setTo( range, { backward: true } );
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 *		// Creates fake selection with label.
	 *		selection.setTo( range, { fake: true, label: 'foo' } );
	 *
	 * @fires change
	 * @param {module:engine/view/selection~Selectable} selectable
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Sets place or offset of the selection.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 * @param {Boolean} [options.fake] Sets this selection instance to be marked as `fake`.
	 * @param {String} [options.label] Label for the fake selection.
	 */
	setTo( selectable, placeOrOffset, options ) {
		if ( selectable === null ) {
			this._setRanges( [] );
			this._setFakeOptions( placeOrOffset );
		} else if ( selectable instanceof Selection || selectable instanceof DocumentSelection ) {
			this._setRanges( selectable.getRanges(), selectable.isBackward );
			this._setFakeOptions( { fake: selectable.isFake, label: selectable.fakeSelectionLabel } );
		} else if ( selectable instanceof Range ) {
			this._setRanges( [ selectable ], placeOrOffset && placeOrOffset.backward );
			this._setFakeOptions( placeOrOffset );
		} else if ( selectable instanceof Position ) {
			this._setRanges( [ new Range( selectable ) ] );
			this._setFakeOptions( placeOrOffset );
		} else if ( selectable instanceof Node ) {
			const backward = !!options && !!options.backward;
			let range;

			if ( placeOrOffset === undefined ) {
				/**
				 * selection.setTo requires the second parameter when the first parameter is a node.
				 *
				 * @error view-selection-setto-required-second-parameter
				 */
				throw new CKEditorError( 'view-selection-setto-required-second-parameter', this );
			} else if ( placeOrOffset == 'in' ) {
				range = Range._createIn( selectable );
			} else if ( placeOrOffset == 'on' ) {
				range = Range._createOn( selectable );
			} else {
				range = new Range( Position._createAt( selectable, placeOrOffset ) );
			}

			this._setRanges( [ range ], backward );
			this._setFakeOptions( options );
		} else if ( isIterable( selectable ) ) {
			// We assume that the selectable is an iterable of ranges.
			// Array.from() is used to prevent setting ranges to the old iterable
			this._setRanges( selectable, placeOrOffset && placeOrOffset.backward );
			this._setFakeOptions( placeOrOffset );
		} else {
			/**
			 * Cannot set selection to given place.
			 *
			 * @error view-selection-setto-not-selectable
			 */
			throw new CKEditorError( 'view-selection-setto-not-selectable', this );
		}

		this.fire( 'change' );
	}

	/**
	 * Moves {@link #focus} to the specified location.
	 *
	 * The location can be specified in the same form as {@link module:engine/view/view~View#createPositionAt view.createPositionAt()}
	 * parameters.
	 *
	 * @fires change
	 * @param {module:engine/view/item~Item|module:engine/view/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	setFocus( itemOrPosition, offset ) {
		if ( this.anchor === null ) {
			/**
			 * Cannot set selection focus if there are no ranges in selection.
			 *
			 * @error view-selection-setfocus-no-ranges
			 */
			throw new CKEditorError( 'view-selection-setfocus-no-ranges', this );
		}

		const newFocus = Position._createAt( itemOrPosition, offset );

		if ( newFocus.compareWith( this.focus ) == 'same' ) {
			return;
		}

		const anchor = this.anchor;

		this._ranges.pop();

		if ( newFocus.compareWith( anchor ) == 'before' ) {
			this._addRange( new Range( newFocus, anchor ), true );
		} else {
			this._addRange( new Range( anchor, newFocus ) );
		}

		this.fire( 'change' );
	}

	/**
	 * Checks whether this object is of the given type.
	 *
	 *		selection.is( 'selection' ); // -> true
	 *		selection.is( 'view:selection' ); // -> true
	 *
	 *		selection.is( 'model:selection' ); // -> false
	 *		selection.is( 'element' ); // -> false
	 *		selection.is( 'range' ); // -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	is( type ) {
		return type === 'selection' || type === 'view:selection';
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link #anchor anchor} and {@link #focus focus}.
	 * Accepts a flag describing in which way the selection is made.
	 *
	 * @private
	 * @param {Iterable.<module:engine/view/range~Range>} newRanges Iterable object of ranges to set.
	 * @param {Boolean} [isLastBackward=false] Flag describing if last added range was selected forward - from start to end
	 * (`false`) or backward - from end to start (`true`). Defaults to `false`.
	 */
	_setRanges( newRanges, isLastBackward = false ) {
		// New ranges should be copied to prevent removing them by setting them to `[]` first.
		// Only applies to situations when selection is set to the same selection or same selection's ranges.
		newRanges = Array.from( newRanges );

		this._ranges = [];

		for ( const range of newRanges ) {
			this._addRange( range );
		}

		this._lastRangeBackward = !!isLastBackward;
	}

	/**
	 * Sets this selection instance to be marked as `fake`. A fake selection does not render as browser native selection
	 * over selected elements and is hidden to the user. This way, no native selection UI artifacts are displayed to
	 * the user and selection over elements can be represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM (and be
	 * properly handled by screen readers).
	 *
	 * @private
	 * @param {Object} [options] Options.
	 * @param {Boolean} [options.fake] If set to true selection will be marked as `fake`.
	 * @param {String} [options.label=''] Fake selection label.
	 */
	_setFakeOptions( options = {} ) {
		this._isFake = !!options.fake;
		this._fakeSelectionLabel = options.fake ? options.label || '' : '';
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
	 * @private
	 * @fires change
	 * @param {module:engine/view/range~Range} range
	 * @param {Boolean} [isBackward]
	 */
	_addRange( range, isBackward = false ) {
		if ( !( range instanceof Range ) ) {
			/**
			 * Selection range set to an object that is not an instance of {@link module:engine/view/range~Range}.
			 *
			 * @error view-selection-add-range-not-range
			 */
			throw new CKEditorError(
				'view-selection-add-range-not-range',
				this
			);
		}

		this._pushRange( range );
		this._lastRangeBackward = !!isBackward;
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
				 * @error view-selection-range-intersects
				 * @param {module:engine/view/range~Range} addedRange Range that was added to the selection.
				 * @param {module:engine/view/range~Range} intersectingRange Range from selection that intersects with `addedRange`.
				 */
				throw new CKEditorError(
					'view-selection-range-intersects',
					this,
					{ addedRange: range, intersectingRange: storedRange }
				);
			}
		}

		this._ranges.push( new Range( range.start, range.end ) );
	}

	/**
	 * Fired whenever selection ranges are changed through {@link ~Selection Selection API}.
	 *
	 * @event change
	 */
}

mix( Selection, EmitterMixin );

/**
 * An entity that is used to set selection.
 *
 * See also {@link module:engine/view/selection~Selection#setTo}
 *
 * @typedef {
 *    module:engine/view/selection~Selection|
 *    module:engine/view/documentselection~DocumentSelection|
 *    module:engine/view/position~Position|
 *    Iterable.<module:engine/view/range~Range>|
 *    module:engine/view/range~Range|
 *    module:engine/view/item~Item|
 *    null
 * } module:engine/view/selection~Selectable
 */
