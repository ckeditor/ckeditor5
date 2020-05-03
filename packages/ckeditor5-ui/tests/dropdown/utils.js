/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document Event */

import { assertBinding } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import Model from '../../src/model';

import ButtonView from '../../src/button/buttonview';
import SwitchButtonView from '../../src/button/switchbuttonview';
import DropdownView from '../../src/dropdown/dropdownview';
import DropdownPanelView from '../../src/dropdown/dropdownpanelview';
import SplitButtonView from '../../src/dropdown/button/splitbuttonview';
import View from '../../src/view';
import ToolbarView from '../../src/toolbar/toolbarview';
import { createDropdown, addToolbarToDropdown, addListToDropdown } from '../../src/dropdown/utils';
import ListItemView from '../../src/list/listitemview';
import ListSeparatorView from '../../src/list/listseparatorview';
import ListView from '../../src/list/listview';

describe( 'utils', () => {
	let locale, dropdownView;

	beforeEach( () => {
		locale = { t: langString => langString };
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

		it( 'binds #isEnabled to the buttonView', () => {
			dropdownView = createDropdown( locale );

			assertBinding( dropdownView.buttonView,
				{ isEnabled: true },
				[
					[ dropdownView, { isEnabled: false } ]
				],
				{ isEnabled: false }
			);
		} );

		it( 'binds button#isOn to dropdown #isOpen', () => {
			dropdownView = createDropdown( locale );
			dropdownView.buttonView.isEnabled = true;

			dropdownView.isOpen = false;
			expect( dropdownView.buttonView.isOn ).to.be.false;

			dropdownView.isOpen = true;
			expect( dropdownView.buttonView.isOn ).to.be.true;
		} );

		describe( '#buttonView', () => {
			it( 'accepts locale', () => {
				expect( dropdownView.buttonView.locale ).to.equal( locale );
			} );

			it( 'is a ButtonView instance', () => {
				expect( dropdownView.buttonView ).to.be.instanceof( ButtonView );
			} );
		} );

		describe( 'has default behavior', () => {
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

				it( 'does not change #isOpen if #execute triggered by a SwitchButtonView', () => {
					const items = new Collection();

					items.add( {
						type: 'switchbutton',
						model: new Model( {
							label: 'foo'
						} )
					} );

					addListToDropdown( dropdownView, items );

					dropdownView.isOpen = true;

					dropdownView.listView.items.first.children.first.fire( 'execute' );
					expect( dropdownView.isOpen ).to.be.true;
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

		it( 'sets aria-label', () => {
			expect( dropdownView.toolbarView.element.getAttribute( 'aria-label' ) ).to.equal( 'Dropdown toolbar' );
		} );

		describe( 'view#toolbarView', () => {
			it( 'is created', () => {
				const panelChildren = dropdownView.panelView.children;

				expect( panelChildren ).to.have.length( 1 );
				expect( panelChildren.first ).to.equal( dropdownView.toolbarView );
				expect( dropdownView.toolbarView ).to.be.instanceof( ToolbarView );
			} );

			it( 'delegates view.toolbarView.items#execute to the view', done => {
				dropdownView.on( 'execute', evt => {
					expect( evt.source ).to.equal( dropdownView.toolbarView.items.first );
					expect( evt.path ).to.deep.equal( [ dropdownView.toolbarView.items.first, dropdownView ] );

					done();
				} );

				dropdownView.toolbarView.items.first.fire( 'execute' );
			} );
		} );
	} );

	describe( 'addListToDropdown()', () => {
		let definitions, listItems;

		beforeEach( () => {
			definitions = new Collection();

			dropdownView = createDropdown( locale );
			dropdownView.buttonView.set( {
				isEnabled: true,
				isOn: false,
				label: 'foo'
			} );

			addListToDropdown( dropdownView, definitions );

			listItems = dropdownView.listView.items;
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
				expect( panelChildren.first ).to.equal( dropdownView.listView );
				expect( dropdownView.listView ).to.be.instanceof( ListView );
			} );

			it( 'ignores unknown definition types', () => {
				definitions.add( { type: 'foo' } );

				expect( listItems.length ).to.equal( 0 );
			} );

			describe( 'with ButtonView', () => {
				it( 'is populated using item definitions', () => {
					definitions.add( {
						type: 'button',
						model: new Model( { label: 'a', labelStyle: 'b' } )
					} );

					definitions.add( {
						type: 'button',
						model: new Model( { label: 'c', labelStyle: 'd' } )
					} );

					expect( listItems ).to.have.length( 2 );
					expect( listItems.first ).to.be.instanceOf( ListItemView );
					expect( listItems.first.children.first ).to.be.instanceOf( ButtonView );

					expect( listItems.get( 1 ).children.first.label ).to.equal( 'c' );
					expect( listItems.get( 1 ).children.first.labelStyle ).to.equal( 'd' );

					definitions.remove( 1 );
					expect( listItems ).to.have.length( 1 );
					expect( listItems.first.children.first.label ).to.equal( 'a' );
					expect( listItems.first.children.first.labelStyle ).to.equal( 'b' );
				} );

				it( 'binds all button properties', () => {
					const def = {
						type: 'button',
						model: new Model( { label: 'a', labelStyle: 'b', foo: 'bar', baz: 'qux' } )
					};

					definitions.add( def );

					const button = listItems.first.children.first;

					expect( button.foo ).to.equal( 'bar' );
					expect( button.baz ).to.equal( 'qux' );

					def.model.baz = 'foo?';
					expect( button.baz ).to.equal( 'foo?' );
				} );

				it( 'delegates ButtonView#execute to the ListItemView', done => {
					definitions.add( {
						type: 'button',
						model: new Model( { label: 'a', labelStyle: 'b' } )
					} );

					const listItem = listItems.first;
					const button = listItem.children.first;

					dropdownView.on( 'execute', evt => {
						expect( evt.source ).to.equal( button );
						expect( evt.path ).to.deep.equal( [ button, listItem, dropdownView ] );

						done();
					} );

					button.fire( 'execute' );
				} );
			} );

			describe( 'with SwitchButtonView', () => {
				it( 'is populated using item definitions', () => {
					definitions.add( {
						type: 'switchbutton',
						model: new Model( { label: 'a', labelStyle: 'b' } )
					} );

					expect( listItems ).to.have.length( 1 );
					expect( listItems.first ).to.be.instanceOf( ListItemView );
					expect( listItems.first.children.first ).to.be.instanceOf( SwitchButtonView );

					expect( listItems ).to.have.length( 1 );
					expect( listItems.first.children.first.label ).to.equal( 'a' );
					expect( listItems.first.children.first.labelStyle ).to.equal( 'b' );
				} );

				it( 'binds all button properties', () => {
					const def = {
						type: 'switchbutton',
						model: new Model( { label: 'a', labelStyle: 'b', foo: 'bar', baz: 'qux' } )
					};

					definitions.add( def );

					const button = listItems.first.children.first;

					expect( button.foo ).to.equal( 'bar' );
					expect( button.baz ).to.equal( 'qux' );

					def.model.baz = 'foo?';
					expect( button.baz ).to.equal( 'foo?' );
				} );

				it( 'delegates SwitchButtonView#execute to the ListItemView', done => {
					definitions.add( {
						type: 'switchbutton',
						model: new Model( { label: 'a', labelStyle: 'b' } )
					} );

					const listItem = listItems.first;
					const button = listItem.children.first;

					dropdownView.on( 'execute', evt => {
						expect( evt.source ).to.equal( button );
						expect( evt.path ).to.deep.equal( [ button, listItem, dropdownView ] );

						done();
					} );

					button.fire( 'execute' );
				} );
			} );

			describe( 'with ListSeparatorView', () => {
				it( 'creates a separator from the definition', () => {
					definitions.add( { type: 'separator' } );

					expect( listItems.first ).to.be.instanceOf( ListSeparatorView );
				} );
			} );
		} );
	} );
} );
