/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Matcher } from '../../src/view/matcher.js';
import { ViewElement } from '../../src/view/element.js';
import { ViewDocument } from '../../src/view/document.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { addMarginStylesRules } from '../../src/view/styles/margin.js';
import { addBorderStylesRules } from '../../src/view/styles/border.js';
import { addBackgroundStylesRules } from '../../src/view/styles/background.js';

describe( 'Matcher', () => {
	let document;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		document = new ViewDocument( new StylesProcessor() );

		addMarginStylesRules( document.stylesProcessor );
		addBorderStylesRules( document.stylesProcessor );
		addBackgroundStylesRules( document.stylesProcessor );
	} );

	describe( 'add', () => {
		it( 'should allow to add pattern to matcher', () => {
			const matcher = new Matcher( 'div' );
			const el = new ViewElement( document, 'p', { title: 'foobar' } );

			expect( matcher.match( el ) ).toBeNull();
			const pattern = { name: 'p', attributes: { title: 'foobar' } };
			matcher.add( pattern );
			const result = matcher.match( el );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( result ).toHaveProperty( 'element', el );
			expect( result.match ).toHaveProperty( 'name', true );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes[ 0 ] ).toEqual( [ 'title' ] );
			expect( typeof result ).toBe( 'object' );
		} );

		it( 'should allow to add more than one pattern', () => {
			const matcher = new Matcher();
			const el1 = new ViewElement( document, 'p' );
			const el2 = new ViewElement( document, 'div' );

			matcher.add( 'p', 'div' );

			let result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result.pattern ).toHaveProperty( 'name', 'p' );

			result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result.pattern ).toHaveProperty( 'name', 'div' );
		} );
	} );

	describe( 'match', () => {
		it( 'should match element name', () => {
			const matcher = new Matcher( 'p' );
			const el = new ViewElement( document, 'p' );
			const el2 = new ViewElement( document, 'div' );

			const result = matcher.match( el );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el );
			expect( result ).toHaveProperty( 'pattern' );
			expect( result.pattern.name ).toBe( 'p' );
			expect( result ).toHaveProperty( 'match' );
			expect( result.match.name ).toBe( true );
			expect( matcher.match( el2 ) ).toBeNull();
		} );

		it( 'should match element name with RegExp', () => {
			const pattern = /^text...a$/;
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'textarea' );
			const el2 = new ViewElement( document, 'div' );

			const result = matcher.match( el1 );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result.pattern ).toHaveProperty( 'name', pattern );
			expect( result.match ).toHaveProperty( 'name', true );
			expect( matcher.match( el2 ) ).toBeNull();
		} );

		it( 'should match all element attributes', () => {
			const pattern = {
				attributes: true
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { title: 'foobar' } );
			const el2 = new ViewElement( document, 'p', { title: '', alt: 'alternative'	} );
			const el3 = new ViewElement( document, 'p' );

			let result = matcher.match( el1 );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'title' ] ] );

			result = matcher.match( el2 );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'title' ], [ 'alt' ] ] );

			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match all element attributes (`true` in an array)', () => {
			const pattern = {
				attributes: [ true ]
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { title: 'foobar' } );
			const el2 = new ViewElement( document, 'p', { title: '', alt: 'alternative'	} );
			const el3 = new ViewElement( document, 'p' );

			let result = matcher.match( el1 );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'title' ] ] );

			result = matcher.match( el2 );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'title' ], [ 'alt' ] ] );

			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should not match style and class attributes using "attributes: true" pattern', () => {
			const pattern = {
				attributes: true
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'color:red;' } );
			const el2 = new ViewElement( document, 'p', { class: 'foobar' } );
			const el3 = new ViewElement( document, 'p', { style: 'color:red;', class: 'foobar' } );

			expect( matcher.match( el1 ) ).toBeNull();
			expect( matcher.match( el2 ) ).toBeNull();
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should not match style and class attributes using "attributes: Array" pattern', () => {
			const pattern = {
				attributes: [ 'style', 'class' ]
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'color:red;' } );
			const el2 = new ViewElement( document, 'p', { class: 'foobar' } );
			const el3 = new ViewElement( document, 'p', { style: 'color:red;', class: 'foobar' } );

			expect( matcher.match( el1 ) ).toBeNull();
			expect( matcher.match( el2 ) ).toBeNull();
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should not match style and class attributes using "attributes: RegExp" pattern', () => {
			const pattern = {
				attributes: /.*/
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'color:red;' } );
			const el2 = new ViewElement( document, 'p', { class: 'foobar' } );
			const el3 = new ViewElement( document, 'p', { style: 'color:red;', class: 'foobar' } );

			expect( matcher.match( el1 ) ).toBeNull();
			expect( matcher.match( el2 ) ).toBeNull();
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match style and class attributes using "attributes: key->value" pattern', () => {
			// Stub console, otherwise it will break test coverage.
			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const pattern = {
				attributes: {
					style: true,
					class: true
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'color:red;', class: 'foobar' } );

			const result = matcher.match( el1 );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes.length ).toBe( 2 );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'color' ], [ 'class', 'foobar' ] ] );
		} );

		it( 'should display warning when using deprecated style attribute with key->value pattern', () => {
			const pattern = {
				attributes: {
					style: true
				}
			};
			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'color:red;' } );

			matcher.match( el1 );

			expect( warnStub ).toHaveBeenCalledOnce();
			expect( warnStub.mock.calls[ 0 ][ 0 ] ).toBe( 'matcher-pattern-deprecated-attributes-style-key' );
			expect( warnStub.mock.calls[ 0 ][ 1 ] ).toBe( pattern.attributes );
		} );

		it( 'should display warning when using deprecated class attribute with key->value pattern', () => {
			const pattern = {
				attributes: {
					class: true
				}
			};
			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { class: 'foobar' } );

			matcher.match( el1 );

			expect( warnStub ).toHaveBeenCalledOnce();
			expect( warnStub.mock.calls[ 0 ][ 0 ] ).toBe( 'matcher-pattern-deprecated-attributes-class-key' );
			expect( warnStub.mock.calls[ 0 ][ 1 ] ).toBe( pattern.attributes );
		} );

		it( 'should match style and class attributes using mixed pattern', () => {
			const pattern = {
				attributes: true,
				classes: true,
				styles: true
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'color:red;', class: 'foobar', 'data-foo': 'foo' } );

			const result = matcher.match( el1 );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );

			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes.length ).toBe( 3 );
			expect( result.match.attributes ).toEqual( [ [ 'data-foo' ], [ 'class', 'foobar' ], [ 'style', 'color' ] ] );
		} );

		it( 'should match all element attributes using RegExp', () => {
			const pattern = {
				attributes: /data-.*/
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { 'data-foo': 'foo', 'data-bar': 'bar', title: 'other' } );
			const el2 = new ViewElement( document, 'p', { title: 'foobar' } );
			const el3 = new ViewElement( document, 'p' );

			const result = matcher.match( el1 );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes.length ).toBe( 2 );
			expect( result.match.attributes ).toEqual( [ [ 'data-foo' ], [ 'data-bar' ] ] );

			expect( matcher.match( el2 ) ).toBeNull();
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match all element attributes using key->value, where key is a RegExp object and value is a boolean', () => {
			const pattern = {
				attributes: [
					{ key: /data-b.*/, value: true }
				]
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { 'data-foo': 'foo', 'data-bar': 'bar', title: 'other' } );
			const el2 = new ViewElement( document, 'p', { title: 'foobar' } );
			const el3 = new ViewElement( document, 'p' );

			const result = matcher.match( el1 );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes.length ).toBe( 1 );
			expect( result.match.attributes ).toEqual( [ [ 'data-bar' ] ] );

			expect( matcher.match( el2 ) ).toBeNull();
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match all element attributes using key->value, where key is a RegExp object and value is a string', () => {
			const pattern = {
				attributes: [
					{ key: /data-.*/, value: 'bar' }
				]
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { 'data-foo': 'foo', 'data-bar': 'bar', title: 'other' } );
			const el2 = new ViewElement( document, 'p', { 'data-foo': 'foo', title: 'foobar' } );
			const el3 = new ViewElement( document, 'p' );

			const result = matcher.match( el1 );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes.length ).toBe( 1 );
			expect( result.match.attributes ).toEqual( [ [ 'data-bar' ] ] );

			expect( matcher.match( el2 ) ).toBeNull();
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match all element attributes using key->value, where both are RegExp objects', () => {
			const pattern = {
				attributes: [
					{ key: /data-.*/, value: /b.*?r/ }
				]
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { 'data-foo': 'foo', 'data-bar': 'bar', title: 'other' } );
			const el2 = new ViewElement( document, 'p', { title: 'foobar' } );
			const el3 = new ViewElement( document, 'p' );

			const result = matcher.match( el1 );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes.length ).toBe( 1 );
			expect( result.match.attributes ).toEqual( [ [ 'data-bar' ] ] );

			expect( matcher.match( el2 ) ).toBeNull();
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match nothing if pattern is incorrect', () => {
			const pattern = {
				// A stub for a non-plain object.
				attributes: 1
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { 'data-foo': 'foo', 'data-bar': 'bar', title: 'other' } );

			expect( matcher.match( el1 ) ).toBeNull();
		} );

		it( 'should match element attributes using String', () => {
			const pattern = {
				attributes: {
					title: 'foobar'
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { title: 'foobar'	} );
			const el2 = new ViewElement( document, 'p', { title: 'foobaz'	} );
			const el3 = new ViewElement( document, 'p', { name: 'foobar' } );

			const result = matcher.match( el1 );

			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );

			expect( Array.isArray( result.match.attributes ) ).toBe( true );

			expect( result.match.attributes ).toEqual( [ [ 'title' ] ] );
			expect( matcher.match( el2 ) ).toBeNull();
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match element attributes using RegExp', () => {
			const pattern = {
				attributes: {
					title: /fooba./
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { title: 'foobar'	} );
			const el2 = new ViewElement( document, 'p', { title: 'foobaz'	} );
			const el3 = new ViewElement( document, 'p', { title: 'qux' } );

			let result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'title' ] ] );

			result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'title' ] ] );
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match if element has given attribute', () => {
			const pattern = {
				attributes: {
					title: true
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { title: 'foobar' } );
			const el2 = new ViewElement( document, 'p', { title: '' } );
			const el3 = new ViewElement( document, 'p' );

			let result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'title' ] ] );

			result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'title' ] ] );

			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match if element has given attribute list', () => {
			const pattern = {
				attributes: [ 'title', 'id' ]
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { title: 'foo', id: 'bar' } );
			const el2 = new ViewElement( document, 'p', { title: 'foo' } );
			const el3 = new ViewElement( document, 'p' );

			const result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'title' ], [ 'id' ] ] );

			expect( matcher.match( el2 ) ).toBeNull();
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match element class names', () => {
			const pattern = { classes: 'foobar' };
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { class: 'foobar' } );

			const result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'class', 'foobar' ] ] );
			expect( new Matcher( { classes: 'baz' } ).match( el1 ) ).toBeNull();
		} );

		it( 'should match element class names using an array', () => {
			const pattern = { classes: [ 'foo', 'bar' ] };
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { class: 'foo bar' } );
			const el2 = new ViewElement( document, 'p', { class: 'bar'	} );
			const el3 = new ViewElement( document, 'p', { class: 'qux'	} );

			const result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes.length ).toBe( 2 );
			expect( result.match.attributes ).toEqual( [ [ 'class', 'foo' ], [ 'class', 'bar' ] ] );

			expect( matcher.match( el2 ) ).toBeNull();
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match element class names using an object', () => {
			const pattern = {
				classes: {
					foo: true,
					bar: true
				}
			};

			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { class: 'foo bar' } );
			const el2 = new ViewElement( document, 'p', { class: 'bar'	} );
			const el3 = new ViewElement( document, 'p', { class: 'qux'	} );

			const result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes.length ).toBe( 2 );
			expect( result.match.attributes ).toEqual( [ [ 'class', 'foo' ], [ 'class', 'bar' ] ] );

			expect( matcher.match( el2 ) ).toBeNull();
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match element class names using key->value pairs', () => {
			const pattern = {
				classes: [
					{ key: 'foo', value: true },
					{ key: /^b.*$/, value: true }
				]
			};

			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { class: 'foo bar' } );
			const el2 = new ViewElement( document, 'p', { class: 'bar'	} );
			const el3 = new ViewElement( document, 'p', { class: 'qux'	} );

			const result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes.length ).toBe( 2 );
			expect( result.match.attributes ).toEqual( [ [ 'class', 'foo' ], [ 'class', 'bar' ] ] );

			expect( matcher.match( el2 ) ).toBeNull();
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match element class names using RegExp', () => {
			const pattern = { classes: /fooba./ };
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { class: 'foobar'	} );
			const el2 = new ViewElement( document, 'p', { class: 'foobaz'	} );
			const el3 = new ViewElement( document, 'p', { class: 'qux'	} );

			let result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'class', 'foobar' ] ] );

			result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'class', 'foobaz' ] ] );
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match element styles', () => {
			const pattern = {
				styles: {
					color: 'red'
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'color: red' } );
			const el2 = new ViewElement( document, 'p', { style: 'position: absolute' } );

			const result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'color' ] ] );
			expect( matcher.match( el2 ) ).toBeNull();
			expect( new Matcher( { styles: { color: 'blue' } } ).match( el1 ) ).toBeNull();
		} );

		it( 'should match element styles using boolean', () => {
			const pattern = {
				styles: {
					color: true
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'color: blue' } );
			const el2 = new ViewElement( document, 'p', { style: 'color: darkblue' } );
			const el3 = new ViewElement( document, 'p', { style: 'border: 1px solid' } );

			let result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'color' ] ] );

			result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'color' ] ] );

			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match element styles when CSS shorthand is used', () => {
			const pattern = {
				styles: {
					'margin-left': /.*/
				}
			};
			const matcher = new Matcher( pattern );

			const el1 = new ViewElement( document, 'p', { style: 'margin: 1px' } );
			const el2 = new ViewElement( document, 'p', { style: 'margin-left: 10px' } );
			const el3 = new ViewElement( document, 'p', { style: 'border: 1px solid' } );

			let result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'margin-left' ] ] );

			result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'margin-left' ] ] );

			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match element expanded styles', () => {
			const pattern = {
				styles: {
					'border-left-style': /.*/
				}
			};
			const matcher = new Matcher( pattern );

			const el1 = new ViewElement( document, 'p', { style: 'border: 1px solid' } );
			const el2 = new ViewElement( document, 'p', { style: 'border-style: solid' } );
			const el3 = new ViewElement( document, 'p', { style: 'margin-left: darkblue' } );

			let result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'border-left-style' ] ] );

			result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'border-left-style' ] ] );

			expect( matcher.match( el3 ) ).toBeNull();
		} );

		// With current way the style reducers work, this test is passing when it shouldn't.
		// The problem is described in https://github.com/ckeditor/ckeditor5/issues/10399.
		// Until the proper fix is ready, this test should be skipped.
		it.skip( 'should match element expanded styles when CSS shorthand is used', () => {
			const pattern = {
				styles: {
					'border-left': /.*/
				}
			};
			const matcher = new Matcher( pattern );

			const el1 = new ViewElement( document, 'p', { style: 'border: 1px solid' } );
			const el2 = new ViewElement( document, 'p', { style: 'border-style: solid' } );
			const el3 = new ViewElement( document, 'p', { style: 'margin-left: darkblue' } );

			let result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.styles ) ).toBe( true );
			expect( result.match.styles ).toEqual( [ 'border-left' ] );

			result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.styles ) ).toBe( true );
			expect( result.match.styles ).toEqual( [ 'border-left' ] );

			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match element styles using an array', () => {
			const pattern = {
				styles: [ 'color' ]
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'color: blue' } );
			const el2 = new ViewElement( document, 'p', { style: 'color: darkblue' } );
			const el3 = new ViewElement( document, 'p', { style: 'border: 1px solid' } );

			let result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'color' ] ] );

			result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'color' ] ] );

			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match element styles using RegExp', () => {
			const pattern = {
				styles: {
					color: /^.*blue$/
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'color: blue' } );
			const el2 = new ViewElement( document, 'p', { style: 'color: darkblue' } );
			const el3 = new ViewElement( document, 'p', { style: 'color: red' } );

			let result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'color' ] ] );

			result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'color' ] ] );
			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should match element styles using key->value, where both are RegExp objects', () => {
			const pattern = {
				styles: [
					{ key: /border-.*/, value: /.*/ }
				]
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'border-top: 1px solid blue' } );
			const el2 = new ViewElement( document, 'p', { style: 'border-top-width: 3px' } );
			const el3 = new ViewElement( document, 'p', { style: 'color: red' } );

			let result = matcher.match( el1 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el1 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [
				[ 'style', 'border-color' ],
				[ 'style', 'border-style' ],
				[ 'style', 'border-width' ],
				[ 'style', 'border-top' ],
				[ 'style', 'border-top-color' ],
				[ 'style', 'border-top-style' ],
				[ 'style', 'border-top-width' ]
			] );

			result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [
				[ 'style', 'border-width' ],
				[ 'style', 'border-top' ],
				[ 'style', 'border-top-width' ]
			] );

			expect( matcher.match( el3 ) ).toBeNull();
		} );

		it( 'should display warning when key->value pattern is missing key', () => {
			const pattern = {
				styles: [
					{ key: /border-.*/ }
				]
			};
			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'border-top: 1px solid blue' } );

			matcher.match( el1 );

			expect( warnStub ).toHaveBeenCalledOnce();
			expect( warnStub.mock.calls[ 0 ][ 0 ] ).toBe( 'matcher-pattern-missing-key-or-value' );
			expect( warnStub.mock.calls[ 0 ][ 1 ] ).toBe( pattern.styles[ 0 ] );
		} );

		it( 'should display warning when key->value pattern is missing value', () => {
			const pattern = {
				styles: [
					{ value: 'red' }
				]
			};
			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p', { style: 'border-top: 1px solid blue' } );

			matcher.match( el1 );

			expect( warnStub ).toHaveBeenCalledOnce();
			expect( warnStub.mock.calls[ 0 ][ 0 ] ).toBe( 'matcher-pattern-missing-key-or-value' );
			expect( warnStub.mock.calls[ 0 ][ 1 ] ).toBe( pattern.styles[ 0 ] );
		} );

		it( 'should allow to use function as a pattern', () => {
			const pattern = element => {
				if ( element.name === 'div' && element.childCount > 0 ) {
					return { name: true };
				}

				return null;
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p' );
			const el2 = new ViewElement( document, 'div', null, [ el1 ] );

			expect( matcher.match( el1 ) ).toBeNull();
			const result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result.match ).toEqual( { name: true, attributes: [] } );
		} );

		it( 'should allow to use function as a pattern (non-standard boolean return)', () => {
			const pattern = element => {
				return element.name === 'div' && element.childCount > 0;
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p' );
			const el2 = new ViewElement( document, 'div', null, [ el1 ] );

			expect( matcher.match( el1 ) ).toBeNull();
			const result = matcher.match( el2 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result.match ).toBe( true );
		} );

		it( 'should return first matched element', () => {
			const pattern = {
				name: 'p'
			};
			const el1 = new ViewElement( document, 'div' );
			const el2 = new ViewElement( document, 'p' );
			const el3 = new ViewElement( document, 'span' );
			const matcher = new Matcher( pattern );

			const result = matcher.match( el1, el2, el3 );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el2 );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( typeof result.match ).toBe( 'object' );
			expect( result.match ).toHaveProperty( 'name', true );
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
			const el = new ViewElement( document, 'a', {
				name: 'foo',
				title: 'bar'
			} );

			const result = matcher.match( el );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( typeof result.match ).toBe( 'object' );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'name' ], [ 'title' ] ] );
		} );

		it( 'should match only own-property attribute keys from the pattern object and ignore inherited properties', () => {
			const basePattern = { href: true };
			const pattern = {
				name: 'a',
				attributes: Object.create( basePattern )
			};

			pattern.attributes.title = 'foobar';

			const matcher = new Matcher( pattern );
			const el = new ViewElement( document, 'a', { title: 'foobar' } );

			const result = matcher.match( el );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el );
			expect( result.match.attributes ).toEqual( [ [ 'title' ] ] );
		} );

		it( 'should match multiple classes', () => {
			const pattern = {
				name: 'a',
				classes: [ 'foo', 'bar' ]
			};
			const matcher = new Matcher( pattern );
			const el = new ViewElement( document, 'a' );
			el._addClass( [ 'foo', 'bar', 'baz' ] );

			const result = matcher.match( el );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( typeof result.match ).toBe( 'object' );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'class', 'foo' ], [ 'class', 'bar' ] ] );
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
			const el = new ViewElement( document, 'a' );
			el._setStyle( {
				color: 'red',
				position: 'relative'
			} );

			const result = matcher.match( el );
			expect( typeof result ).toBe( 'object' );
			expect( result ).toHaveProperty( 'element', el );
			expect( result ).toHaveProperty( 'pattern', pattern );
			expect( typeof result.match ).toBe( 'object' );
			expect( Array.isArray( result.match.attributes ) ).toBe( true );
			expect( result.match.attributes ).toEqual( [ [ 'style', 'color' ], [ 'style', 'position' ] ] );
		} );
	} );

	describe( 'matchAll', () => {
		it( 'should return all matched elements with correct patterns', () => {
			const matcher = new Matcher( 'p', 'div' );
			const el1 = new ViewElement( document, 'p' );
			const el2 = new ViewElement( document, 'div' );
			const el3 = new ViewElement( document, 'span' );

			const result = matcher.matchAll( el1, el2, el3 );
			expect( Array.isArray( result ) ).toBe( true );
			expect( result.length ).toBe( 2 );
			expect( result[ 0 ] ).toHaveProperty( 'element', el1 );
			expect( typeof result[ 0 ].pattern ).toBe( 'object' );
			expect( result[ 0 ].pattern ).toHaveProperty( 'name', 'p' );
			expect( typeof result[ 0 ].match ).toBe( 'object' );
			expect( result[ 0 ].match ).toHaveProperty( 'name', true );

			expect( result[ 1 ] ).toHaveProperty( 'element', el2 );
			expect( typeof result[ 1 ].pattern ).toBe( 'object' );
			expect( result[ 1 ].pattern ).toHaveProperty( 'name', 'div' );
			expect( typeof result[ 1 ].match ).toBe( 'object' );
			expect( result[ 1 ].match ).toHaveProperty( 'name', true );

			expect( matcher.matchAll( el3 ) ).toBeNull();
		} );

		it( 'should return all matched elements when using RegExp pattern', () => {
			const pattern = { classes: /^red-.*/ };
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p' );
			const el2 = new ViewElement( document, 'p' );
			const el3 = new ViewElement( document, 'p' );

			el1._addClass( 'red-foreground' );
			el2._addClass( 'red-background' );
			el3._addClass( 'blue-text' );

			const result = matcher.matchAll( el1, el2, el3 );
			expect( Array.isArray( result ) ).toBe( true );
			expect( result.length ).toBe( 2 );
			expect( result[ 0 ] ).toHaveProperty( 'element', el1 );
			expect( result[ 0 ] ).toHaveProperty( 'pattern', pattern );
			expect( typeof result[ 0 ].match ).toBe( 'object' );
			expect( Array.isArray( result[ 0 ].match.attributes ) ).toBe( true );
			expect( result[ 0 ].match.attributes[ 0 ] ).toEqual( [ 'class', 'red-foreground' ] );

			expect( result[ 1 ] ).toHaveProperty( 'element', el2 );
			expect( result[ 1 ] ).toHaveProperty( 'pattern', pattern );
			expect( typeof result[ 1 ].match ).toBe( 'object' );
			expect( Array.isArray( result[ 1 ].match.attributes ) ).toBe( true );
			expect( result[ 1 ].match.attributes[ 0 ] ).toEqual( [ 'class', 'red-background' ] );

			expect( matcher.matchAll( el3 ) ).toBeNull();
		} );

		it( 'should match classes when using global flag in matcher pattern', () => {
			const pattern = { classes: /foo/g };
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p' );
			const el2 = new ViewElement( document, 'p' );

			el1._addClass( 'foobar' );
			el2._addClass( 'foobaz' );

			const result = matcher.matchAll( el1, el2 );

			expect( Array.isArray( result ) ).toBe( true );
			expect( result.length ).toBe( 2 );

			expect( result[ 0 ] ).toHaveProperty( 'pattern', pattern );
			expect( typeof result[ 0 ].match ).toBe( 'object' );
			expect( Array.isArray( result[ 0 ].match.attributes ) ).toBe( true );
			expect( result[ 0 ].match.attributes[ 0 ] ).toEqual( [ 'class', 'foobar' ] );

			expect( result[ 1 ] ).toHaveProperty( 'element', el2 );
			expect( result[ 1 ] ).toHaveProperty( 'pattern', pattern );
			expect( typeof result[ 1 ].match ).toBe( 'object' );
			expect( Array.isArray( result[ 1 ].match.attributes ) ).toBe( true );
			expect( result[ 1 ].match.attributes[ 0 ] ).toEqual( [ 'class', 'foobaz' ] );
		} );

		it( 'should match many classes on single element when using global flag in matcher pattern', () => {
			const pattern = { classes: /foo/g };
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p' );

			el1._addClass( 'foobar' );
			el1._addClass( 'foobaz' );

			const result = matcher.matchAll( el1 );

			expect( Array.isArray( result ) ).toBe( true );
			expect( result.length ).toBe( 1 );

			expect( result[ 0 ] ).toHaveProperty( 'pattern', pattern );
			expect( typeof result[ 0 ].match ).toBe( 'object' );
			expect( Array.isArray( result[ 0 ].match.attributes ) ).toBe( true );
			expect( result[ 0 ].match.attributes[ 0 ] ).toEqual( [ 'class', 'foobar' ] );
			expect( result[ 0 ].match.attributes[ 1 ] ).toEqual( [ 'class', 'foobaz' ] );
		} );

		it( 'should match attributes when using global flag in matcher pattern', () => {
			const pattern = {
				attributes: {
					'data-attribute': /foo/g
				}
			};
			const matcher = new Matcher( pattern );
			const el1 = new ViewElement( document, 'p' );
			const el2 = new ViewElement( document, 'p' );

			el1._setAttribute( 'data-attribute', 'foobar' );
			el2._setAttribute( 'data-attribute', 'foobaz' );

			const result = matcher.matchAll( el1, el2 );

			expect( Array.isArray( result ) ).toBe( true );
			expect( result.length ).toBe( 2 );

			expect( result[ 0 ] ).toHaveProperty( 'pattern', pattern );
			expect( typeof result[ 0 ].match ).toBe( 'object' );
			expect( Array.isArray( result[ 0 ].match.attributes ) ).toBe( true );
			expect( result[ 0 ].match.attributes[ 0 ] ).toEqual( [ 'data-attribute' ] );

			expect( result[ 1 ] ).toHaveProperty( 'element', el2 );
			expect( result[ 1 ] ).toHaveProperty( 'pattern', pattern );
			expect( typeof result[ 1 ].match ).toBe( 'object' );
			expect( Array.isArray( result[ 1 ].match.attributes ) ).toBe( true );
			expect( result[ 1 ].match.attributes[ 0 ] ).toEqual( [ 'data-attribute' ] );
		} );
	} );

	describe( 'getElementName', () => {
		it( 'should return null if there are no patterns in the matcher instance', () => {
			const matcher = new Matcher();

			expect( matcher.getElementName() ).toBeNull();
		} );

		it( 'should return null if pattern has no name property', () => {
			const matcher = new Matcher( { classes: 'foo' } );

			expect( matcher.getElementName() ).toBeNull();
		} );

		it( 'should return null if pattern has name property specified as RegExp', () => {
			const matcher = new Matcher( { name: /foo.*/ } );

			expect( matcher.getElementName() ).toBeNull();
		} );

		it( 'should return element name if matcher has one patter with name property specified as string', () => {
			const matcher = new Matcher( { name: 'div' } );

			expect( matcher.getElementName() ).toBe( 'div' );
		} );

		it( 'should return null if matcher has more than one pattern', () => {
			const matcher = new Matcher( { name: 'div' }, { classes: 'foo' } );

			expect( matcher.getElementName() ).toBeNull();
		} );

		it( 'should return null for matching function', () => {
			const matcher = new Matcher( () => {} );

			expect( matcher.getElementName() ).toBeNull();
		} );

		it( 'should return null for matching named function', () => {
			const matcher = new Matcher( function matchFunction() {} );

			expect( matcher.getElementName() ).toBeNull();
		} );
	} );
} );
