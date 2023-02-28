/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/documentfragment
 */

import TypeCheckable from './typecheckable';
import Text from './text';
import TextProxy from './textproxy';

import { EmitterMixin, isIterable } from '@ckeditor/ckeditor5-utils';

import type { default as Document, ChangeType } from './document';

import type Item from './item';
import type Node from './node';

/**
 * Document fragment.
 *
 * To create a new document fragment instance use the
 * {@link module:engine/view/upcastwriter~UpcastWriter#createDocumentFragment `UpcastWriter#createDocumentFragment()`}
 * method.
 */
export default class DocumentFragment extends EmitterMixin( TypeCheckable ) {
	public readonly document: Document;
	private readonly _children: Array<Node>;
	private readonly _customProperties: Map<string | symbol, unknown>;

	/**
	 * Creates new DocumentFragment instance.
	 *
	 * @protected
	 * @param {module:engine/view/document~Document} document The document to which this document fragment belongs.
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * A list of nodes to be inserted into the created document fragment.
	 */
	constructor( document: Document, children?: Node | Iterable<Node> ) {
		super();

		/**
		 * The document to which this document fragment belongs.
		 *
		 * @readonly
		 * @member {module:engine/view/document~Document}
		 */
		this.document = document;

		/**
		 * Array of child nodes.
		 *
		 * @protected
		 * @member {Array.<module:engine/view/node~Node>} module:engine/view/documentfragment~DocumentFragment#_children
		 */
		this._children = [];

		if ( children ) {
			this._insertChild( 0, children );
		}

		/**
		 * Map of custom properties.
		 * Custom properties can be added to document fragment instance.
		 *
		 * @protected
		 * @member {Map}
		 */
		this._customProperties = new Map();
	}

	/**
	 * Iterable interface.
	 *
	 * Iterates over nodes added to this document fragment.
	 *
	 * @returns {Iterable.<module:engine/view/node~Node>}
	 */
	public [ Symbol.iterator ](): IterableIterator<Node> {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Number of child nodes in this document fragment.
	 *
	 * @readonly
	 * @type {Number}
	 */
	public get childCount(): number {
		return this._children.length;
	}

	/**
	 * Is `true` if there are no nodes inside this document fragment, `false` otherwise.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	public get isEmpty(): boolean {
		return this.childCount === 0;
	}

	/**
	 * Artificial root of `DocumentFragment`. Returns itself. Added for compatibility reasons.
	 *
	 * @readonly
	 * @type {module:engine/model/documentfragment~DocumentFragment}
	 */
	public get root(): this {
		return this;
	}

	/**
	 * Artificial parent of `DocumentFragment`. Returns `null`. Added for compatibility reasons.
	 *
	 * @readonly
	 * @type {null}
	 */
	public get parent(): null {
		return null;
	}

	/**
	 * Returns the custom property value for the given key.
	 *
	 * @param {String|Symbol} key
	 * @returns {*}
	 */
	public getCustomProperty( key: string | symbol ): unknown {
		return this._customProperties.get( key );
	}

	/**
	 * Returns an iterator which iterates over this document fragment's custom properties.
	 * Iterator provides `[ key, value ]` pairs for each stored property.
	 *
	 * @returns {Iterable.<*>}
	 */
	public* getCustomProperties(): Iterable<[ string | symbol, unknown ]> {
		yield* this._customProperties.entries();
	}

	/**
	 * {@link module:engine/view/documentfragment~DocumentFragment#_insertChild Insert} a child node or a list of child nodes at the end
	 * and sets the parent of these nodes to this fragment.
	 *
	 * @param {module:engine/view/item~Item|Iterable.<module:engine/view/item~Item>} items Items to be inserted.
	 * @returns {Number} Number of appended nodes.
	 */
	public _appendChild( items: Item | string | Iterable<Item | string> ): number {
		return this._insertChild( this.childCount, items );
	}

	/**
	 * Gets child at the given index.
	 *
	 * @param {Number} index Index of child.
	 * @returns {module:engine/view/node~Node} Child node.
	 */
	public getChild( index: number ): Node {
		return this._children[ index ];
	}

	/**
	 * Gets index of the given child node. Returns `-1` if child node is not found.
	 *
	 * @param {module:engine/view/node~Node} node Child node.
	 * @returns {Number} Index of the child node.
	 */
	public getChildIndex( node: Node ): number {
		return this._children.indexOf( node );
	}

	/**
	 * Gets child nodes iterator.
	 *
	 * @returns {Iterable.<module:engine/view/node~Node>} Child nodes iterator.
	 */
	public getChildren(): IterableIterator<Node> {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
	 * this fragment.
	 *
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {module:engine/view/item~Item|Iterable.<module:engine/view/item~Item>} items Items to be inserted.
	 * @returns {Number} Number of inserted nodes.
	 */
	public _insertChild( index: number, items: Item | string | Iterable<Item | string> ): number {
		this._fireChange( 'children', this );
		let count = 0;

		const nodes = normalize( this.document, items );

		for ( const node of nodes ) {
			// If node that is being added to this element is already inside another element, first remove it from the old parent.
			if ( node.parent !== null ) {
				node._remove();
			}

			node.parent = this;

			this._children.splice( index, 0, node );
			index++;
			count++;
		}

		return count;
	}

	/**
	 * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * @internal
	 * @param {Number} index Number of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @returns {Array.<module:engine/view/node~Node>} The array of removed nodes.
	 */
	public _removeChildren( index: number, howMany: number = 1 ): Array<Node> {
		this._fireChange( 'children', this );

		for ( let i = index; i < index + howMany; i++ ) {
			this._children[ i ].parent = null;
		}

		return this._children.splice( index, howMany );
	}

	/**
	 * Fires `change` event with given type of the change.
	 *
	 * @private
	 * @param {module:engine/view/document~ChangeType} type Type of the change.
	 * @param {module:engine/view/node~Node} node Changed node.
	 * @fires module:engine/view/node~Node#change
	 */
	public _fireChange( type: ChangeType, node: Node | DocumentFragment ): void {
		this.fire( 'change:' + type, node );
	}

	/**
	 * Sets a custom property. They can be used to add special data to elements.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#setCustomProperty
	 * @protected
	 * @param {String|Symbol} key
	 * @param {*} value
	 */
	public _setCustomProperty( key: string | symbol, value: unknown ): void {
		this._customProperties.set( key, value );
	}

	/**
	 * Removes the custom property stored under the given key.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#removeCustomProperty
	 * @protected
	 * @param {String|Symbol} key
	 * @returns {Boolean} Returns true if property was removed.
	 */
	public _removeCustomProperty( key: string | symbol ): boolean {
		return this._customProperties.delete( key );
	}

	// @if CK_DEBUG_ENGINE // printTree() {
	// @if CK_DEBUG_ENGINE //	let string = 'ViewDocumentFragment: [';

	// @if CK_DEBUG_ENGINE //	for ( const child of this.getChildren() ) {
	// @if CK_DEBUG_ENGINE //		if ( child.is( '$text' ) ) {
	// @if CK_DEBUG_ENGINE //			string += '\n' + '\t'.repeat( 1 ) + child.data;
	// @if CK_DEBUG_ENGINE //		} else {
	// @if CK_DEBUG_ENGINE //			string += '\n' + child.printTree( 1 );
	// @if CK_DEBUG_ENGINE //		}
	// @if CK_DEBUG_ENGINE //	}

	// @if CK_DEBUG_ENGINE //	string += '\n]';

	// @if CK_DEBUG_ENGINE //	return string;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // logTree() {
	// @if CK_DEBUG_ENGINE // 	console.log( this.printTree() );
	// @if CK_DEBUG_ENGINE // }
}

/**
 * Checks whether this object is of the given type.
 *
 *		docFrag.is( 'documentFragment' ); // -> true
 *		docFrag.is( 'view:documentFragment' ); // -> true
 *
 *		docFrag.is( 'model:documentFragment' ); // -> false
 *		docFrag.is( 'element' ); // -> false
 *		docFrag.is( 'node' ); // -> false
 *
 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
 *
 * @param {String} type
 * @returns {Boolean}
 */
DocumentFragment.prototype.is = function( type: string ): boolean {
	return type === 'documentFragment' || type === 'view:documentFragment';
};

// Converts strings to Text and non-iterables to arrays.
//
// @param {String|module:engine/view/item~Item|Iterable.<String|module:engine/view/item~Item>}
// @returns {Iterable.<module:engine/view/node~Node>}
function normalize( document: Document, nodes: Item | string | Iterable<Item | string> ): Array<Node> {
	// Separate condition because string is iterable.
	if ( typeof nodes == 'string' ) {
		return [ new Text( document, nodes ) ];
	}

	if ( !isIterable( nodes ) ) {
		nodes = [ nodes ];
	}

	// Array.from to enable .map() on non-arrays.
	return Array.from( nodes )
		.map( node => {
			if ( typeof node == 'string' ) {
				return new Text( document, node );
			}

			if ( node instanceof TextProxy ) {
				return new Text( document, node.data );
			}

			return node;
		} );
}
