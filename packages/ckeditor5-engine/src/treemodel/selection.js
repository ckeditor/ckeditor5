/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import LiveRange from './liverange.js';
import AttributeList from './attributelist.js';
import EmitterMixin from '../emittermixin.js';
import CKEditorError from '../ckeditorerror.js';
import objectUtils from '../lib/lodash/object.js';

/**
 * Represents a selection that is made on nodes in {@link treeModel.Document}. Selection instance is
 * created by {@link treeModel.Document}. In most scenarios you should not need to create an instance of Selection.
 *
 * @class treeModel.Selection
 */
export default class Selection {
	/**
	 * Creates an empty selection.
	 *
	 * @constructor
	 */
	constructor() {
		/**
		 * List of attributes set on current selection.
		 *
		 * @private
		 * @property {treeModel.AttributeList} _attrs
		 */
		this._attrs = new AttributeList();

		/**
		 * Stores all ranges that are selected.
		 *
		 * @private
		 * @property {Array.<LiveRange>}
		 */
		this._ranges = [];

		/**
		 * Specifies whether the last added range was added as a backward or forward range.
		 *
		 * @private
		 * @property {Boolean}
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
	 * @property {treeModel.LivePosition|null}
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
	 * @see {#anchor}
	 * @property {treeModel.LivePosition|null}
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
	 * @property {Boolean}
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
	 * Adds a range to the selection. Added range is copied and converted to {@link treeModel.LiveRange}. This means
	 * that passed range is not saved in the Selection instance and you can safely operate on it. Accepts a flag
	 * describing in which way the selection is made - passed range might be selected from {@link treeModel.Range#start}
	 * to {@link treeModel.Range#end} or from {@link treeModel.Range#start} to {@link treeModel.Range#end}. The flag
	 * is used to set {@link #anchor} and {@link #focus} properties.
	 *
	 * @param {treeModel.Range} range Range to add.
	 * @param {Boolean} [isBackward] Flag describing if added range was selected forward - from start to end (`false`)
	 * or backward - from end to start (`true`). Defaults to `false`.
	 */
	addRange( range, isBackward ) {
		pushRange.call( this, range );
		this._lastRangeBackward = !!isBackward;

		this.fire( 'update' );
	}

	/**
	 * Unbinds all events previously bound by this selection and objects created by this selection.
	 */
	detach() {
		for ( let i = 0; i < this._ranges.length; i++ ) {
			this._ranges[ i ].detach();
		}
	}

	/**
	 * @see {@link treeModel.AttributeList#getAttr}
	 */
	getAttr( key ) {
		return this._attrs.getAttr( key );
	}

	/**
	 * @see {@link treeModel.AttributeList#getAttrs}
	 */
	getAttrs() {
		return this._attrs.getAttrs();
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
	 * @see {@link treeModel.AttributeList#hasAttr}
	 */
	hasAttr( key ) {
		return this._attrs.hasAttr( key );
	}

	/**
	 * @see {@link treeModel.AttributeList#removeAttr}
	 */
	removeAttr( key ) {
		this._attrs.removeAttr( key );
	}

	/**
	 * Removes all ranges that were added to the selection. Fires update event.
	 */
	removeAllRanges() {
		this.detach();
		this._ranges = [];

		this.fire( 'update' );
	}

	/**
	 * @see {@link treeModel.AttributeList#setAttr}
	 */
	setAttr( attr ) {
		this._attrs.setAttr( attr );
	}

	/**
	 * @see {@link treeModel.AttributeList#setAttrsTo}
	 */
	setAttrsTo( attrs ) {
		this._attrs.setAttrsTo( attrs );
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link #anchor} and {@link #focus}. Accepts a flag
	 * describing in which way the selection is made (see {@link #addRange}).
	 *
	 * @param {Array.<treeModel.Range>} newRanges Array of ranges to set.
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
}

/**
 * Converts given range to {@link treeModel.LiveRange} and adds it to internal ranges array. Throws an error
 * if given range is intersecting with any range that is already stored in this selection.
 *
 * @private
 * @method pushRange
 * @memberOf {treeModel.Selection}
 * @param {treeModel.Range} range Range to add.
 */
function pushRange( range ) {
	/* jshint validthis: true */
	for ( let i = 0; i < this._ranges.length ; i++ ) {
		if ( range.isIntersecting( this._ranges[ i ] ) ) {
			/**
			 * Trying to add a range that intersects with another range from selection.
			 *
			 * @error selection-range-intersects
			 * @param {treeModel.Range} addedRange Range that was added to the selection.
			 * @param {treeModel.Range} intersectingRange Range from selection that intersects with `addedRange`.
			 */
			throw new CKEditorError(
				'selection-range-intersects: Trying to add a range that intersects with another range from selection.',
				{ addedRange: range, intersectingRange: this._ranges[ i ] }
			);
		}
	}

	this._ranges.push( LiveRange.createFromRange( range ) );
}

objectUtils.extend( Selection.prototype, EmitterMixin );
