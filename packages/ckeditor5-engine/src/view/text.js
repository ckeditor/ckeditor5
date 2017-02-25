/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/text
 */

import Node from './node';

/**
 * Tree view text node.
 *
 * @extends module:engine/view/node~Node
 */
export default class Text extends Node {
	/**
	 * Creates a tree view text node.
	 *
	 * @param {String} data Text.
	 */
	constructor( data ) {
		super();

		/**
		 * The text content.
		 *
		 * Setting the data fires the {@link module:engine/view/node~Node#event:change:text change event}.
		 *
		 * @private
		 * @member {String} module:engine/view/text~Text#_data
		 */
		this._data = data;
	}

	/**
	 * Clones this node.
	 *
	 * @returns {module:engine/view/text~Text} Text node that is a clone of this node.
	 */
	clone() {
		return new Text( this.data );
	}

	/**
	 * @inheritDoc
	 */
	is( type ) {
		return type == 'text';
	}

	/**
	 * The text content.
	 *
	 * Setting the data fires the {@link module:engine/view/node~Node#event:change:text change event}.
	 */
	get data() {
		return this._data;
	}

	set data( data ) {
		this._fireChange( 'text', this );

		this._data = data;
	}

	/**
	 * Checks if this text node is similar to other text node.
	 * Both nodes should have the same data to be considered as similar.
	 *
	 * @param {module:engine/view/text~Text} otherNode Node to check if it is same as this node.
	 * @returns {Boolean}
	 */
	isSimilar( otherNode ) {
		if ( !( otherNode instanceof Text ) ) {
			return false;
		}

		return this === otherNode || this.data === otherNode.data;
	}
}
