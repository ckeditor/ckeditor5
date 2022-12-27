/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import CloudServices from '../src/cloudservices';
import CloudServicesCore from '../src/cloudservicescore';
import Context from '@ckeditor/ckeditor5-core/src/context';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import TokenMock from './_utils/tokenmock';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

// CloudServices requires the `CloudServicesCore` plugin as a hard-requirement.
// In order to mock the `Token` class, we create a new class that extend the `CloudServicesCore` plugin
// and override the `#createToken()` method which creates an instance of the `Token` class.
class CloudServicesCoreMock extends CloudServicesCore {
	createToken( tokenUrlOrRefreshToken ) {
		return new TokenMock( tokenUrlOrRefreshToken );
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
		expect( CloudServices.requires ).to.deep.equal( [ CloudServicesCore ] );
	} );

	it( 'should be named', () => {
		expect( CloudServices.pluginName ).to.equal( 'CloudServices' );
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
					substitutePlugins: [ CloudServicesCoreMock ],
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
			return Context
				.create( { plugins: [ CloudServices ], substitutePlugins: [ CloudServicesCoreMock ] } )
				.then( context => {
					const cloudServicesPlugin = context.plugins.get( 'CloudServices' );

					expect( cloudServicesPlugin ).to.be.instanceOf( CloudServices );

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

					expect( cloudServicesPlugin.uploadUrl ).to.be.undefined;

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

					expect( cloudServicesPlugin.uploadUrl ).to.equal( 'https://some-upload-url/' );

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

					expect( cloudServicesPlugin.token.value ).to.equal( 'initial-token' );

					return context.destroy();
				} );
		} );

		it( 'should not provide token if tokenUrl is not provided', () => {
			TokenMock.initialToken = 'initial-token';

			return Context
				.create( { plugins: [ CloudServices ], substitutePlugins: [ CloudServicesCoreMock ] } )
				.then( context => {
					const cloudServicesPlugin = context.plugins.get( CloudServices );

					expect( cloudServicesPlugin.token ).to.equal( null );

					return context.destroy();
				} );
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

			expect( cloudServicesPlugin.token.value ).to.equal( 'initial-token' );
			expect( extraToken.value ).to.equal( 'another-token' );

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

			expect( token ).to.equal( cloudServicesPlugin.token );

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

			expect( token ).to.equal( token2 );

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
			} ).to.throw(
				CKEditorError,
				'cloudservices-token-not-registered'
			);

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

			const destroySpy = sinon.spy( cloudServicesPlugin.token, 'destroy' );

			await context.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should not crash when tokenUrl was not provided', async () => {
			const context = await Context.create( { plugins: [ CloudServices ], substitutePlugins: [ CloudServicesCoreMock ] } );

			try {
				await context.destroy();
			} catch ( error ) {
				expect.fail( 'Error should not be thrown.' );
			}
		} );
	} );
} );
