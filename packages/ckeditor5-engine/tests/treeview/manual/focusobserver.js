/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import TreeView from '/ckeditor5/core/treeview/treeview.js';
import FocusObserver from '/ckeditor5/core/treeview/observer/focusobserver.js';

const treeView = new TreeView();

treeView.on( 'focus', ( evt, target ) => console.log( 'focus', target ) );
treeView.on( 'blur', ( evt, target ) => console.log( 'blur', target ) );

treeView.addObserver( FocusObserver );

treeView.createRoot( document.getElementById( 'editable1' ), 'editable1' );
treeView.createRoot( document.getElementById( 'editable2' ), 'editable2' );
