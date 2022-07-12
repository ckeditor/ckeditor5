/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/rootelement
 */

import Element from './element';

import type { Marker } from './markercollection';
import type Document from './document';
import type DocumentFragment from './documentfragment';
import type DocumentSelection from './documentselection';
import type LivePosition from './liveposition';
import type LiveRange from './liverange';
import type Node from './node';
import type Position from './position';
import type Range from './range';
import type Selection from './selection';
import type Text from './text';
import type TextProxy from './textproxy';

/**
 * Type of {@link module:engine/model/element~Element} that is a root of a model tree.
 * @extends module:engine/model/element~Element
 */
export default class RootElement extends Element {
	public override readonly rootName: string;

	private readonly _document: Document;

	/**
	 * Creates root element.
	 *
	 * @param {module:engine/model/document~Document} document Document that is an owner of this root.
	 * @param {String} name Node name.
	 * @param {String} [rootName='main'] Unique root name used to identify this root
	 * element by {@link module:engine/model/document~Document}.
	 */
	constructor( document: Document, name: string, rootName: string = 'main' ) {
		super( name );

		/**
		 * Document that is an owner of this root.
		 *
		 * @private
		 * @member {module:engine/model/document~Document}
		 */
		this._document = document;

		/**
		 * Unique root name used to identify this root element by {@link module:engine/model/document~Document}.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.rootName = rootName;
	}

	/**
	 * {@link module:engine/model/document~Document Document} that owns this root element.
	 *
	 * @readonly
	 * @type {module:engine/model/document~Document|null}
	 */
	public override get document(): Document {
		return this._document;
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
	 *		rootElement.is( 'rootElement' ); // -> true
	 *		rootElement.is( 'element' ); // -> true
	 *		rootElement.is( 'node' ); // -> true
	 *		rootElement.is( 'model:rootElement' ); // -> true
	 *		rootElement.is( 'model:element' ); // -> true
	 *		rootElement.is( 'model:node' ); // -> true
	 *
	 *		rootElement.is( 'view:element' ); // -> false
	 *		rootElement.is( 'documentFragment' ); // -> false
	 *
	 * Assuming that the object being checked is an element, you can also check its
	 * {@link module:engine/model/element~Element#name name}:
	 *
	 *		rootElement.is( 'rootElement', '$root' ); // -> same as above
	 *
	 * {@link module:engine/model/node~Node#is Check the entire list of model objects} which implement the `is()` method.
	 *
	 * @param {String} type Type to check.
	 * @param {String} [name] Element name.
	 * @returns {Boolean}
	 */
	public override is( type: string, name?: string ): boolean {
		if ( !name ) {
			return type === 'rootElement' || type === 'model:rootElement' ||
				// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
				type === 'element' || type === 'model:element' ||
				type === 'node' || type === 'model:node';
		}

		return name === this.name && (
			type === 'rootElement' || type === 'model:rootElement' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === 'element' || type === 'model:element'
		);
	}

	/**
	 * Converts `RootElement` instance to `String` containing it's name.
	 *
	 * @returns {String} `RootElement` instance converted to `String`.
	 */
	public override toJSON(): unknown {
		return this.rootName;
	}

	// @if CK_DEBUG_ENGINE // toString() {
	// @if CK_DEBUG_ENGINE // 	return this.rootName;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // log() {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ModelRootElement: ' + this );
	// @if CK_DEBUG_ENGINE // }
}

