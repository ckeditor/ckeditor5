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

const treeView = new TreeView();
treeView.createRoot( document.getElementById( 'editor' ), 'editor' );

treeView.addObserver( MutationObserver );
treeView.addObserver( SelectionObserver );

const foo = new Text( 'foo' );

treeView.viewRoots.get( 'editor' ).appendChildren( [
	new ContainerElement( 'p', null, [ foo ] ),
	new ContainerElement( 'p' ),
	new ContainerElement( 'p', null, [ new AttributeElement( 'strong' ) ] ),
	new ContainerElement( 'p', null, [ new Text( 'bar' ) ] )
] );

treeView.selection.setRanges( [ Range.createFromParentsAndOffsets( foo, 2, foo, 2 ) ] );

treeView.on( 'selectionchange', ( evt, data ) => {
	treeView.selection.setTo( data.newSelection );
} );

treeView.render();

