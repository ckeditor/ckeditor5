/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CloudServices } from '../src/cloudservices.js';
import { CloudServicesCore } from '../src/cloudservicescore.js';
import { Context } from '@ckeditor/ckeditor5-core';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { TokenMock } from './_utils/tokenmock.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

// CloudServices requires the `CloudServicesCore` plugin as a hard-requirement.
// In order to mock the `Token` class, we create a new class that extend the `CloudServicesCore` plugin
// and override the `#createToken()` method which creates an instance of the `Token` class.
class CloudServicesCoreMock extends CloudServicesCore {
	createToken( tokenUrlOrRefreshToken, options ) {
		return new TokenMock( tokenUrlOrRefreshToken, options );
	}
}

describe( 'CloudServices', () => {
	let element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
	} );

	afterEach( () => {
		document.body.removeChild( element );
	} );

	it( 'should require CloudServicesCore', () => {
		expect( CloudServices.requires ).toEqual( [ CloudServicesCore ] );
	} );

	it( 'should be named', () => {
		expect( CloudServices.pluginName ).toBe( 'CloudServices' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CloudServices.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CloudServices.isPremiumPlugin ).toBe( false );
	} );

	describe( 'init()', () => {
		it( 'should expose its properties based on config', () => {
			return Context
				.create( {
					plugins: [ CloudServices ],
					substitutePlugins: [ CloudServicesCoreMock ],
					cloudServices: {
						tokenUrl: 'http://token-endpoint',
						additionalOption: 'some-value'
					}
				} )
				.then( context => {
					const cloudServicesPlugin = context.plugins.get( CloudServices );

					expect( cloudServicesPlugin ).toBeInstanceOf( CloudServices );
					expect( cloudServicesPlugin.tokenUrl ).toBe( 'http://token-endpoint' );
					expect( cloudServicesPlugin.additionalOption ).toBe( 'some-value' );

					return context.destroy();
				} );
		} );

		it( 'should work as an editor plugin', () => {
			return ClassicTestEditor
				.create( element, {
					plugins: [ CloudServices ],
					substitutePlugins: [ CloudServicesCoreMock ],
					cloudServices: {
						tokenUrl: 'http://token-endpoint',
						additionalOption: 'some-value'
					}
				} )
				.then( editor => {
					const cloudServicesPlugin = editor.plugins.get( 'CloudServices' );
					expect( cloudServicesPlugin ).toBeInstanceOf( CloudServices );

					return editor.destroy();
				} );
		} );

		it( 'should be able to get by its plugin name', () => {
			return Context
				.create( { plugins: [ CloudServices ], substitutePlugins: [ CloudServicesCoreMock ] } )
				.then( context => {
					const cloudServicesPlugin = context.plugins.get( 'CloudServices' );

					expect( cloudServicesPlugin ).toBeInstanceOf( CloudServices );

					return context.destroy();
				} );
		} );

		it( 'should not throw an error when no config is provided', () => {
			return Context
				.create( { plugins: [ CloudServices ], substitutePlugins: [ CloudServicesCoreMock ] } )
				.then( context => context.destroy() );
		} );

		it( 'should not expose any default uploadUrl', () => {
			return Context
				.create( { plugins: [ CloudServices ], substitutePlugins: [ CloudServicesCoreMock ] } )
				.then( context => {
					const cloudServicesPlugin = context.plugins.get( CloudServices );

					expect( cloudServicesPlugin.uploadUrl ).toBeUndefined();

					return context.destroy();
				} );
		} );

		it( 'should use provided uploadUrl', () => {
			return Context
				.create( {
					plugins: [ CloudServices ],
					substitutePlugins: [ CloudServicesCoreMock ],
					cloudServices: {
						uploadUrl: 'https://some-upload-url/'
					}
				} )
				.then( context => {
					const cloudServicesPlugin = context.plugins.get( CloudServices );

					expect( cloudServicesPlugin.uploadUrl ).toBe( 'https://some-upload-url/' );

					return context.destroy();
				} );
		} );

		it( 'should provide token if tokenUrl is provided', () => {
			TokenMock.initialToken = 'initial-token';

			return Context
				.create( {
					plugins: [ CloudServices ],
					substitutePlugins: [ CloudServicesCoreMock ],
					cloudServices: {
						tokenUrl: 'http://token-endpoint'
					}
				} )
				.then( context => {
					const cloudServicesPlugin = context.plugins.get( CloudServices );

					expect( cloudServicesPlugin.token.value ).toBe( 'initial-token' );

					return context.destroy();
				} );
		} );

		it( 'should not provide token if tokenUrl is not provided', () => {
			TokenMock.initialToken = 'initial-token';

			return Context
				.create( { plugins: [ CloudServices ], substitutePlugins: [ CloudServicesCoreMock ] } )
				.then( context => {
					const cloudServicesPlugin = context.plugins.get( CloudServices );

					expect( cloudServicesPlugin.token ).toBe( null );

					return context.destroy();
				} );
		} );

		it( 'if token url crashes, then it should not create infinity loop of requests after destroy of the editor', async () => {
			vi.useFakeTimers();

			vi.spyOn( console, 'warn' ).mockReturnValue( undefined );

			const tokenUrlStub = vi.fn().mockRejectedValue( new Error( 'Token URL crashed' ) );

			try {
				await Context.create( {
					plugins: [ CloudServices ],
					cloudServices: {
						tokenUrl: tokenUrlStub
					}
				} );

				throw new Error( 'Context.create should reject' );
			} catch ( error ) {
				expect( error.message ).toBe( 'Token URL crashed' );
			}

			expect( tokenUrlStub ).toHaveBeenCalledOnce();

			vi.advanceTimersByTime( 17000 );
			vi.useRealTimers();

			// Editor was destroyed at this moment, so no more requests should be made.
			expect( tokenUrlStub ).toHaveBeenCalledOnce();

			vi.restoreAllMocks();
		} );
	} );

	describe( 'registerTokenUrl()', () => {
		it( 'should allow adding additional tokenUrl', async () => {
			TokenMock.initialToken = 'initial-token';

			const context = await Context.create( {
				plugins: [ CloudServices ],
				substitutePlugins: [ CloudServicesCoreMock ],
				cloudServices: {
					tokenUrl: 'http://token-endpoint'
				}
			} );

			TokenMock.initialToken = 'another-token';

			const cloudServicesPlugin = context.plugins.get( CloudServices );
			const extraToken = await cloudServicesPlugin.registerTokenUrl( 'http://another-token-endpoint' );

			expect( cloudServicesPlugin.token.value ).toBe( 'initial-token' );
			expect( extraToken.value ).toBe( 'another-token' );

			await context.destroy();
		} );

		it( 'should return already registered token', async () => {
			const context = await Context.create( {
				plugins: [ CloudServices ],
				substitutePlugins: [ CloudServicesCoreMock ],
				cloudServices: {
					tokenUrl: 'http://token-endpoint'
				}
			} );

			const cloudServicesPlugin = context.plugins.get( CloudServices );
			const token = await cloudServicesPlugin.registerTokenUrl( 'http://token-endpoint' );

			expect( token ).toBe( cloudServicesPlugin.token );

			await context.destroy();
		} );
	} );

	describe( 'getTokenFor()', () => {
		it( 'should return token for registered tokenUrl', async () => {
			const context = await Context.create( {
				plugins: [ CloudServices ],
				substitutePlugins: [ CloudServicesCoreMock ],
				cloudServices: {
					tokenUrl: 'http://token-endpoint'
				}
			} );

			const cloudServicesPlugin = context.plugins.get( CloudServices );
			const token = await cloudServicesPlugin.registerTokenUrl( 'http://token-endpoint' );
			const token2 = cloudServicesPlugin.getTokenFor( 'http://token-endpoint' );

			expect( token ).toBe( token2 );

			await context.destroy();
		} );

		it( 'should throw for not registered tokenUrl', async () => {
			const context = await Context.create( {
				plugins: [ CloudServices ],
				substitutePlugins: [ CloudServicesCoreMock ],
				cloudServices: {
					tokenUrl: 'http://token-endpoint'
				}
			} );

			const cloudServicesPlugin = context.plugins.get( CloudServices );

			expect( () => {
				cloudServicesPlugin.getTokenFor( 'http://another-token-endpoint' );
			} ).toThrow( CKEditorError );

			await context.destroy();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy created token when tokenUrl was provided', async () => {
			TokenMock.initialToken = 'initial-token';

			const context = await Context.create( {
				plugins: [ CloudServices ],
				substitutePlugins: [ CloudServicesCoreMock ],
				cloudServices: {
					tokenUrl: 'http://token-endpoint'
				}
			} );

			const cloudServicesPlugin = context.plugins.get( CloudServices );

			const destroySpy = vi.spyOn( cloudServicesPlugin.token, 'destroy' );

			await context.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not crash when tokenUrl was not provided', async () => {
			const context = await Context.create( { plugins: [ CloudServices ], substitutePlugins: [ CloudServicesCoreMock ] } );

			try {
				await context.destroy();
			} catch {
				throw new Error( 'Error should not be thrown.' );
			}
		} );
	} );

	describe( 'autoRefresh', () => {
		let context;

		afterEach( async () => {
			await context.destroy();
			context = null;
		} );

		it( 'should use default value (`true`) when not provided', async () => {
			context = await Context.create( {
				plugins: [ CloudServices ],
				substitutePlugins: [ CloudServicesCoreMock ],
				cloudServices: {
					tokenUrl: 'http://example.com'
				}
			} );

			expect( context.plugins.get( 'CloudServices' ).autoRefresh ).toBe( true );
		} );

		it( 'should use provided value from config', async () => {
			context = await Context.create( {
				plugins: [ CloudServices ],
				substitutePlugins: [ CloudServicesCoreMock ],
				cloudServices: {
					tokenUrl: 'http://example.com',
					autoRefresh: false
				}
			} );

			expect( context.plugins.get( 'CloudServices' ).autoRefresh ).toBe( false );
		} );

		it( 'should pass autoRefresh to token when registering new token URL', async () => {
			context = await Context.create( {
				plugins: [ CloudServices ],
				substitutePlugins: [ CloudServicesCoreMock ],
				cloudServices: {
					tokenUrl: 'http://example.com',
					autoRefresh: false
				}
			} );

			const cloudServices = context.plugins.get( 'CloudServices' );
			const token = await cloudServices.registerTokenUrl( 'http://example.com/new' );

			expect( token._options.autoRefresh ).toBe( false );
		} );

		it( 'should pass autoRefresh to token during initialization', async () => {
			context = await Context.create( {
				plugins: [ CloudServices ],
				substitutePlugins: [ CloudServicesCoreMock ],
				cloudServices: {
					tokenUrl: 'http://example.com',
					autoRefresh: false
				}
			} );

			const cloudServices = context.plugins.get( 'CloudServices' );

			expect( cloudServices.token._options.autoRefresh ).toBe( false );
		} );
	} );
} );
