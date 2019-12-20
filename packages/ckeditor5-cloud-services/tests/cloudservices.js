/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import CloudServices from '../src/cloudservices';
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
			return ClassicTestEditor
				.create( element, {
					plugins: [ CloudServices ]
				} )
				.then( editor => {
					const cloudServicesPlugin = editor.plugins.get( 'CloudServices' );
					expect( cloudServicesPlugin ).to.be.instanceOf( CloudServices );

					return editor.destroy();
				} );
		} );

		it( 'should not throw an error when no config is provided', () => {
			return ClassicTestEditor
				.create( element, {
					plugins: [ CloudServices ]
				} )
				.then( editor => {
					return editor.destroy();
				} );
		} );

		it( 'should not expose any default uploadUrl', () => {
			return ClassicTestEditor
				.create( element, {
					plugins: [ CloudServices ]
				} )
				.then( editor => {
					const cloudServicesPlugin = editor.plugins.get( CloudServices );

					expect( cloudServicesPlugin.uploadUrl ).to.be.undefined;

					return editor.destroy();
				} );
		} );

		it( 'should use provided uploadUrl', () => {
			return ClassicTestEditor
				.create( element, {
					plugins: [ CloudServices ],
					cloudServices: {
						uploadUrl: 'https://some-upload-url/'
					}
				} )
				.then( editor => {
					const cloudServicesPlugin = editor.plugins.get( CloudServices );

					expect( cloudServicesPlugin.uploadUrl ).to.equal( 'https://some-upload-url/' );

					return editor.destroy();
				} );
		} );

		it( 'should provide token if tokenUrl is provided', () => {
			CloudServices.Token.initialToken = 'initial-token';

			return ClassicTestEditor
				.create( element, {
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

			return ClassicTestEditor
				.create( element, {
					plugins: [ CloudServices ],
					cloudServices: {}
				} )
				.then( editor => {
					const cloudServicesPlugin = editor.plugins.get( CloudServices );

					expect( cloudServicesPlugin.token ).to.equal( null );

					return editor.destroy();
				} );
		} );
	} );
} );
