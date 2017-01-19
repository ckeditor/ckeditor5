/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '@ckeditor/ckeditor5-engine/src/model/document';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Selection from '@ckeditor/ckeditor5-engine/src/model/selection';
import getSchemaValidRanges from '../../../src/command/helpers/getschemavalidranges';
import { setData, stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

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

		schema.allow( { name: '$text', attributes: 'bold', inside: 'p' } );
		schema.allow( { name: 'p', attributes: 'bold', inside: '$root' } );

		setData( document, '<p>foo<img />bar</p>' );
		ranges = [ Range.createOn( root.getChild( 0 ) ) ];
	} );

	it( 'should return unmodified ranges when attribute is allowed on each item (v1 – text is not allowed in img)', () => {
		schema.allow( { name: 'img', attributes: 'bold', inside: 'p' } );

		expect( getSchemaValidRanges( attribute, ranges, schema ) ).to.deep.equal( ranges );
	} );

	it( 'should return unmodified ranges when attribute is allowed on each item (v2 – text is allowed in img)', () => {
		schema.allow( { name: 'img', attributes: 'bold', inside: 'p' } );
		schema.allow( { name: '$text', inside: 'img' } );

		expect( getSchemaValidRanges( attribute, ranges, schema ) ).to.deep.equal( ranges );
	} );

	it( 'should return two ranges when attribute is not allowed on one item', () => {
		schema.allow( { name: 'img', attributes: 'bold', inside: 'p' } );
		schema.allow( { name: '$text', inside: 'img' } );

		setData( document, '<p>foo<img>xxx</img>bar</p>' );

		const validRanges = getSchemaValidRanges( attribute, ranges, schema );
		const sel = new Selection();
		sel.setRanges( validRanges );

		expect( stringify( root, sel ) ).to.equal( '[<p>foo<img>]xxx[</img>bar</p>]' );
	} );

	it( 'should return three ranges when attribute is not allowed on one element but is allowed on its child', () => {
		schema.allow( { name: '$text', inside: 'img' } );
		schema.allow( { name: '$text', attributes: 'bold', inside: 'img' } );

		setData( document, '<p>foo<img>xxx</img>bar</p>' );

		const validRanges = getSchemaValidRanges( attribute, ranges, schema );
		const sel = new Selection();
		sel.setRanges( validRanges );

		expect( stringify( root, sel ) ).to.equal( '[<p>foo]<img>[xxx]</img>[bar</p>]' );
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
