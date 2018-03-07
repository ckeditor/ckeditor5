/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/text
 */

import Node from './node';

/**
 * Tree view text node.
 *
 * @extends module:engine/view/node~Node
 */
export default class Text extends Node {
	/**
	 * Creates a tree view text node.
	 *
	 * **Note:** Constructor of this class shouldn't be used directly in the code.
	 * Use the {@link module:engine/view/writer~Writer#createText} method instead.
	 *
	 * @protected
	 * @param {String} data Text.
	 */
	constructor( data ) {
		super();

		/**
		 * The text content.
		 *
		 * Setting the data fires the {@link module:engine/view/node~Node#event:change:text change event}.
		 *
		 * @protected
		 * @member {String} module:engine/view/text~Text#_textData
		 */
		this._textData = data;
	}

	/**
	 * @inheritDoc
	 */
	is( type ) {
		return type == 'text';
	}

	/**
	 * The text content.
	 *
	 * @returns {String}
	 */
	get data() {
		return this._textData;
	}

	/**
	 * This getter is required when using the addition assignment operator on protected property:
	 *
	 *		const foo = new Text( 'foo' );
	 *		const bar = new Text( 'bar' );
	 *
	 *		foo._data += bar.data;   // executes: `foo._data = foo._data + bar.data`
	 *		console.log( foo.data ); // prints: 'foobar'
	 *
	 * If the protected getter didn't exist, `foo._data` will return `undefined` and result of the merge will be invalid.
	 *
	 * @protected
	 * @returns {String}
	 */
	get _data() {
		return this.data;
	}

	/**
	 * Sets data and fires the {@link module:engine/view/node~Node#event:change:text change event}.
	 *
	 * @protected
	 * @fires change:text
	 * @param {String} data New data for the text node.
	 */
	set _data( data ) {
		this._fireChange( 'text', this );

		this._textData = data;
	}

	/**
	 * Checks if this text node is similar to other text node.
	 * Both nodes should have the same data to be considered as similar.
	 *
	 * @param {module:engine/view/text~Text} otherNode Node to check if it is same as this node.
	 * @returns {Boolean}
	 */
	isSimilar( otherNode ) {
		if ( !( otherNode instanceof Text ) ) {
			return false;
		}

		return this === otherNode || this.data === otherNode.data;
	}

	/**
	 * Clones this node.
	 *
	 * @protected
	 * @returns {module:engine/view/text~Text} Text node that is a clone of this node.
	 */
	_clone() {
		return new Text( this.data );
	}
}
