/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Node from './node.js';

/**
 * Model text node. Type of {@link engine.model.Node node} that contains {@link engine.model.Text#data text data}.
 *
 * **Important:** see {@link engine.model.Node} to read about restrictions using `Element` and `Node` API.
 *
 * **Note:** keep in mind that `Text` instances might indirectly got removed from model tree when model is changed.
 * This happens when {@link engine.model.writer model writer} is used to change model and the text node is merged with
 * another text node. Then, both text nodes are removed and a new text node is inserted into the model. Because of
 * this behavior, keeping references to `Text` is not recommended. Instead, consider creating
 * {@link engine.model.LivePosition live position} placed before the text node.
 *
 * @memberOf engine.model
 */
export default class Text extends Node {
	/**
	 * Creates a text node.
	 *
	 * @param {String} data Node's text.
	 * @param {Object} [attrs] Node's attributes. See {@link utils.toMap} for a list of accepted values.
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
		let json = super.toJSON();

		json.data = this.data;

		return json;
	}

	/**
	 * Creates a `Text` instance from given plain object (i.e. parsed JSON string).
	 *
	 * @param {Object} json Plain object to be converted to `Text`.
	 * @returns {engine.model.Text} `Text` instance created using given plain object.
	 */
	static fromJSON( json ) {
		return new Text( json.data, json.attributes );
	}
}
