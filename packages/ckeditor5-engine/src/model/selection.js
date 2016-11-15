/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Position from './position.js';
import Range from './range.js';
import EmitterMixin from '../../utils/emittermixin.js';
import CKEditorError from '../../utils/ckeditorerror.js';
import mix from '../../utils/mix.js';
import toMap from '../../utils/tomap.js';
import mapsEqual from '../../utils/mapsequal.js';

/**
 * `Selection` is a group of {@link engine.model.Range ranges} which has a direction specified by
 * {@link engine.model.Selection#anchor anchor} and {@link engine.model.Selection#focus focus}. Additionally,
 * `Selection` may have it's own attributes.
 *
 * @memberOf engine.model
 */
export default class Selection {
	/**
	 * Creates an empty selection.
	 */
	constructor() {
		/**
		 * Specifies whether the last added range was added as a backward or forward range.
		 *
		 * @private
		 * @member {Boolean} engine.model.Selection#_lastRangeBackward
		 */
		this._lastRangeBackward = false;

		/**
		 * Stores selection ranges.
		 *
		 * @protected
		 * @member {Array.<engine.model.Range>} engine.model.Selection#_ranges
		 */
		this._ranges = [];

		/**
		 * List of attributes set on current selection.
		 *
		 * @protected
		 * @member {Map} engine.model.LiveSelection#_attrs
		 */
		this._attrs = new Map();
	}

	/**
	 * Selection anchor. Anchor may be described as a position where the most recent part of the selection starts.
	 * Together with {@link engine.model.Selection#focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. Anchor is always {@link engine.model.Range#start start} or
	 * {@link engine.model.Range#end end} position of the most recently added range.
	 *
	 * Is set to `null` if there are no ranges in selection.
	 *
	 * @see engine.model.Selection#focus
	 * @readonly
	 * @type {engine.model.Position|null}
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
	 * @see engine.model.Selection#anchor
	 * @readonly
	 * @type {engine.model.Position|null}
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
	 * Specifies whether the {@link engine.model.Selection#focus} precedes {@link engine.model.Selection#anchor}.
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
	 * @param {engine.model.Selection} otherSelection Selection to compare with.
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
	 * Returns an iterator that iterates over copies of selection ranges.
	 *
	 * @returns {Iterator.<engine.model.Range>}
	 */
	*getRanges() {
		for ( let range of this._ranges ) {
			yield Range.createFromRange( range );
		}
	}

	/**
	 * Returns a copy of the first range in the selection. First range is the one which {@link engine.model.Range#start start} position
	 * {@link engine.model.Position#isBefore is before} start position of all other ranges (not to confuse with the first range
	 * added to the selection).
	 *
	 * Returns `null` if there are no ranges in selection.
	 *
	 * @returns {engine.model.Range|null}
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
	 * Returns a copy of the last range in the selection. Last range is the one which {@link engine.model.Range#end end} position
	 * {@link engine.model.Position#isAfter is after} end position of all other ranges (not to confuse with the range most
	 * recently added to the selection).
	 *
	 * Returns `null` if there are no ranges in selection.
	 *
	 * @returns {engine.model.Range|null}
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
	 * Returns the first position in the selection. First position is the position that {@link engine.model.Position#isBefore is before}
	 * any other position in the selection.
	 *
	 * Returns `null` if there are no ranges in selection.
	 *
	 * @returns {engine.model.Position|null}
	 */
	getFirstPosition() {
		const first = this.getFirstRange();

		return first ? Position.createFromPosition( first.start ) : null;
	}

	/**
	 * Returns the last position in the selection. Last position is the position that {@link engine.model.Position#isAfter is after}
	 * any other position in the selection.
	 *
	 * Returns `null` if there are no ranges in selection.
	 *
	 * @returns {engine.model.Position|null}
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
	 * {@link engine.model.Range#start start} to {@link engine.model.Range#end end} or from {@link engine.model.Range#end end}
	 * to {@link engine.model.Range#start start}. The flag is used to set {@link engine.model.Selection#anchor} and
	 * {@link engine.model.Selection#focus} properties.
	 *
	 * @fires engine.model.Selection#change:range
	 * @param {engine.model.Range} range Range to add.
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
	 * @fires engine.model.Selection#change:range
	 */
	removeAllRanges() {
		if ( this._ranges.length > 0 ) {
			this._removeAllRanges();
			this.fire( 'change:range', { directChange: true } );
		}
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link engine.model.Selection#anchor} and
	 * {@link engine.model.Selection#focus}. Accepts a flag describing in which direction the selection is made
	 * (see {@link engine.model.Selection#addRange}).
	 *
	 * @fires engine.model.Selection#change:range
	 * @param {Iterable.<engine.model.Range>} newRanges Ranges to set.
	 * @param {Boolean} [isLastBackward=false] Flag describing if last added range was selected forward - from start to end (`false`)
	 * or backward - from end to start (`true`).
	 */
	setRanges( newRanges, isLastBackward = false ) {
		newRanges = Array.from( newRanges );

		// Check whether there is any range in new ranges set that is different than all already added ranges.
		const anyNewRange = newRanges.some( ( newRange ) => {
			if ( !( newRange instanceof Range ) ) {
				throw new CKEditorError( 'model-selection-added-not-range: Trying to add an object that is not an instance of Range.' );
			}

			return this._ranges.every( ( oldRange ) => {
				return !oldRange.isEqual( newRange );
			} );
		} );

		// Don't do anything if nothing changed.
		if ( newRanges.length === this._ranges.length && !anyNewRange ) {
			return;
		}

		this._removeAllRanges();

		for ( let range of newRanges ) {
			this._pushRange( range );
		}

		this._lastRangeBackward = !!isLastBackward;

		this.fire( 'change:range', { directChange: true } );
	}

	/**
	 * Sets this selection's ranges and direction to the ranges and direction of the given selection.
	 *
	 * @param {engine.model.Selection} otherSelection
	 */
	setTo( otherSelection ) {
		this.setRanges( otherSelection.getRanges(), otherSelection.isBackward );
	}

	/**
	 * Sets collapsed selection in the specified location.
	 *
	 * The location can be specified in the same form as {@link engine.model.Position.createAt} parameters.
	 *
	 * @fires engine.model.Selection#change:range
	 * @param {engine.model.Item|engine.model.Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link engine.model.Item model item}.
	 */
	collapse( itemOrPosition, offset ) {
		const pos = Position.createAt( itemOrPosition, offset );
		const range = new Range( pos, pos );

		this.setRanges( [ range ] );
	}

	/**
	 * Collapses selection to the selection's {@link engine.model.Selection#getFirstPosition first position}.
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
	 * Collapses selection to the selection's {@link engine.model.Selection#getLastPosition last position}.
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
	 * Sets {@link engine.model.Selection#focus} to the specified location.
	 *
	 * The location can be specified in the same form as {@link engine.model.Position.createAt} parameters.
	 *
	 * @fires engine.model.Selection#change:range
	 * @param {engine.model.Item|engine.model.Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link engine.model.Item model item}.
	 */
	setFocus( itemOrPosition, offset ) {
		if ( this.anchor === null ) {
			/**
			 * Cannot set selection focus if there are no ranges in selection.
			 *
			 * @error model-selection-setFocus-no-ranges
			 */
			throw new CKEditorError( 'model-selection-setFocus-no-ranges: Cannot set selection focus if there are no ranges in selection.' );
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
	 * If there were any attributes in selection, fires the {@link engine.model.Selection#change} event with
	 * removed attributes' keys.
	 *
	 * @fires engine.model.Selection#change:attribute
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
	 * If given attribute was set on the selection, fires the {@link engine.model.Selection#change} event with
	 * removed attribute key.
	 *
	 * @fires engine.model.Selection#change:attribute
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
	 * If the attribute value has changed, fires the {@link engine.model.Selection#change} event with
	 * the attribute key.
	 *
	 * @fires engine.model.Selection#change:attribute
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
	 * {@link engine.model.Selection#change change event} with keys of attributes that changed.
	 *
	 * @fires engine.model.Selection#change:attribute
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set.
	 */
	setAttributesTo( attrs ) {
		attrs = toMap( attrs );

		if ( !mapsEqual( attrs, this._attrs ) ) {
			// Create a set from keys of old and new attributes.
			const changed = new Set( Array.from( attrs.keys() ).concat( Array.from( this._attrs.keys() ) ) );

			for ( let [ key, value ] of attrs ) {
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
	 * Creates and returns an instance of `Selection` that is a clone of given selection, meaning that it has same
	 * ranges and same direction as this selection.
	 *
	 * @params {engine.model.Selection} otherSelection Selection to be cloned.
	 * @returns {engine.model.Selection} `Selection` instance that is a clone of given selection.
	 */
	static createFromSelection( otherSelection ) {
		const selection = new this();
		selection.setTo( otherSelection );

		return selection;
	}

	/**
	 * Adds given range to internal {@link engine.model.Selection#_ranges ranges array}. Throws an error
	 * if given range is intersecting with any range that is already stored in this selection.
	 *
	 * @protected
	 * @param {engine.model.Range} range Range to add.
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
	 * @param {engine.model.Range} range Range to check.
	 */
	_checkRange( range ) {
		for ( let i = 0; i < this._ranges.length; i++ ) {
			if ( range.isIntersecting( this._ranges[ i ] ) ) {
				/**
				 * Trying to add a range that intersects with another range from selection.
				 *
				 * @error selection-range-intersects
				 * @param {engine.model.Range} addedRange Range that was added to the selection.
				 * @param {engine.model.Range} intersectingRange Range from selection that intersects with `addedRange`.
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
	 * Deletes ranges from internal range array. Uses {@link engine.model.Selection#_popRange _popRange} to
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
	 * Fired whenever selection ranges are changed.
	 *
	 * @event engine.model.Selection#change:range
	 * @param {Boolean} directChange Specifies whether the range change was caused by direct usage of `Selection` API (`true`)
	 * or by changes done to {@link engine.model.Document model document} using {@link engine.model.Batch Batch} API (`false`).
	 */

	/**
	 * Fired whenever selection attributes are changed.
	 *
	 * @event engine.model.Selection#change:attribute
	 * @param {Boolean} directChange Specifies whether the attributes changed by direct usage of the Selection API (`true`)
	 * or by changes done to the {@link engine.model.Document model document} using the {@link engine.model.Batch Batch} API (`false`).
	 * @param {Array.<String>} attributeKeys Array containing keys of attributes that changed.
	 */
}

mix( Selection, EmitterMixin );
