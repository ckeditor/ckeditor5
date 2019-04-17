/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownView from '../../src/dropdown/dropdownview';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import ButtonView from '../../src/button/buttonview';
import DropdownPanelView from '../../src/dropdown/dropdownpanelview';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'DropdownView', () => {
	let view, buttonView, panelView, locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = { t() {} };

		buttonView = new ButtonView( locale );
		panelView = new DropdownPanelView( locale );

		view = new DropdownView( locale, buttonView, panelView );
		view.render();

		// The #panelView positioning depends on the utility that uses DOM Rects.
		// To avoid an avalanche of warnings (DOM Rects do not work until
		// the element is in DOM), let's allow the dropdown to render in DOM.
		global.document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
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

		it( 'sets view#isEnabled true', () => {
			expect( view.isEnabled ).to.be.true;
		} );

		it( 'sets view#panelPosition "auto"', () => {
			expect( view.panelPosition ).to.equal( 'auto' );
		} );

		it( 'creates #focusTracker instance', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'creates #keystrokeHandler instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'creates #element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-dropdown' ) ).to.be.true;
			expect( view.element.children ).to.have.length( 2 );
			expect( view.element.children[ 0 ] ).to.equal( buttonView.element );
			expect( view.element.children[ 1 ] ).to.equal( panelView.element );
		} );

		it( 'sets view#buttonView class', () => {
			expect( view.buttonView.element.classList.contains( 'ck-dropdown__button' ) ).to.be.true;
		} );

		describe( 'bindings', () => {
			describe( 'view#isOpen to view.buttonView#select', () => {
				it( 'is activated', () => {
					const values = [];

					view.on( 'change:isOpen', () => {
						values.push( view.isOpen );
					} );

					view.buttonView.fire( 'open' );
					view.buttonView.fire( 'open' );
					view.buttonView.fire( 'open' );

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

			describe( 'view.panelView#position to view#panelPosition', () => {
				it( 'does not update until the dropdown is opened', () => {
					view.isOpen = false;
					view.panelPosition = 'nw';

					expect( panelView.position ).to.equal( 'se' );

					view.isOpen = true;

					expect( panelView.position ).to.equal( 'nw' );
				} );

				describe( 'in "auto" mode', () => {
					beforeEach( () => {
						// Bloat the panel a little to give the positioning algorithm something to
						// work with. If the panel was empty, any smart positioning is pointless.
						// Placing an empty element in the viewport isn't that hard, right?
						panelView.element.style.width = '200px';
						panelView.element.style.height = '200px';
					} );

					it( 'defaults to "south-east" when there is a plenty of space around', () => {
						const windowRect = new Rect( global.window );

						// "Put" the dropdown in the middle of the viewport.
						stubElementClientRect( view.buttonView.element, {
							top: windowRect.height / 2,
							left: windowRect.width / 2,
							width: 10,
							height: 10
						} );

						view.isOpen = true;

						expect( panelView.position ).to.equal( 'se' );
					} );

					it( 'when the dropdown in the north-west corner of the viewport', () => {
						stubElementClientRect( view.buttonView.element, {
							top: 0,
							left: 0,
							width: 100,
							height: 10
						} );

						view.isOpen = true;

						expect( panelView.position ).to.equal( 'se' );
					} );

					it( 'when the dropdown in the north-east corner of the viewport', () => {
						const windowRect = new Rect( global.window );

						stubElementClientRect( view.buttonView.element, {
							top: 0,
							left: windowRect.right - 100,
							width: 100,
							height: 10
						} );

						view.isOpen = true;

						expect( panelView.position ).to.equal( 'sw' );
					} );

					it( 'when the dropdown in the south-west corner of the viewport', () => {
						const windowRect = new Rect( global.window );

						stubElementClientRect( view.buttonView.element, {
							top: windowRect.bottom - 10,
							left: 0,
							width: 100,
							height: 10
						} );

						view.isOpen = true;

						expect( panelView.position ).to.equal( 'ne' );
					} );

					it( 'when the dropdown in the south-east corner of the viewport', () => {
						const windowRect = new Rect( global.window );

						stubElementClientRect( view.buttonView.element, {
							top: windowRect.bottom - 10,
							left: windowRect.right - 100,
							width: 100,
							height: 10
						} );

						view.isOpen = true;

						expect( panelView.position ).to.equal( 'nw' );
					} );
				} );
			} );

			describe( 'DOM element bindings', () => {
				describe( 'class', () => {
					it( 'reacts on view#isEnabled', () => {
						view.isEnabled = true;
						expect( view.element.classList.contains( 'ck-disabled' ) ).to.be.false;

						view.isEnabled = false;
						expect( view.element.classList.contains( 'ck-disabled' ) ).to.be.true;
					} );

					it( 'reacts on view#class', () => {
						view.class = 'custom-css-class';
						expect( view.element.classList.contains( 'custom-css-class' ) ).to.be.true;
					} );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'starts listening for #keystrokes coming from #element', () => {
			view = new DropdownView( locale,
				new ButtonView( locale ),
				new DropdownPanelView( locale ) );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );
		} );

		it( 'adds #element to #focusTracker', () => {
			view = new DropdownView( locale,
				new ButtonView( locale ),
				new DropdownPanelView( locale ) );

			const spy = sinon.spy( view.focusTracker, 'add' );

			view.render();
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

function stubElementClientRect( element, data ) {
	const clientRect = Object.assign( {}, data );

	clientRect.right = clientRect.left + clientRect.width;
	clientRect.bottom = clientRect.top + clientRect.height;

	testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( clientRect );
}
