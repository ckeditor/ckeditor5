/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { FocusTracker, KeystrokeHandler, keyCodes } from '@ckeditor/ckeditor5-utils';
import { ButtonView, FocusCycler, View, ViewCollection } from '../../src/index.js';
import DialogActionsView from '../../src/dialog/dialogactionsview.js';

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
			expect( view.element.classList.contains( 'ck-dialog__actions' ) ).to.be.true;
		} );

		it( 'should have a collection of #children', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should bind the #children collection to the DOM', () => {
			const child = new View();

			child.setTemplate( { tag: 'div' } );

			view.children.add( child );

			expect( view.element.firstChild ).to.equal( child.element );
		} );

		describe( 'focus tracking and cycling', () => {
			it( 'should have an instance of KeystrokeHandler', () => {
				expect( view.keystrokes ).to.be.an.instanceOf( KeystrokeHandler );
			} );

			it( 'should have an instance of FocusCycler', () => {
				expect( view.focusCycler ).to.be.an.instanceOf( FocusCycler );
			} );

			it( 'should have an instance of FocusTracker', () => {
				expect( view._focusTracker ).to.be.an.instanceOf( FocusTracker );
			} );

			describe( 'upon pressing Tab', () => {
				it( 'should navigate buttons forward', () => {
					const spy = sinon.spy( view.focusCycler, 'focusNext' );

					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: () => {},
						stopPropagation: () => {}
					};

					view.keystrokes.press( keyEvtData );

					sinon.assert.calledOnce( spy );
				} );

				it( 'should cycle back to the first button when currently in the last one', () => {
					view.setButtons( [ { label: 'foo' }, { label: 'bar' } ] );

					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: () => {},
						stopPropagation: () => {}
					};

					view.keystrokes.press( keyEvtData );

					const spy = sinon.spy( view.focusCycler, 'focusFirst' );

					view.keystrokes.press( keyEvtData );

					sinon.assert.calledOnce( spy );
				} );
			} );

			describe( 'upon pressing Shift+Tab', () => {
				it( 'should navigate buttons backward', () => {
					view.setButtons( [ { label: 'foo' }, { label: 'bar' } ] );

					const spy = sinon.spy( view.focusCycler, 'focusPrevious' );
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: () => {},
						stopPropagation: () => {}
					};

					view.keystrokes.press( keyEvtData );

					sinon.assert.calledOnce( spy );
				} );

				it( 'should cycle back to the last button when currently in the first one', () => {
					view.setButtons( [ { label: 'foo' }, { label: 'bar' } ] );

					const spy = sinon.spy( view.focusCycler, 'focusFirst' );
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: () => {},
						stopPropagation: () => {}
					};

					view.focus();

					view.keystrokes.press( keyEvtData );

					sinon.assert.calledOnce( spy );
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

			expect( view.children ).to.have.length( 2 );
			expect( view.children.get( 0 ).label ).to.equal( 'foo' );
			expect( view.children.get( 0 ).class ).to.equal( 'ck-button-action' );
			expect( view.children.get( 0 ).withText ).to.be.true;
			expect( view.children.get( 0 ) ).to.be.instanceOf( ButtonView );
		} );

		it( 'should enable #onExecute callbacks from definitions', () => {
			const spy = sinon.spy();

			view.setButtons( [
				{
					label: 'foo',
					class: 'ck-button-action',
					withText: true,
					onExecute: spy
				}
			] );

			view.children.get( 0 ).fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should enable #onCreate callbacks from definitions', () => {
			const spy = sinon.spy();

			view.setButtons( [
				{
					label: 'foo',
					class: 'ck-button-action',
					withText: true,
					onExecute: () => {},
					onCreate: spy
				}
			] );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first button by default', () => {
			view.setButtons( [
				{ label: 'foo' },
				{ label: 'bar' }
			] );

			const spy = sinon.spy( view.focusCycler, 'focusFirst' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should support focus directionality', () => {
			view.setButtons( [
				{ label: 'foo' },
				{ label: 'bar' }
			] );

			const spyFirst = sinon.spy( view.focusCycler, 'focusFirst' );
			const spyLast = sinon.spy( view.focusCycler, 'focusLast' );

			view.focus( -1 );

			sinon.assert.notCalled( spyFirst );
			sinon.assert.calledOnce( spyLast );
		} );
	} );
} );
