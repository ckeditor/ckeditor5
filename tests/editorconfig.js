/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import EditorConfig from '/ckeditor5/editorconfig.js';
import CKEDITOR from '/ckeditor.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

let config;
testUtils.createSinonSandbox();

beforeEach( () => {
	config = new EditorConfig( {
		test: 1
	} );
} );

describe( 'constructor', () => {
	it( 'should set configurations', () => {
		expect( config ).to.have.property( 'test' ).to.equal( 1 );
	} );
} );

describe( 'get', () => {
	it( 'should retrieve a configuration', () => {
		expect( config.get( 'test' ) ).to.equal( 1 );
	} );

	it( 'should fallback to CKEDITOR.config', () => {
		CKEDITOR.config.set( {
			globalConfig: 2
		} );

		expect( config.get( 'globalConfig' ) ).to.equal( 2 );
	} );

	it( 'should throw an error for non existing configuration', () => {
		expect( () => {
			config.get( 'invalid' );
		} ).to.throw( CKEditorError, /config-undefined-option/ );
	} );

	it( 'should throw an error if error is not a CKEditorError instance ' +
		'and does not have name `config-undefined-option`',
		() => {
			expect( () => {
				config.get( new Map() );
			} ).to.throw( TypeError );
		}
	);
} );
