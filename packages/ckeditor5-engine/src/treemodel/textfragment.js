/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CharacterProxy from './characterproxy.js';
import utils from '../../utils/utils.js';

/**
 * TextFragment is an aggregator for multiple CharacterProxy instances that are placed next to each other in
 * tree model, in the same parent, and all have same attributes set. Instances of this class are created and returned
 * in various algorithms that "merge characters" (see {@link engine.treeModel.TreeWalker}, {@link engine.treeModel.Range}).
 *
 * **Note:** TextFragment instances are created on the fly basing on the current state of tree model and attributes
 * set on characters. Because of this it is highly unrecommended to store references to TextFragment instances
 * because they might get invalidated due to operations on Document. This is especially true when you change
 * attributes of TextFragment.
 *
 * Difference between {@link engine.treeModel.TextFragment} and {@link engine.treeModel.Text} is that the former is a set of
 * nodes taken from tree model, while {@link engine.treeModel.Text} is simply a string with attributes set.
 *
 * You should never create an instance of this class by your own. Instead, use string literals or {@link engine.treeModel.Text}.
 *
 * @memberOf engine.treeModel
 */
export default class TextFragment {
	/**
	 * Creates a text fragment.
	 *
	 * @protected
	 * @param {engine.treeModel.CharacterProxy} firstCharacter First character node contained in {@link engine.treeModel.TextFragment}.
	 * @param {Number} length Whole text contained in {@link engine.treeModel.TextFragment}.
	 * @constructor
	 */
	constructor( firstCharacter, length ) {
		/**
		 * First character node contained in {@link engine.treeModel.TextFragment}.
		 *
		 * @readonly
		 * @member {engine.treeModel.CharacterProxy} engine.treeModel.TextFragment#first
		 */
		this.first = firstCharacter;

		/**
		 * Characters contained in {@link engine.treeModel.TextFragment}.
		 *
		 * @readonly
		 * @member {String} engine.treeModel.TextFragment#text
		 */
		this.text = firstCharacter._nodeListText.text.substr( this.first._index, length );

		/**
		 * Last {@link engine.treeModel.CharacterProxy character node} contained in {@link engine.treeModel.TextFragment}.
		 *
		 * @readonly
		 * @member {engine.treeModel.CharacterProxy} engine.treeModel.TextFragment#last
		 */
		this.last = this.getCharAt( this.text.length - 1 );
	}

	/**
	 * A common parent of all character nodes contained in {@link engine.treeModel.TextFragment}.
	 *
	 * @type {engine.treeModel.Element}
	 */
	get commonParent() {
		return this.first.parent;
	}

	/**
	 * Gets a character at given index and creates a {@link engine.treeModel.CharacterProxy} out of it.
	 *
	 * @param {Number} index Character index.
	 * @returns {engine.treeModel.CharacterProxy}
	 */
	getCharAt( index ) {
		if ( index < 0 || index >= this.text.length ) {
			return null;
		}

		return new CharacterProxy( this.first._nodeListText, this.first._index + index );
	}

	/**
	 * Checks if the text fragment has an attribute for given key.
	 *
	 * @param {String} key Key of attribute to check.
	 * @returns {Boolean} `true` if attribute with given key is set on text fragment, `false` otherwise.
	 */
	hasAttribute( key ) {
		return this.first.hasAttribute( key );
	}

	/**
	 * Gets an attribute value for given key or undefined it that attribute is not set on text fragment.
	 *
	 * @param {String} key Key of attribute to look for.
	 * @returns {*} Attribute value or null.
	 */
	getAttribute( key ) {
		return this.first.getAttribute( key );
	}

	/**
	 * Returns iterator that iterates over this text fragment attributes.
	 *
	 * @returns {Iterable.<*>}
	 */
	getAttributes() {
		return this.first.getAttributes();
	}

	/**
	 * Sets attribute on the text fragment. If attribute with the same key already is set, it overwrites its values.
	 *
	 * **Note:** Changing attributes of text fragment affects document state. This TextFragment instance properties
	 * will be refreshed, but other may get invalidated. It is highly unrecommended to store references to TextFragment instances.
	 *
	 * @param {String} key Key of attribute to set.
	 * @param {*} value Attribute value.
	 */
	setAttribute( key, value ) {
		let index = this.first.getIndex();

		this.commonParent._children.setAttribute( this.first.getIndex(), this.text.length, key, value );

		this.first = this.commonParent.getChild( index );
		this.last = this.getCharAt( this.text.length - 1 );
	}

	/**
	 * Removes all attributes from the text fragment and sets given attributes.
	 *
	 * **Note:** Changing attributes of text fragment affects document state. This TextFragment instance properties
	 * will be refreshed, but other may get invalidated. It is highly unrecommended to store references to TextFragment instances.
	 *
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set.
	 * See {@link engine.treeModel.TextFragment#getAttributes}.
	 */
	setAttributesTo( attrs ) {
		let attrsMap = utils.toMap( attrs );

		this.clearAttributes();

		for ( let attr of attrsMap ) {
			this.setAttribute( attr[ 0 ], attr[ 1 ] );
		}
	}

	/**
	 * Removes an attribute with given key from the text fragment.
	 *
	 * **Note:** Changing attributes of text fragment affects document state. This TextFragment instance properties
	 * will be refreshed, but other may get invalidated. It is highly unrecommended to store references to TextFragment instances.
	 *
	 * @param {String} key Key of attribute to remove.
	 */
	removeAttribute( key ) {
		this.setAttribute( key, null );
	}

	/**
	 * Removes all attributes from the text fragment.
	 *
	 * **Note:** Changing attributes of text fragment affects document state. This TextFragment instance properties
	 * will be refreshed, but other may get invalidated. It is highly unrecommended to store references to TextFragment instances.
	 */
	clearAttributes() {
		for ( let attr of this.getAttributes() ) {
			this.removeAttribute( attr[ 0 ] );
		}
	}
}
