/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '/ckeditor5/engine/model/document.js';
import Range from '/ckeditor5/engine/model/range.js';
import getSchemaValidRanges from '/ckeditor5/core/command/helpers/getschemavalidranges.js';
import { setData } from '/ckeditor5/engine/dev-utils/model.js';

describe( 'getSchemaValidRanges', () => {
	const attribute = 'bold';
	let document, root, schema, ranges;

	beforeEach( () => {
		document = new Document();
		schema = document.schema;
		root = document.createRoot();

		schema.registerItem( 'p', '$block' );
		schema.registerItem( 'h1', '$block' );
		schema.registerItem( 'img', '$inline' );

		// Allow bold on p
		schema.allow( { name: '$text', attributes: 'bold', inside: 'p' } );
		schema.allow( { name: 'p', attributes: 'bold', inside: '$root' } );

		setData( document, '<p>foo<img />bar</p>' );
		ranges = [ Range.createOn( root.getChild( 0 ) ) ];
	} );

	it( 'should return unmodified ranges when attribute is allowed on each element', () => {
		// Allow bold on img
		schema.allow( { name: 'img', attributes: 'bold', inside: 'p' } );

		expect( getSchemaValidRanges( attribute, ranges, schema ) ).to.deep.equal( ranges );
	} );

	it( 'should split range into two ranges and omit disallowed element', () => {
		// Disallow bold on img.
		document.schema.disallow( { name: 'img', attributes: 'bold', inside: 'p' } );

		const result = getSchemaValidRanges( attribute, ranges, schema );

		expect( result ).to.length( 2 );
		expect( result[ 0 ].start.path ).to.members( [ 0 ] );
		expect( result[ 0 ].end.path ).to.members( [ 0, 3 ] );
		expect( result[ 1 ].start.path ).to.members( [ 0, 4 ] );
		expect( result[ 1 ].end.path ).to.members( [ 1 ] );
	} );
} );
