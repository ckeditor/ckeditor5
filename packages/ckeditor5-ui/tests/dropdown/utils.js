/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import Model from '../../src/model';

import ButtonView from '../../src/button/buttonview';
import ToolbarView from '../../src/toolbar/toolbarview';
import ListItemView from '../../src/list/listitemview';
import ListView from '../../src/list/listview';
import createButtonForDropdown from '../../src/dropdown/helpers/createbuttonfordropdown';
import createDropdownView from '../../src/dropdown/helpers/createdropdownview';

import {
	addListViewToDropdown,
	addToolbarToDropdown
} from '../../src/dropdown/utils';

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
