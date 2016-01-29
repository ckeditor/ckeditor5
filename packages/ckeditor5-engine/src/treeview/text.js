/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';

/**
 * Tree view text node.
 *
 * @class treeView.Text
 */
export default class Text extends Node {
	/**
	 * Creates a tree view text node.
	 *
	 * @param {String} data Text.
	 * @constructor
	 */
	constructor( data ) {
		super();

		/**
		 * The text content.
		 *
		 * @private
		 * @property {String}
		 */
		this._data = data;
	}

	/**
	 * The text content.
	 *
	 * Setting the data fires the {@link treeView.Node#change change event}.
	 *
	 * @property {String} Text data.
	 */
	get data() {
		return this._data;
	}

	set data( data ) {
		this._fireChange( 'TEXT', this );

		this._data = data;
	}
}
