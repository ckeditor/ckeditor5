/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import TreeView from '/ckeditor5/engine/treeview/treeview.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import Text from '/ckeditor5/engine/treeview/text.js';
import MutationObserver from '/ckeditor5/engine/treeview/observer/mutationobserver.js';

const treeView = new TreeView();
treeView.createRoot( document.getElementById( 'editor' ), 'editor' );

treeView.on( 'mutations', ( evt, mutations ) => console.log( mutations ) );

treeView.addObserver( MutationObserver );

treeView.viewRoots.get( 'editor' ).appendChildren( [
	new Element( 'p', [], [ new Text( 'foo' ) ] ),
	new Element( 'p', [], [ new Text( 'bom' ) ] )
] );

treeView.render();
