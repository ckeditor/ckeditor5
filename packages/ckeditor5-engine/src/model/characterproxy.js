/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';
import toMap from '../../utils/tomap.js';

/**
 * A proxy object representing one character stored in the tree data model. It looks and behaves like
 * normal node, but is a read-only structure. This is a representation of the data. Manipulating it won't affect
 * the actual nodes in tree model.
 *
 * Keep in mind that CharacterProxy is static, meaning that it won't change when tree model changes. For example, if you
 * have a {engine.model.Element element} `myEl` containing text `foobar` and then assign `let b = myEl.getChild( 3 )`
 * and then remove all nodes from `myEl`, `b` will still have character `b`, parent `myEl` and offset `3`.
 *
 * CharacterProxy is created on the fly basing on tree model. It is not an explicit node in a tree model but
 * rather represents it. Because of this, it is not advised to store or compare instances of CharacterProxy class.
 * If you want to keep live reference to a point in a text, you should use {@link engine.model.LivePosition}.
 *
 * You should never create an instance of this class by your own. When passing parameters to constructors,
 * use string literals or {@link engine.model.Text} instead.
 *
 * @memberOf engine.model
 * @extends engine.model.Node
 */
export default class CharacterProxy extends Node {
	/**
	 * Creates character node proxy.
	 *
	 * @protected
	 * @param {engine.model.NodeListText} nodeListText Reference to a text object in a node list containing this character.
	 * @param {Number} index Index of the character in `nodeListText`.
	 */
	constructor( nodeListText, index ) {
		super( nodeListText._attrs );

		/**
		 * Character represented by this proxy.
		 *
		 * @readonly
		 * @member {String} engine.model.CharacterProxy#character
		 */
		this.character = nodeListText.text.substr( index, 1 );

		/**
		 * @inheritdoc
		 */
		this.parent = nodeListText.parent;

		/**
		 * Reference to a text object in a node list containing this character.
		 *
		 * @protected
		 * @readonly
		 * @member {engine.model.NodeListText} engine.model.CharacterProxy#_nodeListText
		 */
		this._nodeListText = nodeListText;

		/**
		 * Index of the character in `nodeListText`.
		 *
		 * @protected
		 * @readonly
		 * @member {Number} engine.model.CharacterProxy#_index
		 */
		this._index = index;
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
		let index = this.getIndex();

		this.parent._children.setAttribute( index, 1, key, value );
		this._attrs.set( key, value );
	}

	/**
	 * Removes all attributes from the character proxy and sets given attributes.
	 *
	 * **Note:** Changing attributes of character proxy affects document state. This `CharacterProxy` instance properties
	 * will be refreshed, but other instances of `CharacterProxy` and `TextProxy` may get invalidated.
	 * It is highly unrecommended to store references to `CharacterProxy` instances.
	 *
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set. See
	 * {@link engine.model.CharacterProxy#getAttributes}.
	 */
	setAttributesTo( attrs ) {
		let attrsMap = toMap( attrs );

		this.clearAttributes();

		for ( let attr of attrsMap ) {
			this.setAttribute( attr[ 0 ], attr[ 1 ] );
		}
	}

	/**
	 * Removes an attribute with given key from the character proxy.
	 *
	 * **Note:** Changing attributes of character proxy affects document state. This `CharacterProxy` instance properties
	 * will be refreshed, but other instances of `CharacterProxy` and `TextProxy` may get invalidated.
	 * It is highly unrecommended to store references to `CharacterProxy` instances.
	 *
	 * @param {String} key Key of attribute to remove.
	 */
	removeAttribute( key ) {
		this.setAttribute( key, null );
	}

	/**
	 * Removes all attributes from the character proxy.
	 *
	 * **Note:** Changing attributes of character proxy affects document state. This `CharacterProxy` instance properties
	 * will be refreshed, but other instances of `CharacterProxy` and `TextProxy` may get invalidated.
	 * It is highly unrecommended to store references to `CharacterProxy` instances.
	 */
	clearAttributes() {
		for ( let attr of this.getAttributes() ) {
			this.removeAttribute( attr[ 0 ] );
		}
	}
}
