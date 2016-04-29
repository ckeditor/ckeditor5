/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import TreeView from '/ckeditor5/engine/treeview/treeview.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import AttributeElement from '/ckeditor5/engine/treeview/attributeelement.js';
import Text from '/ckeditor5/engine/treeview/text.js';
import Range from '/ckeditor5/engine/treeview/range.js';
import SelectionObserver from '/ckeditor5/engine/treeview/observer/selectionobserver.js';
import MutationObserver from '/ckeditor5/engine/treeview/observer/mutationobserver.js';
import KeyObserver from '/ckeditor5/engine/treeview/observer/keyobserver.js';

const treeView = new TreeView();
treeView.createRoot( document.getElementById( 'editor' ), 'editor' );

treeView.addObserver( MutationObserver );
treeView.addObserver( SelectionObserver );
treeView.addObserver( KeyObserver );

const p = new ContainerElement( 'p', null, [
		new AttributeElement( 'strong', null, [ new Text( 'foo' ) ] ),
		new AttributeElement( 'strong', null, [ new Text( 'bar' ) ] )
	] );

treeView.viewRoots.get( 'editor' ).appendChildren( p );

treeView.selection.setRanges( [ Range.createFromParentsAndOffsets( p, 1, p, 1 ) ] );

treeView.on( 'selectionchange', ( evt, data ) => {
	treeView.selection.setTo( data.newSelection );
} );

treeView.render();

