/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Element from './element.js';

/**
 * Type of {@link engine.model.Element} that is a root of a model tree.
 *
 * @memberOf engine.model
 * @extends engine.model.Element
 */
export default class RootElement extends Element {
	/**
	 * Creates root element.
	 *
	 * @param {engine.model.Document} doc Document that is an owner of this root.
	 * @param {String} name Node name.
	 * @param {String} [rootName='main'] Unique root name used to identify this root element by {@link engine.model.Document}.
	 */
	constructor( doc, name, rootName = 'main' ) {
		super( name );

		/**
		 * Document that is an owner of this root.
		 *
		 * @readonly
		 * @member {engine.model.Document} engine.model.RootElement#document
		 */
		this._doc = doc;

		/**
		 * Unique root name used to identify this root element by {@link engine.model.Document}.
		 *
		 * @readonly
		 * @member {String} engine.model.RootElement#rootName
		 */
		this.rootName = rootName;
	}

	/**
	 * {@link engine.model.Document Document} that owns this root element.
	 *
	 * In contrary, to {@link engine.model.Node node}, root element always have a `document`.
	 *
	 * @readonly
	 * @type {engine.model.Document|null}
	 */
	get document() {
		return this._doc;
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
