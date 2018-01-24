/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import Model from '../../src/model';

import ButtonView from '../../src/button/buttonview';
import ToolbarView from '../../src/toolbar/toolbarview';
import createButtonForDropdown from '../../src/dropdown/helpers/createbuttonfordropdown';
import createDropdownView from '../../src/dropdown/helpers/createdropdownview';

import { addToolbarToDropdown } from '../../src/dropdown/utils';

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
