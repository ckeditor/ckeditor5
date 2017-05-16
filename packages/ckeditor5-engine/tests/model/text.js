/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Text from '../../src/model/text';
import Node from '../../src/model/node';
import { jsonParseStringify } from '../../tests/model/_utils/utils';

describe( 'Text', () => {
	describe( 'constructor()', () => {
		it( 'should create text node without attributes', () => {
			const text = new Text( 'bar', { bold: true } );

			expect( text ).to.be.instanceof( Node );
			expect( text ).to.have.property( 'data' ).that.equals( 'bar' );
			expect( Array.from( text.getAttributes() ) ).to.deep.equal( [ [ 'bold', true ] ] );
		} );

		it( 'should create empty text object', () => {
			const empty1 = new Text();
			const empty2 = new Text( '' );

			expect( empty1.data ).to.equal( '' );
			expect( empty2.data ).to.equal( '' );
		} );
	} );

	describe( 'offsetSize', () => {
		it( 'should be equal to the number of characters in text node', () => {
			expect( new Text( '' ).offsetSize ).to.equal( 0 );
			expect( new Text( 'abc' ).offsetSize ).to.equal( 3 );
		} );
	} );

	describe( 'is', () => {
		let text;

		before( () => {
			text = new Text( 'bar' );
		} );

		it( 'should return true for text', () => {
			expect( text.is( 'text' ) ).to.be.true;
		} );

		it( 'should return false for other accept values', () => {
			expect( text.is( 'textProxy' ) ).to.be.false;
			expect( text.is( 'element' ) ).to.be.false;
			expect( text.is( 'rootElement' ) ).to.be.false;
			expect( text.is( 'documentFragment' ) ).to.be.false;
		} );
	} );

	describe( 'clone', () => {
		it( 'should return a new Text instance, with data and attributes equal to cloned text node', () => {
			const text = new Text( 'foo', { bold: true } );
			const copy = text.clone();

			expect( copy.data ).to.equal( 'foo' );
			expect( Array.from( copy.getAttributes() ) ).to.deep.equal( [ [ 'bold', true ] ] );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should serialize text node', () => {
			const text = new Text( 'foo', { bold: true } );

			expect( jsonParseStringify( text ) ).to.deep.equal( {
				attributes: [ [ 'bold', true ] ],
				data: 'foo'
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create text node', () => {
			const text = new Text( 'foo', { bold: true } );

			const serialized = jsonParseStringify( text );
			const deserialized = Text.fromJSON( serialized );

			expect( deserialized.data ).to.equal( 'foo' );
			expect( Array.from( deserialized.getAttributes() ) ).to.deep.equal( [ [ 'bold', true ] ] );
		} );

		it( 'should support unicode', () => {
			const textQ = new Text( 'நி' );
			const json = jsonParseStringify( textQ );

			expect( json ).to.deep.equal( {
				data: 'நி'
			} );

			const deserialized = Text.fromJSON( json );

			expect( deserialized.data ).to.equal( 'நி' );
		} );
	} );
} );
