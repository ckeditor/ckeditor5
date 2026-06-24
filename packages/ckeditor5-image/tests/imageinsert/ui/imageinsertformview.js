/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ImageInsertFormView } from '../../../src/imageinsert/ui/imageinsertformview.js';
import { ImageInsertUrlView } from '../../../src/imageinsert/ui/imageinserturlview.js';
import { ButtonView, FocusCycler, ViewCollection, CollapsibleView } from '@ckeditor/ckeditor5-ui';

import { keyCodes, KeystrokeHandler, FocusTracker } from '@ckeditor/ckeditor5-utils';

describe( 'ImageInsertFormView', () => {
	let view;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

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
			expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view._focusCycler ).toBeInstanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should have #children view collection', () => {
			expect( view.children ).toBeInstanceOf( ViewCollection );
		} );
	} );

	describe( 'integrations', () => {
		it( 'single integrations', () => {
			const inputIntegrationView = new ImageInsertUrlView( { t: val => val } );

			const view = new ImageInsertFormView( { t: val => val }, [
				inputIntegrationView
			] );

			expect( view._focusables.map( f => f ) ).toEqual(
				expect.arrayContaining( [ inputIntegrationView ] )
			);
			expect( view._focusables.map( f => f ) ).toHaveLength( 1 );

			expect( view.children.map( f => f ) ).toEqual(
				expect.arrayContaining( [ inputIntegrationView ] )
			);
			expect( view.children.map( f => f ) ).toHaveLength( 1 );
		} );

		it( 'multiple integrations', () => {
			const buttonIntegrationView = new ButtonView( { t: val => val } );
			const inputIntegrationView = new ImageInsertUrlView( { t: val => val } );

			const view = new ImageInsertFormView( { t: val => val }, [
				buttonIntegrationView,
				inputIntegrationView
			] );

			expect( view._focusables.map( f => f ) ).toEqual(
				expect.arrayContaining( [ buttonIntegrationView, inputIntegrationView ] )
			);
			expect( view._focusables.map( f => f ) ).toHaveLength( 2 );

			expect( view.children.map( f => f ) ).toEqual(
				expect.arrayContaining( [ buttonIntegrationView, inputIntegrationView ] )
			);
			expect( view.children.map( f => f ) ).toHaveLength( 2 );
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

			expect( view._focusables.map( f => f ) ).toEqual(
				expect.arrayContaining( [ buttonIntegrationView, collapsibleIntegrationView, inputIntegrationView ] )
			);
			expect( view._focusables.map( f => f ) ).toHaveLength( 3 );

			expect( view.children.map( f => f ) ).toEqual(
				expect.arrayContaining( [ buttonIntegrationView, collapsibleIntegrationView ] )
			);
			expect( view.children.map( f => f ) ).toHaveLength( 2 );
		} );
	} );

	describe( 'template', () => {
		it( 'should create element from the template', () => {
			expect( view.element.tagName ).toBe( 'FORM' );
			expect( view.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.element.classList.contains( 'ck-image-insert-form' ) ).toBe( true );
			expect( view.element.getAttribute( 'tabindex' ) ).toBe( '-1' );
		} );

		it( 'should bind #children', () => {
			expect( view.template.children[ 0 ] ).toBe( view.children );
		} );
	} );

	describe( 'render()', () => {
		it( 'should handle and delegate DOM submit event', () => {
			const spy = vi.fn();

			view.on( 'submit', spy );
			view.element.dispatchEvent( new Event( 'submit' ) );

			expect( spy ).toHaveBeenCalledOnce();
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

			const spy = vi.spyOn( view.focusTracker, 'add' );

			view.render();

			expect( spy ).toHaveBeenNthCalledWith( 1, buttonIntegrationView.element );
			expect( spy ).toHaveBeenNthCalledWith( 2, collapsibleIntegrationView.element );
			expect( spy ).toHaveBeenNthCalledWith( 3, inputIntegrationView.element );
			expect( spy ).toHaveBeenCalledTimes( 3 );

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
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the first integration focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = firstIntegrationView.element;

				const spy = vi.spyOn( secondIntegrationView, 'focus' );

				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'so "shift + tab" focuses the previous focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: vi.fn(),
					stopPropagation: vi.fn()
				};

				// Mock the cancel button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = secondIntegrationView.element;

				const spy = vi.spyOn( firstIntegrationView, 'focus' );

				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.preventDefault ).toHaveBeenCalledOnce();
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledOnce();
			} );

			it( 'intercepts the arrow* events and overrides the default toolbar behavior', () => {
				const keyEvtData = {
					stopPropagation: vi.fn()
				};

				keyEvtData.keyCode = keyCodes.arrowdown;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );

				keyEvtData.keyCode = keyCodes.arrowup;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 2 );

				keyEvtData.keyCode = keyCodes.arrowleft;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 3 );

				keyEvtData.keyCode = keyCodes.arrowright;
				view.keystrokes.press( keyEvtData );
				expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 4 );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = vi.spyOn( view.focusTracker, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = vi.spyOn( view.keystrokes, 'destroy' );

			view.destroy();

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus first focusable', () => {
			const spy = vi.spyOn( view._focusCycler, 'focusFirst' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
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
					stopPropagation: vi.fn(),
					preventDefault: vi.fn()
				};

				view.focus();
				expect( view.focusTracker.focusedElement ).toBe( buttonIntegrationView.element );

				view.keystrokes.press( keyEvtData );
				expect( view.focusTracker.focusedElement ).toBe( buttonIntegrationView.element );
			} );

			it( 'backward cycling', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					stopPropagation: vi.fn(),
					preventDefault: vi.fn()
				};

				view.focus();
				expect( view.focusTracker.focusedElement ).toBe( buttonIntegrationView.element );

				view.keystrokes.press( keyEvtData );
				expect( view.focusTracker.focusedElement ).toBe( buttonIntegrationView.element );
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
					stopPropagation: vi.fn(),
					preventDefault: vi.fn()
				};

				view.focus();
				expect( view.focusTracker.focusedElement ).toBe( buttonIntegrationView.element );

				view.keystrokes.press( keyEvtData );
				expect( view.focusTracker.focusedElement ).toBe( otherButtonIntegrationView.element );

				view.keystrokes.press( keyEvtData );
				expect( view.focusTracker.focusedElement ).toBe( buttonIntegrationView.element );
			} );

			it( 'backward cycling', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					stopPropagation: vi.fn(),
					preventDefault: vi.fn()
				};

				view.focus();
				expect( view.focusTracker.focusedElement ).toBe( buttonIntegrationView.element );

				view.keystrokes.press( keyEvtData );
				expect( view.focusTracker.focusedElement ).toBe( otherButtonIntegrationView.element );

				view.keystrokes.press( keyEvtData );
				expect( view.focusTracker.focusedElement ).toBe( buttonIntegrationView.element );
			} );
		} );
	} );
} );
