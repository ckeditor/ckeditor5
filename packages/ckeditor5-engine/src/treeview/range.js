/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from './position.js';

/**
 * Tree view range.
 *
 * @memberOf core.treeView
 * @extends core.treeView.Range
 */
export default class Range {
	/**
	 * Creates a range spanning from `start` position to `end` position.
	 * **Note:** Constructor creates it's own {@link core.treeView.Position} instances basing on passed values.
	 *
	 * @param {core.treeView.Position} start Start position.
	 * @param {core.treeView.Position} end End position.
	 */
	constructor( start, end ) {
		/**
		 * Start position.
		 *
		 * @public
		 * @member {core.treeView.Position}  core.treeModel.Range#start
		 */
		this.start = Position.createFromPosition( start );

		/**
		 * End position.
		 *
		 * @public
		 * @member {core.treeView.Position} core.treeModel.Range#end
		 */
		this.end = Position.createFromPosition( end );
	}

	/**
	 * Returns whether the range is collapsed, that is it start and end positions are equal.
	 *
	 * @type {Boolean}
	 */
	get isCollapsed() {
		return this.start.isEqual( this.end );
	}

	/**
	 * Two ranges equal if their start and end positions equal.
	 *
	 * @param {core.treeView.Range} otherRange Range to compare with.
	 * @returns {Boolean} True if ranges equal.
	 */
	isEqual( otherRange ) {
		return this == otherRange || ( this.start.isEqual( otherRange.start ) && this.end.isEqual( otherRange.end ) );
	}

	/**
	 * Creates a range from given parents and offsets.
	 *
	 * @param {core.treeView.Element} startElement Start position parent element.
	 * @param {Number} startOffset Start position offset.
	 * @param {core.treeView.Element} endElement End position parent element.
	 * @param {Number} endOffset End position offset.
	 * @returns {core.treeView.Range} Created range.
	 */
	static createFromParentsAndOffsets( startElement, startOffset, endElement, endOffset ) {
		return new this(
			new Position( startElement, startOffset ),
			new Position( endElement, endOffset )
		);
	}
}
