/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from './position.js';
import Range from './range.js';
import EmitterMixin from '../../utils/emittermixin.js';
import CKEditorError from '../../utils/ckeditorerror.js';
import mix from '../../utils/mix.js';
import toMap from '../../utils/tomap.js';

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
	 * Checks whether, this selection is equal to given selection. Selections equal if they have the same ranges and directions.
	 *
	 * @param {engine.model.Selection} otherSelection Selection to compare with.
	 * @returns {Boolean} `true` if selections are equal, `false` otherwise.
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

		return this.isBackward === otherSelection.isBackward;
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

		this.fire( 'change:range' );
	}

	/**
	 * Removes all ranges that were added to the selection.
	 *
	 * @fires engine.model.Selection#change:range
	 */
	removeAllRanges() {
		this._ranges = [];

		this.fire( 'change:range' );
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
	setRanges( newRanges, isLastBackward ) {
		this._ranges = [];

		for ( let range of newRanges ) {
			if ( !( range instanceof Range ) ) {
				throw new CKEditorError( 'selection-invalid-range: Invalid Range.' );
			}

			this._pushRange( range );
		}

		this._lastRangeBackward = !!isLastBackward;

		this.fire( 'change:range' );
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
	 * @fires engine.model.Selection#change:attribute
	 */
	clearAttributes() {
		this._attrs.clear();

		this.fire( 'change:attribute' );
	}

	/**
	 * Removes an attribute with given key from the selection.
	 *
	 * @fires engine.model.Selection#change:attribute
	 * @param {String} key Key of attribute to remove.
	 */
	removeAttribute( key ) {
		this._attrs.delete( key );

		this.fire( 'change:attribute' );
	}

	/**
	 * Sets attribute on the selection. If attribute with the same key already is set, it's value is overwritten.
	 *
	 * @fires engine.model.Selection#change:attribute
	 * @param {String} key Key of attribute to set.
	 * @param {*} value Attribute value.
	 */
	setAttribute( key, value ) {
		this._attrs.set( key, value );

		this.fire( 'change:attribute' );
	}

	/**
	 * Removes all attributes from the selection and sets given attributes.
	 *
	 * @fires engine.model.Selection#change:attribute
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set.
	 */
	setAttributesTo( attrs ) {
		this._attrs = toMap( attrs );

		this.fire( 'change:attribute' );
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
			 * @error selection-setFocus-no-ranges
			 */
			throw new CKEditorError( 'selection-setFocus-no-ranges: Cannot set selection focus if there are no ranges in selection.' );
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
		this._checkRange( range );
		this._ranges.push( Range.createFromRange( range ) );
	}

	/**
	 * Checks if given range intersects with ranges that are already in the selection. Throws an error if it does.
	 *
	 * @param {engine.model.Range} range Range to check.
	 * @protected
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
					'selection-range-intersects: Trying to add a range that intersects with another range from selection.',
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
}

mix( Selection, EmitterMixin );

/**
 * Fired whenever selection ranges are changed through {@link engine.model.Selection Selection API}.
 *
 * @event engine.model.Selection#change:range
 */

/**
 * Fired whenever selection attributes are changed.
 *
 * @event engine.model.Selection#change:attribute
 */
