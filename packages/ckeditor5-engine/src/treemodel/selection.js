/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from './position.js';
import Range from './range.js';
import LiveRange from './liverange.js';
import EmitterMixin from '../emittermixin.js';
import CKEditorError from '../ckeditorerror.js';
import utils from '../utils.js';

const storePrefix = 'selection_store:';

/**
 * Represents a selection that is made on nodes in {@link core.treeModel.Document}. Selection instance is
 * created by {@link core.treeModel.Document}. In most scenarios you should not need to create an instance of Selection.
 *
 * @memberOf core.treeModel
 */
export default class Selection {
	/**
	 * Creates an empty selection.
	 */
	constructor() {
		/**
		 * List of attributes set on current selection.
		 *
		 * @protected
		 * @member {Map} core.treeModel.Selection#_attrs
		 */
		this._attrs = new Map();

		/**
		 * Stores all ranges that are selected.
		 *
		 * @private
		 * @member {Array.<core.treeModel.LiveRange>} core.treeModel.Selection#_ranges
		 */
		this._ranges = [];

		/**
		 * Specifies whether the last added range was added as a backward or forward range.
		 *
		 * @private
		 * @member {Boolean} core.treeModel.Selection#_lastRangeBackward
		 */
		this._lastRangeBackward = false;
	}

	/**
	 * Selection anchor. Anchor may be described as a position where the selection starts.
	 * Together with {@link core.treeModel.Selection#focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. When there are no ranges in selection anchor is null. Anchor is always
	 * the start or end of the most recent added range. It may be a bit unintuitive when there are multiple ranges in selection.
	 *
	 * @see core.treeModel.Selection#focus
	 * @type {core.treeModel.LivePosition|null}
	 */
	get anchor() {
		if ( this.hasAnyRange ) {
			let range = this._ranges[ this._ranges.length - 1 ];

			return this._lastRangeBackward ? range.end : range.start;
		}

		return null;
	}

	/**
	 * Selection focus. Focus is a position where the selection ends. When there are no ranges in selection, focus is null.
	 *
	 * @see core.treeModel.Selection#anchor
	 * @type {core.treeModel.LivePosition|null}
	 */
	get focus() {
		if ( this.hasAnyRange ) {
			let range = this._ranges[ this._ranges.length - 1 ];

			return this._lastRangeBackward ? range.start : range.end;
		}

		return null;
	}

	/**
	 * Flag indicating whether the selection has any range in it.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get hasAnyRange() {
		return this._ranges.length > 0;
	}

	/**
	 * Returns whether the selection is collapsed. Selection is collapsed when all it's ranges are collapsed.
	 * If selection has no ranges, returns null instead.
	 *
	 * @type {Boolean}
	 */
	get isCollapsed() {
		if ( !this.hasAnyRange ) {
			return null;
		}

		for ( let i = 0; i < this._ranges.length; i++ ) {
			if ( !this._ranges[ i ].isCollapsed ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Adds a range to the selection. Added range is copied and converted to {@link core.treeModel.LiveRange}. This means
	 * that passed range is not saved in the Selection instance and you can safely operate on it.
	 *
	 * Accepts a flag describing in which way the selection is made - passed range might be selected from
	 * {@link core.treeModel.Range#start} to {@link core.treeModel.Range#end} or from {@link core.treeModel.Range#start}
	 * to {@link core.treeModel.Range#end}. The flag is used to set {@link core.treeModel.Selection#anchor} and
	 * {@link core.treeModel.Selection#focus} properties.
	 *
	 * @fires {@link core.treeModel.Selection.update update}
	 * @param {core.treeModel.Range} range Range to add.
	 * @param {Boolean} [isBackward] Flag describing if added range was selected forward - from start to end (`false`)
	 * or backward - from end to start (`true`). Defaults to `false`.
	 */
	addRange( range, isBackward ) {
		pushRange.call( this, range );
		this._lastRangeBackward = !!isBackward;

		this.fire( 'update' );
	}

	/**
	 * Unbinds all events previously bound by this selection or objects created by this selection.
	 */
	detach() {
		for ( let i = 0; i < this._ranges.length; i++ ) {
			this._ranges[ i ].detach();
		}
	}

	/**
	 * Returns an array of ranges added to the selection. The method returns a copy of internal array, so
	 * it will not change when ranges get added or removed from selection.
	 *
	 * @returns {Array.<LiveRange>}
	 */
	getRanges() {
		return this._ranges.slice();
	}

	/**
	 * Returns the first range in the selection. First range is the one which {@link core.treeModel.Range#start start} position
	 * {@link core.treeModel.Position#isBefore is before} start position of all other ranges (not to confuse with the first range
	 * added to the selection).
	 *
	 * If there are no ranges in selection, retruns null instead.
	 *
	 * @returns {core.treeModel.Range|null}
	 */
	getFirstRange() {
		let first = null;

		for ( let i = 0; i < this._ranges.length; i++ ) {
			let range = this._ranges[ i ];

			if ( !first || range.start.isBefore( first.start ) ) {
				first = range;
			}
		}

		return first && Range.createFromRange( first );
	}

	/**
	 * Returns the first position in the selection. First position is the position that {@link core.treeModel.Position#isBefore is before}
	 * any other position in the selection ranges.
	 *
	 * @returns {core.treeModel.Position|null}
	 */
	getFirstPosition() {
		let firstRange = this.getFirstRange();

		return firstRange && Position.createFromPosition( firstRange.start );
	}

	/**
	 * Removes all ranges that were added to the selection. Fires update event.
	 *
	 * @fires {@link core.treeModel.Selection.update update}
	 */
	removeAllRanges() {
		this.detach();
		this._ranges = [];

		this.fire( 'update' );
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link #anchor} and {@link #focus}. Accepts a flag
	 * describing in which way the selection is made (see {@link #addRange}).
	 *
	 * @fires {@link core.treeModel.Selection.update update}
	 * @param {Array.<core.treeModel.Range>} newRanges Array of ranges to set.
	 * @param {Boolean} [isLastBackward] Flag describing if last added range was selected forward - from start to end (`false`)
	 * or backward - from end to start (`true`). Defaults to `false`.
	 */
	setRanges( newRanges, isLastBackward ) {
		this.detach();
		this._ranges = [];

		for ( let i = 0; i < newRanges.length; i++ ) {
			pushRange.call( this, newRanges[ i ] );
		}

		this._lastRangeBackward = !!isLastBackward;
		this.fire( 'update' );
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
	 * Gets an attribute value for given key or undefined it that attribute is not set on selection.
	 *
	 * @param {String} key Key of attribute to look for.
	 * @returns {*} Attribute value or null.
	 */
	getAttribute( key ) {
		return this._attrs.get( key );
	}

	/**
	 * Returns iterator that iterates over this selection attributes.
	 *
	 * @returns {Iterable.<*>}
	 */
	getAttributes() {
		return this._attrs[ Symbol.iterator ]();
	}

	/**
	 * Sets attribute on the selection. If attribute with the same key already is set, it overwrites its values.
	 *
	 * @param {String} key Key of attribute to set.
	 * @param {*} value Attribute value.
	 */
	setAttribute( key, value ) {
		this._attrs.set( key, value );
	}

	/**
	 * Removes all attributes from the selection and sets given attributes.
	 *
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set.
	 */
	setAttributesTo( attrs ) {
		this._attrs = utils.toMap( attrs );
	}

	/**
	 * Removes an attribute with given key from the selection.
	 *
	 * @param {String} key Key of attribute to remove.
	 * @returns {Boolean} `true` if the attribute was set on the selection, `false` otherwise.
	 */
	removeAttribute( key ) {
		return this._attrs.delete( key );
	}

	/**
	 * Removes all attributes from the selection.
	 */
	clearAttributes() {
		this._attrs.clear();
	}

	/**
	 * Generates and returns an attribute key for selection attributes store, basing on original attribute key.
	 *
	 * @param {String} key Attribute key to convert.
	 * @returns {String} Converted attribute key, applicable for selection store.
	 */
	static getStoreAttributeKey( key ) {
		return storePrefix + key;
	}

	/**
	 * Iterates through given set of attributes looking for attributes stored for selection. Keeps all such attributes
	 * and removes others. Then, converts attributes keys from store key to original key.
	 *
	 * @param {Iterable} attrs Iterable object containing attributes to be filtered. See {@link core.treeModel.Node#getAttributes}.
	 * @returns {Map} Map containing filtered attributes with keys converted to their original state.
	 */
	static filterStoreAttributes( attrs ) {
		const filtered = new Map();

		for ( let attr of attrs ) {
			if ( attr[ 0 ].indexOf( storePrefix ) === 0 ) {
				const realKey = attr[ 0 ].substr( storePrefix.length );

				filtered.set( realKey, attr[ 1 ] );
			}
		}

		return filtered;
	}
}

/**
 * Converts given range to {@link core.treeModel.LiveRange} and adds it to internal ranges array. Throws an error
 * if given range is intersecting with any range that is already stored in this selection.
 *
 * @private
 * @method pushRange
 * @memberOf {core.treeModel.Selection}
 * @param {core.treeModel.Range} range Range to add.
 */
function pushRange( range ) {
	/* jshint validthis: true */
	for ( let i = 0; i < this._ranges.length ; i++ ) {
		if ( range.isIntersecting( this._ranges[ i ] ) ) {
			/**
			 * Trying to add a range that intersects with another range from selection.
			 *
			 * @error selection-range-intersects
			 * @param {core.treeModel.Range} addedRange Range that was added to the selection.
			 * @param {core.treeModel.Range} intersectingRange Range from selection that intersects with `addedRange`.
			 */
			throw new CKEditorError(
				'selection-range-intersects: Trying to add a range that intersects with another range from selection.',
				{ addedRange: range, intersectingRange: this._ranges[ i ] }
			);
		}
	}

	this._ranges.push( LiveRange.createFromRange( range ) );
}

utils.mix( Selection, EmitterMixin );

/**
 * Fired whenever selection ranges are changed through {@link core.treeModel.Selection Selection API}. Not fired when
 * {@link core.treeModel.LiveRange live ranges} inserted in selection change because of Tree Model changes.
 *
 * @event core.treeModel.Selection.update
 */
