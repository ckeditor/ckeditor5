/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import InputView from '../../src/input/inputview.js';
import InputTextView from '../../src/inputtext/inputtextview.js';

describe( 'InputTextView', () => {
	let view;

	beforeEach( () => {
		view = new InputTextView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should extend InputView', () => {
			expect( view ).to.be.instanceOf( InputView );
		} );

		it( 'should creates element from template', () => {
			expect( view.element.getAttribute( 'type' ) ).to.equal( 'text' );
			expect( view.element.type ).to.equal( 'text' );
			expect( view.element.classList.contains( 'ck-input-text' ) ).to.be.true;
		} );
	} );
} );
