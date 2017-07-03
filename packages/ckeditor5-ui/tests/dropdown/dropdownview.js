/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DropdownView from '../../src/dropdown/dropdownview';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import ButtonView from '../../src/button/buttonview';
import DropdownPanelView from '../../src/dropdown/dropdownpanelview';

describe( 'DropdownView', () => {
	let view, buttonView, panelView, locale;

	beforeEach( () => {
		locale = { t() {} };

		buttonView = new ButtonView( locale );
		panelView = new DropdownPanelView( locale );

		return ( view = new DropdownView( locale, buttonView, panelView ) ).init();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'sets view#buttonView', () => {
			expect( view.buttonView ).to.equal( buttonView );
		} );

		it( 'sets view#panelView', () => {
			expect( view.panelView ).to.equal( panelView );
		} );

		it( 'sets view#isOpen false', () => {
			expect( view.isOpen ).to.be.false;
		} );

		it( 'creates #focusTracker instance', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'creates #keystrokeHandler instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'creates #element from template', () => {
			expect( view.element.classList.contains( 'ck-dropdown' ) ).to.be.true;
			expect( view.element.firstChild ).to.equal( buttonView.element );
			expect( view.element.lastChild ).to.equal( panelView.element );
		} );

		it( 'sets view#buttonView class', () => {
			expect( view.buttonView.element.classList.contains( 'ck-dropdown__button' ) ).to.be.true;
		} );

		describe( 'bindings', () => {
			describe( 'view#isOpen to view.buttonView#execute', () => {
				it( 'is activated', () => {
					const values = [];

					view.on( 'change:isOpen', () => {
						values.push( view.isOpen );
					} );

					view.buttonView.fire( 'execute' );
					view.buttonView.fire( 'execute' );
					view.buttonView.fire( 'execute' );

					expect( values ).to.have.members( [ true, false, true ] );
				} );
			} );

			describe( 'view.panelView#isVisible to view#isOpen', () => {
				it( 'is activated', () => {
					const values = [];

					view.listenTo( view.panelView, 'change:isVisible', () => {
						values.push( view.isOpen );
					} );

					view.isOpen = true;
					view.isOpen = false;
					view.isOpen = true;

					expect( values ).to.have.members( [ true, false, true ] );
				} );
			} );
		} );
	} );

	describe( 'init()', () => {
		it( 'starts listening for #keystrokes coming from #element', () => {
			view = new DropdownView( locale,
				new ButtonView( locale ),
				new DropdownPanelView( locale ) );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.init();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );
		} );

		it( 'adds #element to #focusTracker', () => {
			view = new DropdownView( locale,
				new ButtonView( locale ),
				new DropdownPanelView( locale ) );

			const spy = sinon.spy( view.focusTracker, 'add' );

			view.init();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );
		} );

		describe( 'activates keyboard navigation for the dropdown', () => {
			it( 'so "arrowdown" opens the #panelView', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.buttonView.isEnabled = true;

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
				expect( view.isOpen ).to.be.true;

				view.isOpen = false;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				expect( view.isOpen ).to.be.true;
			} );

			it( 'so "arrowdown" won\'t open the #panelView when #isEnabled is false', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.buttonView.isEnabled = false;
				view.isOpen = false;

				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
				expect( view.isOpen ).to.be.false;
			} );

			it( 'so "arrowright" is blocked', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowright,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				view.false = true;
				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
				expect( view.isOpen ).to.be.false;

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				expect( view.isOpen ).to.be.true;
			} );

			it( 'so "arrowleft" closes the #panelView', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowleft,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};
				const spy = sinon.spy( view.buttonView, 'focus' );

				view.isOpen = false;
				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
				sinon.assert.notCalled( spy );
				expect( view.isOpen ).to.be.false;

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
				expect( view.isOpen ).to.be.false;
			} );

			it( 'so "esc" closes the #panelView', () => {
				const keyEvtData = {
					keyCode: keyCodes.esc,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};
				const spy = sinon.spy( view.buttonView, 'focus' );

				view.isOpen = false;
				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( keyEvtData.preventDefault );
				sinon.assert.notCalled( keyEvtData.stopPropagation );
				sinon.assert.notCalled( spy );
				expect( view.isOpen ).to.be.false;

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
				expect( view.isOpen ).to.be.false;
			} );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #buttonView in DOM', () => {
			const spy = sinon.spy( view.buttonView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
