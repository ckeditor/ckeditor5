/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/textproxy
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

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
export default class TextProxy {
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
	constructor( textNode, offsetInText, length ) {
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
			throw new CKEditorError( 'view-textproxy-wrong-offsetintext: Given offsetInText value is incorrect.' );
		}

		if ( length < 0 || offsetInText + length > textNode.data.length ) {
			/**
			 * Given length value is incorrect.
			 *
			 * @error view-textproxy-wrong-length
			 */
			throw new CKEditorError( 'view-textproxy-wrong-length: Given length value is incorrect.' );
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
	get isPartial() {
		return this.data.length !== this.textNode.data.length;
	}

	/**
	 * Parent of this text proxy, which is same as parent of text node represented by this text proxy.
	 *
	 * @readonly
	 * @type {module:engine/view/element~Element|module:engine/view/documentfragment~DocumentFragment|null}
	 */
	get parent() {
		return this.textNode.parent;
	}

	/**
	 * Root of this text proxy, which is same as root of text node represented by this text proxy.
	 *
	 * @readonly
	 * @type {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment}
	 */
	get root() {
		return this.textNode.root;
	}

	/**
	 * {@link module:engine/view/document~Document View document} that owns this text proxy, or `null` if the text proxy is inside
	 * {@link module:engine/view/documentfragment~DocumentFragment document fragment}.
	 *
	 * @readonly
	 * @type {module:engine/view/document~Document|null}
	 */
	get document() {
		return this.textNode.document;
	}

	/**
	 * Checks whether given view tree object is of given type.
	 *
	 * Read more in {@link module:engine/view/node~Node#is}.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	is( type ) {
		return type == 'textProxy';
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
	getAncestors( options = { includeSelf: false, parentFirst: false } ) {
		const ancestors = [];
		let parent = options.includeSelf ? this.textNode : this.parent;

		while ( parent !== null ) {
			ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
			parent = parent.parent;
		}

		return ancestors;
	}
}
