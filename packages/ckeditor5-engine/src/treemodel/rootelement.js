/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Element from './element.js';

/**
 * Class for nodes that are roots of trees in tree data model.
 *
 * @memberOf engine.treeModel
 * @extends engine.treeModel.Element
 */
export default class RootElement extends Element {
	/**
	 * Creates tree root node.
	 *
	 * @param {engine.treeModel.Document} doc {@link engine.treeModel.Document} that is an owner of the root.
	 * @param {String} name Node name.
	 * @param {String} rootName Root name inside parent {@link engine.treeModel.Document}.
	 */
	constructor( doc, name, rootName ) {
		super( name );

		/**
		 * {@link engine.treeModel.Document} that is an owner of this root.
		 *
		 * @readonly
		 * @member {engine.treeModel.Document} engine.treeModel.RootElement#document
		 */
		this.document = doc;

		/**
		 * Name of this root inside {@link engine.treeModel.Document} that is an owner of this root.
		 *
		 * @readonly
		 * @member {String} engine.treeModel.RootElement#rootName
		 */
		this.rootName = rootName;
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @method engine.treeModel.RootElement#toJSON
	 * @returns {String} Name of this root inside {@link engine.treeModel.Document} that is an owner of this root.
	 */
	toJSON() {
		return typeof this.rootName === 'symbol' ? '$$graveyard' : this.rootName;
	}
}
