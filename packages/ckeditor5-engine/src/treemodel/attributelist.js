/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Attribute from './attribute.js';

/**
 * List of attributes. Used to manage a set of attributes added to and removed from an object containing
 * AttributeList.
 *
 * @class treeModel.AttributeList
 */
export default class AttributeList {
	/**
	 * Creates a list of attributes.
	 *
	 * @param {Iterable.<treeModel.Attribute>} [attrs] Attributes to initialize this list with.
	 * @constructor
	 */
	constructor( attrs ) {
		/**
		 * Internal set containing the attributes stored by this list.
		 *
		 * @private
		 * @property {Set.<treeModel.Attribute>} _attrs
		 */

		this.setAttrsTo( attrs );
	}

	/**
	 * Returns value of an attribute with given key or null if there are no attributes with given key.
	 *
	 * @param {String} key The attribute key.
	 * @returns {*|null} Value of found attribute or null if attribute with given key has not been found.
	 */
	getAttr( key ) {
		for ( let attr of this._attrs ) {
			if ( attr.key == key ) {
				return attr.value;
			}
		}

		return null;
	}

	/**
	 * Returns attribute iterator.
	 *
	 * @returns {Iterable.<treeModel.Attribute>} Attribute iterator.
	 */
	getAttrs() {
		return this._attrs[ Symbol.iterator ]();
	}

	/**
	 * Returns `true` if the object contains given {@link treeModel.Attribute attribute} or
	 * an attribute with the same key if passed parameter was a string.
	 *
	 * @param {treeModel.Attribute|String} attrOrKey An attribute or a key to look for.
	 * @returns {Boolean} True if object contains given attribute or an attribute with the given key.
	 */
	hasAttr( attrOrKey ) {
		if ( attrOrKey instanceof Attribute ) {
			for ( let attr of this._attrs ) {
				if ( attr.isEqual( attrOrKey ) ) {
					return true;
				}
			}
		} else {
			for ( let attr of this._attrs ) {
				if ( attr.key == attrOrKey ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Removes attribute from the list of attributes.
	 *
	 * @param {String} key The attribute key.
	 */
	removeAttr( key ) {
		for ( let attr of this._attrs ) {
			if ( attr.key == key ) {
				this._attrs.delete( attr );

				return;
			}
		}
	}

	/**
	 * Sets a given attribute. If the attribute with the same key already exists it will be removed.
	 *
	 * @param {treeModel.Attribute} attr Attribute to set.
	 */
	setAttr( attr ) {
		this.removeAttr( attr.key );

		this._attrs.add( attr );
	}

	/**
	 * Removes all attributes and sets passed attributes.
	 *
	 * @param {Iterable.<treeModel.Attribute>} attrs Array of attributes to set.
	 */
	setAttrsTo( attrs ) {
		this._attrs = new Set( attrs );
	}
}