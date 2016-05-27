/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Element from './element.js';

/**
 * Class for nodes that are roots of trees in data model.
 *
 * @memberOf engine.model
 * @extends engine.model.Element
 */
export default class RootElement extends Element {
	/**
	 * Creates root element.
	 *
	 * @param {engine.model.Document} doc {@link engine.model.Document} that is an owner of the root.
	 * @param {String} name Node name.
	 * @param {String} [rootName='main'] Root name inside parent {@link engine.model.Document}.
	 */
	constructor( doc, name, rootName = 'main' ) {
		super( name );

		/**
		 * {@link engine.model.Document} that is an owner of this root.
		 *
		 * @readonly
		 * @member {engine.model.Document} engine.model.RootElement#document
		 */
		this.document = doc;

		/**
		 * Name of this root inside {@link engine.model.Document} that is an owner of this root.
		 *
		 * @readonly
		 * @member {String} engine.model.RootElement#rootName
		 */
		this.rootName = rootName;
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @method engine.model.RootElement#toJSON
	 * @returns {String} Name of this root inside {@link engine.model.Document} that is an owner of this root.
	 */
	toJSON() {
		return this.rootName;
	}
}
