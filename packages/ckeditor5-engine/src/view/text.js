/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';

/**
 * Tree view text node.
 *
 * @memberOf engine.view
 * @extends engine.view.Node
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
		 * Setting the data fires the {@link engine.view.Node#event:change change event}.
		 *
		 * @private
		 * @member {String} engine.view.Text#_data
		 */
		this._data = data;
	}

	/**
	 * Clones this node.
	 *
	 * @returns {engine.view.Text} Text node that is a clone of this node.
	 */
	clone() {
		return new Text( this.data );
	}

	/**
	 * The text content.
	 *
	 * Setting the data fires the {@link view.Node#change change event}.
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
	 * @param {engine.view.Text} otherNode Node to check if it is same as this node.
	 * @returns {Boolean}
	 */
	isSimilar( otherNode ) {
		if ( !( otherNode instanceof Text ) ) {
			return false;
		}

		return this === otherNode || this.data === otherNode.data;
	}
}
