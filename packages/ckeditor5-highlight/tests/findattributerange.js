/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import findAttributeRange from '../src/findattributerange';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'findAttributeRange', () => {
	let model, document, root;

	beforeEach( () => {
		model = new Model();
		document = model.document;
		root = document.createRoot();
		model.schema.extend( '$text', { allowIn: '$root' } );
		model.schema.register( 'p', { inheritAllFrom: '$block' } );
	} );

	it( 'should find attribute range searching from the center of the attribute #1', () => {
		setData( model, '<$text foo="bar">foobar</$text>' );

		const startPosition = new Position( root, [ 3 ] );
		const result = findAttributeRange( startPosition, 'foo', 'bar' );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( Range.createFromParentsAndOffsets( root, 0, root, 6 ) ) ).to.true;
	} );

	it( 'should find attribute range searching from the center of the attribute #2', () => {
		setData( model, 'abc <$text foo="bar">foobar</$text> abc' );

		const startPosition = new Position( root, [ 7 ] );
		const result = findAttributeRange( startPosition, 'foo', 'bar' );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( Range.createFromParentsAndOffsets( root, 4, root, 10 ) ) ).to.true;
	} );

	it( 'should find attribute range searching from the beginning of the attribute #1', () => {
		setData( model, '<$text foo="bar">foobar</$text>' );

		const startPosition = new Position( root, [ 0 ] );
		const result = findAttributeRange( startPosition, 'foo', 'bar' );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( Range.createFromParentsAndOffsets( root, 0, root, 6 ) ) ).to.true;
	} );

	it( 'should find attribute range searching from the beginning of the attribute #2', () => {
		setData( model, 'abc <$text foo="bar">foobar</$text> abc' );

		const startPosition = new Position( root, [ 4 ] );
		const result = findAttributeRange( startPosition, 'foo', 'bar' );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( Range.createFromParentsAndOffsets( root, 4, root, 10 ) ) ).to.true;
	} );

	it( 'should find attribute range searching from the end of the attribute #1', () => {
		setData( model, '<$text foo="bar">foobar</$text>' );

		const startPosition = new Position( root, [ 6 ] );
		const result = findAttributeRange( startPosition, 'foo', 'bar' );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( Range.createFromParentsAndOffsets( root, 0, root, 6 ) ) ).to.true;
	} );

	it( 'should find attribute range searching from the end of the attribute #2', () => {
		setData( model, 'abc <$text foo="bar">foobar</$text> abc' );

		const startPosition = new Position( root, [ 10 ] );
		const result = findAttributeRange( startPosition, 'foo', 'bar' );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( Range.createFromParentsAndOffsets( root, 4, root, 10 ) ) ).to.true;
	} );

	it( 'should find attribute range when attribute stick to other attribute searching from the center of the attribute', () => {
		setData( model, '<$text foo="other">abc</$text><$text foo="bar">foobar</$text><$text foo="other">abc</$text>' );

		const startPosition = new Position( root, [ 6 ] );
		const result = findAttributeRange( startPosition, 'foo', 'bar' );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( Range.createFromParentsAndOffsets( root, 3, root, 9 ) ) ).to.true;
	} );

	it( 'should find attribute range when attribute stick to other attribute searching from the beginning of the attribute', () => {
		setData( model, '<$text foo="other">abc</$text><$text foo="bar">foobar</$text><$text foo="other">abc</$text>' );

		const startPosition = new Position( root, [ 3 ] );
		const result = findAttributeRange( startPosition, 'foo', 'bar' );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( Range.createFromParentsAndOffsets( root, 3, root, 9 ) ) ).to.true;
	} );

	it( 'should find attribute range when attribute stick to other attribute searching from the end of the attribute', () => {
		setData( model, '<$text foo="other">abc</$text><$text foo="bar">foobar</$text><$text foo="other">abc</$text>' );

		const startPosition = new Position( root, [ 9 ] );
		const result = findAttributeRange( startPosition, 'foo', 'bar' );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( Range.createFromParentsAndOffsets( root, 3, root, 9 ) ) ).to.true;
	} );

	it( 'should find attribute range only inside current parent', () => {
		setData(
			model,
			'<p><$text foo="bar">foobar</$text></p>' +
			'<p><$text foo="bar">foobar</$text></p>' +
			'<p><$text foo="bar">foobar</$text></p>'
		);

		const startPosition = new Position( root, [ 1, 3 ] );
		const result = findAttributeRange( startPosition, 'foo', 'bar' );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 6 ] ) ) ) ).to.true;
	} );
} );
