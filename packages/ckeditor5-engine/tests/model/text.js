/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

'use strict';

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
} );
