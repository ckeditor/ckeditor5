/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { _clearTrustedTypesCache, isTrustedTypesEnforced, trustedHtml } from '../../src/dom/trustedtypes.js';
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
