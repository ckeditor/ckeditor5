/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/text
 */

import Node from './node';

// @if CK_DEBUG_ENGINE // const { convertMapToStringifiedObject } = require( '../dev-utils/utils' );

/**
 * Model text node. Type of {@link module:engine/model/node~Node node} that contains {@link module:engine/model/text~Text#data text data}.
 *
 * **Important:** see {@link module:engine/model/node~Node} to read about restrictions using `Text` and `Node` API.
 *
 * **Note:** keep in mind that `Text` instances might indirectly got removed from model tree when model is changed.
 * This happens when {@link module:engine/model/writer~Writer model writer} is used to change model and the text node is merged with
 * another text node. Then, both text nodes are removed and a new text node is inserted into the model. Because of
 * this behavior, keeping references to `Text` is not recommended. Instead, consider creating
 * {@link module:engine/model/liveposition~LivePosition live position} placed before the text node.
 *
 * @extends module:engine/model/node~Node
 */
export default class Text extends Node {
	/**
	 * Creates a text node.
	 *
	 * **Note:** Constructor of this class shouldn't be used directly in the code.
	 * Use the {@link module:engine/model/writer~Writer#createText} method instead.
	 *
	 * @protected
	 * @param {String} data Node's text.
	 * @param {Object} [attrs] Node's attributes. See {@link module:utils/tomap~toMap} for a list of accepted values.
	 */
	constructor( data, attrs ) {
		super( attrs );

		/**
		 * Text data contained in this text node.
		 *
		 * @protected
		 * @type {String}
		 */
		this._data = data || '';
	}

	/**
	 * @inheritDoc
	 */
	get offsetSize() {
		return this.data.length;
	}

	/**
	 * Returns a text data contained in the node.
	 *
	 * @readonly
	 * @type {String}
	 */
	get data() {
		return this._data;
	}

	/**
	 * Checks whether this object is of the given.
	 *
	 *		text.is( '$text' ); // -> true
	 *		text.is( 'node' ); // -> true
	 *		text.is( 'model:$text' ); // -> true
	 *		text.is( 'model:node' ); // -> true
	 *
	 *		text.is( 'view:$text' ); // -> false
	 *		text.is( 'documentSelection' ); // -> false
	 *
	 * {@link module:engine/model/node~Node#is Check the entire list of model objects} which implement the `is()` method.
	 *
	 * **Note:** Until version 20.0.0 this method wasn't accepting `'$text'` type. The legacy `'text'` type is still
	 * accepted for backward compatibility.
	 *
	 * @param {String} type Type to check when `name` parameter is present.
	 * Otherwise, it acts like the `name` parameter.
	 * @returns {Boolean}
	 */
	is( type ) {
		return type === '$text' || type === 'model:$text' ||
			// This are legacy values kept for backward compatibility.
			type === 'text' || type === 'model:text' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === 'node' || type === 'model:node';
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
	 * Creates a copy of this text node and returns it. Created text node has same text data and attributes as original text node.
	 *
	 * @protected
	 * @returns {module:engine/model/text~Text} `Text` instance created using given plain object.
	 */
	_clone() {
		return new Text( this.data, this.getAttributes() );
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

	// @if CK_DEBUG_ENGINE // toString() {
	// @if CK_DEBUG_ENGINE // 	return `#${ this.data }`;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // logExtended() {
	// @if CK_DEBUG_ENGINE // 	console.log( `ModelText: ${ this }, attrs: ${ convertMapToStringifiedObject( this.getAttributes() ) }` );
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // log() {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ModelText: ' + this );
	// @if CK_DEBUG_ENGINE // }
}
