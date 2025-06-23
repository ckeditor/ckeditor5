/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ModelText } from '../../src/model/text.js';
import { ModelNode } from '../../src/model/node.js';

describe( 'Text', () => {
	describe( 'constructor()', () => {
		it( 'should create text node without attributes', () => {
			const text = new ModelText( 'bar', { bold: true } );

			expect( text ).to.be.instanceof( ModelNode );
			expect( text ).to.have.property( 'data' ).that.equals( 'bar' );
			expect( Array.from( text.getAttributes() ) ).to.deep.equal( [ [ 'bold', true ] ] );
		} );

		it( 'should create empty text object', () => {
			const empty1 = new ModelText();
			const empty2 = new ModelText( '' );

			expect( empty1.data ).to.equal( '' );
			expect( empty2.data ).to.equal( '' );
		} );
	} );

	describe( 'offsetSize', () => {
		it( 'should be equal to the number of characters in text node', () => {
			expect( new ModelText( '' ).offsetSize ).to.equal( 0 );
			expect( new ModelText( 'abc' ).offsetSize ).to.equal( 3 );
		} );
	} );

	describe( 'is()', () => {
		let text;

		before( () => {
			text = new ModelText( 'bar' );
		} );

		it( 'should return true for node, text', () => {
			expect( text.is( 'node' ) ).to.be.true;
			expect( text.is( 'model:node' ) ).to.be.true;
			expect( text.is( '$text' ) ).to.be.true;
			expect( text.is( 'model:$text' ) ).to.be.true;
			expect( text.is( 'text' ) ).to.be.true;
			expect( text.is( 'model:text' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( text.is( '$textProxy' ) ).to.be.false;
			expect( text.is( 'element' ) ).to.be.false;
			expect( text.is( 'model:element' ) ).to.be.false;
			expect( text.is( 'rootElement' ) ).to.be.false;
			expect( text.is( 'documentFragment' ) ).to.be.false;
		} );
	} );

	describe( '_clone()', () => {
		it( 'should return a new Text instance, with data and attributes equal to cloned text node', () => {
			const text = new ModelText( 'foo', { bold: true } );
			const copy = text._clone();

			expect( copy.data ).to.equal( 'foo' );
			expect( Array.from( copy.getAttributes() ) ).to.deep.equal( [ [ 'bold', true ] ] );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should serialize text node', () => {
			const text = new ModelText( 'foo', { bold: true } );

			expect( text.toJSON() ).to.deep.equal( {
				attributes: { bold: true },
				data: 'foo'
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create text node', () => {
			const text = new ModelText( 'foo', { bold: true } );

			const serialized = text.toJSON();
			const deserialized = ModelText.fromJSON( serialized );

			expect( deserialized.data ).to.equal( 'foo' );
			expect( Array.from( deserialized.getAttributes() ) ).to.deep.equal( [ [ 'bold', true ] ] );
		} );

		it( 'should support unicode', () => {
			const textQ = new ModelText( 'நி' );
			const json = textQ.toJSON();

			expect( json ).to.deep.equal( {
				data: 'நி'
			} );

			const deserialized = ModelText.fromJSON( json );

			expect( deserialized.data ).to.equal( 'நி' );
		} );
	} );
} );
