/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';

/**
 * Creates a tree view text node.
 *
 * @param {String} data Text.
 *
 * @class core.treeView.Text
 * @classdesc Tree view text node.
 */
export default class Text extends Node {
	constructor( data ) {
		super();

		/**
		 * The text content.
		 *
		 * Setting the data fires the {@link core.treeView.Node#event:change change event}.
		 *
		 * @private
		 * @type {String}
		 * @member core.treeView.Text#_data
		 */
		this._data = data;
	}

	get data() {
		return this._data;
	}

	set data( data ) {
		this._fireChange( 'TEXT', this );

		this._data = data;
	}
}
