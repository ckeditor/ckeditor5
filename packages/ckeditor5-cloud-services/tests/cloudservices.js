/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import CloudServices from '../src/cloudservices';
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
		it( 'should expose option property based on config', () => {
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

		it( 'should provide token', () => {
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

		it( 'should throw an error when token URL is not provided', done => {
			CloudServices.Token.initialToken = 'initial-token';

			ClassicTestEditor
				.create( element, {
					plugins: [ CloudServices ],
					cloudServices: {}
				} )
				.catch( err => {
					expect( err.name ).to.equal( 'CKEditorError' );
					expect( err.message, '12' ).to.match( /cloudservices-token-endpoint-not-provided/ );
					done();
				} );
		} );
	} );
} );
