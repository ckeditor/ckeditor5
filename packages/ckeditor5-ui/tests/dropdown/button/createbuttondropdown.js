/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import Model from '../../../src/model';
import createButtonDropdown from '../../../src/dropdown/button/createbuttondropdown';

import ButtonView from '../../../src/button/buttonview';
import ToolbarView from '../../../src/toolbar/toolbarview';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'createButtonDropdown', () => {
	let view, model, locale, buttonViews;

	beforeEach( () => {
		locale = { t() {} };
		buttonViews = [ 'foo', 'bar' ].map( icon => {
			const button = new ButtonView();
			button.icon = icon;

			return button;
		} );

		model = new Model( { isVertical: true } );

		view = createButtonDropdown( model, buttonViews, locale );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		describe( 'view#buttonGroupView', () => {
			it( 'is created', () => {
				const panelChildren = view.panelView.children;

				expect( panelChildren ).to.have.length( 1 );
				expect( panelChildren.get( 0 ) ).to.equal( view.buttonGroupView );
				expect( view.buttonGroupView ).to.be.instanceof( ToolbarView );
			} );

			it( 'delegates view.buttonGroupView#execute to the view', done => {
				view.on( 'execute', evt => {
					expect( evt.source ).to.equal( view.buttonGroupView.items.get( 0 ) );
					expect( evt.path ).to.deep.equal( [ view.buttonGroupView.items.get( 0 ), view ] );

					done();
				} );

				view.buttonGroupView.items.get( 0 ).fire( 'execute' );
			} );
		} );

		it( 'changes view#isOpen on view#execute', () => {
			view.isOpen = true;

			view.fire( 'execute' );
			expect( view.isOpen ).to.be.false;

			view.fire( 'execute' );
			expect( view.isOpen ).to.be.false;
		} );

		it( 'listens to view#isOpen and reacts to DOM events (valid target)', () => {
			// Open the dropdown.
			view.isOpen = true;

			// Fire event from outside of the dropdown.
			document.body.dispatchEvent( new Event( 'click', {
				bubbles: true
			} ) );

			// Closed the dropdown.
			expect( view.isOpen ).to.be.false;

			// Fire event from outside of the dropdown.
			document.body.dispatchEvent( new Event( 'click', {
				bubbles: true
			} ) );

			// Dropdown is still closed.
			expect( view.isOpen ).to.be.false;
		} );

		it( 'listens to view#isOpen and reacts to DOM events (invalid target)', () => {
			// Open the dropdown.
			view.isOpen = true;

			// Event from view.element should be discarded.
			view.element.dispatchEvent( new Event( 'click', {
				bubbles: true
			} ) );

			// Dropdown is still open.
			expect( view.isOpen ).to.be.true;

			// Event from within view.element should be discarded.
			const child = document.createElement( 'div' );
			view.element.appendChild( child );

			child.dispatchEvent( new Event( 'click', {
				bubbles: true
			} ) );

			// Dropdown is still open.
			expect( view.isOpen ).to.be.true;
		} );

		describe( 'activates keyboard navigation for the dropdown', () => {
			it( 'so "arrowdown" focuses the #buttonGroupView if dropdown is open', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};
				const spy = sinon.spy( view.buttonGroupView, 'focus' );

				view.isOpen = false;
				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( spy );

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "arrowup" focuses the last #item in #buttonGroupView if dropdown is open', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowup,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};
				const spy = sinon.spy( view.buttonGroupView, 'focusLast' );

				view.isOpen = false;
				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( spy );

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'icon', () => {
			it( 'should be set to first button\'s icon if no defaultIcon defined', () => {
				expect( view.buttonView.icon ).to.equal( view.buttonGroupView.items.get( 0 ).icon );
			} );

			it( 'should be bound to first button that is on', () => {
				view.buttonGroupView.items.get( 1 ).isOn = true;

				expect( view.buttonView.icon ).to.equal( view.buttonGroupView.items.get( 1 ).icon );

				view.buttonGroupView.items.get( 0 ).isOn = true;
				view.buttonGroupView.items.get( 1 ).isOn = false;

				expect( view.buttonView.icon ).to.equal( view.buttonGroupView.items.get( 0 ).icon );
			} );

			it( 'should be set to defaultIcon if defined and on button is on', () => {
				const model = new Model( { defaultIcon: 'baz' } );

				view = createButtonDropdown( model, buttonViews, locale );
				view.render();

				expect( view.buttonView.icon ).to.equal( 'baz' );
			} );

			it( 'should not bind icons if staticIcon is set', () => {
				const model = new Model( { defaultIcon: 'baz', staticIcon: true } );

				view = createButtonDropdown( model, buttonViews, locale );
				view.render();

				expect( view.buttonView.icon ).to.equal( 'baz' );
				view.buttonGroupView.items.get( 1 ).isOn = true;

				expect( view.buttonView.icon ).to.equal( 'baz' );
			} );
		} );
	} );
} );
