/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CharacterProxy from './characterproxy.js';

/**
 * TextFragment is an aggregator for multiple CharacterProxy instances that are placed next to each other in
 * tree model, in the same parent, and all have same attributes set. Instances of this class are created and returned
 * in various algorithms that "merge characters" (see {@link treeModel.TreeWalker}, {@link treeModel.Range}).
 *
 * Difference between {@link treeModel.TextFragment} and {@link treeModel.Text} is that the former is a set of
 * nodes taken from tree model, while {@link treeModel.Text} is simply a string with attributes set.
 *
 * You should never create an instance of this class by your own. Instead, use string literals or {@link treeModel.Text}.
 *
 * @class treeModel.TextFragment
 */
export default class TextFragment {
	/**
	 * Creates a text fragment.
	 *
	 * @param {treeModel.CharacterProxy} firstCharacter First character node contained in {@link treeModel.TextFragment}.
	 * @param {Number} length Whole text contained in {@link treeModel.TextFragment}.
	 * @protected
	 * @constructor
	 */
	constructor( firstCharacter, length ) {
		/**
		 * First character node contained in {@link treeModel.TextFragment}.
		 *
		 * @readonly
		 * @property {treeModel.CharacterProxy} first
		 */
		this.first = firstCharacter;

		/**
		 * Characters contained in {@link treeModel.TextFragment}.
		 *
		 * @readonly
		 * @property {String} text
		 */
		this.text = firstCharacter._nodeListText.text.substr( this.first._index, length );

		/**
		 * Last {@link treeModel.CharacterProxy character node} contained in {@link treeModel.TextFragment}.
		 *
		 * @readonly
		 * @property {treeModel.CharacterProxy} last
		 */
		this.last = this.getCharAt( this.text.length - 1 );
	}

	/**
	 * A common parent of all character nodes contained in {@link treeModel.TextFragment}.
	 *
	 * @property {treeModel.Element} commonParent
	 */
	get commonParent() {
		return this.first.parent;
	}

	/**
	 * Gets a character at given index and creates a {@link treeModel.CharacterProxy} out of it.
	 *
	 * @param {Number} index Character index.
	 * @returns {treeModel.CharacterProxy}
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
}
