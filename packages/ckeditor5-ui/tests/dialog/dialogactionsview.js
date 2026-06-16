/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FocusTracker, KeystrokeHandler, keyCodes } from '@ckeditor/ckeditor5-utils';
import { ButtonView, FocusCycler, View, ViewCollection } from '../../src/index.js';
import { DialogActionsView } from '../../src/dialog/dialogactionsview.js';

describe( 'DialogActionsView', () => {
	let view;

	beforeEach( () => {
		view = new DialogActionsView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should have a CSS class', () => {
			expect( view.element.classList.contains( 'ck-dialog__actions' ) ).toBe( true );
		} );

		it( 'should have a collection of #children', () => {
			expect( view.children ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should bind the #children collection to the DOM', () => {
			const child = new View();

			child.setTemplate( { tag: 'div' } );

			view.children.add( child );

			expect( view.element.firstChild ).toBe( child.element );
		} );

		describe( 'focus tracking and cycling', () => {
			it( 'should have an instance of KeystrokeHandler', () => {
				expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
			} );

			it( 'should have an instance of FocusCycler', () => {
				expect( view.focusCycler ).toBeInstanceOf( FocusCycler );
			} );

			it( 'should have an instance of FocusTracker', () => {
				expect( view._focusTracker ).toBeInstanceOf( FocusTracker );
			} );

			describe( 'upon pressing Tab', () => {
				it( 'should navigate buttons forward', () => {
					const spy = vi.spyOn( view.focusCycler, 'focusNext' );

					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: () => {},
						stopPropagation: () => {}
					};

					view.keystrokes.press( keyEvtData );

					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'should cycle back to the first button when currently in the last one', () => {
					view.setButtons( [ { label: 'foo' }, { label: 'bar' } ] );

					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: () => {},
						stopPropagation: () => {}
					};

					view.keystrokes.press( keyEvtData );

					const spy = vi.spyOn( view.focusCycler, 'focusFirst' );

					view.keystrokes.press( keyEvtData );

					expect( spy ).toHaveBeenCalledOnce();
				} );
			} );

			describe( 'upon pressing Shift+Tab', () => {
				it( 'should navigate buttons backward', () => {
					view.setButtons( [ { label: 'foo' }, { label: 'bar' } ] );

					const spy = vi.spyOn( view.focusCycler, 'focusPrevious' );
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: () => {},
						stopPropagation: () => {}
					};

					view.keystrokes.press( keyEvtData );

					expect( spy ).toHaveBeenCalledOnce();
				} );

				it( 'should cycle back to the last button when currently in the first one', () => {
					view.setButtons( [ { label: 'foo' }, { label: 'bar' } ] );

					const spy = vi.spyOn( view.focusCycler, 'focusFirst' );
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: () => {},
						stopPropagation: () => {}
					};

					view.focus();

					view.keystrokes.press( keyEvtData );

					expect( spy ).toHaveBeenCalledOnce();
				} );
			} );
		} );
	} );

	describe( 'setButtons()', () => {
		it( 'should create buttons according to definitions', () => {
			view.setButtons( [
				{
					label: 'foo',
					class: 'ck-button-action',
					withText: true
				},
				{ label: 'bar' }
			] );

			expect( view.children ).toHaveLength( 2 );
			expect( view.children.get( 0 ).label ).toBe( 'foo' );
			expect( view.children.get( 0 ).class ).toBe( 'ck-button-action' );
			expect( view.children.get( 0 ).withText ).toBe( true );
			expect( view.children.get( 0 ) ).toBeInstanceOf( ButtonView );
		} );

		it( 'should enable #onExecute callbacks from definitions', () => {
			const spy = vi.fn();

			view.setButtons( [
				{
					label: 'foo',
					class: 'ck-button-action',
					withText: true,
					onExecute: spy
				}
			] );

			view.children.get( 0 ).fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should enable #onCreate callbacks from definitions', () => {
			const spy = vi.fn();

			view.setButtons( [
				{
					label: 'foo',
					class: 'ck-button-action',
					withText: true,
					onExecute: () => {},
					onCreate: spy
				}
			] );

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first button by default', () => {
			view.setButtons( [
				{ label: 'foo' },
				{ label: 'bar' }
			] );

			const spy = vi.spyOn( view.focusCycler, 'focusFirst' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should support focus directionality', () => {
			view.setButtons( [
				{ label: 'foo' },
				{ label: 'bar' }
			] );

			const spyFirst = vi.spyOn( view.focusCycler, 'focusFirst' );
			const spyLast = vi.spyOn( view.focusCycler, 'focusLast' );

			view.focus( -1 );

			expect( spyFirst ).not.toHaveBeenCalled();
			expect( spyLast ).toHaveBeenCalledOnce();
		} );
	} );
} );
