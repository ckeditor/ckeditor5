/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import TreeView from '/ckeditor5/core/treeview/treeview.js';
import Element from '/ckeditor5/core/treeview/element.js';
import Text from '/ckeditor5/core/treeview/text.js';
import MutationObserver from '/ckeditor5/core/treeview/observer/mutationobserver.js';

const treeView = new TreeView();
treeView.createRoot( document.getElementById( 'editor' ), 'editor' );

treeView.on( 'mutations', ( evt, mutations ) => console.log( mutations ) );
treeView.on( 'mutations', handleTyping );

treeView.addObserver( MutationObserver );

treeView.viewRoots.get( 'editor' ).appendChildren( [ new Element( 'p', [], [ new Text( 'foo' ) ] ) ] );

treeView.render();

function handleTyping( evt, mutations ) {
	const mutation = mutations[ 0 ];

	if ( mutations.length > 1 || mutation.type !== 'text' ) {
		return;
	}

	mutation.node.data = mutation.newText;
}
