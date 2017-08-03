/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import TooltipView from '../../src/tooltip/tooltipview';

describe( 'TooltipView', () => {
	let view, text;

	beforeEach( () => {
		view = new TooltipView();
		text = view.element.firstChild;
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.tagName ).to.equal( 'SPAN' );
			expect( view.element.classList.contains( 'ck-tooltip' ) ).to.be.true;
			expect( view.element.childNodes ).to.have.length( 1 );

			expect( text.tagName ).to.equal( 'SPAN' );
			expect( text.classList.contains( 'ck-tooltip__text' ) ).to.be.true;
		} );

		it( 'should set default #position', () => {
			expect( view.position ).to.equal( 's' );
		} );
	} );

	describe( 'DOM bindings', () => {
		beforeEach( () => {
			view.text = 'foo';
		} );

		describe( 'text content', () => {
			it( 'should react on view#text', () => {
				expect( text.textContent ).to.equal( 'foo' );

				view.text = 'baz';

				expect( text.textContent ).to.equal( 'baz' );
			} );
		} );

		describe( 'class', () => {
			it( 'should react on view#text', () => {
				expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.false;

				view.text = '';

				expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.true;
			} );

			it( 'should react on view#position', () => {
				expect( view.element.classList.contains( 'ck-tooltip_n' ) ).to.be.false;
				expect( view.element.classList.contains( 'ck-tooltip_s' ) ).to.be.true;

				view.position = 'n';

				expect( view.element.classList.contains( 'ck-tooltip_n' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-tooltip_s' ) ).to.be.false;
			} );
		} );
	} );
} );
