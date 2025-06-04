/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/selection
 */

import TypeCheckable from './typecheckable.js';
import Node from './node.js';
import Position, { type PositionOffset } from './position.js';
import Range from './range.js';

import type DocumentFragment from './documentfragment.js';
import type DocumentSelection from './documentselection.js';
import type Element from './element.js';
import type Item from './item.js';

import { CKEditorError, EmitterMixin, isIterable } from '@ckeditor/ckeditor5-utils';

/**
 * Selection is a set of {@link module:engine/model/range~Range ranges}. It has a direction specified by its
 * {@link module:engine/model/selection~Selection#anchor anchor} and {@link module:engine/model/selection~Selection#focus focus}
 * (it can be {@link module:engine/model/selection~Selection#isBackward forward or backward}).
 * Additionally, selection may have its own attributes (think – whether text typed in in this selection
 * should have those attributes – e.g. whether you type a bolded text).
 */
export default class Selection extends /* #__PURE__ */ EmitterMixin( TypeCheckable ) {
	/**
	 * Specifies whether the last added range was added as a backward or forward range.
	 */
	private _lastRangeBackward: boolean = false;

	/**
	 * List of attributes set on current selection.
	 */
	protected _attrs: Map<string, unknown> = new Map();

	/** @internal */
	public _ranges: Array<Range> = [];

	/**
	 * Creates a new selection instance based on the given {@link module:engine/model/selection~Selectable selectable}
	 * or creates an empty selection if no arguments were passed.
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
	 * // Note: It doesn't copy selection attributes.
	 * const otherSelection = writer.createSelection();
	 * const selection = writer.createSelection( otherSelection );
	 *
	 * // Creates selection from the given document selection.
	 * // Note: It doesn't copy selection attributes.
	 * const documentSelection = model.document.selection;
	 * const selection = writer.createSelection( documentSelection );
	 *
	 * // Creates selection at the given position.
	 * const position = writer.createPositionFromPath( root, path );
	 * const selection = writer.createSelection( position );
	 *
	 * // Creates selection at the given offset in the given element.
	 * const paragraph = writer.createElement( 'paragraph' );
	 * const selection = writer.createSelection( paragraph, offset );
	 *
	 * // Creates a range inside an {@link module:engine/model/element~Element element} which starts before the
	 * // first child of that element and ends after the last child of that element.
	 * const selection = writer.createSelection( paragraph, 'in' );
	 *
	 * // Creates a range on an {@link module:engine/model/item~Item item} which starts before the item and ends
	 * // just after the item.
	 * const selection = writer.createSelection( paragraph, 'on' );
	 * ```
	 *
	 * Selection's constructor allow passing additional options (`'backward'`) as the last argument.
	 *
	 * ```ts
	 * // Creates backward selection.
	 * const selection = writer.createSelection( range, { backward: true } );
	 * ```
	 *
	 * @internal
	 */
	constructor(
		...args: [] |
		[
			selectable: Node,
			placeOrOffset: PlaceOrOffset,
			options?: { backward?: boolean }
		] |
		[
			selectable?: Exclude<Selectable, Node>,
			options?: { backward?: boolean }
		]
	) {
		super();

		if ( args.length ) {
			this.setTo( ...args );
		}
	}

	/**
	 * Selection anchor. Anchor is the position from which the selection was started. If a user is making a selection
	 * by dragging the mouse, the anchor is where the user pressed the mouse button (the beginning of the selection).
	 *
	 * Anchor and {@link #focus} define the direction of the selection, which is important
	 * when expanding/shrinking selection. The focus moves, while the anchor should remain in the same place.
	 *
	 * Anchor is always set to the {@link module:engine/model/range~Range#start start} or
	 * {@link module:engine/model/range~Range#end end} position of the last of selection's ranges. Whether it is
	 * the `start` or `end` depends on the specified `options.backward`. See the {@link #setTo `setTo()`} method.
	 *
	 * May be set to `null` if there are no ranges in the selection.
	 *
	 * @see #focus
	 */
	public get anchor(): Position | null {
		if ( this._ranges.length > 0 ) {
			const range = this._ranges[ this._ranges.length - 1 ];

			return this._lastRangeBackward ? range.end : range.start;
		}

		return null;
	}

	/**
	 * Selection focus. Focus is the position where the selection ends. If a user is making a selection
	 * by dragging the mouse, the focus is where the mouse cursor is.
	 *
	 * May be set to `null` if there are no ranges in the selection.
	 *
	 * @see #anchor
	 */
	public get focus(): Position | null {
		if ( this._ranges.length > 0 ) {
			const range = this._ranges[ this._ranges.length - 1 ];

			return this._lastRangeBackward ? range.start : range.end;
		}

		return null;
	}

	/**
	 * Whether the selection is collapsed. Selection is collapsed when there is exactly one range in it
	 * and it is collapsed.
	 */
	public get isCollapsed(): boolean {
		const length = this._ranges.length;

		if ( length === 1 ) {
			return this._ranges[ 0 ].isCollapsed;
		} else {
			return false;
		}
	}

	/**
	 * Returns the number of ranges in the selection.
	 */
	public get rangeCount(): number {
		return this._ranges.length;
	}

	/**
	 * Specifies whether the selection's {@link #focus} precedes the selection's {@link #anchor}.
	 */
	public get isBackward(): boolean {
		return !this.isCollapsed && this._lastRangeBackward;
	}

	/**
	 * Checks whether this selection is equal to the given selection. Selections are equal if they have the same directions,
	 * the same number of ranges and all ranges from one selection equal to ranges from the another selection.
	 *
	 * @param otherSelection Selection to compare with.
	 * @returns `true` if selections are equal, `false` otherwise.
	 */
	public isEqual( otherSelection: Selection | DocumentSelection ): boolean {
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
	 * Returns an iterable object that iterates over copies of selection ranges.
	 */
	public* getRanges(): IterableIterator<Range> {
		for ( const range of this._ranges ) {
			yield new Range( range.start, range.end );
		}
	}

	/**
	 * Returns a copy of the first range in the selection.
	 * First range is the one which {@link module:engine/model/range~Range#start start} position
	 * {@link module:engine/model/position~Position#isBefore is before} start position of all other ranges
	 * (not to confuse with the first range added to the selection).
	 *
	 * Returns `null` if there are no ranges in selection.
	 */
	public getFirstRange(): Range | null {
		let first = null;

		for ( const range of this._ranges ) {
			if ( !first || range.start.isBefore( first.start ) ) {
				first = range;
			}
		}

		return first ? new Range( first.start, first.end ) : null;
	}

	/**
	 * Returns a copy of the last range in the selection.
	 * Last range is the one which {@link module:engine/model/range~Range#end end} position
	 * {@link module:engine/model/position~Position#isAfter is after} end position of all other ranges (not to confuse with the range most
	 * recently added to the selection).
	 *
	 * Returns `null` if there are no ranges in selection.
	 */
	public getLastRange(): Range | null {
		let last = null;

		for ( const range of this._ranges ) {
			if ( !last || range.end.isAfter( last.end ) ) {
				last = range;
			}
		}

		return last ? new Range( last.start, last.end ) : null;
	}

	/**
	 * Returns the first position in the selection.
	 * First position is the position that {@link module:engine/model/position~Position#isBefore is before}
	 * any other position in the selection.
	 *
	 * Returns `null` if there are no ranges in selection.
	 */
	public getFirstPosition(): Position | null {
		const first = this.getFirstRange();

		return first ? first.start.clone() : null;
	}

	/**
	 * Returns the last position in the selection.
	 * Last position is the position that {@link module:engine/model/position~Position#isAfter is after}
	 * any other position in the selection.
	 *
	 * Returns `null` if there are no ranges in selection.
	 */
	public getLastPosition(): Position | null {
		const lastRange = this.getLastRange();

		return lastRange ? lastRange.end.clone() : null;
	}

	/**
	 * Sets this selection's ranges and direction to the specified location based on the given
	 * {@link module:engine/model/selection~Selectable selectable}.
	 *
	 * ```ts
	 * // Removes all selection's ranges.
	 * selection.setTo( null );
	 *
	 * // Sets selection to the given range.
	 * const range = writer.createRange( start, end );
	 * selection.setTo( range );
	 *
	 * // Sets selection to given ranges.
	 * const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
	 * selection.setTo( ranges );
	 *
	 * // Sets selection to other selection.
	 * // Note: It doesn't copy selection attributes.
	 * const otherSelection = writer.createSelection();
	 * selection.setTo( otherSelection );
	 *
	 * // Sets selection to the given document selection.
	 * // Note: It doesn't copy selection attributes.
	 * const documentSelection = new DocumentSelection( doc );
	 * selection.setTo( documentSelection );
	 *
	 * // Sets collapsed selection at the given position.
	 * const position = writer.createPositionFromPath( root, path );
	 * selection.setTo( position );
	 *
	 * // Sets collapsed selection at the position of the given node and an offset.
	 * selection.setTo( paragraph, offset );
	 * ```
	 *
	 * Creates a range inside an {@link module:engine/model/element~Element element} which starts before the first child of
 	 * that element and ends after the last child of that element.
	 *
	 * ```ts
	 * selection.setTo( paragraph, 'in' );
	 * ```
	 *
	 * Creates a range on an {@link module:engine/model/item~Item item} which starts before the item and ends just after the item.
	 *
	 * ```ts
	 * selection.setTo( paragraph, 'on' );
	 * ```
	 *
	 * `Selection#setTo()`' method allow passing additional options (`backward`) as the last argument.
	 *
	 * ```ts
	 * // Sets backward selection.
	 * const selection = writer.createSelection( range, { backward: true } );
	 * ```
	 */
	public setTo(
		...args: [
			selectable: Node,
			placeOrOffset: PlaceOrOffset,
			options?: { backward?: boolean }
		] | [
			selectable?: Exclude<Selectable, Node>,
			options?: { backward?: boolean }
		]
	): void {
		let [ selectable, placeOrOffset, options ] = args;

		if ( typeof placeOrOffset == 'object' ) {
			options = placeOrOffset;
			placeOrOffset = undefined;
		}

		if ( selectable === null ) {
			this._setRanges( [] );
		} else if ( selectable instanceof Selection ) {
			this._setRanges( selectable.getRanges(), selectable.isBackward );
		} else if ( selectable && typeof ( selectable as any ).getRanges == 'function' ) {
			// We assume that the selectable is a DocumentSelection.
			// It can't be imported here, because it would lead to circular imports.
			this._setRanges( ( selectable as DocumentSelection ).getRanges(), ( selectable as DocumentSelection ).isBackward );
		} else if ( selectable instanceof Range ) {
			this._setRanges( [ selectable ], !!options && !!options.backward );
		} else if ( selectable instanceof Position ) {
			this._setRanges( [ new Range( selectable ) ] );
		} else if ( selectable instanceof Node ) {
			const backward = !!options && !!options.backward;
			let range;

			if ( placeOrOffset == 'in' ) {
				range = Range._createIn( selectable as Element );
			} else if ( placeOrOffset == 'on' ) {
				range = Range._createOn( selectable );
			} else if ( placeOrOffset !== undefined ) {
				range = new Range( Position._createAt( selectable, placeOrOffset ) );
			} else {
				/**
				 * selection.setTo requires the second parameter when the first parameter is a node.
				 *
				 * @error model-selection-setto-required-second-parameter
				 */
				throw new CKEditorError( 'model-selection-setto-required-second-parameter', [ this, selectable ] );
			}

			this._setRanges( [ range ], backward );
		} else if ( isIterable( selectable ) ) {
			// We assume that the selectable is an iterable of ranges.
			this._setRanges( selectable, options && !!options.backward );
		} else {
			/**
			 * Cannot set the selection to the given place.
			 *
			 * Invalid parameters were specified when setting the selection. Common issues:
			 *
			 * * A {@link module:engine/model/textproxy~TextProxy} instance was passed instead of
			 * a real {@link module:engine/model/text~Text}.
			 * * View nodes were passed instead of model nodes.
			 * * `null`/`undefined` was passed.
			 *
			 * @error model-selection-setto-not-selectable
			 */
			throw new CKEditorError( 'model-selection-setto-not-selectable', [ this, selectable ] );
		}
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link module:engine/model/selection~Selection#anchor} and
	 * {@link module:engine/model/selection~Selection#focus}. Accepts a flag describing in which direction the selection is made.
	 *
	 * @fires change:range
	 * @param newRanges Ranges to set.
	 * @param isLastBackward Flag describing if last added range was selected forward - from start to end (`false`)
	 * or backward - from end to start (`true`).
	 */
	protected _setRanges( newRanges: Iterable<Range>, isLastBackward: boolean = false ): void {
		const ranges = Array.from( newRanges );

		// Check whether there is any range in new ranges set that is different than all already added ranges.
		const anyNewRange = ranges.some( newRange => {
			if ( !( newRange instanceof Range ) ) {
				/**
				 * Selection range set to an object that is not an instance of {@link module:engine/model/range~Range}.
				 *
				 * Only {@link module:engine/model/range~Range} instances can be used to set a selection.
				 * Common mistakes leading to this error are:
				 *
				 * * using DOM `Range` object,
				 * * incorrect CKEditor 5 installation with multiple `ckeditor5-engine` packages having different versions.
				 *
				 * @error model-selection-set-ranges-not-range
				 */
				throw new CKEditorError(
					'model-selection-set-ranges-not-range',
					[ this, newRanges ]
				);
			}

			return this._ranges.every( oldRange => {
				return !oldRange.isEqual( newRange );
			} );
		} );

		// Don't do anything if nothing changed.
		if ( ranges.length === this._ranges.length && !anyNewRange ) {
			return;
		}

		this._replaceAllRanges( ranges );

		this._lastRangeBackward = !!isLastBackward;

		this.fire<SelectionChangeRangeEvent>( 'change:range', { directChange: true } );
	}

	/**
	 * Moves {@link module:engine/model/selection~Selection#focus} to the specified location.
	 *
	 * The location can be specified in the same form as
	 * {@link module:engine/model/writer~Writer#createPositionAt writer.createPositionAt()} parameters.
	 *
	 * @fires change:range
	 * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/model/item~Item model item}.
	 */
	public setFocus( itemOrPosition: Item | Position, offset?: PositionOffset ): void {
		if ( this.anchor === null ) {
			/**
			 * Cannot set selection focus if there are no ranges in selection.
			 *
			 * @error model-selection-setfocus-no-ranges
			 */
			throw new CKEditorError( 'model-selection-setfocus-no-ranges', [ this, itemOrPosition ] );
		}

		const newFocus = Position._createAt( itemOrPosition, offset );

		if ( newFocus.compareWith( this.focus! ) == 'same' ) {
			return;
		}

		const anchor = this.anchor;

		if ( this._ranges.length ) {
			this._popRange();
		}

		if ( newFocus.compareWith( anchor ) == 'before' ) {
			this._pushRange( new Range( newFocus, anchor ) );
			this._lastRangeBackward = true;
		} else {
			this._pushRange( new Range( anchor, newFocus ) );
			this._lastRangeBackward = false;
		}

		this.fire<SelectionChangeRangeEvent>( 'change:range', { directChange: true } );
	}

	/**
	 * Gets an attribute value for given key or `undefined` if that attribute is not set on the selection.
	 *
	 * @param key Key of attribute to look for.
	 * @returns Attribute value or `undefined`.
	 */
	public getAttribute( key: string ): unknown {
		return this._attrs.get( key );
	}

	/**
	 * Returns iterable that iterates over this selection's attributes.
	 *
	 * Attributes are returned as arrays containing two items. First one is attribute key and second is attribute value.
	 * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
	 */
	public getAttributes(): IterableIterator<[ string, unknown ]> {
		return this._attrs.entries();
	}

	/**
	 * Returns iterable that iterates over this selection's attribute keys.
	 */
	public getAttributeKeys(): IterableIterator<string> {
		return this._attrs.keys();
	}

	/**
	 * Checks if the selection has an attribute for given key.
	 *
	 * @param key Key of attribute to check.
	 * @returns `true` if attribute with given key is set on selection, `false` otherwise.
	 */
	public hasAttribute( key: string ): boolean {
		return this._attrs.has( key );
	}

	/**
	 * Removes an attribute with given key from the selection.
	 *
	 * If given attribute was set on the selection, fires the {@link #event:change:range} event with
	 * removed attribute key.
	 *
	 * @fires change:attribute
	 * @param key Key of attribute to remove.
	 */
	public removeAttribute( key: string ): void {
		if ( this.hasAttribute( key ) ) {
			this._attrs.delete( key );

			this.fire<SelectionChangeAttributeEvent>( 'change:attribute', { attributeKeys: [ key ], directChange: true } );
		}
	}

	/**
	 * Sets attribute on the selection. If attribute with the same key already is set, it's value is overwritten.
	 *
	 * If the attribute value has changed, fires the {@link #event:change:range} event with
	 * the attribute key.
	 *
	 * @fires change:attribute
	 * @param key Key of attribute to set.
	 * @param value Attribute value.
	 */
	public setAttribute( key: string, value: unknown ): void {
		if ( this.getAttribute( key ) !== value ) {
			this._attrs.set( key, value );

			this.fire<SelectionChangeAttributeEvent>( 'change:attribute', { attributeKeys: [ key ], directChange: true } );
		}
	}

	/**
	 * Returns the selected element. {@link module:engine/model/element~Element Element} is considered as selected if there is only
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
	 * Gets elements of type {@link module:engine/model/schema~Schema#isBlock "block"} touched by the selection.
	 *
	 * This method's result can be used for example to apply block styling to all blocks covered by this selection.
	 *
	 * **Note:** `getSelectedBlocks()` returns blocks that are nested in other non-block elements
	 * but will not return blocks nested in other blocks.
	 *
	 * In this case the function will return exactly all 3 paragraphs (note: `<blockQuote>` is not a block itself):
	 *
	 * ```xml
	 * <paragraph>[a</paragraph>
	 * <blockQuote>
	 * 	<paragraph>b</paragraph>
	 * </blockQuote>
	 * <paragraph>c]d</paragraph>
	 * ```
	 *
	 * In this case the paragraph will also be returned, despite the collapsed selection:
	 *
	 * ```xml
	 * <paragraph>[]a</paragraph>
	 * ```
	 *
	 * In such a scenario, however, only blocks A, B & E will be returned as blocks C & D are nested in block B:
	 *
	 * ```xml
	 * [<blockA></blockA>
	 * <blockB>
	 * 	<blockC></blockC>
	 * 	<blockD></blockD>
	 * </blockB>
	 * <blockE></blockE>]
	 * ```
	 *
	 * If the selection is inside a block all the inner blocks (A & B) are returned:
	 *
	 * ```xml
	 * <block>
	 * 	<blockA>[a</blockA>
	 * 	<blockB>b]</blockB>
	 * </block>
	 * ```
	 *
	 * **Special case**: Selection ignores first and/or last blocks if nothing (from user perspective) is selected in them.
	 *
	 * ```xml
	 * // Selection ends and the beginning of the last block.
	 * <paragraph>[a</paragraph>
	 * <paragraph>b</paragraph>
	 * <paragraph>]c</paragraph> // This block will not be returned
	 *
	 * // Selection begins at the end of the first block.
	 * <paragraph>a[</paragraph> // This block will not be returned
	 * <paragraph>b</paragraph>
	 * <paragraph>c]</paragraph>
	 *
	 * // Selection begings at the end of the first block and ends at the beginning of the last block.
	 * <paragraph>a[</paragraph> // This block will not be returned
	 * <paragraph>b</paragraph>
	 * <paragraph>]c</paragraph> // This block will not be returned
	 * ```
	 */
	public* getSelectedBlocks(): IterableIterator<Element> {
		const visited = new WeakSet<Node | DocumentFragment>();

		for ( const range of this.getRanges() ) {
			// Get start block of range in case of a collapsed range.
			const startBlock = getParentBlock( range.start, visited );

			if ( isStartBlockSelected( startBlock, range ) ) {
				yield startBlock as any;
			}

			const treewalker = range.getWalker();

			for ( const value of treewalker ) {
				const block = value.item;

				if ( value.type == 'elementEnd' && isUnvisitedTopBlock( block as any, visited, range ) ) {
					yield block as Element;
				}
				// If element is block, we can skip its children and jump to the end of it.
				else if (
					value.type == 'elementStart' &&
					block.is( 'model:element' ) &&
					block.root.document!.model.schema.isBlock( block )
				) {
					treewalker.jumpTo( Position._createAt( block, 'end' ) );
				}
			}

			const endBlock = getParentBlock( range.end, visited );

			if ( isEndBlockSelected( endBlock, range ) ) {
				yield endBlock as any;
			}
		}
	}

	/**
	 * Checks whether the selection contains the entire content of the given element. This means that selection must start
	 * at a position {@link module:engine/model/position~Position#isTouching touching} the element's start and ends at position
	 * touching the element's end.
	 *
	 * By default, this method will check whether the entire content of the selection's current root is selected.
	 * Useful to check if e.g. the user has just pressed <kbd>Ctrl</kbd> + <kbd>A</kbd>.
	 */
	public containsEntireContent( element: Element = this.anchor!.root as Element ): boolean {
		const limitStartPosition = Position._createAt( element, 0 );
		const limitEndPosition = Position._createAt( element, 'end' );

		return limitStartPosition.isTouching( this.getFirstPosition()! ) &&
			limitEndPosition.isTouching( this.getLastPosition()! );
	}

	/**
	 * Adds given range to internal {@link #_ranges ranges array}. Throws an error
	 * if given range is intersecting with any range that is already stored in this selection.
	 */
	protected _pushRange( range: Range ): void {
		this._checkRange( range );
		this._ranges.push( new Range( range.start, range.end ) );
	}

	/**
	 * Checks if given range intersects with ranges that are already in the selection. Throws an error if it does.
	 */
	protected _checkRange( range: Range ): void {
		for ( let i = 0; i < this._ranges.length; i++ ) {
			if ( range.isIntersecting( this._ranges[ i ] ) ) {
				/**
				 * Trying to add a range that intersects with another range in the selection.
				 *
				 * @error model-selection-range-intersects
				 * @param {module:engine/model/range~Range} addedRange Range that was added to the selection.
				 * @param {module:engine/model/range~Range} intersectingRange Range in the selection that intersects with `addedRange`.
				 */
				throw new CKEditorError(
					'model-selection-range-intersects',
					[ this, range ],
					{ addedRange: range, intersectingRange: this._ranges[ i ] }
				);
			}
		}
	}

	/**
	 * Replaces all the ranges by the given ones.
	 * Uses {@link #_popRange _popRange} and {@link #_pushRange _pushRange} to ensure proper ranges removal and addition.
	 */
	protected _replaceAllRanges( ranges: Array<Range> ): void {
		this._removeAllRanges();

		for ( const range of ranges ) {
			this._pushRange( range );
		}
	}

	/**
	 * Deletes ranges from internal range array. Uses {@link #_popRange _popRange} to
	 * ensure proper ranges removal.
	 */
	protected _removeAllRanges(): void {
		while ( this._ranges.length > 0 ) {
			this._popRange();
		}
	}

	/**
	 * Removes most recently added range from the selection.
	 */
	protected _popRange(): void {
		this._ranges.pop();
	}
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
Selection.prototype.is = function( type: string ): boolean {
	return type === 'selection' || type === 'model:selection';
};

/**
 * Describes one of the events: `change:range` or `change:attribute`.
 */
export type SelectionChangeEvent = {
	name: 'change' | 'change:range' | 'change:attribute';
	args: [ {
		directChange: boolean;
		attributeKeys?: Array<string>;
	} ];
};

/**
 * Fired when selection range(s) changed.
 *
 * @eventName ~Selection#change:range
 * @param directChange In case of {@link module:engine/model/selection~Selection} class it is always set
 * to `true` which indicates that the selection change was caused by a direct use of selection's API.
 * The {@link module:engine/model/documentselection~DocumentSelection}, however, may change because its position
 * was directly changed through the {@link module:engine/model/writer~Writer writer} or because its position was
 * changed because the structure of the model has been changed (which means an indirect change).
 * The indirect change does not occur in case of normal (detached) selections because they are "static" (as "not live")
 * which mean that they are not updated once the document changes.
 */
export type SelectionChangeRangeEvent = {
	name: 'change' | 'change:range';
	args: [ {
		directChange: boolean;
	} ];
};

/**
 * Fired when selection attribute changed.
 *
 * @eventName ~Selection#change:attribute
 * @param directChange In case of {@link module:engine/model/selection~Selection} class it is always set
 * to `true` which indicates that the selection change was caused by a direct use of selection's API.
 * The {@link module:engine/model/documentselection~DocumentSelection}, however, may change because its attributes
 * were directly changed through the {@link module:engine/model/writer~Writer writer} or because its position was
 * changed in the model and its attributes were refreshed (which means an indirect change).
 * The indirect change does not occur in case of normal (detached) selections because they are "static" (as "not live")
 * which mean that they are not updated once the document changes.
 * @param attributeKeys Array containing keys of attributes that changed.
 */
export type SelectionChangeAttributeEvent = {
	name: 'change' | 'change:attribute';
	args: [ {
		directChange: boolean;
		attributeKeys: Array<string>;
	} ];
};

/**
 * Checks whether the given element extends $block in the schema and has a parent (is not a root).
 * Marks it as already visited.
 */
function isUnvisitedBlock( element: Node | DocumentFragment, visited: WeakSet<Node | DocumentFragment> ) {
	if ( visited.has( element ) ) {
		return false;
	}

	visited.add( element );

	return element.root.document!.model.schema.isBlock( element ) && !!element.parent;
}

/**
 * Checks if the given element is a $block was not previously visited and is a top block in a range.
 */
function isUnvisitedTopBlock( element: Element, visited: WeakSet<Node | DocumentFragment>, range: Range ) {
	return isUnvisitedBlock( element, visited ) && isTopBlockInRange( element, range );
}

/**
 * Finds the lowest element in position's ancestors which is a block.
 * It will search until first ancestor that is a limit element.
 * Marks all ancestors as already visited to not include any of them later on.
 */
function getParentBlock( position: Position, visited: WeakSet<Node | DocumentFragment> ) {
	const element = position.parent;
	const schema = element.root.document!.model.schema;

	const ancestors = position.parent.getAncestors( { parentFirst: true, includeSelf: true } );

	let hasParentLimit = false;

	const block = ancestors.find( ( element ): element is Element => {
		// Stop searching after first parent node that is limit element.
		if ( hasParentLimit ) {
			return false;
		}

		hasParentLimit = schema.isLimit( element );

		return !hasParentLimit && isUnvisitedBlock( element, visited );
	} );

	// Mark all ancestors of this position's parent, because find() might've stopped early and
	// the found block may be a child of another block.
	ancestors.forEach( element => visited.add( element ) );

	return block;
}

/**
 * Checks if the blocks is not nested in other block inside a range.
 */
function isTopBlockInRange( block: Node, range: Range ) {
	const parentBlock = findAncestorBlock( block );

	if ( !parentBlock ) {
		return true;
	}

	// Add loose flag to check as parentRange can be equal to range.
	const isParentInRange = range.containsRange( Range._createOn( parentBlock ), true );

	return !isParentInRange;
}

/**
 * If a selection starts at the end of a block, that block is not returned as from the user's perspective this block wasn't selected.
 * See [#11585](https://github.com/ckeditor/ckeditor5/issues/11585) for more details.
 *
 * ```xml
 * <paragraph>a[</paragraph> // This block will not be returned
 * <paragraph>b</paragraph>
 * <paragraph>c]</paragraph>
 * ```
 *
 * Collapsed selection is not affected by it:
 *
 * ```xml
 * <paragraph>a[]</paragraph> // This block will be returned
 * ```
 */
function isStartBlockSelected( startBlock: Element | undefined, range: Range ): boolean {
	if ( !startBlock ) {
		return false;
	}

	if ( range.isCollapsed || startBlock.isEmpty ) {
		return true;
	}

	if ( range.start.isTouching( Position._createAt( startBlock, startBlock.maxOffset ) ) ) {
		return false;
	}

	return isTopBlockInRange( startBlock, range );
}

/**
 * If a selection ends at the beginning of a block, that block is not returned as from the user's perspective this block wasn't selected.
 * See [#984](https://github.com/ckeditor/ckeditor5-engine/issues/984) for more details.
 *
 * ```xml
 * <paragraph>[a</paragraph>
 * <paragraph>b</paragraph>
 * <paragraph>]c</paragraph> // this block will not be returned
 * ```
 *
 * Collapsed selection is not affected by it:
 *
 * ```xml
 * <paragraph>[]a</paragraph> // this block will be returned
 * ```
 */
function isEndBlockSelected( endBlock: Element | undefined, range: Range ): boolean {
	if ( !endBlock ) {
		return false;
	}

	if ( range.isCollapsed || endBlock.isEmpty ) {
		return true;
	}

	if ( range.end.isTouching( Position._createAt( endBlock, 0 ) ) ) {
		return false;
	}

	return isTopBlockInRange( endBlock, range );
}

/**
 * Returns first ancestor block of a node.
 */
function findAncestorBlock( node: Node | DocumentFragment ) {
	const schema = node.root.document!.model.schema;

	let parent = node.parent;

	while ( parent ) {
		if ( schema.isBlock( parent ) ) {
			return parent as Element;
		}

		parent = parent.parent;
	}
}

/**
 * An entity that is used to set selection.
 *
 * See also {@link module:engine/model/selection~Selection#setTo}.
 */
export type Selectable = Selection | DocumentSelection | Position | Range | Node | Iterable<Range> | null;

/**
 * The place or offset of the selection.
 */
export type PlaceOrOffset = number | 'before' | 'end' | 'after' | 'on' | 'in';
