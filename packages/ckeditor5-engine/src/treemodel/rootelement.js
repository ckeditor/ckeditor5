/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Element from './element.js';

/**
 * Class for nodes that are roots of trees in tree data model.
 *
 * @memberOf core.treeModel
 * @extends core.treeModel.Element
 */
export default class RootElement extends Element {
	/**
	 * Creates tree root node.
	 *
	 * @param {Document} doc {@link Document} that is an owner of the root.
	 * @param {String} name Node name.
	 */
	constructor( doc, name ) {
		super( name );

		/**
		 * {@link core.treeModel.Document} that is an owner of this root.
		 *
		 * @readonly
		 * @member {core.treeModel.Document} core.treeModel.RootElement#doc
		 */
		this.document = doc;
	}
}
