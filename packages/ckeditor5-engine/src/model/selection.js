/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/selection
 */

import Position from './position';
import Element from './element';
import Range from './range';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import mapsEqual from '@ckeditor/ckeditor5-utils/src/mapsequal';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';

/**
 * `Selection` is a group of {@link module:engine/model/range~Range ranges} which has a direction specified by
 * {@link module:engine/model/selection~Selection#anchor anchor} and {@link module:engine/model/selection~Selection#focus focus}.
 * Additionally, `Selection` may have it's own attributes.
 */
export default class Selection {
	/**
	 * Creates new selection instance.
	 *
	 * @param {Iterable.<module:engine/view/range~Range>} [ranges] An optional iterable object of ranges to set.
	 * @param {Boolean} [isLastBackward] An optional flag describing if last added range was selected forward - from start to end
	 * (`false`) or backward - from end to start (`true`). Defaults to `false`.
	 */
	constructor( ranges, isLastBackward ) {
		/**
		 * Specifies whether the last added range was added as a backward or forward range.
		 *
		 * @private
		 * @member {Boolean}
		 */
		this._lastRangeBackward = false;

		/**
		 * Stores selection ranges.
		 *
		 * @protected
		 * @member {Array.<module:engine/model/range~Range>}
		 */
		this._ranges = [];

		/**
		 * List of attributes set on current selection.
		 *
		 * @protected
		 * @member {Map} module:engine/model/selection~Selection#_attrs
		 */
		this._attrs = new Map();

		if ( ranges ) {
			this.setRanges( ranges, isLastBackward );
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
	 * @type {Number}
	 */
	get rangeCount() {
		return this._ranges.length;
	}

	/**
	 * Specifies whether the {@link #focus}
	 * precedes {@link #anchor}.
	 *
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
	 * Returns an iterator that iterates over copies of selection ranges.
	 *
	 * @returns {Iterator.<module:engine/model/range~Range>}
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
	 * Adds a range to this selection. Added range is copied. This means that passed range is not saved in `Selection`
	 * instance and operating on it will not change `Selection` state.
	 *
	 * Accepts a flag describing in which way the selection is made - passed range might be selected from
	 * {@link module:engine/model/range~Range#start start} to {@link module:engine/model/range~Range#end end}
	 * or from {@link module:engine/model/range~Range#end end}
	 * to {@link module:engine/model/range~Range#start start}.
	 * The flag is used to set {@link #anchor} and
	 * {@link #focus} properties.
	 *
	 * @fires change:range
	 * @param {module:engine/model/range~Range} range Range to add.
	 * @param {Boolean} [isBackward=false] Flag describing if added range was selected forward - from start to end (`false`)
	 * or backward - from end to start (`true`).
	 */
	addRange( range, isBackward = false ) {
		this._pushRange( range );
		this._lastRangeBackward = !!isBackward;

		this.fire( 'change:range', { directChange: true } );
	}

	/**
	 * Removes all ranges that were added to the selection.
	 *
	 * @fires change:range
	 */
	removeAllRanges() {
		if ( this._ranges.length > 0 ) {
			this._removeAllRanges();
			this.fire( 'change:range', { directChange: true } );
		}
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link module:engine/model/selection~Selection#anchor} and
	 * {@link module:engine/model/selection~Selection#focus}. Accepts a flag describing in which direction the selection is made
	 * (see {@link module:engine/model/selection~Selection#addRange}).
	 *
	 * @fires change:range
	 * @param {Iterable.<module:engine/model/range~Range>} newRanges Ranges to set.
	 * @param {Boolean} [isLastBackward=false] Flag describing if last added range was selected forward - from start to end (`false`)
	 * or backward - from end to start (`true`).
	 */
	setRanges( newRanges, isLastBackward = false ) {
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
	 * Sets this selection's ranges and direction to the specified location based on the given
	 * {@link module:engine/model/selection~Selection selection}, {@link module:engine/model/position~Position position},
	 * {@link module:engine/model/range~Range range} or an iterable of {@link module:engine/model/range~Range ranges}.
	 *
	 * @param {module:engine/model/selection~Selection|module:engine/model/position~Position|
	 * Iterable.<module:engine/model/range~Range>|module:engine/model/range~Range} selectable
	 */
	setTo( selectable ) {
		if ( selectable instanceof Selection ) {
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
	 * @param {module:engine/model/element~Element} element
	 */
	setIn( element ) {
		this.setRanges( [ Range.createIn( element ) ] );
	}

	/**
	 * Sets this selection on the provided item.
	 *
	 * @param {module:engine/model/item~Item} item
	 */
	setOn( item ) {
		this.setRanges( [ Range.createOn( item ) ] );
	}

	/**
	 * Sets collapsed selection at the specified location.
	 *
	 * The location can be specified in the same form as {@link module:engine/model/position~Position.createAt} parameters.
	 *
	 * @fires change:range
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/model/item~Item model item}.
	 */
	setCollapsedAt( itemOrPosition, offset ) {
		const pos = Position.createAt( itemOrPosition, offset );
		const range = new Range( pos, pos );

		this.setRanges( [ range ] );
	}

	/**
	 * Collapses selection to the selection's {@link module:engine/model/selection~Selection#getFirstPosition first position}.
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
	 * Collapses selection to the selection's {@link module:engine/model/selection~Selection#getLastPosition last position}.
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
	 * Moves {@link module:engine/model/selection~Selection#focus} to the specified location.
	 *
	 * The location can be specified in the same form as {@link module:engine/model/position~Position.createAt} parameters.
	 *
	 * @fires change:range
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/model/item~Item model item}.
	 */
	moveFocusTo( itemOrPosition, offset ) {
		if ( this.anchor === null ) {
			/**
			 * Cannot set selection focus if there are no ranges in selection.
			 *
			 * @error model-selection-moveFocusTo-no-ranges
			 */
			throw new CKEditorError(
				'model-selection-moveFocusTo-no-ranges: Cannot set selection focus if there are no ranges in selection.'
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
			this.addRange( new Range( newFocus, anchor ), true );
		} else {
			this.addRange( new Range( anchor, newFocus ) );
		}
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
	 * Returns iterator that iterates over this selection's attributes.
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
	 * Returns iterator that iterates over this selection's attribute keys.
	 *
	 * @returns {Iterator.<String>}
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
	 * Removes all attributes from the selection.
	 *
	 * If there were any attributes in selection, fires the {@link #event:change} event with
	 * removed attributes' keys.
	 *
	 * @fires change:attribute
	 */
	clearAttributes() {
		if ( this._attrs.size > 0 ) {
			const attributeKeys = Array.from( this._attrs.keys() );
			this._attrs.clear();

			this.fire( 'change:attribute', { attributeKeys, directChange: true } );
		}
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
	 * Removes all attributes from the selection and sets given attributes.
	 *
	 * If given set of attributes is different than set of attributes already added to selection, fires
	 * {@link #event:change change event} with keys of attributes that changed.
	 *
	 * @fires event:change:attribute
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set.
	 */
	setAttributesTo( attrs ) {
		attrs = toMap( attrs );

		if ( !mapsEqual( attrs, this._attrs ) ) {
			// Create a set from keys of old and new attributes.
			const changed = new Set( Array.from( attrs.keys() ).concat( Array.from( this._attrs.keys() ) ) );

			for ( const [ key, value ] of attrs ) {
				// If the attribute remains unchanged, remove it from changed set.
				if ( this._attrs.get( key ) === value ) {
					changed.delete( key );
				}
			}

			this._attrs = attrs;

			this.fire( 'change:attribute', { attributeKeys: Array.from( changed ), directChange: true } );
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
	 * @returns {Iterator.<module:engine/model/element~Element>}
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
	 * Creates and returns an instance of `Selection` that is a clone of given selection, meaning that it has same
	 * ranges and same direction as this selection.
	 *
	 * @params {module:engine/model/selection~Selection} otherSelection Selection to be cloned.
	 * @returns {module:engine/model/selection~Selection} `Selection` instance that is a clone of given selection.
	 */
	static createFromSelection( otherSelection ) {
		const selection = new this();
		selection.setTo( otherSelection );

		return selection;
	}

	/**
	 * Adds given range to internal {@link #_ranges ranges array}. Throws an error
	 * if given range is intersecting with any range that is already stored in this selection.
	 *
	 * @protected
	 * @param {module:engine/model/range~Range} range Range to add.
	 */
	_pushRange( range ) {
		if ( !( range instanceof Range ) ) {
			throw new CKEditorError( 'model-selection-added-not-range: Trying to add an object that is not an instance of Range.' );
		}

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
				 * @error selection-range-intersects
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
	 * Removes most recently added range from the selection.
	 *
	 * @protected
	 */
	_popRange() {
		this._ranges.pop();
	}

	/**
	 * Deletes ranges from internal range array. Uses {@link #_popRange _popRange} to
	 * ensure proper ranges removal.
	 *
	 * @private
	 */
	_removeAllRanges() {
		while ( this._ranges.length > 0 ) {
			this._popRange();
		}
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

	// TODO https://github.com/ckeditor/ckeditor5-engine/issues/532#issuecomment-278900072.
	// This should not be a `$block` check.
	return element.document.schema.itemExtends( element.name, '$block' ) && element.parent;
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
