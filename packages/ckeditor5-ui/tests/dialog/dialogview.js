/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IconCancel } from '@ckeditor/ckeditor5-icons';
import { FocusTracker, KeystrokeHandler, Locale, global, keyCodes } from '@ckeditor/ckeditor5-utils';
import { ButtonView, FormHeaderView, View, ViewCollection } from '../../src/index.js';
import { DialogView, DialogViewPosition } from '../../src/dialog/dialogview.js';

describe( 'DialogView', () => {
	let view, fakeDomRootElement;
	let getDomRootElementStub, getViewportOffsetStub;
	const locale = new Locale();

	beforeEach( () => {
		fakeDomRootElement = document.createElement( 'div' );

		getDomRootElementStub = vi.fn().mockReturnValue( fakeDomRootElement );
		getViewportOffsetStub = vi.fn().mockReturnValue( {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		} );

		vi.spyOn( global.window, 'innerWidth', 'get' ).mockReturnValue( 500 );
		vi.spyOn( global.window, 'innerHeight', 'get' ).mockReturnValue( 500 );

		view = new DialogView( locale, {
			getDomRootElement: getDomRootElementStub,
			getViewportOffset: getViewportOffsetStub
		} );
	} );

	it( 'should have #defaultOffset set', () => {
		expect( DialogView.defaultOffset ).toBe( 15 );
	} );

	describe( 'constructor()', () => {
		describe( 'properties', () => {
			it( 'should include the collection of #parts', () => {
				expect( view.parts ).toBeInstanceOf( ViewCollection );
			} );

			it( 'should include an instance of KeystrokeHandler', () => {
				expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
			} );

			it( 'should include an instance of FocusTracker', () => {
				expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
			} );

			it( 'should have #_isVisible set', () => {
				expect( view._isVisible ).toBe( false );
			} );

			it( 'should have #_isTransparent set', () => {
				expect( view._isTransparent ).toBe( false );
			} );

			it( 'should have #isModal set', () => {
				expect( view.isModal ).toBe( false );
			} );

			it( 'should have #wasMoved set', () => {
				expect( view.wasMoved ).toBe( false );
			} );

			it( 'should have #className set', () => {
				expect( view.className ).toBe( '' );
			} );

			it( 'should have the `aria-label` attribute set', () => {
				expect( view.ariaLabel ).toBe( 'Editor dialog' );
			} );

			it( 'should have #position set', () => {
				expect( view.position ).toBe( DialogViewPosition.SCREEN_CENTER );
			} );

			it( 'should have #_top set', () => {
				expect( view._top ).toBe( 0 );
			} );

			it( 'should have #_left set', () => {
				expect( view._left ).toBe( 0 );
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
					expect( overlayElement.classList.contains( 'ck' ) ).toBe( true );
					expect( overlayElement.classList.contains( 'ck-dialog-overlay' ) ).toBe( true );
				} );

				it( 'should have a tabindex', () => {
					expect( overlayElement.tabIndex ).toBe( -1 );
				} );

				it( 'should have a CSS class bound to #isModal', () => {
					view.isModal = false;
					expect( overlayElement.classList.contains( 'ck-dialog-overlay__transparent' ) ).toBe( true );
					view.isModal = true;
					expect( overlayElement.classList.contains( 'ck-dialog-overlay__transparent' ) ).toBe( false );
				} );

				it( 'should have a CSS class bound to #_isVisible', () => {
					view._isVisible = false;
					expect( overlayElement.classList.contains( 'ck-hidden' ) ).toBe( true );
					view._isVisible = true;
					expect( overlayElement.classList.contains( 'ck-hidden' ) ).toBe( false );
				} );

				it( 'should host the dialog', () => {
					expect( overlayElement.firstChild.classList.contains( 'ck-dialog' ) ).toBe( true );
				} );

				it( 'should set the CSS class on the dialog element in the modal mode', () => {
					view.isModal = false;
					expect( overlayElement.firstChild.classList.contains( 'ck-dialog_modal' ) ).toBe( false );

					view.isModal = true;
					expect( overlayElement.firstChild.classList.contains( 'ck-dialog_modal' ) ).toBe( true );
				} );
			} );

			describe( 'dialog', () => {
				let innerDialogElement;

				beforeEach( () => {
					innerDialogElement = view.element.firstChild;
				} );

				it( 'should have CSS classes', () => {
					expect( innerDialogElement.classList.contains( 'ck' ) ).toBe( true );
					expect( innerDialogElement.classList.contains( 'ck-dialog' ) ).toBe( true );
				} );

				it( 'should have a CSS class bound to #className', () => {
					view.className = 'foo';
					expect( innerDialogElement.classList.contains( 'foo' ) ).toBe( true );
				} );

				it( 'should have a tabindex', () => {
					expect( innerDialogElement.tabIndex ).toBe( -1 );
				} );

				it( 'should have CSS top bound to #_top', () => {
					view._top = 123;
					expect( innerDialogElement.style.top ).toBe( '123px' );
				} );

				it( 'should have CSS left bound to #_left', () => {
					view._left = 123;
					expect( innerDialogElement.style.left ).toBe( '123px' );
				} );

				it( 'should have a role set', () => {
					expect( innerDialogElement.role ).toBe( 'dialog' );
				} );

				it( 'should have aria-label bound to #ariaLabel', () => {
					view.ariaLabel = 'foo';
					expect( innerDialogElement.ariaLabel ).toBe( 'foo' );
				} );

				it( 'should have CSS visibility bound to #_isTransparent', () => {
					view._isTransparent = true;
					expect( innerDialogElement.style.visibility ).toBe( 'hidden' );
					view._isTransparent = false;
					expect( innerDialogElement.style.visibility ).toBe( '' );
				} );

				it( 'should host the collection of #parts', () => {
					const testView = new View();

					testView.setTemplate( { tag: 'div' } );

					view.parts.add( testView );

					expect( innerDialogElement.firstChild ).toBe( testView.element );
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
					closeButton: vi.spyOn( view.headerView.children.last, 'focus' ),
					childA: vi.spyOn( childViewA, 'focus' ),
					childB: vi.spyOn( childViewB, 'focus' ),
					actionFoo: vi.spyOn( view.actionsView.children.first, 'focus' ),
					actionBar: vi.spyOn( view.actionsView.children.last, 'focus' )
				};
			} );

			afterEach( () => {
				view.element.remove();
			} );

			describe( 'upon pressing Tab', () => {
				beforeEach( () => {
					keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};
				} );

				it( 'should navigate forward across all parts and sub-views', async () => {
					view.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.childB ).toHaveBeenCalledOnce();

					view.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.actionFoo ).toHaveBeenCalledOnce();

					view.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.actionBar ).toHaveBeenCalledOnce();

					view.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.closeButton ).toHaveBeenCalledOnce();

					view.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.childA ).toHaveBeenCalledOnce();
				} );

				it( 'should cycle forward correctly if there are only action buttons', async () => {
					const newView = new DialogView( locale, {
						getDomRootElement: getDomRootElementStub,
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
						actionFoo: vi.spyOn( newView.actionsView.children.first, 'focus' ),
						actionBar: vi.spyOn( newView.actionsView.children.last, 'focus' )
					};

					newView.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.actionBar ).toHaveBeenCalledOnce();

					newView.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.actionFoo ).toHaveBeenCalledOnce();

					newView.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.actionBar ).toHaveBeenCalledTimes( 2 );

					newView.element.remove();
				} );
			} );

			describe( 'upon pressing Shift+Tab', () => {
				beforeEach( () => {
					keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};
				} );

				it( 'should navigate forward across all parts and sub-views', async () => {
					view.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.closeButton ).toHaveBeenCalledOnce();

					view.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.actionBar ).toHaveBeenCalledOnce();

					view.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.actionFoo ).toHaveBeenCalledOnce();

					view.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.childB ).toHaveBeenCalledOnce();

					view.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.childA ).toHaveBeenCalledOnce();
				} );

				it( 'should cycle backwards correctly if there are only action buttons', async () => {
					const newView = new DialogView( locale, {
						getDomRootElement: getDomRootElementStub,
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
						actionFoo: vi.spyOn( newView.actionsView.children.first, 'focus' ),
						actionBar: vi.spyOn( newView.actionsView.children.last, 'focus' )
					};

					newView.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.actionBar ).toHaveBeenCalledOnce();

					newView.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.actionFoo ).toHaveBeenCalledOnce();

					newView.actionsView.keystrokes.press( keyEvtData );
					await wait( 10 );

					expect( focusSpies.actionBar ).toHaveBeenCalledTimes( 2 );

					newView.element.remove();
				} );
			} );
		} );

		describe( 'keystrokeHandlerOptions', () => {
			it( 'should use passed keystroke handler options filter', async () => {
				const filterSpy = vi.fn();

				const newView = new DialogView( locale, {
					getDomRootElement: getDomRootElementStub,
					getViewportOffset: getViewportOffsetStub,
					keystrokeHandlerOptions: {
						filter: filterSpy
					}
				} );

				newView.render();

				newView.keystrokes.press( {
					keyCode: keyCodes.tab,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				} );

				await wait( 5 );

				expect( filterSpy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'render()', () => {
		beforeEach( () => {
			view.render();
		} );

		describe( 'Esc key press handling', () => {
			it( 'should emit the "close" event with data upon pressing Esc', () => {
				const spy = vi.fn();

				view.on( 'close', spy );

				const unrelatedDomEvent = new KeyboardEvent( 'keydown', {
					keyCode: keyCodes.a,
					bubbles: true,
					cancelable: true
				} );

				vi.spyOn( unrelatedDomEvent, 'stopPropagation' );
				vi.spyOn( unrelatedDomEvent, 'preventDefault' );

				view.element.dispatchEvent( unrelatedDomEvent );

				expect( spy ).not.toHaveBeenCalled();
				expect( unrelatedDomEvent.stopPropagation ).not.toHaveBeenCalled();
				expect( unrelatedDomEvent.preventDefault ).not.toHaveBeenCalled();

				const escDomEvent = new KeyboardEvent( 'keydown', {
					keyCode: keyCodes.esc,
					bubbles: true,
					cancelable: true
				} );

				vi.spyOn( escDomEvent, 'stopPropagation' );
				vi.spyOn( escDomEvent, 'preventDefault' );

				view.element.dispatchEvent( escDomEvent );

				expect( spy ).toHaveBeenCalledWith( expect.anything(), {
					source: 'escKeyPress'
				} );

				expect( escDomEvent.stopPropagation ).toHaveBeenCalledOnce();
				expect( escDomEvent.preventDefault ).toHaveBeenCalledOnce();
			} );

			it( 'should not emit the "close" event if the original DOM event was preventDefaulted by some other logic', () => {
				const spy = vi.fn();
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

				vi.spyOn( escDomEvent, 'stopPropagation' );

				childView.element.dispatchEvent( escDomEvent );

				expect( spy ).not.toHaveBeenCalled();
				expect( escDomEvent.stopPropagation ).not.toHaveBeenCalled();
			} );
		} );

		it( 'should move the dialog upon the #drag event', () => {
			expect( view.wasMoved ).toBe( false );
			expect( view.element.firstChild.style.left ).toBe( '0px' );
			expect( view.element.firstChild.style.top ).toBe( '0px' );

			view.fire( 'drag', { deltaX: 40, deltaY: 50 } );

			expect( view.wasMoved ).toBe( true );
			expect( view.element.firstChild.style.left ).toBe( '40px' );
			expect( view.element.firstChild.style.top ).toBe( '50px' );

			view.fire( 'drag', { deltaX: 10, deltaY: -20 } );

			expect( view.wasMoved ).toBe( true );
			expect( view.element.firstChild.style.left ).toBe( '50px' );
			expect( view.element.firstChild.style.top ).toBe( '30px' );
		} );

		describe( 'position update on window resize', () => {
			it( 'should update the position on window resize (if visible and not already moved)', () => {
				const spy = vi.spyOn( view, 'updatePosition' );

				view._isVisible = true;
				view.wasMoved = false;

				global.window.dispatchEvent( new Event( 'resize' ) );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should not update the position on window resize (if not visible)', () => {
				const spy = vi.spyOn( view, 'updatePosition' );

				view._isVisible = false;
				view.wasMoved = false;

				global.window.dispatchEvent( new Event( 'resize' ) );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should not update the position on window resize (if moved by the user)', () => {
				const spy = vi.spyOn( view, 'updatePosition' );

				view._isVisible = true;
				view.wasMoved = true;

				global.window.dispatchEvent( new Event( 'resize' ) );
				expect( spy ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'position update on window scroll', () => {
			it( 'should update the position on window scroll (if visible and not already moved)', () => {
				const spy = vi.spyOn( view, 'updatePosition' );

				view._isVisible = true;
				view.wasMoved = false;

				global.document.dispatchEvent( new Event( 'scroll' ) );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should not update the position on window scroll (if not visible)', () => {
				const spy = vi.spyOn( view, 'updatePosition' );

				view._isVisible = false;
				view.wasMoved = false;

				global.document.dispatchEvent( new Event( 'scroll' ) );
				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should not update the position on window scroll (if moved by the user)', () => {
				const spy = vi.spyOn( view, 'updatePosition' );

				view._isVisible = true;
				view.wasMoved = true;

				global.document.dispatchEvent( new Event( 'scroll' ) );
				expect( spy ).not.toHaveBeenCalled();
			} );
		} );

		describe( 'position update on #_isVisible change', () => {
			it( 'should not happen if the dialog becomes invisible', async () => {
				const spy = vi.spyOn( view, 'updatePosition' );

				view._isVisible = true;
				await wait( 20 );
				expect( spy ).toHaveBeenCalledOnce();

				view._isVisible = false;
				await wait( 20 );
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'should toggle dialog transparency to avoid unnecessary visual movement + should use a slight delay ' +
				'to allow the browser to render the content of the dialog first', async () => {
				const updatePositionSpy = vi.spyOn( view, 'updatePosition' );
				const _isTransparentSpy = vi.fn();

				view.on( 'change:_isTransparent', _isTransparentSpy );

				view._isVisible = true;
				await wait( 20 );

				expect( _isTransparentSpy ).toHaveBeenCalledTimes( 2 );
				expect( updatePositionSpy ).toHaveBeenCalledOnce();

				// Verify call order: _isTransparentSpy(true), updatePositionSpy, _isTransparentSpy(false)
				const transparentCallOrder = _isTransparentSpy.mock.invocationCallOrder;
				const updatePositionCallOrder = updatePositionSpy.mock.invocationCallOrder;

				expect( transparentCallOrder[ 0 ] ).toBeLessThan( updatePositionCallOrder[ 0 ] );
				expect( updatePositionCallOrder[ 0 ] ).toBeLessThan( transparentCallOrder[ 1 ] );

				expect( _isTransparentSpy.mock.calls[ 0 ][ 2 ] ).toBe( true );
				expect( _isTransparentSpy.mock.calls[ 1 ][ 2 ] ).toBe( false );
			} );
		} );

		it( 'should focus the view when it becomes visible', async () => {
			const spy = vi.spyOn( view, 'focus' );

			view._isVisible = true;
			await wait( 20 );
			expect( spy ).toHaveBeenCalledOnce();

			view._isVisible = false;
			await wait( 20 );
			expect( spy ).toHaveBeenCalledOnce();
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
			expect( view.isDragging ).toBe( false );
		} );

		it( 'should provide #dragHandleElement when #headerView exists', () => {
			view.setupParts( {
				title: 'foo'
			} );

			expect( view.dragHandleElement ).toBe( view.headerView.element );
		} );

		it( 'should not provide #dragHandleElement when #headerView does not exist', () => {
			expect( view.dragHandleElement ).toBeNull();
		} );

		it( 'should not provide #dragHandleElement when in a modal mode because modals should not be draggable', () => {
			view.setupParts( {
				title: 'foo'
			} );

			view.isModal = true;

			expect( view.dragHandleElement ).toBeNull();
		} );

		it( 'should be possible by dragging the #headerView', () => {
			view.setupParts( {
				title: 'foo'
			} );

			view.headerView.element.dispatchEvent( new MouseEvent( 'mousedown', {
				bubbles: true
			} ) );

			expect( view.isDragging ).toBe( true );

			global.document.dispatchEvent( new MouseEvent( 'mousemove', {
				clientX: 50,
				clientY: 20
			} ) );

			expect( view.element.firstChild.style.left ).toBe( '50px' );
			expect( view.element.firstChild.style.top ).toBe( '20px' );

			view.headerView.element.dispatchEvent( new MouseEvent( 'mouseup', {
				bubbles: true
			} ) );

			expect( view.isDragging ).toBe( false );
		} );
	} );

	describe( 'setupParts()', () => {
		describe( 'dialog title', () => {
			it( 'should be possible to set', () => {
				expect( view.headerView ).toBeUndefined();

				view.setupParts( {
					title: 'foo'
				} );

				expect( view.headerView ).toBeInstanceOf( FormHeaderView );
				expect( view.headerView.label ).toBe( 'foo' );
			} );

			describe( 'close button', () => {
				it( 'should be possible to disable', () => {
					view.setupParts( {
						title: 'foo',
						hasCloseButton: false
					} );

					const lastChild = view.headerView.children.last;

					expect( lastChild ).not.toBeInstanceOf( ButtonView );
				} );

				it( 'should have all properties set', () => {
					view.setupParts( {
						title: 'foo'
					} );

					const closeButtonView = view.headerView.children.last;

					expect( closeButtonView ).toBeInstanceOf( ButtonView );
					expect( closeButtonView.label ).toBe( 'Close' );
					expect( closeButtonView.tooltip ).toBe( true );
					expect( closeButtonView.icon ).toBe( IconCancel );
				} );

				it( 'should fire an event with data upon clicking', () => {
					view.setupParts( {
						title: 'foo'
					} );

					const closeButtonView = view.headerView.children.last;
					const spy = vi.fn();
					view.on( 'close', spy );

					closeButtonView.fire( 'execute' );
					expect( spy ).toHaveBeenCalledWith( expect.anything(), { source: 'closeButton' } );
				} );
			} );
		} );

		it( 'should allow setting dialog content (single view)', () => {
			const childViewA = createContentView( 'A' );

			view.setupParts( {
				title: 'foo',
				content: childViewA
			} );

			expect( view.parts.last ).toBe( view.contentView );
			expect( view.contentView.children.first ).toBe( childViewA );
		} );

		it( 'should not add non-focusable content children to focusables', () => {
			const nonFocusableView = new View();
			nonFocusableView.setTemplate( { tag: 'div' } );

			view.setupParts( {
				title: 'foo',
				content: nonFocusableView
			} );

			expect( view._focusables.length ).toBe( 1 ); // Only the close button, not the non-focusable content
		} );

		it( 'should allow setting dialog content (multiple views)', () => {
			const childViewA = createContentView( 'A' );
			const childViewB = createContentView( 'B' );

			view.setupParts( {
				title: 'foo',
				content: [ childViewA, childViewB ]
			} );

			expect( view.parts.last ).toBe( view.contentView );
			expect( view.contentView.children.first ).toBe( childViewA );
			expect( view.contentView.children.last ).toBe( childViewB );
		} );

		it( 'should allow setting dialog action buttons', () => {
			const spyFoo = vi.fn();
			const spyBar = vi.fn();

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

			expect( view.parts.first ).toBe( view.actionsView );
			expect( view.parts.last ).toBe( view.actionsView );

			expect( view.actionsView.children.first ).toBeInstanceOf( ButtonView );
			expect( view.actionsView.children.first ).toMatchObject( {
				label: 'foo',
				icon: '<svg></svg>',
				withText: true
			} );
			expect( view.actionsView.children.last ).toBeInstanceOf( ButtonView );
			expect( view.actionsView.children.last ).toMatchObject( {
				label: 'bar',
				withText: true
			} );

			view.actionsView.children.first.fire( 'execute' );
			expect( spyFoo ).toHaveBeenCalledOnce();

			view.actionsView.children.last.fire( 'execute' );
			expect( spyBar ).toHaveBeenCalledOnce();
		} );

		it( 'should work if the dialog has content only (no title, no action buttons)', () => {
			const childViewA = createContentView( 'A' );

			view.setupParts( {
				content: childViewA
			} );

			expect( view.parts.first ).toBe( view.contentView );
			expect( view.parts.last ).toBe( view.contentView );
			expect( view.contentView.children.first ).toBe( childViewA );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first focusable child', () => {
			const spy = vi.spyOn( view._focusCycler, 'focusFirst' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'moveTo()', () => {
		beforeEach( async () => {
			view.render();
			document.body.appendChild( view.element );

			vi.spyOn( view.element.firstChild, 'getBoundingClientRect' ).mockReturnValue( {
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

			expect( view.element.firstChild.style.left ).toBe( '123px' );
			expect( view.element.firstChild.style.top ).toBe( '321px' );
		} );

		it( 'should change top and left CSS properties of the dialog', () => {
			view.moveTo( 50, 20 );

			expect( view.element.firstChild.style.left ).toBe( '50px' );
			expect( view.element.firstChild.style.top ).toBe( '20px' );
		} );

		it( 'should prevent the dialog from sticking off the top edge of the viewport', () => {
			view.moveTo( 50, -10 );

			expect( view.element.firstChild.style.left ).toBe( '50px' );
			expect( view.element.firstChild.style.top ).toBe( '0px' );
		} );

		it( 'should prevent the dialog from sticking off the left edge of the viewport', () => {
			view.moveTo( -10, 20 );

			expect( view.element.firstChild.style.left ).toBe( '0px' );
			expect( view.element.firstChild.style.top ).toBe( '20px' );
		} );

		it( 'should prevent the dialog from sticking off the right edge of the viewport', () => {
			view.moveTo( 1000, 20 );

			expect( view.element.firstChild.style.left ).toBe( '400px' );
			expect( view.element.firstChild.style.top ).toBe( '20px' );
		} );

		it( 'should not consider the bottom edge of the viewport', () => {
			view.moveTo( 50, 5000 );

			expect( view.element.firstChild.style.left ).toBe( '50px' );
			expect( view.element.firstChild.style.top ).toBe( '5000px' );
		} );

		it( 'should consider viewport offset configuration (dialog mode)', () => {
			getViewportOffsetStub.mockReturnValue( {
				top: 10,
				right: 20,
				bottom: 30,
				left: 40
			} );

			view.moveTo( 50, 5 );

			expect( view.element.firstChild.style.left ).toBe( '50px' );
			expect( view.element.firstChild.style.top ).toBe( '10px' );

			view.moveTo( 0, 20 );

			expect( view.element.firstChild.style.left ).toBe( '40px' );
			expect( view.element.firstChild.style.top ).toBe( '20px' );

			view.moveTo( 1000, 20 );

			expect( view.element.firstChild.style.left ).toBe( '380px' );
			expect( view.element.firstChild.style.top ).toBe( '20px' );

			view.moveTo( 1000, 5000 );

			expect( view.element.firstChild.style.left ).toBe( '380px' );
			expect( view.element.firstChild.style.top ).toBe( '5000px' );
		} );

		it( 'should ignore viewport offset configuration (modal mode)', () => {
			getViewportOffsetStub.mockReturnValue( {
				top: 10,
				right: 20,
				bottom: 30,
				left: 40
			} );

			view.isModal = true;

			view.moveTo( 50, 5 );

			expect( view.element.firstChild.style.left ).toBe( '50px' );
			expect( view.element.firstChild.style.top ).toBe( '5px' );

			view.moveTo( 0, 20 );

			expect( view.element.firstChild.style.left ).toBe( '0px' );
			expect( view.element.firstChild.style.top ).toBe( '20px' );

			view.moveTo( 1000, 20 );

			expect( view.element.firstChild.style.left ).toBe( '400px' );
			expect( view.element.firstChild.style.top ).toBe( '20px' );

			view.moveTo( 1000, 5000 );

			expect( view.element.firstChild.style.left ).toBe( '400px' );
			expect( view.element.firstChild.style.top ).toBe( '5000px' );
		} );
	} );

	describe( 'moveBy()', () => {
		beforeEach( () => {
			view.render();
		} );

		it( 'should move the dialog by given distance', () => {
			view.moveTo( 50, 20 );

			expect( view.element.firstChild.style.left ).toBe( '50px' );
			expect( view.element.firstChild.style.top ).toBe( '20px' );

			view.moveBy( 10, -20 );

			expect( view.element.firstChild.style.left ).toBe( '60px' );
			expect( view.element.firstChild.style.top ).toBe( '0px' );
		} );
	} );

	describe( 'updatePosition()', () => {
		beforeEach( () => {
			view.render();
			document.body.appendChild( view.element );

			vi.spyOn( view.element.firstChild, 'getBoundingClientRect' ).mockReturnValue( {
				width: 100,
				height: 50,
				left: 0,
				right: 100,
				top: 0,
				bottom: 50
			} );

			vi.spyOn( fakeDomRootElement, 'getBoundingClientRect' ).mockReturnValue( {
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
			getDomRootElementStub.mockReturnValue( null );

			view.position = DialogViewPosition.EDITOR_TOP_SIDE;

			view.updatePosition();

			expect( view.element.firstChild.style.left ).toBe( '200px' );
			expect( view.element.firstChild.style.top ).toBe( '225px' );
		} );

		it( 'should return early when position is null', () => {
			const moveToSpy = vi.spyOn( view, '_moveTo' );

			view.position = null;

			view.updatePosition();

			expect( moveToSpy ).not.toHaveBeenCalled();
		} );

		it( 'should call position function with correct arguments and use returned coordinates', () => {
			const mockCoords = { left: 123, top: 456 };
			const positionFunctionSpy = vi.fn().mockReturnValue( mockCoords );
			const moveToSpy = vi.spyOn( view, '_moveTo' );

			view.position = positionFunctionSpy;

			view.updatePosition();

			expect( positionFunctionSpy ).toHaveBeenCalledOnce();

			const [ dialogRect, visibleDomRootRect, domRootRect ] = positionFunctionSpy.mock.calls[ 0 ];

			expect( dialogRect ).toEqual( {
				width: 100,
				height: 50,
				left: 0,
				right: 100,
				top: 0,
				bottom: 50
			} );

			// The DOM root is fully within the viewport, so both rects are equal.
			expect( visibleDomRootRect ).toEqual( {
				width: 200,
				height: 200,
				left: 10,
				right: 210,
				top: 10,
				bottom: 210
			} );

			expect( domRootRect ).toEqual( {
				width: 200,
				height: 200,
				left: 10,
				right: 210,
				top: 10,
				bottom: 210
			} );

			expect( moveToSpy ).toHaveBeenCalledOnce();
			expect( moveToSpy ).toHaveBeenCalledWith( 123, 456 );
		} );

		it( 'should call position function with null root rects when no DOM root is available', () => {
			const mockCoords = { left: 789, top: 101 };
			const positionFunctionSpy = vi.fn().mockReturnValue( mockCoords );
			const moveToSpy = vi.spyOn( view, '_moveTo' );

			getDomRootElementStub.mockReturnValue( null );
			view.position = positionFunctionSpy;

			view.updatePosition();

			expect( positionFunctionSpy ).toHaveBeenCalledOnce();

			const [ dialogRect, visibleDomRootRect, domRootRect ] = positionFunctionSpy.mock.calls[ 0 ];

			expect( dialogRect ).toEqual( {
				width: 100,
				height: 50,
				left: 0,
				right: 100,
				top: 0,
				bottom: 50
			} );

			expect( visibleDomRootRect ).toBeNull();
			expect( domRootRect ).toBeNull();

			expect( moveToSpy ).toHaveBeenCalledOnce();
			expect( moveToSpy ).toHaveBeenCalledWith( 789, 101 );
		} );

		it( 'should move dialog off screen when position function returns null', () => {
			const positionFunctionSpy = vi.fn().mockReturnValue( null );
			const moveToSpy = vi.spyOn( view, '_moveTo' );

			view.position = positionFunctionSpy;

			view.updatePosition();

			expect( positionFunctionSpy ).toHaveBeenCalledOnce();

			const [ dialogRect, visibleDomRootRect, domRootRect ] = positionFunctionSpy.mock.calls[ 0 ];

			expect( dialogRect ).toEqual( {
				width: 100,
				height: 50,
				left: 0,
				right: 100,
				top: 0,
				bottom: 50
			} );

			expect( visibleDomRootRect ).toEqual( {
				width: 200,
				height: 200,
				left: 10,
				right: 210,
				top: 10,
				bottom: 210
			} );

			expect( domRootRect ).toEqual( {
				width: 200,
				height: 200,
				left: 10,
				right: 210,
				top: 10,
				bottom: 210
			} );

			expect( moveToSpy ).toHaveBeenCalledOnce();
			expect( moveToSpy ).toHaveBeenCalledWith( -9999, -9999 );
		} );

		it( 'should pass the DOM root Rect to the position function even when the root is off the screen', () => {
			// The DOM root is entirely off the screen, so it has no visible Rect, but its general Rect is still available.
			fakeDomRootElement.getBoundingClientRect.mockReturnValue( {
				width: 200,
				height: 200,
				left: -1000,
				right: -800,
				top: 10,
				bottom: 210
			} );

			const positionFunctionSpy = vi.fn().mockReturnValue( { left: 5, top: 6 } );
			const moveToSpy = vi.spyOn( view, '_moveTo' );

			view.position = positionFunctionSpy;

			view.updatePosition();

			const [ , visibleDomRootRect, domRootRect ] = positionFunctionSpy.mock.calls[ 0 ];

			expect( visibleDomRootRect, 'visibleDomRootRect' ).toBeNull();
			expect( domRootRect, 'domRootRect' ).toEqual( {
				width: 200,
				height: 200,
				left: -1000,
				right: -800,
				top: 10,
				bottom: 210
			} );

			// The dialog can still be positioned despite the root not being visible.
			expect( moveToSpy ).toHaveBeenCalledOnce();
			expect( moveToSpy ).toHaveBeenCalledWith( 5, 6 );
		} );

		it( 'should pass the DOM root Rect to the position function even when the root is cropped and invisible', () => {
			const ancestorElement = document.createElement( 'div' );

			ancestorElement.style.overflow = 'hidden';

			fakeDomRootElement.getBoundingClientRect.mockReturnValue( {
				width: 200,
				height: 200,
				left: -1000,
				right: -800,
				top: 10,
				bottom: 210
			} );

			document.body.appendChild( ancestorElement );
			ancestorElement.appendChild( fakeDomRootElement );

			const positionFunctionSpy = vi.fn().mockReturnValue( { left: 7, top: 8 } );
			const moveToSpy = vi.spyOn( view, '_moveTo' );

			view.position = positionFunctionSpy;

			view.updatePosition();

			const [ , visibleDomRootRect, domRootRect ] = positionFunctionSpy.mock.calls[ 0 ];

			expect( visibleDomRootRect, 'visibleDomRootRect' ).toBeNull();
			expect( domRootRect, 'domRootRect' ).toEqual( {
				width: 200,
				height: 200,
				left: -1000,
				right: -800,
				top: 10,
				bottom: 210
			} );

			expect( moveToSpy ).toHaveBeenCalledOnce();
			expect( moveToSpy ).toHaveBeenCalledWith( 7, 8 );

			ancestorElement.remove();
		} );

		it( 'should pass the visible (clipped) and the general DOM root Rects to the position function separately', () => {
			// The DOM root sticks out of the viewport on the left, so its visible Rect is clipped to the viewport
			// while its general Rect still spans the full geometry.
			fakeDomRootElement.getBoundingClientRect.mockReturnValue( {
				width: 200,
				height: 200,
				left: -50,
				right: 150,
				top: 10,
				bottom: 210
			} );

			const positionFunctionSpy = vi.fn().mockReturnValue( { left: 1, top: 2 } );

			view.position = positionFunctionSpy;

			view.updatePosition();

			const [ , visibleDomRootRect, domRootRect ] = positionFunctionSpy.mock.calls[ 0 ];

			expect( visibleDomRootRect, 'visibleDomRootRect' ).toEqual( {
				width: 150,
				height: 200,
				left: 0,
				right: 150,
				top: 10,
				bottom: 210
			} );

			expect( domRootRect, 'domRootRect' ).toEqual( {
				width: 200,
				height: 200,
				left: -50,
				right: 150,
				top: 10,
				bottom: 210
			} );
		} );

		describe( 'when the DOM root is visible in the viewport', () => {
			it( 'should support EDITOR_TOP_SIDE position (LTR editor)', () => {
				view.position = DialogViewPosition.EDITOR_TOP_SIDE;

				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '95px' );
				expect( view.element.firstChild.style.top ).toBe( '25px' );
			} );

			it( 'should support EDITOR_TOP_SIDE position (RTL editor)', () => {
				view.position = DialogViewPosition.EDITOR_TOP_SIDE;

				vi.spyOn( locale, 'contentLanguageDirection', 'get' ).mockReturnValue( 'rtl' );

				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '25px' );
				expect( view.element.firstChild.style.top ).toBe( '25px' );
			} );

			it( 'should support EDITOR_CENTER position', () => {
				view.position = DialogViewPosition.EDITOR_CENTER;

				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '60px' );
				expect( view.element.firstChild.style.top ).toBe( '85px' );
			} );

			it( 'should support SCREEN_CENTER position', () => {
				view.position = DialogViewPosition.SCREEN_CENTER;

				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '200px' );
				expect( view.element.firstChild.style.top ).toBe( '225px' );
			} );

			it( 'should support EDITOR_TOP_CENTER position', () => {
				view.position = DialogViewPosition.EDITOR_TOP_CENTER;

				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '60px' );
				expect( view.element.firstChild.style.top ).toBe( '25px' );
			} );

			it( 'should support EDITOR_BOTTOM_CENTER position', () => {
				view.position = DialogViewPosition.EDITOR_BOTTOM_CENTER;

				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '60px' );
				expect( view.element.firstChild.style.top ).toBe( '145px' );
			} );

			it( 'should support EDITOR_ABOVE_CENTER position', () => {
				view.position = DialogViewPosition.EDITOR_ABOVE_CENTER;

				fakeDomRootElement.getBoundingClientRect.mockReturnValue( {
					width: 200,
					height: 200,
					left: 10,
					right: 210,
					top: 100,
					bottom: 310
				} );

				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '60px' );
				expect( view.element.firstChild.style.top ).toBe( '35px' );
			} );

			it( 'should support EDITOR_BELOW_CENTER position', () => {
				view.position = DialogViewPosition.EDITOR_BELOW_CENTER;

				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '60px' );
				expect( view.element.firstChild.style.top ).toBe( '225px' );
			} );
		} );

		describe( 'when the DOM root is invisible in the viewport', () => {
			beforeEach( () => {
				fakeDomRootElement.getBoundingClientRect.mockReturnValue( {
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

				expect( view.element.firstChild.style.left ).toBe( '-9999px' );
				expect( view.element.firstChild.style.top ).toBe( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '-9999px' );
				expect( view.element.firstChild.style.top ).toBe( '-9999px' );
			} );

			it( 'should work regardless of the DOM root geometry (SCREEN_CENTER)', () => {
				view.position = DialogViewPosition.SCREEN_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '200px' );
				expect( view.element.firstChild.style.top ).toBe( '225px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_TOP_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_TOP_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '-9999px' );
				expect( view.element.firstChild.style.top ).toBe( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_BOTTOM_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_BOTTOM_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '-9999px' );
				expect( view.element.firstChild.style.top ).toBe( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_ABOVE_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_ABOVE_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '-9999px' );
				expect( view.element.firstChild.style.top ).toBe( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_BELOW_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_BELOW_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '-9999px' );
				expect( view.element.firstChild.style.top ).toBe( '-9999px' );
			} );
		} );

		describe( 'when the DOM root got cropped by some (scrollable) ancestor and became invisible', () => {
			let ancestorElement;

			beforeEach( () => {
				ancestorElement = document.createElement( 'div' );
				ancestorElement.style.overflow = 'hidden';

				fakeDomRootElement.getBoundingClientRect.mockReturnValue( {
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

				expect( view.element.firstChild.style.left ).toBe( '-9999px' );
				expect( view.element.firstChild.style.top ).toBe( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '-9999px' );
				expect( view.element.firstChild.style.top ).toBe( '-9999px' );
			} );

			it( 'should work regardless of the DOM root geometry (SCREEN_CENTER)', () => {
				view.position = DialogViewPosition.SCREEN_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '200px' );
				expect( view.element.firstChild.style.top ).toBe( '225px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_TOP_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_TOP_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '-9999px' );
				expect( view.element.firstChild.style.top ).toBe( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_BOTTOM_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_BOTTOM_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '-9999px' );
				expect( view.element.firstChild.style.top ).toBe( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_ABOVE_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_ABOVE_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '-9999px' );
				expect( view.element.firstChild.style.top ).toBe( '-9999px' );
			} );

			it( 'should move the dialog off the screen (EDITOR_BELOW_CENTER)', () => {
				view.position = DialogViewPosition.EDITOR_BELOW_CENTER;
				view.updatePosition();

				expect( view.element.firstChild.style.left ).toBe( '-9999px' );
				expect( view.element.firstChild.style.top ).toBe( '-9999px' );
			} );
		} );

		it( 'should consider viewport offsets (dialog mode)', () => {
			getViewportOffsetStub.mockReturnValue( {
				top: 100,
				right: 0,
				bottom: 0,
				left: 100
			} );

			view.position = DialogViewPosition.EDITOR_TOP_SIDE;

			vi.spyOn( locale, 'contentLanguageDirection', 'get' ).mockReturnValue( 'rtl' );

			view.updatePosition();

			expect( view.element.firstChild.style.left ).toBe( '115px' );
			expect( view.element.firstChild.style.top ).toBe( '115px' );
		} );

		it( 'should ignore viewport offsets (modal mode)', () => {
			view.isModal = true;

			getViewportOffsetStub.mockReturnValue( {
				top: 100,
				right: 0,
				bottom: 0,
				left: 100
			} );

			view.position = DialogViewPosition.EDITOR_TOP_SIDE;

			vi.spyOn( locale, 'contentLanguageDirection', 'get' ).mockReturnValue( 'rtl' );

			view.updatePosition();

			expect( view.element.firstChild.style.left ).toBe( '25px' );
			expect( view.element.firstChild.style.top ).toBe( '25px' );
		} );

		it( 'should not warn or throw if the view has not been rendered yet', () => {
			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			view.element.remove();

			expect( () => {
				view.updatePosition();
			} ).not.toThrow();

			expect( warnStub ).not.toHaveBeenCalled();
		} );

		it( 'should not warn or throw if the view is detached from DOM', () => {
			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			const view = new DialogView( locale, {
				getDomRootElement: getDomRootElementStub,
				getViewportOffset: getViewportOffsetStub
			} );

			expect( () => {
				view.updatePosition();
			} ).not.toThrow();

			expect( warnStub ).not.toHaveBeenCalled();

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
