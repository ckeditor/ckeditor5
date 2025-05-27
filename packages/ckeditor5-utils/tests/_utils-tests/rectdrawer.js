/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Rect from '../../src/dom/rect.js';
import createElement from '../../src/dom/createelement.js';
import RectDrawer from '../../tests/_utils/rectdrawer.js';

const DEFAULT_STYLES = 'position: fixed; ' +
	'outline: blue solid 1px; ' +
	'outline-offset: -1px; ' +
	'z-index: 999; ' +
	'opacity: 0.5; ' +
	'pointer-events: none; ';

describe( 'utils', () => {
	describe( 'RectDrawer', () => {
		describe( 'draw()', () => {
			afterEach( () => {
				RectDrawer.clear();
			} );

			it( 'should draw a Rect', () => {
				const domElement = createElement( document, 'div' );

				Object.assign( domElement.style, {
					top: '123px',
					left: '456px',
					position: 'absolute',
					width: '100px',
					height: '100px'
				} );

				document.body.appendChild( domElement );

				const rect = new Rect( domElement );

				RectDrawer.draw( rect );

				domElement.remove();

				const rectPreview = document.querySelector( '.ck-rect-drawer-preview' );

				expect( rectPreview.outerHTML ).to.equal(
					'<div ' +
						'class="ck-rect-drawer-preview" ' +
						'style="' +
							DEFAULT_STYLES +
							'top: 123px; ' +
							'left: 456px; ' +
							'width: 100px; ' +
							'height: 100px;' +
						'">' +
					'</div>'
				);
			} );

			it( 'should draw a Rect with custom styles', () => {
				const domElement = createElement( document, 'div' );

				Object.assign( domElement.style, {
					top: '123px',
					left: '456px',
					position: 'absolute',
					width: '100px',
					height: '100px'
				} );

				document.body.appendChild( domElement );

				const rect = new Rect( domElement );

				RectDrawer.draw( rect, { border: '1px solid red' } );

				domElement.remove();

				const rectPreview = document.querySelector( '.ck-rect-drawer-preview' );

				expect( rectPreview.outerHTML ).to.equal(
					'<div ' +
						'class="ck-rect-drawer-preview" ' +
						'style="' +
							DEFAULT_STYLES +
							'top: 123px; ' +
							'left: 456px; ' +
							'width: 100px; ' +
							'height: 100px; ' +
							'border: 1px solid red;' +
						'">' +
					'</div>'
				);
			} );

			it( 'should draw a Rect with a name', () => {
				const domElement = createElement( document, 'div' );

				Object.assign( domElement.style, {
					top: '123px',
					left: '456px',
					position: 'absolute',
					width: '100px',
					height: '100px'
				} );

				document.body.appendChild( domElement );

				const rect = new Rect( domElement );

				RectDrawer.draw( rect, null, 'foo' );

				domElement.remove();

				const rectPreview = document.querySelector( '.ck-rect-drawer-preview' );

				expect( rectPreview.outerHTML ).to.equal(
					'<div ' +
						'class="ck-rect-drawer-preview" ' +
						'data-name="foo" ' +
						'style="' +
							DEFAULT_STYLES +
							'top: 123px; ' +
							'left: 456px; ' +
							'width: 100px; ' +
							'height: 100px;' +
						'">' +
					'</div>'
				);
			} );
		} );
	} );
} );
