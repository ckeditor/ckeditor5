/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import IconView from '../../src/icon/iconview.js';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml.js';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';

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

		it( 'sets #isColorInherited', () => {
			expect( view.isColorInherited ).to.be.true;
		} );

		it( 'sets #isVisible', () => {
			expect( view.isVisible ).to.be.true;
		} );

		it( 'creates element from template', () => {
			expect( view.element.tagName ).to.equal( 'svg' );
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-icon' ) ).to.be.true;
			expect( view.element.getAttribute( 'viewBox' ) ).to.equal( '0 0 20 20' );
			expect( view.element.getAttribute( 'aria-hidden' ) ).to.equal( 'true' );
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

		describe( 'color inheritance CSS class', () => {
			it( 'should toggle depending view#isColorInherited', () => {
				expect( view.element.classList.contains( 'ck-icon_inherit-color' ) ).to.be.true;

				view.isColorInherited = false;
				expect( view.element.classList.contains( 'ck-icon_inherit-color' ) ).to.be.false;

				view.isColorInherited = true;
				expect( view.element.classList.contains( 'ck-icon_inherit-color' ) ).to.be.true;
			} );
		} );

		describe( '#isVisible', () => {
			it( 'should react to changes in view#isVisible', () => {
				view.isVisible = true;

				expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.false;

				view.isVisible = false;

				expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.true;
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

			it( 'should use removeChild instead of innerHTML', () => {
				view.content = '<svg><g id="test"></g><g id="test"></g></svg>';
				assertIconInnerHTML( view, '<g id="test"></g><g id="test"></g>' );

				const innerHTMLSpy = sinon.spy( view.element, 'innerHTML', [ 'set' ] );
				const removeChildSpy = sinon.spy( view.element, 'removeChild' );

				view.content = '<svg><g id="test"></g></svg>';
				assertIconInnerHTML( view, '<g id="test"></g>' );

				sinon.assert.notCalled( innerHTMLSpy.set );
				sinon.assert.calledTwice( removeChildSpy );
			} );

			it( 'should throw an error on invalid SVG', () => {
				expect( () => {
					view.content = 'foo';
				} ).to.throw( CKEditorError, 'ui-iconview-invalid-svg' );
			} );

			describe( 'preservation of presentational attributes on the <svg> element', () => {
				it( 'should use the static list of attributes from the IconView class', () => {
					expect( IconView.presentationalAttributeNames ).to.have.length( 58 );
				} );

				for ( const attributeName of IconView.presentationalAttributeNames ) {
					it( `should work for the "${ attributeName }" attribute`, () => {
						view.content = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" ${ attributeName }="${ attributeName }-value">
							<g id="test"></g>
						</svg>`;

						expect( view.element.getAttribute( attributeName ), attributeName ).to.equal( attributeName + '-value' );
					} );
				}
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
	expect( normalizeHtml( icon.element.innerHTML ) )
		.to.equal( expected );
}
