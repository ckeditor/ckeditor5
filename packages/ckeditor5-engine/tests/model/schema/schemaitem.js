/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { default as Schema, SchemaItem } from '../../../src/model/schema';

let schema, item;

describe( 'SchemaItem', () => {
	beforeEach( () => {
		schema = new Schema();

		schema.registerItem( 'p', '$block' );
		schema.registerItem( 'header', '$block' );
		schema.registerItem( 'div', '$block' );
		schema.registerItem( 'html', '$block' );
		schema.registerItem( 'span', '$inline' );
		schema.registerItem( 'image', '$inline' );

		item = new SchemaItem( schema );
	} );

	describe( 'constructor()', () => {
		it( 'should create empty schema item', () => {
			const item = new SchemaItem( schema );

			expect( item._disallowed ).to.deep.equal( [] );
			expect( item._allowed ).to.deep.equal( [] );
		} );
	} );

	describe( 'allow', () => {
		it( 'should add paths to the item as copies of passed array', () => {
			const path1 = [ 'div', 'header' ];
			const path2 = [ 'p' ];

			item.allow( path1 );
			item.allow( path2 );

			const paths = item._getPaths( 'allow' );

			expect( paths.length ).to.equal( 2 );

			expect( paths[ 0 ] ).not.to.equal( path1 );
			expect( paths[ 1 ] ).not.to.equal( path2 );

			expect( paths[ 0 ] ).to.deep.equal( [ 'div', 'header' ] );
			expect( paths[ 1 ] ).to.deep.equal( [ 'p' ] );
		} );

		it( 'should group paths by attribute', () => {
			item.allow( [ 'p' ], 'bold' );
			item.allow( [ 'div' ] );
			item.allow( [ 'header' ], 'bold' );

			const pathsWithNoAttribute = item._getPaths( 'allow' );
			const pathsWithBoldAttribute = item._getPaths( 'allow', 'bold' );

			expect( pathsWithNoAttribute.length ).to.equal( 1 );
			expect( pathsWithNoAttribute[ 0 ] ).to.deep.equal( [ 'div' ] );

			expect( pathsWithBoldAttribute.length ).to.equal( 2 );
			expect( pathsWithBoldAttribute[ 0 ] ).to.deep.equal( [ 'p' ] );
			expect( pathsWithBoldAttribute[ 1 ] ).to.deep.equal( [ 'header' ] );
		} );
	} );

	describe( 'disallow', () => {
		it( 'should add paths to the item as copies of passed array', () => {
			const path1 = [ 'div', 'header' ];
			const path2 = [ 'p' ];

			item.disallow( path1 );
			item.disallow( path2 );

			const paths = item._getPaths( 'disallow' );

			expect( paths.length ).to.equal( 2 );

			expect( paths[ 0 ] ).not.to.equal( path1 );
			expect( paths[ 1 ] ).not.to.equal( path2 );

			expect( paths[ 0 ] ).to.deep.equal( [ 'div', 'header' ] );
			expect( paths[ 1 ] ).to.deep.equal( [ 'p' ] );
		} );

		it( 'should group paths by attribute', () => {
			item.disallow( [ 'p' ], 'bold' );
			item.disallow( [ 'div' ] );
			item.disallow( [ 'header' ], 'bold' );

			const pathsWithNoAttribute = item._getPaths( 'disallow' );
			const pathsWithBoldAttribute = item._getPaths( 'disallow', 'bold' );

			expect( pathsWithNoAttribute.length ).to.equal( 1 );
			expect( pathsWithNoAttribute[ 0 ] ).to.deep.equal( [ 'div' ] );

			expect( pathsWithBoldAttribute.length ).to.equal( 2 );
			expect( pathsWithBoldAttribute[ 0 ] ).to.deep.equal( [ 'p' ] );
			expect( pathsWithBoldAttribute[ 1 ] ).to.deep.equal( [ 'header' ] );
		} );
	} );

	describe( '_hasMatchingPath', () => {
		it( 'should return true if there is at least one allowed path that matches query path', () => {
			item.allow( [ 'div', 'header' ] );
			item.allow( [ 'image' ] );

			expect( item._hasMatchingPath( 'allow', [ 'div', 'header' ] ) ).to.be.true;
			expect( item._hasMatchingPath( 'allow', [ 'html', 'div', 'header' ] ) ).to.be.true;
		} );

		it( 'should return false if there are no allowed paths that match query path', () => {
			item.allow( [ 'div', 'p' ] );

			expect( item._hasMatchingPath( 'allow', [ 'div' ] ) ).to.be.false;
			expect( item._hasMatchingPath( 'allow', [ 'p', 'div' ] ) ).to.be.false;
			expect( item._hasMatchingPath( 'allow', [ 'div', 'p', 'span' ] ) ).to.be.false;
		} );

		it( 'should return true if there is at least one disallowed path that matches query path', () => {
			item.allow( [ 'div', 'header' ] );
			item.disallow( [ 'p', 'header' ] );

			expect( item._hasMatchingPath( 'disallow', [ 'html', 'div', 'p', 'header' ] ) ).to.be.true;
		} );

		it( 'should use only paths that are registered for given attribute', () => {
			item.allow( [ 'div', 'p' ] );
			item.allow( [ 'div' ], 'bold' );
			item.allow( [ 'header' ] );
			item.disallow( [ 'header' ], 'bold' );

			expect( item._hasMatchingPath( 'allow', [ 'html', 'div', 'p' ] ) ).to.be.true;
			expect( item._hasMatchingPath( 'allow', [ 'html', 'div' ] ) ).to.be.false;
			expect( item._hasMatchingPath( 'allow', [ 'html', 'div' ], 'bold' ) ).to.be.true;

			expect( item._hasMatchingPath( 'disallow', [ 'html', 'div', 'header' ] ) ).to.be.false;
			expect( item._hasMatchingPath( 'disallow', [ 'html', 'div', 'p', 'header' ], 'bold' ) ).to.be.true;
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper JSON string', () => {
			const parsedItem = JSON.parse( JSON.stringify( item ) );

			expect( parsedItem._schema ).to.equal( '[model.Schema]' );
		} );
	} );
} );
