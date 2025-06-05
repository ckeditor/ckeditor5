/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ButtonView, FormHeaderView } from '@ckeditor/ckeditor5-ui';
import { IconPreviousArrow } from '@ckeditor/ckeditor5-icons';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import EmojiPickerFormView from '../../src/ui/emojipickerformview.js';

describe( 'EmojiPickerFormView', () => {
	let view;

	beforeEach( () => {
		view = new EmojiPickerFormView( { t: str => str } );

		sinon.spy( view.keystrokes, 'listenTo' );

		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-form' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-emoji-picker-form' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-responsive-form' ) ).to.be.true;
		} );

		it( 'should create child views', () => {
			expect( view.backButtonView ).to.be.instanceOf( ButtonView );
			expect( view.children.first ).to.be.instanceOf( FormHeaderView );
		} );

		it( 'should create back button with proper attributes', () => {
			expect( view.backButtonView.label ).to.equal( 'Back' );
			expect( view.backButtonView.icon ).to.equal( IconPreviousArrow );
			expect( view.backButtonView.class ).to.equal( 'ck-button-back' );
			expect( view.backButtonView.tooltip ).to.be.true;
		} );

		it( 'should delegate back button execute event to cancel', () => {
			const spy = sinon.spy();

			view.on( 'cancel', spy );
			view.backButtonView.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should create header view with proper label', () => {
			expect( view.children.first ).to.be.instanceOf( FormHeaderView );
			expect( view.children.first.label ).to.equal( 'Emoji picker' );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in _focusables collection', () => {
			expect( [ ...view._focusables ] ).to.have.length( 1 );
		} );

		it( 'should register #element in keystrokes manager', () => {
			expect( view.keystrokes.listenTo.calledOnce ).to.be.true;
			expect( view.keystrokes.listenTo.firstCall.args[ 0 ] ).to.equal( view.element );
		} );

		describe( 'activates keyboard navigation in the form', () => {
			beforeEach( () => {
				view.element.remove();
				view.destroy();
			} );

			it( 'so "tab" focuses on the next focusable item', () => {
				view = new EmojiPickerFormView( { t: str => str } );

				const cancelButtonView = new ButtonView();

				view.children.add( cancelButtonView );
				view.render();
				document.body.appendChild( view.element );

				// Mock the cancel button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = cancelButtonView.element;

				// The back button is focused.
				const spy = sinon.spy( view.backButtonView, 'focus' );

				// Fire tab event.
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "shift + tab" focuses on the previous focusable item', () => {
				view = new EmojiPickerFormView( { t: str => str } );

				const cancelButtonView = new ButtonView();

				view.children.add( cancelButtonView );
				view.render();
				document.body.appendChild( view.element );

				// Mock the cancel button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.backButtonView.element;

				// The back button is focused.
				const spy = sinon.spy( cancelButtonView, 'focus' );

				// Fire tab event.
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

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
		it( 'should focus the first focusable element in the form', () => {
			view.focus();

			expect( document.activeElement ).to.equal( view.backButtonView.element );
		} );
	} );
} );
