/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { ModelText } from '../../src/model/text.js';
import { ModelNode } from '../../src/model/node.js';

describe( 'Text', () => {
	describe( 'constructor()', () => {
		it( 'should create text node without attributes', () => {
			const text = new ModelText( 'bar', { bold: true } );

			expect( text ).toBeInstanceOf( ModelNode );
			expect( text ).toHaveProperty( 'data', 'bar' );
			expect( Array.from( text.getAttributes() ) ).toEqual( [ [ 'bold', true ] ] );
		} );

		it( 'should create empty text object', () => {
			const empty1 = new ModelText();
			const empty2 = new ModelText( '' );

			expect( empty1.data ).toBe( '' );
			expect( empty2.data ).toBe( '' );
		} );
	} );

	describe( 'offsetSize', () => {
		it( 'should be equal to the number of characters in text node', () => {
			expect( new ModelText( '' ).offsetSize ).toBe( 0 );
			expect( new ModelText( 'abc' ).offsetSize ).toBe( 3 );
		} );
	} );

	describe( 'is()', () => {
		let text;

		beforeAll( () => {
			text = new ModelText( 'bar' );
		} );

		it( 'should return true for node, text', () => {
			expect( text.is( 'node' ) ).toBe( true );
			expect( text.is( 'model:node' ) ).toBe( true );
			expect( text.is( '$text' ) ).toBe( true );
			expect( text.is( 'model:$text' ) ).toBe( true );
			expect( text.is( 'text' ) ).toBe( true );
			expect( text.is( 'model:text' ) ).toBe( true );
		} );

		it( 'should return false for other accept values', () => {
			expect( text.is( '$textProxy' ) ).toBe( false );
			expect( text.is( 'element' ) ).toBe( false );
			expect( text.is( 'model:element' ) ).toBe( false );
			expect( text.is( 'rootElement' ) ).toBe( false );
			expect( text.is( 'documentFragment' ) ).toBe( false );
		} );
	} );

	describe( '_clone()', () => {
		it( 'should return a new Text instance, with data and attributes equal to cloned text node', () => {
			const text = new ModelText( 'foo', { bold: true } );
			const copy = text._clone();

			expect( copy.data ).toBe( 'foo' );
			expect( Array.from( copy.getAttributes() ) ).toEqual( [ [ 'bold', true ] ] );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should serialize text node', () => {
			const text = new ModelText( 'foo', { bold: true } );

			expect( text.toJSON() ).toEqual( {
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

			expect( deserialized.data ).toBe( 'foo' );
			expect( Array.from( deserialized.getAttributes() ) ).toEqual( [ [ 'bold', true ] ] );
		} );

		it( 'should support unicode', () => {
			const textQ = new ModelText( 'நி' );
			const json = textQ.toJSON();

			expect( json ).toEqual( {
				data: 'நி'
			} );

			const deserialized = ModelText.fromJSON( json );

			expect( deserialized.data ).toBe( 'நி' );
		} );
	} );
} );
