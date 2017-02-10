/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { getClosestListItem, getPositionBeforeBlock } from '../src/utils';

import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import Text from '@ckeditor/ckeditor5-engine/src/model/text';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Schema from '@ckeditor/ckeditor5-engine/src/model/schema';

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
