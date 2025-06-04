/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { createMockLocale } from './_utils/dropdowntreemock.js';

import DropdownMenuNestedMenuPanelView from '../../../src/dropdown/menu/dropdownmenunestedmenupanelview.js';
import ViewCollection from '../../../src/viewcollection.js';
import View from '../../../src/view.js';
import {
	LabeledFieldView,
	createLabeledInputText
} from '../../../src/index.js';

describe( 'DropdownMenuNestedMenuPanelView', () => {
	let panelView, locale;

	beforeEach( () => {
		locale = createMockLocale();
		panelView = new DropdownMenuNestedMenuPanelView( locale );
	} );

	afterEach( () => {
		panelView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should have #content view collection', () => {
			expect( panelView.content ).to.be.instanceOf( ViewCollection );

			const view = new View();

			view.setTemplate( { tag: 'div' } );
			view.render();

			panelView.render();
			panelView.content.add( view );

			expect( panelView.element.firstChild ).to.equal( view.element );
		} );

		it( 'should have #isVisible set to false by default', () => {
			expect( panelView.isVisible ).to.be.false;
		} );

		it( 'should have #position set to "se" by default', () => {
			expect( panelView.position ).to.equal( 'se' );
		} );

		it( 'should set add additional CSS classes to the template', () => {
			panelView.render();
			panelView.class = 'FooBar';

			expect( panelView.element.classList.contains( 'FooBar' ) ).to.be.true;
		} );

		describe( 'template and DOM element', () => {
			it( 'should have CSS classes', () => {
				expect( panelView.template.attributes.class ).to.include.members( [ 'ck-reset', 'ck-dropdown-menu__nested-menu__panel' ] );
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

				panelView.content.add( labeledInput );

				labeledInput.fieldView.element.dispatchEvent( selectStartEvent );
				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'focus', () => {
			it( 'should focus the first child by default', () => {
				const firstChildView = new View();
				const lastChildView = new View();

				panelView.content.addMany( [ firstChildView, lastChildView ] );

				firstChildView.focus = sinon.spy();
				lastChildView.focus = sinon.spy();

				panelView.focus();

				sinon.assert.calledOnce( firstChildView.focus );
				sinon.assert.notCalled( lastChildView.focus );
			} );

			it( 'should focus the last child if the argument was passed', () => {
				const firstChildView = new View();
				const lastChildView = new View();

				panelView.content.addMany( [ firstChildView, lastChildView ] );

				firstChildView.focus = sinon.spy();
				lastChildView.focus = sinon.spy();

				panelView.focus( -1 );

				sinon.assert.notCalled( firstChildView.focus );
				sinon.assert.calledOnce( lastChildView.focus );
			} );
		} );
	} );
} );
