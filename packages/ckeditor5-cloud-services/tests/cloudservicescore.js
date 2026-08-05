/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Context } from '@ckeditor/ckeditor5-core';
import { createFakeXHRServer } from '@ckeditor/ckeditor5-core/tests/_utils/fakexhrserver.js';
import { CloudServicesCore } from '../src/cloudservicescore.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { UploadGateway } from '../src/uploadgateway/uploadgateway.js';
import { Token } from '../src/token/token.js';

describe( 'CloudServicesCore', () => {
	let context, cloudServicesCorePlugin, requests;

	beforeEach( async () => {
		context = await Context.create( {
			plugins: [ CloudServicesCore ]
		} );

		cloudServicesCorePlugin = context.plugins.get( CloudServicesCore );

		( { requests } = createFakeXHRServer() );
	} );

	afterEach( () => {
		return context.destroy();
	} );

	it( 'should be named', () => {
		expect( CloudServicesCore.pluginName ).toBe( 'CloudServicesCore' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CloudServicesCore.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CloudServicesCore.isPremiumPlugin ).toBe( false );
	} );

	describe( 'createToken()', () => {
		it( 'should throw an error when no tokenUrl provided', () => {
			expectToThrowCKEditorError(
				() => cloudServicesCorePlugin.createToken(),
				'token-missing-token-url'
			);
		} );

		it( 'should throw an error if the token passed in options is not a string', () => {
			expectToThrowCKEditorError(
				() => cloudServicesCorePlugin.createToken( 'http://token-endpoint', { initValue: 123456 } ),
				'token-not-in-jwt-format'
			);
		} );

		it( 'should throw an error if the token passed in options is wrapped in additional quotes', () => {
			const tokenInitValue = getTestTokenValue();

			expectToThrowCKEditorError(
				() => cloudServicesCorePlugin.createToken( 'http://token-endpoint', { initValue: `"${ tokenInitValue }"` } ),
				'token-not-in-jwt-format'
			);
		} );

		it( 'should throw an error if the token passed in options is not a valid JWT token', () => {
			expectToThrowCKEditorError(
				() => cloudServicesCorePlugin.createToken( 'http://token-endpoint', { initValue: 'token' } ),
				'token-not-in-jwt-format'
			);
		} );

		it( 'should return an instance of the Token class if the token passed in options is valid', () => {
			const tokenInitValue = getTestTokenValue();
			const token = cloudServicesCorePlugin.createToken( 'http://token-endpoint', { initValue: tokenInitValue } );

			expect( token ).toBeInstanceOf( Token );
		} );

		it( 'should set token value if the token passed in options is valid', () => {
			const tokenInitValue = getTestTokenValue();
			const token = cloudServicesCorePlugin.createToken( 'http://token-endpoint', { initValue: tokenInitValue } );

			expect( token.value ).toBe( tokenInitValue );
		} );

		it( 'should fire `change:value` event if the value of the token has changed', () => {
			const tokenValue = getTestTokenValue();
			const token = cloudServicesCorePlugin.createToken( 'http://token-endpoint', { autoRefresh: false } );

			return new Promise( resolve => {
				token.on( 'change:value', ( event, name, newValue ) => {
					expect( newValue ).toBe( tokenValue );

					resolve();
				} );

				token.init();

				requests[ 0 ].respond( 200, '', tokenValue );
			} );
		} );

		it( 'should accept the callback in the constructor', () => {
			expect( () => {
				cloudServicesCorePlugin.createToken( () => Promise.resolve( 'token' ) );
			} ).not.toThrow();
		} );
	} );

	describe( 'createUploadGateway()', () => {
		it( 'should throw error when no token provided', () => {
			expectToThrowCKEditorError(
				() => cloudServicesCorePlugin.createUploadGateway( undefined, 'test' ),
				'uploadgateway-missing-token'
			);
		} );

		it( 'should throw error when no apiAddress provided', () => {
			const token = cloudServicesCorePlugin.createToken( 'url' );

			expectToThrowCKEditorError(
				() => cloudServicesCorePlugin.createUploadGateway( token ),
				'uploadgateway-missing-api-address'
			);
		} );

		it( 'should return an instaoce of the UploadGateway class if passed proper arguments', () => {
			const token = cloudServicesCorePlugin.createToken( 'http://token-endpoint' );
			const uploadGateway = cloudServicesCorePlugin.createUploadGateway( token, '127.0.0.1' );

			expect( uploadGateway ).toBeInstanceOf( UploadGateway );
		} );
	} );
} );

// Returns valid token for tests with given expiration time offset.
//
// @param {Number} [timeOffset=3600000]
// @returns {String}
function getTestTokenValue( timeOffset = 3600 ) {
	return `header.${ btoa( JSON.stringify( { exp: ( Math.floor( Date.now() / 1000 ) ) + timeOffset } ) ) }.signature`;
}
