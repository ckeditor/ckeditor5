/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import TreeView from '/ckeditor5/engine/treeview/treeview.js';
import MutationObserver from '/ckeditor5/engine/treeview/observer/mutationobserver.js';
import SelectionObserver from '/ckeditor5/engine/treeview/observer/selectionobserver.js';
import { setData } from '/tests/engine/_utils/view.js';

const treeView = new TreeView();
treeView.createRoot( document.getElementById( 'editor' ) );

treeView.addObserver( MutationObserver );
treeView.addObserver( SelectionObserver );

setData( treeView,
	'<container:p><attribute:b>foo</attribute:b>bar</container:p>' +
	'<container:p>bom</container:p>' );

treeView.on( 'selectionChange', ( evt, data ) => {
	console.log( data );
	treeView.selection.setTo( data.newSelection );
} );

treeView.render();
