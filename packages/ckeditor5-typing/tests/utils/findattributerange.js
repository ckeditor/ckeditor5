/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import findAttributeRange from '../../src/utils/findattributerange';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
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

	it( 'should find link range searching from the center of the link #1', () => {
		setData( model, '<$text linkHref="url">foobar</$text>' );

		const startPosition = model.createPositionAt( root, [ 3 ] );
		const result = findAttributeRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 6 ) ) ) ).to.true;
	} );

	it( 'should find link range searching from the center of the link #2', () => {
		setData( model, 'abc <$text linkHref="url">foobar</$text> abc' );

		const startPosition = model.createPositionAt( root, [ 7 ] );
		const result = findAttributeRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 4 ), model.createPositionAt( root, 10 ) ) ) ).to.true;
	} );

	it( 'should find link range searching from the beginning of the link #1', () => {
		setData( model, '<$text linkHref="url">foobar</$text>' );

		const startPosition = model.createPositionAt( root, [ 0 ] );
		const result = findAttributeRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 6 ) ) ) ).to.true;
	} );

	it( 'should find link range searching from the beginning of the link #2', () => {
		setData( model, 'abc <$text linkHref="url">foobar</$text> abc' );

		const startPosition = model.createPositionAt( root, [ 4 ] );
		const result = findAttributeRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 4 ), model.createPositionAt( root, 10 ) ) ) ).to.true;
	} );

	it( 'should find link range searching from the end of the link #1', () => {
		setData( model, '<$text linkHref="url">foobar</$text>' );

		const startPosition = model.createPositionAt( root, [ 6 ] );
		const result = findAttributeRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 6 ) ) ) ).to.true;
	} );

	it( 'should find link range searching from the end of the link #2', () => {
		setData( model, 'abc <$text linkHref="url">foobar</$text> abc' );

		const startPosition = model.createPositionAt( root, [ 10 ] );
		const result = findAttributeRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 4 ), model.createPositionAt( root, 10 ) ) ) ).to.true;
	} );

	it( 'should find link range when link stick to other link searching from the center of the link', () => {
		setData( model, '<$text linkHref="other">abc</$text><$text linkHref="url">foobar</$text><$text linkHref="other">abc</$text>' );

		const startPosition = model.createPositionAt( root, [ 6 ] );
		const result = findAttributeRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 9 ) ) ) ).to.true;
	} );

	it( 'should find link range when link stick to other link searching from the beginning of the link', () => {
		setData( model, '<$text linkHref="other">abc</$text><$text linkHref="url">foobar</$text><$text linkHref="other">abc</$text>' );

		const startPosition = model.createPositionAt( root, [ 3 ] );
		const result = findAttributeRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 9 ) ) ) ).to.true;
	} );

	it( 'should find link range when link stick to other link searching from the end of the link', () => {
		setData( model, '<$text linkHref="other">abc</$text><$text linkHref="url">foobar</$text><$text linkHref="other">abc</$text>' );

		const startPosition = model.createPositionAt( root, [ 9 ] );
		const result = findAttributeRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		expect( result.isEqual( model.createRange( model.createPositionAt( root, 3 ), model.createPositionAt( root, 9 ) ) ) ).to.true;
	} );

	it( 'should find link range only inside current parent', () => {
		setData(
			model,
			'<p><$text linkHref="url">foobar</$text></p>' +
			'<p><$text linkHref="url">foobar</$text></p>' +
			'<p><$text linkHref="url">foobar</$text></p>'
		);

		const startPosition = model.createPositionAt( root.getNodeByPath( [ 1 ] ), 3 );
		const result = findAttributeRange( startPosition, 'linkHref', 'url', model );

		expect( result ).to.instanceOf( Range );
		const expectedRange = model.createRange(
			model.createPositionAt( root.getNodeByPath( [ 1 ] ), 0 ),
			model.createPositionAt( root.getNodeByPath( [ 1 ] ), 6 )
		);
		expect( result.isEqual( expectedRange ) ).to.true;
	} );
} );
