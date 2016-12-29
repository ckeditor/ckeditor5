/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { getClosestListItem, getSelectedBlocks, getPositionBeforeBlock } from 'ckeditor5-list/src/utils';

import Element from 'ckeditor5-engine/src/model/element';
import Text from 'ckeditor5-engine/src/model/text';
import Position from 'ckeditor5-engine/src/model/position';
import Schema from 'ckeditor5-engine/src/model/schema';
import Selection from 'ckeditor5-engine/src/model/selection';

describe( 'getClosestListItem', () => {
	const item = new Element( 'listItem', null, 'foobar' );
	const root = new Element( '$root', null, [ item ] );

	it( 'should return model listItem element if given position is in such element', () => {
		expect( getClosestListItem( Position.createAt( item ) ) ).to.equal( item );
	} );

	it( 'should return null if position is not in listItem', () => {
		expect( getClosestListItem( Position.createAt( root ) ) ).to.be.null;
	} );
} );

describe( 'getSelectedBlocks', () => {
	const paragraph1 = new Element( 'paragraph', null, '---' );
	const item1 = new Element( 'listItem', null, '---' );
	const item2 = new Element( 'listItem', null, '---' );
	const item3 = new Element( 'listItem', null, '---' );
	const paragraph2 = new Element( 'paragraph', null, '---' );

	const root = new Element( '$root', null, [
		paragraph1, item1, item2, item3, paragraph2
	] );

	const schema = new Schema();
	schema.registerItem( 'paragraph', '$block' );
	schema.registerItem( 'listItem', '$block' );

	const selection = new Selection();

	it( 'should return just one block if selection is over one block', () => {
		selection.collapse( root, 2 );
		selection.setFocus( root, 3 );

		expect( getSelectedBlocks( selection, schema ) ).to.deep.equal( [ item2 ] );
	} );

	it( 'should return ancestor block if selection is collapsed and not before a block', () => {
		selection.collapse( paragraph1, 2 );

		expect( getSelectedBlocks( selection, schema ) ).to.deep.equal( [ paragraph1 ] );
	} );

	it( 'should return empty array for collapsed selection before a block, in a root', () => {
		selection.collapse( root, 1 );

		expect( getSelectedBlocks( selection, schema ) ).to.deep.equal( [] );
	} );

	it( 'should return all blocks "touched" by the selection if it spans over multiple blocks', () => {
		selection.collapse( item1, 3 );
		selection.setFocus( root, 4 );

		expect( getSelectedBlocks( selection, schema ) ).to.deep.equal( [ item1, item2, item3 ] );
	} );
} );

describe( 'getPositionBeforeBlock', () => {
	const paragraph = new Element( 'paragraph', null, 'foo' );
	const item = new Element( 'listItem', null, 'bar' );
	const text = new Text( 'xyz' );

	const root = new Element( '$root' );
	root.appendChildren( [ paragraph, item, text ] );

	const schema = new Schema();
	schema.registerItem( 'paragraph', '$block' );
	schema.registerItem( 'listItem', '$block' );

	it( 'should return same position if position is already before a block', () => {
		const position = Position.createBefore( paragraph );

		expect( getPositionBeforeBlock( position, schema ).isEqual( position ) ).to.be.true;
	} );

	it( 'should return position before position parent if position is inside a block', () => {
		const position = Position.createAt( item );

		expect( getPositionBeforeBlock( position, schema ).isEqual( Position.createBefore( item ) ) ).to.be.true;
	} );

	it( 'should return null if position is not next to block and is not in a block other than root', () => {
		const position = Position.createBefore( text );

		expect( getPositionBeforeBlock( position, schema ) ).to.be.null;
	} );
} );
