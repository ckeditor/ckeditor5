/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '/ckeditor5/engine/model/document.js';
import Range from '/ckeditor5/engine/model/range.js';
import Text from '/ckeditor5/engine/model/text.js';
import Element from '/ckeditor5/engine/model/element.js';
import getSchemaValidRanges from '/ckeditor5/core/command/helpers/getschemavalidranges.js';

describe( 'getSchemaValidRanges', () => {
	const attribute = 'bold';
	let document, root, schema;

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

		root.insertChildren( 0, [
			new Element( 'p', [], [
				new Text( 'foo' ),
				new Element( 'img' ),
				new Element( 'img' ),
				new Text( 'bar' )
			] )
		] );
	} );

	it( 'should return unmodified ranges when attribute is allowed on each element', () => {
		// Allow bold on img
		schema.allow( { name: 'img', attributes: 'bold', inside: 'p' } );

		const ranges = [ Range.createOn( root.getChild( 0 ) ) ];

		expect( getSchemaValidRanges( attribute, ranges, schema ) ).to.deep.equal( ranges );
	} );

	it( 'should split range into two ranges and omit disallowed elements', () => {
		// Disallow bold on img.
		document.schema.disallow( { name: 'img', attributes: 'bold', inside: 'p' } );

		const ranges = [ Range.createOn( root.getChild( 0 ) ) ];
		const result = getSchemaValidRanges( attribute, ranges, schema );

		expect( result ).to.length( 2 );
		expect( result[ 0 ].start.path ).to.members( [ 0 ] );
		expect( result[ 0 ].end.path ).to.members( [ 0, 3 ] );
		expect( result[ 1 ].start.path ).to.members( [ 0, 5 ] );
		expect( result[ 1 ].end.path ).to.members( [ 1 ] );
	} );
} );
