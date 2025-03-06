/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconDropdownArrow } from '@ckeditor/ckeditor5-icons';
import CollapsibleView from '../../src/collapsible/collapsibleview.js';
import ButtonView from '../../src/button/buttonview.js';

import ViewCollection from '../../src/viewcollection.js';

describe( 'CollapsibleView', () => {
	let view, locale;

	beforeEach( () => {
		locale = { t: text => text };
		view = new CollapsibleView( locale );

		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should accept initial list of children', () => {
			view.destroy();

			const buttonA = new ButtonView( locale );
			const buttonB = new ButtonView( locale );

			buttonA.class = 'foo';
			buttonB.class = 'bar';

			view = new CollapsibleView( locale, [ buttonA, buttonB ] );
			view.render();

			expect( view.element.lastChild.firstChild.classList.contains( 'foo' ) ).to.be.true;
			expect( view.element.lastChild.lastChild.classList.contains( 'bar' ) ).to.be.true;
		} );

		describe( 'template', () => {
			it( 'should create an #element from the template', () => {
				expect( view.element.tagName ).to.equal( 'DIV' );
				expect( view.element.classList.contains( 'ck-collapsible' ) ).to.be.true;

				expect( view.element.firstChild.classList.contains( 'ck-button' ) ).to.be.true;
				expect( view.element.lastChild.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.lastChild.classList.contains( 'ck-collapsible__children' ) ).to.be.true;
				expect( view.element.lastChild.getAttribute( 'role' ) ).to.equal( 'region' );
			} );

			describe( 'main button', () => {
				it( 'should have an icon', () => {
					expect( view.buttonView.icon ).to.equal( IconDropdownArrow );
				} );

				it( 'should display its text', () => {
					expect( view.buttonView.withText ).to.be.true;
				} );
			} );

			it( 'should set the proper ARIA label on the collapsible container', () => {
				const buttonLabelId = view.buttonView.labelView.element.id;

				expect( view.element.lastChild.getAttribute( 'aria-labelledby' ) ).to.match( /^ck-editor__aria/ );
				expect( view.element.lastChild.getAttribute( 'aria-labelledby' ) ).to.equal( buttonLabelId );
			} );
		} );

		it( 'should have a #children collection', () => {
			expect( view.children ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should have #isCollapsed', () => {
			expect( view.isCollapsed ).to.be.false;
		} );

		it( 'should have #label with default value', () => {
			expect( view.label ).to.equal( '' );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the button', () => {
			const spy = sinon.spy( view.buttonView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'DOM bindings', () => {
		describe( 'button label', () => {
			it( 'should react on view#label', () => {
				expect( view.buttonView.element.innerText ).to.equal( '' );

				view.label = 'Foo';

				expect( view.buttonView.element.innerText ).to.equal( 'Foo' );
			} );
		} );

		describe( 'button aria-expanded', () => {
			it( 'should react on button#isOn', () => {
				expect( view.buttonView.isOn ).to.be.true;
				expect( view.buttonView.element.getAttribute( 'aria-expanded' ) ).to.equal( 'true' );

				view.buttonView.isOn = false;
				expect( view.buttonView.element.getAttribute( 'aria-expanded' ) ).to.equal( 'false' );
			} );

			it( 'should react on view#isCollapsed', () => {
				expect( view.buttonView.element.getAttribute( 'aria-expanded' ) ).to.equal( 'true' );

				view.isCollapsed = true;
				expect( view.buttonView.element.getAttribute( 'aria-expanded' ) ).to.equal( 'false' );
			} );
		} );

		describe( 'collapsed state', () => {
			it( 'should react on view#isCollapsed', () => {
				expect( view.element.classList.contains( 'ck-collapsible_collapsed' ) ).to.be.false;
				expect( view.element.lastChild.getAttribute( 'hidden' ) ).to.be.null;

				view.isCollapsed = true;

				expect( view.element.classList.contains( 'ck-collapsible_collapsed' ) ).to.be.true;
				expect( view.element.lastChild.getAttribute( 'hidden' ) ).to.equal( 'hidden' );
			} );

			it( 'should react on view.buttonView#execute', () => {
				expect( view.element.classList.contains( 'ck-collapsible_collapsed' ) ).to.be.false;

				view.buttonView.fire( 'execute' );

				expect( view.element.classList.contains( 'ck-collapsible_collapsed' ) ).to.be.true;
			} );
		} );

		describe( 'collapsible children', () => {
			it( 'should react to changes in #children', () => {
				const buttonA = new ButtonView( locale );
				const buttonB = new ButtonView( locale );

				expect( view.element.lastChild.children.length ).to.equal( 0 );

				view.children.add( buttonA );
				expect( view.element.lastChild.children.length ).to.equal( 1 );

				view.children.add( buttonB );
				expect( view.element.lastChild.children.length ).to.equal( 2 );
			} );
		} );
	} );
} );
