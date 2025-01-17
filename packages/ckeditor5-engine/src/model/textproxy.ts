/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/textproxy
 */

import TypeCheckable from './typecheckable.js';
import type DocumentFragment from './documentfragment.js';
import type Element from './element.js';
import type Node from './node.js';
import type Text from './text.js';

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

// @if CK_DEBUG_ENGINE // const { convertMapToStringifiedObject } = require( '../dev-utils/utils' );

/**
 * `TextProxy` represents a part of {@link module:engine/model/text~Text text node}.
 *
 * Since {@link module:engine/model/position~Position positions} can be placed between characters of a text node,
 * {@link module:engine/model/range~Range ranges} may contain only parts of text nodes. When {@link module:engine/model/range~Range#getItems
 * getting items}
 * contained in such range, we need to represent a part of that text node, since returning the whole text node would be incorrect.
 * `TextProxy` solves this issue.
 *
 * `TextProxy` has an API similar to {@link module:engine/model/text~Text Text} and allows to do most of the common tasks performed
 * on model nodes.
 *
 * **Note:** Some `TextProxy` instances may represent whole text node, not just a part of it.
 * See {@link module:engine/model/textproxy~TextProxy#isPartial}.
 *
 * **Note:** `TextProxy` is not an instance of {@link module:engine/model/node~Node node}. Keep this in mind when using it as a
 * parameter of methods.
 *
 * **Note:** `TextProxy` is a readonly interface. If you want to perform changes on model data represented by a `TextProxy`
 * use {@link module:engine/model/writer~Writer model writer API}.
 *
 * **Note:** `TextProxy` instances are created on the fly, basing on the current state of model. Because of this, it is
 * highly unrecommended to store references to `TextProxy` instances. `TextProxy` instances are not refreshed when
 * model changes, so they might get invalidated. Instead, consider creating {@link module:engine/model/liveposition~LivePosition live
 * position}.
 *
 * `TextProxy` instances are created by {@link module:engine/model/treewalker~TreeWalker model tree walker}. You should not need to create
 * an instance of this class by your own.
 */
export default class TextProxy extends TypeCheckable {
	/**
	 * Text node which part is represented by this text proxy.
	 */
	public readonly textNode: Text;

	/**
	 * Text data represented by this text proxy.
	 */
	public readonly data: string;

	/**
	 * Offset in {@link module:engine/model/textproxy~TextProxy#textNode text node} from which the text proxy starts.
	 */
	public readonly offsetInText: number;

	/**
	 * Creates a text proxy.
	 *
	 * @internal
	 * @param textNode Text node which part is represented by this text proxy.
	 * @param offsetInText Offset in {@link module:engine/model/textproxy~TextProxy#textNode text node} from which the text proxy
	 * starts.
	 * @param length Text proxy length, that is how many text node's characters, starting from `offsetInText` it represents.
	 */
	constructor( textNode: Text, offsetInText: number, length: number ) {
		super();

		this.textNode = textNode;

		if ( offsetInText < 0 || offsetInText > textNode.offsetSize ) {
			/**
			 * Given `offsetInText` value is incorrect.
			 *
			 * @error model-textproxy-wrong-offsetintext
			 */
			throw new CKEditorError( 'model-textproxy-wrong-offsetintext', this );
		}

		if ( length < 0 || offsetInText + length > textNode.offsetSize ) {
			/**
			 * Given `length` value is incorrect.
			 *
			 * @error model-textproxy-wrong-length
			 */
			throw new CKEditorError( 'model-textproxy-wrong-length', this );
		}
		this.data = textNode.data.substring( offsetInText, offsetInText + length );

		this.offsetInText = offsetInText;
	}

	/**
	 * Offset at which this text proxy starts in it's parent.
	 *
	 * @see module:engine/model/node~Node#startOffset
	 */
	public get startOffset(): number | null {
		return this.textNode.startOffset !== null ? this.textNode.startOffset + this.offsetInText : null;
	}

	/**
	 * Offset size of this text proxy. Equal to the number of characters represented by the text proxy.
	 *
	 * @see module:engine/model/node~Node#offsetSize
	 */
	public get offsetSize(): number {
		return this.data.length;
	}

	/**
	 * Offset at which this text proxy ends in it's parent.
	 *
	 * @see module:engine/model/node~Node#endOffset
	 */
	public get endOffset(): number | null {
		return this.startOffset !== null ? this.startOffset + this.offsetSize : null;
	}

	/**
	 * Flag indicating whether `TextProxy` instance covers only part of the original {@link module:engine/model/text~Text text node}
	 * (`true`) or the whole text node (`false`).
	 *
	 * This is `false` when text proxy starts at the very beginning of {@link module:engine/model/textproxy~TextProxy#textNode textNode}
	 * ({@link module:engine/model/textproxy~TextProxy#offsetInText offsetInText} equals `0`) and text proxy sizes is equal to
	 * text node size.
	 */
	public get isPartial(): boolean {
		return this.offsetSize !== this.textNode.offsetSize;
	}

	/**
	 * Parent of this text proxy, which is same as parent of text node represented by this text proxy.
	 */
	public get parent(): Element | DocumentFragment | null {
		return this.textNode.parent;
	}

	/**
	 * Root of this text proxy, which is same as root of text node represented by this text proxy.
	 */
	public get root(): Node | DocumentFragment {
		return this.textNode.root;
	}

	/**
	 * Gets path to this text proxy.
	 *
	 * @see module:engine/model/node~Node#getPath
	 */
	public getPath(): Array<number> {
		const path = this.textNode.getPath();

		if ( path.length > 0 ) {
			path[ path.length - 1 ] += this.offsetInText;
		}

		return path;
	}

	/**
	 * Returns ancestors array of this text proxy.
	 *
	 * @param options Options object.
	 * @param options.includeSelf When set to `true` this text proxy will be also included in parent's array.
	 * @param options.parentFirst When set to `true`, array will be sorted from text proxy parent to root element,
	 * otherwise root element will be the first item in the array.
	 * @returns Array with ancestors.
	 */
	public getAncestors( options: {
		includeSelf?: boolean;
		parentFirst?: boolean;
	} = {} ): Array<TextProxy | Element | DocumentFragment> {
		const ancestors: Array<TextProxy | Element | DocumentFragment> = [];
		let parent: TextProxy | Element | DocumentFragment | null = options.includeSelf ? this : this.parent;

		while ( parent ) {
			ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
			parent = parent.parent;
		}

		return ancestors;
	}

	/**
	 * Checks if this text proxy has an attribute for given key.
	 *
	 * @param key Key of attribute to check.
	 * @returns `true` if attribute with given key is set on text proxy, `false` otherwise.
	 */
	public hasAttribute( key: string ): boolean {
		return this.textNode.hasAttribute( key );
	}

	/**
	 * Gets an attribute value for given key or `undefined` if that attribute is not set on text proxy.
	 *
	 * @param key Key of attribute to look for.
	 * @returns Attribute value or `undefined`.
	 */
	public getAttribute( key: string ): unknown {
		return this.textNode.getAttribute( key );
	}

	/**
	 * Returns iterator that iterates over this node's attributes. Attributes are returned as arrays containing two
	 * items. First one is attribute key and second is attribute value.
	 *
	 * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
	 */
	public getAttributes(): IterableIterator<[ string, unknown ]> {
		return this.textNode.getAttributes();
	}

	/**
	 * Returns iterator that iterates over this node's attribute keys.
	 */
	public getAttributeKeys(): IterableIterator<string> {
		return this.textNode.getAttributeKeys();
	}

	// @if CK_DEBUG_ENGINE // public override toString(): string {
	// @if CK_DEBUG_ENGINE // 	return `#${ this.data }`;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // public log(): void {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ModelTextProxy: ' + this );
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // public logExtended(): void {
	// @if CK_DEBUG_ENGINE // 	console.log( `ModelTextProxy: ${ this }, ` +
	// @if CK_DEBUG_ENGINE // 		`attrs: ${ convertMapToStringifiedObject( this.getAttributes() ) }` );
	// @if CK_DEBUG_ENGINE // }
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
TextProxy.prototype.is = function( type: string ): boolean {
	return type === '$textProxy' || type === 'model:$textProxy' ||
		// This are legacy values kept for backward compatibility.
		type === 'textProxy' || type === 'model:textProxy';
};
