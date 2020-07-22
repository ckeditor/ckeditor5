/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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
	 * @param {module:engine/model/document~Document} document Document that is an owner of this root.
	 * @param {String} name Node name.
	 * @param {String} [rootName='main'] Unique root name used to identify this root
	 * element by {@link module:engine/model/document~Document}.
	 */
	constructor( document, name, rootName = 'main' ) {
		super( name );

		/**
		 * Document that is an owner of this root.
		 *
		 * @private
		 * @member {module:engine/model/document~Document}
		 */
		this._document = document;

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
	 * @readonly
	 * @type {module:engine/model/document~Document|null}
	 */
	get document() {
		return this._document;
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
	 *		rootElement.is( 'rootElement', '$root' ); // -> same as above
	 *
	 * {@link module:engine/model/node~Node#is Check the entire list of model objects} which implement the `is()` method.
	 *
	 * @param {String} type Type to check.
	 * @param {String} [name] Element name.
	 * @returns {Boolean}
	 */
	is( type, name ) {
		if ( !name ) {
			return type === 'rootElement' || type === 'model:rootElement' ||
				// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
				type === 'element' || type === 'model:element' ||
				type === 'node' || type === 'model:node';
		}

		return name === this.name && (
			type === 'rootElement' || type === 'model:rootElement' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === 'element' || type === 'model:element'
		);
	}

	/**
	 * Converts `RootElement` instance to `String` containing it's name.
	 *
	 * @returns {String} `RootElement` instance converted to `String`.
	 */
	toJSON() {
		return this.rootName;
	}

	// @if CK_DEBUG_ENGINE // toString() {
	// @if CK_DEBUG_ENGINE // 	return this.rootName;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // log() {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ModelRootElement: ' + this );
	// @if CK_DEBUG_ENGINE // }
}

