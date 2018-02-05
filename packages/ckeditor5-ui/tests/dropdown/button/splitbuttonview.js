/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import ButtonView from '../../../src/button/buttonview';
import SplitButtonView from '../../../src/dropdown/button/splitbuttonview';

testUtils.createSinonSandbox();

describe( 'SplitButtonView', () => {
	let locale, view;

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
		} );

		it( 'creates view#selectView', () => {
			expect( view.selectView ).to.be.instanceOf( ButtonView );
			expect( view.selectView.element.classList.contains( 'ck-splitbutton-select' ) ).to.be.true;
			expect( view.selectView.icon ).to.be.not.undefined;
		} );

		it( 'creates element from template', () => {
			expect( view.element.tagName ).to.equal( 'DIV' );
			expect( view.element.classList.contains( 'ck-splitbutton' ) ).to.be.true;
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
			it( 'so "arrowright" on view#selectView does nothing', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.selectView.element;

				const spy = sinon.spy( view.actionView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( spy );
				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
			} );

			it( 'so "arrowleft" on view#selectView focuses view#actionView', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowleft,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.selectView.element;

				const spy = sinon.spy( view.actionView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( spy );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
			} );

			it( 'so "arrowright" on view#actionView focuses view#selectView', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.actionView.element;

				const spy = sinon.spy( view.selectView, 'focus' );

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

				const spy = sinon.spy( view.selectView, 'focus' );

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

		it( 'delegates selectView#execute to view#select', () => {
			const spy = sinon.spy();

			view.on( 'select', spy );

			view.selectView.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'binds selectView#isEnabled to view', () => {
			expect( view.selectView.isEnabled ).to.be.true;

			view.isEnabled = false;

			expect( view.selectView.isEnabled ).to.be.false;
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
