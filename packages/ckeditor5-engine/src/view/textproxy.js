/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * TextProxy is a wrapper for substring of {@link engine.view.Text}. Instance of this class is created by
 * {@link engine.view.TreeWalker} when only a part of {@link engine.view.Text} needs to be returned.
 *
 * **Note:** `TextProxy` instances are created on the fly basing on the current state of parent {@link engine.view.Text}.
 * Because of this it is highly unrecommended to store references to `TextProxy instances because they might get
 * invalidated due to operations on Document. Also TextProxy is not a {@link engine.view.Node} so it can not be
 * inserted as a child of {@link engine.view.Element}.
 *
 * You should never create an instance of this class by your own.
 *
 * @memberOf engine.view
 */
export default class TextProxy {
	/**
	 * Creates a text proxy.
	 *
	 * @protected
	 * @param {engine.view.Text} textNode Text node which part is represented by this text proxy.
	 * @param {Number} offsetInText Offset in {@link engine.view.TextProxy#textNode text node} from which the text proxy starts.
	 * @param {Number} length Text proxy length, that is how many text node's characters, starting from `offsetInText` it represents.
	 * @constructor
	 */
	constructor( textNode, offsetInText, length ) {
		/**
		 * Reference to the {@link engine.view.Text} element which TextProxy is a substring.
		 *
		 * @readonly
		 * @member {engine.view.Text} engine.view.TextProxy#textNode
		 */
		this.textNode = textNode;

		/**
		 * Text data represented by this text proxy.
		 *
		 * @readonly
		 * @member {String} engine.view.TextProxy#data
		 */
		this.data = textNode.data.substring( offsetInText, offsetInText + length );

		/**
		 * Offset in the `textNode` where this `TextProxy` instance starts.
		 *
		 * @readonly
		 * @member {Number} engine.view.TextProxy#offsetInText
		 */
		this.offsetInText = offsetInText;
	}

	/**
	 * Element that is a parent of this text proxy.
	 *
	 * @readonly
	 * @type {engine.view.Element|engine.view.DocumentFragment|null}
	 */
	get parent() {
		return this.textNode.parent;
	}

	/**
	 * Flag indicating whether `TextProxy` instance covers only part of the original {@link engine.view.Text text node}
	 * (`true`) or the whole text node (`false`).
	 *
	 * This is `false` when text proxy starts at the very beginning of {@link engine.view.TextProxy#textNode textNode}
	 * ({@link engine.view.TextProxy#offsetInText offsetInText} equals `0`) and text proxy sizes is equal to
	 * text node size.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isPartial() {
		return this.offsetInText !== 0 || this.data.length !== this.textNode.data.length;
	}

	/**
	 * Gets {@link engine.view.Document} reference, from the {@link engine.view.Node#getRoot root} of
	 * {#textNode} or returns null if the root has no reference to the {@link engine.view.Document}.
	 *
	 * @returns {engine.view.Document|null} View Document of the text proxy or null.
	 */
	getDocument() {
		return this.textNode.getDocument();
	}

	/**
	 * Gets the top parent for the {#textNode}. If there is no parent {#textNode} is the root.
	 *
	 * @returns {engine.view.Node}
	 */
	getRoot() {
		return this.textNode.getRoot();
	}

	/**
	 * Returns ancestors array of this text proxy.
	 *
	 * @param {Object} options Options object.
	 * @param {Boolean} [options.includeNode=false] When set to `true` {#textNode} will be also included in parent's array.
	 * @param {Boolean} [options.parentFirst=false] When set to `true`, array will be sorted from text proxy parent to
	 * root element, otherwise root element will be the first item in the array.
	 * @returns {Array} Array with ancestors.
	 */
	getAncestors( options = { includeNode: false, parentFirst: false } ) {
		const ancestors = [];
		let parent = options.includeNode ? this.textNode : this.parent;

		while ( parent !== null ) {
			ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
			parent = parent.parent;
		}

		return ancestors;
	}
}
