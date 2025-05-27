/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ResizerState from '../../src/widgetresize/resizerstate.js';

describe( 'ResizerState', () => {
	describe( 'constructor', () => {
		it( 'sets up proper default values', () => {
			const state = new ResizerState();

			expect( state.activeHandlePosition, 'activeHandlePosition' ).to.be.null;
			expect( state.proposedWidthPercents, 'proposedWidthPercents' ).to.be.null;
			expect( state.proposedWidth, 'proposedWidth' ).to.be.null;
			expect( state.proposedHeight, 'proposedHeight' ).to.be.null;
			expect( state.proposedHandleHostWidth, 'proposedHandleHostWidth' ).to.be.null;
			expect( state.proposedHandleHostHeight, 'proposedHandleHostHeight' ).to.be.null;
		} );

		it( 'sets up observable properties', () => {
			const state = new ResizerState();

			expect( isObservable( 'activeHandlePosition' ), 'activeHandlePosition' ).to.be.true;
			expect( isObservable( 'proposedWidthPercents' ), 'proposedWidthPercents' ).to.be.true;
			expect( isObservable( 'proposedWidth' ), 'proposedWidth' ).to.be.true;
			expect( isObservable( 'proposedHeight' ), 'proposedHeight' ).to.be.true;
			expect( isObservable( 'proposedHandleHostWidth' ), 'proposedHandleHostWidth' ).to.be.true;
			expect( isObservable( 'proposedHandleHostHeight' ), 'proposedHandleHostHeight' ).to.be.true;

			function isObservable( propertyName ) {
				const listener = sinon.stub();
				state.on( `change:${ propertyName }`, listener );
				state[ propertyName ] = true;

				return listener.calledOnce;
			}
		} );
	} );

	describe( 'begin()', () => {
		const domContentWrapper = document.createElement( 'div' );

		before( () => {
			const htmlMockup = `<div class="dom-element" style="width: 25%;">
				<div class="ck ck-reset_all ck-widget__resizer" style="width: 400px; height: 200px;">
					<div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-right"></div>
				</div>
			</div>`;

			domContentWrapper.style.width = '1600px';
			domContentWrapper.innerHTML = htmlMockup;
			document.body.append( domContentWrapper );
		} );

		after( () => {
			domContentWrapper.remove();
		} );

		it( 'fetches sizes of real DOM elements', () => {
			const domResizeHandle = domContentWrapper.querySelector( '.ck-widget__resizer__handle' );
			const domHandleHost = domContentWrapper.querySelector( '.dom-element' );
			const domResizeHost = domHandleHost;

			const state = new ResizerState();
			state.begin( domResizeHandle, domHandleHost, domResizeHost );

			expect( state.activeHandlePosition, 'activeHandlePosition' ).to.equal( 'bottom-right' );

			expect( state.originalWidth, 'originalWidth' ).to.equal( 400 );
			expect( state.originalHeight, 'originalHeight' ).to.equal( 200 );

			expect( state.aspectRatio, 'aspectRatio' ).to.equal( 2 );

			expect( state.originalWidthPercents, 'originalWidthPercents' ).to.equal( 25 );
		} );
	} );

	describe( 'width percents calculations ', () => {
		const domContentWrapper = document.createElement( 'span' );

		before( () => {
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

			const state = new ResizerState();
			state.begin( domResizeHandle, domHandleHost, domResizeHost );

			expect( state.originalWidthPercents, 'originalWidthPercents' ).to.not.be.NaN;
			expect( state.originalWidthPercents, 'originalWidthPercents' ).to.equal( 100 );
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

			const state = new ResizerState();
			state.begin( domResizeHandle, domHandleHost, domResizeHost );

			expect( state.originalWidthPercents, 'originalWidthPercents' ).to.not.be.NaN;
			expect( state.originalWidthPercents, 'originalWidthPercents' ).to.equal( 0 );
			elem.remove();
		} );
	} );

	describe( 'update()', () => {
		it( 'changes the properties', () => {
			const state = new ResizerState();

			state.update( {
				width: 100,
				height: 200,
				widthPercents: 25,
				handleHostWidth: 80,
				handleHostHeight: 160
			} );

			expect( state.proposedWidthPercents, 'proposedWidthPercents' ).to.equal( 25 );
			expect( state.proposedWidth, 'proposedWidth' ).to.equal( 100 );
			expect( state.proposedHeight, 'proposedHeight' ).to.equal( 200 );
			expect( state.proposedHandleHostWidth, 'proposedHandleHostWidth' ).to.equal( 80 );
			expect( state.proposedHandleHostHeight, 'proposedHandleHostHeight' ).to.equal( 160 );
		} );
	} );
} );
