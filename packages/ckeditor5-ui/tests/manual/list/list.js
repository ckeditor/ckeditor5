/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ButtonView, ListItemGroupView, ListItemView, ListView } from '../../../src/index.js';

const playground = document.querySelector( '#playground' );

const defaultView = new ListView();
defaultView.render();
playground.appendChild( defaultView.element );

const grouppedView = new ListView();
grouppedView.render();
playground.appendChild( grouppedView.element );

defaultView.items.addMany( [
	createItem( 'Item 1' ),
	createItem( 'Item 2' ),
	createItem( 'Item 3' ),
	createItem( 'Item 4' ),
	createItem( 'Item 5' )
] );

grouppedView.items.addMany( [
	createItem( 'Item 1' ),
	createItem( 'Item 2' ),
	createGroup( 'Items group 1', [
		createItem( 'Item 1.1' ),
		createItem( 'Item 1.2' )
	] ),
	createGroup( 'Items group 2', [
		createItem( 'Item 2.1' ),
		createItem( 'Item 2.2' )
	] )
] );

function createItem( label ) {
	const item = new ListItemView();
	const button = new ButtonView();

	item.children.add( button );

	button.set( { label, withText: true } );

	return item;
}

function createGroup( label, items ) {
	const groupView = new ListItemGroupView();

	groupView.label = label;
	groupView.items.addMany( items );

	return groupView;
}

