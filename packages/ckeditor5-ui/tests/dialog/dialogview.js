/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconCancel } from '@ckeditor/ckeditor5-icons';
import { FocusTracker, KeystrokeHandler, Locale, global, keyCodes } from '@ckeditor/ckeditor5-utils';
import { ButtonView, FormHeaderView, View, ViewCollection } from '../../src/index.js';
import DialogView, { DialogViewPosition } from '../../src/dialog/dialogview.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'DialogView', () => {
	let view, fakeDomRootElement;
	let getCurrentDomRootStub, getViewportOffsetStub;
	const locale = new Locale();

	testUtils.createSinonSandbox();

	beforeEach( () => {
		fakeDomRootElement = document.createElement( 'div' );

		getCurrentDomRootStub = testUtils.sinon.stub().returns( fakeDomRootElement );
		getViewportOffsetStub = testUtils.sinon.stub().returns( {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		} );

		testUtils.sinon.stub( global.window, 'innerWidth' ).value( 500 );
		testUtils.sinon.stub( global.window, 'innerHeight' ).value( 500 );

		view = new DialogView( locale, {
			getCurrentDomRoot: getCurrentDomRootStub,
			getViewportOffset: getViewportOffsetStub
		} );
	} );

	it( 'should have #defaultOffset set', () => {
		expect( DialogView.defaultOffset ).to.equal( 15 );
	} );

	describe( 'constructor()', () => {
		describe( 'properties', () => {
			it( 'should include the collection of #parts', () => {
				expect( view.parts ).to.be.an.instanceOf( ViewCollection );
			} );

			it( 'should include an instance of KeystrokeHandler', () => {
				expect( view.keystrokes ).to.be.an.instanceOf( KeystrokeHandler );
			} );

			it( 'should include an instance of FocusTracker', () => {
				expect( view.focusTracker ).to.be.an.instanceOf( FocusTracker );
			} );

			it( 'should have #_isVisible set', () => {
				expect( view._isVisible ).to.be.false;
			} );

			it( 'should have #_isTransparent set', () => {
				expect( view._isTransparent ).to.be.false;
			} );

			it( 'should have #isModal set', () => {
				expect( view.isModal ).to.be.false;
			} );

			it( 'should have #wasMoved set', () => {
				expect( view.wasMoved ).to.be.false;
			} );

			it( 'should have #className set', () => {
				expect( view.className ).to.equal( '' );
			} );

			it( 'should have the `aria-label` attribute set', () => {
				expect( view.ariaLabel ).to.equal( 'Editor dialog' );
			} );

			it( 'should have #position set', () => {
				expect( view.position ).to.equal( DialogViewPosition.SCREEN_CENTER );
			} );

			it( 'should have #_top set', () => {
				expect( view._top ).to.equal( 0 );
			} );

			it( 'should have #_left set', () => {
				expect( view._left ).to.equal( 0 );
			} );
		} );

		describe( 'template', () => {
			beforeEach( () => {
				view.render();
			} );

			describe( 'overlay', () => {
				let overlayElement;

				beforeEach( () => {
					overlayElement = view.element;
				} );

				it( 'should have CSS classes', () => {
					expect( overlayElement.classList.contains( 'ck' ) ).to.be.true;
					expect( overlayElement.classList.contains( 'ck-dialog-overlay' ) ).to.be.true;
				} );

				it( 'should have a tabindex', () => {
					expect( overlayElement.tabIndex ).to.equal( -1 );
				} );

				it( 'should have a CSS class bound to #isModal', () => {
					view.isModal = false;
					expect( overlayElement.classList.contains( 'ck-dialog-overlay__transparent' ) ).to.be.true;
					view.isModal = true;
					expect( overlayElement.classList.contains( 'ck-dialog-overlay__transparent' ) ).to.be.false;
				} );

				it( 'should have a CSS class bound to #_isVisible', () => {
					view._isVisible = false;
					expect( overlayElement.classList.contains( 'ck-hidden' ) ).to.be.true;
					view._isVisible = true;
					expect( overlayElement.classList.contains( 'ck-hidden' ) ).to.be.false;
				} );

				it( 'should host the dialog', () => {
					expect( overlayElement.firstChild.classList.contains( 'ck-dialog' ) ).to.be.true;
				} );

				it( 'should set the CSS class on the dialog element in the modal mode', () => {
					view.isModal = false;
					expect( overlayElement.firstChild.classList.contains( 'ck-dialog_modal' ) ).to.be.false;

					view.isModal = true;
					expect( overlayElement.firstChild.classList.contains( 'ck-dialog_modal' ) ).to.be.true;
				} );
			} );

			describe( 'dialog', () => {
				let innerDialogElement;

				beforeEach( () => {
					innerDialogElement = view.element.firstChild;
				} );

				it( 'should have CSS classes', () => {
					expect( innerDialogElement.classList.contains( 'ck' ) ).to.be.true;
					expect( innerDialogElement.classList.contains( 'ck-dialog' ) ).to.be.true;
				} );

				it( 'should have a CSS class bound to #className', () => {
					view.className = 'foo';
					expect( innerDialogElement.classList.contains( 'foo' ) ).to.be.true;
				} );

				it( 'should have a tabindex', () => {
					expect( innerDialogElement.tabIndex ).to.equal( -1 );
				} );

				it( 'should have CSS top bound to #_top', () => {
					view._top = 123;
					expect( innerDialogElement.style.top ).to.equal( '123px' );
				} );

				it( 'should have CSS left bound to #_left', () => {
					view._left = 123;
					expect( innerDialogElement.style.left ).to.equal( '123px' );
				} );

				it( 'should have a role set', () => {
					expect( innerDialogElement.role ).to.equal( 'dialog' );
				} );

				it( 'should have aria-label bound to #ariaLabel', () => {
					view.ariaLabel = 'foo';
					expect( innerDialogElement.ariaLabel ).to.equal( 'foo' );
				} );

				it( 'should have CSS visibility bound to #_isTransparent', () => {
					view._isTransparent = true;
					expect( innerDialogElement.style.visibility ).to.equal( 'hidden' );
					view._isTransparent = false;
					expect( innerDialogElement.style.visibility ).to.equal( '' );
				} );

				it( 'should host the collection of #parts', () => {
					const testView = new View();

					testView.setTemplate( { tag: 'div' } );

					view.parts.add( testView );

					expect( innerDialogElement.firstChild ).to.equal( testView.element );
				} );
			} );
		} );

		describe( 'focus tracking and cycling', () => {
			let childViewA, childViewB, keyEvtData;
			let focusSpies;

			beforeEach( async () => {
				childViewA = createContentView( 'A' );
				childViewB = createContentView( 'B' );

				view.render();
				view._isVisible = true;

				document.body.appendChild( view.element );

				view.setupParts( {
					title: 'foo',
					content: [ childViewA, childViewB ],
					actionButtons: [
						{ label: 'foo' },
						{ label: 'bar' }
					]
				} );

				// The view gets focused when #_isVisible is set to true. Let's wait for the focus to move and
				// then start the spies
				await wait( 20 );

				focusSpies = {
					closeButton: testUtils.sinon.spy( view.headerView.children.last, 'focus' ),
					childA: testUtils.sinon.spy( childViewA, 'focus' ),
					childB: testUtils.sinon.spy( childViewB, 'focus' ),
					actionFoo: testUtils.sinon.spy( view.actionsView.children.first, 'focus' ),
					actionBar: testUtils.sinon.spy( view.actionsView.children.last, 'focus' )
				};
			} );

			afterEach( () => {
				view.element.remove();
			} );

			describe( 'upon pressing Tab', () => {
				beforeEach( () => {
					keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};
				} );

				it( 'should navigate forward across all parts and sub-views', async () => {
					view.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.childB );

					view.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.actionFoo );

					view.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.actionBar );

					view.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.closeButton );

					view.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.childA );
				} );

				it( 'should cycle forward correctly if there are only action buttons', async () => {
					const newView = new DialogView( locale, {
						getCurrentDomRoot: getCurrentDomRootStub,
						getViewportOffset: getViewportOffsetStub
					} );

					newView.render();
					newView._isVisible = true;

					document.body.appendChild( newView.element );

					newView.setupParts( {
						actionButtons: [
							{ label: 'foo' },
							{ label: 'bar' }
						]
					} );

					// The view gets focused when #_isVisible is set to true. Let's wait for the focus to move and
					// then start the spies
					await wait( 10 );

					focusSpies = {
						actionFoo: testUtils.sinon.spy( newView.actionsView.children.first, 'focus' ),
						actionBar: testUtils.sinon.spy( newView.actionsView.children.last, 'focus' )
					};

					newView.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.actionBar );

					newView.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.actionFoo );

					newView.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledTwice( focusSpies.actionBar );

					newView.element.remove();
				} );
			} );

			describe( 'upon pressing Shift+Tab', () => {
				beforeEach( () => {
					keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};
				} );

				it( 'should navigate forward across all parts and sub-views', async () => {
					view.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.closeButton );

					view.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.actionBar );

					view.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.actionFoo );

					view.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.childB );

					view.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.childA );
				} );

				it( 'should cycle backwards correctly if there are only action buttons', async () => {
					const newView = new DialogView( locale, {
						getCurrentDomRoot: getCurrentDomRootStub,
						getViewportOffset: getViewportOffsetStub
					} );

					newView.render();
					newView._isVisible = true;

					document.body.appendChild( newView.element );

					newView.setupParts( {
						actionButtons: [
							{ label: 'foo' },
							{ label: 'bar' }
						]
					} );

					// The view gets focused when #_isVisible is set to true. Let's wait for the focus to move and
					// then start the spies
					await wait( 10 );

					focusSpies = {
						actionFoo: testUtils.sinon.spy( newView.actionsView.children.first, 'focus' ),
						actionBar: testUtils.sinon.spy( newView.actionsView.children.last, 'focus' )
					};

					newView.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.actionBar );

					newView.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledOnce( focusSpies.actionFoo );

					newView.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					sinon.assert.calledTwice( focusSpies.actionBar );

					newView.element.remove();
				} );
			} );
		} );

		describe( 'keystrokeHandlerOptions', () => {
			it( 'should use passed keystroke handler options filter', async () => {
				const filterSpy = sinon.spy();

				const newView = new DialogView( locale, {
					getCurrentDomRoot: getCurrentDomRootStub,
					getViewportOffset: getViewportOffsetStub,
					keystrokeHandlerOptions: {
						filter: filterSpy
					}
				} );

				newView.render();

				newView.keystrokes.press( {
					keyCode: keyCodes.tab,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				} );

				await wait( 5 );

				expect( filterSpy ).to.be.calledOnce;
			} );
		} );
	} );

	describe( 'render()', () => {
		beforeEach( () => {
			view.render();
		} );

		describe( 'Esc key press handling', () => {
			it( 'should emit the "close" event with data upon pressing Esc', () => {
				const spy = sinon.spy();

				view.on( 'close', spy );

				const unrelatedDomEvent = new KeyboardEvent( 'keydown', {
					keyCode: keyCodes.a,
					bubbles: true,
					cancelable: true
				} );

				sinon.stub( unrelatedDomEvent, 'stopPropagation' );
				sinon.stub( unrelatedDomEvent, 'preventDefault' );

				view.element.dispatchEvent( unrelatedDomEvent );

				sinon.assert.notCalled( spy );
				sinon.assert.notCalled( unrelatedDomEvent.stopPropagation );
				sinon.assert.notCalled( unrelatedDomEvent.preventDefault );

				const escDomEvent = new KeyboardEvent( 'keydown', {
					keyCode: keyCodes.esc,
					bubbles: true,
					cancelable: true
				} );

				sinon.stub( escDomEvent, 'stopPropagation' );
				sinon.stub( escDomEvent, 'preventDefault' );

				view.element.dispatchEvent( escDomEvent );

				sinon.assert.calledWithExactly( spy, sinon.match.any, {
					source: 'escKeyPress'
				} );

				sinon.assert.calledOnce( escDomEvent.stopPropagation );
				sinon.assert.calledOnce( escDomEvent.preventDefault );
			} );

			it( 'should not emit the "close" event if the original DOM event was preventDefaulted by some other logic', () => {
				const spy = sinon.spy();
				const childView = createContentView( 'A' );

				view.setupParts( { content: childView } );
				view.on( 'close', spy );

				// Some child view's logic handling the key press.
				childView.element.addEventListener( 'keydown', evt => {
					evt.preventDefault();
				} );

				const escDomEvent = new KeyboardEvent( 'keydown', {
					keyCode: keyCodes.esc,
					bubbles: true,
					cancelable: true
				} );

				sinon.stub( escDomEvent, 'stopPropagation' );

				childView.element.dispatchEvent( escDomEvent );

				sinon.assert.notCalled( spy );
				sinon.assert.notCalled( escDomEvent.stopPropagation );
			} );
		} );

		it( 'should move the dialog upon the #drag event', () => {
			expect( view.wasMoved ).to.be.false;
			expect( view.element.firstChild.style.left ).to.equal( '0px' );
			expect( view.element.firstChild.style.top ).to.equal( '0px' );

			view.fire( 'drag', { deltaX: 40, deltaY: 50 } );

			expect( view.wasMoved ).to.be.true;
			expect( view.element.firstChild.style.left ).to.equal( '40px' );
			expect( view.element.firstChild.style.top ).to.equal( '50px' );

			view.fire( 'drag', { deltaX: 10, deltaY: -20 } );

			expect( view.wasMoved ).to.be.true;
			expect( view.element.firstChild.style.left ).to.equal( '50px' );
			expect( view.element.firstChild.style.top ).to.equal( '30px' );
		} );

		describe( 'position update on window resize', () => {
			it( 'should update the position on window resize (if visible and not already moved)', () => {
				const spy = sinon.spy( view, 'updatePosition' );

				view._isVisible = true;
				view.wasMoved = false;

				global.window.dispatchEvent( new Event( 'resize' ) );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should not update the position on window resize (if not visible)', () => {
				const spy = sinon.spy( view, 'updatePosition' );

				view._isVisible = false;
				view.wasMoved = false;

				global.window.dispatchEvent( new Event( 'resize' ) );
				sinon.assert.notCalled( spy );
			} );

			it( 'should not update the position on window resize (if moved by the user)', () => {
				const spy = sinon.spy( view, 'updatePosition' );

				view._isVisible = true;
				view.wasMoved = true;

				global.window.dispatchEvent( new Event( 'resize' ) );
				sinon.assert.notCalled( spy );
			} );
		} );

		describe( 'position update on window scroll', () => {
			it( 'should update the position on window scroll (if visible and not already moved)', () => {
				const spy = sinon.spy( view, 'updatePosition' );

				view._isVisible = true;
				view.wasMoved = false;

				global.document.dispatchEvent( new Event( 'scroll' ) );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should not update the position on window scroll (if not visible)', () => {
				const spy = sinon.spy( view, 'updatePosition' );

				view._isVisible = false;
				view.wasMoved = false;

				global.document.dispatchEvent( new Event( 'scroll' ) );
				sinon.assert.notCalled( spy );
			} );

			it( 'should not update the position on window scroll (if moved by the user)', () => {
				const spy = sinon.spy( view, 'updatePosition' );

				view._isVisible = true;
				view.wasMoved = true;

				global.document.dispatchEvent( new Event( 'scroll' ) );
				sinon.assert.notCalled( spy );
			} );
		} );

		describe( 'position update on #_isVisible change', () => {
			it( 'should not happen if the dialog becomes invisible', async () => {
				const spy = sinon.spy( view, 'updatePosition' );

				view._isVisible = true;
				await wait( 20 );
				sinon.assert.calledOnce( spy );

				view._isVisible = false;
				await wait( 20 );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should toggle dialog transparency to avoid unnecessary visual movement + should use a slight delay ' +
				'to allow the browser to render the content of the dialog first', async () => {
				const updatePositionSpy = sinon.spy( view, 'updatePosition' );
				const _isTransparentSpy = sinon.spy();

				view.on( 'change:_isTransparent', _isTransparentSpy );

				view._isVisible = true;
				await wait( 20 );

				sinon.assert.callOrder( _isTransparentSpy, updatePositionSpy, _isTransparentSpy );
				sinon.assert.calledWithMatch( _isTransparentSpy.firstCall, sinon.match.any, '_isTransparent', true );
				sinon.assert.calledWithMatch( _isTransparentSpy.secondCall, sinon.match.any, '_isTransparent', false );
			} );
		} );

		it( 'should focus the view when it becomes visible', async () => {
			const spy = sinon.spy( view, 'focus' );

			view._isVisible = true;
			await wait( 20 );
			sinon.assert.calledOnce( spy );

			view._isVisible = false;
			await wait( 20 );
			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'drag&drop support', () => {
		beforeEach( () => {
			view.render();

			document.body.appendChild( view.element );
		} );

		afterEach( () => {
			view.element.remove();
		} );

		it( 'should have #isDragging set', () => {
			expect( view.isDragging ).to.be.false;
		} );

		it( 'should provide #dragHandleElement when #headerView exists', () => {
			view.setupParts( {
				title: 'foo'
			} );

			expect( view.dragHandleElement ).to.equal( view.headerView.element );
		} );

		it( 'should not provide #dragHandleElement when #headerView does not exist', () => {
			expect( view.dragHandleElement ).to.be.null;
		} );

		it( 'should not provide #dragHandleElement when in a modal mode because modals should not be draggable', () => {
			view.setupParts( {
				title: 'foo'
			} );

			view.isModal = true;

			expect( view.dragHandleElement ).to.be.null;
		} );

		it( 'should be possible by dragging the #headerView', () => {
			view.setupParts( {
				title: 'foo'
			} );

			view.headerView.element.dispatchEvent( new MouseEvent( 'mousedown', {
				bubbles: true
			} ) );

			expect( view.isDragging ).to.be.true;

			global.document.dispatchEvent( new MouseEvent( 'mousemove', {
				clientX: 50,
				clientY: 20
			} ) );

			expect( view.element.firstChild.style.left ).to.equal( '50px' );
			expect( view.element.firstChild.style.top ).to.equal( '20px' );

			view.headerView.element.dispatchEvent( new MouseEvent( 'mouseup', {
				bubbles: true
			} ) );

			expect( view.isDragging ).to.be.false;
		} );
	} );

	describe( 'setupParts()', () => {
		describe( 'dialog title', () => {
			it( 'should be possible to set', () => {
				expect( view.headerView ).to.be.undefined;

				view.setupParts( {
					title: 'foo'
				} );

				expect( view.headerView ).to.be.instanceOf( FormHeaderView );
				expect( view.headerView.label ).to.equal( 'foo' );
			} );

			describe( 'close button', () => {
				it( 'should be possible to disable', () => {
					view.setupParts( {
						title: 'foo',
						hasCloseButton: false
					} );

					const lastChild = view.headerView.children.last;

					expect( lastChild ).to.not.be.instanceOf( ButtonView );
				} );

				it( 'should have all properties set', () => {
					view.setupParts( {
						title: 'foo'
					} );

					const closeButtonView = view.headerView.children.last;

					expect( closeButtonView ).to.be.instanceOf( ButtonView );
					expect( closeButtonView.label ).to.equal( 'Close' );
					expect( closeButtonView.tooltip ).to.be.true;
					expect( closeButtonView.icon ).to.equal( IconCancel );
				} );

				it( 'should fire an event with data upon clicking', () => {
					view.setupParts( {
						title: 'foo'
					} );

					const closeButtonView = view.headerView.children.last;
					const spy = sinon.spy();
					view.on( 'close', spy );

					closeButtonView.fire( 'execute' );
					sinon.assert.calledWithExactly( spy, sinon.match.any, { source: 'closeButton' } );
				} );
			} );
		} );

		it( 'should allow setting dialog content (single view)', () => {
			const childViewA = createContentView( 'A' );

			view.setupParts( {
				title: 'foo',
				content: childViewA
			} );

			expect( view.parts.last ).to.equal( view.contentView );
			expect( view.contentView.children.first ).to.equal( childViewA );
		} );

		it( 'should allow setting dialog content (multiple views)', () => {
			const childViewA = createContentView( 'A' );
			const childViewB = createContentView( 'B' );

			view.setupParts( {
				title: 'foo',
				content: [ childViewA, childViewB ]
			} );

			expect( view.parts.last ).to.equal( view.contentView );
			expect( view.contentView.children.first ).to.equal( childViewA );
			expect( view.contentView.children.last ).to.equal( childViewB );
		} );

		it( 'should allow setting dialog action buttons', () => {
			const spyFoo = sinon.spy();
			const spyBar = sinon.spy();

			view.setupParts( {
				actionButtons: [
					{
						label: 'foo',
						icon: '<svg></svg>',
						withText: true,
						onExecute: spyFoo
					},
					{
						label: 'bar',
						withText: true,
						onExecute: spyBar
					}
				]
			} );

			expect( view.parts.first ).to.equal( view.actionsView );
			expect( view.parts.last ).to.equal( view.actionsView );

			expect( view.actionsView.children.first ).to.be.instanceOf( ButtonView );
			expect( view.actionsView.children.first ).to.include( {
				label: 'foo',
				icon: '<svg></svg>',
				withText: true
			} );
			expect( view.actionsView.children.last ).to.be.instanceOf( ButtonView );
			expect( view.actionsView.children.last ).to.include( {
				label: 'bar',
				withText: true
			} );

			view.actionsView.children.first.fire( 'execute' );
			sinon.assert.calledOnce( spyFoo );

			view.actionsView.children.last.fire( 'execute' );
			sinon.assert.calledOnce( spyBar );
		} );

		it( 'should work if the dialog has content only (no title, no action buttons)', () => {
			const childViewA = createContentView( 'A' );

			view.setupParts( {
				content: childViewA
			} );

			expect( view.parts.first ).to.equal( view.contentView );
			expect( view.parts.last ).to.equal( view.contentView );
			expect( view.contentView.children.first ).to.equal( childViewA );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first focusable child', () => {
			const spy = sinon.spy( view._focusCycler, 'focusFirst' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'moveTo()', () => {
		beforeEach( async () => {
			view.render();
			document.body.appendChild( view.element );

			testUtils.sinon.stub( view.element.firstChild, 'getBoundingClientRect' ).returns( {
				width: 100,
				height: 50,
				left: 0,
				right: 100,
				top: 0,
				bottom: 50
			} );

			view._isVisible = true;

			await wait( 50 );
		} );

		afterEach( () => {
			view.element.remove();
		} );

		it( 'should be decorated to allow customization', () => {
			view.on( 'moveTo', ( evt, args ) => {
				args[ 0 ] = 123;
				args[ 1 ] = 321;
			}, { priority: 'high' } );

			view.moveTo( 50, 20 );

			expect( view.element.firstChild.style.left ).to.equal( '123px' );
			expect( view.element.firstChild.style.top ).to.equal( '321px' );
		} );

		it( 'should change top and left CSS properties of the dialog', () => {
			view.moveTo( 50, 20 );

			expect( view.element.firstChild.style.left ).to.equal( '50px' );
			expect( view.element.firstChild.style.top ).to.equal( '20px' );
		} );

		it( 'should prevent the dialog from sticking off the top edge of the viewport', () => {
			view.moveTo( 50, -10 );

			expect( view.element.firstChild.style.left ).to.equal( '50px' );
			expect( view.element.firstChild.style.top ).to.equal( '0px' );
		} );

		it( 'should prevent the dialog from sticking off the left edge of the viewport', () => {
			view.moveTo( -10, 20 );

			expect( view.element.firstChild.style.left ).to.equal( '0px' );
			expect( view.element.firstChild.style.top ).to.equal( '20px' );
		} );

		it( 'should prevent the dialog from sticking off the right edge of the viewport', () => {
			view.moveTo( 1000, 20 );

			expect( view.element.firstChild.style.left ).to.equal( '400px' );
			expect( view.element.firstChild.style.top ).to.equal( '20px' );
		} );

		it( 'should not consider the bottom edge of the viewport', () => {
			view.moveTo( 50, 5000 );

			expect( view.element.firstChild.style.left ).to.equal( '50px' );
			expect( view.element.firstChild.style.top ).to.equal( '5000px' );
		} );

		it( 'should consider viewport offset configuration (dialog mode)', () => {
			getViewportOffsetStub.returns( {
				top: 10,
				right: 20,
				bottom: 30,
				left: 40
			} );

			view.moveTo( 50, 5 );

			expect( view.element.firstChild.style.left ).to.equal( '50px' );
			expect( view.element.firstChild.style.top ).to.equal( '10px' );

			view.moveTo( 0, 20 );

			expect( view.element.firstChild.style.left ).to.equal( '40px' );
			expect( view.element.firstChild.style.top ).to.equal( '20px' );

			view.moveTo( 1000, 20 );

			expect( view.element.firstChild.style.left ).to.equal( '380px' );
			expect( view.element.firstChild.style.top ).to.equal( '20px' );

			view.moveTo( 1000, 5000 );

			expect( view.element.firstChild.style.left ).to.equal( '380px' );
			expect( view.element.firstChild.style.top ).to.equal( '5000px' );
		} );

		it( 'should ignore viewport offset configuration (modal mode)', () => {
			getViewportOffsetStub.returns( {
				top: 10,
				right: 20,
				bottom: 30,
				left: 40
			} );

			view.isModal = true;

			view.moveTo( 50, 5 );

			expect( view.element.firstChild.style.left ).to.equal( '50px' );
			expect( view.element.firstChild.style.top ).to.equal( '5px' );

			view.moveTo( 0, 20 );

			expect( view.element.firstChild.style.left ).to.equal( '0px' );
			expect( view.element.firstChild.style.top ).to.equal( '20px' );

			view.moveTo( 1000, 20 );

			expect( view.element.firstChild.style.left ).to.equal( '400px' );
			expect( view.element.firstChild.style.top ).to.equal( '20px' );

			view.moveTo( 1000, 5000 );

			expect( view.element.firstChild.style.left ).to.equal( '400px' );
			expect( view.element.firstChild.style.top ).to.equal( '5000px' );
		} );
	} );

	describe( 'moveBy()', () => {
		beforeEach( () => {
			view.render();
		} );

		it( 'should move the dialog by given distance', () => {
			view.moveTo( 50, 20 );

			expect( view.element.firstChild.style.left ).to.equal( '50px' );
			expect( view.element.firstChild.style.top ).to.equal( '20px' );

			view.moveBy( 10, -20 );

			expect( view.element.firstChild.style.left ).to.equal( '60px' );
			expect( view.element.firstChild.style.top ).to.equal( '0px' );
		} );
	} );

	describe( 'updatePosition()', () => {
		beforeEach( () => {
			view.render();
			document.body.appendChild( view.element );

			testUtils.sinon.stub( view.element.firstChild, 'getBoundingClientRect' ).returns( {
				width: 100,
				height: 50,
				left: 0,
				right: 100,
				top: 0,
				bottom: 50
			} );

			testUtils.sinon.stub( fakeDomRootElement, 'getBoundingClientRect' ).returns( {
				width: 200,
				height: 200,
				left: 10,
				right: 210,
				top: 10,
				bottom: 210
			} );
		} );

		afterEach( () => {
			view.element.remove();
		} );

		it( 'should always position the dialog on the center of the screen if there is no editing root available', () => {
			getCurrentDomRootStub.returns( null );

			view.position = DialogViewPosition.EDITOR_TOP_SIDE;

			view.updatePosition();

			expect( view.element.firstChild.style.left ).to.equal( '200px' );
			expect( view.element.firstChild.style.top ).to.equal( '225px' );
		} );

		describe( 'when the DOM root is visible in the viewport', () => {
			it( 'should support EDITOR_TOP_SIDE position (LTR editor)', () => {
				view.position = DialogViewPosition.EDITOR_TOP_SIDE;

				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '95px' );
				expect( view.element.firstChild.style.top ).to.equal( '25px' );
			} );

			it( 'should support EDITOR_TOP_SIDE position (RTL editor)', () => {
				view.position = DialogViewPosition.EDITOR_TOP_SIDE;

				testUtils.sinon.stub( locale, 'contentLanguageDirection' ).get( () => 'rtl' );

				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '25px' );
				expect( view.element.firstChild.style.top ).to.equal( '25px' );
			} );

			it( 'should support EDITOR_CENTER position', () => {
				view.position = DialogViewPosition.EDITOR_CENTER;

				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '60px' );
				expect( view.element.firstChild.style.top ).to.equal( '85px' );
			} );

			it( 'should support SCREEN_CENTER position', () => {
				view.position = DialogViewPosition.SCREEN_CENTER;

				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '200px' );
				expect( view.element.firstChild.style.top ).to.equal( '225px' );
			} );

			it( 'should support EDITOR_TOP_CENTER position', () => {
				view.position = DialogViewPosition.EDITOR_TOP_CENTER;

				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '60px' );
				expect( view.element.firstChild.style.top ).to.equal( '25px' );
			} );

			it( 'should support EDITOR_BOTTOM_CENTER position', () => {
				view.position = DialogViewPosition.EDITOR_BOTTOM_CENTER;

				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '60px' );
				expect( view.element.firstChild.style.top ).to.equal( '145px' );
			} );

			it( 'should support EDITOR_ABOVE_CENTER position', () => {
				view.position = DialogViewPosition.EDITOR_ABOVE_CENTER;

				fakeDomRootElement.getBoundingClientRect.returns( {
					width: 200,
					height: 200,
					left: 10,
					right: 210,
					top: 100,
					bottom: 310
				} );

				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '60px' );
				expect( view.element.firstChild.style.top ).to.equal( '35px' );
			} );

			it( 'should support EDITOR_BELOW_CENTER position', () => {
				view.position = DialogViewPosition.EDITOR_BELOW_CENTER;

				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '60px' );
				expect( view.element.firstChild.style.top ).to.equal( '225px' );
			} );
		} );

		describe( 'when the DOM root is invisible in the viewport', () => {
			beforeEach( () => {
				fakeDomRootElement.getBoundingClientRect.returns( {
					width: 200,
					height: 200,
					left: -1000,
					right: -800,
					top: 10,
					bottom: 210
				} );
			} );

			it( 'should move the dialog off the screen (EDITOR_TOP_SIDE)', () => {
				view.position = DialogViewPosition.EDITOR_TOP_SIDE;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '-9999px' );
				expect( view.element.firstChild.style.top ).to.equal( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '-9999px' );
				expect( view.element.firstChild.style.top ).to.equal( '-9999px' );
			} );

			it( 'should work regardless of the DOM root geometry (SCREEN_CENTER)', () => {
				view.position = DialogViewPosition.SCREEN_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '200px' );
				expect( view.element.firstChild.style.top ).to.equal( '225px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_TOP_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_TOP_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '-9999px' );
				expect( view.element.firstChild.style.top ).to.equal( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_BOTTOM_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_BOTTOM_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '-9999px' );
				expect( view.element.firstChild.style.top ).to.equal( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_ABOVE_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_ABOVE_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '-9999px' );
				expect( view.element.firstChild.style.top ).to.equal( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_BELOW_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_BELOW_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '-9999px' );
				expect( view.element.firstChild.style.top ).to.equal( '-9999px' );
			} );
		} );

		describe( 'when the DOM root got cropped by some (scrollable) ancestor and became invisible', () => {
			let ancestorElement;

			beforeEach( () => {
				ancestorElement = document.createElement( 'div' );
				ancestorElement.style.overflow = 'hidden';

				fakeDomRootElement.getBoundingClientRect.returns( {
					width: 200,
					height: 200,
					left: -1000,
					right: -800,
					top: 10,
					bottom: 210
				} );

				document.body.appendChild( ancestorElement );
				ancestorElement.appendChild( fakeDomRootElement );
			} );

			afterEach( () => {
				ancestorElement.remove();
			} );

			it( 'should move the dialog off the screen (EDITOR_TOP_SIDE)', () => {
				view.position = DialogViewPosition.EDITOR_TOP_SIDE;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '-9999px' );
				expect( view.element.firstChild.style.top ).to.equal( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '-9999px' );
				expect( view.element.firstChild.style.top ).to.equal( '-9999px' );
			} );

			it( 'should work regardless of the DOM root geometry (SCREEN_CENTER)', () => {
				view.position = DialogViewPosition.SCREEN_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '200px' );
				expect( view.element.firstChild.style.top ).to.equal( '225px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_TOP_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_TOP_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '-9999px' );
				expect( view.element.firstChild.style.top ).to.equal( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_BOTTOM_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_BOTTOM_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '-9999px' );
				expect( view.element.firstChild.style.top ).to.equal( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_ABOVE_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_ABOVE_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '-9999px' );
				expect( view.element.firstChild.style.top ).to.equal( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_BELOW_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_BELOW_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).to.equal( '-9999px' );
				expect( view.element.firstChild.style.top ).to.equal( '-9999px' );
			} );
		} );

		it( 'should consider viewport offsets (dialog mode)', () => {
			getViewportOffsetStub.returns( {
				top: 100,
				right: 0,
				bottom: 0,
				left: 100
			} );

			view.position = DialogViewPosition.EDITOR_TOP_SIDE;

			testUtils.sinon.stub( locale, 'contentLanguageDirection' ).get( () => 'rtl' );

			view.updatePosition();

			expect( view.element.firstChild.style.left ).to.equal( '115px' );
			expect( view.element.firstChild.style.top ).to.equal( '115px' );
		} );

		it( 'should ignore viewport offsets (modal mode)', () => {
			view.isModal = true;

			getViewportOffsetStub.returns( {
				top: 100,
				right: 0,
				bottom: 0,
				left: 100
			} );

			view.position = DialogViewPosition.EDITOR_TOP_SIDE;

			testUtils.sinon.stub( locale, 'contentLanguageDirection' ).get( () => 'rtl' );

			view.updatePosition();

			expect( view.element.firstChild.style.left ).to.equal( '25px' );
			expect( view.element.firstChild.style.top ).to.equal( '25px' );
		} );

		it( 'should not warn or throw if the view has not been rendered yet', () => {
			const warnStub = testUtils.sinon.stub( console, 'warn' );

			view.element.remove();

			expect( () => {
				view.updatePosition();
			} ).not.to.throw();

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not warn or throw if the view is detached from DOM', () => {
			const warnStub = testUtils.sinon.stub( console, 'warn' );

			const view = new DialogView( locale, {
				getCurrentDomRoot: getCurrentDomRootStub,
				getViewportOffset: getViewportOffsetStub
			} );

			expect( () => {
				view.updatePosition();
			} ).not.to.throw();

			sinon.assert.notCalled( warnStub );

			view.destroy();
		} );
	} );

	function wait( time ) {
		return new Promise( res => {
			global.window.setTimeout( res, time );
		} );
	}

	function createContentView( text ) {
		const view = new View();

		view.setTemplate( {
			tag: 'div',
			children: [ { text } ],
			attributes: {
				tabindex: -1
			}
		} );

		view.focus = () => {
			view.element.focus();
		};

		return view;
	}
} );
