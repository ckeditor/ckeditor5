/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Element from './element.js';

/**
 * Class for nodes that are roots of trees in tree data view.
 *
 * @class treeView.RootElement
 */
export default class RootElement extends Element {
	constructor( treeView, name ) {
		super( name );

		this._treeView = treeView;
	}

	getTreeView() {
		return this._treeView;
	}
}
