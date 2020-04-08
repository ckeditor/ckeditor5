/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/text
 */

import Node from './node';

/**
 * Tree view text node.
 *
 * The constructor of this class should not be used directly. To create a new text node instance
 * use the {@link module:engine/view/downcastwriter~DowncastWriter#createText `DowncastWriter#createText()`}
 * method when working on data downcasted from the model or the
 * {@link module:engine/view/upcastwriter~UpcastWriter#createText `UpcastWriter#createText()`}
 * method when working on non-semantic views.
 *
 * @extends module:engine/view/node~Node
 */
export default class Text extends Node {
	/**
	 * Creates a tree view text node.
	 *
	 * @protected
	 * @param {module:engine/view/document~Document} document The document instance to which this text node belongs.
	 * @param {String} data The text's data.
	 */
	constructor( document, data ) {
		super( document );

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
	 * Checks whether this object is of the given type.
	 *
	 *		text.is( 'text' ); // -> true
	 *		text.is( 'node' ); // -> true
	 *		text.is( 'view:text' ); // -> true
	 *		text.is( 'view:node' ); // -> true
	 *
	 *		text.is( 'model:text' ); // -> false
	 *		text.is( 'element' ); // -> false
	 *		text.is( 'range' ); // -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	is( type ) {
		return type === 'text' || type === 'view:text' || super.is( type );
	}

	/**
	 * The text content.
	 *
	 * @readonly
	 * @type {String}
	 */
	get data() {
		return this._textData;
	}

	/**
	 * This getter is required when using the addition assignment operator on protected property:
	 *
	 *		const foo = downcastWriter.createText( 'foo' );
	 *		const bar = downcastWriter.createText( 'bar' );
	 *
	 *		foo._data += bar.data;   // executes: `foo._data = foo._data + bar.data`
	 *		console.log( foo.data ); // prints: 'foobar'
	 *
	 * If the protected getter didn't exist, `foo._data` will return `undefined` and result of the merge will be invalid.
	 *
	 * @protected
	 * @type {String}
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
		return new Text( this.document, this.data );
	}

	// @if CK_DEBUG_ENGINE // toString() {
	// @if CK_DEBUG_ENGINE // 	return `#${ this.data }`;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // log() {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ViewText: ' + this );
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // logExtended() {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ViewText: ' + this );
	// @if CK_DEBUG_ENGINE // }
}
