/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'treeview/element' ], ( Element ) => {
	/**
	 * Class for nodes that are roots of trees in tree data view.
	 *
	 * @class treeView.RootElement
	 */
	class RootElement extends Element {
		constructor( TreeView, name ) {
			super( name );

			this._treeView = TreeView;
		}

		getTreeView() {
			return this._treeView;
		}
	}

	return RootElement;
} );
