/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { WidgetResizeState } from '../../src/widgetresize/resizerstate.js';

describe( 'ResizerState', () => {
	describe( 'constructor', () => {
		it( 'sets up proper default values', () => {
			const state = new WidgetResizeState();

			expect( state.activeHandlePosition, 'activeHandlePosition' ).toBeNull();
			expect( state.proposedWidthPercents, 'proposedWidthPercents' ).toBeNull();
			expect( state.proposedWidth, 'proposedWidth' ).toBeNull();
			expect( state.proposedHeight, 'proposedHeight' ).toBeNull();
			expect( state.proposedHandleHostWidth, 'proposedHandleHostWidth' ).toBeNull();
			expect( state.proposedHandleHostHeight, 'proposedHandleHostHeight' ).toBeNull();
		} );

		it( 'sets up observable properties', () => {
			const state = new WidgetResizeState();

			expect( isObservable( 'activeHandlePosition' ), 'activeHandlePosition' ).toBe( true );
			expect( isObservable( 'proposedWidthPercents' ), 'proposedWidthPercents' ).toBe( true );
			expect( isObservable( 'proposedWidth' ), 'proposedWidth' ).toBe( true );
			expect( isObservable( 'proposedHeight' ), 'proposedHeight' ).toBe( true );
			expect( isObservable( 'proposedHandleHostWidth' ), 'proposedHandleHostWidth' ).toBe( true );
			expect( isObservable( 'proposedHandleHostHeight' ), 'proposedHandleHostHeight' ).toBe( true );

			function isObservable( propertyName ) {
				const listener = vi.fn();
				state.on( `change:${ propertyName }`, listener );
				state[ propertyName ] = true;

				return listener.mock.calls.length === 1;
			}
		} );
	} );

	describe( 'begin()', () => {
		const domContentWrapper = document.createElement( 'div' );

		beforeAll( () => {
			const htmlMockup = `<div class="dom-element" style="width: 25%;">
				<div class="ck ck-reset_all ck-widget__resizer" style="width: 400px; height: 200px;">
					<div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-right"></div>
				</div>
			</div>`;

			domContentWrapper.style.width = '1600px';
			domContentWrapper.innerHTML = htmlMockup;
			document.body.append( domContentWrapper );
		} );

		afterAll( () => {
			domContentWrapper.remove();
		} );

		it( 'fetches sizes of real DOM elements', () => {
			const domResizeHandle = domContentWrapper.querySelector( '.ck-widget__resizer__handle' );
			const domHandleHost = domContentWrapper.querySelector( '.dom-element' );
			const domResizeHost = domHandleHost;

			const state = new WidgetResizeState();
			state.begin( domResizeHandle, domHandleHost, domResizeHost );

			expect( state.activeHandlePosition, 'activeHandlePosition' ).toBe( 'bottom-right' );

			expect( state.originalWidth, 'originalWidth' ).toBe( 400 );
			expect( state.originalHeight, 'originalHeight' ).toBe( 200 );

			expect( state.aspectRatio, 'aspectRatio' ).toBe( 2 );

			expect( state.originalWidthPercents, 'originalWidthPercents' ).toBe( 25 );
		} );
	} );

	describe( 'width percents calculations ', () => {
		const domContentWrapper = document.createElement( 'span' );

		beforeAll( () => {
			const htmlMockup = `<div class="dom-element">
				<div class="ck ck-reset_all ck-widget__resizer" style="width: 400px; height: 200px;">
					<div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-right"></div>
				</div>
			</div>`;

			domContentWrapper.style.width = 'auto';
			domContentWrapper.innerHTML = htmlMockup;
		} );

		it( 'should not return NaN if resizer is inside a <span>', () => {
			document.body.append( domContentWrapper );

			const domResizeHandle = domContentWrapper.querySelector( '.ck-widget__resizer__handle' );
			const domHandleHost = domContentWrapper.querySelector( '.dom-element' );
			const domResizeHost = domHandleHost;

			const state = new WidgetResizeState();
			state.begin( domResizeHandle, domHandleHost, domResizeHost );

			expect( state.originalWidthPercents, 'originalWidthPercents' ).not.toBeNaN();
			expect( state.originalWidthPercents, 'originalWidthPercents' ).toBe( 100 );
			domContentWrapper.remove();
		} );

		it( 'should return 0 if cannot calculate width from 5 ancestors', () => {
			let elem = domContentWrapper;
			for ( let i = 0; i < 5; i++ ) {
				const e = document.createElement( 'span' );
				e.appendChild( elem );
				elem = e;
			}
			document.body.append( elem );

			const domResizeHandle = domContentWrapper.querySelector( '.ck-widget__resizer__handle' );
			const domHandleHost = domContentWrapper.querySelector( '.dom-element' );
			const domResizeHost = domHandleHost;

			const state = new WidgetResizeState();
			state.begin( domResizeHandle, domHandleHost, domResizeHost );

			expect( state.originalWidthPercents, 'originalWidthPercents' ).not.toBeNaN();
			expect( state.originalWidthPercents, 'originalWidthPercents' ).toBe( 0 );
			elem.remove();
		} );
	} );

	describe( 'update()', () => {
		it( 'changes the properties', () => {
			const state = new WidgetResizeState();

			state.update( {
				width: 100,
				height: 200,
				widthPercents: 25,
				handleHostWidth: 80,
				handleHostHeight: 160
			} );

			expect( state.proposedWidthPercents, 'proposedWidthPercents' ).toBe( 25 );
			expect( state.proposedWidth, 'proposedWidth' ).toBe( 100 );
			expect( state.proposedHeight, 'proposedHeight' ).toBe( 200 );
			expect( state.proposedHandleHostWidth, 'proposedHandleHostWidth' ).toBe( 80 );
			expect( state.proposedHandleHostHeight, 'proposedHandleHostHeight' ).toBe( 160 );
		} );
	} );
} );
