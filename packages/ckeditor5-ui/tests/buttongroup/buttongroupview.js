/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ButtonGroupView from '../../src/buttongroup/buttongroupview';
import ButtonView from '../../src/button/buttonview';
import ViewCollection from '../../src/viewcollection';
import FocusCycler from '../../src/focuscycler';
import FocusTracker from '../../../ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '../../../ckeditor5-utils/src/keystrokehandler';
import { keyCodes } from '../../../ckeditor5-utils/src/keyboard';

testUtils.createSinonSandbox();

describe( 'ButtonGroupView', () => {
	let view;

	beforeEach( () => {
		view = new ButtonGroupView();
		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'creates element from template', () => {
			expect( view.element.classList.contains( 'ck-reset' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-button-group' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-button-group__vertical' ) ).to.be.false;
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

	describe( 'DOM bindings', () => {
		describe( '"class" attribute', () => {
			it( 'is set from options', () => {
				view = new ButtonGroupView( { isVertical: true } );
				view.render();

				expect( view.element.classList.contains( 'ck-button-group__vertical' ) ).to.be.true;
			} );

			it( 'reacts to view#isVertical', () => {
				expect( view.element.classList.contains( 'ck-button-group__vertical' ) ).to.be.false;

				view.isVertical = true;

				expect( view.element.classList.contains( 'ck-button-group__vertical' ) ).to.be.true;
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'registers #items in #focusTracker', () => {
			const view = new ButtonGroupView();

			const spyAdd = sinon.spy( view.focusTracker, 'add' );
			const spyRemove = sinon.spy( view.focusTracker, 'remove' );

			sinon.assert.notCalled( spyAdd );
			view.items.add( new ButtonView() );
			view.items.add( new ButtonView() );

			view.render();
			sinon.assert.calledTwice( spyAdd );

			view.items.remove( 1 );
			sinon.assert.calledOnce( spyRemove );

			view.items.add( new ButtonView() );
			sinon.assert.calledThrice( spyAdd );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new ButtonGroupView();
			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation for the group', () => {
			it( 'so "arrowup" focuses previous item', () => {
				testFocusCycle( {
					keyCode: keyCodes.arrowup,
					currentlyFocused: 3,
					shouldBeFocused: 2
				} );
			} );

			it( 'so "arrowleft" focuses previous item', () => {
				testFocusCycle( {
					keyCode: keyCodes.arrowleft,
					currentlyFocused: 3,
					shouldBeFocused: 2
				} );
			} );

			it( 'so "arrowdown" focuses next item', () => {
				testFocusCycle( {
					keyCode: keyCodes.arrowdown,
					currentlyFocused: 1,
					shouldBeFocused: 2
				} );
			} );

			it( 'so "arrowright" focuses next item', () => {
				testFocusCycle( {
					keyCode: keyCodes.arrowright,
					currentlyFocused: 1,
					shouldBeFocused: 2
				} );
			} );

			function testFocusCycle( parameters ) {
				const { keyCode, currentlyFocused, shouldBeFocused } = parameters;

				const keyEvtData = {
					keyCode,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// No children to focus.
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );

				view.items.add( new ButtonView() );
				view.items.add( new ButtonView() );
				view.items.add( new ButtonView() );
				view.items.add( new ButtonView() );

				// Mock the item is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.items.get( currentlyFocused ).element;

				const spy = sinon.spy( view.items.get( shouldBeFocused ), 'focus' );
				view.keystrokes.press( keyEvtData );

				sinon.assert.calledTwice( keyEvtData.preventDefault );
				sinon.assert.calledTwice( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			}
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the first button in DOM', () => {
			view.items.add( new ButtonView() );
			view.items.add( new ButtonView() );

			const spy = sinon.spy( view.items.get( 0 ), 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'focusLast()', () => {
		it( 'focuses the last button in DOM', () => {
			view.items.add( new ButtonView() );
			view.items.add( new ButtonView() );

			const spy = sinon.spy( view.items.get( 1 ), 'focus' );

			view.focusLast();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
