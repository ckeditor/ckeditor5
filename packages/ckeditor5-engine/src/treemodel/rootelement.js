/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Element from './element.js';

/**
 * Class for nodes that are roots of trees in tree data model.
 *
 * @class treeModel.RootElement
 */
export default class RootElement extends Element {
	/**
	 * Creates tree root node.
	 *
	 * @param {treeModel.Document} doc {@link treeModel.Document} that is an owner of the root.
	 * @constructor
	 */
	constructor( doc ) {
		super( 'root' );

		/**
		 * {@link treeModel.Document} that is an owner of this root.
		 *
		 * @readonly
		 * @property {treeModel.Document}
		 */
		this.document = doc;
	}
}