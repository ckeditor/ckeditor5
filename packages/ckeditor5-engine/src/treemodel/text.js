/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import AttributeList from './attributelist.js';
import TextNode from './textnode.js';
import langUtils from '../lib/lodash/lang.js';

/**
 * Data structure for text with attributes. Note that the `Text` is not a {@link treeModel.Node}. This class is used
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

	/**
	 * Creates and returns a text node that represents whole text contained in this text object.
	 *
	 * @returns {TextNode}
	 */
	getTextNode( start, length ) {
		start = start && start >= 0 ? start : 0;
		length = length && length >= 0 ? length : this.text.length;

		return new TextNode( this, start, length );
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @returns {Object} Clone of this object with the parent property replaced with its name.
	 */
	toJSON() {
		const json = langUtils.clone( this );

		// Due to circular references we need to remove parent reference.
		json.parent = this.parent ? this.parent.name : null;

		return json;
	}
}
