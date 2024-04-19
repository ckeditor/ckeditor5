/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview.js';

import ImageInsertUrlView from '../../../src/imageinsert/ui/imageinserturlview.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler.js';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview.js';
import { icons } from '@ckeditor/ckeditor5-core';

describe( 'ImageInsertUrlView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new ImageInsertUrlView( { t: val => val } );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should have #imageURLInputValue', () => {
			expect( view.imageURLInputValue ).to.equal( '' );
		} );

		it( 'should have #isImageSelected', () => {
			expect( view.isImageSelected ).to.be.false;
		} );

		it( 'should have #isEnabled', () => {
			expect( view.isEnabled ).to.be.true;
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should create #focusCycler instance', () => {
			expect( view.focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).to.be.instanceOf( ViewCollection );
		} );
	} );

	describe( 'template', () => {
		it( 'should create element from the template', () => {
			expect( view.element.tagName ).to.equal( 'DIV' );
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-image-insert-url' ) ).to.true;

			const childNodes = view.element.childNodes;

			expect( childNodes[ 0 ] ).to.equal( view.urlInputView.element );
			expect( childNodes[ 1 ].tagName ).to.equal( 'DIV' );
			expect( childNodes[ 1 ].classList.contains( 'ck' ) ).to.be.true;
			expect( childNodes[ 1 ].classList.contains( 'ck-image-insert-url__action-row' ) ).to.be.true;

			const childNodes2 = childNodes[ 1 ].childNodes;

			expect( childNodes2[ 0 ] ).to.equal( view.insertButtonView.element );
			expect( childNodes2[ 1 ] ).to.equal( view.cancelButtonView.element );
		} );

		it( 'should use dedicated views', () => {
			expect( view.template.children[ 0 ] ).to.equal( view.urlInputView );
			expect( view.template.children[ 1 ].children[ 0 ] ).to.equal( view.insertButtonView );
			expect( view.template.children[ 1 ].children[ 1 ] ).to.equal( view.cancelButtonView );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).to.have.members( [
				view.urlInputView,
				view.insertButtonView,
				view.cancelButtonView
			] );
		} );

		it( 'should register child views\' #element in #focusTracker', () => {
			const view = new ImageInsertUrlView( { t: () => {} } );

			const spy = sinon.spy( view.focusTracker, 'add' );
			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.urlInputView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.insertButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 2 ), view.cancelButtonView.element );

			view.destroy();
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

				const spy = sinon.spy( view.insertButtonView, 'focus' );

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

				const spy = sinon.spy( view.insertButtonView, 'focus' );

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
		it( 'should focus the url input', () => {
			const spy = sinon.spy( view.urlInputView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should focus the last focusable', () => {
			const spy = sinon.spy( view.cancelButtonView, 'focus' );

			view.focus( -1 );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( '#urlInputView', () => {
		it( 'should be an instance of the LabeledFieldView', () => {
			expect( view.urlInputView ).to.be.instanceOf( LabeledFieldView );
		} );

		it( 'should accept text', () => {
			expect( view.urlInputView.fieldView ).to.be.instanceOf( InputTextView );
		} );

		it( 'should bind label to #isImageSelected', () => {
			view.isImageSelected = false;

			expect( view.urlInputView.label ).to.equal( 'Insert image via URL' );

			view.isImageSelected = true;

			expect( view.urlInputView.label ).to.equal( 'Update image URL' );
		} );

		it( 'should bind isEnabled to #isEnabled', () => {
			view.isEnabled = false;

			expect( view.urlInputView.isEnabled ).to.be.false;

			view.isEnabled = true;

			expect( view.urlInputView.isEnabled ).to.be.true;
		} );

		it( 'should set placeholder', () => {
			expect( view.urlInputView.placeholder ).to.equal( 'https://example.com/image.png' );
			expect( view.urlInputView.fieldView.placeholder ).to.equal( 'https://example.com/image.png' );
		} );

		it( 'should bind value to #imageURLInputValue', () => {
			view.imageURLInputValue = 'abc';

			expect( view.urlInputView.fieldView.value ).to.equal( 'abc' );

			view.imageURLInputValue = null;

			expect( view.urlInputView.fieldView.value ).to.equal( '' );
		} );

		it( 'should be bound with #imageURLInputValue', () => {
			view.urlInputView.fieldView.element.value = 'abc';
			view.urlInputView.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( 'abc' );

			view.urlInputView.fieldView.element.value = 'xyz';
			view.urlInputView.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( 'xyz' );
		} );

		it( 'should trim input value', () => {
			view.urlInputView.fieldView.element.value = '   ';
			view.urlInputView.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( '' );

			view.urlInputView.fieldView.element.value = '   test   ';
			view.urlInputView.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( 'test' );
		} );
	} );

	describe( '#insertButtonView', () => {
		it( 'should be an instance of the ButtonView', () => {
			expect( view.insertButtonView ).to.be.instanceOf( ButtonView );
		} );

		it( 'should have an icon', () => {
			expect( view.insertButtonView.icon ).to.equal( icons.check );
		} );

		it( 'should have a class', () => {
			expect( view.insertButtonView.class ).to.equal( 'ck-button-save' );
		} );

		it( 'should be a submit button', () => {
			expect( view.insertButtonView.type ).to.equal( 'submit' );
		} );

		it( 'should have text', () => {
			expect( view.insertButtonView.withText ).to.be.true;
		} );

		it( 'should bind label to #isImageSelected', () => {
			view.isImageSelected = false;

			expect( view.insertButtonView.label ).to.equal( 'Insert' );

			view.isImageSelected = true;

			expect( view.insertButtonView.label ).to.equal( 'Update' );
		} );

		it( 'should bind isEnabled to #isEnabled and #imageURLInputValue', () => {
			view.isEnabled = false;
			view.imageURLInputValue = '';

			expect( view.insertButtonView.isEnabled ).to.be.false;

			view.isEnabled = true;
			view.imageURLInputValue = 'abc';

			expect( view.insertButtonView.isEnabled ).to.be.true;

			view.isEnabled = false;
			view.imageURLInputValue = 'abc';

			expect( view.insertButtonView.isEnabled ).to.be.false;

			view.isEnabled = true;
			view.imageURLInputValue = '';

			expect( view.insertButtonView.isEnabled ).to.be.false;
		} );

		it( 'should fire "submit" event on insertButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'submit', spy );

			view.insertButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );
	} );

	describe( '#cancelButtonView', () => {
		it( 'should be an instance of the ButtonView', () => {
			expect( view.cancelButtonView ).to.be.instanceOf( ButtonView );
		} );

		it( 'should have an icon', () => {
			expect( view.cancelButtonView.icon ).to.equal( icons.cancel );
		} );

		it( 'should have a class', () => {
			expect( view.cancelButtonView.class ).to.equal( 'ck-button-cancel' );
		} );

		it( 'should be a plain button', () => {
			expect( view.cancelButtonView.type ).to.equal( 'button' );
		} );

		it( 'should have text', () => {
			expect( view.cancelButtonView.withText ).to.be.true;
		} );

		it( 'should have label', () => {
			expect( view.cancelButtonView.label ).to.equal( 'Cancel' );
		} );

		it( 'should bind isEnabled to #isEnabled', () => {
			view.isEnabled = false;

			expect( view.cancelButtonView.isEnabled ).to.be.false;

			view.isEnabled = true;

			expect( view.cancelButtonView.isEnabled ).to.be.true;

			view.isEnabled = false;

			expect( view.cancelButtonView.isEnabled ).to.be.false;
		} );

		it( 'should fire "cancel" event on cancelButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'cancel', spy );

			view.cancelButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );
	} );
} );
