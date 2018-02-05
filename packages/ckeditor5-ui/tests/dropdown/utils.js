/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document Event */

import utilsTestUtils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import Model from '../../src/model';

import ButtonView from '../../src/button/buttonview';
import DropdownView from '../../src/dropdown/dropdownview';
import DropdownPanelView from '../../src/dropdown/dropdownpanelview';
import SplitButtonView from '../../src/dropdown/button/splitbuttonview';
import View from '../../src/view';
import ToolbarView from '../../src/toolbar/toolbarview';
import { createDropdown, addToolbarToDropdown, addListToDropdown } from '../../src/dropdown/utils';
import ListItemView from '../../src/list/listitemview';
import ListView from '../../src/list/listview';

const assertBinding = utilsTestUtils.assertBinding;

describe( 'utils', () => {
	let locale, dropdownView;

	beforeEach( () => {
		locale = { t() {} };
	} );

	describe( 'createDropdown()', () => {
		beforeEach( () => {
			dropdownView = createDropdown( locale );
		} );

		it( 'accepts locale', () => {
			expect( dropdownView.locale ).to.equal( locale );
			expect( dropdownView.panelView.locale ).to.equal( locale );
		} );

		it( 'returns view', () => {
			expect( dropdownView ).to.be.instanceOf( DropdownView );
		} );

		it( 'creates dropdown#panelView out of DropdownPanelView', () => {
			expect( dropdownView.panelView ).to.be.instanceOf( DropdownPanelView );
		} );

		it( 'creates dropdown#buttonView out of ButtonView', () => {
			expect( dropdownView.buttonView ).to.be.instanceOf( ButtonView );
		} );

		it( 'creates dropdown#buttonView out of passed SplitButtonView', () => {
			dropdownView = createDropdown( locale, SplitButtonView );

			expect( dropdownView.buttonView ).to.be.instanceOf( SplitButtonView );
		} );

		it( 'binds button attributes to the model', () => {
			const modelDef = {
				label: 'foo',
				isOn: false,
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			dropdownView = createDropdown( locale );

			dropdownView.set( modelDef );

			assertBinding( dropdownView.buttonView,
				modelDef,
				[
					[ dropdownView, { label: 'bar', isEnabled: false, isOn: true, withText: true, tooltip: true } ]
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

			dropdownView = createDropdown( locale );
			dropdownView.set( modelDef );

			dropdownView.isOpen = false;
			expect( dropdownView.buttonView.isOn ).to.be.false;

			dropdownView.isOn = true;
			expect( dropdownView.buttonView.isOn ).to.be.true;

			dropdownView.isOpen = true;
			expect( dropdownView.buttonView.isOn ).to.be.true;

			dropdownView.isOn = false;
			expect( dropdownView.buttonView.isOn ).to.be.true;
		} );

		it( 'binds dropdown#isEnabled to the model', () => {
			const modelDef = {
				label: 'foo',
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			dropdownView = createDropdown( locale );
			dropdownView.set( modelDef );

			assertBinding( dropdownView,
				{ isEnabled: true },
				[
					[ dropdownView, { isEnabled: false } ]
				],
				{ isEnabled: false }
			);
		} );

		describe( '#buttonView', () => {
			it( 'accepts locale', () => {
				expect( dropdownView.buttonView.locale ).to.equal( locale );
			} );

			it( 'is a ButtonView instance', () => {
				expect( dropdownView.buttonView ).to.be.instanceof( ButtonView );
			} );
		} );

		describe( 'hasDefaultBehavior', () => {
			describe( 'closeDropdownOnBlur()', () => {
				beforeEach( () => {
					dropdownView.render();
					document.body.appendChild( dropdownView.element );
				} );

				afterEach( () => {
					dropdownView.element.remove();
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

			describe( 'closeDropdownOnExecute()', () => {
				beforeEach( () => {
					dropdownView.render();
					document.body.appendChild( dropdownView.element );
				} );

				afterEach( () => {
					dropdownView.element.remove();
				} );

				it( 'changes view#isOpen on view#execute', () => {
					dropdownView.isOpen = true;

					dropdownView.fire( 'execute' );
					expect( dropdownView.isOpen ).to.be.false;

					dropdownView.fire( 'execute' );
					expect( dropdownView.isOpen ).to.be.false;
				} );
			} );

			describe( 'focusDropdownContentsOnArrows()', () => {
				let panelChildView;

				beforeEach( () => {
					panelChildView = new View();
					panelChildView.setTemplate( { tag: 'div' } );
					panelChildView.focus = () => {};
					panelChildView.focusLast = () => {};

					dropdownView.panelView.children.add( panelChildView );

					dropdownView.render();
					document.body.appendChild( dropdownView.element );
				} );

				afterEach( () => {
					dropdownView.element.remove();
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

			dropdownView = createDropdown( locale );
			dropdownView.set( 'isVertical', true );

			addToolbarToDropdown( dropdownView, buttons );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );
		} );

		afterEach( () => {
			dropdownView.element.remove();
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

			it( 'delegates view.toolbarView.items#execute to the view', done => {
				dropdownView.on( 'execute', evt => {
					expect( evt.source ).to.equal( dropdownView.toolbarView.items.get( 0 ) );
					expect( evt.path ).to.deep.equal( [ dropdownView.toolbarView.items.get( 0 ), dropdownView ] );

					done();
				} );

				dropdownView.toolbarView.items.get( 0 ).fire( 'execute' );
			} );

			it( 'reacts on model#isVertical', () => {
				dropdownView.isVertical = false;
				expect( dropdownView.toolbarView.isVertical ).to.be.false;

				dropdownView.isVertical = true;
				expect( dropdownView.toolbarView.isVertical ).to.be.true;
			} );
		} );
	} );

	describe( 'addListToDropdown()', () => {
		let items;

		beforeEach( () => {
			items = new Collection();

			dropdownView = createDropdown( locale );
			dropdownView.set( {
				isEnabled: true,
				isOn: false,
				label: 'foo'
			} );

			addListToDropdown( dropdownView, items );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );
		} );

		afterEach( () => {
			dropdownView.element.remove();
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
} );
