/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import ButtonView from '../../../src/button/buttonview';
import SplitButtonView from '../../../src/dropdown/button/splitbuttonview';

describe( 'SplitButtonView', () => {
	let locale, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = { t() {} };

		view = new SplitButtonView( locale );
		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'creates view#actionView', () => {
			expect( view.actionView ).to.be.instanceOf( ButtonView );
			expect( view.actionView.element.classList.contains( 'ck-splitbutton__action' ) ).to.be.true;
		} );

		it( 'adds isToggleable to view#actionView', () => {
			expect( view.actionView.isToggleable ).to.be.false;

			view.isToggleable = true;

			expect( view.actionView.isToggleable ).to.be.true;
		} );

		it( 'creates view#arrowView', () => {
			expect( view.arrowView ).to.be.instanceOf( ButtonView );
			expect( view.arrowView.element.classList.contains( 'ck-splitbutton__arrow' ) ).to.be.true;
			expect( view.arrowView.element.attributes[ 'aria-haspopup' ].value ).to.equal( 'true' );
			expect( view.arrowView.icon ).to.be.not.undefined;
		} );

		it( 'creates element from template', () => {
			expect( view.element.tagName ).to.equal( 'DIV' );
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-splitbutton' ) ).to.be.true;
		} );

		it( 'binds #isVisible to the template', () => {
			expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.false;

			view.isVisible = false;

			expect( view.element.classList.contains( 'ck-hidden' ) ).to.be.true;

			// There should be no binding to the action view. Only the entire split button should react.
			expect( view.actionView.element.classList.contains( 'ck-hidden' ) ).to.be.false;
		} );

		it( 'binds arrowView#isOn to the template', () => {
			view.arrowView.isOn = true;
			expect( view.element.classList.contains( 'ck-splitbutton_open' ) ).to.be.true;

			view.arrowView.isOn = false;
			expect( view.element.classList.contains( 'ck-splitbutton_open' ) ).to.be.false;
		} );

		it( 'binds arrowView aria-expanded attribute to #isOn', () => {
			view.arrowView.isOn = true;
			expect( view.arrowView.element.getAttribute( 'aria-expanded' ) ).to.equal( 'true' );

			view.arrowView.isOn = false;
			expect( view.arrowView.element.getAttribute( 'aria-expanded' ) ).to.equal( 'false' );
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
			it( 'so "arrowright" on view#arrowView does nothing', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.arrowView.element;

				const spy = sinon.spy( view.actionView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( spy );
				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
			} );

			it( 'so "arrowleft" on view#arrowView focuses view#actionView', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowleft,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.arrowView.element;

				const spy = sinon.spy( view.actionView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( spy );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
			} );

			it( 'so "arrowright" on view#actionView focuses view#arrowView', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.actionView.element;

				const spy = sinon.spy( view.arrowView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( spy );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
			} );

			it( 'so "arrowleft" on view#actionsView does nothing', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowleft,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.actionView.element;

				const spy = sinon.spy( view.arrowView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( spy );
				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
			} );
		} );
	} );

	describe( 'bindings', () => {
		it( 'delegates actionView#execute to view#execute', () => {
			const spy = sinon.spy();

			view.on( 'execute', spy );

			view.actionView.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'binds actionView#icon to view', () => {
			expect( view.actionView.icon ).to.be.undefined;

			view.icon = 'foo';

			expect( view.actionView.icon ).to.equal( 'foo' );
		} );

		it( 'binds actionView#isEnabled to view', () => {
			expect( view.actionView.isEnabled ).to.be.true;

			view.isEnabled = false;

			expect( view.actionView.isEnabled ).to.be.false;
		} );

		it( 'binds actionView#label to view', () => {
			expect( view.actionView.label ).to.be.undefined;

			view.label = 'foo';

			expect( view.actionView.label ).to.equal( 'foo' );
		} );

		it( 'delegates arrowView#execute to view#open', () => {
			const spy = sinon.spy();

			view.on( 'open', spy );

			view.arrowView.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'binds arrowView#isEnabled to view', () => {
			expect( view.arrowView.isEnabled ).to.be.true;

			view.isEnabled = false;

			expect( view.arrowView.isEnabled ).to.be.false;
		} );

		it( 'binds actionView#tabindex to view', () => {
			expect( view.actionView.tabindex ).to.equal( -1 );

			view.tabindex = 1;

			expect( view.actionView.tabindex ).to.equal( 1 );
		} );

		// Makes little sense for split button but the Button interface specifies it, so let's support it.
		it( 'binds actionView#type to view', () => {
			expect( view.actionView.type ).to.equal( 'button' );

			view.type = 'submit';

			expect( view.actionView.type ).to.equal( 'submit' );
		} );

		it( 'binds actionView#withText to view', () => {
			expect( view.actionView.withText ).to.equal( false );

			view.withText = true;

			expect( view.actionView.withText ).to.equal( true );
		} );

		it( 'binds actionView#tooltipPosition to view', () => {
			expect( view.actionView.tooltipPosition ).to.equal( 's' );

			view.tooltipPosition = 'n';

			expect( view.actionView.tooltipPosition ).to.equal( 'n' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the actionButton', () => {
			const spy = sinon.spy( view.actionView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
