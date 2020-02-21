/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Event */

import MediaFormView from '../../src/ui/mediaformview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'MediaFormView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new MediaFormView( [], { t: val => val } );
		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'accepts validators', () => {
			const validators = [];
			const view = new MediaFormView( validators, { t: val => val } );

			expect( view._validators ).to.equal( validators );
		} );

		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-media-form' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should create child views', () => {
			expect( view.urlInputView ).to.be.instanceOf( View );
			expect( view.saveButtonView ).to.be.instanceOf( View );
			expect( view.cancelButtonView ).to.be.instanceOf( View );

			expect( view.saveButtonView.element.classList.contains( 'ck-button-save' ) ).to.be.true;
			expect( view.cancelButtonView.element.classList.contains( 'ck-button-cancel' ) ).to.be.true;

			expect( view._unboundChildren.get( 0 ) ).to.equal( view.urlInputView );
			expect( view._unboundChildren.get( 1 ) ).to.equal( view.saveButtonView );
			expect( view._unboundChildren.get( 2 ) ).to.equal( view.cancelButtonView );
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

		it( 'should fire "cancel" event on cancelButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'cancel', spy );

			view.cancelButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		describe( 'url input view', () => {
			it( 'has placeholder', () => {
				expect( view.urlInputView.inputView.placeholder ).to.equal( 'https://example.com' );
			} );

			it( 'has info text', () => {
				expect( view.urlInputView.infoText ).to.match( /^Paste the media URL/ );
			} );

			it( 'displays the tip upon #input when the field has a value', () => {
				view.urlInputView.inputView.element.value = 'foo';
				view.urlInputView.inputView.fire( 'input' );

				expect( view.urlInputView.infoText ).to.match( /^Tip: Paste the URL into/ );

				view.urlInputView.inputView.element.value = '';
				view.urlInputView.inputView.fire( 'input' );

				expect( view.urlInputView.infoText ).to.match( /^Paste the media URL/ );
			} );
		} );

		describe( 'template', () => {
			it( 'has url input view', () => {
				expect( view.template.children[ 0 ] ).to.equal( view.urlInputView );
			} );

			it( 'has button views', () => {
				expect( view.template.children[ 1 ] ).to.equal( view.saveButtonView );
				expect( view.template.children[ 2 ] ).to.equal( view.cancelButtonView );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).to.have.members( [
				view.urlInputView,
				view.saveButtonView,
				view.cancelButtonView
			] );
		} );

		it( 'should register child views\' #element in #focusTracker', () => {
			const spy = testUtils.sinon.spy( FocusTracker.prototype, 'add' );

			view = new MediaFormView( [], { t: () => {} } );
			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.urlInputView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.saveButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 2 ), view.cancelButtonView.element );
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			view = new MediaFormView( [], { t: () => {} } );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
			it( 'so "tab" focuses the next focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the url input is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.urlInputView.element;

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
				view.focusTracker.focusedElement = view.cancelButtonView.element;

				const spy = sinon.spy( view.saveButtonView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );

		it( 'intercepts the arrow* events and overrides the default toolbar behavior', () => {
			const keyEvtData = {
				stopPropagation: sinon.spy()
			};

			keyEvtData.keyCode = keyCodes.arrowdown;
			view.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );

			keyEvtData.keyCode = keyCodes.arrowup;
			view.keystrokes.press( keyEvtData );
			sinon.assert.calledTwice( keyEvtData.stopPropagation );

			keyEvtData.keyCode = keyCodes.arrowleft;
			view.keystrokes.press( keyEvtData );
			sinon.assert.calledThrice( keyEvtData.stopPropagation );

			keyEvtData.keyCode = keyCodes.arrowright;
			view.keystrokes.press( keyEvtData );
			sinon.assert.callCount( keyEvtData.stopPropagation, 4 );
		} );

		it( 'intercepts the "selectstart" event of the #urlInputView with the high priority', () => {
			const spy = sinon.spy();
			const event = new Event( 'selectstart', {
				bubbles: true,
				cancelable: true
			} );

			event.stopPropagation = spy;

			view.urlInputView.element.dispatchEvent( event );
			sinon.assert.calledOnce( spy );
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

	describe( 'url()', () => {
		it( 'returns the #inputView DOM value', () => {
			view.urlInputView.inputView.element.value = 'foo';

			expect( view.url ).to.equal( 'foo' );
		} );

		it( 'sets the #inputView DOM value', () => {
			view.urlInputView.inputView.element.value = 'bar';

			view.url = 'foo';
			expect( view.urlInputView.inputView.element.value ).to.equal( 'foo' );

			view.url = ' baz ';
			expect( view.urlInputView.inputView.element.value ).to.equal( 'baz' );
		} );
	} );

	describe( 'isValid()', () => {
		it( 'calls resetFormStatus()', () => {
			const spy = sinon.spy( view, 'resetFormStatus' );

			view.isValid();

			sinon.assert.calledOnce( spy );
		} );

		it( 'returns false when at least one validator has failed', () => {
			const val1 = sinon.stub().returns( 'some error' );
			const val2 = sinon.stub().returns( false );
			const validators = [ val1, val2 ];
			const view = new MediaFormView( validators, { t: val => val } );

			expect( view.isValid() ).to.be.false;

			sinon.assert.calledOnce( val1 );
			sinon.assert.notCalled( val2 );

			expect( view.urlInputView.errorText ).to.equal( 'some error' );
		} );

		it( 'returns true when all validators passed', () => {
			const val1 = sinon.stub().returns( false );
			const val2 = sinon.stub().returns( false );
			const validators = [ val1, val2 ];
			const view = new MediaFormView( validators, { t: val => val } );

			expect( view.isValid() ).to.be.true;

			sinon.assert.calledOnce( val1 );
			sinon.assert.calledOnce( val2 );

			expect( view.urlInputView.errorText ).to.be.null;
		} );
	} );

	describe( 'resetFormStatus()', () => {
		it( 'resets urlInputView#errorText', () => {
			view.urlInputView.errorText = 'foo';

			view.resetFormStatus();

			expect( view.urlInputView.errorText ).to.be.null;
		} );

		it( 'resets urlInputView#infoText', () => {
			view.urlInputView.infoText = 'foo';

			view.resetFormStatus();

			expect( view.urlInputView.infoText ).to.match( /^Paste the media URL/ );
		} );
	} );
} );
