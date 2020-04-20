/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-icon' ) ).to.be.true;
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
				assertIconInnerHTML( view, '' );

				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="test"></g></svg>';
				assertIconInnerHTML( view, '<g id="test"></g>' );

				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>';
				assertIconInnerHTML( view, '' );
			} );

			it( 'works for #content with more than <svg> declaration', () => {
				assertIconInnerHTML( view, '' );

				view.content =
					'<?xml version="1.0" encoding="utf-8"?><svg version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="test"></g></svg>';
				assertIconInnerHTML( view, '<g id="test"></g>' );
			} );

			it( 'should respect parsed <svg>\'s viewBox attribute', () => {
				assertIconInnerHTML( view, '' );

				view.content = '<svg version="1.1" viewBox="10 20 30 40" xmlns="http://www.w3.org/2000/svg"><g id="test"></g></svg>';
				expect( view.viewBox ).to.equal( '10 20 30 40' );
			} );
		} );

		describe( 'fill color', () => {
			it( 'should be set intially based on view#fillColor', () => {
				view.fillColor = 'red';
				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
						'<path class="ck-icon__fill"/>' +
						'<path/>' +
						'<path class="ck-icon__fill"/>' +
					'</svg>';

				expect( view.element.children[ 0 ].style.fill ).to.equal( 'red' );
				expect( view.element.children[ 1 ].style.fill ).to.equal( '' );
				expect( view.element.children[ 2 ].style.fill ).to.equal( 'red' );
			} );

			it( 'should react to changes in view#fillColor', () => {
				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
						'<path class="ck-icon__fill"/>' +
						'<path/>' +
						'<path class="ck-icon__fill"/>' +
					'</svg>';

				expect( view.element.children[ 0 ].style.fill ).to.equal( '' );
				expect( view.element.children[ 1 ].style.fill ).to.equal( '' );
				expect( view.element.children[ 2 ].style.fill ).to.equal( '' );

				view.fillColor = 'red';

				expect( view.element.children[ 0 ].style.fill ).to.equal( 'red' );
				expect( view.element.children[ 1 ].style.fill ).to.equal( '' );
				expect( view.element.children[ 2 ].style.fill ).to.equal( 'red' );
			} );

			it( 'should react to changes in view#content', () => {
				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
						'<path class="ck-icon__fill"/>' +
						'<path/>' +
						'<path class="ck-icon__fill"/>' +
					'</svg>';

				view.fillColor = 'red';

				expect( view.element.children[ 0 ].style.fill ).to.equal( 'red' );
				expect( view.element.children[ 1 ].style.fill ).to.equal( '' );
				expect( view.element.children[ 2 ].style.fill ).to.equal( 'red' );

				view.content = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">' +
						'<path/>' +
						'<path class="ck-icon__fill"/>' +
					'</svg>';

				expect( view.element.children[ 0 ].style.fill ).to.equal( '' );
				expect( view.element.children[ 1 ].style.fill ).to.equal( 'red' );
			} );
		} );
	} );
} );

function assertIconInnerHTML( icon, expected ) {
	// Edge adds the xmlns attribute to each node when obtaining from parent's innerHTML.
	expect( normalizeHtml( icon.element.innerHTML.replace( /xmlns="[^"]+"/, '' ) ) )
		.to.equal( expected );
}
