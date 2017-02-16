/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../src/model/document';
import Element from '../../src/model/element';
import RootElement from '../../src/model/rootelement';
import count from '@ckeditor/ckeditor5-utils/src/count';

describe( 'RootElement', () => {
	describe( 'constructor()', () => {
		it( 'should create root element without attributes', () => {
			let doc = new Document();
			let root = new RootElement( doc );

			expect( root ).to.be.an.instanceof( Element );
			expect( root ).to.have.property( 'document' ).that.equals( doc );
			expect( count( root.getAttributes() ) ).to.equal( 0 );
			expect( root.childCount ).to.equal( 0 );
		} );
	} );

	describe( 'is', () => {
		let root;

		before( () => {
			const doc = new Document();
			root = new RootElement( doc, '$root' );
		} );

		it( 'should return true for rootElement, element, element with same name, element name and node', () => {
			expect( root.is( 'element' ) ).to.be.true;
			expect( root.is( 'element', '$root' ) ).to.be.true;
			expect( root.is( '$root' ) ).to.be.true;
			expect( root.is( 'rootElement' ) ).to.be.true;
			expect( root.is( 'node' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( root.is( 'text' ) ).to.be.false;
			expect( root.is( 'textProxy' ) ).to.be.false;
			expect( root.is( 'documentFragment' ) ).to.be.false;
		} );
	} );
} );
