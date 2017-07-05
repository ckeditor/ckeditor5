/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ViewCollection from '../../src/viewcollection';
import ListView from '../../src/list/listview';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '../../src/focuscycler';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import View from '../../src/view';

describe( 'ListView', () => {
	let view;

	beforeEach( () => {
		return ( view = new ListView() ).init();
	} );

	describe( 'constructor()', () => {
		it( 'creates element from template', () => {
			expect( view.element.classList.contains( 'ck-reset' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-list' ) ).to.be.true;
		} );

		it( 'creates view#children collection', () => {
			expect( view.items ).to.be.instanceOf( ViewCollection );
			expect( view.template.children ).to.have.length( 1 );
			expect( view.template.children.get( 0 ) ).to.equal( view.items );
		} );

		it( 'creates #focusTracker instance', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'creates #keystrokeHandler instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'creates #_focusCycler instance', () => {
			expect( view._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'registers #items in #focusTracker', () => {
			const spyAdd = sinon.spy( view.focusTracker, 'add' );
			const spyRemove = sinon.spy( view.focusTracker, 'remove' );

			view.items.add( focusable() );
			view.items.add( focusable() );

			sinon.assert.calledTwice( spyAdd );

			view.items.remove( 1 );
			sinon.assert.calledOnce( spyRemove );
		} );
	} );

	describe( 'init()', () => {
		it( 'starts listening for #keystrokes coming from #element', () => {
			view = new ListView();

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.init();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );
		} );

		describe( 'activates keyboard navigation for the list', () => {
			it( 'so "arrowup" focuses previous focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowup,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// No children to focus.
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				view.items.add( nonFocusable() );
				view.items.add( nonFocusable() );

				// No focusable children.
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledTwice( keyEvtData.preventDefault );
				sinon.assert.calledTwice( keyEvtData.stopPropagation );

				view.items.add( focusable() );
				view.items.add( nonFocusable() );
				view.items.add( focusable() );

				// Mock the last item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( 4 ).element;

				const spy = sinon.spy( view.items.get( 2 ), 'focus' );
				view.keystrokes.press( keyEvtData );

				sinon.assert.calledThrice( keyEvtData.preventDefault );
				sinon.assert.calledThrice( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "arrowdown" focuses next focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// No children to focus.
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				view.items.add( nonFocusable() );
				view.items.add( nonFocusable() );

				// No focusable children.
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledTwice( keyEvtData.preventDefault );
				sinon.assert.calledTwice( keyEvtData.stopPropagation );

				view.items.add( focusable() );
				view.items.add( nonFocusable() );
				view.items.add( focusable() );

				// Mock the last item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( 4 ).element;

				const spy = sinon.spy( view.items.get( 2 ), 'focus' );
				view.keystrokes.press( keyEvtData );

				sinon.assert.calledThrice( keyEvtData.preventDefault );
				sinon.assert.calledThrice( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first focusable item in DOM', () => {
			// No children to focus.
			view.focus();

			// The second child is focusable.
			view.items.add( nonFocusable() );
			view.items.add( focusable() );
			view.items.add( nonFocusable() );

			const spy = sinon.spy( view.items.get( 1 ), 'focus' );
			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'focusLast()', () => {
		it( 'focuses the last focusable item in DOM', () => {
			// No children to focus.
			view.focusLast();

			// The second child is focusable.
			view.items.add( nonFocusable() );
			view.items.add( focusable() );
			view.items.add( nonFocusable() );

			const spy = sinon.spy( view.items.get( 1 ), 'focus' );
			view.focusLast();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );

function focusable() {
	const view = nonFocusable();

	view.focus = () => {};

	return view;
}

function nonFocusable() {
	const view = new View();
	view.element = document.createElement( 'li' );

	return view;
}
