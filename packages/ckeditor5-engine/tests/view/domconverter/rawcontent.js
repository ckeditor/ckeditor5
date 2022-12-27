/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import DomConverter from '../../../src/view/domconverter';
import ViewDocument from '../../../src/view/document';
import ViewElement from '../../../src/view/element';
import { StylesProcessor } from '../../../src/view/stylesmap';

import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

describe( 'DOMConverter raw content matcher', () => {
	let converter, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		converter = new DomConverter( viewDocument );
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

				expect( viewDiv ).to.be.an.instanceof( ViewElement );
				expect( viewDiv.name ).to.equal( 'div' );

				expect( viewDiv.childCount ).to.equal( 4 );
				expect( viewDiv.getChild( 0 ).name ).to.equal( 'img' );
				expect( viewDiv.getChild( 1 ).getCustomProperty( '$rawContent' ) ).to.equal( '<!-- foo --><img>bar\n123' );
				expect( viewDiv.getChild( 2 ).getCustomProperty( '$rawContent' ) ).to.be.undefined;
				expect( viewDiv.getChild( 2 ).childCount ).to.equal( 3 );
				expect( viewDiv.getChild( 2 ).getChild( 0 ).getCustomProperty( '$rawContent' ) ).to.equal( 'foo' );
				expect( viewDiv.getChild( 2 ).getChild( 1 ).name ).to.equal( 'img' );
				expect( viewDiv.getChild( 2 ).getChild( 2 ).data ).to.equal( 'bar 123' );
				expect( viewDiv.getChild( 3 ).data ).to.equal( 'abc' );
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

				expect( viewDiv ).to.be.an.instanceof( ViewElement );
				expect( viewDiv.name ).to.equal( 'div' );

				expect( viewDiv.childCount ).to.equal( 4 );
				expect( viewDiv.getChild( 0 ).name ).to.equal( 'img' );
				expect( viewDiv.getChild( 1 ).getCustomProperty( '$rawContent' ) ).to.equal( '<!-- foo --><img>bar\n123' );
				expect( viewDiv.getChild( 2 ).getCustomProperty( '$rawContent' ) ).to.be.undefined;
				expect( viewDiv.getChild( 2 ).childCount ).to.equal( 3 );
				expect( viewDiv.getChild( 2 ).getChild( 0 ).getCustomProperty( '$rawContent' ) ).to.equal( 'foo' );
				expect( viewDiv.getChild( 2 ).getChild( 1 ).name ).to.equal( 'img' );
				expect( viewDiv.getChild( 2 ).getChild( 2 ).data ).to.equal( 'bar 123' );
				expect( viewDiv.getChild( 3 ).data ).to.equal( 'abc' );
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

				expect( viewDiv ).to.be.an.instanceof( ViewElement );
				expect( viewDiv.name ).to.equal( 'div' );

				expect( viewDiv.childCount ).to.equal( 6 );
				expect( viewDiv.getChild( 0 ).name ).to.equal( 'img' );
				expect( viewDiv.getChild( 1 ).getCustomProperty( '$rawContent' ) ).to.equal(
					'<!-- foo --><img><span data-foo="bar">nested span</span>bar\n123'
				);
				expect( viewDiv.getChild( 2 ).getCustomProperty( '$rawContent' ) ).to.be.undefined;
				expect( viewDiv.getChild( 2 ).childCount ).to.equal( 3 );
				expect( viewDiv.getChild( 2 ).getChild( 0 ).getCustomProperty( '$rawContent' ) ).to.equal( 'foo' );
				expect( viewDiv.getChild( 2 ).getChild( 1 ).name ).to.equal( 'img' );
				expect( viewDiv.getChild( 2 ).getChild( 2 ).data ).to.equal( 'bar 123' );
				expect( viewDiv.getChild( 3 ).getCustomProperty( '$rawContent' ) ).to.equal( 'some span' );
				expect( viewDiv.getChild( 4 ).name ).to.equal( 'span' );
				expect( viewDiv.getChild( 4 ).getChild( 0 ).data ).to.equal( 'other span' );
				expect( viewDiv.getChild( 5 ).data ).to.equal( 'abc' );
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

				expect( viewDiv ).to.be.an.instanceof( ViewElement );
				expect( viewDiv.name ).to.equal( 'div' );

				expect( viewDiv.childCount ).to.equal( 4 );
				expect( viewDiv.getChild( 0 ).name ).to.equal( 'img' );
				expect( viewDiv.getChild( 1 ).getCustomProperty( '$rawContent' ) ).to.equal( '<!-- foo --><img>bar\n123' );
				expect( viewDiv.getChild( 2 ).getCustomProperty( '$rawContent' ) ).to.equal( '<!--bar-->123' );
				expect( viewDiv.getChild( 3 ).data ).to.equal( 'abc' );
			} );
		} );

		describe( 'whitespace trimming', () => {
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

				expect( viewP.childCount ).to.equal( 3 );
				expect( viewP.getChild( 0 ).data ).to.equal( 'foo ' );
				expect( viewP.getChild( 1 ).getCustomProperty( '$rawContent' ) ).to.equal( '  abc  ' );
				expect( viewP.getChild( 2 ).data ).to.equal( ' bar' );
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

				expect( viewP.childCount ).to.equal( 3 );
				expect( viewP.getChild( 0 ).data ).to.equal( 'foo ' );
				expect( viewP.getChild( 1 ).getCustomProperty( '$rawContent' ) ).to.equal( '<span>  abc  </span>' );
				expect( viewP.getChild( 2 ).data ).to.equal( ' bar' );
			} );
		} );
	} );
} );
