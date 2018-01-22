/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import Model from '../../src/model';

import View from '../../src/view';
import ButtonView from '../../src/button/buttonview';
import ToolbarView from '../../src/toolbar/toolbarview';

import {
	addListViewToDropdown,
	addToolbarToDropdown,
	closeDropdownOnBlur,
	closeDropdownOnExecute,
	createButtonForDropdown,
	createDropdownView,
	createSingleButtonDropdown,
	enableModelIfOneIsEnabled,
	focusDropdownContentsOnArrows
} from '../../src/dropdown/utils';
import ListItemView from '../../src/list/listitemview';

import ListView from '../../src/list/listview';
import Collection from '../../../ckeditor5-utils/src/collection';

describe( 'utils', () => {
	let dropdownView, buttonView, model, locale;

	beforeEach( () => {
		locale = { t() {} };
		model = new Model();
		buttonView = createButtonForDropdown( model, locale );
		dropdownView = createDropdownView( model, buttonView, locale );
	} );

	describe( 'focusDropdownContentsOnArrows', () => {
		let panelChildView;

		beforeEach( () => {
			panelChildView = new View();
			panelChildView.setTemplate( { tag: 'div' } );
			panelChildView.focus = () => {};
			panelChildView.focusLast = () => {};

			// TODO: describe this as #contentView instaed of #listView and #toolbarView
			dropdownView.panelView.children.add( panelChildView );

			focusDropdownContentsOnArrows( dropdownView );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );
		} );

		it( '"arrowdown" focuses the #innerPanelView if dropdown is open', () => {
			const keyEvtData = {
				keyCode: keyCodes.arrowdown,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			const spy = sinon.spy( panelChildView, 'focus' );

			dropdownView.isOpen = false;
			dropdownView.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( spy );

			dropdownView.isOpen = true;
			dropdownView.keystrokes.press( keyEvtData );

			sinon.assert.calledOnce( spy );
		} );

		it( '"arrowup" focuses the last #item in #innerPanelView if dropdown is open', () => {
			const keyEvtData = {
				keyCode: keyCodes.arrowup,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
			const spy = sinon.spy( panelChildView, 'focusLast' );

			dropdownView.isOpen = false;
			dropdownView.keystrokes.press( keyEvtData );
			sinon.assert.notCalled( spy );

			dropdownView.isOpen = true;
			dropdownView.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'closeDropdownOnExecute', () => {
		beforeEach( () => {
			closeDropdownOnExecute( dropdownView );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );
		} );

		it( 'changes view#isOpen on view#execute', () => {
			dropdownView.isOpen = true;

			dropdownView.fire( 'execute' );
			expect( dropdownView.isOpen ).to.be.false;

			dropdownView.fire( 'execute' );
			expect( dropdownView.isOpen ).to.be.false;
		} );
	} );

	describe( 'closeDropdownOnBlur', () => {
		beforeEach( () => {
			closeDropdownOnBlur( dropdownView );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );
		} );

		it( 'listens to view#isOpen and reacts to DOM events (valid target)', () => {
			// Open the dropdown.
			dropdownView.isOpen = true;

			// Fire event from outside of the dropdown.
			document.body.dispatchEvent( new Event( 'mousedown', {
				bubbles: true
			} ) );

			// Closed the dropdown.
			expect( dropdownView.isOpen ).to.be.false;

			// Fire event from outside of the dropdown.
			document.body.dispatchEvent( new Event( 'mousedown', {
				bubbles: true
			} ) );

			// Dropdown is still closed.
			expect( dropdownView.isOpen ).to.be.false;
		} );

		it( 'listens to view#isOpen and reacts to DOM events (invalid target)', () => {
			// Open the dropdown.
			dropdownView.isOpen = true;

			// Event from view.element should be discarded.
			dropdownView.element.dispatchEvent( new Event( 'mousedown', {
				bubbles: true
			} ) );

			// Dropdown is still open.
			expect( dropdownView.isOpen ).to.be.true;

			// Event from within view.element should be discarded.
			const child = document.createElement( 'div' );
			dropdownView.element.appendChild( child );

			child.dispatchEvent( new Event( 'mousedown', {
				bubbles: true
			} ) );

			// Dropdown is still open.
			expect( dropdownView.isOpen ).to.be.true;
		} );
	} );

	describe( 'createButtonForDropdown', () => {} );

	describe( 'createSplitButtonForDropdown', () => {} );

	describe( 'createDropdownView', () => {} );

	describe( 'createSplitButtonDropdown', () => {} );

	describe( 'createSingleButtonDropdown', () => {} );

	describe( 'enableModelIfOneIsEnabled', () => {
		it( 'Bind to #isEnabled of each observable  and set it true if any observable #isEnabled is true', () => {
			const observables = [
				new Model( { isEnabled: false } ),
				new Model( { isEnabled: false } ),
				new Model( { isEnabled: false } )
			];
			enableModelIfOneIsEnabled( model, observables );

			expect( model.isEnabled ).to.be.false;

			observables[ 0 ].isEnabled = true;

			expect( model.isEnabled ).to.be.true;

			observables[ 0 ].isEnabled = false;

			expect( model.isEnabled ).to.be.false;

			observables[ 1 ].isEnabled = true;

			expect( model.isEnabled ).to.be.true;
		} );
	} );

	describe( 'addListViewToDropdown', () => {
		let items;

		beforeEach( () => {
			items = new Collection();
			model = new Model( {
				isEnabled: true,
				items,
				isOn: false,
				label: 'foo'
			} );

			dropdownView = createSingleButtonDropdown( model, locale );

			addListViewToDropdown( dropdownView, model, locale );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );
		} );

		afterEach( () => {
			dropdownView.element.remove();
		} );

		it( 'sets view#locale', () => {
			expect( dropdownView.locale ).to.equal( locale );
		} );

		describe( 'view#listView', () => {
			it( 'is created', () => {
				const panelChildren = dropdownView.panelView.children;

				expect( panelChildren ).to.have.length( 1 );
				expect( panelChildren.get( 0 ) ).to.equal( dropdownView.listView );
				expect( dropdownView.listView ).to.be.instanceof( ListView );
			} );

			it( 'is bound to model#items', () => {
				items.add( new Model( { label: 'a', style: 'b' } ) );
				items.add( new Model( { label: 'c', style: 'd' } ) );

				expect( dropdownView.listView.items ).to.have.length( 2 );
				expect( dropdownView.listView.items.get( 0 ) ).to.be.instanceOf( ListItemView );
				expect( dropdownView.listView.items.get( 1 ).label ).to.equal( 'c' );
				expect( dropdownView.listView.items.get( 1 ).style ).to.equal( 'd' );

				items.remove( 1 );
				expect( dropdownView.listView.items ).to.have.length( 1 );
				expect( dropdownView.listView.items.get( 0 ).label ).to.equal( 'a' );
				expect( dropdownView.listView.items.get( 0 ).style ).to.equal( 'b' );
			} );

			it( 'binds all attributes in model#items', () => {
				const itemModel = new Model( { label: 'a', style: 'b', foo: 'bar', baz: 'qux' } );

				items.add( itemModel );

				const item = dropdownView.listView.items.get( 0 );

				expect( item.foo ).to.equal( 'bar' );
				expect( item.baz ).to.equal( 'qux' );

				itemModel.baz = 'foo?';
				expect( item.baz ).to.equal( 'foo?' );
			} );

			it( 'delegates view.listView#execute to the view', done => {
				items.add( new Model( { label: 'a', style: 'b' } ) );

				dropdownView.on( 'execute', evt => {
					expect( evt.source ).to.equal( dropdownView.listView.items.get( 0 ) );
					expect( evt.path ).to.deep.equal( [ dropdownView.listView.items.get( 0 ), dropdownView ] );

					done();
				} );

				dropdownView.listView.items.get( 0 ).fire( 'execute' );
			} );
		} );
	} );

	describe( 'addToolbarToDropdown', () => {
		let buttons;

		beforeEach( () => {
			buttons = [ '<svg>foo</svg>', '<svg>bar</svg>' ].map( icon => {
				const button = new ButtonView();

				button.icon = icon;

				return button;
			} );

			model = new Model( {
				isVertical: true,
				buttons
			} );

			dropdownView = createSingleButtonDropdown( model, locale );

			addToolbarToDropdown( dropdownView, model );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );
		} );

		afterEach( () => {
			dropdownView.element.remove();
		} );

		describe( 'constructor()', () => {
			it( 'sets view#locale', () => {
				expect( dropdownView.locale ).to.equal( locale );
			} );

			describe( 'view#toolbarView', () => {
				it( 'is created', () => {
					const panelChildren = dropdownView.panelView.children;

					expect( panelChildren ).to.have.length( 1 );
					expect( panelChildren.get( 0 ) ).to.equal( dropdownView.toolbarView );
					expect( dropdownView.toolbarView ).to.be.instanceof( ToolbarView );
				} );

				it.skip( 'delegates view.toolbarView.items#execute to the view', done => {
					dropdownView.on( 'execute', evt => {
						expect( evt.source ).to.equal( dropdownView.toolbarView.items.get( 0 ) );
						expect( evt.path ).to.deep.equal( [ dropdownView.toolbarView.items.get( 0 ), dropdownView ] );

						done();
					} );

					dropdownView.toolbarView.items.get( 0 ).fire( 'execute' );
				} );

				it( 'reacts on model#isVertical', () => {
					model.isVertical = false;
					expect( dropdownView.toolbarView.isVertical ).to.be.false;

					model.isVertical = true;
					expect( dropdownView.toolbarView.isVertical ).to.be.true;
				} );

				// TODO: remove?
				it( 'reacts on model#toolbarClassName', () => {
					expect( dropdownView.toolbarView.className ).to.be.undefined;

					model.set( 'toolbarClassName', 'foo' );
					expect( dropdownView.toolbarView.className ).to.equal( 'foo' );
				} );
			} );

			describe( 'buttons', () => {
				// TODO: test me!
			} );
		} );
	} );

	describe( 'addDefaultBehavior', () => {} );

	describe( 'getBindingTargets', () => {} );

	describe.skip( 'to sort', () => {} );
} );
