/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import TreeView from '/ckeditor5/engine/treeview/treeview.js';
import KeyObserver from '/ckeditor5/engine/treeview/observer/keyobserver.js';

const treeView = new TreeView();

treeView.on( 'keydown', ( evt, data ) => console.log( 'keydown', data ) );

treeView.addObserver( KeyObserver );

treeView.createRoot( document.getElementById( 'editable' ), 'editable' );
