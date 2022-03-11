/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, Event */

import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview';

import ImageUploadPanelView from '../../../src/imageinsert/ui/imageinsertpanelview';
import ImageUploadFormRowView from '../../../src/imageinsert/ui/imageinsertformrowview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import View from '@ckeditor/ckeditor5-ui/src/view';

import { createLabeledInputView } from '../../../src/imageinsert/utils';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'ImageUploadPanelView', () => {
	let view;

	beforeEach( () => {
		view = new ImageUploadPanelView( { t: val => val }, {
			'insertImageViaUrl': createLabeledInputView( { t: val => val } )
		} );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
		sinon.restore();
	} );

	describe( 'constructor()', () => {
		it( 'should contain instance of ButtonView as #insertButtonView', () => {
			expect( view.insertButtonView ).to.be.instanceOf( ButtonView );
			expect( view.insertButtonView.label ).to.equal( 'Insert' );
		} );

		it( 'should contain instance of ButtonView as #cancelButtonView', () => {
			expect( view.cancelButtonView ).to.be.instanceOf( ButtonView );
			expect( view.cancelButtonView.label ).to.equal( 'Cancel' );
		} );

		it( 'should contain instance of DropdownView as #dropdownView', () => {
			expect( view.dropdownView ).to.be.instanceOf( DropdownView );
		} );

		it( 'should contain instance of SplitButtonView for the #dropdownView button', () => {
			expect( view.dropdownView ).to.be.instanceOf( DropdownView );
			expect( view.dropdownView.buttonView ).to.be.instanceOf( SplitButtonView );
		} );

		it( 'should contain #imageURLInputValue', () => {
			expect( view.imageURLInputValue ).to.equal( '' );
		} );

		it( 'should contain #_integrations as an instance of Collection', () => {
			expect( view._integrations ).to.be.instanceOf( Collection );
		} );

		describe( 'integrations', () => {
			it( 'should contain 2 integrations when they were passed to the ImageUploadPanelView as integrations object', () => {
				const view = new ImageUploadPanelView( { t: val => val }, {
					'integration1': new View(),
					'integration2': new ButtonView()
				} );

				expect( view._integrations ).to.be.instanceOf( Collection );
				expect( view._integrations.length ).to.equal( 2 );
			} );

			it( 'should contain insertImageViaUrl view when it is passed via integrations object', () => {
				const view = new ImageUploadPanelView( { t: val => val }, {
					'insertImageViaUrl': createLabeledInputView( { t: val => val } ),
					'integration1': new View(),
					'integration2': new ButtonView()
				} );

				expect( view._integrations ).to.be.instanceOf( Collection );
				expect( view._integrations.length ).to.equal( 3 );
				expect( view._integrations.first ).to.be.instanceOf( LabeledFieldView );
			} );

			it( 'should contain no integrations when they were not provided', () => {
				const view = new ImageUploadPanelView( { t: val => val } );

				expect( view._integrations ).to.be.instanceOf( Collection );
				expect( view._integrations.length ).to.equal( 0 );
			} );
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

		describe( 'events', () => {
			it( 'should fire "submit" event on insertButtonView#execute', () => {
				const spy = sinon.spy();

				view.on( 'submit', spy );

				view.insertButtonView.fire( 'execute' );

				expect( spy.calledOnce ).to.true;
			} );

			it( 'should fire "cancel" event on cancelButtonView#execute', () => {
				const spy = sinon.spy();

				view.on( 'cancel', spy );

				view.cancelButtonView.fire( 'execute' );

				expect( spy.calledOnce ).to.true;
			} );
		} );
	} );

	describe( 'template', () => {
		it( 'should create element from the template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-image-insert-form' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should have form row view with buttons', () => {
			expect( view.template.children[ 1 ] ).to.be.instanceOf( ImageUploadFormRowView );
			expect( view.template.children[ 1 ].children.first ).to.equal( view.insertButtonView );
			expect( view.template.children[ 1 ].children.last ).to.equal( view.cancelButtonView );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).to.have.members( [
				...view._integrations,
				view.insertButtonView,
				view.cancelButtonView
			] );
		} );

		it( 'should register child views\' #element in #focusTracker with no integrations', () => {
			const view = new ImageUploadPanelView( { t: () => {} } );

			const spy = testUtils.sinon.spy( view.focusTracker, 'add' );
			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.insertButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.cancelButtonView.element );

			view.destroy();
		} );

		it( 'should register child views\' #element in #focusTracker with "insertImageViaUrl" integration', () => {
			const view = new ImageUploadPanelView( { t: () => {} }, {
				'insertImageViaUrl': createLabeledInputView( { t: val => val } )
			} );

			const spy = testUtils.sinon.spy( view.focusTracker, 'add' );

			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.getIntegration( 'insertImageViaUrl' ).element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.insertButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 2 ), view.cancelButtonView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new ImageUploadPanelView( { t: () => {} } );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
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

		it( 'intercepts the "selectstart" event of the first integration element with the high priority', () => {
			const spy = sinon.spy();
			const event = new Event( 'selectstart', {
				bubbles: true,
				cancelable: true
			} );

			event.stopPropagation = spy;

			view.getIntegration( 'insertImageViaUrl' ).element.dispatchEvent( event );
			sinon.assert.calledOnce( spy );
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
				view.focusTracker.focusedElement = view.getIntegration( 'insertImageViaUrl' ).element;

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
		it( 'should focus on the first integration', () => {
			const spy = sinon.spy( view.getIntegration( 'insertImageViaUrl' ), 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'Insert image via URL integration input', () => {
		it( 'should be bound with #imageURLInputValue', () => {
			const form = view.getIntegration( 'insertImageViaUrl' );

			form.fieldView.element.value = 'abc';
			form.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( 'abc' );

			form.fieldView.element.value = 'xyz';
			form.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( 'xyz' );
		} );

		it( 'should trim input value', () => {
			const form = view.getIntegration( 'insertImageViaUrl' );

			form.fieldView.element.value = '   ';
			form.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( '' );

			form.fieldView.element.value = '   test   ';
			form.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( 'test' );
		} );

		it( 'binds saveButtonView#isEnabled to URL input value', () => {
			const form = view.getIntegration( 'insertImageViaUrl' );
			const saveButtonView = view.template.children[ 1 ].children.first;

			expect( saveButtonView.isEnabled ).to.be.false;

			form.fieldView.element.value = 'test';
			form.fieldView.fire( 'input' );

			expect( view.imageURLInputValue ).to.equal( 'test' );
			expect( !!saveButtonView.isEnabled ).to.be.true;
		} );
	} );
} );
