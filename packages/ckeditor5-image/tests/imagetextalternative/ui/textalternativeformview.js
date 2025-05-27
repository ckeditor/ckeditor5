/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import TextAlternativeFormView from '../../../src/imagetextalternative/ui/textalternativeformview.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler.js';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'TextAlternativeFormView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new TextAlternativeFormView( { t: () => {} } );
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			view.render();

			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-form' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-text-alternative-form' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-responsive-form' ) ).to.be.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should create child views', () => {
			expect( view.labeledInput ).to.be.instanceOf( View );
			expect( view.saveButtonView ).to.be.instanceOf( View );
			expect( view.backButtonView ).to.be.instanceOf( View );

			view.render();
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should create header element at the top', () => {
			view.render();

			const header = view.children.first;

			expect( header.children.last.element.classList.contains( 'ck-form__header__label' ) ).to.be.true;
		} );

		it( 'should fire `cancel` event on backButtonView#execute', () => {
			const spy = sinon.spy();
			view.on( 'cancel', spy );
			view.backButtonView.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'render()', () => {
		it( 'starts listening for #keystrokes coming from #element', () => {
			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );
		} );

		describe( 'focus cycling and management', () => {
			it( 'should register child views in #_focusables', () => {
				view.render();

				expect( view._focusables.map( f => f ) ).to.have.members( [
					view.backButtonView,
					view.labeledInput,
					view.saveButtonView
				] );
			} );

			it( 'should register child views\' #element in #focusTracker', () => {
				const spy = testUtils.sinon.spy( view.focusTracker, 'add' );

				view.render();

				sinon.assert.calledWithExactly( spy.getCall( 0 ), view.backButtonView.element );
				sinon.assert.calledWithExactly( spy.getCall( 1 ), view.labeledInput.element );
				sinon.assert.calledWithExactly( spy.getCall( 2 ), view.saveButtonView.element );
			} );

			describe( 'activates keyboard navigation in the form', () => {
				beforeEach( () => {
					view.render();
					document.body.appendChild( view.element );
				} );

				afterEach( () => {
					view.element.remove();
					view.destroy();
				} );

				it( 'so "tab" focuses the next focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					// Mock the url input is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.labeledInput.element;

					const spy = sinon.spy( view.saveButtonView, 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );

				it( 'so "shift + tab" focuses the previous focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					// Mock the cancel button is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.backButtonView.element;

					const spy = sinon.spy( view.saveButtonView, 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );
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

	describe( 'DOM bindings', () => {
		describe( 'submit event', () => {
			it( 'should trigger submit event', () => {
				const spy = sinon.spy();

				view.render();
				view.on( 'submit', spy );
				view.element.dispatchEvent( new Event( 'submit' ) );

				expect( spy.calledOnce ).to.true;
			} );
		} );
	} );
} );
