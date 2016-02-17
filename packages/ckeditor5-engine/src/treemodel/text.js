/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import utils from '../utils.js';

/**
 * Data structure for text with attributes. Note that `Text` is not a {@link treeModel.Node}. This class is used
 * as an aggregator for multiple characters that have same attributes. Example usage:
 *
 *		let myElem = new Element( 'li', [], new Text( 'text with attributes', { foo: true, bar: true } ) );
 *
 * @class treeModel.Text
 */
export default class Text {
	/**
	 * Creates a text with attributes.
	 *
	 * @param {String} text Described text.
	 * @param {Iterable|Object} attrs Iterable collection of attributes.
	 * @constructor
	 */
	constructor( text, attrs ) {
		/**
		 * Text.
		 *
		 * @readonly
		 * @type {String}
		 */
		this.text = text || '';

		/**
		 * List of attributes bound with the text.
		 *
		 * @protected
		 * @type {Map}
		 */
		this._attrs = utils.toMap( attrs );
	}
}
