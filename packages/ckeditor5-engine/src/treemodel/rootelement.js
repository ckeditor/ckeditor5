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
	 */
	constructor( doc, name ) {
		super( name );

		/**
		 * {@link engine.treeModel.Document} that is an owner of this root.
		 *
		 * @readonly
		 * @member {engine.treeModel.Document} engine.treeModel.RootElement#doc
		 */
		this.document = doc;
	}
}
