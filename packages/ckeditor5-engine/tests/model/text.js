/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

import Text from '/ckeditor5/engine/model/text.js';
import Node from '/ckeditor5/engine/model/node.js';
import { jsonParseStringify } from '/tests/engine/model/_utils/utils.js';

describe( 'Text', () => {
	describe( 'constructor', () => {
		it( 'should create text node without attributes', () => {
			let text = new Text( 'bar', { bold: true } );

			expect( text ).to.be.instanceof( Node );
			expect( text ).to.have.property( 'data' ).that.equals( 'bar' );
			expect( Array.from( text.getAttributes() ) ).to.deep.equal( [ [ 'bold', true ] ] );
		} );

		it( 'should create empty text object', () => {
			let empty1 = new Text();
			let empty2 = new Text( '' );

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

	describe( 'clone', () => {
		it( 'should return a new Text instance, with data and attributes equal to cloned text node', () => {
			let text = new Text( 'foo', { bold: true } );
			let copy = text.clone();

			expect( copy.data ).to.equal( 'foo' );
			expect( Array.from( copy.getAttributes() ) ).to.deep.equal( [ [ 'bold', true ] ] );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should serialize text node', () => {
			let text = new Text( 'foo', { bold: true } );

			expect( jsonParseStringify( text ) ).to.deep.equal( {
				attributes: [ [ 'bold', true ] ],
				data: 'foo'
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create text node', () => {
			let text = new Text( 'foo', { bold: true } );

			let serialized = jsonParseStringify( text );
			let deserialized = Text.fromJSON( serialized );

			expect( deserialized.data ).to.equal( 'foo' );
			expect( Array.from( deserialized.getAttributes() ) ).to.deep.equal( [ [ 'bold', true ] ] );
		} );
	} );

	// All characters, code points, combined symbols, etc. can be looked up in browsers console to better understand what is going on.
	describe( 'unicode support', () => {
		it( 'should normalize strings kept in data', () => {
			// This is a letter "n" with so-called combining mark, similar to ~, which code point is \u0303.
			// Those two characters together combines to "ñ", but that character already has it's code point: \u00F1.
			let dataCombined = '\u006E\u0303';
			let textN = new Text( dataCombined );

			expect( textN.data ).to.equal( '\u00F1' ); // "ñ" got normalized to \u00F1.
			expect( textN.data.length ).to.equal( 1 ); // It is now just one character.
			expect( textN.offsetSize ).to.equal( 1 ); // And has correct offset size.
		} );

		it( 'should be properly serialized and de-serialized', () => {
			let textQ = new Text( 'நி' );
			let json = jsonParseStringify( textQ );

			expect( json ).to.deep.equal( {
				data: 'நி'
			} );

			let deserialized = Text.fromJSON( json );

			expect( deserialized.data ).to.equal( 'நி' );
		} );
	} );
} );
