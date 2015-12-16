/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Attribute from './attribute.js';

/**
 * List of attributes.
 *
 * @class treeModel.AttributeList
 */
export default class AttributeList extends Map {
	/**
	 * Creates AttributeList. If parameter is passed, initializes created list with passed {@link treeModel.Attribute}s.
	 *
	 * @constructor
	 * @param {Iterable.<treeModel.Attribute>} attrs Attributes to initialize with.
	 */
	constructor( attrs ) {
		super();

		if ( attrs ) {
			this.setTo( attrs );
		}

		/**
		 * Amount of attributes added to the AttributeList.
		 *
		 * @property {Number} size
		 */
	}

	/**
	 * AttributeList iterator. Iterates over all attributes from the list.
	 */
	[ Symbol.iterator ]() {
		let it = super[ Symbol.iterator ]();

		return {
			next: () => {
				let step = it.next();

				return {
					value: step.value ? step.value[ 1 ] : undefined,
					done: step.done
				};
			}
		};
	}

	/**
	 * Adds attribute to the attributes list. If attribute with the same key already is set, it overwrites its values.
	 *
	 * @chainable
	 * @param {treeModel.Attribute} attr Attribute to add or overwrite.
	 * @returns {treeModel.AttributeList} This AttributeList object.
	 */
	set( attr ) {
		super.set( attr.key, attr );

		return this;
	}

	/**
	 * Removes all attributes from AttributeList and adds given attributes.
	 *
	 * @param {Iterable.<Attribute>} attrs Iterable object containing attributes to be set.
	 */
	setTo( attrs ) {
		this.clear();

		for ( let value of attrs ) {
			this.set( value );
		}
	}

	/**
	 * Checks if AttributeList contains attribute {@link treeModel.Attribute#isEqual equal} to given attribute or
	 * attribute with given key if string was passed.
	 *
	 * @param {treeModel.Attribute|String} attrOrKey Attribute or key of attribute to check.
	 * @returns {Boolean} `true` if given attribute or attribute with given key exists in AttributeList. `false` otherwise.
	 */
	has( attrOrKey ) {
		if ( attrOrKey instanceof Attribute ) {
			let attr = this.get( attrOrKey.key );

			if ( attr ) {
				return attr.isEqual( attrOrKey );
			}
		} else {
			return super.has( attrOrKey );
		}

		return false;
	}

	/**
	 * Gets an attribute value by attribute key.
	 *
	 * @param {String} key Key of attribute to look for.
	 * @returns {*} Value of attribute with given key or null if the attribute has not been found in AttributeList
	 */
	getValue( key ) {
		let attr = this.get( key );

		return attr ? attr.value : null;
	}

	/**
	 * Checks whether this AttributeList has exactly same attributes as given one.
	 *
	 * @param {treeModel.AttributeList} attrs AttributeList to compare with.
	 * @returns {Boolean} `true` if AttributeLists are equal, `false` otherwise.
	 */
	isEqual( attrs ) {
		if ( this.size != attrs.size ) {
			return false;
		}

		for ( let attr of attrs ) {
			if ( !this.has( attr ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Gets an attribute by its key.
	 *
	 * @method get
	 * @param {String} key Key of attribute to look for.
	 * @returns {treeModel.Attribute|null} Attribute with given key or null if the attribute has not been found in
	 * AttributeList.
	 */

	/**
	 * Removes an attribute with given key from AttributeList.
	 *
	 * @method delete
	 * @param {String} key Key of attribute to remove.
	 * @returns {Boolean} `true` if the attribute existed in the AttributeList. `false` otherwise.
	 */

	/**
	 * Removes all attributes from AttributeList.
	 *
	 * @method clear
	 */
}
