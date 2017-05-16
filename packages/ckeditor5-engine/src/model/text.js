/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/text
 */

import Node from './node';

/**
 * Model text node. Type of {@link module:engine/model/node~Node node} that contains {@link module:engine/model/text~Text#data text data}.
 *
 * **Important:** see {@link module:engine/model/node~Node} to read about restrictions using `Text` and `Node` API.
 *
 * **Note:** keep in mind that `Text` instances might indirectly got removed from model tree when model is changed.
 * This happens when {@link module:engine/model/writer~writer model writer} is used to change model and the text node is merged with
 * another text node. Then, both text nodes are removed and a new text node is inserted into the model. Because of
 * this behavior, keeping references to `Text` is not recommended. Instead, consider creating
 * {@link module:engine/model/liveposition~LivePosition live position} placed before the text node.
 */
export default class Text extends Node {
	/**
	 * Creates a text node.
	 *
	 * @param {String} data Node's text.
	 * @param {Object} [attrs] Node's attributes. See {@link module:utils/tomap~toMap} for a list of accepted values.
	 */
	constructor( data, attrs ) {
		super( attrs );

		/**
		 * Text data contained in this text node.
		 *
		 * @type {String}
		 */
		this.data = data || '';
	}

	/**
	 * @inheritDoc
	 */
	get offsetSize() {
		return this.data.length;
	}

	/**
	 * @inheritDoc
	 */
	is( type ) {
		return type == 'text';
	}

	/**
	 * Creates a copy of this text node and returns it. Created text node has same text data and attributes as original text node.
	 */
	clone() {
		return new Text( this.data, this.getAttributes() );
	}

	/**
	 * Converts `Text` instance to plain object and returns it.
	 *
	 * @returns {Object} `Text` instance converted to plain object.
	 */
	toJSON() {
		const json = super.toJSON();

		json.data = this.data;

		return json;
	}

	/**
	 * Creates a `Text` instance from given plain object (i.e. parsed JSON string).
	 *
	 * @param {Object} json Plain object to be converted to `Text`.
	 * @returns {module:engine/model/text~Text} `Text` instance created using given plain object.
	 */
	static fromJSON( json ) {
		return new Text( json.data, json.attributes );
	}
}
