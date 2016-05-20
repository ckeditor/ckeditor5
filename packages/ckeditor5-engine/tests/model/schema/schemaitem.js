/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

'use strict';

import Schema from '/ckeditor5/engine/model/schema.js';
import { SchemaItem as SchemaItem } from '/ckeditor5/engine/model/schema.js';

let schema, item;

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

describe( 'constructor', () => {
	it( 'should create empty schema item', () => {
		let item = new SchemaItem( schema );

		expect( item._disallowed ).to.deep.equal( [] );
		expect( item._allowed ).to.deep.equal( [] );
	} );
} );

describe( 'allow', () => {
	it( 'should add paths to the item as copies of passed array', () => {
		let path1 = [ 'div', 'header' ];
		let path2 = [ 'p' ];

		item.allow( path1 );
		item.allow( path2 );

		let paths = item._getPaths( 'ALLOW' );

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

		let pathsWithNoAttribute = item._getPaths( 'ALLOW' );
		let pathsWithBoldAttribute = item._getPaths( 'ALLOW', 'bold' );

		expect( pathsWithNoAttribute.length ).to.equal( 1 );
		expect( pathsWithNoAttribute[ 0 ] ).to.deep.equal( [ 'div' ] );

		expect( pathsWithBoldAttribute.length ).to.equal( 2 );
		expect( pathsWithBoldAttribute[ 0 ] ).to.deep.equal( [ 'p' ] );
		expect( pathsWithBoldAttribute[ 1 ] ).to.deep.equal( [ 'header' ] );
	} );
} );

describe( 'disallow', () => {
	it( 'should add paths to the item as copies of passed array', () => {
		let path1 = [ 'div', 'header' ];
		let path2 = [ 'p' ];

		item.disallow( path1 );
		item.disallow( path2 );

		let paths = item._getPaths( 'DISALLOW' );

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

		let pathsWithNoAttribute = item._getPaths( 'DISALLOW' );
		let pathsWithBoldAttribute = item._getPaths( 'DISALLOW', 'bold' );

		expect( pathsWithNoAttribute.length ).to.equal( 1 );
		expect( pathsWithNoAttribute[ 0 ] ).to.deep.equal( [ 'div' ] );

		expect( pathsWithBoldAttribute.length ).to.equal( 2 );
		expect( pathsWithBoldAttribute[ 0 ] ).to.deep.equal( [ 'p' ] );
		expect( pathsWithBoldAttribute[ 1 ] ).to.deep.equal( [ 'header' ] );
	} );
} );

describe( '_hasMatchingPath', () => {
	it( 'should return true if there is at least one allowed path that matches query path', () => {
		item.allow( [ 'div' , 'header' ] );
		item.allow( [ 'image' ] );

		expect( item._hasMatchingPath( 'ALLOW', [ 'div', 'header' ] ) ).to.be.true;
		expect( item._hasMatchingPath( 'ALLOW', [ 'html', 'div', 'header' ] ) ).to.be.true;
		expect( item._hasMatchingPath( 'ALLOW', [ 'div', 'header', 'span' ] ) ).to.be.true;
		expect( item._hasMatchingPath( 'ALLOW', [ 'html', 'div', 'p', 'header', 'span' ] ) ).to.be.true;
	} );

	it( 'should return false if there are no allowed paths that match query path', () => {
		item.allow( [ 'div', 'p' ] );

		expect( item._hasMatchingPath( 'ALLOW', [ 'p' ] ) ).to.be.false;
		expect( item._hasMatchingPath( 'ALLOW', [ 'div' ] ) ).to.be.false;
		expect( item._hasMatchingPath( 'ALLOW', [ 'p', 'div' ] ) ).to.be.false;
	} );

	it( 'should return true if there is at least one disallowed path that matches query path', () => {
		item.allow( [ 'div', 'header' ] );
		item.disallow( [ 'p', 'header' ] );

		expect( item._hasMatchingPath( 'DISALLOW', [ 'html', 'div', 'p', 'header', 'span' ] ) ).to.be.true;
	} );

	it( 'should use only paths that are registered for given attribute', () => {
		item.allow( [ 'div', 'p' ] );
		item.allow( [ 'div' ], 'bold' );
		item.allow( [ 'header' ] );
		item.disallow( [ 'header' ], 'bold' );

		expect( item._hasMatchingPath( 'ALLOW', [ 'html', 'div', 'p' ]  ) ).to.be.true;
		expect( item._hasMatchingPath( 'ALLOW', [ 'html', 'div' ] ) ).to.be.false;
		expect( item._hasMatchingPath( 'ALLOW', [ 'html', 'div' ], 'bold' ) ).to.be.true;

		expect( item._hasMatchingPath( 'DISALLOW', [ 'html', 'div', 'header' ] ) ).to.be.false;
		expect( item._hasMatchingPath( 'DISALLOW', [ 'html', 'div', 'p', 'header', 'span' ], 'bold' ) ).to.be.true;
	} );
} );

describe( 'toJSON', () => {
	it( 'should create proper JSON string', () => {
		let parsedItem = JSON.parse( JSON.stringify( item ) );

		expect( parsedItem._schema ).to.equal( '[model.Schema]' );
	} );
} );
