/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CharacterProxy from './characterproxy.js';
import toMap from '../../utils/tomap.js';

/**
 * TextProxy is an aggregator for multiple CharacterProxy instances that are placed next to each other in
 * tree model, in the same parent, and all have same attributes set. Instances of this class are created and returned
 * in various algorithms that "merge characters" (see {@link engine.model.TreeWalker}, {@link engine.model.Range}).
 *
 * **Note:** TextProxy instances are created on the fly basing on the current state of tree model and attributes
 * set on characters. Because of this it is highly unrecommended to store references to TextProxy instances
 * because they might get invalidated due to operations on Document. This is especially true when you change
 * attributes of TextProxy.
 *
 * Difference between {@link engine.model.TextProxy} and {@link engine.model.Text} is that the former is a set of
 * nodes taken from tree model, while {@link engine.model.Text} is simply a string with attributes set.
 *
 * You should never create an instance of this class by your own. Instead, use string literals or {@link engine.model.Text}.
 *
 * @memberOf engine.model
 */
export default class TextProxy {
	/**
	 * Creates a text fragment.
	 *
	 * @protected
	 * @param {engine.model.CharacterProxy} firstCharacter First character node contained in {@link engine.model.TextProxy}.
	 * @param {Number} length Whole text contained in {@link engine.model.TextProxy}.
	 * @constructor
	 */
	constructor( firstCharacter, length ) {
		/**
		 * First character node contained in {@link engine.model.TextProxy}.
		 *
		 * @readonly
		 * @member {engine.model.CharacterProxy} engine.model.TextProxy#first
		 */
		this.first = firstCharacter;

		/**
		 * Characters contained in {@link engine.model.TextProxy}.
		 *
		 * @readonly
		 * @member {String} engine.model.TextProxy#text
		 */
		this.text = firstCharacter._nodeListText.text.substr( this.first._index, length );

		/**
		 * Last {@link engine.model.CharacterProxy character node} contained in {@link engine.model.TextProxy}.
		 *
		 * @readonly
		 * @member {engine.model.CharacterProxy} engine.model.TextProxy#last
		 */
		this.last = this.getCharAt( this.text.length - 1 );
	}

	/**
	 * A common parent of all character nodes contained in {@link engine.model.TextProxy}.
	 *
	 * @type {engine.model.Element}
	 */
	get commonParent() {
		return this.first.parent;
	}

	/**
	 * Gets a character at given index and creates a {@link engine.model.CharacterProxy} out of it.
	 *
	 * @param {Number} index Character index.
	 * @returns {engine.model.CharacterProxy}
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
	 * **Note:** Changing attributes of text fragment affects document state. This TextProxy instance properties
	 * will be refreshed, but other may get invalidated. It is highly unrecommended to store references to TextProxy instances.
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
	 * **Note:** Changing attributes of text fragment affects document state. This `TextProxy` instance properties
	 * will be refreshed, but other may get invalidated. It is highly unrecommended to store references to TextProxy instances.
	 *
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set.
	 * See {@link engine.model.TextProxy#getAttributes}.
	 */
	setAttributesTo( attrs ) {
		let attrsMap = toMap( attrs );

		this.clearAttributes();

		for ( let attr of attrsMap ) {
			this.setAttribute( attr[ 0 ], attr[ 1 ] );
		}
	}

	/**
	 * Removes an attribute with given key from the text fragment.
	 *
	 * **Note:** Changing attributes of text fragment affects document state. This `TextProxy` instance properties
	 * will be refreshed, but other may get invalidated. It is highly unrecommended to store references to TextProxy instances.
	 *
	 * @param {String} key Key of attribute to remove.
	 */
	removeAttribute( key ) {
		this.setAttribute( key, null );
	}

	/**
	 * Removes all attributes from the text fragment.
	 *
	 * **Note:** Changing attributes of text fragment affects document state. This `TextProxy` instance properties
	 * will be refreshed, but other may get invalidated. It is highly unrecommended to store references to TextProxy instances.
	 */
	clearAttributes() {
		for ( let attr of this.getAttributes() ) {
			this.removeAttribute( attr[ 0 ] );
		}
	}
}
