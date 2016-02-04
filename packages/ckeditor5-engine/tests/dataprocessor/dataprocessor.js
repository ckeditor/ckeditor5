/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import DataProcessor from '/ckeditor5/core/dataprocessor/dataprocessor.js';

describe( 'DataProcessor', () => {
	const config = {
		option: 'test'
	};
	const dataProcessor = new DataProcessor( config );

	describe( 'constructor', () => {
		it( 'should set the `config` property', () => {
			expect( dataProcessor ).to.have.property( 'config' );
			expect( dataProcessor.config.get( 'option' ) ).to.equal( 'test' );
		} );
	} );

	describe( 'toData', () => {
		it( 'should be defined', () => {
			expect( dataProcessor.toData ).to.be.function;
		} );
	} );

	describe( 'toDom', () => {
		it( 'should be defined', () => {
			expect( dataProcessor.toDom ).to.be.function;
		} );
	} );
} );
