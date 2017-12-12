/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { isImageType, findOptimalInsertionPosition } from '../src/utils';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'upload utils', () => {
	describe( 'isImageType()', () => {
		it( 'should return true for png mime type', () => {
			expect( isImageType( { type: 'image/png' } ) ).to.be.true;
		} );

		it( 'should return true for jpeg mime type', () => {
			expect( isImageType( { type: 'image/jpeg' } ) ).to.be.true;
		} );

		it( 'should return true for gif mime type', () => {
			expect( isImageType( { type: 'image/gif' } ) ).to.be.true;
		} );

		it( 'should return true for bmp mime type', () => {
			expect( isImageType( { type: 'image/bmp' } ) ).to.be.true;
		} );

		it( 'should return false for other mime types', () => {
			expect( isImageType( { type: 'audio/mp3' } ) ).to.be.false;
			expect( isImageType( { type: 'video/mpeg' } ) ).to.be.false;
		} );
	} );

	describe( 'findOptimalInsertionPosition()', () => {
		let model, doc;

		beforeEach( () => {
			model = new Model();
			doc = model.document;

			doc.createRoot();

			model.schema.registerItem( 'paragraph', '$block' );
			model.schema.registerItem( 'image' );
			model.schema.registerItem( 'span' );

			model.schema.allow( { name: 'image', inside: '$root' } );
			model.schema.objects.add( 'image' );

			model.schema.allow( { name: 'span', inside: 'paragraph' } );
			model.schema.allow( { name: '$text', inside: 'span' } );
		} );

		it( 'returns position after selected element', () => {
			setData( model, '<paragraph>x</paragraph>[<image></image>]<paragraph>y</paragraph>' );

			const pos = findOptimalInsertionPosition( doc.selection );

			expect( pos.path ).to.deep.equal( [ 2 ] );
		} );

		it( 'returns position inside empty block', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>y</paragraph>' );

			const pos = findOptimalInsertionPosition( doc.selection );

			expect( pos.path ).to.deep.equal( [ 1, 0 ] );
		} );

		it( 'returns position before block if at the beginning of that block', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>[]foo</paragraph><paragraph>y</paragraph>' );

			const pos = findOptimalInsertionPosition( doc.selection );

			expect( pos.path ).to.deep.equal( [ 1 ] );
		} );

		it( 'returns position before block if in the middle of that block', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>f[]oo</paragraph><paragraph>y</paragraph>' );

			const pos = findOptimalInsertionPosition( doc.selection );

			expect( pos.path ).to.deep.equal( [ 1 ] );
		} );

		it( 'returns position after block if at the end of that block', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>foo[]</paragraph><paragraph>y</paragraph>' );

			const pos = findOptimalInsertionPosition( doc.selection );

			expect( pos.path ).to.deep.equal( [ 2 ] );
		} );

		// Checking if isTouching() was used.
		it( 'returns position after block if at the end of that block (deeply nested)', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>foo<span>bar[]</span></paragraph><paragraph>y</paragraph>' );

			const pos = findOptimalInsertionPosition( doc.selection );

			expect( pos.path ).to.deep.equal( [ 2 ] );
		} );

		it( 'returns selection focus if not in a block', () => {
			model.schema.allow( { name: '$text', inside: '$root' } );
			setData( model, 'foo[]bar' );

			const pos = findOptimalInsertionPosition( doc.selection );

			expect( pos.path ).to.deep.equal( [ 3 ] );
		} );
	} );
} );
