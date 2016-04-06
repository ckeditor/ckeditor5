/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from './position.js';

/**
 * Tree view range.
 *
 * @memberOf engine.treeView
 */
export default class Range {
	/**
	 * Creates a range spanning from `start` position to `end` position.
	 * **Note:** Constructor creates it's own {@link engine.treeView.Position} instances basing on passed values.
	 *
	 * @param {engine.treeView.Position} start Start position.
	 * @param {engine.treeView.Position} end End position.
	 */
	constructor( start, end ) {
		/**
		 * Start position.
		 *
		 * @member engine.treeView.Range#start
		 * @type {engine.treeView.Position}
		 */
		this.start = Position.createFromPosition( start );

		/**
		 * End position.
		 *
		 * @member engine.treeView.Range#end
		 * @type {engine.treeView.Position}
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
	 * @param {engine.treeView.Range} otherRange Range to compare with.
	 * @returns {Boolean} True if ranges equal.
	 */
	isEqual( otherRange ) {
		return this == otherRange || ( this.start.isEqual( otherRange.start ) && this.end.isEqual( otherRange.end ) );
	}

	/**
	 * Creates a range from given parents and offsets.
	 *
	 * @param {engine.treeView.Element} startElement Start position parent element.
	 * @param {Number} startOffset Start position offset.
	 * @param {engine.treeView.Element} endElement End position parent element.
	 * @param {Number} endOffset End position offset.
	 * @returns {engine.treeView.Range} Created range.
	 */
	static createFromParentsAndOffsets( startElement, startOffset, endElement, endOffset ) {
		return new this(
			new Position( startElement, startOffset ),
			new Position( endElement, endOffset )
		);
	}

	/**
	 * Creates and returns a new instance of Range which is equal to passed range.
	 *
	 * @param {engine.treeView.Range} range Range to clone.
	 * @returns {engine.treeView.Range}
	 */
	static createFromRange( range ) {
		return new this( range.start, range.end );
	}
}
