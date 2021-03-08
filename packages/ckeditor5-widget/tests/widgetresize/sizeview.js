/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import SizeView from '../../src/widgetresize/sizeview';
import ResizerState from '../../src/widgetresize/resizerstate';

describe( 'SizeView', () => {
	describe( 'activeHandlePosition', () => {
		let sizeView, state;

		beforeEach( async () => {
			state = new ResizerState();
			sizeView = new SizeView();

			sizeView.bindToState( {}, state );
			sizeView.render();
		} );

		it( 'should have valid `activeHandlePosition` property and class if the widget width is smaller than 50px', () => {
			state.activeHandlePosition = 'top-right';
			state.update( {
				handleHostWidth: 49,
				handleHostHeight: 200
			} );

			expect( sizeView.activeHandlePosition ).to.equal( 'above-center' );
			expect( sizeView.element.classList.contains( 'ck-orientation-above-center' ) ).to.be.true;
		} );

		it( 'should have the proper `activeHandlePosition` property and class if the widget height is smaller than 50px', () => {
			state.activeHandlePosition = 'top-right';
			state.update( {
				handleHostWidth: 200,
				handleHostHeight: 49
			} );

			expect( sizeView.activeHandlePosition ).to.equal( 'above-center' );
			expect( sizeView.element.classList.contains( 'ck-orientation-above-center' ) ).to.be.true;
		} );

		it( 'should have the proper `activeHandlePosition` property and class if the widget width is bigger than 50px/50px', () => {
			const position = 'top-right';

			state.activeHandlePosition = position;
			state.update( {
				handleHostWidth: 200,
				handleHostHeight: 200
			} );

			expect( sizeView.activeHandlePosition ).to.equal( position );
			expect( sizeView.element.classList.contains( `ck-orientation-${ position }` ) ).to.be.true;
		} );
	} );
} );
