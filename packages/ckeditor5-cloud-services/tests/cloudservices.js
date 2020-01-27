/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import CloudServices from '../src/cloudservices';
import Context from '@ckeditor/ckeditor5-core/src/context';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import TokenMock from './_utils/tokenmock';

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
				.then( editor => {
					const cloudServicesPlugin = editor.plugins.get( CloudServices );

					expect( cloudServicesPlugin ).to.be.instanceOf( CloudServices );
					expect( cloudServicesPlugin.tokenUrl ).to.equal( 'http://token-endpoint' );
					expect( cloudServicesPlugin.additionalOption ).to.equal( 'some-value' );

					return editor.destroy();
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
					const cloudServicesPlugin = editor.plugins.get( CloudServices );

					expect( cloudServicesPlugin ).to.be.instanceOf( CloudServices );
					expect( cloudServicesPlugin.tokenUrl ).to.equal( 'http://token-endpoint' );
					expect( cloudServicesPlugin.additionalOption ).to.equal( 'some-value' );

					return editor.destroy();
				} );
		} );

		it( 'should be able to get by its plugin name', () => {
			return Context.create( { plugins: [ CloudServices ] } ).then( editor => {
				const cloudServicesPlugin = editor.plugins.get( 'CloudServices' );
				expect( cloudServicesPlugin ).to.be.instanceOf( CloudServices );
			} );
		} );

		it( 'should not throw an error when no config is provided', () => {
			return Context.create( { plugins: [ CloudServices ] } );
		} );

		it( 'should not expose any default uploadUrl', () => {
			return Context.create( { plugins: [ CloudServices ] } ).then( editor => {
				const cloudServicesPlugin = editor.plugins.get( CloudServices );

				expect( cloudServicesPlugin.uploadUrl ).to.be.undefined;
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
				.then( editor => {
					const cloudServicesPlugin = editor.plugins.get( CloudServices );

					expect( cloudServicesPlugin.uploadUrl ).to.equal( 'https://some-upload-url/' );
				} );
		} );

		it( 'should provide token if tokenUrl is provided', () => {
			CloudServices.Token.initialToken = 'initial-token';

			return Context
				.create( {
					plugins: [ CloudServices ],
					cloudServices: {
						tokenUrl: 'http://token-endpoint',
					}
				} )
				.then( editor => {
					const cloudServicesPlugin = editor.plugins.get( CloudServices );

					expect( cloudServicesPlugin.token.value ).to.equal( 'initial-token' );

					return editor.destroy();
				} );
		} );

		it( 'should not provide token if tokenUrl is not provided', () => {
			CloudServices.Token.initialToken = 'initial-token';

			return Context.create( { plugins: [ CloudServices ] } ).then( editor => {
				const cloudServicesPlugin = editor.plugins.get( CloudServices );

				expect( cloudServicesPlugin.token ).to.equal( null );
			} );
		} );
	} );
} );
