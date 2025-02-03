/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../src/model/model.js';
import Element from '../../src/model/element.js';
import RootElement from '../../src/model/rootelement.js';
import count from '@ckeditor/ckeditor5-utils/src/count.js';

describe( 'RootElement', () => {
	describe( 'constructor()', () => {
		it( 'should create attached root element without attributes', () => {
			const model = new Model();
			const doc = model.document;
			const root = new RootElement( doc );

			expect( root ).to.be.an.instanceof( Element );
			expect( root.isAttached() ).to.be.true;
			expect( root ).to.have.property( 'document' ).that.equals( doc );
			expect( count( root.getAttributes() ) ).to.equal( 0 );
			expect( root.childCount ).to.equal( 0 );
		} );
	} );

	describe( 'is()', () => {
		let root;

		before( () => {
			const model = new Model();
			const doc = model.document;

			root = new RootElement( doc, '$root' );
		} );

		it( 'should return true for rootElement, element, element with same name and element name', () => {
			expect( root.is( 'element', '$root' ) ).to.be.true;
			expect( root.is( 'model:element', '$root' ) ).to.be.true;
			expect( root.is( 'element' ) ).to.be.true;
			expect( root.is( 'model:element' ) ).to.be.true;
			expect( root.is( 'rootElement', '$root' ) ).to.be.true;
			expect( root.is( 'model:rootElement', '$root' ) ).to.be.true;
			expect( root.is( 'rootElement' ) ).to.be.true;
			expect( root.is( 'model:rootElement' ) ).to.be.true;
			expect( root.is( 'node' ) ).to.be.true;
			expect( root.is( 'model:node' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( root.is( 'element', '$graveyard' ) ).to.be.false;
			expect( root.is( 'model:element', '$graveyard' ) ).to.be.false;
			expect( root.is( 'rootElement', '$graveyard' ) ).to.be.false;
			expect( root.is( 'model:rootElement', '$graveyard' ) ).to.be.false;
			expect( root.is( '$graveyard' ) ).to.be.false;
			expect( root.is( '$text' ) ).to.be.false;
			expect( root.is( '$textProxy' ) ).to.be.false;
			expect( root.is( 'documentFragment' ) ).to.be.false;
			expect( root.is( 'view:element' ) ).to.be.false;
			expect( root.is( '$root' ) ).to.be.false;
			expect( root.is( 'model:$root' ) ).to.be.false;
			expect( root.is( 'node', '$root' ) ).to.be.false;
			expect( root.is( 'model:node', '$root' ) ).to.be.false;
		} );
	} );
} );
