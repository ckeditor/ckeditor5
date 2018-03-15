/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/selection
 */

import Position from './position';
import Element from './element';
import Node from './node';
import Range from './range';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';

/**
 * `Selection` is a group of {@link module:engine/model/range~Range ranges} which has a direction specified by
 * {@link module:engine/model/selection~Selection#anchor anchor} and {@link module:engine/model/selection~Selection#focus focus}.
 * Additionally, `Selection` may have it's own attributes.
 *
 * @mixes {module:utils/emittermixin~EmitterMixin}
 */
export default class Selection {
	/**
	 * Creates new selection instance on the given
	 * {@link module:engine/model/selection~Selection selection}, {@link module:engine/model/position~Position position},
	 * {@link module:engine/model/element~Element element}, {@link module:engine/model/position~Position position},
	 * {@link module:engine/model/range~Range range}, an iterable of {@link module:engine/model/range~Range ranges}
	 * or creates an empty selection if no arguments passed.
	 *
	 * 		// Creates empty selection without ranges.
	 *		const selection = new Selection();
	 *
	 *		// Creates selection at the given range.
	 *		const range = new Range( start, end );
	 *		const selection = new Selection( range );
	 *
	 *		// Creates selection at the given ranges
	 * 		const ranges = [ new Range( start1, end2 ), new Range( star2, end2 ) ];
	 *		const selection = new Selection( ranges );
	 *
	 *		// Creates selection from the other selection.
	 *		// Note: It doesn't copies selection attributes.
	 *		const otherSelection = new Selection();
	 *		const selection = new Selection( otherSelection );
	 *
	 * 		// Creates selection from the given document selection.
	 *		// Note: It doesn't copies selection attributes.
	 *		const documentSelection = new DocumentSelection( doc );
	 *		const selection = new Selection( documentSelection );
	 *
	 * 		// Creates selection at the given position.
	 *		const position = new Position( root, path );
	 *		const selection = new Selection( position );
	 *
	 * 		// Creates selection at the start position of the given element.
	 *		const paragraph = writer.createElement( 'paragraph' );
	 *		const selection = new Selection( paragraph, offset );
	 *
	 * 		// Creates a range inside an {@link module:engine/model/element~Element element} which starts before the
	 * 		// first child of that element and ends after the last child of that element.
	 *		const selection = new Selection( paragraph, 'in' );
	 *
	 * 		// Creates a range on an {@link module:engine/model/item~Item item} which starts before the item and ends
	 * 		// just after the item.
	 *		const selection = new Selection( paragraph, 'on' );
	 *
	 * `Selection`'s constructor allow passing additional options (`backward`) as the last argument.
	 *
	 * 		// Creates backward selection.
	 *		const selection = new Selection( range, { backward: true } );
	 *
	 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection|
	 * module:engine/model/position~Position|module:engine/model/element~Element|
	 * Iterable.<module:engine/model/range~Range>|module:engine/model/range~Range|null} selectable
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Sets place or offset of the selection.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 */
	constructor( selectable, placeOrOffset, options ) {
		/**
		 * Specifies whether the last added range was added as a backward or forward range.
		 *
		 * @private
		 * @type {Boolean}
		 */
		this._lastRangeBackward = false;

		/**
		 * Stores selection ranges.
		 *
		 * @protected
		 * @type {Array.<module:engine/model/range~Range>}
		 */
		this._ranges = [];

		/**
		 * List of attributes set on current selection.
		 *
		 * @protected
		 * @type {Map.<String,*>}
		 */
		this._attrs = new Map();

		if ( selectable ) {
			this.setTo( selectable, placeOrOffset, options );
		}
	}

	/**
	 * Selection anchor. Anchor may be described as a position where the most recent part of the selection starts.
	 * Together with {@link #focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. Anchor is always {@link module:engine/model/range~Range#start start} or
	 * {@link module:engine/model/range~Range#end end} position of the most recently added range.
	 *
	 * Is set to `null` if there are no ranges in selection.
	 *
	 * @see #focus
	 * @readonly
	 * @type {module:engine/model/position~Position|null}
	 */
	get anchor() {
		if ( this._ranges.length > 0 ) {
			const range = this._ranges[ this._ranges.length - 1 ];

			return this._lastRangeBackward ? range.end : range.start;
		}

		return null;
	}

	/**
	 * Selection focus. Focus is a position where the selection ends.
	 *
	 * Is set to `null` if there are no ranges in selection.
	 *
	 * @see #anchor
	 * @readonly
	 * @type {module:engine/model/position~Position|null}
	 */
	get focus() {
		if ( this._ranges.length > 0 ) {
			const range = this._ranges[ this._ranges.length - 1 ];

			return this._lastRangeBackward ? range.start : range.end;
		}

		return null;
	}

	/**
	 * Returns whether the selection is collapsed. Selection is collapsed when there is exactly one range which is
	 * collapsed.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isCollapsed() {
		const length = this._ranges.length;

		if ( length === 1 ) {
			return this._ranges[ 0 ].isCollapsed;
		} else {
			return false;
		}
	}

	/**
	 * Returns number of ranges in selection.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get rangeCount() {
		return this._ranges.length;
	}

	/**
	 * Specifies whether the {@link #focus}
	 * precedes {@link #anchor}.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isBackward() {
		return !this.isCollapsed && this._lastRangeBackward;
	}

	/**
	 * Checks whether this selection is equal to given selection. Selections are equal if they have same directions,
	 * same number of ranges and all ranges from one selection equal to a range from other selection.
	 *
	 * @param {module:engine/model/selection~Selection} otherSelection Selection to compare with.
	 * @returns {Boolean} `true` if selections are equal, `false` otherwise.
	 */
	isEqual( otherSelection ) {
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
	 * Returns an iterable that iterates over copies of selection ranges.
	 *
	 * @returns {Iterable.<module:engine/model/range~Range>}
	 */
	* getRanges() {
		for ( const range of this._ranges ) {
			yield Range.createFromRange( range );
		}
	}

	/**
	 * Returns a copy of the first range in the selection.
	 * First range is the one which {@link module:engine/model/range~Range#start start} position
	 * {@link module:engine/model/position~Position#isBefore is before} start position of all other ranges
	 * (not to confuse with the first range added to the selection).
	 *
	 * Returns `null` if there are no ranges in selection.
	 *
	 * @returns {module:engine/model/range~Range|null}
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
	 * Returns a copy of the last range in the selection.
	 * Last range is the one which {@link module:engine/model/range~Range#end end} position
	 * {@link module:engine/model/position~Position#isAfter is after} end position of all other ranges (not to confuse with the range most
	 * recently added to the selection).
	 *
	 * Returns `null` if there are no ranges in selection.
	 *
	 * @returns {module:engine/model/range~Range|null}
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
	 * Returns the first position in the selection.
	 * First position is the position that {@link module:engine/model/position~Position#isBefore is before}
	 * any other position in the selection.
	 *
	 * Returns `null` if there are no ranges in selection.
	 *
	 * @returns {module:engine/model/position~Position|null}
	 */
	getFirstPosition() {
		const first = this.getFirstRange();

		return first ? Position.createFromPosition( first.start ) : null;
	}

	/**
	 * Returns the last position in the selection.
	 * Last position is the position that {@link module:engine/model/position~Position#isAfter is after}
	 * any other position in the selection.
	 *
	 * Returns `null` if there are no ranges in selection.
	 *
	 * @returns {module:engine/model/position~Position|null}
	 */
	getLastPosition() {
		const lastRange = this.getLastRange();

		return lastRange ? Position.createFromPosition( lastRange.end ) : null;
	}

	/**
	 * Sets this selection's ranges and direction to the specified location based on the given
	 * {@link module:engine/model/selection~Selection selection}, {@link module:engine/model/position~Position position},
	 * {@link module:engine/model/element~Element element}, {@link module:engine/model/position~Position position},
	 * {@link module:engine/model/range~Range range}, an iterable of {@link module:engine/model/range~Range ranges} or null.
	 *
	 * 		// Removes all selection's ranges.
	 *		selection.setTo( null );
	 *
	 *		// Sets selection to the given range.
	 *		const range = new Range( start, end );
	 *		selection.setTo( range );
	 *
	 *		// Sets selection to given ranges.
	 * 		const ranges = [ new Range( start1, end2 ), new Range( star2, end2 ) ];
	 *		selection.setTo( ranges );
	 *
	 *		// Sets selection to other selection.
	 *		// Note: It doesn't copies selection attributes.
	 *		const otherSelection = new Selection();
	 *		selection.setTo( otherSelection );
	 *
	 * 		// Sets selection to the given document selection.
	 *		// Note: It doesn't copies selection attributes.
	 *		const documentSelection = new DocumentSelection( doc );
	 *		selection.setTo( documentSelection );
	 *
	 * 		// Sets collapsed selection at the given position.
	 *		const position = new Position( root, path );
	 *		selection.setTo( position );
	 *
	 * 		// Sets collapsed selection at the position of the given node and an offset.
	 *		selection.setTo( paragraph, offset );
	 *
	 * Creates a range inside an {@link module:engine/model/element~Element element} which starts before the first child of
 	 * that element and ends after the last child of that element.
	 *
	 *		selection.setTo( paragraph, 'in' );
	 *
	 * Creates a range on an {@link module:engine/model/item~Item item} which starts before the item and ends just after the item.
	 *
	 *		selection.setTo( paragraph, 'on' );
	 *
	 * `Selection#setTo()`' method allow passing additional options (`backward`) as the last argument.
	 *
	 * 		// Sets backward selection.
	 *		const selection = new Selection( range, { backward: true } );
	 *
	 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection|
	 * module:engine/model/position~Position|module:engine/model/node~Node|
	 * Iterable.<module:engine/model/range~Range>|module:engine/model/range~Range|null} selectable
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Sets place or offset of the selection.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 */
	setTo( selectable, placeOrOffset, options ) {
		if ( selectable === null ) {
			this._setRanges( [] );
		} else if ( selectable instanceof Selection ) {
			this._setRanges( selectable.getRanges(), selectable.isBackward );
		} else if ( selectable && typeof selectable.getRanges == 'function' ) {
			// We assume that the selectable is a DocumentSelection.
			// It can't be imported here, because it would lead to circular imports.
			this._setRanges( selectable.getRanges(), selectable.isBackward );
		} else if ( selectable instanceof Range ) {
			this._setRanges( [ selectable ], !!placeOrOffset && !!placeOrOffset.backward );
		} else if ( selectable instanceof Position ) {
			this._setRanges( [ new Range( selectable ) ] );
		} else if ( selectable instanceof Node ) {
			const backward = !!options && !!options.backward;
			let range;

			if ( placeOrOffset == 'in' ) {
				range = Range.createIn( selectable );
			} else if ( placeOrOffset == 'on' ) {
				range = Range.createOn( selectable );
			} else if ( placeOrOffset !== undefined ) {
				range = Range.createCollapsedAt( selectable, placeOrOffset );
			} else {
				/**
				 * selection.setTo requires the second parameter when the first parameter is a node.
				 *
				 * @error model-selection-setTo-required-second-parameter
				 */
				throw new CKEditorError(
					'model-selection-setTo-required-second-parameter: ' +
					'selection.setTo requires the second parameter when the first parameter is a node.' );
			}

			this._setRanges( [ range ], backward );
		} else if ( isIterable( selectable ) ) {
			// We assume that the selectable is an iterable of ranges.
			this._setRanges( selectable, placeOrOffset && !!placeOrOffset.backward );
		} else {
			/**
			 * Cannot set selection to given place.
			 *
			 * @error model-selection-setTo-not-selectable
			 */
			throw new CKEditorError( 'model-selection-setTo-not-selectable: Cannot set selection to given place.' );
		}
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link module:engine/model/selection~Selection#anchor} and
	 * {@link module:engine/model/selection~Selection#focus}. Accepts a flag describing in which direction the selection is made.
	 *
	 * @protected
	 * @fires change:range
	 * @param {Iterable.<module:engine/model/range~Range>} newRanges Ranges to set.
	 * @param {Boolean} [isLastBackward=false] Flag describing if last added range was selected forward - from start to end (`false`)
	 * or backward - from end to start (`true`).
	 */
	_setRanges( newRanges, isLastBackward = false ) {
		newRanges = Array.from( newRanges );

		// Check whether there is any range in new ranges set that is different than all already added ranges.
		const anyNewRange = newRanges.some( newRange => {
			if ( !( newRange instanceof Range ) ) {
				throw new CKEditorError( 'model-selection-added-not-range: Trying to add an object that is not an instance of Range.' );
			}

			return this._ranges.every( oldRange => {
				return !oldRange.isEqual( newRange );
			} );
		} );

		// Don't do anything if nothing changed.
		if ( newRanges.length === this._ranges.length && !anyNewRange ) {
			return;
		}

		this._removeAllRanges();

		for ( const range of newRanges ) {
			this._pushRange( range );
		}

		this._lastRangeBackward = !!isLastBackward;

		this.fire( 'change:range', { directChange: true } );
	}

	/**
	 * Moves {@link module:engine/model/selection~Selection#focus} to the specified location.
	 *
	 * The location can be specified in the same form as {@link module:engine/model/position~Position.createAt} parameters.
	 *
	 * @fires change:range
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/model/item~Item model item}.
	 */
	setFocus( itemOrPosition, offset ) {
		if ( this.anchor === null ) {
			/**
			 * Cannot set selection focus if there are no ranges in selection.
			 *
			 * @error model-selection-setFocus-no-ranges
			 */
			throw new CKEditorError(
				'model-selection-setFocus-no-ranges: Cannot set selection focus if there are no ranges in selection.'
			);
		}

		const newFocus = Position.createAt( itemOrPosition, offset );

		if ( newFocus.compareWith( this.focus ) == 'same' ) {
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

		this.fire( 'change:range', { directChange: true } );
	}

	/**
	 * Gets an attribute value for given key or `undefined` if that attribute is not set on the selection.
	 *
	 * @param {String} key Key of attribute to look for.
	 * @returns {*} Attribute value or `undefined`.
	 */
	getAttribute( key ) {
		return this._attrs.get( key );
	}

	/**
	 * Returns iterable that iterates over this selection's attributes.
	 *
	 * Attributes are returned as arrays containing two items. First one is attribute key and second is attribute value.
	 * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
	 *
	 * @returns {Iterable.<*>}
	 */
	getAttributes() {
		return this._attrs.entries();
	}

	/**
	 * Returns iterable that iterates over this selection's attribute keys.
	 *
	 * @returns {Iterable.<String>}
	 */
	getAttributeKeys() {
		return this._attrs.keys();
	}

	/**
	 * Checks if the selection has an attribute for given key.
	 *
	 * @param {String} key Key of attribute to check.
	 * @returns {Boolean} `true` if attribute with given key is set on selection, `false` otherwise.
	 */
	hasAttribute( key ) {
		return this._attrs.has( key );
	}

	/**
	 * Removes an attribute with given key from the selection.
	 *
	 * If given attribute was set on the selection, fires the {@link #event:change} event with
	 * removed attribute key.
	 *
	 * @fires change:attribute
	 * @param {String} key Key of attribute to remove.
	 */
	removeAttribute( key ) {
		if ( this.hasAttribute( key ) ) {
			this._attrs.delete( key );

			this.fire( 'change:attribute', { attributeKeys: [ key ], directChange: true } );
		}
	}

	/**
	 * Sets attribute on the selection. If attribute with the same key already is set, it's value is overwritten.
	 *
	 * If the attribute value has changed, fires the {@link #event:change} event with
	 * the attribute key.
	 *
	 * @fires change:attribute
	 * @param {String} key Key of attribute to set.
	 * @param {*} value Attribute value.
	 */
	setAttribute( key, value ) {
		if ( this.getAttribute( key ) !== value ) {
			this._attrs.set( key, value );

			this.fire( 'change:attribute', { attributeKeys: [ key ], directChange: true } );
		}
	}

	/**
	 * Returns the selected element. {@link module:engine/model/element~Element Element} is considered as selected if there is only
	 * one range in the selection, and that range contains exactly one element.
	 * Returns `null` if there is no selected element.
	 *
	 * @returns {module:engine/model/element~Element|null}
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
	 * Gets elements of type "block" touched by the selection.
	 *
	 * This method's result can be used for example to apply block styling to all blocks covered by this selection.
	 *
	 * **Note:** `getSelectedBlocks()` always returns the deepest block.
	 *
	 * In this case the function will return exactly all 3 paragraphs:
	 *
	 *		<paragraph>[a</paragraph>
	 *		<quote>
	 *			<paragraph>b</paragraph>
	 *		</quote>
	 *		<paragraph>c]d</paragraph>
	 *
	 * In this case the paragraph will also be returned, despite the collapsed selection:
	 *
	 *		<paragraph>[]a</paragraph>
	 *
	 * **Special case**: If a selection ends at the beginning of a block, that block is not returned as from user perspective
	 * this block wasn't selected. See [#984](https://github.com/ckeditor/ckeditor5-engine/issues/984) for more details.
	 *
	 *		<paragraph>[a</paragraph>
	 *		<paragraph>b</paragraph>
	 *		<paragraph>]c</paragraph> // this block will not be returned
	 *
	 * @returns {Iterable.<module:engine/model/element~Element>}
	 */
	* getSelectedBlocks() {
		const visited = new WeakSet();

		for ( const range of this.getRanges() ) {
			const startBlock = getParentBlock( range.start, visited );

			if ( startBlock ) {
				yield startBlock;
			}

			for ( const value of range.getWalker() ) {
				if ( value.type == 'elementEnd' && isUnvisitedBlockContainer( value.item, visited ) ) {
					yield value.item;
				}
			}

			const endBlock = getParentBlock( range.end, visited );

			// #984. Don't return the end block if the range ends right at its beginning.
			if ( endBlock && !range.end.isTouching( Position.createAt( endBlock ) ) ) {
				yield endBlock;
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
	 *
	 * @param {module:engine/model/element~Element} [element=this.anchor.root]
	 * @returns {Boolean}
	 */
	containsEntireContent( element = this.anchor.root ) {
		const limitStartPosition = Position.createAt( element );
		const limitEndPosition = Position.createAt( element, 'end' );

		return limitStartPosition.isTouching( this.getFirstPosition() ) &&
			limitEndPosition.isTouching( this.getLastPosition() );
	}

	/**
	 * Adds given range to internal {@link #_ranges ranges array}. Throws an error
	 * if given range is intersecting with any range that is already stored in this selection.
	 *
	 * @protected
	 * @param {module:engine/model/range~Range} range Range to add.
	 */
	_pushRange( range ) {
		this._checkRange( range );
		this._ranges.push( Range.createFromRange( range ) );
	}

	/**
	 * Checks if given range intersects with ranges that are already in the selection. Throws an error if it does.
	 *
	 * @protected
	 * @param {module:engine/model/range~Range} range Range to check.
	 */
	_checkRange( range ) {
		for ( let i = 0; i < this._ranges.length; i++ ) {
			if ( range.isIntersecting( this._ranges[ i ] ) ) {
				/**
				 * Trying to add a range that intersects with another range from selection.
				 *
				 * @error model-selection-range-intersects
				 * @param {module:engine/model/range~Range} addedRange Range that was added to the selection.
				 * @param {module:engine/model/range~Range} intersectingRange Range from selection that intersects with `addedRange`.
				 */
				throw new CKEditorError(
					'model-selection-range-intersects: Trying to add a range that intersects with another range from selection.',
					{ addedRange: range, intersectingRange: this._ranges[ i ] }
				);
			}
		}
	}

	/**
	 * Deletes ranges from internal range array. Uses {@link #_popRange _popRange} to
	 * ensure proper ranges removal.
	 *
	 * @protected
	 */
	_removeAllRanges() {
		while ( this._ranges.length > 0 ) {
			this._popRange();
		}
	}

	/**
	 * Removes most recently added range from the selection.
	 *
	 * @protected
	 */
	_popRange() {
		this._ranges.pop();
	}

	/**
	 * @event change
	 */

	/**
	 * Fired whenever selection ranges are changed.
	 *
	 * @event change:range
	 * @param {Boolean} directChange Specifies whether the range change was caused by direct usage of `Selection` API (`true`)
	 * or by changes done to {@link module:engine/model/document~Document model document}
	 * using {@link module:engine/model/batch~Batch Batch} API (`false`).
	 */

	/**
	 * Fired whenever selection attributes are changed.
	 *
	 * @event change:attribute
	 * @param {Boolean} directChange Specifies whether the attributes changed by direct usage of the Selection API (`true`)
	 * or by changes done to the {@link module:engine/model/document~Document model document}
	 * using the {@link module:engine/model/batch~Batch Batch} API (`false`).
	 * @param {Array.<String>} attributeKeys Array containing keys of attributes that changed.
	 */
}

mix( Selection, EmitterMixin );

// Checks whether the given element extends $block in the schema and has a parent (is not a root).
// Marks it as already visited.
function isUnvisitedBlockContainer( element, visited ) {
	if ( visited.has( element ) ) {
		return false;
	}

	visited.add( element );

	return element.document.model.schema.isBlock( element ) && element.parent;
}

// Finds the lowest element in position's ancestors which is a block.
// Marks all ancestors as already visited to not include any of them later on.
function getParentBlock( position, visited ) {
	const ancestors = position.parent.getAncestors( { parentFirst: true, includeSelf: true } );
	const block = ancestors.find( element => isUnvisitedBlockContainer( element, visited ) );

	// Mark all ancestors of this position's parent, because find() might've stopped early and
	// the found block may be a child of another block.
	ancestors.forEach( element => visited.add( element ) );

	return block;
}
