/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Event */

import FindAndReplaceFormView from '../../src/ui/findandreplaceformview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'FindAndReplaceFormView', () => {
	let view;
	let viewValue;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new FindAndReplaceFormView( { t: val => val } );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			// expect( view.element.classList.contains( 'ck-find-and-replace-form__wrapper' ) ).to.true;
		} );

		it( 'should create child views', () => {
			expect( view.findPrevButtonView ).to.be.instanceOf( View );
			expect( view.findNextButtonView ).to.be.instanceOf( View );
			expect( view.replaceButtonView ).to.be.instanceOf( View );
			expect( view.replaceAllButtonView ).to.be.instanceOf( View );
			expect( view.findInputView ).to.be.instanceOf( View );
			expect( view.replaceInputView ).to.be.instanceOf( View );
			expect( view.findView ).to.be.instanceOf( View );
			expect( view.replaceView ).to.be.instanceOf( View );
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

		describe( 'find input view', () => {
			it( 'has label', () => {
				expect( view.findInputView.label ).to.match( /^Find in text/ );
			} );

			it( 'displays the tip upon #input when the field has a value', () => {
				view.findInputView.fieldView.element.value = 'foo';
				view.findInputView.fieldView.fire( 'input' );

				expect( view.findInputView.label ).to.match( /^Find in text/ );
			} );
		} );

		describe( 'replace input view', () => {
			it( 'has label', () => {
				expect( view.replaceInputView.label ).to.match( /^Replace with/ );
			} );

			it( 'displays the tip upon #input when the field has a value', () => {
				view.replaceInputView.fieldView.element.value = 'foo';
				view.replaceInputView.fieldView.fire( 'input' );

				expect( view.replaceInputView.label ).to.match( /^Replace with/ );
			} );
		} );

		describe( 'template', () => {
			it( 'has find and replace views', () => {
				expect( view.template.children[ 0 ] ).to.equal( view.findView );
				expect( view.template.children[ 1 ] ).to.equal( view.replaceView );
			} );
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

	describe( 'find and replace events', () => {
		it( 'should trigger findNext twice', () => {
			const spy = sinon.spy();

			view.on( 'findNext', spy );

			view.findNextButtonView.fire( 'execute' );
			view.findButtonView.fire( 'execute' );

			expect( spy.calledTwice ).to.true;
		} );

		it( 'should trigger findPrevious', () => {
			const spy = sinon.spy();

			view.on( 'findPrevious', spy );

			view.findPrevButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		it( 'should trigger replace', () => {
			const spy = sinon.spy();

			view.on( 'replace', spy );

			view.replaceButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		it( 'should trigger replaceAll', () => {
			const spy = sinon.spy();

			view.on( 'replaceAll', spy );

			view.replaceAllButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #findInputView', () => {
			const spy = sinon.spy( view.findInputView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).to.have.members( [
				view.findInputView,
				view.matchCaseView,
				view.matchWholeWordsView,
				view.findButtonView,
				view.findPrevButtonView,
				view.findNextButtonView,
				view.replaceInputView,
				view.replaceButtonView,
				view.replaceAllButtonView
			] );
		} );

		it( 'should register child views\' #element in #focusTracker', () => {
			view = new FindAndReplaceFormView( { t: val => val } );

			const spy = testUtils.sinon.spy( view.focusTracker, 'add' );

			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.findInputView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.matchCaseView.element );
			sinon.assert.calledWithExactly( spy.getCall( 2 ), view.matchWholeWordsView.element );
			sinon.assert.calledWithExactly( spy.getCall( 3 ), view.findButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 4 ), view.findPrevButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 5 ), view.findNextButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 6 ), view.replaceInputView.element );
			sinon.assert.calledWithExactly( spy.getCall( 7 ), view.replaceAllButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 8 ), view.replaceButtonView.element );
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			view = new FindAndReplaceFormView( { t: val => val } );

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
				view.focusTracker.focusedElement = view.findNextButtonView.element;

				const spy = sinon.spy( view.replaceInputView, 'focus' );

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
				view.focusTracker.focusedElement = view.findNextButtonView.element;

				const spy = sinon.spy( view.findPrevButtonView, 'focus' );

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

		it( 'intercepts the "selectstart" event of the #findInputView with the high priority', () => {
			const spy = sinon.spy();
			const event = new Event( 'selectstart', {
				bubbles: true,
				cancelable: true
			} );

			event.stopPropagation = spy;

			view.findInputView.element.dispatchEvent( event );
			sinon.assert.calledOnce( spy );
		} );

		it( 'intercepts the "selectstart" event of the #replaceInputView with the high priority', () => {
			const spy = sinon.spy();
			const event = new Event( 'selectstart', {
				bubbles: true,
				cancelable: true
			} );

			event.stopPropagation = spy;

			view.replaceInputView.element.dispatchEvent( event );
			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'find and replace input values', () => {
		it( 'returns the #findInputView DOM value', () => { // TODO: possible improvements to the code readability?
			viewValue = view.findInputView.fieldView.element.value;
			viewValue = 'foo';

			expect( viewValue ).to.equal( 'foo' );
		} );

		it( 'returns the #replaceInputView DOM value', () => {
			viewValue = view.replaceInputView.fieldView.element.value;
			viewValue = 'foo';

			expect( viewValue ).to.equal( 'foo' );
		} );

		it( 'sets the #findInputView DOM value', () => {
			viewValue = view.findInputView.fieldView.element.value;
			viewValue = 'bar';
			viewValue = 'foo';

			expect( viewValue ).to.equal( 'foo' );
		} );

		it( 'sets the #replaceInputView DOM value', () => {
			viewValue = view.replaceInputView.fieldView.element.value;
			viewValue = 'bar';
			viewValue = 'foo';

			expect( viewValue ).to.equal( 'foo' );
		} );
	} );
} );
