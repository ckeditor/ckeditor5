/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from './position.js';
import Range from './range.js';

/**
 * TextFragment is an aggregator for multiple CharacterProxy instances that are placed next to each other in
 * tree model, in the same parent, and all have same attributes set. Instances of this class are created and returned
 * in various algorithms that "merge characters" (see {@link treeModel.TreeWalker}, {@link treeModel.Range}).
 *
 * Difference between {@link treeModel.TextFragment} and {@link treeModel.Text} is that the former is bound to tree model,
 * while {@link treeModel.Text} is simply a string with attributes set.
 *
 * You should never create an instance of this class by your own. When passing parameters to constructors,
 * use string literals or {@link treeModel.Text} instead.
 *
 * @class treeModel.TextFragment
 */
export default class TextFragment {
	/**
	 * Creates a text fragment.
	 *
	 * @param {treeModel.Position} startPosition Position in the tree model where the {@link treeModel.TextFragment} starts.
	 * @param {String} text Characters contained in {@link treeModel.TextFragment}.
	 * @protected
	 * @constructor
	 */
	constructor( startPosition, text ) {
		/**
		 * First {@link treeModel.CharacterProxy character node} contained in {@link treeModel.TextFragment}.
		 *
		 * @readonly
		 * @property {treeModel.CharacterProxy} first
		 */
		this.first = startPosition.nodeAfter;

		/**
		 * Characters contained in {@link treeModel.TextFragment}.
		 *
		 * @readonly
		 * @property {String} text
		 */
		this.text = text;

		/**
		 * Last {@link treeModel.CharacterProxy character node} contained in {@link treeModel.TextFragment}.
		 *
		 * @readonly
		 * @property {treeModel.CharacterProxy} last
		 */
		this.last = this.getCharAt( this.text.length - 1 );

		/**
		 * List of attributes common for all characters in this {@link treeModel.TextFragment}.
		 *
		 * @readonly
		 * @property {@link treeModel.AttributeList} attrs
		 */
		this.attrs = this.first.attrs;
	}

	/**
	 * Gets a character at given index and creates a {@link treeModel.CharacterProxy} out of it.
	 *
	 * @param {Number} index Character index.
	 * @returns {treeModel.CharacterProxy}
	 */
	getCharAt( index ) {
		return this.first.parent.getChild( this.first._index + index );
	}

	/**
	 * Creates and returns a range containing all characters from this {@link treeModel.TextFragment}.
	 *
	 * @returns {Range}
	 */
	getRange() {
		return new Range( Position.createBefore( this.first ), Position.createAfter( this.last ) );
	}
}
