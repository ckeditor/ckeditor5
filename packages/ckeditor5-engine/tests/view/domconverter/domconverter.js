/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, domconverter */

'use strict';

import DomConverter from '/ckeditor5/engine/view/domconverter.js';
import { BR_FILLER, NBSP_FILLER } from '/ckeditor5/engine/view/filler.js';

describe( 'DomConverter', () => {
	let converter;

	before( () => {
		converter = new DomConverter();
	} );

	describe( 'constructor', () => {
		it( 'should create converter with BR block filler by default', () => {
			converter = new DomConverter();
			expect( converter.blockFiller ).to.equal( BR_FILLER );
		} );

		it( 'should create converter with defined block filler', () => {
			converter = new DomConverter( { blockFiller: NBSP_FILLER } );
			expect( converter.blockFiller ).to.equal( NBSP_FILLER );
		} );
	} );
} );
