/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import IconView from '../../src/icon/iconview';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';

describe( 'IconView', () => {
	let view;

	beforeEach( () => {
		view = new IconView();
		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'sets #content', () => {
			expect( view.content ).to.equal( '' );
		} );

		it( 'sets #viewBox', () => {
			expect( view.viewBox ).to.equal( '0 0 20 20' );
		} );

		it( 'sets #fillColor', () => {
			expect( view.fillColor ).to.equal( '' );
		} );

		it( 'creates element from template', () => {
			expect( view.element.tagName ).to.equal( 'svg' );
			expect( view.element.getAttribute( 'class' ) ).to.equal( 'ck-icon' );
			expect( view.element.getAttribute( 'viewBox' ) ).to.equal( '0 0 20 20' );
		} );
	} );

	describe( '<svg> bindings', () => {
		describe( 'viewBox', () => {
			it( 'should react to changes in view#viewBox', () => {
				expect( view.element.getAttribute( 'viewBox' ) ).to.equal( '0 0 20 20' );

				view.viewBox = '1 2 3 4';

				expect( view.element.getAttribute( 'viewBox' ) ).to.equal( '1 2 3 4' );
			} );
		} );

		describe( 'inline svg', () => {
			it( 'should react to changes in view#content', () => {
				expect( normalizeHtml( view.element.innerHTML ) ).to.equal( '' );

				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="test"></g></svg>';
				expect( normalizeHtml( view.element.innerHTML ) ).to.equal( '<g id="test"></g>' );

				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>';
				expect( normalizeHtml( view.element.innerHTML ) ).to.equal( '' );
			} );

			it( 'works for #content with more than <svg> declaration', () => {
				expect( normalizeHtml( view.element.innerHTML ) ).to.equal( '' );

				view.content =
					'<?xml version="1.0" encoding="utf-8"?><svg version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="test"></g></svg>';
				expect( normalizeHtml( view.element.innerHTML ) ).to.equal( '<g id="test"></g>' );
			} );

			it( 'should respect parsed <svg>\'s viewBox attribute', () => {
				expect( normalizeHtml( view.element.innerHTML ) ).to.equal( '' );

				view.content = '<svg version="1.1" viewBox="10 20 30 40" xmlns="http://www.w3.org/2000/svg"><g id="test"></g></svg>';
				expect( view.viewBox ).to.equal( '10 20 30 40' );
			} );
		} );

		describe( 'fill color', () => {
			it( 'should be set intially based on view#fillColor', () => {
				view.fillColor = 'red';

				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
					'<path class="ck-icon__fill"></path><path></path><path class="ck-icon__fill"></path></svg>';

				expect( normalizeHtml( view.element.innerHTML ) )
					.to.equal( '<path class="ck-icon__fill" style="fill:red"></path>' +
						'<path></path>' +
						'<path class="ck-icon__fill" style="fill:red"></path>' );
			} );

			it( 'should react to changes in view#fillColor', () => {
				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
					'<path class="ck-icon__fill"></path><path></path><path class="ck-icon__fill"></path></svg>';

				expect( normalizeHtml( view.element.innerHTML ) )
					.to.equal( '<path class="ck-icon__fill"></path><path></path><path class="ck-icon__fill"></path>' );

				view.fillColor = 'red';
				expect( normalizeHtml( view.element.innerHTML ) )
					.to.equal( '<path class="ck-icon__fill" style="fill:red"></path>' +
						'<path></path>' +
						'<path class="ck-icon__fill" style="fill:red"></path>' );
			} );

			it( 'should react to changes in view#content', () => {
				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
					'<path class="ck-icon__fill"></path><path></path><path class="ck-icon__fill"></path></svg>';
				view.fillColor = 'red';

				expect( normalizeHtml( view.element.innerHTML ) )
					.to.equal( '<path class="ck-icon__fill" style="fill:red"></path>' +
						'<path></path>' +
						'<path class="ck-icon__fill" style="fill:red"></path>' );

				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
					'<path></path><path class="ck-icon__fill"></path></svg>';

				expect( normalizeHtml( view.element.innerHTML ) )
					.to.equal( '<path></path><path class="ck-icon__fill" style="fill:red"></path>' );
			} );
		} );
	} );
} );
