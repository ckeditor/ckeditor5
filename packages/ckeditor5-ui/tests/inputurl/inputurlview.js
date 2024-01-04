/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import InputView from '../../src/input/inputview.js';
import InputUrlView from '../../src/inputurl/inputurlview.js';

describe( 'InputUrlView', () => {
	let view;

	beforeEach( () => {
		view = new InputUrlView();
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
			expect( view.element.getAttribute( 'type' ) ).to.equal( 'url' );
			expect( view.element.type ).to.equal( 'url' );
			expect( view.element.classList.contains( 'ck-input-url' ) ).to.be.true;
		} );
	} );
} );
