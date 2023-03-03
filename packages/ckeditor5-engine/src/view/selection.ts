/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/selection
 */

import TypeCheckable from './typecheckable';
import Range from './range';
import Position, { type PositionOffset } from './position';
import Node from './node';
import DocumentSelection from './documentselection';

import {
	CKEditorError,
	EmitterMixin,
	count,
	isIterable
} from '@ckeditor/ckeditor5-utils';

import type Element from './element';
import type Item from './item';
import type EditableElement from './editableelement';

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
export default class Selection extends EmitterMixin( TypeCheckable ) {
	/**
	 * Stores all ranges that are selected.
	 */
	private _ranges: Array<Range>;

	/**
	 * Specifies whether the last added range was added as a backward or forward range.
	 */
	private _lastRangeBackward: boolean;

	/**
	 * Specifies whether selection instance is fake.
	 */
	private _isFake: boolean;

	/**
	 * Fake selection's label.
	 */
	private _fakeSelectionLabel: string;

	/**
	 * Creates new selection instance.
	 *
	 * **Note**: The selection constructor is available as a factory method:
	 *
	 * * {@link module:engine/view/view~View#createSelection `View#createSelection()`},
	 * * {@link module:engine/view/upcastwriter~UpcastWriter#createSelection `UpcastWriter#createSelection()`}.
	 *
	 * ```ts
	 * // Creates empty selection without ranges.
	 * const selection = writer.createSelection();
	 *
	 * // Creates selection at the given range.
	 * const range = writer.createRange( start, end );
	 * const selection = writer.createSelection( range );
	 *
	 * // Creates selection at the given ranges
	 * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
	 * const selection = writer.createSelection( ranges );
	 *
	 * // Creates selection from the other selection.
	 * const otherSelection = writer.createSelection();
	 * const selection = writer.createSelection( otherSelection );
	 *
	 * // Creates selection from the document selection.
	 * const selection = writer.createSelection( editor.editing.view.document.selection );
	 *
	 * // Creates selection at the given position.
	 * const position = writer.createPositionFromPath( root, path );
	 * const selection = writer.createSelection( position );
	 *
	 * // Creates collapsed selection at the position of given item and offset.
	 * const paragraph = writer.createContainerElement( 'paragraph' );
	 * const selection = writer.createSelection( paragraph, offset );
	 *
	 * // Creates a range inside an {@link module:engine/view/element~Element element} which starts before the
	 * // first child of that element and ends after the last child of that element.
	 * const selection = writer.createSelection( paragraph, 'in' );
	 *
	 * // Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends
	 * // just after the item.
	 * const selection = writer.createSelection( paragraph, 'on' );
	 * ```
	 *
	 * `Selection`'s constructor allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 * ```ts
	 * // Creates backward selection.
	 * const selection = writer.createSelection( range, { backward: true } );
	 * ```
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 * ```ts
	 * // Creates fake selection with label.
	 * const selection = writer.createSelection( range, { fake: true, label: 'foo' } );
	 * ```
	 *
	 * @internal
	 */
	constructor(
		...args: [] | [
			selectable: Node,
			placeOrOffset: PlaceOrOffset,
			options?: SelectionOptions
		] | [
			selectable?: Exclude<Selectable, Node>,
			options?: SelectionOptions
		]
	) {
		super();

		this._ranges = [];
		this._lastRangeBackward = false;
		this._isFake = false;
		this._fakeSelectionLabel = '';

		if ( args.length ) {
			this.setTo( ...args );
		}
	}

	/**
	 * Returns true if selection instance is marked as `fake`.
	 *
	 * @see #setTo
	 */
	public get isFake(): boolean {
		return this._isFake;
	}

	/**
	 * Returns fake selection label.
	 *
	 * @see #setTo
	 */
	public get fakeSelectionLabel(): string {
		return this._fakeSelectionLabel;
	}

	/**
	 * Selection anchor. Anchor may be described as a position where the selection starts. Together with
	 * {@link #focus focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. Anchor is always the start or end of the most recent added range.
	 * It may be a bit unintuitive when there are multiple ranges in selection.
	 *
	 * @see #focus
	 */
	public get anchor(): Position | null {
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
	 */
	public get focus(): Position | null {
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
	 */
	public get isCollapsed(): boolean {
		return this.rangeCount === 1 && this._ranges[ 0 ].isCollapsed;
	}

	/**
	 * Returns number of ranges in selection.
	 */
	public get rangeCount(): number {
		return this._ranges.length;
	}

	/**
	 * Specifies whether the {@link #focus} precedes {@link #anchor}.
	 */
	public get isBackward(): boolean {
		return !this.isCollapsed && this._lastRangeBackward;
	}

	/**
	 * {@link module:engine/view/editableelement~EditableElement EditableElement} instance that contains this selection, or `null`
	 * if the selection is not inside an editable element.
	 */
	public get editableElement(): EditableElement | null {
		if ( this.anchor ) {
			return this.anchor.editableElement;
		}

		return null;
	}

	/**
	 * Returns an iterable that contains copies of all ranges added to the selection.
	 */
	public* getRanges(): IterableIterator<Range> {
		for ( const range of this._ranges ) {
			yield range.clone();
		}
	}

	/**
	 * Returns copy of the first range in the selection. First range is the one which
	 * {@link module:engine/view/range~Range#start start} position {@link module:engine/view/position~Position#isBefore is before} start
	 * position of all other ranges (not to confuse with the first range added to the selection).
	 * Returns `null` if no ranges are added to selection.
	 */
	public getFirstRange(): Range | null {
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
	 */
	public getLastRange(): Range | null {
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
	 */
	public getFirstPosition(): Position | null {
		const firstRange = this.getFirstRange();

		return firstRange ? firstRange.start.clone() : null;
	}

	/**
	 * Returns copy of the last position in the selection. Last position is the position that
	 * {@link module:engine/view/position~Position#isAfter is after} any other position in the selection ranges.
	 * Returns `null` if no ranges are added to selection.
	 */
	public getLastPosition(): Position | null {
		const lastRange = this.getLastRange();

		return lastRange ? lastRange.end.clone() : null;
	}

	/**
	 * Checks whether, this selection is equal to given selection. Selections are equal if they have same directions,
	 * same number of ranges and all ranges from one selection equal to a range from other selection.
	 *
	 * @param otherSelection Selection to compare with.
	 * @returns `true` if selections are equal, `false` otherwise.
	 */
	public isEqual( otherSelection: Selection | DocumentSelection ): boolean {
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

		if ( !this.anchor!.isEqual( otherSelection.anchor! ) || !this.focus!.isEqual( otherSelection.focus! ) ) {
			return false;
		}

		for ( const thisRange of this._ranges ) {
			let found = false;

			for ( const otherRange of ( otherSelection as any )._ranges ) {
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
	 * @param otherSelection Selection to compare with.
	 * @returns `true` if selections are similar, `false` otherwise.
	 */
	public isSimilar( otherSelection: Selection | DocumentSelection ): boolean {
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
	 */
	public getSelectedElement(): Element | null {
		if ( this.rangeCount !== 1 ) {
			return null;
		}

		return this.getFirstRange()!.getContainedElement();
	}

	/**
	 * Sets this selection's ranges and direction to the specified location based on the given
	 * {@link module:engine/view/selection~Selectable selectable}.
	 *
	 * ```ts
	 * // Sets selection to the given range.
	 * const range = writer.createRange( start, end );
	 * selection.setTo( range );
	 *
	 * // Sets selection to given ranges.
	 * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
	 * selection.setTo( range );
	 *
	 * // Sets selection to the other selection.
	 * const otherSelection = writer.createSelection();
	 * selection.setTo( otherSelection );
	 *
	 * // Sets selection to contents of DocumentSelection.
	 * selection.setTo( editor.editing.view.document.selection );
	 *
	 * // Sets collapsed selection at the given position.
	 * const position = writer.createPositionAt( root, path );
	 * selection.setTo( position );
	 *
	 * // Sets collapsed selection at the position of given item and offset.
	 * selection.setTo( paragraph, offset );
	 * ```
	 *
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * ```ts
	 * selection.setTo( paragraph, 'in' );
	 * ```
	 *
	 * Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends just after the item.
	 *
	 * ```ts
	 * selection.setTo( paragraph, 'on' );
	 *
	 * // Clears selection. Removes all ranges.
	 * selection.setTo( null );
	 * ```
	 *
	 * `Selection#setTo()` method allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 * ```ts
	 * // Sets selection as backward.
	 * selection.setTo( range, { backward: true } );
	 * ```
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 * ```ts
	 * // Creates fake selection with label.
	 * selection.setTo( range, { fake: true, label: 'foo' } );
	 * ```
	 *
	 * @fires change
	 */
	public setTo(
		...args: [
			selectable: Node,
			placeOrOffset: PlaceOrOffset,
			options?: SelectionOptions
		] | [
			selectable?: Exclude<Selectable, Node>,
			options?: SelectionOptions
		]
	): void {
		let [ selectable, placeOrOffset, options ] = args;

		if ( typeof placeOrOffset == 'object' ) {
			options = placeOrOffset;
			placeOrOffset = undefined;
		}

		if ( selectable === null ) {
			this._setRanges( [] );
			this._setFakeOptions( options );
		} else if ( selectable instanceof Selection || selectable instanceof DocumentSelection ) {
			this._setRanges( selectable.getRanges(), selectable.isBackward );
			this._setFakeOptions( { fake: selectable.isFake, label: selectable.fakeSelectionLabel } );
		} else if ( selectable instanceof Range ) {
			this._setRanges( [ selectable ], options && options.backward );
			this._setFakeOptions( options );
		} else if ( selectable instanceof Position ) {
			this._setRanges( [ new Range( selectable ) ] );
			this._setFakeOptions( options );
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
				range = Range._createIn( selectable as Element );
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
			this._setRanges( selectable, options && options.backward );
			this._setFakeOptions( options );
		} else {
			/**
			 * Cannot set selection to given place.
			 *
			 * @error view-selection-setto-not-selectable
			 */
			throw new CKEditorError( 'view-selection-setto-not-selectable', this );
		}

		this.fire<ViewSelectionChangeEvent>( 'change' );
	}

	/**
	 * Moves {@link #focus} to the specified location.
	 *
	 * The location can be specified in the same form as {@link module:engine/view/view~View#createPositionAt view.createPositionAt()}
	 * parameters.
	 *
	 * @fires change
	 * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	public setFocus( itemOrPosition: Item | Position, offset?: PositionOffset ): void {
		if ( this.anchor === null ) {
			/**
			 * Cannot set selection focus if there are no ranges in selection.
			 *
			 * @error view-selection-setfocus-no-ranges
			 */
			throw new CKEditorError( 'view-selection-setfocus-no-ranges', this );
		}

		const newFocus = Position._createAt( itemOrPosition, offset );

		if ( newFocus.compareWith( this.focus! ) == 'same' ) {
			return;
		}

		const anchor = this.anchor;

		this._ranges.pop();

		if ( newFocus.compareWith( anchor ) == 'before' ) {
			this._addRange( new Range( newFocus, anchor ), true );
		} else {
			this._addRange( new Range( anchor, newFocus ) );
		}

		this.fire<ViewSelectionChangeEvent>( 'change' );
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link #anchor anchor} and {@link #focus focus}.
	 * Accepts a flag describing in which way the selection is made.
	 *
	 * @param newRanges Iterable object of ranges to set.
	 * @param isLastBackward Flag describing if last added range was selected forward - from start to end
	 * (`false`) or backward - from end to start (`true`). Defaults to `false`.
	 */
	private _setRanges( newRanges: Iterable<Range>, isLastBackward: boolean = false ) {
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
	 */
	private _setFakeOptions( options: SelectionOptions = {} ) {
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
	 */
	private _addRange( range: Range, isBackward: boolean = false ): void {
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
	 */
	private _pushRange( range: Range ): void {
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
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
Selection.prototype.is = function( type: string ): boolean {
	return type === 'selection' || type === 'view:selection';
};

/**
 * Additional options for {@link ~Selection}.
 */
export interface SelectionOptions {

	/**
	 * Sets this selection instance to be backward.
	 */
	backward?: boolean;

	/**
	 * Sets this selection instance to be marked as `fake`.
	 */
	fake?: boolean;

	/**
	 * Label for the fake selection.
	 */
	label?: string;
}

/**
 * The place or offset of the selection.
 */
export type PlaceOrOffset = number | 'before' | 'end' | 'after' | 'on' | 'in';

/**
 * Fired whenever selection ranges are changed through {@link ~Selection Selection API}.
 *
 * @eventName ~Selection#change
 */
export type ViewSelectionChangeEvent = {
	name: 'change';
	args: [];
};

/**
 * An entity that is used to set selection.
 *
 * See also {@link module:engine/view/selection~Selection#setTo}
 */
export type Selectable = Selection | DocumentSelection | Position | Iterable<Range> | Range | Node | null;
