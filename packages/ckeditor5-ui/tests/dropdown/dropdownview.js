/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DropdownView from '../../src/dropdown/dropdownview.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import ButtonView from '../../src/button/buttonview.js';
import DropdownPanelView from '../../src/dropdown/dropdownpanelview.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { FocusTracker } from '@ckeditor/ckeditor5-utils';

describe( 'DropdownView', () => {
	let view, buttonView, panelView, locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = {
			uiLanguageDirection: 'ltr',
			t() {}
		};

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

		it( 'sets view#class', () => {
			expect( view.class ).to.be.undefined;
		} );

		it( 'sets view#id', () => {
			expect( view.id ).to.be.undefined;
		} );

		it( 'sets view#panelPosition "auto"', () => {
			expect( view.panelPosition ).to.equal( 'auto' );
		} );

		it( 'creates #keystrokeHandler instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'creates #focusTracker instance', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
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
				it( 'is activated before the view gets rendered', () => {
					const panelView = new DropdownPanelView( locale );
					const buttonView = new ButtonView( locale );
					const view = new DropdownView( locale, buttonView, panelView );
					const values = [];

					view.listenTo( view.panelView, 'change:isVisible', () => {
						values.push( view.isOpen );
					} );

					view.isOpen = true;
					view.isOpen = false;
					view.isOpen = true;

					expect( values ).to.have.members( [ true, false, true ] );

					view.destroy();
					buttonView.destroy();
					panelView.destroy();
				} );
			} );

			describe( 'view.panelView#position to view#panelPosition', () => {
				it( 'does not update until the dropdown is open', () => {
					view.isOpen = false;
					view.panelPosition = 'nw';

					expect( panelView.position ).to.equal( 'se' );

					view.isOpen = true;

					expect( panelView.position ).to.equal( 'nw' );
				} );

				describe( 'in "auto" mode', () => {
					it( 'uses _getOptimalPosition() and a dedicated set of positions (LTR)', () => {
						const spy = testUtils.sinon.spy( DropdownView, '_getOptimalPosition' );
						const {
							south, north,
							southEast, southWest,
							northEast, northWest,
							southMiddleEast, southMiddleWest,
							northMiddleEast, northMiddleWest
						} = DropdownView.defaultPanelPositions;

						view.isOpen = true;

						sinon.assert.calledWithExactly( spy, sinon.match( {
							element: panelView.element,
							target: buttonView.element,
							positions: [
								southEast, southWest, southMiddleEast, southMiddleWest, south,
								northEast, northWest, northMiddleEast, northMiddleWest, north
							],
							fitInViewport: true
						} ) );
					} );

					it( 'uses _getOptimalPosition() and a dedicated set of positions (RTL)', () => {
						const spy = testUtils.sinon.spy( DropdownView, '_getOptimalPosition' );
						const {
							south, north,
							southEast, southWest,
							northEast, northWest,
							southMiddleEast, southMiddleWest,
							northMiddleEast, northMiddleWest
						} = DropdownView.defaultPanelPositions;

						view.locale.uiLanguageDirection = 'rtl';
						view.isOpen = true;

						sinon.assert.calledWithExactly( spy, sinon.match( {
							element: panelView.element,
							target: buttonView.element,
							positions: [
								southWest, southEast, southMiddleWest, southMiddleEast, south,
								northWest, northEast, northMiddleWest, northMiddleEast, north
							],
							fitInViewport: true
						} ) );
					} );

					it( 'fallback when _getOptimalPosition() will return null', () => {
						const locale = {
							t() {}
						};

						const buttonView = new ButtonView( locale );
						const panelView = new DropdownPanelView( locale );

						const view = new DropdownView( locale, buttonView, panelView );
						view.render();

						const parentWithOverflow = global.document.createElement( 'div' );
						parentWithOverflow.style.width = '1px';
						parentWithOverflow.style.height = '1px';
						parentWithOverflow.style.marginTop = '-1000px';
						parentWithOverflow.style.overflow = 'scroll';

						parentWithOverflow.appendChild( view.element );

						global.document.body.appendChild( parentWithOverflow );

						view.isOpen = true;

						expect( view.panelView.position ).is.equal( 'se' ); // first position from position list.

						view.element.remove();
						parentWithOverflow.remove();
					} );

					it( 'fallback when _getOptimalPosition() will return null (RTL)', () => {
						const locale = {
							t() {}
						};

						const buttonView = new ButtonView( locale );
						const panelView = new DropdownPanelView( locale );

						const view = new DropdownView( locale, buttonView, panelView );

						view.locale.uiLanguageDirection = 'rtl';
						view.render();

						const parentWithOverflow = global.document.createElement( 'div' );
						parentWithOverflow.style.width = '1px';
						parentWithOverflow.style.height = '1px';
						parentWithOverflow.style.marginTop = '-1000px';
						parentWithOverflow.style.overflow = 'scroll';

						parentWithOverflow.appendChild( view.element );

						global.document.body.appendChild( parentWithOverflow );

						view.isOpen = true;

						expect( view.panelView.position ).is.equal( 'sw' ); // first position from position list.

						view.element.remove();
						parentWithOverflow.remove();
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

				describe( 'id', () => {
					it( 'reacts on view#id', () => {
						view.id = 'foo';
						expect( view.element.id ).to.equal( 'foo' );
					} );
				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'registers child views in #focusTracker', () => {
			const view = new DropdownView( locale,
				new ButtonView( locale ),
				new DropdownPanelView( locale ) );

			const addSpy = sinon.spy( view.focusTracker, 'add' );

			view.render();

			sinon.assert.calledTwice( addSpy );
			sinon.assert.calledWithExactly( addSpy.firstCall, view.buttonView.element );
			sinon.assert.calledWithExactly( addSpy.secondCall, view.panelView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new DropdownView( locale,
				new ButtonView( locale ),
				new DropdownPanelView( locale ) );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.element.remove();
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
				sinon.assert.notCalled( spy );
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
				sinon.assert.notCalled( spy );
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

	describe( 'DropdownView.defaultPanelPositions', () => {
		let positions, buttonRect, panelRect;

		beforeEach( () => {
			positions = DropdownView.defaultPanelPositions;

			buttonRect = {
				top: 100,
				bottom: 200,
				left: 500,
				right: 200,
				width: 100,
				height: 100
			};

			panelRect = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				width: 400,
				height: 50
			};
		} );

		it( 'should have a proper length', () => {
			expect( Object.keys( positions ) ).to.have.length( 10 );
		} );

		it( 'should define the "south" position', () => {
			expect( positions.south( buttonRect, panelRect ) ).to.deep.equal( {
				top: 200,
				left: 350,
				name: 's'
			} );
		} );

		it( 'should define the "southEast" position', () => {
			expect( positions.southEast( buttonRect, panelRect ) ).to.deep.equal( {
				top: 200,
				left: 500,
				name: 'se'
			} );
		} );

		it( 'should define the "southWest" position', () => {
			expect( positions.southWest( buttonRect, panelRect ) ).to.deep.equal( {
				top: 200,
				left: 200,
				name: 'sw'
			} );
		} );

		it( 'should define the "southMiddleEast" position', () => {
			expect( positions.southMiddleEast( buttonRect, panelRect ) ).to.deep.equal( {
				top: 200,
				left: 425,
				name: 'sme'
			} );
		} );

		it( 'should define the "southMiddleWest" position', () => {
			expect( positions.southMiddleWest( buttonRect, panelRect ) ).to.deep.equal( {
				top: 200,
				left: 275,
				name: 'smw'
			} );
		} );

		it( 'should define the "north" position', () => {
			expect( positions.north( buttonRect, panelRect ) ).to.deep.equal( {
				top: 50,
				left: 350,
				name: 'n'
			} );
		} );

		it( 'should define the "northEast" position', () => {
			expect( positions.northEast( buttonRect, panelRect ) ).to.deep.equal( {
				top: 50,
				left: 500,
				name: 'ne'
			} );
		} );

		it( 'should define the "northWest" position', () => {
			expect( positions.northWest( buttonRect, panelRect ) ).to.deep.equal( {
				top: 50,
				left: 200,
				name: 'nw'
			} );
		} );

		it( 'should define the "northMiddleEast" position', () => {
			expect( positions.northMiddleEast( buttonRect, panelRect ) ).to.deep.equal( {
				top: 50,
				left: 425,
				name: 'nme'
			} );
		} );

		it( 'should define the "northMiddleWest" position', () => {
			expect( positions.northMiddleWest( buttonRect, panelRect ) ).to.deep.equal( {
				top: 50,
				left: 275,
				name: 'nmw'
			} );
		} );
	} );
} );
