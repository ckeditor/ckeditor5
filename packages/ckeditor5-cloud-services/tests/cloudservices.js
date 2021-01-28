/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import CloudServices from '../src/cloudservices';
import Context from '@ckeditor/ckeditor5-core/src/context';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import TokenMock from './_utils/tokenmock';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

const Token = CloudServices.Token;

describe( 'CloudServices', () => {
	let element;

	beforeEach( () => {
		CloudServices.Token = TokenMock;
		element = document.createElement( 'div' );
		document.body.appendChild( element );
	} );

	afterEach( () => {
		CloudServices.Token = Token;
		document.body.removeChild( element );
	} );

	describe( 'init()', () => {
		it( 'should expose its properties based on config', () => {
			return Context
				.create( {
					plugins: [ CloudServices ],
					cloudServices: {
						tokenUrl: 'http://token-endpoint',
						additionalOption: 'some-value'
					}
				} )
				.then( context => {
					const cloudServicesPlugin = context.plugins.get( CloudServices );

					expect( cloudServicesPlugin ).to.be.instanceOf( CloudServices );
					expect( cloudServicesPlugin.tokenUrl ).to.equal( 'http://token-endpoint' );
					expect( cloudServicesPlugin.additionalOption ).to.equal( 'some-value' );

					return context.destroy();
				} );
		} );

		it( 'should work as an editor plugin', () => {
			return ClassicTestEditor
				.create( element, {
					plugins: [ CloudServices ],
					cloudServices: {
						tokenUrl: 'http://token-endpoint',
						additionalOption: 'some-value'
					}
				} )
				.then( editor => {
					const cloudServicesPlugin = editor.plugins.get( 'CloudServices' );
					expect( cloudServicesPlugin ).to.be.instanceOf( CloudServices );

					return editor.destroy();
				} );
		} );

		it( 'should be able to get by its plugin name', () => {
			return Context.create( { plugins: [ CloudServices ] } ).then( context => {
				const cloudServicesPlugin = context.plugins.get( 'CloudServices' );

				expect( cloudServicesPlugin ).to.be.instanceOf( CloudServices );

				return context.destroy();
			} );
		} );

		it( 'should not throw an error when no config is provided', () => {
			return Context.create( { plugins: [ CloudServices ] } ).then( context => context.destroy() );
		} );

		it( 'should not expose any default uploadUrl', () => {
			return Context.create( { plugins: [ CloudServices ] } ).then( context => {
				const cloudServicesPlugin = context.plugins.get( CloudServices );

				expect( cloudServicesPlugin.uploadUrl ).to.be.undefined;

				return context.destroy();
			} );
		} );

		it( 'should use provided uploadUrl', () => {
			return Context
				.create( {
					plugins: [ CloudServices ],
					cloudServices: {
						uploadUrl: 'https://some-upload-url/'
					}
				} )
				.then( context => {
					const cloudServicesPlugin = context.plugins.get( CloudServices );

					expect( cloudServicesPlugin.uploadUrl ).to.equal( 'https://some-upload-url/' );

					return context.destroy();
				} );
		} );

		it( 'should provide token if tokenUrl is provided', () => {
			CloudServices.Token.initialToken = 'initial-token';

			return Context
				.create( {
					plugins: [ CloudServices ],
					cloudServices: {
						tokenUrl: 'http://token-endpoint'
					}
				} )
				.then( context => {
					const cloudServicesPlugin = context.plugins.get( CloudServices );

					expect( cloudServicesPlugin.token.value ).to.equal( 'initial-token' );

					return context.destroy();
				} );
		} );

		it( 'should not provide token if tokenUrl is not provided', () => {
			CloudServices.Token.initialToken = 'initial-token';

			return Context.create( { plugins: [ CloudServices ] } ).then( context => {
				const cloudServicesPlugin = context.plugins.get( CloudServices );

				expect( cloudServicesPlugin.token ).to.equal( null );

				return context.destroy();
			} );
		} );
	} );

	describe( 'registerTokenUrl()', () => {
		it( 'should allow adding additional tokenUrl', async () => {
			CloudServices.Token.initialToken = 'initial-token';

			const context = await Context.create( {
				plugins: [ CloudServices ],
				cloudServices: {
					tokenUrl: 'http://token-endpoint'
				}
			} );

			CloudServices.Token.initialToken = 'another-token';

			const cloudServicesPlugin = context.plugins.get( CloudServices );
			const extraToken = await cloudServicesPlugin.registerTokenUrl( 'http://another-token-endpoint' );

			expect( cloudServicesPlugin.token.value ).to.equal( 'initial-token' );
			expect( extraToken.value ).to.equal( 'another-token' );

			await context.destroy();
		} );

		it( 'should return already registered token', async () => {
			const context = await Context.create( {
				plugins: [ CloudServices ],
				cloudServices: {
					tokenUrl: 'http://token-endpoint'
				}
			} );

			const cloudServicesPlugin = context.plugins.get( CloudServices );
			const token = await cloudServicesPlugin.registerTokenUrl( 'http://token-endpoint' );

			expect( token ).to.equal( cloudServicesPlugin.token );

			await context.destroy();
		} );
	} );

	describe( 'getTokenFor()', () => {
		it( 'should return token for registered tokenUrl', async () => {
			const context = await Context.create( {
				plugins: [ CloudServices ],
				cloudServices: {
					tokenUrl: 'http://token-endpoint'
				}
			} );

			const cloudServicesPlugin = context.plugins.get( CloudServices );
			const token = await cloudServicesPlugin.registerTokenUrl( 'http://token-endpoint' );
			const token2 = cloudServicesPlugin.getTokenFor( 'http://token-endpoint' );

			expect( token ).to.equal( token2 );

			await context.destroy();
		} );

		it( 'should throw for not registered tokenUrl', async () => {
			const context = await Context.create( {
				plugins: [ CloudServices ],
				cloudServices: {
					tokenUrl: 'http://token-endpoint'
				}
			} );

			const cloudServicesPlugin = context.plugins.get( CloudServices );

			expect( () => {
				cloudServicesPlugin.getTokenFor( 'http://another-token-endpoint' );
			} ).to.throw(
				CKEditorError,
				'cloudservices-token-not-registered'
			);

			await context.destroy();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy created token when tokenUrl was provided', async () => {
			CloudServices.Token.initialToken = 'initial-token';

			const context = await Context.create( {
				plugins: [ CloudServices ],
				cloudServices: {
					tokenUrl: 'http://token-endpoint'
				}
			} );

			const cloudServicesPlugin = context.plugins.get( CloudServices );

			const destroySpy = sinon.spy( cloudServicesPlugin.token, 'destroy' );

			await context.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should not crash when tokenUrl was not provided', async () => {
			const context = await Context.create( { plugins: [ CloudServices ] } );

			try {
				await context.destroy();
			} catch ( error ) {
				expect.fail( 'Error should not be thrown.' );
			}
		} );
	} );
} );
