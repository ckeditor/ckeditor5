/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import MenuBarMenuPanelView from '../../src/menubar/menubarmenupanelview.js';
import ViewCollection from '../../src/viewcollection.js';
import View from '../../src/view.js';
import {
	LabeledFieldView,
	createLabeledInputText
} from '../../src/index.js';

describe( 'MenuBarMenuPanelView', () => {
	let panelView, locale;

	beforeEach( () => {
		locale = new Locale();
		panelView = new MenuBarMenuPanelView( locale );
	} );

	afterEach( () => {
		panelView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should have #children view collection', () => {
			expect( panelView.children ).to.be.instanceOf( ViewCollection );

			const view = new View();

			view.setTemplate( { tag: 'div' } );
			view.render();

			panelView.render();
			panelView.children.add( view );

			expect( panelView.element.firstChild ).to.equal( view.element );
		} );

		it( 'should have #isVisible set to false by default', () => {
			expect( panelView.isVisible ).to.be.false;
		} );

		it( 'should have #position set to "se" by default', () => {
			expect( panelView.position ).to.equal( 'se' );
		} );

		describe( 'template and DOM element', () => {
			it( 'should have CSS classes', () => {
				expect( panelView.template.attributes.class ).to.include.members( [ 'ck', 'ck-reset', 'ck-menu-bar__menu__panel' ] );
			} );

			it( 'should have #position bound to a CSS class', () => {
				panelView.render();

				panelView.position = 'sw';
				expect( panelView.element.classList.contains( 'ck-menu-bar__menu__panel_position_sw' ) ).to.be.true;

				panelView.position = 'se';
				expect( panelView.element.classList.contains( 'ck-menu-bar__menu__panel_position_se' ) ).to.be.true;
			} );

			it( 'should have #isVisible bound to a CSS class', () => {
				panelView.render();

				panelView.isVisible = false;
				expect( panelView.element.classList.contains( 'ck-hidden' ) ).to.be.true;

				panelView.isVisible = true;
				expect( panelView.element.classList.contains( 'ck-hidden' ) ).to.be.false;
			} );

			it( 'should have tabindex attribute value set', () => {
				expect( panelView.template.attributes.tabindex ).to.have.members( [ '-1' ] );
			} );

			it( 'should preventDefault the selectstart event to avoid breaking the selection in the editor', () => {
				panelView.render();

				const selectStartEvent = new Event( 'selectstart', {
					bubbles: true,
					cancelable: true
				} );
				const spy = sinon.spy( selectStartEvent, 'preventDefault' );
				const labeledInput = new LabeledFieldView( { t: () => {} }, createLabeledInputText );

				panelView.element.dispatchEvent( selectStartEvent );
				sinon.assert.calledOnce( spy );

				panelView.children.add( labeledInput );

				labeledInput.fieldView.element.dispatchEvent( selectStartEvent );
				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'focus', () => {
			it( 'should focus the first child by default', () => {
				const firstChildView = new View();
				const lastChildView = new View();

				panelView.children.addMany( [ firstChildView, lastChildView ] );

				firstChildView.focus = sinon.spy();
				lastChildView.focus = sinon.spy();

				panelView.focus();

				sinon.assert.calledOnce( firstChildView.focus );
				sinon.assert.notCalled( lastChildView.focus );
			} );

			it( 'should focus the last child if the argument was passed', () => {
				const firstChildView = new View();
				const lastChildView = new View();

				panelView.children.addMany( [ firstChildView, lastChildView ] );

				firstChildView.focus = sinon.spy();
				lastChildView.focus = sinon.spy();

				panelView.focus( -1 );

				sinon.assert.notCalled( firstChildView.focus );
				sinon.assert.calledOnce( lastChildView.focus );
			} );
		} );
	} );
} );
