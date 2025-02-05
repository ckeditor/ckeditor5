/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import SizeView from '../../src/widgetresize/sizeview.js';
import ResizerState from '../../src/widgetresize/resizerstate.js';

describe( 'SizeView', () => {
	let sizeView, state;

	beforeEach( () => {
		sizeView = new SizeView();
		state = new ResizerState();

		sizeView._bindToState( {}, state );
		sizeView.render();
	} );

	describe( 'constructor()', () => {
		it( 'sets a proper template structure', () => {
			const template = sizeView.template;

			expect( template.tag ).to.equal( 'div' );
			expect( template.attributes.class ).to.have.length( 3 ).and.include( 'ck', 'ck-size-view', '' );
			expect( template.attributes.style[ 0 ] ).to.have.property( 'display' );
			expect( template.children[ 0 ] ).to.have.property( 'text' );
		} );
	} );

	describe( 'view label', () => {
		it( 'should have proper text if the resizing unit is not pixels', () => {
			state.update( {
				handleHostWidth: 50,
				handleHostHeight: 50,
				widthPercents: 20
			} );

			expect( sizeView.element.innerText ).to.equal( '20%' );
		} );

		it( 'should have proper text if the resizing unit is pixels', () => {
			sizeView._dismiss();
			sizeView._bindToState( { unit: 'px' }, state );

			state.update( {
				handleHostWidth: 50,
				handleHostHeight: 50,
				widthPercents: 20
			} );

			expect( sizeView.element.innerText ).to.equal( '50×50' );
		} );
	} );

	describe( 'view visibility', () => {
		it( 'should not be visible if the state proposedHeight and proposedWidth are null', () => {
			state.update( {
				width: null,
				height: null
			} );

			expect( sizeView.element.style.display ).to.equal( 'none' );
		} );

		it( 'should be visible if the state proposedHeight and proposedWidth are not null', () => {
			state.update( {
				width: 50,
				height: 50
			} );

			expect( sizeView.element.style.display ).to.equal( '' );
		} );
	} );

	describe( 'view position', () => {
		it( 'should have a valid class if the widget width is less than 50px', () => {
			state.activeHandlePosition = 'top-right';
			state.update( {
				handleHostWidth: 49,
				handleHostHeight: 200
			} );

			expect( sizeView.element.classList.contains( 'ck-orientation-above-center' ) ).to.be.true;
		} );

		it( 'should have a valid class if the widget height is less than 50px', () => {
			state.activeHandlePosition = 'top-right';
			state.update( {
				handleHostWidth: 200,
				handleHostHeight: 49
			} );

			expect( sizeView.element.classList.contains( 'ck-orientation-above-center' ) ).to.be.true;
		} );

		it( 'should have a valid class if the widget dimensions are greater than 50px/50px', () => {
			const position = 'top-right';

			state.activeHandlePosition = position;
			state.update( {
				handleHostWidth: 200,
				handleHostHeight: 200
			} );

			expect( sizeView.element.classList.contains( `ck-orientation-${ position }` ) ).to.be.true;
		} );
	} );
} );
