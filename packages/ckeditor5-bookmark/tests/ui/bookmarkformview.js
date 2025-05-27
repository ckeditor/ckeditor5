/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import BookmarkFormView from '../../src/ui/bookmarkformview.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler.js';
import FormHeaderView from '@ckeditor/ckeditor5-ui/src/formheader/formheaderview.js';
import FormRowView from '@ckeditor/ckeditor5-ui/src/formrow/formrowview.js';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'BookmarkFormView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new BookmarkFormView( { t: val => val } );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-form' ) ).to.true;
			expect( view.element.classList.contains( 'ck-responsive-form' ) ).to.true;
			expect( view.element.classList.contains( 'ck-bookmark-form' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should create child views', () => {
			expect( view.idInputView ).to.be.instanceOf( View );
			expect( view.saveButtonView ).to.be.instanceOf( View );
			expect( view.backButtonView ).to.be.instanceOf( View );

			expect( view.saveButtonView.element.classList.contains( 'ck-button-action' ) ).to.be.true;
			expect( view.saveButtonView.element.classList.contains( 'ck-button-bold' ) ).to.be.true;

			expect( view.children.get( 0 ) ).to.be.instanceOf( FormHeaderView );
			expect( view.children.get( 1 ) ).to.be.instanceOf( View );

			const formRowView = view.children.get( 1 );

			expect( formRowView ).to.be.instanceOf( FormRowView );
			expect( formRowView.element.classList.contains( 'ck' ) ).to.true;
			expect( formRowView.element.classList.contains( 'ck-form__row' ) ).to.true;
			expect( formRowView.element.classList.contains( 'ck-form__row_with-submit' ) ).to.true;
			expect( formRowView.element.classList.contains( 'ck-form__row_large-top-padding' ) ).to.true;
			expect( formRowView.children.get( 0 ) ).to.equal( view.idInputView );
			expect( formRowView.children.get( 1 ) ).to.equal( view.saveButtonView );

			const formHeaderView = view.children.get( 0 );

			expect( formHeaderView.element.classList.contains( 'ck' ) ).to.true;
			expect( formHeaderView.element.classList.contains( 'ck-form__header' ) ).to.true;
			expect( formHeaderView.children.get( 0 ) ).to.equal( view.backButtonView );
		} );

		it( 'should create back button view with proper classes', () => {
			expect( view.backButtonView.element.classList.contains( 'ck-button' ) ).to.be.true;
			expect( view.backButtonView.element.classList.contains( 'ck-button-back' ) ).to.be.true;
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'should fire `cancel` event on backButtonView#execute', () => {
			const spy = sinon.spy();
			view.on( 'cancel', spy );
			view.backButtonView.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should create id input with inputmode=text', () => {
			expect( view.idInputView.fieldView.inputMode ).to.be.equal( 'text' );
		} );

		it( 'should have proper label', () => {
			expect( view.idInputView.label ).to.be.equal( 'Bookmark name' );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).to.have.members( [
				view.backButtonView,
				view.idInputView,
				view.saveButtonView
			] );
		} );

		it( 'should register child views\' #element in #focusTracker', () => {
			const view = new BookmarkFormView( { t: () => {} } );

			const spy = testUtils.sinon.spy( view.focusTracker, 'add' );

			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.backButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.idInputView.element );
			sinon.assert.calledWithExactly( spy.getCall( 2 ), view.saveButtonView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new BookmarkFormView( { t: () => {} } );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation for the form', () => {
			it( 'so "tab" focuses the next focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the url input is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.idInputView.element;

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
				view.focusTracker.focusedElement = view.idInputView.element;

				const spy = sinon.spy( view.backButtonView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'isValid()', () => {
		it( 'should reset error after successful validation', () => {
			const view = new BookmarkFormView( { t: () => {} }, [
				() => undefined
			] );

			expect( view.isValid() ).to.be.true;
			expect( view.idInputView.errorText ).to.be.null;
		} );

		it( 'should display first error returned from validators list', () => {
			const view = new BookmarkFormView( { t: () => {} }, [
				() => undefined,
				() => 'Foo bar',
				() => 'Another error'
			] );

			expect( view.isValid() ).to.be.false;
			expect( view.idInputView.errorText ).to.be.equal( 'Foo bar' );
		} );

		it( 'should pass view reference as argument to validator', () => {
			const validatorSpy = sinon.spy();
			const view = new BookmarkFormView( { t: () => {} }, [ validatorSpy ] );

			view.isValid();

			expect( validatorSpy ).to.be.calledOnceWithExactly( view );
		} );
	} );

	describe( 'resetFormStatus()', () => {
		it( 'should clear form input errors', () => {
			view.idInputView.errorText = 'Error';
			view.resetFormStatus();
			expect( view.idInputView.errorText ).to.be.null;
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

				view.on( 'submit', spy );
				view.element.dispatchEvent( new Event( 'submit' ) );

				expect( spy.calledOnce ).to.true;
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #idInputView', () => {
			const spy = sinon.spy( view.idInputView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'ID getter', () => {
		it( 'null value should be returned in ID getter if element is null', () => {
			view.idInputView.fieldView.element = null;

			expect( view.id ).to.be.equal( null );
		} );

		it( 'trimmed DOM input value should be returned in ID getter', () => {
			view.idInputView.fieldView.element.value = '  foobar  ';

			expect( view.id ).to.be.equal( 'foobar' );
		} );
	} );
} );
