/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import LinkFormView from '../../src/ui/linkformview.js';
import LinkButtonView from '../../src/ui/linkbuttonview.js';
import { ListView, View, FocusCycler, ViewCollection } from '@ckeditor/ckeditor5-ui';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'LinkFormView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new LinkFormView( { t: val => val } );
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
			expect( view.element.classList.contains( 'ck-link-form' ) ).to.true;
			expect( view.element.classList.contains( 'ck-responsive-form' ) ).to.true;
		} );

		it( 'should create child views', () => {
			expect( view.backButtonView ).to.be.instanceOf( View );
			expect( view.saveButtonView ).to.be.instanceOf( View );
			expect( view.displayedTextInputView ).to.be.instanceOf( View );
			expect( view.urlInputView ).to.be.instanceOf( View );
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

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should fire `cancel` event on backButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'cancel', spy );

			view.backButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		it( 'should create url input with inputmode=url', () => {
			expect( view.urlInputView.fieldView.inputMode ).to.be.equal( 'url' );
		} );

		describe( 'template', () => {
			/**
				 * form
				 * 	header
				 * 		backButtonView
				 * 		label
				 * 	formRow
				 * 		displayedTextInputView
				 * 	formRow
				 * 		urlInputView
				 * 		saveButtonView
				 * 	linksButton
				 */

			it( 'has url input view', () => {
				const firstFormRow = view.template.children[ 0 ].get( 1 );
				const secondFormRow = view.template.children[ 0 ].get( 2 );

				expect( firstFormRow.template.children[ 0 ].get( 0 ) ).to.equal( view.displayedTextInputView );
				expect( secondFormRow.template.children[ 0 ].get( 0 ) ).to.equal( view.urlInputView );
			} );

			it( 'has button views', () => {
				const headerChildren = view.template.children[ 0 ].get( 0 ).template.children[ 0 ];
				const secondFormRow = view.template.children[ 0 ].get( 2 );

				expect( headerChildren.get( 0 ) ).to.equal( view.backButtonView );
				expect( secondFormRow.template.children[ 0 ].get( 1 ) ).to.equal( view.saveButtonView );
			} );

			it( 'should `saveButtonView` has no tooltip', () => {
				expect( view.saveButtonView.tooltip ).to.be.false;
			} );

			it( 'should `backButtonView` has correct label', () => {
				const headerChildren = view.template.children[ 0 ].get( 0 ).template.children[ 0 ];
				const backButton = headerChildren.get( 0 );

				expect( backButton.template.children[ 0 ].get( 1 ).text ).to.equal( 'Back' );
			} );

			it( 'should `backButtonView` has correct CSS class', () => {
				const headerChildren = view.template.children[ 0 ].get( 0 ).template.children[ 0 ];
				const backButton = headerChildren.get( 0 );

				expect( backButton.class ).to.equal( 'ck-button-back' );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).to.have.members( [
				view.urlInputView,
				view.saveButtonView,
				view.backButtonView,
				view.displayedTextInputView
			] );
		} );

		it( 'should register child views #element in #focusTracker', () => {
			const view = new LinkFormView( { t: () => {} } );
			const spy = testUtils.sinon.spy( view.focusTracker, 'add' );

			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.urlInputView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.saveButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 2 ), view.backButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 3 ), view.displayedTextInputView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new LinkFormView( { t: () => {} } );
			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
			it( 'so "tab" focuses the next focusable item', () => {
				const spy = sinon.spy( view.saveButtonView, 'focus' );

				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the url input is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.urlInputView.element;
				view.keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "shift + tab" focuses the previous focusable item', () => {
				const spy = sinon.spy( view.saveButtonView, 'focus' );

				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the cancel button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.backButtonView.element;
				view.keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'isValid()', () => {
		it( 'should reset error after successful validation', () => {
			const view = new LinkFormView( { t: () => {} }, [
				() => undefined
			] );

			expect( view.isValid() ).to.be.true;
			expect( view.urlInputView.errorText ).to.be.null;
		} );

		it( 'should display first error returned from validators list', () => {
			const view = new LinkFormView( { t: () => {} }, [
				() => undefined,
				() => 'Foo bar',
				() => 'Another error'
			] );

			expect( view.isValid() ).to.be.false;
			expect( view.urlInputView.errorText ).to.be.equal( 'Foo bar' );
		} );

		it( 'should pass view reference as argument to validator', () => {
			const validatorSpy = sinon.spy();
			const view = new LinkFormView( { t: () => {} }, [ validatorSpy ] );

			view.isValid();

			expect( validatorSpy ).to.be.calledOnceWithExactly( view );
		} );
	} );

	describe( 'resetFormStatus()', () => {
		it( 'should clear form input errors', () => {
			view.urlInputView.errorText = 'Error';
			view.resetFormStatus();
			expect( view.urlInputView.errorText ).to.be.null;
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
		it( 'focuses the #urlInputView', () => {
			const spy = sinon.spy( view.urlInputView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'URL getter', () => {
		it( 'null value should be returned in URL getter if element is null', () => {
			view.urlInputView.fieldView.element = null;

			expect( view.url ).to.be.equal( null );
		} );

		it( 'trimmed DOM input value should be returned in URL getter', () => {
			view.urlInputView.fieldView.element.value = '  https://cksource.com/  ';

			expect( view.url ).to.be.equal( 'https://cksource.com/' );
		} );
	} );

	describe( 'allows adding more form views', () => {
		let button;

		beforeEach( () => {
			button = new LinkButtonView();

			button.set( {
				label: 'Button'
			} );

			view.providersListChildren.add( button );
		} );

		afterEach( () => {
			button.destroy();
		} );

		it( 'adds list view', () => {
			const listView = view.children.get( 3 );
			const button = listView.template.children[ 0 ].get( 0 ).template.children[ 0 ].get( 0 );

			expect( button ).to.be.instanceOf( LinkButtonView );
			expect( listView ).to.be.instanceOf( ListView );
		} );

		it( 'should register list view items in #focusTracker', () => {
			const view = new LinkFormView( { t: () => { } } );
			const button = new LinkButtonView();

			button.set( {
				label: 'Button'
			} );

			view.providersListChildren.add( button );

			const spy = testUtils.sinon.spy( view.focusTracker, 'add' );
			const listView = view.children.get( 3 );
			const { element } = listView.template.children[ 0 ].get( 0 ).template.children[ 0 ].get( 0 );

			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.urlInputView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.saveButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 2 ), element );
			sinon.assert.calledWithExactly( spy.getCall( 3 ), view.backButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 4 ), view.displayedTextInputView.element );

			view.destroy();
		} );
	} );
} );
