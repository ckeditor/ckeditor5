/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import isRange from '../../src/dom/isrange.js';
import global from '../../src/dom/global.js';

declare global {
	interface Window {
		expect: Function;
	}
}

/**
 * A helper that stubs DOM target's geometry (client rects and scroll) to be used in tests that verify UI behaviors.
 */
export function stubGeometry(
	testUtils: any,
	target: HTMLElement | Range,
	geometryStub: { top: number; left: number; bottom: number; right: number; width: number; height: number },
	scrollStub: { scrollTop: number; scrollLeft: number }
): void {
	if ( isRange( target ) ) {
		testUtils.sinon.stub( target, 'getClientRects' ).returns( [ geometryStub ] );
	} else {
		testUtils.sinon.stub( target, 'getBoundingClientRect' ).returns( geometryStub );

		// Make the element immune to the border-width-* styles in the test environment.
		Object.defineProperties( target, {
			offsetWidth: {
				value: geometryStub.width
			},
			clientWidth: {
				value: geometryStub.width
			},
			offsetHeight: {
				value: geometryStub.height
			},
			clientHeight: {
				value: geometryStub.height
			}
		} );
	}

	if ( scrollStub ) {
		let { scrollLeft, scrollTop } = scrollStub;

		// There's no way to stub scrollLeft|Top with Sinon. defineProperties
		// must be used instead.
		Object.defineProperties( target, {
			scrollLeft: {
				get() {
					return scrollLeft;
				},
				set( value ) {
					scrollLeft = value;
				},
				configurable: true
			},
			scrollTop: {
				get() {
					return scrollTop;
				},
				set( value ) {
					scrollTop = value;
				},
				configurable: true
			}
		} );
	}
}

/**
 * A helper that asserts HTML element's scroll* properties.
 */
export function assertScrollPosition( element: HTMLElement, expected: { scrollTop: number; scrollLeft: number } ): void {
	global.window.expect( element.scrollTop ).to.equal( expected.scrollTop, 'scrollTop' );
	global.window.expect( element.scrollLeft ).to.equal( expected.scrollLeft, 'scrollLeft' );
}
