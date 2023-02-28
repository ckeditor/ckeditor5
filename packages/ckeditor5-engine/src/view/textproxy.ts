/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/textproxy
 */

import TypeCheckable from './typecheckable';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import type Document from './document';
import type DocumentFragment from './documentfragment';
import type Element from './element';
import type Node from './node';
import type Text from './text';

/**
 * TextProxy is a wrapper for substring of {@link module:engine/view/text~Text}. Instance of this class is created by
 * {@link module:engine/view/treewalker~TreeWalker} when only a part of {@link module:engine/view/text~Text} needs to be returned.
 *
 * `TextProxy` has an API similar to {@link module:engine/view/text~Text Text} and allows to do most of the common tasks performed
 * on view nodes.
 *
 * **Note:** Some `TextProxy` instances may represent whole text node, not just a part of it.
 * See {@link module:engine/view/textproxy~TextProxy#isPartial}.
 *
 * **Note:** `TextProxy` is a readonly interface.
 *
 * **Note:** `TextProxy` instances are created on the fly basing on the current state of parent {@link module:engine/view/text~Text}.
 * Because of this it is highly unrecommended to store references to `TextProxy instances because they might get
 * invalidated due to operations on Document. Also TextProxy is not a {@link module:engine/view/node~Node} so it can not be
 * inserted as a child of {@link module:engine/view/element~Element}.
 *
 * `TextProxy` instances are created by {@link module:engine/view/treewalker~TreeWalker view tree walker}. You should not need to create
 * an instance of this class by your own.
 */
export default class TextProxy extends TypeCheckable {
	public readonly textNode: Text;
	public readonly data: string;
	public readonly offsetInText: number;

	/**
	 * Creates a text proxy.
	 *
	 * @protected
	 * @param {module:engine/view/text~Text} textNode Text node which part is represented by this text proxy.
	 * @param {Number} offsetInText Offset in {@link module:engine/view/textproxy~TextProxy#textNode text node}
	 * from which the text proxy starts.
	 * @param {Number} length Text proxy length, that is how many text node's characters, starting from `offsetInText` it represents.
	 * @constructor
	 */
	constructor( textNode: Text, offsetInText: number, length: number ) {
		super();

		/**
		 * Reference to the {@link module:engine/view/text~Text} element which TextProxy is a substring.
		 *
		 * @readonly
		 * @member {module:engine/view/text~Text} module:engine/view/textproxy~TextProxy#textNode
		 */
		this.textNode = textNode;

		if ( offsetInText < 0 || offsetInText > textNode.data.length ) {
			/**
			 * Given offsetInText value is incorrect.
			 *
			 * @error view-textproxy-wrong-offsetintext
			 */
			throw new CKEditorError( 'view-textproxy-wrong-offsetintext', this );
		}

		if ( length < 0 || offsetInText + length > textNode.data.length ) {
			/**
			 * Given length value is incorrect.
			 *
			 * @error view-textproxy-wrong-length
			 */
			throw new CKEditorError( 'view-textproxy-wrong-length', this );
		}

		/**
		 * Text data represented by this text proxy.
		 *
		 * @readonly
		 * @member {String} module:engine/view/textproxy~TextProxy#data
		 */
		this.data = textNode.data.substring( offsetInText, offsetInText + length );

		/**
		 * Offset in the `textNode` where this `TextProxy` instance starts.
		 *
		 * @readonly
		 * @member {Number} module:engine/view/textproxy~TextProxy#offsetInText
		 */
		this.offsetInText = offsetInText;
	}

	/**
	 * Offset size of this node.
	 *
	 * @readonly
	 * @type {Number}
	 */
	public get offsetSize(): number {
		return this.data.length;
	}

	/**
	 * Flag indicating whether `TextProxy` instance covers only part of the original {@link module:engine/view/text~Text text node}
	 * (`true`) or the whole text node (`false`).
	 *
	 * This is `false` when text proxy starts at the very beginning of {@link module:engine/view/textproxy~TextProxy#textNode textNode}
	 * ({@link module:engine/view/textproxy~TextProxy#offsetInText offsetInText} equals `0`) and text proxy sizes is equal to
	 * text node size.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	public get isPartial(): boolean {
		return this.data.length !== this.textNode.data.length;
	}

	/**
	 * Parent of this text proxy, which is same as parent of text node represented by this text proxy.
	 *
	 * @readonly
	 * @type {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment|null}
	 */
	public get parent(): Element | DocumentFragment | null {
		return this.textNode.parent;
	}

	/**
	 * Root of this text proxy, which is same as root of text node represented by this text proxy.
	 *
	 * @readonly
	 * @type {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment}
	 */
	public get root(): Node | DocumentFragment {
		return this.textNode.root;
	}

	/**
	 * {@link module:engine/view/document~Document View document} that owns this text proxy, or `null` if the text proxy is inside
	 * {@link module:engine/view/documentfragment~DocumentFragment document fragment}.
	 *
	 * @readonly
	 * @type {module:engine/view/document~Document|null}
	 */
	public get document(): Document | null {
		return this.textNode.document;
	}

	/**
	 * Returns ancestors array of this text proxy.
	 *
	 * @param {Object} options Options object.
	 * @param {Boolean} [options.includeSelf=false] When set to `true` {#textNode} will be also included in parent's array.
	 * @param {Boolean} [options.parentFirst=false] When set to `true`, array will be sorted from text proxy parent to
	 * root element, otherwise root element will be the first item in the array.
	 * @returns {Array} Array with ancestors.
	 */
	public getAncestors( options: {
		includeSelf?: boolean;
		parentFirst?: boolean;
	} = {} ): Array<Text | Element | DocumentFragment> {
		const ancestors: Array<Text | Element | DocumentFragment> = [];
		let parent: Text | Element | DocumentFragment | null = options.includeSelf ? this.textNode : this.parent;

		while ( parent !== null ) {
			ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
			parent = parent.parent;
		}

		return ancestors;
	}

	// @if CK_DEBUG_ENGINE // toString() {
	// @if CK_DEBUG_ENGINE // 	return `#${ this.data }`;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // log() {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ViewTextProxy: ' + this );
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // logExtended() {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ViewTextProxy: ' + this );
	// @if CK_DEBUG_ENGINE // }
}

/**
 * Checks whether this object is of the given type.
 *
 *		textProxy.is( '$textProxy' ); // -> true
 *		textProxy.is( 'view:$textProxy' ); // -> true
 *
 *		textProxy.is( 'model:$textProxy' ); // -> false
 *		textProxy.is( 'element' ); // -> false
 *		textProxy.is( 'range' ); // -> false
 *
 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
 *
 * **Note:** Until version 20.0.0 this method wasn't accepting `'$textProxy'` type. The legacy `'textProxy'` type is still
 * accepted for backward compatibility.
 *
 * @param {String} type Type to check.
 * @returns {Boolean}
 */
TextProxy.prototype.is = function( type: string ): boolean {
	return type === '$textProxy' || type === 'view:$textProxy' ||
		// This are legacy values kept for backward compatibility.
		type === 'textProxy' || type === 'view:textProxy';
};
