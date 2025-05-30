/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ImageInsertFormView from '../../../src/imageinsert/ui/imageinsertformview.js';
import ImageInsertUrlView from '../../../src/imageinsert/ui/imageinserturlview.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler.js';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection.js';
import CollapsibleView from '@ckeditor/ckeditor5-ui/src/collapsible/collapsibleview.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'ImageInsertFormView', () => {
	let view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new ImageInsertFormView( { t: val => val } );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
	} );

	describe( 'constructor()', () => {
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

		it( 'should have #children view collection', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
		} );
	} );

	describe( 'integrations', () => {
		it( 'single integrations', () => {
			const inputIntegrationView = new ImageInsertUrlView( { t: val => val } );

			const view = new ImageInsertFormView( { t: val => val }, [
				inputIntegrationView
			] );

			expect( view._focusables.map( f => f ) ).to.have.members( [
				inputIntegrationView
			] );

			expect( view.children.map( f => f ) ).to.have.members( [
				inputIntegrationView
			] );
		} );

		it( 'multiple integrations', () => {
			const buttonIntegrationView = new ButtonView( { t: val => val } );
			const inputIntegrationView = new ImageInsertUrlView( { t: val => val } );

			const view = new ImageInsertFormView( { t: val => val }, [
				buttonIntegrationView,
				inputIntegrationView
			] );

			expect( view._focusables.map( f => f ) ).to.have.members( [
				buttonIntegrationView,
				inputIntegrationView
			] );

			expect( view.children.map( f => f ) ).to.have.members( [
				buttonIntegrationView,
				inputIntegrationView
			] );
		} );

		it( 'integrations with collapsible view', () => {
			const buttonIntegrationView = new ButtonView( { t: val => val } );
			const inputIntegrationView = new ImageInsertUrlView( { t: val => val } );
			const collapsibleIntegrationView = new CollapsibleView( { t: val => val }, [
				inputIntegrationView
			] );

			const view = new ImageInsertFormView( { t: val => val }, [
				buttonIntegrationView,
				collapsibleIntegrationView
			] );

			expect( view._focusables.map( f => f ) ).to.have.members( [
				buttonIntegrationView,
				collapsibleIntegrationView,
				inputIntegrationView
			] );

			expect( view.children.map( f => f ) ).to.have.members( [
				buttonIntegrationView,
				collapsibleIntegrationView
			] );
		} );
	} );

	describe( 'template', () => {
		it( 'should create element from the template', () => {
			expect( view.element.tagName ).to.equal( 'FORM' );
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-image-insert-form' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should bind #children', () => {
			expect( view.template.children[ 0 ] ).to.equal( view.children );
		} );
	} );

	describe( 'render()', () => {
		it( 'should handle and delegate DOM submit event', () => {
			const spy = sinon.spy();

			view.on( 'submit', spy );
			view.element.dispatchEvent( new Event( 'submit' ) );

			expect( spy.calledOnce ).to.true;
		} );

		it( 'should register focusables in #focusTracker', () => {
			const buttonIntegrationView = new ButtonView( { t: val => val } );
			const inputIntegrationView = new ImageInsertUrlView( { t: val => val } );
			const collapsibleIntegrationView = new CollapsibleView( { t: val => val }, [
				inputIntegrationView
			] );

			const view = new ImageInsertFormView( { t: () => {} }, [
				buttonIntegrationView,
				collapsibleIntegrationView
			] );

			const spy = sinon.spy( view.focusTracker, 'add' );

			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), buttonIntegrationView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), collapsibleIntegrationView.element );
			sinon.assert.calledWithExactly( spy.getCall( 2 ), inputIntegrationView.element );
			sinon.assert.calledThrice( spy );

			view.destroy();
		} );

		describe( 'activates keyboard navigation', () => {
			let view, firstIntegrationView, secondIntegrationView;

			beforeEach( () => {
				firstIntegrationView = new ButtonView( { t: val => val } );
				secondIntegrationView = new ButtonView( { t: val => val } );

				view = new ImageInsertFormView( { t: () => {} }, [
					firstIntegrationView,
					secondIntegrationView
				] );

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

				// Mock the first integration focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = firstIntegrationView.element;

				const spy = sinon.spy( secondIntegrationView, 'focus' );

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
				view.focusTracker.focusedElement = secondIntegrationView.element;

				const spy = sinon.spy( firstIntegrationView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
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
		it( 'should focus first focusable', () => {
			const spy = sinon.spy( view._focusCycler, 'focusFirst' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'focus cycling', () => {
		let view, buttonIntegrationView, otherButtonIntegrationView;

		beforeEach( () => {
			buttonIntegrationView = new ButtonView( { t: val => val } );
			otherButtonIntegrationView = new ButtonView( { t: val => val } );
		} );

		describe( 'single button integration', () => {
			beforeEach( () => {
				view = new ImageInsertFormView( { t: val => val }, [
					buttonIntegrationView
				] );

				view.render();
				document.body.appendChild( view.element );
			} );

			afterEach( () => {
				view.element.remove();
				view.destroy();
			} );

			it( 'forward cycling', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: false,
					stopPropagation: sinon.spy(),
					preventDefault: sinon.spy()
				};

				view.focus();
				expect( view.focusTracker.focusedElement ).to.equal( buttonIntegrationView.element );

				view.keystrokes.press( keyEvtData );
				expect( view.focusTracker.focusedElement ).to.equal( buttonIntegrationView.element );
			} );

			it( 'backward cycling', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					stopPropagation: sinon.spy(),
					preventDefault: sinon.spy()
				};

				view.focus();
				expect( view.focusTracker.focusedElement ).to.equal( buttonIntegrationView.element );

				view.keystrokes.press( keyEvtData );
				expect( view.focusTracker.focusedElement ).to.equal( buttonIntegrationView.element );
			} );
		} );

		describe( 'multiple button integrations', () => {
			beforeEach( () => {
				view = new ImageInsertFormView( { t: val => val }, [
					buttonIntegrationView,
					otherButtonIntegrationView
				] );

				view.render();
				document.body.appendChild( view.element );
			} );

			afterEach( () => {
				view.element.remove();
				view.destroy();
			} );

			it( 'forward cycling', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: false,
					stopPropagation: sinon.spy(),
					preventDefault: sinon.spy()
				};

				view.focus();
				expect( view.focusTracker.focusedElement ).to.equal( buttonIntegrationView.element );

				view.keystrokes.press( keyEvtData );
				expect( view.focusTracker.focusedElement ).to.equal( otherButtonIntegrationView.element );

				view.keystrokes.press( keyEvtData );
				expect( view.focusTracker.focusedElement ).to.equal( buttonIntegrationView.element );
			} );

			it( 'backward cycling', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					stopPropagation: sinon.spy(),
					preventDefault: sinon.spy()
				};

				view.focus();
				expect( view.focusTracker.focusedElement ).to.equal( buttonIntegrationView.element );

				view.keystrokes.press( keyEvtData );
				expect( view.focusTracker.focusedElement ).to.equal( otherButtonIntegrationView.element );

				view.keystrokes.press( keyEvtData );
				expect( view.focusTracker.focusedElement ).to.equal( buttonIntegrationView.element );
			} );
		} );
	} );
} );
