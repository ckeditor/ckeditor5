/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import TreeView from '/ckeditor5/core/treeview/treeview.js';
import Element from '/ckeditor5/core/treeview/element.js';
import Text from '/ckeditor5/core/treeview/text.js';

const treeView = new TreeView();
treeView.createRoot( document.getElementById( 'editor' ), 'editor' );

treeView.viewRoots.get( 'editor' ).appendChildren( [
	new Element( 'p', [], [ new Text( 'New' ) ] ),
	new Element( 'p', [], [ new Text( 'Content' ) ] )
] );

treeView.render();

console.log( treeView );
