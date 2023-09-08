/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import TextareaView from '../../src/textarea/textareaview';

describe( 'TextareaView', () => {
	let view;

	beforeEach( () => {
		view = new TextareaView();

		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).to.equal( 'TEXTAREA' );
			expect( view.element.getAttribute( 'type' ) ).to.be.null;
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-input' ) ).to.be.true;
		} );
	} );

	describe( 'DOM bindings', () => {
		beforeEach( () => {
			view.value = 'foo';
			view.id = 'bar';
		} );

		describe( 'rows attribute', () => {
			it( 'should react on view#inputMode', () => {
				expect( view.element.getAttribute( 'rows' ) ).to.equal( '1' );

				view.rows = 5;

				expect( view.element.getAttribute( 'rows' ) ).to.equal( '5' );
			} );
		} );
	} );
} );
