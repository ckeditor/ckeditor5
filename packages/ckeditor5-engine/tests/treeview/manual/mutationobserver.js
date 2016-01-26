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

const treeView = new TreeView( document.getElementById( 'editor' ) );
const mutationObserver = new MutationObserver();

treeView.on( 'mutations', ( evt, mutations ) => console.log( mutations ) );

treeView.addObserver( mutationObserver );

treeView.viewRoot.insertChildren( 0, [
	new Element( 'p', [], [ new Text( 'foo' ) ] ),
	new Element( 'p', [], [ new Text( 'bom' ) ] )
	] );

treeView.render();