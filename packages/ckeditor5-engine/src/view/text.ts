/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/text
 */

import Node from './node.js';

import type Document from './document.js';

/**
 * Tree view text node.
 *
 * The constructor of this class should not be used directly. To create a new text node instance
 * use the {@link module:engine/view/downcastwriter~DowncastWriter#createText `DowncastWriter#createText()`}
 * method when working on data downcasted from the model or the
 * {@link module:engine/view/upcastwriter~UpcastWriter#createText `UpcastWriter#createText()`}
 * method when working on non-semantic views.
 */
export default class Text extends Node {
	/**
	 * The text content.
	 *
	 * Setting the data fires the {@link module:engine/view/node~Node#event:change:text change event}.
	 */
	private _textData: string;

	/**
	 * Creates a tree view text node.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#createText
	 * @internal
	 * @param document The document instance to which this text node belongs.
	 * @param data The text's data.
	 */
	constructor( document: Document, data: string ) {
		super( document );

		this._textData = data;
	}

	/**
	 * The text content.
	 */
	public get data(): string {
		return this._textData;
	}

	/**
	 * The `_data` property is controlled by a getter and a setter.
	 *
	 * The getter is required when using the addition assignment operator on protected property:
	 *
	 * ```ts
	 * const foo = downcastWriter.createText( 'foo' );
	 * const bar = downcastWriter.createText( 'bar' );
	 *
	 * foo._data += bar.data;   // executes: `foo._data = foo._data + bar.data`
	 * console.log( foo.data ); // prints: 'foobar'
	 * ```
	 *
	 * If the protected getter didn't exist, `foo._data` will return `undefined` and result of the merge will be invalid.
	 *
	 * The setter sets data and fires the {@link module:engine/view/node~Node#event:change:text change event}.
	 *
	 * @internal
	 */
	public get _data(): string {
		return this.data;
	}

	public set _data( data: string ) {
		this._fireChange( 'text', this );

		this._textData = data;
	}

	/**
	 * Checks if this text node is similar to other text node.
	 * Both nodes should have the same data to be considered as similar.
	 *
	 * @param otherNode Node to check if it is same as this node.
	 */
	public isSimilar( otherNode: Node ): boolean {
		if ( !( otherNode instanceof Text ) ) {
			return false;
		}

		return this === otherNode || this.data === otherNode.data;
	}

	/**
	 * Clones this node.
	 *
	 * @internal
	 * @returns Text node that is a clone of this node.
	 */
	public _clone(): Text {
		return new Text( this.document, this.data );
	}

	// @if CK_DEBUG_ENGINE // public override toString(): string {
	// @if CK_DEBUG_ENGINE // 	return `#${ this.data }`;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // public log(): void {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ViewText: ' + this );
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // public logExtended(): void {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ViewText: ' + this );
	// @if CK_DEBUG_ENGINE // }
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
Text.prototype.is = function( type: string ): boolean {
	return type === '$text' || type === 'view:$text' ||
		// This are legacy values kept for backward compatibility.
		type === 'text' || type === 'view:text' ||
		// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
		type === 'node' || type === 'view:node';
};
