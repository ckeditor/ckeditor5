/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Matcher from '../../src/view/matcher';
import Element from '../../src/view/element';
import Document from '../../src/view/document';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'Matcher', () => {
	let document;

	beforeEach( () => {
		document = new Document( new StylesProcessor() );
	} );

	describe( 'add', () => {
		it( 'should allow to add pattern to matcher', () => {
			const matcher = new Matcher( 'div' );
			const el = new Element( document, 'p', { title: 'foobar' } );

			expect( matcher.match( el ) ).to.be.null;
			const pattern = { name: 'p', attributes: { title: 'foobar' } };
			matcher.add( pattern );
			const result = matcher.match( el );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'element' ).that.equal( el );
			expect( result ).to.have.property( 'match' ).that.has.property( 'name' ).that.is.true;
			expect( result.match ).to.have.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes[ 0 ] ).to.equal( 'title' );
			expect( result ).to.be.an( 'object' );
		} );

		it( 'should allow to add more than one pattern', () => {
			const matcher = new Matcher();
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'div' );

			matcher.add( 'p', 'div' );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.have.property( 'name' ).that.equal( 'p' );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.have.property( 'name' ).that.equal( 'div' );
		} );
	} );

	describe( 'match', () => {
		it( 'should match element name', () => {
			const matcher = new Matcher( 'p' );
			const el = new Element( document, 'p' );
			const el2 = new Element( document, 'div' );

			const result = matcher.match( el );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el );
			expect( result ).to.have.property( 'pattern' );
			expect( result.pattern.name ).to.equal( 'p' );
			expect( result ).to.have.property( 'match' );
			expect( result.match.name ).to.be.true;
			expect( matcher.match( el2 ) ).to.be.null;
		} );

		it( 'should match element name with RegExp', () => {
			const pattern = /^text...a$/;
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'textarea' );
			const el2 = new Element( document, 'div' );

			const result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.has.property( 'name' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'name' ).that.is.true;
			expect( matcher.match( el2 ) ).to.be.null;
		} );

		it( 'should match element attributes', () => {
			const pattern = {
				attributes: {
					title: 'foobar'
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { title: 'foobar'	} );
			const el2 = new Element( document, 'p', { title: 'foobaz'	} );
			const el3 = new Element( document, 'p', { name: 'foobar' } );

			const result = matcher.match( el1 );

			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).and.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );

			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );

			expect( result.match.attributes[ 0 ] ).equal( 'title' );
			expect( matcher.match( el2 ) ).to.be.null;
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element attributes using RegExp', () => {
			const pattern = {
				attributes: {
					title: /fooba./
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { title: 'foobar'	} );
			const el2 = new Element( document, 'p', { title: 'foobaz'	} );
			const el3 = new Element( document, 'p', { title: 'qux' } );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes[ 0 ] ).equal( 'title' );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes[ 0 ] ).equal( 'title' );
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match if element has given attribute', () => {
			const pattern = {
				attributes: {
					title: true
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { title: 'foobar'	} );
			const el2 = new Element( document, 'p', { title: '' } );
			const el3 = new Element( document, 'p' );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes[ 0 ] ).equal( 'title' );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes[ 0 ] ).equal( 'title' );

			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element class names', () => {
			const pattern = { classes: 'foobar' };
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { class: 'foobar' } );

			const result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'classes' ).that.is.an( 'array' );
			expect( result.match.classes[ 0 ] ).equal( 'foobar' );
			expect( new Matcher( { classes: 'baz' } ).match( el1 ) ).to.be.null;
		} );

		it( 'should match element class names using RegExp', () => {
			const pattern = { classes: /fooba./ };
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { class: 'foobar'	} );
			const el2 = new Element( document, 'p', { class: 'foobaz'	} );
			const el3 = new Element( document, 'p', { class: 'qux'	} );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'classes' ).that.is.an( 'array' );
			expect( result.match.classes[ 0 ] ).equal( 'foobar' );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'classes' ).that.is.an( 'array' );
			expect( result.match.classes[ 0 ] ).equal( 'foobaz' );
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should match element styles', () => {
			const pattern = {
				styles: {
					color: 'red'
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'color: red' } );
			const el2 = new Element( document, 'p', { style: 'position: absolute' } );

			const result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles[ 0 ] ).equal( 'color' );
			expect( matcher.match( el2 ) ).to.be.null;
			expect( new Matcher( { styles: { color: 'blue' } } ).match( el1 ) ).to.be.null;
		} );

		it( 'should match element styles using RegExp', () => {
			const pattern = {
				styles: {
					color: /^.*blue$/
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p', { style: 'color: blue' } );
			const el2 = new Element( document, 'p', { style: 'color: darkblue' } );
			const el3 = new Element( document, 'p', { style: 'color: red' } );

			let result = matcher.match( el1 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el1 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles[ 0 ] ).to.equal( 'color' );

			result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.has.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles[ 0 ] ).to.equal( 'color' );
			expect( matcher.match( el3 ) ).to.be.null;
		} );

		it( 'should allow to use function as a pattern', () => {
			const match = { name: true };
			const pattern = element => {
				if ( element.name === 'div' && element.childCount > 0 ) {
					return match;
				}

				return null;
			};
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'div', null, [ el1 ] );

			expect( matcher.match( el1 ) ).to.be.null;
			const result = matcher.match( el2 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'match' ).that.equal( match );
		} );

		it( 'should return first matched element', () => {
			const pattern = {
				name: 'p'
			};
			const el1 = new Element( document, 'div' );
			const el2 = new Element( document, 'p' );
			const el3 = new Element( document, 'span' );
			const matcher = new Matcher( pattern );

			const result = matcher.match( el1, el2, el3 );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el2 );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result.match ).to.have.property( 'name' ).that.is.true;
		} );

		it( 'should match multiple attributes', () => {
			const pattern = {
				name: 'a',
				attributes: {
					name: 'foo',
					title: 'bar'
				}
			};
			const matcher = new Matcher( pattern );
			const el = new Element( document, 'a', {
				name: 'foo',
				title: 'bar'
			} );

			const result = matcher.match( el );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result.match ).to.have.property( 'attributes' ).that.is.an( 'array' );
			expect( result.match.attributes[ 0 ] ).to.equal( 'name' );
			expect( result.match.attributes[ 1 ] ).to.equal( 'title' );
		} );

		it( 'should match multiple classes', () => {
			const pattern = {
				name: 'a',
				classes: [ 'foo', 'bar' ]
			};
			const matcher = new Matcher( pattern );
			const el = new Element( document, 'a' );
			el._addClass( [ 'foo', 'bar', 'baz' ] );

			const result = matcher.match( el );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result.match ).to.have.property( 'classes' ).that.is.an( 'array' );
			expect( result.match.classes[ 0 ] ).to.equal( 'foo' );
			expect( result.match.classes[ 1 ] ).to.equal( 'bar' );
		} );

		it( 'should match multiple styles', () => {
			const pattern = {
				name: 'a',
				styles: {
					color: 'red',
					position: 'relative'
				}
			};
			const matcher = new Matcher( pattern );
			const el = new Element( document, 'a' );
			el._setStyle( {
				color: 'red',
				position: 'relative'
			} );

			const result = matcher.match( el );
			expect( result ).to.be.an( 'object' );
			expect( result ).to.have.property( 'element' ).that.equal( el );
			expect( result ).to.have.property( 'pattern' ).that.equal( pattern );
			expect( result ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result.match ).to.have.property( 'styles' ).that.is.an( 'array' );
			expect( result.match.styles[ 0 ] ).to.equal( 'color' );
			expect( result.match.styles[ 1 ] ).to.equal( 'position' );
		} );
	} );

	describe( 'matchAll', () => {
		it( 'should return all matched elements with correct patterns', () => {
			const matcher = new Matcher( 'p', 'div' );
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'div' );
			const el3 = new Element( document, 'span' );

			const result = matcher.matchAll( el1, el2, el3 );
			expect( result ).to.be.an( 'array' );
			expect( result.length ).to.equal( 2 );
			expect( result[ 0 ] ).to.have.property( 'element' ).that.equal( el1 );
			expect( result[ 0 ] ).to.have.property( 'pattern' ).that.is.an( 'object' );
			expect( result[ 0 ].pattern ).to.have.property( 'name' ).that.is.equal( 'p' );
			expect( result[ 0 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 0 ].match ).to.have.property( 'name' ).that.is.true;

			expect( result[ 1 ] ).to.have.property( 'element' ).that.equal( el2 );
			expect( result[ 1 ] ).to.have.property( 'pattern' ).that.is.an( 'object' );
			expect( result[ 1 ].pattern ).to.have.property( 'name' ).that.is.equal( 'div' );
			expect( result[ 1 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 1 ].match ).to.have.property( 'name' ).that.is.true;

			expect( matcher.matchAll( el3 ) ).to.be.null;
		} );

		it( 'should return all matched elements when using RegExp pattern', () => {
			const pattern = { classes: /^red-.*/ };
			const matcher = new Matcher( pattern );
			const el1 = new Element( document, 'p' );
			const el2 = new Element( document, 'p' );
			const el3 = new Element( document, 'p' );

			el1._addClass( 'red-foreground' );
			el2._addClass( 'red-background' );
			el3._addClass( 'blue-text' );

			const result = matcher.matchAll( el1, el2, el3 );
			expect( result ).to.be.an( 'array' );
			expect( result.length ).to.equal( 2 );
			expect( result[ 0 ] ).to.have.property( 'element' ).that.equal( el1 );
			expect( result[ 0 ] ).to.have.property( 'pattern' ).that.is.equal( pattern );
			expect( result[ 0 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 0 ].match ).to.have.property( 'classes' ).that.is.an( 'array' );
			expect( result[ 0 ].match.classes[ 0 ] ).to.equal( 'red-foreground' );

			expect( result[ 1 ] ).to.have.property( 'element' ).that.equal( el2 );
			expect( result[ 1 ] ).to.have.property( 'pattern' ).that.is.equal( pattern );
			expect( result[ 1 ] ).to.have.property( 'match' ).that.is.an( 'object' );
			expect( result[ 1 ].match ).to.have.property( 'classes' ).that.is.an( 'array' );
			expect( result[ 1 ].match.classes[ 0 ] ).to.equal( 'red-background' );

			expect( matcher.matchAll( el3 ) ).to.be.null;
		} );
	} );

	describe( 'getElementName', () => {
		it( 'should return null if there are no patterns in the matcher instance', () => {
			const matcher = new Matcher();

			expect( matcher.getElementName() ).to.be.null;
		} );

		it( 'should return null if pattern has no name property', () => {
			const matcher = new Matcher( { classes: 'foo' } );

			expect( matcher.getElementName() ).to.be.null;
		} );

		it( 'should return null if pattern has name property specified as RegExp', () => {
			const matcher = new Matcher( { name: /foo.*/ } );

			expect( matcher.getElementName() ).to.be.null;
		} );

		it( 'should return element name if matcher has one patter with name property specified as string', () => {
			const matcher = new Matcher( { name: 'div' } );

			expect( matcher.getElementName() ).to.equal( 'div' );
		} );

		it( 'should return null if matcher has more than one pattern', () => {
			const matcher = new Matcher( { name: 'div' }, { classes: 'foo' } );

			expect( matcher.getElementName() ).to.be.null;
		} );

		it( 'should return null for matching function', () => {
			const matcher = new Matcher( () => {} );

			expect( matcher.getElementName() ).to.be.null;
		} );

		it( 'should return null for matching named function', () => {
			const matcher = new Matcher( function matchFunction() {} );

			expect( matcher.getElementName() ).to.be.null;
		} );
	} );
} );
