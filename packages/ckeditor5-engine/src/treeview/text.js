/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';

/**
 * Tree view text.
 *
 * @class treeView.Text
 */
export default class Text extends Node {
	/**
	 * Creates a tree view text.
	 *
	 * @param {String} text Text.
	 * @constructor
	 */
	constructor( text ) {
		super();

		/**
		 * Text data.
		 *
		 * @type {String}
		 * @private
		 */
		this._text = text;
	}

	/**
	 * Get text data.
	 *
	 * @returns {String} Text data.
	 */
	getText() {
		return this._text;
	}

	/**
	 * Set text data and fire {@link treeView.Node#change change event}.
	 *
	 * @param {String} text Text data.
	 */
	setText( text ) {
		this._fireChange( 'TEXT', this );

		this._text = text;
	}
}
