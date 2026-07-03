/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
import {
	INLINE_FILLER_LENGTH,
	INLINE_FILLER,
	startsWithFiller,
	isInlineFiller,
	getDataWithoutFiller,
	MARKED_NBSP_FILLER
} from '../../src/view/filler.js';

describe( 'filler', () => {
	describe( 'INLINE_FILLER', () => {
		it( 'should have length equal INLINE_FILLER_LENGTH', () => {
			expect( INLINE_FILLER.length ).toBe( INLINE_FILLER_LENGTH );
		} );
	} );

	describe( 'startsWithFiller()', () => {
		it( 'should be true for node which contains only filler', () => {
			const node = document.createTextNode( INLINE_FILLER );

			expect( startsWithFiller( node ) ).toBe( true );
		} );

		it( 'should be true for node which starts with filler', () => {
			const node = document.createTextNode( INLINE_FILLER + 'foo' );

			expect( startsWithFiller( node ) ).toBe( true );
		} );

		it( 'should be true for text which contains only filler', () => {
			const str = `${ INLINE_FILLER }`;

			expect( startsWithFiller( str ) ).toBe( true );
		} );

		it( 'should be true for text which starts with filler', () => {
			const str = `${ INLINE_FILLER }foo`;

			expect( startsWithFiller( str ) ).toBe( true );
		} );

		it( 'should be false for element', () => {
			const node = document.createElement( 'p' );

			expect( startsWithFiller( node ) ).toBe( false );
		} );

		it( 'should be false which contains filler in the middle', () => {
			const node = document.createTextNode( 'x' + INLINE_FILLER + 'x' );

			expect( startsWithFiller( node ) ).toBe( false );
		} );

		it( 'should be false for the node which does not contains filler', () => {
			const node = document.createTextNode( 'foo' );

			expect( startsWithFiller( node ) ).toBe( false );
		} );

		it( 'should be false for the node which does not contains filler, even if it has the same length', () => {
			let text = '';

			for ( let i = 0; i < INLINE_FILLER_LENGTH; i++ ) {
				text += 'x';
			}

			const node = document.createTextNode( text );

			expect( startsWithFiller( node ) ).toBe( false );
		} );
	} );

	describe( 'getDataWithoutFiller()', () => {
		it( 'should return data without filler', () => {
			const node = document.createTextNode( INLINE_FILLER + 'foo' );

			const dataWithoutFiller = getDataWithoutFiller( node );

			expect( dataWithoutFiller.length ).toBe( 3 );
			expect( dataWithoutFiller ).toBe( 'foo' );
		} );

		it( 'should return text without filler', () => {
			const str = `${ INLINE_FILLER }foo`;

			const dataWithoutFiller = getDataWithoutFiller( str );

			expect( dataWithoutFiller.length ).toBe( 3 );
			expect( dataWithoutFiller ).toBe( 'foo' );
		} );

		it( 'should return the same data for data without filler', () => {
			const node = document.createTextNode( 'foo' );

			const dataWithoutFiller = getDataWithoutFiller( node );

			expect( dataWithoutFiller.length ).toBe( 3 );
			expect( dataWithoutFiller ).toBe( 'foo' );
		} );

		it( 'should return the same data for text without filler', () => {
			const node = 'foo';

			const dataWithoutFiller = getDataWithoutFiller( node );

			expect( dataWithoutFiller.length ).toBe( 3 );
			expect( dataWithoutFiller ).toBe( 'foo' );
		} );
	} );

	describe( 'isInlineFiller()', () => {
		it( 'should be true for inline filler', () => {
			const node = document.createTextNode( INLINE_FILLER );

			expect( isInlineFiller( node ) ).toBe( true );
		} );

		it( 'should be false for element which starts with filler', () => {
			const node = document.createTextNode( INLINE_FILLER + 'foo' );

			expect( isInlineFiller( node ) ).toBe( false );
		} );

		it( 'should be false for the node which does not contains filler, even if it has the same length', () => {
			let text = '';

			for ( let i = 0; i < INLINE_FILLER_LENGTH; i++ ) {
				text += 'x';
			}

			const node = document.createTextNode( text );

			expect( isInlineFiller( node ) ).toBe( false );
		} );

		it( 'should be true for inline filler from inside iframe', () => {
			const iframe = document.createElement( 'iframe' );
			document.body.appendChild( iframe );
			const node = iframe.contentDocument.createTextNode( INLINE_FILLER );

			expect( isInlineFiller( node ) ).toBe( true );

			document.body.removeChild( iframe );
		} );
	} );

	describe( 'MARKED_NBSP_FILLER', () => {
		it( 'should return node with correct HTML', () => {
			const node = MARKED_NBSP_FILLER( document ); // eslint-disable-line new-cap

			expect( node.outerHTML ).toBe( '<span data-cke-filler="true">&nbsp;</span>' );
		} );

		it( 'should use innerText setter instead of innerHTML', () => {
			const el = document.createElement( 'span' );
			const innerHTMLSpy = vi.spyOn( el, 'innerHTML', 'set' );
			const innerTextSpy = vi.spyOn( el, 'innerText', 'set' );
			const createElementStub = vi.spyOn( document, 'createElement' ).mockImplementation( tagName => {
				if ( tagName === 'span' ) {
					return el;
				}
				return document.createElement.wrappedMethod( tagName );
			} );

			MARKED_NBSP_FILLER( document ); // eslint-disable-line new-cap

			expect( createElementStub ).toHaveBeenCalledOnce();
			expect( innerHTMLSpy ).not.toHaveBeenCalled();
			expect( innerTextSpy ).toHaveBeenCalledOnce();
		} );
	} );
} );
