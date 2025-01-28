/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { View, ViewCollection } from '../../src/index.js';
import DialogContentView from '../../src/dialog/dialogcontentview.js';

describe( 'DialogContentView', () => {
	let view;

	beforeEach( () => {
		view = new DialogContentView();

		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should have a CSS class', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-dialog__content' ) ).to.be.true;
		} );

		it( 'should have a collection of #children', () => {
			expect( view.children ).to.be.an.instanceof( ViewCollection );
		} );

		it( 'should bind the #children collection to the DOM', () => {
			const childView = new View();
			childView.setTemplate( { tag: 'div' } );

			view.children.add( childView );

			expect( view.element.firstElementChild ).to.equal( childView.element );
		} );
	} );

	describe( 'reset()', () => {
		it( 'should remove all #children', () => {
			const childViewA = new View();
			const childViewB = new View();
			childViewA.setTemplate( { tag: 'div' } );
			childViewB.setTemplate( { tag: 'div' } );

			view.children.add( childViewA );
			view.children.add( childViewB );

			expect( view.element.childElementCount ).to.equal( 2 );
			view.reset();
			expect( view.element.childElementCount ).to.equal( 0 );
		} );
	} );
} );
