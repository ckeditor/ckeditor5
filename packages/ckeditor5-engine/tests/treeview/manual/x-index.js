/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import TreeView from '/ckeditor5/engine/treeview/treeview.js';
import SelectionObserver from '/ckeditor5/engine/treeview/observer/selectionobserver.js';
import MutationObserver from '/ckeditor5/engine/treeview/observer/mutationobserver.js';
import { setData } from '/tests/engine/_utils/view.js';

const treeView = new TreeView();
treeView.createRoot( document.getElementById( 'editor' ) );

treeView.addObserver( MutationObserver );
treeView.addObserver( SelectionObserver );

setData( treeView,
	'<container:p>fo{}o</container:p>' +
	'<container:p></container:p>' +
	'<container:p><attribute:strong></attribute:strong></container:p>' +
	'<container:p>bar</container:p>' );

treeView.on( 'selectionchange', ( evt, data ) => {
	treeView.selection.setTo( data.newSelection );
} );

treeView.render();
