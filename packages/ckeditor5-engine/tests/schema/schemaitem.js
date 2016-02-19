/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Schema from '/ckeditor5/core/treemodel/schema.js';
import { SchemaItem as SchemaItem } from '/ckeditor5/core/treemodel/schema.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

let schema, item;

beforeEach( () => {
	schema = new Schema();

	schema.registerItem( 'p', 'block' );
	schema.registerItem( 'header', 'block' );
	schema.registerItem( 'div', 'block' );
	schema.registerItem( 'html', 'block' );
	schema.registerItem( 'span', 'inline' );
	schema.registerItem( 'image', 'inline' );

	item = new SchemaItem( schema );
} );

describe( 'constructor', () => {
	it( 'should create empty schema item', () => {
		let item = new SchemaItem( schema );

		expect( item._disallowed ).to.deep.equal( [] );
		expect( item._allowed ).to.deep.equal( [] );
	} );

	it( 'should throw if no schema was passed', () => {
		expect( () => {
			new SchemaItem();
		} ).to.throw( CKEditorError, /schema-item-no-schema/ );
	} );
} );

describe( 'addAllowed', () => {
	it( 'should add paths to the item as copies of passed array', () => {
		let path1 = [ 'div', 'header' ];
		let path2 = [ 'p' ];

		item.addAllowed( path1 );
		item.addAllowed( path2 );

		let paths = item._getPaths( 'ALLOW' );

		expect( paths.length ).to.equal( 2 );

		expect( paths[ 0 ] ).not.to.equal( path1 );
		expect( paths[ 1 ] ).not.to.equal( path2 );

		expect( paths[ 0 ] ).to.deep.equal( [ 'div', 'header' ] );
		expect( paths[ 1 ] ).to.deep.equal( [ 'p' ] );
	} );

	it( 'should accept paths as string with element names separated with space', () => {
		item.addAllowed( 'div header' );

		let paths = item._getPaths( 'ALLOW' );

		expect( paths[ 0 ] ).to.deep.equal( [ 'div', 'header' ] );
	} );

	it( 'should group paths by attribute', () => {
		item.addAllowed( 'p', 'bold' );
		item.addAllowed( 'div' );
		item.addAllowed( 'header', 'bold' );

		let pathsWithNoAttribute = item._getPaths( 'ALLOW' );
		let pathsWithBoldAttribute = item._getPaths( 'ALLOW', 'bold' );

		expect( pathsWithNoAttribute.length ).to.equal( 1 );
		expect( pathsWithNoAttribute[ 0 ] ).to.deep.equal( [ 'div' ] );

		expect( pathsWithBoldAttribute.length ).to.equal( 2 );
		expect( pathsWithBoldAttribute[ 0 ] ).to.deep.equal( [ 'p' ] );
		expect( pathsWithBoldAttribute[ 1 ] ).to.deep.equal( [ 'header' ] );
	} );
} );

describe( 'addDisallowed', () => {
	it( 'should add paths to the item as copies of passed array', () => {
		let path1 = [ 'div', 'header' ];
		let path2 = [ 'p' ];

		item.addDisallowed( path1 );
		item.addDisallowed( path2 );

		let paths = item._getPaths( 'DISALLOW' );

		expect( paths.length ).to.equal( 2 );

		expect( paths[ 0 ] ).not.to.equal( path1 );
		expect( paths[ 1 ] ).not.to.equal( path2 );

		expect( paths[ 0 ] ).to.deep.equal( [ 'div', 'header' ] );
		expect( paths[ 1 ] ).to.deep.equal( [ 'p' ] );
	} );

	it( 'should accept paths as string with element names separated with space', () => {
		item.addDisallowed( 'div header' );

		let paths = item._getPaths( 'DISALLOW' );

		expect( paths[ 0 ] ).to.deep.equal( [ 'div', 'header' ] );
	} );

	it( 'should group paths by attribute', () => {
		item.addDisallowed( 'p', 'bold' );
		item.addDisallowed( 'div' );
		item.addDisallowed( 'header', 'bold' );

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
		item.addAllowed( 'div header' );
		item.addAllowed( 'image' );

		expect( item._hasMatchingPath( 'ALLOW', [ 'div', 'header' ] ) ).to.be.true;
		expect( item._hasMatchingPath( 'ALLOW', [ 'html', 'div', 'header' ] ) ).to.be.true;
		expect( item._hasMatchingPath( 'ALLOW', [ 'div', 'header', 'span' ] ) ).to.be.true;
		expect( item._hasMatchingPath( 'ALLOW', [ 'html', 'div', 'p', 'header', 'span' ] ) ).to.be.true;
	} );

	it( 'should return false if there are no allowed paths that match query path', () => {
		item.addAllowed( 'div p' );

		expect( item._hasMatchingPath( 'ALLOW', [ 'p' ] ) ).to.be.false;
		expect( item._hasMatchingPath( 'ALLOW', [ 'div' ] ) ).to.be.false;
		expect( item._hasMatchingPath( 'ALLOW', [ 'p', 'div' ] ) ).to.be.false;
	} );

	it( 'should return true if there is at least one disallowed path that matches query path', () => {
		item.addAllowed( 'div header' );
		item.addDisallowed( 'p header' );

		expect( item._hasMatchingPath( 'DISALLOW', [ 'html', 'div', 'p', 'header', 'span' ] ) ).to.be.true;
	} );

	it( 'should use only paths that are registered for given attribute', () => {
		item.addAllowed( 'div p' );
		item.addAllowed( 'div', 'bold' );
		item.addAllowed( 'header' );
		item.addDisallowed( 'header', 'bold' );

		expect( item._hasMatchingPath( 'ALLOW', [ 'html', 'div', 'p' ]  ) ).to.be.true;
		expect( item._hasMatchingPath( 'ALLOW', [ 'html', 'div' ] ) ).to.be.false;
		expect( item._hasMatchingPath( 'ALLOW', [ 'html', 'div' ], 'bold' ) ).to.be.true;

		expect( item._hasMatchingPath( 'DISALLOW', [ 'html', 'div', 'header' ] ) ).to.be.false;
		expect( item._hasMatchingPath( 'DISALLOW', [ 'html', 'div', 'p', 'header', 'span' ], 'bold' ) ).to.be.true;
	} );
} );
