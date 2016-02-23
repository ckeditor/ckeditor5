/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';

/**
 * Tree view text node.
 *
 * @memberOf core.treeView
 * @extends core.treeView.Node
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
		 * Setting the data fires the {@link core.treeView.Node#event:change change event}.
		 *
		 * @private
		 * @member {String} core.treeView.Text#_data
		 */
		this._data = data;
	}

	cloneNode() {
		return new this( this.data );
	}

	/**
	 * The text content.
	 *
	 * Setting the data fires the {@link treeView.Node#change change event}.
	 */
	get data() {
		return this._data;
	}

	set data( data ) {
		this._fireChange( 'TEXT', this );

		this._data = data;
	}

	same( otherNode ) {
		if ( !otherNode instanceof Text ) {
			return false;
		}

		return this.data === otherNode.data;
	}
}
