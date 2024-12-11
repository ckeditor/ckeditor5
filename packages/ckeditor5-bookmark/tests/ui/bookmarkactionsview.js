/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document */

import BookmarkActionsView from '../../src/ui/bookmarkactionsview.js';
import { ButtonView, LabelView, ViewCollection, FocusCycler } from '@ckeditor/ckeditor5-ui';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import { KeystrokeHandler, FocusTracker } from '@ckeditor/ckeditor5-utils';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'BookmarkActionsView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new BookmarkActionsView( { t: val => val } );
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
			expect( view.element.classList.contains( 'ck-bookmark-actions' ) ).to.true;
			expect( view.element.classList.contains( 'ck-responsive-form' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should create child views', () => {
			expect( view.bookmarkPreviewView ).to.be.instanceOf( LabelView );
			expect( view.removeButtonView ).to.be.instanceOf( ButtonView );
			expect( view.editButtonView ).to.be.instanceOf( ButtonView );
		} );

		it( 'should set `ariaLabelledBy` for `removeButtonView`', () => {
			const originalButtonLabelId = view.removeButtonView.labelView.id;
			const bookmarkPreviewId = view.bookmarkPreviewView.id;
			const concatenatedIds = `${ originalButtonLabelId } ${ bookmarkPreviewId }`;

			expect( view.removeButtonView.ariaLabelledBy ).to.be.equal( concatenatedIds );
			expect( view.removeButtonView.labelView.id ).to.be.equal( originalButtonLabelId );
		} );

		it( 'should set `ariaLabelledBy` for `editButtonView`', () => {
			const originalButtonLabelId = view.editButtonView.labelView.id;
			const bookmarkPreviewId = view.bookmarkPreviewView.id;
			const concatenatedIds = `${ originalButtonLabelId } ${ bookmarkPreviewId }`;

			expect( view.editButtonView.ariaLabelledBy ).to.be.equal( concatenatedIds );
			expect( view.editButtonView.labelView.id ).to.be.equal( originalButtonLabelId );
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

		it( 'should fire `edit` event on editButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'edit', spy );

			view.editButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		it( 'should fire `remove` event on removeButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'remove', spy );

			view.removeButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		describe( 'preview button view', () => {
			it( 'has a CSS class', () => {
				expect( view.bookmarkPreviewView.element.classList.contains( 'ck-bookmark-actions__preview' ) ).to.be.true;
			} );

			describe( 'bindings', () => {
				it( 'binds id attribute to view#label', () => {
					expect( view.bookmarkPreviewView.text ).to.be.undefined;

					view.id = 'foo';

					expect( view.bookmarkPreviewView.text ).to.equal( 'foo' );
				} );
			} );
		} );

		describe( 'template', () => {
			it( 'has child views', () => {
				expect( view.template.children[ 0 ] ).to.equal( view.bookmarkPreviewView );
				expect( view.template.children[ 1 ] ).to.equal( view.editButtonView );
				expect( view.template.children[ 2 ] ).to.equal( view.removeButtonView );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).to.have.members( [
				view.editButtonView,
				view.removeButtonView
			] );
		} );

		it( 'should register child views\' #element in #focusTracker', () => {
			const spy = testUtils.sinon.spy( FocusTracker.prototype, 'add' );

			const view = new BookmarkActionsView( { t: () => {} } );
			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.editButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.removeButtonView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new BookmarkActionsView( { t: () => {} } );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
			it( 'so "tab" focuses the next focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the preview button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.bookmarkPreviewView.element;

				const spy = sinon.spy( view.editButtonView, 'focus' );

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

				// Mock the edit button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.editButtonView.element;

				const spy = sinon.spy( view.removeButtonView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
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
		it( 'focuses the #editButtonView', () => {
			const spy = sinon.spy( view.editButtonView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
