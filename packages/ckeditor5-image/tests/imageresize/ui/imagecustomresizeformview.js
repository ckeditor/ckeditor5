/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Event */

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import ImageCustomResizeFormView from '../../../src/imageresize/ui/imagecustomresizeformview.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler.js';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'ImageColumnResizeFormView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new ImageCustomResizeFormView( { t: () => {} }, '%', [] );
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			view.render();

			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-image-custom-resize-form' ) ).to.be.true;
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
			expect( view.cancelButtonView ).to.be.instanceOf( View );

			view.render();

			expect( view.saveButtonView.element.classList.contains( 'ck-button-save' ) ).to.be.true;
			expect( view.cancelButtonView.element.classList.contains( 'ck-button-cancel' ) ).to.be.true;
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should fire `cancel` event on cancelButtonView#execute', () => {
			const spy = sinon.spy();
			view.on( 'cancel', spy );
			view.cancelButtonView.fire( 'execute' );

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
					view.labeledInput,
					view.saveButtonView,
					view.cancelButtonView
				] );
			} );

			it( 'should register child views\' #element in #focusTracker', () => {
				const spy = testUtils.sinon.spy( view.focusTracker, 'add' );

				view.render();

				sinon.assert.calledWithExactly( spy.getCall( 0 ), view.labeledInput.element );
				sinon.assert.calledWithExactly( spy.getCall( 1 ), view.saveButtonView.element );
				sinon.assert.calledWithExactly( spy.getCall( 2 ), view.cancelButtonView.element );
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
					view.focusTracker.focusedElement = view.cancelButtonView.element;

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

	describe( 'isValid()', () => {
		it( 'should reset error after successful validation', () => {
			const view = new ImageCustomResizeFormView( { t: () => {} }, '%', [
				() => undefined
			] );

			expect( view.isValid() ).to.be.true;
			expect( view.labeledInput.errorText ).to.be.null;
		} );

		it( 'should display first error returned from validators list', () => {
			const view = new ImageCustomResizeFormView( { t: () => {} }, '%', [
				() => undefined,
				() => 'Foo bar',
				() => 'Another error'
			] );

			expect( view.isValid() ).to.be.false;
			expect( view.labeledInput.errorText ).to.be.equal( 'Foo bar' );
		} );

		it( 'should pass view reference as argument to validator', () => {
			const validatorSpy = sinon.spy();
			const view = new ImageCustomResizeFormView( { t: () => {} }, '%', [ validatorSpy ] );

			view.isValid();

			expect( validatorSpy ).to.be.calledOnceWithExactly( view );
		} );
	} );

	describe( 'rawSize getter', () => {
		beforeEach( () => {
			view.render();
		} );

		it( 'should return null `rawSize` if element is `null`', () => {
			view.labeledInput.fieldView.element = null;

			expect( view.rawSize ).to.be.equal( null );
		} );

		it( 'should return raw unparsed value of input element in `rawSize`', () => {
			view.labeledInput.fieldView.element.value = '1234';

			expect( view.rawSize ).to.be.equal( '1234' );
		} );
	} );

	describe( 'parsedSize getter', () => {
		beforeEach( () => {
			view.render();
		} );

		it( 'should return null `parsedSize` if element is `null`', () => {
			view.labeledInput.fieldView.element = null;

			expect( view.parsedSize ).to.be.equal( null );
		} );

		it( 'should return parsed value of input element in `parsedSize`', () => {
			view.labeledInput.fieldView.element.value = '1234';
			expect( view.parsedSize ).to.be.equal( 1234 );

			view.labeledInput.fieldView.element.value = '1234.5';
			expect( view.parsedSize ).to.be.equal( 1234.5 );
		} );

		it( 'should null if `rawSize` is not a number', () => {
			view.labeledInput.fieldView.element.value = '1234';
			sinon.stub( view, 'rawSize' ).get( () => 'Foo' );

			expect( view.parsedSize ).to.be.equal( null );
		} );
	} );

	describe( 'sizeWithUnits getter', () => {
		beforeEach( () => {
			view.render();
		} );

		it( 'should return null `sizeWithUnits` if element is `null`', () => {
			view.labeledInput.fieldView.element = null;

			expect( view.sizeWithUnits ).to.be.equal( null );
		} );

		it( 'should return parsed value of input element in `parsedSize`', () => {
			view.labeledInput.fieldView.element.value = '1234';
			expect( view.sizeWithUnits ).to.be.equal( '1234%' );

			view.labeledInput.fieldView.element.value = '1234.5';
			expect( view.sizeWithUnits ).to.be.equal( '1234.5%' );
		} );

		it( 'should null if `rawSize` is not a number', () => {
			view.labeledInput.fieldView.element.value = '1234';
			sinon.stub( view, 'rawSize' ).get( () => 'Foo' );

			expect( view.sizeWithUnits ).to.be.equal( null );
		} );
	} );

	describe( 'resetFormStatus()', () => {
		it( 'should clear form input errors', () => {
			view.labeledInput.errorText = 'Error';
			view.resetFormStatus();
			expect( view.labeledInput.errorText ).to.be.null;
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
