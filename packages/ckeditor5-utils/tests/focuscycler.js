/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewCollection from 'ckeditor5-ui/src/viewcollection';
import View from 'ckeditor5-ui/src/view';
import FocusCycler from 'ckeditor5-utils/src/focuscycler';

describe( 'FocusCycler', () => {
	let viewCollection, focusTracker, cycler;

	beforeEach( () => {
		viewCollection = new ViewCollection();
		focusTracker = {
			focusedElement: null
		};
		cycler = new FocusCycler( viewCollection, focusTracker );

		viewCollection.add( nonFocusable() );
		viewCollection.add( focusable() );
		viewCollection.add( focusable() );
		viewCollection.add( focusable() );
		viewCollection.add( nonFocusable() );
	} );

	describe( 'constructor()', () => {
		it( 'sets class properties', () => {
			expect( cycler.viewCollection ).to.equal( viewCollection );
			expect( cycler.focusTracker ).to.equal( focusTracker );
		} );
	} );

	describe( 'current()', () => {
		it( 'returns null when no view is focused', () => {
			expect( cycler.current ).to.equal( null );

			focusTracker.focusedElement = viewCollection.get( 2 ).element;
			expect( cycler.current ).to.equal( 2 );

			focusTracker.focusedElement = null;
			expect( cycler.current ).to.equal( null );
		} );
	} );

	describe( 'first()', () => {
		it( 'returns first focusable view', () => {
			expect( cycler.first ).to.equal( viewCollection.get( 1 ) );
		} );

		it( 'returns null when no focusable items', () => {
			viewCollection = new ViewCollection();
			cycler = new FocusCycler( viewCollection, focusTracker );

			viewCollection.add( nonFocusable() );
			viewCollection.add( nonFocusable() );

			expect( cycler.first ).to.be.null;
		} );

		it( 'returns null when no items', () => {
			viewCollection = new ViewCollection();
			cycler = new FocusCycler( viewCollection, focusTracker );

			expect( cycler.first ).to.be.null;
		} );
	} );

	describe( 'next()', () => {
		it( 'cycles to return the next focusable view', () => {
			focusTracker.focusedElement = viewCollection.get( 2 ).element;
			expect( cycler.next ).to.equal( viewCollection.get( 3 ) );

			focusTracker.focusedElement = viewCollection.get( 3 ).element;
			expect( cycler.next ).to.equal( viewCollection.get( 1 ) );

			focusTracker.focusedElement = viewCollection.get( 1 ).element;
			expect( cycler.next ).to.equal( viewCollection.get( 2 ) );
		} );

		it( 'returns null when no view is focused', () => {
			focusTracker.focusedElement = null;

			expect( cycler.next ).to.be.null;
		} );

		it( 'returns null when no items', () => {
			viewCollection = new ViewCollection();
			cycler = new FocusCycler( viewCollection, focusTracker );

			expect( cycler.next ).to.be.null;
		} );

		it( 'returns null when no focusable items', () => {
			viewCollection = new ViewCollection();
			cycler = new FocusCycler( viewCollection, focusTracker );

			viewCollection.add( nonFocusable() );
			viewCollection.add( nonFocusable() );

			expect( cycler.next ).to.be.null;
		} );

		it( 'returns null if the only focusable in viewCollection', () => {
			viewCollection = new ViewCollection();
			cycler = new FocusCycler( viewCollection, focusTracker );

			viewCollection.add( nonFocusable() );
			viewCollection.add( focusable() );
			viewCollection.add( nonFocusable() );

			focusTracker.focusedElement = viewCollection.get( 1 ).element;

			expect( cycler.first ).to.equal( viewCollection.get( 1 ) );
			expect( cycler.next ).to.be.null;
		} );
	} );

	describe( 'previous()', () => {
		it( 'cycles to return the previous focusable view', () => {
			focusTracker.focusedElement = viewCollection.get( 1 ).element;
			expect( cycler.previous ).to.equal( viewCollection.get( 3 ) );

			focusTracker.focusedElement = viewCollection.get( 2 ).element;
			expect( cycler.previous ).to.equal( viewCollection.get( 1 ) );

			focusTracker.focusedElement = viewCollection.get( 3 ).element;
			expect( cycler.previous ).to.equal( viewCollection.get( 2 ) );
		} );

		it( 'returns null when no view is focused', () => {
			focusTracker.focusedElement = null;

			expect( cycler.previous ).to.be.null;
		} );

		it( 'returns null when no items', () => {
			viewCollection = new ViewCollection();
			cycler = new FocusCycler( viewCollection, focusTracker );

			expect( cycler.previous ).to.be.null;
		} );

		it( 'returns null when no focusable items', () => {
			viewCollection = new ViewCollection();
			cycler = new FocusCycler( viewCollection, focusTracker );

			viewCollection.add( nonFocusable() );
			viewCollection.add( nonFocusable() );

			expect( cycler.previous ).to.be.null;
		} );

		it( 'returns null if the only focusable in viewCollection', () => {
			viewCollection = new ViewCollection();
			cycler = new FocusCycler( viewCollection, focusTracker );

			viewCollection.add( nonFocusable() );
			viewCollection.add( focusable() );
			viewCollection.add( nonFocusable() );

			focusTracker.focusedElement = viewCollection.get( 1 ).element;

			expect( cycler.first ).to.equal( viewCollection.get( 1 ) );
			expect( cycler.previous ).to.be.null;
		} );
	} );
} );

function focusable() {
	const view = new View();

	view.focus = () => {};
	view.element = {};

	return view;
}

function nonFocusable() {
	return new View();
}
