/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals Event */

import LinkFormView from '../../src/ui/linkformview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'LinkFormView', () => {
	let view;

	beforeEach( () => {
		view = new LinkFormView( { t: val => val } );

		return view.init();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck-link-form' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should create child views', () => {
			expect( view.urlInputView ).to.be.instanceOf( View );
			expect( view.saveButtonView ).to.be.instanceOf( View );
			expect( view.cancelButtonView ).to.be.instanceOf( View );
			expect( view.unlinkButtonView ).to.be.instanceOf( View );

			expect( view._unboundChildren.get( 0 ) ).to.equal( view.urlInputView );
			expect( view._unboundChildren.get( 1 ) ).to.equal( view.saveButtonView );
			expect( view._unboundChildren.get( 2 ) ).to.equal( view.cancelButtonView );
			expect( view._unboundChildren.get( 3 ) ).to.equal( view.unlinkButtonView );
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

		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).to.have.members( [
				view.urlInputView,
				view.saveButtonView,
				view.cancelButtonView,
				view.unlinkButtonView
			] );
		} );

		it( 'should register child views\' #element in #focusTracker', () => {
			const spy = testUtils.sinon.spy( FocusTracker.prototype, 'add' );

			view = new LinkFormView( { t: () => {} } );

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.urlInputView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.saveButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 2 ), view.cancelButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 3 ), view.unlinkButtonView.element );
		} );

		it( 'should fire `cancel` event on cancelButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'cancel', spy );

			view.cancelButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		it( 'should fire `unlink` event on unlinkButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'unlink', spy );

			view.unlinkButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		describe( 'url input view', () => {
			it( 'has placeholder', () => {
				expect( view.urlInputView.inputView.placeholder ).to.equal( 'https://example.com' );
			} );
		} );

		describe( 'template', () => {
			it( 'has url input view', () => {
				expect( view.template.children.get( 0 ) ).to.equal( view.urlInputView );
			} );

			it( 'has form actions container', () => {
				expect( view.template.children.get( 1 ).attributes.class ).to.have.members( [ 'ck-link-form__actions' ] );
			} );

			it( 'has form action views', () => {
				const actions = view.template.children.get( 1 ).children;

				expect( actions.get( 0 ) ).to.equal( view.saveButtonView );
				expect( actions.get( 1 ) ).to.equal( view.cancelButtonView );
				expect( actions.get( 2 ) ).to.equal( view.unlinkButtonView );
			} );
		} );
	} );

	describe( 'init()', () => {
		it( 'starts listening for #keystrokes coming from #element', () => {
			view = new LinkFormView( { t: () => {} } );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.init();
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
} );
