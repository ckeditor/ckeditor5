/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import LiveRange from './liverange.js';
import EmitterMixin from '../../utils/emittermixin.js';
import CKEditorError from '../../utils/ckeditorerror.js';
import utils from '../../utils/utils.js';

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
	 * Together with {@link #focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. When there are no ranges in selection anchor is null.
	 * Anchor is always a start or end of the most recent added range. It may be a bit unintuitive when
	 * there are multiple ranges in selection.
	 *
	 * @type {core.treeModel.LivePosition|null}
	 */
	get anchor() {
		if ( this._ranges.length > 0 ) {
			let range = this._ranges[ this._ranges.length - 1 ];

			return this._lastRangeBackward ? range.end : range.start;
		}

		return null;
	}

	/**
	 * Selection focus. Focus is a position where the selection ends. When there are no ranges in selection,
	 * focus is null.
	 *
	 * @link {#anchor}
	 * @type {core.treeModel.LivePosition|null}
	 */
	get focus() {
		if ( this._ranges.length > 0 ) {
			let range = this._ranges[ this._ranges.length - 1 ];

			return this._lastRangeBackward ? range.start : range.end;
		}

		return null;
	}

	/**
	 * Returns whether the selection is collapsed. Selection is collapsed when all it's ranges are collapsed.
	 *
	 * @type {Boolean}
	 */
	get isCollapsed() {
		for ( let i = 0; i < this._ranges.length; i++ ) {
			if ( !this._ranges[ i ].isCollapsed ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Adds a range to the selection. Added range is copied and converted to {@link core.treeModel.LiveRange}. This means
	 * that passed range is not saved in the Selection instance and you can safely operate on it. Accepts a flag
	 * describing in which way the selection is made - passed range might be selected from {@link core.treeModel.Range#start}
	 * to {@link core.treeModel.Range#end} or from {@link core.treeModel.Range#start} to {@link core.treeModel.Range#end}. The flag
	 * is used to set {@link #anchor} and {@link #focus} properties.
	 *
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
	 * Removes all ranges that were added to the selection. Fires update event.
	 *
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
