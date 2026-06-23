/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ViewDomConverter } from '../../../src/view/domconverter.js';
import { ViewDocument } from '../../../src/view/document.js';
import { ViewElement } from '../../../src/view/element.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

import { createElement } from '@ckeditor/ckeditor5-utils';

describe( 'DOMConverter raw content matcher', () => {
	let converter, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		converter = new ViewDomConverter( viewDocument );
	} );

	describe( 'domToView()', () => {
		describe( 'assign $rawContent custom property for view elements registered as raw content elements', () => {
			it( 'should handle exact match of an element name and classes', () => {
				converter.registerRawContentMatcher( {
					name: 'div',
					classes: 'raw-content-container'
				} );

				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'img' ),
					createElement( document, 'div', { 'class': 'raw-content-container' }, [
						document.createComment( ' foo ' ),
						createElement( document, 'img' ),
						document.createTextNode( 'bar\n123' )
					] ),
					createElement( document, 'div', {}, [
						document.createComment( 'foo' ),
						createElement( document, 'img' ),
						document.createTextNode( 'bar\n123' )
					] ),
					document.createTextNode( 'abc' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv ).toBeInstanceOf( ViewElement );
				expect( viewDiv.name ).toBe( 'div' );

				expect( viewDiv.childCount ).toBe( 4 );
				expect( viewDiv.getChild( 0 ).name ).toBe( 'img' );
				expect( viewDiv.getChild( 1 ).getCustomProperty( '$rawContent' ) ).toBe( '<!-- foo --><img>bar\n123' );
				expect( viewDiv.getChild( 2 ).getCustomProperty( '$rawContent' ) ).toBeUndefined();
				expect( viewDiv.getChild( 2 ).childCount ).toBe( 3 );
				expect( viewDiv.getChild( 2 ).getChild( 0 ).getCustomProperty( '$rawContent' ) ).toBe( 'foo' );
				expect( viewDiv.getChild( 2 ).getChild( 1 ).name ).toBe( 'img' );
				expect( viewDiv.getChild( 2 ).getChild( 2 ).data ).toBe( 'bar 123' );
				expect( viewDiv.getChild( 3 ).data ).toBe( 'abc' );
			} );

			it( 'should handle elements with more classes, styles and attributes not required by the matcher pattern', () => {
				converter.registerRawContentMatcher( {
					name: 'div',
					classes: 'raw-content-container'
				} );

				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'img' ),
					createElement( document, 'div', {
						'class': 'raw-content-container',
						'style': 'border: 1px solid red',
						'data-foo': 'bar'
					}, [
						document.createComment( ' foo ' ),
						createElement( document, 'img' ),
						document.createTextNode( 'bar\n123' )
					] ),
					createElement( document, 'div', {}, [
						document.createComment( 'foo' ),
						createElement( document, 'img' ),
						document.createTextNode( 'bar\n123' )
					] ),
					document.createTextNode( 'abc' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv ).toBeInstanceOf( ViewElement );
				expect( viewDiv.name ).toBe( 'div' );

				expect( viewDiv.childCount ).toBe( 4 );
				expect( viewDiv.getChild( 0 ).name ).toBe( 'img' );
				expect( viewDiv.getChild( 1 ).getCustomProperty( '$rawContent' ) ).toBe( '<!-- foo --><img>bar\n123' );
				expect( viewDiv.getChild( 2 ).getCustomProperty( '$rawContent' ) ).toBeUndefined();
				expect( viewDiv.getChild( 2 ).childCount ).toBe( 3 );
				expect( viewDiv.getChild( 2 ).getChild( 0 ).getCustomProperty( '$rawContent' ) ).toBe( 'foo' );
				expect( viewDiv.getChild( 2 ).getChild( 1 ).name ).toBe( 'img' );
				expect( viewDiv.getChild( 2 ).getChild( 2 ).data ).toBe( 'bar 123' );
				expect( viewDiv.getChild( 3 ).data ).toBe( 'abc' );
			} );

			it( 'should handle multiple matchers (but nested ones should not be matched)', () => {
				converter.registerRawContentMatcher( {
					name: 'div',
					classes: 'raw-content-container'
				} );

				converter.registerRawContentMatcher( {
					name: 'span',
					attributes: {
						'data-foo': 'bar'
					}
				} );

				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'img' ),
					createElement( document, 'div', {
						'class': 'raw-content-container',
						'style': 'border: 1px solid red',
						'data-foo': 'bar'
					}, [
						document.createComment( ' foo ' ),
						createElement( document, 'img' ),
						createElement( document, 'span', {
							'data-foo': 'bar'
						}, [
							document.createTextNode( 'nested span' )
						] ),
						document.createTextNode( 'bar\n123' )
					] ),
					createElement( document, 'div', {}, [
						document.createComment( 'foo' ),
						createElement( document, 'img' ),
						document.createTextNode( 'bar\n123' )
					] ),
					createElement( document, 'span', { 'data-foo': 'bar' }, 'some span' ),
					createElement( document, 'span', {}, 'other span' ),
					document.createTextNode( 'abc' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv ).toBeInstanceOf( ViewElement );
				expect( viewDiv.name ).toBe( 'div' );

				expect( viewDiv.childCount ).toBe( 6 );
				expect( viewDiv.getChild( 0 ).name ).toBe( 'img' );
				expect( viewDiv.getChild( 1 ).getCustomProperty( '$rawContent' ) ).toBe(
					'<!-- foo --><img><span data-foo="bar">nested span</span>bar\n123'
				);
				expect( viewDiv.getChild( 2 ).getCustomProperty( '$rawContent' ) ).toBeUndefined();
				expect( viewDiv.getChild( 2 ).childCount ).toBe( 3 );
				expect( viewDiv.getChild( 2 ).getChild( 0 ).getCustomProperty( '$rawContent' ) ).toBe( 'foo' );
				expect( viewDiv.getChild( 2 ).getChild( 1 ).name ).toBe( 'img' );
				expect( viewDiv.getChild( 2 ).getChild( 2 ).data ).toBe( 'bar 123' );
				expect( viewDiv.getChild( 3 ).getCustomProperty( '$rawContent' ) ).toBe( 'some span' );
				expect( viewDiv.getChild( 4 ).name ).toBe( 'span' );
				expect( viewDiv.getChild( 4 ).getChild( 0 ).data ).toBe( 'other span' );
				expect( viewDiv.getChild( 5 ).data ).toBe( 'abc' );
			} );

			it( 'should handle elements by an attribute or class only', () => {
				converter.registerRawContentMatcher( {
					classes: 'raw-content-container'
				} );

				converter.registerRawContentMatcher( {
					attributes: {
						'data-foo': 'bar'
					}
				} );

				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'img' ),
					createElement( document, 'div', {
						'class': 'raw-content-container'
					}, [
						document.createComment( ' foo ' ),
						createElement( document, 'img' ),
						document.createTextNode( 'bar\n123' )
					] ),
					createElement( document, 'div', {
						'data-foo': 'bar'
					}, [
						document.createComment( 'bar' ),
						document.createTextNode( '123' )
					] ),
					document.createTextNode( 'abc' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv ).toBeInstanceOf( ViewElement );
				expect( viewDiv.name ).toBe( 'div' );

				expect( viewDiv.childCount ).toBe( 4 );
				expect( viewDiv.getChild( 0 ).name ).toBe( 'img' );
				expect( viewDiv.getChild( 1 ).getCustomProperty( '$rawContent' ) ).toBe( '<!-- foo --><img>bar\n123' );
				expect( viewDiv.getChild( 2 ).getCustomProperty( '$rawContent' ) ).toBe( '<!--bar-->123' );
				expect( viewDiv.getChild( 3 ).data ).toBe( 'abc' );
			} );
		} );

		describe( 'whitespace trimming', () => {
			it( 'should trim whitespaces before or after non inline raw content element', () => {
				converter.registerRawContentMatcher( {
					name: 'div',
					classes: 'raw'
				} );

				const domDiv = createElement( document, 'div', {}, [
					createElement( document, 'p' ),
					document.createTextNode( '  ' ),
					createElement( document, 'div', { class: 'raw' }, '  abc  ' ),
					document.createTextNode( '  ' ),
					createElement( document, 'p' )
				] );

				const viewDiv = converter.domToView( domDiv );

				expect( viewDiv.childCount ).toBe( 3 );
				expect( viewDiv.getChild( 0 ).name ).toBe( 'p' );
				expect( viewDiv.getChild( 1 ).getCustomProperty( '$rawContent' ) ).toBe( '  abc  ' );
				expect( viewDiv.getChild( 2 ).name ).toBe( 'p' );
			} );

			it( 'should trim whitespaces before or after non inline raw content element with deeper nesting', () => {
				converter.registerRawContentMatcher( {
					name: 'div',
					classes: 'raw'
				} );

				const domDIv = createElement( document, 'div', {}, [
					createElement( document, 'p' ),
					document.createTextNode( '  ' ),
					createElement( document, 'div', { class: 'raw' }, [
						createElement( document, 'div', { class: 'raw' }, [
							document.createTextNode( '  abc  ' )
						] )
					] ),
					document.createTextNode( '  ' ),
					createElement( document, 'p' )
				] );

				const viewDiv = converter.domToView( domDIv );

				expect( viewDiv.childCount ).toBe( 3 );
				expect( viewDiv.getChild( 0 ).name ).toBe( 'p' );
				expect( viewDiv.getChild( 1 ).getCustomProperty( '$rawContent' ) ).toBe( '<div class="raw">  abc  </div>' );
				expect( viewDiv.getChild( 2 ).name ).toBe( 'p' );
			} );

			it( 'should not trim whitespaces before or after raw content inline element', () => {
				converter.registerRawContentMatcher( {
					name: 'span'
				} );

				const domP = createElement( document, 'p', {}, [
					document.createTextNode( '  foo  ' ),
					createElement( document, 'span', {}, '  abc  ' ),
					document.createTextNode( '  bar  ' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).toBe( 3 );
				expect( viewP.getChild( 0 ).data ).toBe( 'foo ' );
				expect( viewP.getChild( 1 ).getCustomProperty( '$rawContent' ) ).toBe( '  abc  ' );
				expect( viewP.getChild( 2 ).data ).toBe( ' bar' );
			} );

			it( 'should not trim whitespaces before or after raw content inline element with deeper nesting', () => {
				converter.registerRawContentMatcher( {
					name: 'span'
				} );

				const domP = createElement( document, 'p', {}, [
					document.createTextNode( '  foo  ' ),
					createElement( document, 'span', {}, [
						createElement( document, 'span', {}, [
							document.createTextNode( '  abc  ' )
						] )
					] ),
					document.createTextNode( '  bar  ' )
				] );

				const viewP = converter.domToView( domP );

				expect( viewP.childCount ).toBe( 3 );
				expect( viewP.getChild( 0 ).data ).toBe( 'foo ' );
				expect( viewP.getChild( 1 ).getCustomProperty( '$rawContent' ) ).toBe( '<span>  abc  </span>' );
				expect( viewP.getChild( 2 ).data ).toBe( ' bar' );
			} );
		} );
	} );
} );
