/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/documentfragment
 */

import TypeCheckable from './typecheckable.js';
import Text from './text.js';
import TextProxy from './textproxy.js';

import { EmitterMixin, isIterable } from '@ckeditor/ckeditor5-utils';

import type { default as Document, ChangeType } from './document.js';

import type Item from './item.js';
import type Node from './node.js';

/**
 * Document fragment.
 *
 * To create a new document fragment instance use the
 * {@link module:engine/view/upcastwriter~UpcastWriter#createDocumentFragment `UpcastWriter#createDocumentFragment()`}
 * method.
 */
export default class DocumentFragment extends /* #__PURE__ */ EmitterMixin( TypeCheckable ) implements Iterable<Node> {
	/**
	 * The document to which this document fragment belongs.
	 */
	public readonly document: Document;

	/**
	 * Array of child nodes.
	 */
	private readonly _children: Array<Node> = [];

	/**
	 * Map of custom properties.
	 * Custom properties can be added to document fragment instance.
	 */
	private readonly _customProperties = new Map<string | symbol, unknown>();

	/**
	 * Creates new DocumentFragment instance.
	 *
	 * @internal
	 * @param document The document to which this document fragment belongs.
	 * @param children A list of nodes to be inserted into the created document fragment.
	 */
	constructor( document: Document, children?: Node | Iterable<Node> ) {
		super();

		this.document = document;

		if ( children ) {
			this._insertChild( 0, children );
		}
	}

	/**
	 * Iterable interface.
	 *
	 * Iterates over nodes added to this document fragment.
	 */
	public [ Symbol.iterator ](): Iterator<Node> {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Number of child nodes in this document fragment.
	 */
	public get childCount(): number {
		return this._children.length;
	}

	/**
	 * Is `true` if there are no nodes inside this document fragment, `false` otherwise.
	 */
	public get isEmpty(): boolean {
		return this.childCount === 0;
	}

	/**
	 * Artificial root of `DocumentFragment`. Returns itself. Added for compatibility reasons.
	 */
	public get root(): this {
		return this;
	}

	/**
	 * Artificial parent of `DocumentFragment`. Returns `null`. Added for compatibility reasons.
	 */
	public get parent(): null {
		return null;
	}

	/**
	 * Artificial element name. Returns `undefined`. Added for compatibility reasons.
	 */
	public get name(): undefined {
		return undefined;
	}

	/**
	 * Artificial element getFillerOffset. Returns `undefined`. Added for compatibility reasons.
	 */
	public get getFillerOffset(): undefined {
		return undefined;
	}

	/**
	 * Returns the custom property value for the given key.
	 */
	public getCustomProperty( key: string | symbol ): unknown {
		return this._customProperties.get( key );
	}

	/**
	 * Returns an iterator which iterates over this document fragment's custom properties.
	 * Iterator provides `[ key, value ]` pairs for each stored property.
	 */
	public* getCustomProperties(): Iterable<[ string | symbol, unknown ]> {
		yield* this._customProperties.entries();
	}

	/**
	 * {@link module:engine/view/documentfragment~DocumentFragment#_insertChild Insert} a child node or a list of child nodes at the end
	 * and sets the parent of these nodes to this fragment.
	 *
	 * @internal
	 * @param items Items to be inserted.
	 * @returns Number of appended nodes.
	 */
	public _appendChild( items: Item | string | Iterable<Item | string> ): number {
		return this._insertChild( this.childCount, items );
	}

	/**
	 * Gets child at the given index.
	 *
	 * @param index Index of child.
	 * @returns Child node.
	 */
	public getChild( index: number ): Node {
		return this._children[ index ];
	}

	/**
	 * Gets index of the given child node. Returns `-1` if child node is not found.
	 *
	 * @param node Child node.
	 * @returns Index of the child node.
	 */
	public getChildIndex( node: Node ): number {
		return this._children.indexOf( node );
	}

	/**
	 * Gets child nodes iterator.
	 *
	 * @returns Child nodes iterator.
	 */
	public getChildren(): IterableIterator<Node> {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
	 * this fragment.
	 *
	 * @internal
	 * @param index Position where nodes should be inserted.
	 * @param items Items to be inserted.
	 * @returns Number of inserted nodes.
	 */
	public _insertChild( index: number, items: Item | string | Iterable<Item | string> ): number {
		this._fireChange( 'children', this, { index } );
		let count = 0;

		const nodes = normalize( this.document, items );

		for ( const node of nodes ) {
			// If node that is being added to this element is already inside another element, first remove it from the old parent.
			if ( node.parent !== null ) {
				node._remove();
			}

			( node as any ).parent = this;

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
	 * @param index Number of the first node to remove.
	 * @param howMany Number of nodes to remove.
	 * @returns The array of removed nodes.
	 */
	public _removeChildren( index: number, howMany: number = 1 ): Array<Node> {
		this._fireChange( 'children', this, { index } );

		for ( let i = index; i < index + howMany; i++ ) {
			( this._children[ i ] as any ).parent = null;
		}

		return this._children.splice( index, howMany );
	}

	/**
	 * @internal
	 * @param type Type of the change.
	 * @param node Changed node.
	 * @param data Additional data.
	 * @fires module:engine/view/node~Node#event:change
	 */
	public _fireChange( type: ChangeType, node: Node | DocumentFragment, data?: { index: number } ): void {
		this.fire( `change:${ type }`, node, data );
	}

	/**
	 * Sets a custom property. They can be used to add special data to elements.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#setCustomProperty
	 * @internal
	 */
	public _setCustomProperty( key: string | symbol, value: unknown ): void {
		this._customProperties.set( key, value );
	}

	/**
	 * Removes the custom property stored under the given key.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#removeCustomProperty
	 * @internal
	 * @returns Returns true if property was removed.
	 */
	public _removeCustomProperty( key: string | symbol ): boolean {
		return this._customProperties.delete( key );
	}

	// @if CK_DEBUG_ENGINE // public printTree(): string {
	// @if CK_DEBUG_ENGINE // 	let string = 'ViewDocumentFragment: [';

	// @if CK_DEBUG_ENGINE // 	for ( const child of this.getChildren() as any ) {
	// @if CK_DEBUG_ENGINE // 		if ( child.is( '$text' ) ) {
	// @if CK_DEBUG_ENGINE // 			string += '\n' + '\t'.repeat( 1 ) + child.data;
	// @if CK_DEBUG_ENGINE // 		} else {
	// @if CK_DEBUG_ENGINE // 			string += '\n' + child.printTree( 1 );
	// @if CK_DEBUG_ENGINE // 		}
	// @if CK_DEBUG_ENGINE // 	}

	// @if CK_DEBUG_ENGINE // 	string += '\n]';

	// @if CK_DEBUG_ENGINE // 	return string;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // public logTree(): void {
	// @if CK_DEBUG_ENGINE // 	console.log( this.printTree() );
	// @if CK_DEBUG_ENGINE // }
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
DocumentFragment.prototype.is = function( type: string ): boolean {
	return type === 'documentFragment' || type === 'view:documentFragment';
};

/**
 * Converts strings to Text and non-iterables to arrays.
 */
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
