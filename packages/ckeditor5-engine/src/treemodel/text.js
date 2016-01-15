/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import AttributeList from './attributelist.js';

/**
 * Data structure for text with attributes. Note that `Text` is not a {@link treeModel.Node}. This class is used
 * as an aggregator for multiple characters that have same attributes. Example usage:
 *
 *		let attrFoo = new Attribute( 'foo', true );
 *		let attrBar = new Attribute( 'bar', true );
 *		let myElem = new Element( 'li', [], new Text( 'text with attributes', [ attrFoo, attrBar ] ) );
 *
 * @class treeModel.Text
 */
export default class Text {
	/**
	 * Creates a text with attributes.
	 *
	 * @param {String} text Described text.
	 * @param {Iterable} attrs Iterable collection of {@link treeModel.Attribute attributes}.
	 * @constructor
	 */
	constructor( text, attrs ) {
		/**
		 * Text.
		 *
		 * @readonly
		 * @property {String}
		 */
		this.text = text || '';

		/**
		 * Iterable collection of {@link treeModel.Attribute attributes}.
		 *
		 * @property {Iterable}
		 */
		this.attrs = new AttributeList( attrs );
	}
}
