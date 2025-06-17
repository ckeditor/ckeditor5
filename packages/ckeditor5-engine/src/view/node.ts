/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/node
 */

import { ViewTypeCheckable } from './typecheckable.js';

import {
	CKEditorError,
	EmitterMixin,
	compareArrays
} from '@ckeditor/ckeditor5-utils';

import { clone } from 'es-toolkit/compat';

import type { ViewDocument, ViewDocumentChangeType } from './document.js';
import { type ViewDocumentFragment } from './documentfragment.js';
import { type ViewElement } from './element.js';

/**
 * Abstract view node class.
 *
 * This is an abstract class. Its constructor should not be used directly.
 * Use the {@link module:engine/view/downcastwriter~ViewDowncastWriter} or {@link module:engine/view/upcastwriter~ViewUpcastWriter}
 * to create new instances of view nodes.
 */
export abstract class ViewNode extends /* #__PURE__ */ EmitterMixin( ViewTypeCheckable ) {
	/**
	 * The document instance to which this node belongs.
	 */
	public readonly document: ViewDocument;

	/**
	 * Parent element. Null by default. Set by {@link module:engine/view/element~ViewElement#_insertChild}.
	 */
	public readonly parent: ViewElement | ViewDocumentFragment | null;

	/**
	 * Creates a tree view node.
	 *
	 * @param document The document instance to which this node belongs.
	 */
	protected constructor( document: ViewDocument ) {
		super();

		this.document = document;
		this.parent = null;
	}

	/**
	 * Index of the node in the parent element or null if the node has no parent.
	 *
	 * Accessing this property throws an error if this node's parent element does not contain it.
	 * This means that view tree got broken.
	 */
	public get index(): number | null {
		let pos;

		if ( !this.parent ) {
			return null;
		}

		// No parent or child doesn't exist in parent's children.
		if ( ( pos = this.parent.getChildIndex( this ) ) == -1 ) {
			/**
			 * The node's parent does not contain this node. It means that the document tree is corrupted.
			 *
			 * @error view-node-not-found-in-parent
			 */
			throw new CKEditorError( 'view-node-not-found-in-parent', this );
		}

		return pos;
	}

	/**
	 * Node's next sibling, or `null` if it is the last child.
	 */
	public get nextSibling(): ViewNode | null {
		const index = this.index;

		return ( index !== null && this.parent!.getChild( index + 1 ) ) || null;
	}

	/**
	 * Node's previous sibling, or `null` if it is the first child.
	 */
	public get previousSibling(): ViewNode | null {
		const index = this.index;

		return ( index !== null && this.parent!.getChild( index - 1 ) ) || null;
	}

	/**
	 * Top-most ancestor of the node. If the node has no parent it is the root itself.
	 */
	public get root(): ViewElement | ViewDocumentFragment {
		// eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
		let root: ViewNode | ViewDocumentFragment = this;

		while ( root.parent ) {
			root = root.parent;
		}

		return root as any;
	}

	/**
	 * Returns true if the node is in a tree rooted in the document (is a descendant of one of its roots).
	 */
	public isAttached(): boolean {
		return this.root.is( 'rootElement' );
	}

	/**
	 * Gets a path to the node. The path is an array containing indices of consecutive ancestors of this node,
	 * beginning from {@link module:engine/view/node~ViewNode#root root}, down to this node's index.
	 *
	 * ```ts
	 * const abc = downcastWriter.createText( 'abc' );
	 * const foo = downcastWriter.createText( 'foo' );
	 * const h1 = downcastWriter.createElement( 'h1', null, downcastWriter.createText( 'header' ) );
	 * const p = downcastWriter.createElement( 'p', null, [ abc, foo ] );
	 * const div = downcastWriter.createElement( 'div', null, [ h1, p ] );
	 * foo.getPath(); // Returns [ 1, 3 ]. `foo` is in `p` which is in `div`. `p` starts at offset 1, while `foo` at 3.
	 * h1.getPath(); // Returns [ 0 ].
	 * div.getPath(); // Returns [].
	 * ```
	 *
	 * @returns The path.
	 */
	public getPath(): Array<number> {
		const path = [];
		// eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
		let node: ViewNode | ViewDocumentFragment = this;

		while ( node.parent ) {
			path.unshift( node.index! );
			node = node.parent;
		}

		return path;
	}

	/**
	 * Returns ancestors array of this node.
	 *
	 * @param options Options object.
	 * @param options.includeSelf When set to `true` this node will be also included in parent's array.
	 * @param options.parentFirst When set to `true`, array will be sorted from node's parent to root element,
	 * otherwise root element will be the first item in the array.
	 * @returns Array with ancestors.
	 */
	public getAncestors( options: { includeSelf?: boolean; parentFirst?: boolean } = {} ): Array<ViewNode | ViewDocumentFragment> {
		const ancestors: Array<ViewNode | ViewDocumentFragment> = [];
		let parent = options.includeSelf ? this : this.parent;

		while ( parent ) {
			ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
			parent = parent.parent;
		}

		return ancestors;
	}

	/**
	 * Returns a {@link module:engine/view/element~ViewElement} or {@link module:engine/view/documentfragment~ViewDocumentFragment}
	 * which is a common ancestor of both nodes.
	 *
	 * @param node The second node.
	 * @param options Options object.
	 * @param options.includeSelf When set to `true` both nodes will be considered "ancestors" too.
	 * Which means that if e.g. node A is inside B, then their common ancestor will be B.
	 */
	public getCommonAncestor( node: ViewNode, options: { includeSelf?: boolean } = {} ): ViewElement | ViewDocumentFragment | null {
		const ancestorsA = this.getAncestors( options );
		const ancestorsB = node.getAncestors( options );

		let i = 0;

		while ( ancestorsA[ i ] == ancestorsB[ i ] && ancestorsA[ i ] ) {
			i++;
		}

		return i === 0 ? null : ancestorsA[ i - 1 ] as ( ViewElement | ViewDocumentFragment );
	}

	/**
	 * Returns whether this node is before given node. `false` is returned if nodes are in different trees (for example,
	 * in different {@link module:engine/view/documentfragment~ViewDocumentFragment}s).
	 *
	 * @param node Node to compare with.
	 */
	public isBefore( node: ViewNode ): boolean {
		// Given node is not before this node if they are same.
		if ( this == node ) {
			return false;
		}

		// Return `false` if it is impossible to compare nodes.
		if ( this.root !== node.root ) {
			return false;
		}

		const thisPath = this.getPath();
		const nodePath = node.getPath();

		const result = compareArrays( thisPath, nodePath );

		switch ( result ) {
			case 'prefix':
				return true;

			case 'extension':
				return false;

			default:
				return thisPath[ result as number ] < nodePath[ result as number ];
		}
	}

	/**
	 * Returns whether this node is after given node. `false` is returned if nodes are in different trees (for example,
	 * in different {@link module:engine/view/documentfragment~ViewDocumentFragment}s).
	 *
	 * @param node Node to compare with.
	 */
	public isAfter( node: ViewNode ): boolean {
		// Given node is not before this node if they are same.
		if ( this == node ) {
			return false;
		}

		// Return `false` if it is impossible to compare nodes.
		if ( this.root !== node.root ) {
			return false;
		}

		// In other cases, just check if the `node` is before, and return the opposite.
		return !this.isBefore( node );
	}

	/**
	 * Removes node from parent.
	 *
	 * @internal
	 */
	public _remove(): void {
		this.parent!._removeChildren( this.index! );
	}

	/**
	 * @internal
	 * @param type Type of the change.
	 * @param node Changed node.
	 * @param data Additional data.
	 * @fires change
	 */
	public _fireChange( type: ViewDocumentChangeType, node: ViewNode, data?: { index: number } ): void {
		this.fire( `change:${ type }`, node, data );

		if ( this.parent ) {
			this.parent._fireChange( type, node, data );
		}
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @returns Clone of this object with the parent property removed.
	 */
	public toJSON(): unknown {
		const json: any = clone( this );

		// Due to circular references we need to remove parent reference.
		delete json.parent;

		return json;
	}

	/**
	 * Clones this node.
	 *
	 * @internal
	 * @returns Clone of this node.
	 */
	public abstract _clone( deep?: boolean ): ViewNode;

	/**
	 * Checks if provided node is similar to this node.
	 *
	 * @returns True if nodes are similar.
	 */
	public abstract isSimilar( other: ViewNode ): boolean;
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
ViewNode.prototype.is = function( type: string ): boolean {
	return type === 'node' || type === 'view:node';
};

/**
 * Fired when list of {@link module:engine/view/element~ViewElement elements} children, attributes or text changes.
 *
 * Change event is bubbled – it is fired on all ancestors.
 *
 * All change events as the first parameter receive the node that has changed (the node for which children, attributes or text changed).
 *
 * If `change:children` event is fired, there is an additional second parameter, which is an object with additional data related to change.
 *
 * @eventName ~ViewNode#change
 * @eventName ~ViewNode#change:children
 * @eventName ~ViewNode#change:attributes
 * @eventName ~ViewNode#change:text
 */
export type ViewNodeChangeEvent = {
	name: 'change' | `change:${ ViewDocumentChangeType }`;
	args: [ changedNode: ViewNode, data?: { index: number } ];
};
