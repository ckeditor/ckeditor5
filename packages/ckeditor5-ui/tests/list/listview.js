/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ViewCollection from '../../src/viewcollection.js';
import ListView from '../../src/list/listview.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import FocusCycler from '../../src/focuscycler.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import View from '../../src/view.js';
import { ListItemGroupView, ListItemView } from '../../src/index.js';
import ListSeparatorView from '../../src/list/listseparatorview.js';

describe( 'ListView', () => {
	let view;

	beforeEach( () => {
		view = new ListView();
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'creates element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-reset' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-list' ) ).to.be.true;
		} );

		it( 'creates view#items collection', () => {
			expect( view.items ).to.be.instanceOf( ViewCollection );
			expect( view.template.children ).to.have.length( 1 );
			expect( view.template.children[ 0 ] ).to.equal( view.items );
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
	} );

	describe( 'render()', () => {
		describe( 'focus tracker management', () => {
			let view, spyAdd, spyRemove;

			beforeEach( () => {
				view = new ListView();
				spyAdd = sinon.spy( view.focusTracker, 'add' );
				spyRemove = sinon.spy( view.focusTracker, 'remove' );
			} );

			afterEach( () => {
				view.destroy();
			} );

			it( 'registers all existing items before rendering', () => {
				const item1 = focusable();
				const item2 = focusable();

				view.items.add( item1 );
				view.items.add( item2 );

				view.render();

				sinon.assert.callCount( spyAdd, 2 );
				sinon.assert.calledWithExactly( spyAdd.firstCall, item1.element );
				sinon.assert.calledWithExactly( spyAdd.secondCall, item2.element );
				sinon.assert.notCalled( spyRemove );

				assertFocusables( view, [ item1, item2 ] );
			} );

			it( 'registers all items after rendering', () => {
				const item1 = focusable();
				const item2 = focusable();
				const item3 = focusable();

				view.items.add( item1 );
				view.items.add( item2 );

				view.render();

				view.items.add( item3 );

				sinon.assert.callCount( spyAdd, 3 );
				sinon.assert.calledWithExactly( spyAdd.firstCall, item1.element );
				sinon.assert.calledWithExactly( spyAdd.secondCall, item2.element );
				sinon.assert.calledWithExactly( spyAdd.thirdCall, item3.element );
				sinon.assert.notCalled( spyRemove );

				assertFocusables( view, [ item1, item2, item3 ] );
			} );

			it( 'registers many items after rendering', () => {
				const item1 = focusable( '1' );
				const item2 = focusable( '2' );
				const item3 = focusable( '3' );

				view.items.add( item1 );

				view.render();

				view.items.addMany( [ item2, item3 ], 0 );

				sinon.assert.callCount( spyAdd, 3 );
				sinon.assert.calledWithExactly( spyAdd.firstCall, item1.element );
				sinon.assert.calledWithExactly( spyAdd.secondCall, item3.element );
				sinon.assert.calledWithExactly( spyAdd.thirdCall, item2.element );
				sinon.assert.notCalled( spyRemove );

				assertFocusables( view, [ item2, item3, item1 ] );
			} );

			it( 'registers existing groups before rendering', () => {
				const item1 = focusable();
				const item21 = focusable();
				const item22 = focusable();

				const group1 = new ListItemGroupView();

				view.items.add( item1 );
				view.items.add( group1 );
				group1.items.add( item21 );
				group1.items.add( item22 );

				view.render();

				sinon.assert.callCount( spyAdd, 3 );
				sinon.assert.calledWithExactly( spyAdd.firstCall, item1.element );
				sinon.assert.calledWithExactly( spyAdd.secondCall, item21.element );
				sinon.assert.calledWithExactly( spyAdd.thirdCall, item22.element );
				sinon.assert.notCalled( spyRemove );

				assertFocusables( view, [ item1, item21, item22 ] );
			} );

			it( 'registers new groups after rendering', () => {
				const item1 = focusable();
				const item21 = focusable();
				const item22 = focusable();

				const group1 = new ListItemGroupView();

				view.items.add( item1 );
				group1.items.add( item21 );
				group1.items.add( item22 );

				view.render();

				view.items.add( group1 );

				sinon.assert.callCount( spyAdd, 3 );
				sinon.assert.calledWithExactly( spyAdd.firstCall, item1.element );
				sinon.assert.calledWithExactly( spyAdd.secondCall, item21.element );
				sinon.assert.calledWithExactly( spyAdd.thirdCall, item22.element );
				sinon.assert.notCalled( spyRemove );

				assertFocusables( view, [ item1, item21, item22 ] );
			} );

			it( 'registers new group items after rendering', () => {
				const item1 = focusable();
				const item21 = focusable();
				const item22 = focusable();

				const group1 = new ListItemGroupView();

				view.items.add( item1 );
				group1.items.add( item21 );

				view.render();

				view.items.add( group1 );
				group1.items.add( item22 );

				sinon.assert.callCount( spyAdd, 3 );
				sinon.assert.calledWithExactly( spyAdd.firstCall, item1.element );
				sinon.assert.calledWithExactly( spyAdd.secondCall, item21.element );
				sinon.assert.calledWithExactly( spyAdd.thirdCall, item22.element );
				sinon.assert.notCalled( spyRemove );

				assertFocusables( view, [ item1, item21, item22 ] );
			} );

			it( 'registers many new group items after rendering', () => {
				const item1 = focusable( '1' );
				const item21 = focusable( '21' );
				const item22 = focusable( '22' );

				const group1 = new ListItemGroupView();

				view.items.add( item1 );

				view.render();

				view.items.add( group1, 0 );
				group1.items.addMany( [ item21, item22 ] );

				sinon.assert.callCount( spyAdd, 3 );
				sinon.assert.calledWithExactly( spyAdd.firstCall, item1.element );
				sinon.assert.calledWithExactly( spyAdd.secondCall, item22.element );
				sinon.assert.calledWithExactly( spyAdd.thirdCall, item21.element );
				sinon.assert.notCalled( spyRemove );

				assertFocusables( view, [ item21, item22, item1 ] );
			} );

			it( 'doesn\'t register list separator', () => {
				const item = listSeparator();

				view.items.add( item );
				view.render();

				sinon.assert.notCalled( spyAdd );
			} );

			it( 'deregisters items upon removal', () => {
				const item1 = focusable();
				const item2 = focusable();

				view.items.add( item1 );
				view.items.add( item2 );

				view.render();

				assertFocusables( view, [ item1, item2 ] );

				view.items.remove( 0 );

				sinon.assert.callCount( spyAdd, 2 );
				sinon.assert.calledWithExactly( spyAdd.firstCall, item1.element );
				sinon.assert.calledWithExactly( spyAdd.secondCall, item2.element );
				sinon.assert.callCount( spyRemove, 1 );
				sinon.assert.calledWithExactly( spyRemove.firstCall, item1.element );

				assertFocusables( view, [ item2 ] );
			} );

			it( 'deregisters nested items upon removal', () => {
				const item1 = focusable();
				const item21 = focusable();
				const item22 = focusable();

				const group1 = new ListItemGroupView();

				view.items.add( item1 );
				view.items.add( group1 );
				group1.items.add( item21 );
				group1.items.add( item22 );

				view.render();

				assertFocusables( view, [ item1, item21, item22 ] );

				group1.items.remove( 0 );

				sinon.assert.callCount( spyAdd, 3 );
				sinon.assert.calledWithExactly( spyAdd.firstCall, item1.element );
				sinon.assert.calledWithExactly( spyAdd.secondCall, item21.element );
				sinon.assert.calledWithExactly( spyAdd.thirdCall, item22.element );
				sinon.assert.callCount( spyRemove, 1 );
				sinon.assert.calledWithExactly( spyRemove.firstCall, item21.element );

				assertFocusables( view, [ item1, item22 ] );
			} );

			it( 'deregisters entire groups', () => {
				const item1 = focusable();
				const item21 = focusable();
				const item22 = focusable();

				const group1 = new ListItemGroupView();

				view.items.add( item1 );
				view.items.add( group1 );
				group1.items.add( item21 );
				group1.items.add( item22 );

				view.render();

				assertFocusables( view, [ item1, item21, item22 ] );

				view.items.remove( 1 );

				sinon.assert.callCount( spyAdd, 3 );
				sinon.assert.calledWithExactly( spyAdd.firstCall, item1.element );
				sinon.assert.calledWithExactly( spyAdd.secondCall, item21.element );
				sinon.assert.calledWithExactly( spyAdd.thirdCall, item22.element );
				sinon.assert.callCount( spyRemove, 2 );
				sinon.assert.calledWithExactly( spyRemove.firstCall, item21.element );
				sinon.assert.calledWithExactly( spyRemove.secondCall, item22.element );

				assertFocusables( view, [ item1 ] );
			} );

			it( 'doesn\'t deregister list separator', () => {
				const item = listSeparator();

				view.items.add( item );
				view.render();
				view.items.remove( 0 );

				sinon.assert.notCalled( spyRemove );
			} );

			function assertFocusables( view, expected ) {
				expect( Array.from( view.focusables ) ).to.have.ordered.members( expected );
			}
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new ListView();
			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
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

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = sinon.spy( view.focusTracker, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = sinon.spy( view.keystrokes, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
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

	describe( 'focusFirst()', () => {
		it( 'focuses the first focusable item in DOM', () => {
			// No children to focus.
			view.focusFirst();

			// The second child is focusable.
			view.items.add( nonFocusable() );
			view.items.add( focusable() );
			view.items.add( focusable() );
			view.items.add( nonFocusable() );

			const spy = sinon.spy( view.items.get( 1 ), 'focus' );
			view.focusFirst();

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
			view.items.add( focusable() );
			view.items.add( nonFocusable() );

			const spy = sinon.spy( view.items.get( 2 ), 'focus' );
			view.focusLast();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( '#ariaLabel', () => {
		it( 'should be not set by default', () => {
			expect( view.element.attributes[ 'aria-label' ] ).to.be.undefined;
		} );

		it( 'should set aria-label', () => {
			view.ariaLabel = 'foo';

			expect( view.element.attributes[ 'aria-label' ].value ).to.equal( 'foo' );
		} );
	} );

	describe( '#ariaLabelledBy', () => {
		it( 'should be not set by default', () => {
			expect( view.element.attributes[ 'aria-labelledby' ] ).to.be.undefined;
		} );

		it( 'should set aria-labelledby', () => {
			view.ariaLabelledBy = 'foo';

			expect( view.element.attributes[ 'aria-labelledby' ].value ).to.equal( 'foo' );
		} );
	} );

	describe( '#role', () => {
		it( 'should be not set by default', () => {
			expect( view.element.attributes.role ).to.be.undefined;
		} );

		it( 'should set role', () => {
			view.role = 'foo';

			expect( view.element.attributes.role.value ).to.equal( 'foo' );
		} );
	} );
} );

function focusable( name ) {
	const view = new ListItemView();
	view.name = name;

	return view;
}

function nonFocusable() {
	const view = new View();
	view.element = document.createElement( 'li' );

	return view;
}

function listSeparator() {
	const view = new ListSeparatorView();

	return view;
}
