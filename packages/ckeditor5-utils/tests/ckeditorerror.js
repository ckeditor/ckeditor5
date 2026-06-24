/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { CKEditorError, DOCUMENTATION_URL, logError, logWarning } from '../src/ckeditorerror.js';
import { expectToThrowCKEditorError } from './_utils/utils.js';

describe( 'CKEditorError', () => {
	it( 'inherits from Error', () => {
		const error = new CKEditorError( 'foo', null );

		expect( error ).toBeInstanceOf( Error );
		expect( error ).toBeInstanceOf( CKEditorError );
	} );

	it( 'sets the name', () => {
		const error = new CKEditorError( 'foo', null );

		expect( error ).toHaveProperty( 'name', 'CKEditorError' );
	} );

	it( 'sets the message', () => {
		const error = new CKEditorError( 'foo', null );

		expect( error.message ).toMatch( /^foo/ );
		expect( error.data ).toBeUndefined();
	} );

	it( 'sets the message and data', () => {
		const data = { bar: 1 };
		const error = new CKEditorError( 'foo', null, data );

		expect( error ).toHaveProperty(
			'message',
			`foo {"bar":1}\nRead more: ${ DOCUMENTATION_URL }#error-foo`
		);
		expect( error.data ).toBe( data );
	} );

	it( 'sets the context of the error', () => {
		const data = { bar: 1 };
		const editor = {};
		const error = new CKEditorError( 'foo', editor, data );

		expect( error.context ).toBe( editor );
	} );

	it( 'appends stringified data to the message', () => {
		class Foo {
			constructor() {
				this.x = 1;
			}
		}

		const data = {
			bar: 'a',
			bom: new Foo(),
			bim: 10
		};
		const error = new CKEditorError( 'foo', null, data );

		expect( error ).toHaveProperty(
			'message',
			`foo {"bar":"a","bom":{"x":1},"bim":10}\nRead more: ${ DOCUMENTATION_URL }#error-foo`
		);
		expect( error.data ).toBe( data );
	} );

	it( 'appends stringified data to the message if stringified object contains circular references', () => {
		const data = { foo: 'bar' };

		data.bar = data;

		const error = new CKEditorError( 'foo', null, data );

		expect( error ).toHaveProperty(
			'message',
			`foo {"foo":"bar","bar":"[object Object]"}\nRead more: ${ DOCUMENTATION_URL }#error-foo`
		);
		expect( error.data ).toBe( data );
	} );

	it( 'appends stringified data to the message if stringified object contains multiple exact same circular references', () => {
		const data = { foo: 'bar' };

		data.bar = [ data, data ];

		const error = new CKEditorError( 'foo', null, data );

		expect( error ).toHaveProperty(
			'message',
			`foo {"foo":"bar","bar":["[object Object]","[object Object]"]}\nRead more: ${ DOCUMENTATION_URL }#error-foo`
		);
		expect( error.data ).toBe( data );
	} );

	it( 'contains a link which leads to the documentation', () => {
		const error = new CKEditorError( 'model-schema-no-item', null );

		const errorMessage = `model-schema-no-item\nRead more: ${ DOCUMENTATION_URL }#error-model-schema-no-item`;

		expect( error ).toHaveProperty( 'message', errorMessage );
	} );

	it( 'link to documentation is added after the additional data message', () => {
		const error = new CKEditorError( 'model-schema-no-item', null, { foo: 1, bar: 2 } );

		const errorMessage = `model-schema-no-item {"foo":1,"bar":2}\nRead more: ${ DOCUMENTATION_URL }#error-model-schema-no-item`;

		expect( error ).toHaveProperty( 'message', errorMessage );
	} );

	describe( 'is()', () => {
		it( 'checks if error is an instance of CKEditorError', () => {
			const ckeditorError = new CKEditorError( 'foo', null );
			const regularError = new Error( 'foo' );

			expect( ( !!ckeditorError.is && ckeditorError.is( 'CKEditorError' ) ) ).toBe( true );
			expect( ( !!regularError.is && regularError.is( 'CKEditorError' ) ) ).toBe( false );
		} );
	} );

	describe( 'static rethrowUnexpectedError()', () => {
		it( 'should rethrow the original CKEditorError as it is', () => {
			const ckeditorError = new CKEditorError( 'foo', null );

			expectToThrowCKEditorError( () => {
				CKEditorError.rethrowUnexpectedError( ckeditorError, {} );
			}, /foo/, null );
		} );

		it( 'should rethrow an unexpected error wrapped in CKEditorError', () => {
			const error = new Error( 'foo' );
			error.stack = 'bar';
			const context = {};

			expectToThrowCKEditorError( () => {
				CKEditorError.rethrowUnexpectedError( error, context );
			}, /foo/, context );
		} );

		it( 'should rethrow an unexpected error wrapped in CKEditorError with original error details', () => {
			const error = new TypeError( 'Some unexpected error' );
			error.stack = 'bar';
			const context = {};

			const expectedMessage = [
				'unexpected-error',
				`Read more: ${ DOCUMENTATION_URL }#error-unexpected-error`,
				'Original error: TypeError: Some unexpected error'
			].join( '\n' );

			expectToThrowCKEditorError( () => {
				CKEditorError.rethrowUnexpectedError( error, context );
			}, expectedMessage, context );
		} );
	} );

	describe( 'logWarning()', () => {
		beforeEach( () => {
			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		} );

		afterEach( () => {
			vi.restoreAllMocks();
		} );

		it( 'should log warning with data and link to the documentation', () => {
			logWarning( 'foo', { name: 'foo' } );

			expect( console.warn ).toHaveBeenCalledTimes( 1 );
			expect( console.warn ).toHaveBeenCalledWith(
				expect.stringContaining( 'foo' ),
				{ name: 'foo' },
				`\nRead more: ${ DOCUMENTATION_URL }#error-foo`
			);
		} );

		it( 'should log warning without data and with a link to the documentation', () => {
			logWarning( 'foo' );

			expect( console.warn ).toHaveBeenCalledTimes( 1 );
			expect( console.warn ).toHaveBeenCalledWith(
				expect.stringContaining( 'foo' ),
				`\nRead more: ${ DOCUMENTATION_URL }#error-foo`
			);
		} );
	} );

	describe( 'logError()', () => {
		beforeEach( () => {
			vi.spyOn( console, 'error' ).mockImplementation( () => {} );
		} );

		afterEach( () => {
			vi.restoreAllMocks();
		} );

		it( 'should log error with data and link to the documentation', () => {
			logError( 'foo', { name: 'foo' } );

			expect( console.error ).toHaveBeenCalledTimes( 1 );
			expect( console.error ).toHaveBeenCalledWith(
				expect.stringContaining( 'foo' ),
				{ name: 'foo' },
				`\nRead more: ${ DOCUMENTATION_URL }#error-foo`
			);
		} );

		it( 'should log error without data and with a link to the documentation', () => {
			logError( 'foo' );

			expect( console.error ).toHaveBeenCalledTimes( 1 );
			expect( console.error ).toHaveBeenCalledWith(
				expect.stringContaining( 'foo' ),
				`\nRead more: ${ DOCUMENTATION_URL }#error-foo`
			);
		} );
	} );
} );
