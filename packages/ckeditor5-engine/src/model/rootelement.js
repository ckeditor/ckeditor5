/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
	 * @inheritDoc
	 */
	is( type, name ) {
		if ( !name ) {
			return type == 'rootElement' || super.is( type );
		} else {
			return ( type == 'rootElement' && name == this.name ) || super.is( type, name );
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
