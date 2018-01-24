/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import utilsTestUtils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

import Model from '../../src/model';

import ButtonView from '../../src/button/buttonview';
import ToolbarView from '../../src/toolbar/toolbarview';
import ListItemView from '../../src/list/listitemview';
import ListView from '../../src/list/listview';
import DropdownView from '../../src/dropdown/dropdownview';
import DropdownPanelView from '../../src/dropdown/dropdownpanelview';
import SplitButtonView from '../../src/button/splitbuttonview';

import {
	addListViewToDropdown,
	addToolbarToDropdown,
	closeDropdownOnBlur,
	createButtonForDropdown,
	createDropdownView,
	createSplitButtonForDropdown,
	enableModelIfOneIsEnabled
} from '../../src/dropdown/utils';

const assertBinding = utilsTestUtils.assertBinding;

describe( 'utils', () => {
	let dropdownView, buttonView, model, locale;

	beforeEach( () => {
		locale = { t() {} };
		model = new Model();
		buttonView = createButtonForDropdown( model, locale );
		dropdownView = createDropdownView( model, buttonView, locale );
	} );

	afterEach( () => {
		if ( dropdownView.element ) {
			dropdownView.element.remove();
		}
	} );

	describe( 'closeDropdownOnBlur()', () => {
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

	describe( 'createButtonForDropdown()', () => {
		beforeEach( () => {
			buttonView = createButtonForDropdown( new Model(), locale );
		} );

		it( 'accepts locale', () => {
			expect( buttonView.locale ).to.equal( locale );
		} );

		it( 'returns ButtonView instance', () => {
			expect( buttonView ).to.be.instanceof( ButtonView );
		} );

		it( 'delegates "execute" to "select" event', () => {
			const spy = sinon.spy();

			buttonView.on( 'select', spy );

			buttonView.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'createSplitButtonForDropdown()', () => {
		beforeEach( () => {
			buttonView = createSplitButtonForDropdown( new Model(), locale );
		} );

		it( 'accepts locale', () => {
			expect( buttonView.locale ).to.equal( locale );
		} );

		it( 'returns SplitButtonView instance', () => {
			expect( buttonView ).to.be.instanceof( SplitButtonView );
		} );
	} );

	describe( 'createDropdownView()', () => {
		it( 'returns view', () => {
			model = new Model();
			buttonView = new ButtonView();
			dropdownView = createDropdownView( model, buttonView, locale );

			expect( dropdownView ).to.be.instanceOf( DropdownView );
		} );

		it( 'creates dropdown#panelView out of DropdownPanelView', () => {
			model = new Model();
			buttonView = new ButtonView();
			dropdownView = createDropdownView( model, buttonView, locale );

			expect( dropdownView.panelView ).to.be.instanceOf( DropdownPanelView );
		} );

		it( 'creates dropdown#buttonView out of buttonView', () => {
			model = new Model();
			buttonView = new ButtonView();
			dropdownView = createDropdownView( model, buttonView, locale );

			expect( dropdownView.buttonView ).to.equal( buttonView );
		} );

		it( 'accepts locale', () => {
			const buttonView = new ButtonView();
			dropdownView = createDropdownView( model, buttonView, locale );

			expect( dropdownView.locale ).to.equal( locale );
			expect( dropdownView.panelView.locale ).to.equal( locale );
		} );

		it( 'binds button attributes to the model', () => {
			const modelDef = {
				label: 'foo',
				isOn: false,
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			model = new Model( modelDef );
			buttonView = new ButtonView();
			createDropdownView( model, buttonView, locale );

			assertBinding( buttonView,
				modelDef,
				[
					[ model, { label: 'bar', isEnabled: false, isOn: true, withText: true, tooltip: true } ]
				],
				{ label: 'bar', isEnabled: false, isOn: true, withText: true, tooltip: true }
			);
		} );

		it( 'binds button#isOn do dropdown #isOpen and model #isOn', () => {
			const modelDef = {
				label: 'foo',
				isOn: false,
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			model = new Model( modelDef );
			buttonView = new ButtonView();
			dropdownView = createDropdownView( model, buttonView, locale );

			dropdownView.isOpen = false;
			expect( buttonView.isOn ).to.be.false;

			model.isOn = true;
			expect( buttonView.isOn ).to.be.true;

			dropdownView.isOpen = true;
			expect( buttonView.isOn ).to.be.true;

			model.isOn = false;
			expect( buttonView.isOn ).to.be.true;
		} );

		it( 'binds dropdown#isEnabled to the model', () => {
			const modelDef = {
				label: 'foo',
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			model = new Model( modelDef );
			buttonView = new ButtonView();
			dropdownView = createDropdownView( model, buttonView, locale );

			assertBinding( dropdownView,
				{ isEnabled: true },
				[
					[ model, { isEnabled: false } ]
				],
				{ isEnabled: false }
			);
		} );
	} );

	describe( 'enableModelIfOneIsEnabled()', () => {
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

	describe( 'addListViewToDropdown()', () => {
		let items;

		beforeEach( () => {
			items = new Collection();
			model = new Model( {
				isEnabled: true,
				items,
				isOn: false,
				label: 'foo'
			} );

			buttonView = createButtonForDropdown( model, locale );
			dropdownView = createDropdownView( model, buttonView, locale );

			addListViewToDropdown( dropdownView, model, locale );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );
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

	describe( 'addToolbarToDropdown()', () => {
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

			buttonView = createButtonForDropdown( model, locale );
			dropdownView = createDropdownView( model, buttonView, locale );

			addToolbarToDropdown( dropdownView, model );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );
		} );

		it( 'sets view#locale', () => {
			expect( dropdownView.locale ).to.equal( locale );
		} );

		it( 'sets view class', () => {
			expect( dropdownView.element.classList.contains( 'ck-toolbar-dropdown' ) ).to.be.true;
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
		} );

		describe( 'buttons', () => {
			// TODO: test me!
		} );
	} );

	describe( 'getBindingTargets()', () => {} );
} );
