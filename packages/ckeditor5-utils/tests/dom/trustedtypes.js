/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	_clearTrustedTypesCache,
	_trustedAttributeValue,
	isTrustedTypesEnforced,
	trustedHtml
} from '../../src/dom/trustedtypes.js';
import { global } from '../../src/dom/global.js';

/*
 * The browser refuses to create the policy when the `trusted-types` directive does not list its name, and when the
 * name is already taken.
 */
function stubDisallowedPolicy() {
	const createPolicy = vi.fn( () => {
		throw new TypeError( 'Failed to execute \'createPolicy\' on \'TrustedTypePolicyFactory\': Policy "ckeditor5" disallowed.' );
	} );

	vi.stubGlobal( 'trustedTypes', { createPolicy } );

	return createPolicy;
}

/*
 * An application requires `TrustedHTML` objects with the `require-trusted-types-for 'script'` directive, and the only
 * way to find out is to write to a sink and see the browser reject it.
 */
function stubEnforcement() {
	const element = {};

	Object.defineProperty( element, 'innerHTML', {
		set() {
			throw new TypeError( 'This document requires \'TrustedHTML\' assignment.' );
		}
	} );

	vi.spyOn( global, 'document', 'get' ).mockReturnValue( {
		createElement: () => element
	} );
}

describe( 'trustedHtml()', () => {
	afterEach( () => {
		_clearTrustedTypesCache();
	} );

	// The only test using the Trusted Types implementation of the browser instead of a fake one. It creates the real
	// `ckeditor5` policy, so it must stay the only one – a policy name can be used only once per document.
	it( 'should return a value that can be assigned to a DOM injection sink', () => {
		const element = document.createElement( 'div' );

		element.innerHTML = trustedHtml( '<b>foo</b>' );

		expect( element.innerHTML ).toEqual( '<b>foo</b>' );
	} );

	describe( 'when the browser supports Trusted Types', () => {
		function stubTrustedTypes() {
			// Mirrors the native factory: the policy wraps the result of `createHTML()` in an object, so that tests can tell
			// a `TrustedHTML` object from a plain string.
			const createPolicy = vi.fn( ( name, options ) => ( {
				name,
				createHTML: input => ( { toString: () => options.createHTML( input ) } )
			} ) );

			vi.stubGlobal( 'trustedTypes', { createPolicy } );

			return createPolicy;
		}

		it( 'should create a policy named "ckeditor5"', () => {
			const createPolicy = stubTrustedTypes();

			trustedHtml( 'foo' );

			expect( createPolicy ).toHaveBeenCalledTimes( 1 );
			expect( createPolicy ).toHaveBeenCalledWith( 'ckeditor5', expect.any( Object ) );
		} );

		it( 'should create the policy only once, no matter how many times it is called', () => {
			const createPolicy = stubTrustedTypes();

			trustedHtml( 'foo' );
			trustedHtml( 'bar' );

			expect( createPolicy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should return a TrustedHTML object instead of a string', () => {
			stubTrustedTypes();

			const result = trustedHtml( '<b>foo</b>' );

			expect( result ).not.toBeTypeOf( 'string' );
			expect( String( result ) ).toEqual( '<b>foo</b>' );
		} );

		it( 'should not change the markup', () => {
			stubTrustedTypes();

			const html = '<script>alert( 1 )</script><p>foo</p>';

			expect( String( trustedHtml( html ) ) ).toEqual( html );
		} );

		it( 'should create the policy again once it was forgotten', () => {
			const createPolicy = stubTrustedTypes();

			trustedHtml( 'foo' );
			_clearTrustedTypesCache();
			trustedHtml( 'bar' );

			expect( createPolicy ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	describe( 'when the policy cannot be created', () => {
		describe( 'and the application requires TrustedHTML objects', () => {
			it( 'should return the given string instead of throwing', () => {
				vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
				stubDisallowedPolicy();
				stubEnforcement();

				const html = '<b>foo</b>';
				let result;

				expect( () => {
					result = trustedHtml( html );
				} ).not.toThrow();

				expect( result ).toEqual( html );
			} );

			it( 'should warn about the policy that was not created', () => {
				const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

				stubDisallowedPolicy();
				stubEnforcement();

				trustedHtml( 'foo' );

				expect( warnStub ).toHaveBeenCalledOnce();
				expect( warnStub.mock.calls[ 0 ][ 0 ] ).toMatch( /trusted-types-policy-creation-failed/ );
			} );

			it( 'should warn only once, no matter how many times it is called', () => {
				const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
				const createPolicy = stubDisallowedPolicy();

				stubEnforcement();

				trustedHtml( 'foo' );
				trustedHtml( 'bar' );

				expect( createPolicy ).toHaveBeenCalledTimes( 1 );
				expect( warnStub ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'and the application does not require them', () => {
			// Restricting policy names without requiring `TrustedHTML` objects leaves plain strings working, so the editor
			// keeps working too and there is nothing for the developer to fix yet.
			it( 'should return the given string', () => {
				stubDisallowedPolicy();

				const html = '<b>foo</b>';

				expect( trustedHtml( html ) ).toEqual( html );
			} );

			it( 'should not warn', () => {
				const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

				stubDisallowedPolicy();

				trustedHtml( 'foo' );

				expect( warnStub ).not.toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'when the browser does not support Trusted Types', () => {
		it( 'should return the given string', () => {
			vi.stubGlobal( 'trustedTypes', undefined );

			const html = '<b>foo</b>';
			const result = trustedHtml( html );

			expect( result ).toBeTypeOf( 'string' );
			expect( result ).toEqual( html );
		} );

		// A browser without Trusted Types is not a misconfigured application, so there is nothing to tell the developer about.
		it( 'should not warn', () => {
			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			vi.stubGlobal( 'trustedTypes', undefined );

			trustedHtml( 'foo' );

			expect( warnStub ).not.toHaveBeenCalled();
		} );
	} );
} );

describe( 'isTrustedTypesEnforced()', () => {
	afterEach( () => {
		_clearTrustedTypesCache();
	} );

	it( 'should return false when a sink accepts a plain string', () => {
		expect( isTrustedTypesEnforced() ).toBe( false );
	} );

	it( 'should return true when a sink rejects a plain string', () => {
		stubEnforcement();

		expect( isTrustedTypesEnforced() ).toBe( true );
	} );

	// The function is public API, so it can be called where `global.document` is the empty object that
	// "dom/global" falls back to. A missing `createElement()` is not a sink refusing a string.
	it( 'should return false outside a browser, where there is no CSP to enforce anything', () => {
		vi.spyOn( global, 'document', 'get' ).mockReturnValue( {} );

		expect( isTrustedTypesEnforced() ).toBe( false );
	} );

	it( 'should check only once, no matter how many times it is called', () => {
		const createElement = stubElementCounter();

		isTrustedTypesEnforced();
		isTrustedTypesEnforced();

		expect( createElement ).toHaveBeenCalledOnce();
	} );

	it( 'should check again once the answer was forgotten', () => {
		const createElement = stubElementCounter();

		isTrustedTypesEnforced();
		_clearTrustedTypesCache();
		isTrustedTypesEnforced();

		expect( createElement ).toHaveBeenCalledTimes( 2 );
	} );

	// Counts the elements the check creates, which is how often it asked the browser.
	function stubElementCounter() {
		const createElement = vi.fn( tagName => document.createElement( tagName ) );

		vi.spyOn( global, 'document', 'get' ).mockReturnValue( { createElement } );

		return createElement;
	}
} );

describe( '_trustedAttributeValue()', () => {
	let element;

	beforeEach( () => {
		element = document.createElement( 'p' );
	} );

	afterEach( () => {
		_clearTrustedTypesCache();
	} );

	// Mirrors the native factory: the policy wraps what its options return in an object that tells the type, so that tests
	// can tell the object of a Trusted Type from a plain string. The browser answers `getAttributeType()` with `type`.
	function stubTrustedTypes( type ) {
		const wrap = ( trustedType, create ) => input => ( { trustedType, toString: () => create( input ) } );
		const getAttributeType = vi.fn( () => type );

		vi.stubGlobal( 'trustedTypes', {
			createPolicy: vi.fn( ( name, options ) => ( {
				createHTML: wrap( 'TrustedHTML', options.createHTML ),
				createScript: wrap( 'TrustedScript', options.createScript ),
				createScriptURL: wrap( 'TrustedScriptURL', options.createScriptURL )
			} ) ),
			getAttributeType
		} );

		return getAttributeType;
	}

	it( 'should create the policy only once, no matter how many times it is called', () => {
		stubTrustedTypes( 'TrustedScript' );

		_trustedAttributeValue( element, 'onclick', 'foo()' );
		_trustedAttributeValue( element, 'onclick', 'bar()' );

		expect( window.trustedTypes.createPolicy ).toHaveBeenCalledOnce();
	} );

	it( 'should ask the browser about the attribute of the element', () => {
		const svgElement = document.createElementNS( 'http://www.w3.org/2000/svg', 'script' );
		const getAttributeType = stubTrustedTypes( 'TrustedScriptURL' );

		_trustedAttributeValue( svgElement, 'href', '/a.js' );

		expect( getAttributeType ).toHaveBeenCalledWith( 'script', 'href', 'http://www.w3.org/2000/svg' );
	} );

	for ( const type of [ 'TrustedHTML', 'TrustedScript', 'TrustedScriptURL' ] ) {
		it( `should return a ${ type } object for an attribute that takes one, with the value unchanged`, () => {
			stubTrustedTypes( type );

			const result = _trustedAttributeValue( element, 'foo', 'alert( "1" )' );

			expect( result.trustedType ).toEqual( type );
			expect( String( result ) ).toEqual( 'alert( "1" )' );
		} );
	}

	it( 'should return the given string for an attribute that takes a plain string', () => {
		stubTrustedTypes( null );

		expect( _trustedAttributeValue( element, 'class', 'foo' ) ).toEqual( 'foo' );
	} );

	// Setting the value it would return otherwise, `undefined`, would silently write the "undefined" string.
	it( 'should return the given string for a type that it does not know', () => {
		stubTrustedTypes( 'TrustedSomethingElse' );

		expect( _trustedAttributeValue( element, 'foo', 'bar' ) ).toEqual( 'bar' );
	} );

	it( 'should return the given string when the browser does not support Trusted Types', () => {
		vi.stubGlobal( 'trustedTypes', undefined );

		expect( _trustedAttributeValue( element, 'onclick', 'foo()' ) ).toEqual( 'foo()' );
	} );

	// The "tinyfill" of the spec: `trustedTypes` with `createPolicy()` only, for browsers without Trusted Types.
	it( 'should return the given string when trustedTypes cannot tell the type of an attribute', () => {
		vi.stubGlobal( 'trustedTypes', { createPolicy: ( name, rules ) => rules } );

		expect( _trustedAttributeValue( element, 'onclick', 'foo()' ) ).toEqual( 'foo()' );
	} );
} );
