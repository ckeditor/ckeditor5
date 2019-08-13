/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/rootelement
 */

import Element from './element';

/**
 * Type of {@link module:engine/model/element~Element} that is a root of a model tree.
 * @extends module:engine/model/element~Element
 */
export default class RootElement extends Element {
	/**
	 * Creates root element.
	 *
	 * @param {module:engine/model/document~Document} doc Document that is an owner of this root.
	 * @param {String} name Node name.
	 * @param {String} [rootName='main'] Unique root name used to identify this root
	 * element by {@link module:engine/model/document~Document}.
	 */
	constructor( doc, name, rootName = 'main' ) {
		super( name );

		/**
		 * Document that is an owner of this root.
		 *
		 * @private
		 * @member {module:engine/model/document~Document}
		 */
		this._doc = doc;

		/**
		 * Unique root name used to identify this root element by {@link module:engine/model/document~Document}.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.rootName = rootName;
	}

	/**
	 * {@link module:engine/model/document~Document Document} that owns this root element.
	 *
	 * In contrary, to {@link module:engine/model/node~Node node}, root element always have a `document`.
	 *
	 * @readonly
	 * @type {module:engine/model/document~Document|null}
	 */
	get document() {
		return this._doc;
	}

	/**
	 * Checks whether this object is of the given.
	 *
	 *		rootElement.is( 'rootElement' ); // -> true
	 *		rootElement.is( 'element' ); // -> true
	 *		rootElement.is( 'node' ); // -> true
	 *		rootElement.is( 'model:rootElement' ); // -> true
	 *		rootElement.is( 'model:element' ); // -> true
	 *		rootElement.is( 'model:node' ); // -> true
	 *
	 *		rootElement.is( 'view:element' ); // -> false
	 *		rootElement.is( 'documentFragment' ); // -> false
	 *
	 * Assuming that the object being checked is an element, you can also check its
	 * {@link module:engine/model/element~Element#name name}:
	 *
	 *		rootElement.is( '$root' ); // -> true if this is a $root element
	 *		rootElement.is( 'rootElement', '$root' ); // -> same as above
	 *		text.is( '$root' ); -> false
	 *
	 * {@link module:engine/model/node~Node#is Check the entire list of model objects} which implement the `is()` method.
	 *
	 * @param {String} type Type to check when `name` parameter is present.
	 * Otherwise, it acts like the `name` parameter.
	 * @param {String} [name] Element name.
	 * @returns {Boolean}
	 */
	is( type, name ) {
		const cutType = type.replace( 'model:', '' );
		if ( !name ) {
			return cutType == 'rootElement' || super.is( type );
		} else {
			return ( cutType == 'rootElement' && name == this.name ) || super.is( type, name );
		}
	}

	/**
	 * Converts `RootElement` instance to `String` containing it's name.
	 *
	 * @returns {String} `RootElement` instance converted to `String`.
	 */
	toJSON() {
		return this.rootName;
	}
}
