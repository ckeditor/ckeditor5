/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/text
 */

import Node from './node';

import type { Marker } from './markercollection';
import type DocumentFragment from './documentfragment';
import type DocumentSelection from './documentselection';
import type Element from './element';
import type LivePosition from './liveposition';
import type LiveRange from './liverange';
import type Position from './position';
import type Range from './range';
import type RootElement from './rootelement';
import type Selection from './selection';
import type TextProxy from './textproxy';

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
	/** @internal */
	public _data: string;

	/**
	 * Creates a text node.
	 *
	 * **Note:** Constructor of this class shouldn't be used directly in the code.
	 * Use the {@link module:engine/model/writer~Writer#createText} method instead.
	 *
	 * @protected
	 * @param {String} [data] Node's text.
	 * @param {Object} [attrs] Node's attributes. See {@link module:utils/tomap~toMap} for a list of accepted values.
	 */
	constructor( data?: string, attrs?: Record<string, unknown> | Iterable<[ string, unknown ]> ) {
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
	public override get offsetSize(): number {
		return this.data.length;
	}

	/**
	 * Returns a text data contained in the node.
	 *
	 * @readonly
	 * @type {String}
	 */
	public get data(): string {
		return this._data;
	}

	public override is( type: 'node' | 'model:node' ): this is Node | Element | Text | RootElement;
	public override is( type: 'element' | 'model:element' ): this is Element | RootElement;
	public override is( type: 'rootElement' | 'model:rootElement' ): this is RootElement;
	public override is( type: '$text' | 'model:$text' ): this is Text;
	public override is( type: 'position' | 'model:position' ): this is Position | LivePosition;
	public override is( type: 'livePosition' | 'model:livePosition' ): this is LivePosition;
	public override is( type: 'range' | 'model:range' ): this is Range | LiveRange;
	public override is( type: 'liveRange' | 'model:liveRange' ): this is LiveRange;
	public override is( type: 'documentFragment' | 'model:documentFragment' ): this is DocumentFragment;
	public override is( type: 'selection' | 'model:selection' ): this is Selection | DocumentSelection;
	public override is( type: 'documentSelection' | 'model:documentSelection' ): this is DocumentSelection;
	public override is( type: 'marker' | 'model:marker' ): this is Marker;
	public override is( type: '$textProxy' | 'model:$textProxy' ): this is TextProxy;
	public override is<N extends string>( type: 'element' | 'model:element', name: N ): this is ( Element | RootElement ) & { name: N };
	public override is<N extends string>( type: 'rootElement' | 'model:rootElement', name: N ): this is RootElement & { name: N };

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
	 * @param {String} type Type to check.
	 * @returns {Boolean}
	 */
	public override is( type: string ): boolean {
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
	public override toJSON(): unknown {
		const json: any = super.toJSON();

		json.data = this.data;

		return json;
	}

	/**
	 * Creates a copy of this text node and returns it. Created text node has same text data and attributes as original text node.
	 *
	 * @internal
	 * @protected
	 * @returns {module:engine/model/text~Text} `Text` instance created using given plain object.
	 */
	public override _clone(): Text {
		return new Text( this.data, this.getAttributes() );
	}

	/**
	 * Creates a `Text` instance from given plain object (i.e. parsed JSON string).
	 *
	 * @param {Object} json Plain object to be converted to `Text`.
	 * @returns {module:engine/model/text~Text} `Text` instance created using given plain object.
	 */
	public static fromJSON( json: any ): Text {
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
