/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { assertBinding } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { FocusTracker, global, keyCodes, Locale } from '@ckeditor/ckeditor5-utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import Model from '../../src/model.js';

import ButtonView from '../../src/button/buttonview.js';
import SwitchButtonView from '../../src/button/switchbuttonview.js';
import DropdownView from '../../src/dropdown/dropdownview.js';
import DropdownPanelView from '../../src/dropdown/dropdownpanelview.js';
import SplitButtonView from '../../src/dropdown/button/splitbuttonview.js';
import View from '../../src/view.js';
import ToolbarView from '../../src/toolbar/toolbarview.js';
import {
	createDropdown,
	addToolbarToDropdown,
	addListToDropdown,
	focusChildOnDropdownOpen,
	addMenuToDropdown
} from '../../src/dropdown/utils.js';
import ListItemView from '../../src/list/listitemview.js';
import ListSeparatorView from '../../src/list/listseparatorview.js';
import ListView from '../../src/list/listview.js';
import ViewCollection from '../../src/viewcollection.js';
import { BodyCollection, DropdownMenuRootListView, ListItemGroupView } from '../../src/index.js';

describe( 'utils', () => {
	let locale, dropdownView;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();
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

		it( 'creates dropdown#buttonView out of passed ButtonView instance', () => {
			const buttonView = new SplitButtonView( locale );

			dropdownView = createDropdown( locale, buttonView );

			expect( dropdownView.buttonView ).to.be.instanceOf( SplitButtonView );
			expect( dropdownView.buttonView ).to.equal( buttonView );
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
			describe( 'closeDropdownOnClickOutside()', () => {
				beforeEach( () => {
					dropdownView.render();
					document.body.appendChild( dropdownView.element );
				} );

				afterEach( () => {
					if ( dropdownView.element ) {
						dropdownView.element.remove();
					}
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

				it( 'listens to view#isOpen and reacts to DOM events (focus tracker elements)', () => {
					// Open the dropdown.
					dropdownView.isOpen = true;

					// Event from view.element should be discarded.
					dropdownView.element.dispatchEvent( new Event( 'mousedown', {
						bubbles: true
					} ) );

					// Dropdown is still open.
					expect( dropdownView.isOpen ).to.be.true;

					const documentElement = document.createElement( 'div' );
					document.body.appendChild( documentElement );

					// Add the new document element to dropdown focus tracker.
					dropdownView.focusTracker.add( documentElement );

					// Fire event from outside of the dropdown.
					documentElement.dispatchEvent( new Event( 'mousedown', {
						bubbles: true
					} ) );

					// Dropdown is still open.
					expect( dropdownView.isOpen ).to.be.true;

					documentElement.remove();
				} );

				it( 'considers DOM elements in different DOM sub-trees but connected via focus trackers', () => {
					// <body>
					//   <DropdownView#element />
					//   <child-view />
					//   <secondary-child-view />
					// </body>
					const childView = new View();
					const secondaryChildView = new View();

					childView.setTemplate( { tag: 'child-view' } );
					secondaryChildView.setTemplate( { tag: 'secondary-child-view' } );

					childView.focusTracker = new FocusTracker();

					childView.render();
					secondaryChildView.render();
					document.body.appendChild( childView.element );
					document.body.appendChild( secondaryChildView.element );

					// DropdownView#focusTracker -> child-view#focusTracker -> secondary-child-view#focusTracker
					dropdownView.focusTracker.add( childView );
					childView.focusTracker.add( secondaryChildView );

					dropdownView.isOpen = true;

					secondaryChildView.element.dispatchEvent( new Event( 'mousedown', {
						bubbles: true
					} ) );

					// External view's element is logically connected to the dropdown view's element via focus tracker.
					expect( dropdownView.isOpen ).to.be.true;

					childView.element.remove();
					secondaryChildView.element.remove();
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

			describe( 'closeDropdownOnBlur()', () => {
				let externalFocusableElement, focusableDropdownChild;

				beforeEach( () => {
					externalFocusableElement = document.createElement( 'button' );
					focusableDropdownChild = document.createElement( 'button' );

					dropdownView.render();
					dropdownView.panelView.element.appendChild( focusableDropdownChild );

					document.body.appendChild( dropdownView.element );
					document.body.appendChild( externalFocusableElement );
				} );

				afterEach( () => {
					dropdownView.element.remove();
					externalFocusableElement.remove();
				} );

				it( 'should close the dropdown when the focus was in the #panelView but it went somewhere else', async () => {
					dropdownView.isOpen = true;
					focusableDropdownChild.dispatchEvent( new Event( 'focus' ) );

					expect( dropdownView.focusTracker.isFocused, 'isFocused' ).to.be.true;
					expect( dropdownView.isOpen, 'isOpen' ).to.be.true;

					focusableDropdownChild.dispatchEvent( new Event( 'blur' ) );
					externalFocusableElement.dispatchEvent( new Event( 'focus' ) );

					// FocusTracker reacts to blur with a timeout.
					await wait( 10 );

					expect( dropdownView.focusTracker.isFocused, 'isFocused' ).to.be.false;
					expect( dropdownView.isOpen, 'isOpen' ).to.be.false;
				} );

				// This should not happen in real life because opening a dropdown always focuses its child (not the #buttonView) but
				// better safe than sorry.
				it( 'should close the dropdown when the focus was on the #buttonView and went somewhere else', async () => {
					dropdownView.isOpen = true;
					dropdownView.buttonView.element.dispatchEvent( new Event( 'focus' ) );

					expect( dropdownView.focusTracker.isFocused ).to.be.true;
					expect( dropdownView.isOpen ).to.be.true;

					dropdownView.buttonView.element.dispatchEvent( new Event( 'blur' ) );
					externalFocusableElement.dispatchEvent( new Event( 'focus' ) );

					// FocusTracker reacts to blur with a timeout.
					await wait( 10 );

					expect( dropdownView.focusTracker.isFocused ).to.be.false;
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
					sinon.assert.calledOnce( spy );
				} );

				it( '"arrowdown" focuses the #innerPanelView if dropdown was already open', () => {
					const keyEvtData = {
						keyCode: keyCodes.arrowdown,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					dropdownView.isOpen = true;

					const spy = sinon.spy( panelChildView, 'focus' );

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

			describe( 'focusDropdownButtonOnClose()', () => {
				beforeEach( () => {
					dropdownView.render();
					document.body.appendChild( dropdownView.element );
				} );

				afterEach( () => {
					dropdownView.element.remove();
				} );

				it( 'should focus a #buttonView if focus is inside the dropdown while closing', () => {
					const spy = sinon.spy( dropdownView.buttonView, 'focus' );
					// Create a button inside the dropdown panel to enable focus.
					const button = new ButtonView( locale );

					dropdownView.panelView.children.add( button );
					dropdownView.isOpen = true;

					expect( global.document.activeElement ).to.equal( button.element );

					dropdownView.isOpen = false;

					expect( global.document.activeElement ).to.equal( dropdownView.buttonView.element );
					sinon.assert.calledOnce( spy );
				} );

				it( 'should not focus dropdown button if focus is outside the dropdown while closing', () => {
					const spy = sinon.spy( dropdownView.buttonView, 'focus' );
					// Setup an element that is not a child of the dropdown to be focused.
					const externalButton = global.document.createElement( 'button' );

					global.document.body.appendChild( externalButton );

					// Create a button inside the dropdown panel.
					const buttonInsideDropdown = new ButtonView( locale );

					dropdownView.panelView.children.add( buttonInsideDropdown );
					dropdownView.isOpen = true;

					expect( global.document.activeElement ).to.equal( buttonInsideDropdown.element );

					externalButton.focus();

					dropdownView.isOpen = false;

					expect( global.document.activeElement ).to.equal( externalButton );
					sinon.assert.notCalled( spy );

					// Cleanup.
					externalButton.remove();
				} );
			} );

			describe( 'focusDropdownPanelOnOpen()', () => {
				beforeEach( () => {
					dropdownView.render();
					document.body.appendChild( dropdownView.element );
				} );

				afterEach( () => {
					dropdownView.element.remove();
				} );

				it( 'should focus the panel when the dropdown gets open', () => {
					const spy = sinon.spy( dropdownView.panelView, 'focus' );

					dropdownView.isOpen = true;

					expect( spy.callCount ).to.equal( 1 );
				} );

				it( 'should not engage when the dropdown gets closed', () => {
					dropdownView.isOpen = true;

					const spy = sinon.spy( dropdownView.panelView, 'focus' );

					dropdownView.isOpen = false;

					expect( spy.callCount ).to.equal( 0 );
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
			dropdownView.isOpen = true;

			expect( dropdownView.toolbarView.element.getAttribute( 'aria-label' ) ).to.equal( 'Dropdown toolbar' );
		} );

		it( 'sets custom aria-label', () => {
			const dropdownView = createDropdown( locale );

			addToolbarToDropdown( dropdownView, buttons, { ariaLabel: 'foobar' } );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );

			dropdownView.isOpen = true;

			expect( dropdownView.toolbarView.element.getAttribute( 'aria-label' ) ).to.equal( 'foobar' );

			dropdownView.element.remove();
		} );

		it( 'uses horizontal toolbar by default', () => {
			const dropdownView = createDropdown( locale );

			addToolbarToDropdown( dropdownView, buttons );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );

			dropdownView.isOpen = true;

			expect( dropdownView.toolbarView.isVertical ).to.be.false;

			dropdownView.element.remove();
		} );

		it( 'creates vertical toolbar', () => {
			const dropdownView = createDropdown( locale );

			addToolbarToDropdown( dropdownView, buttons, { isVertical: true } );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );

			dropdownView.isOpen = true;

			expect( dropdownView.toolbarView.isVertical ).to.be.true;

			dropdownView.element.remove();
		} );

		it( 'creates toolbar with maxWidth set', () => {
			const dropdownView = createDropdown( locale );

			addToolbarToDropdown( dropdownView, buttons, { maxWidth: '432px' } );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );

			dropdownView.isOpen = true;

			expect( dropdownView.toolbarView.maxWidth ).to.equal( '432px' );

			dropdownView.element.remove();
		} );

		it( 'creates toolbar with custom class set', () => {
			const dropdownView = createDropdown( locale );

			addToolbarToDropdown( dropdownView, buttons, { class: 'foo' } );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );

			dropdownView.isOpen = true;

			expect( dropdownView.toolbarView.class ).to.equal( 'foo' );

			dropdownView.element.remove();
		} );

		it( 'creates toolbar with isCompact set', () => {
			const dropdownView = createDropdown( locale );

			addToolbarToDropdown( dropdownView, buttons, { isCompact: true } );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );

			dropdownView.isOpen = true;

			expect( dropdownView.toolbarView.isCompact ).to.equal( true );

			dropdownView.element.remove();
		} );

		describe( 'view#toolbarView', () => {
			it( 'is created', () => {
				dropdownView.isOpen = true;

				const panelChildren = dropdownView.panelView.children;

				expect( panelChildren ).to.have.length( 1 );
				expect( panelChildren.first ).to.equal( dropdownView.toolbarView );
				expect( dropdownView.toolbarView ).to.be.instanceof( ToolbarView );
			} );

			it( 'is created on first open', () => {
				expect( dropdownView.toolbarView ).to.be.undefined;

				dropdownView.isOpen = true;

				const panelChildren = dropdownView.panelView.children;

				expect( panelChildren ).to.have.length( 1 );
				expect( panelChildren.first ).to.equal( dropdownView.toolbarView );
				expect( dropdownView.toolbarView ).to.be.instanceof( ToolbarView );
			} );

			it( 'should be created before chained observables are updated', () => {
				const dropdownView = createDropdown( locale );
				const observable = new View();

				expect( dropdownView.toolbarView ).to.be.undefined;

				observable.bind( 'isDropdownOpen' ).to( dropdownView, 'isOpen' );

				addToolbarToDropdown( dropdownView, buttons );

				dropdownView.listenTo( observable, 'change:isDropdownOpen', ( evt, name, isDropdownOpen ) => {
					if ( isDropdownOpen ) {
						expect( dropdownView.toolbarView ).to.be.not.undefined;
						expect( dropdownView.toolbarView.items.length ).to.equal( 2 );
					}
				} );

				dropdownView.isOpen = true;
			} );

			it( 'is created immediately on already open dropdown', () => {
				const dropdownView = createDropdown( locale );

				dropdownView.isOpen = true;
				addToolbarToDropdown( dropdownView, buttons );

				dropdownView.render();
				document.body.appendChild( dropdownView.element );

				const panelChildren = dropdownView.panelView.children;

				expect( panelChildren ).to.have.length( 1 );
				expect( panelChildren.first ).to.equal( dropdownView.toolbarView );
				expect( dropdownView.toolbarView ).to.be.instanceof( ToolbarView );

				dropdownView.element.remove();
			} );

			it( 'delegates view.toolbarView.items#execute to the view', done => {
				dropdownView.isOpen = true;

				dropdownView.on( 'execute', evt => {
					expect( evt.source ).to.equal( dropdownView.toolbarView.items.first );
					expect( evt.path ).to.deep.equal( [ dropdownView.toolbarView.items.first, dropdownView ] );

					done();
				} );

				dropdownView.toolbarView.items.first.fire( 'execute' );
			} );

			it( 'binds buttons ViewCollection to toolbar items', () => {
				const dropdownView = createDropdown( locale );
				const buttonsCollection = new ViewCollection( buttons );

				addToolbarToDropdown( dropdownView, buttonsCollection, { bindToCollection: true } );

				dropdownView.render();
				document.body.appendChild( dropdownView.element );

				dropdownView.isOpen = true;

				expect( dropdownView.toolbarView.items.length ).to.equal( 2 );

				buttonsCollection.remove( 0 );

				expect( dropdownView.toolbarView.items.length ).to.equal( 1 );

				buttonsCollection.add( buttons[ 0 ] );

				expect( dropdownView.toolbarView.items.length ).to.equal( 2 );

				dropdownView.element.remove();
			} );
		} );

		describe( 'focus management on dropdown open', () => {
			let buttons, dropdownView;

			beforeEach( () => {
				buttons = [ '<svg>foo</svg>', '<svg>bar</svg>' ].map( icon => {
					const button = new ButtonView();

					button.icon = icon;

					return button;
				} );

				dropdownView = createDropdown( locale );

				addToolbarToDropdown( dropdownView, () => buttons, { enableActiveItemFocusOnDropdownOpen: true } );

				dropdownView.render();
				document.body.appendChild( dropdownView.element );
			} );

			afterEach( () => {
				dropdownView.element.remove();
			} );

			// https://github.com/cksource/ckeditor5-commercial/issues/6633
			it( 'should add the ToolbarView instance of dropdown\'s focus tracker to allow for using toolbar items distributed ' +
				'across the DOM sub-trees', () => {
				// Lazy load.
				dropdownView.isOpen = true;

				expect( dropdownView.focusTracker.externalViews ).to.include( dropdownView.toolbarView );
			} );

			it( 'focuses active item upon dropdown opening', () => {
				buttons[ 0 ].isOn = true;

				// The focus logic happens when the dropdown is opened.
				dropdownView.isOpen = true;

				expect( document.activeElement ).to.equal( dropdownView.toolbarView.items.get( 0 ).element );
			} );

			it( 'focuses nth active item upon dropdown opening', () => {
				buttons[ 1 ].isOn = true;

				// The focus logic happens when the dropdown is opened.
				dropdownView.isOpen = true;

				expect( document.activeElement ).to.equal( dropdownView.toolbarView.items.get( 1 ).element );
			} );

			it( 'focuses the first item if multiple items are active', () => {
				buttons[ 0 ].isOn = true;
				buttons[ 1 ].isOn = true;

				// The focus logic happens when the dropdown is opened.
				dropdownView.isOpen = true;

				expect( document.activeElement ).to.equal( dropdownView.toolbarView.items.get( 0 ).element );
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

			dropdownView.isOpen = true;
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

			it( 'is created on first open', () => {
				const dropdownView = createDropdown( locale );

				dropdownView.buttonView.set( {
					isEnabled: true,
					isOn: false,
					label: 'foo'
				} );

				addListToDropdown( dropdownView, definitions );

				expect( dropdownView.listView ).to.be.undefined;

				dropdownView.render();
				document.body.appendChild( dropdownView.element );

				dropdownView.isOpen = true;

				const panelChildren = dropdownView.panelView.children;

				expect( panelChildren ).to.have.length( 1 );
				expect( panelChildren.first ).to.equal( dropdownView.listView );
				expect( dropdownView.listView ).to.be.instanceof( ListView );

				dropdownView.element.remove();
			} );

			it( 'should be created before chained observables are updated', () => {
				const dropdownView = createDropdown( locale );
				const observable = new View();

				observable.bind( 'isDropdownOpen' ).to( dropdownView, 'isOpen' );

				definitions.add( {
					type: 'button',
					model: new Model( { label: 'a' } )
				} );

				definitions.add( {
					type: 'button',
					model: new Model( { label: 'b' } )
				} );

				addListToDropdown( dropdownView, definitions );

				dropdownView.listenTo( observable, 'change:isDropdownOpen', ( evt, name, isDropdownOpen ) => {
					if ( isDropdownOpen ) {
						expect( dropdownView.listView ).to.be.not.undefined;
						expect( dropdownView.listView.items.length ).to.equal( 2 );
					}
				} );

				dropdownView.isOpen = true;
			} );

			it( 'is created immediately on already open dropdown', () => {
				const dropdownView = createDropdown( locale );

				dropdownView.buttonView.set( {
					isEnabled: true,
					isOn: false,
					label: 'foo'
				} );

				dropdownView.isOpen = true;

				addListToDropdown( dropdownView, definitions );

				listItems = dropdownView.listView.items;
				dropdownView.render();
				document.body.appendChild( dropdownView.element );

				const panelChildren = dropdownView.panelView.children;

				expect( panelChildren ).to.have.length( 1 );
				expect( panelChildren.first ).to.equal( dropdownView.listView );
				expect( dropdownView.listView ).to.be.instanceof( ListView );

				dropdownView.element.remove();
			} );

			it( 'uses items callback on first open to generate items', () => {
				const dropdownView = createDropdown( locale );

				dropdownView.buttonView.set( {
					isEnabled: true,
					isOn: false,
					label: 'foo'
				} );

				const itemsCallback = sinon.stub().callsFake( () => definitions );

				addListToDropdown( dropdownView, itemsCallback );

				expect( dropdownView.listView ).to.be.undefined;
				sinon.assert.notCalled( itemsCallback );

				dropdownView.render();
				document.body.appendChild( dropdownView.element );

				dropdownView.isOpen = true;

				sinon.assert.calledOnce( itemsCallback );

				const panelChildren = dropdownView.panelView.children;

				expect( panelChildren ).to.have.length( 1 );
				expect( panelChildren.first ).to.equal( dropdownView.listView );
				expect( dropdownView.listView ).to.be.instanceof( ListView );

				dropdownView.element.remove();
			} );

			it( 'ignores unknown definition types', () => {
				definitions.add( { type: 'foo' } );

				expect( listItems.length ).to.equal( 0 );
			} );

			it( 'should set optional attributes for listview if provided', () => {
				const dropdownView = createDropdown( locale );

				addListToDropdown( dropdownView, definitions, { ariaLabel: 'foo', role: 'bar' } );

				dropdownView.isOpen = true;

				expect( dropdownView.listView.element.ariaLabel ).to.equal( 'foo' );
				expect( dropdownView.listView.element.role ).to.equal( 'bar' );
			} );

			describe( 'with ListItemButtonView', () => {
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

				it( 'should set `isToggleable=true` only if role `menuitemcheckbox` or `menuitemradio` is set', () => {
					definitions.addMany( [
						{
							type: 'button',
							model: new Model( { label: 'a', role: 'menuitemcheckbox' } )
						},
						{
							type: 'button',
							model: new Model( { label: 'b', role: 'menuitemradio' } )
						},
						{
							type: 'button',
							model: new Model( { label: 'c', role: 'menuitem' } )
						}
					] );

					expect( listItems.get( 0 ).children.first.isToggleable ).to.be.true;
					expect( listItems.get( 1 ).children.first.isToggleable ).to.be.true;
					expect( listItems.get( 2 ).children.first.isToggleable ).to.be.false;
				} );

				it( 'should reserve checkbox holder space if there is at least one toggleable item', () => {
					definitions.addMany( [
						{
							type: 'button',
							model: new Model( { label: 'a', role: 'menuitemcheckbox' } )
						},
						{
							type: 'button',
							model: new Model( { label: 'b', role: 'menuitemradio' } )
						},
						{
							type: 'button',
							model: new Model( { label: 'c', role: 'menuitem' } )
						}
					] );

					for ( const item of listItems ) {
						expect( item.children.first.hasCheckSpace ).to.be.true;
					}
				} );

				it( 'should reserve checkbox holder space on non-toggleable items', () => {
					definitions.addMany( [
						{
							type: 'button',
							model: new Model( { label: 'a', role: 'menuitem' } )
						},
						{
							type: 'button',
							model: new Model( { label: 'b', role: 'menuitem' } )
						},
						{
							type: 'button',
							model: new Model( { label: 'c', role: 'menuitemradio' } )
						}
					] );

					for ( const item of listItems ) {
						expect( item.children.first.hasCheckSpace ).to.be.true;
					}
				} );

				it( 'should restore checkbox holder space if the only toggleable was removed', () => {
					definitions.addMany( [
						{
							type: 'button',
							model: new Model( { label: 'a', role: 'menuitem' } )
						},
						{
							type: 'button',
							model: new Model( { label: 'b', role: 'menuitem' } )
						},
						{
							type: 'button',
							model: new Model( { label: 'c', role: 'menuitemradio' } )
						}
					] );

					for ( const item of listItems ) {
						expect( item.children.first.hasCheckSpace ).to.be.true;
					}

					definitions.remove( 2 );

					for ( const item of listItems ) {
						expect( item.children.first.hasCheckSpace ).to.be.false;
					}
				} );

				it( 'should not reserve checkbox holder space if there is at least one toggleable item', () => {
					definitions.addMany( [
						{
							type: 'button',
							model: new Model( { label: 'a', role: 'menuitem' } )
						},
						{
							type: 'button',
							model: new Model( { label: 'b', role: 'menuitem' } )
						}
					] );

					for ( const item of listItems ) {
						expect( item.children.first.hasCheckSpace ).to.be.false;
					}
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

					button.isToggleable = true;
					button.isOn = true;

					expect( button.element.getAttribute( 'aria-pressed' ) ).to.be.equal( 'true' );

					button.isOn = false;
					expect( button.element.getAttribute( 'aria-pressed' ) ).to.be.equal( 'false' );

					button.isOn = true;
					button.role = 'checkbox';
					expect( button.element.getAttribute( 'aria-checked' ) ).to.be.equal( 'true' );
					expect( button.element.getAttribute( 'aria-pressed' ) ).to.be.null;

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

			describe( 'with ListGroupView', () => {
				let definitionsWithGroups;

				beforeEach( () => {
					definitionsWithGroups = [
						{
							type: 'button',
							model: new Model( { label: 'a', labelStyle: 'x' } )
						},
						{
							type: 'group',
							label: 'b',
							items: new Collection( [
								{
									type: 'button',
									model: new Model( { label: 'b.a', labelStyle: 'y' } )
								},
								{
									type: 'button',
									model: new Model( { label: 'b.b', labelStyle: 'z' } )
								}
							] )
						}
					];
				} );

				it( 'is populated using item definitions', () => {
					definitions.addMany( definitionsWithGroups );

					expect( listItems ).to.have.length( 2 );
					expect( listItems.first ).to.be.instanceOf( ListItemView );
					expect( listItems.first.children.first ).to.be.instanceOf( ButtonView );
					expect( listItems.first.children.first.labelView.text ).to.equal( 'a' );

					expect( listItems.last ).to.be.instanceOf( ListItemGroupView );

					expect( listItems.last.items.first ).to.be.instanceOf( ListItemView );
					expect( listItems.last.items.first.children.first ).to.be.instanceOf( ButtonView );
					expect( listItems.last.items.first.children.first.labelView.text ).to.equal( 'b.a' );
					expect( listItems.last.items.first.children.first.labelView.style ).to.equal( 'y' );

					expect( listItems.last.items.last ).to.be.instanceOf( ListItemView );
					expect( listItems.last.items.last.children.first ).to.be.instanceOf( ButtonView );
					expect( listItems.last.items.last.children.first.labelView.text ).to.equal( 'b.b' );
					expect( listItems.last.items.last.children.first.labelView.style ).to.equal( 'z' );
				} );

				it( 'delegates #execute event from the ListGroupView children to the DropdownView', done => {
					definitions.addMany( definitionsWithGroups );

					dropdownView.on( 'execute', evt => {
						expect( evt.source ).to.equal( listItems.last.items.first.children.first );
						expect( evt.path ).to.deep.equal( [
							listItems.last.items.first.children.first,
							listItems.last.items.first,
							dropdownView
						] );

						done();
					} );

					listItems.last.items.first.children.first.fire( 'execute' );
				} );
			} );
		} );

		describe( 'focus management on dropdown open', () => {
			let definitions, dropdownView, listItems;

			beforeEach( () => {
				definitions = new Collection();

				dropdownView = createDropdown( locale );
				dropdownView.buttonView.set( {
					isEnabled: true,
					isOn: false,
					label: 'foo'
				} );

				addListToDropdown( dropdownView, definitions );

				dropdownView.render();
				document.body.appendChild( dropdownView.element );
			} );

			afterEach( () => {
				dropdownView.element.remove();
			} );

			it( 'focuses active item upon dropdown opening', () => {
				definitions.addMany( [
					{
						type: 'button',
						model: new Model( { label: 'a', isOn: true } )
					},
					{
						type: 'button',
						model: new Model( { label: 'b' } )
					}
				] );

				// The focus logic happens when the dropdown is opened.
				dropdownView.isOpen = true;

				listItems = dropdownView.listView.items;

				expect( document.activeElement ).to.equal( getListViewDomButton( listItems.get( 0 ) ) );
			} );

			it( 'focuses nth active item upon dropdown opening', () => {
				definitions.addMany( [
					{
						type: 'button',
						model: new Model( { label: 'a' } )
					},
					{
						type: 'button',
						model: new Model( { label: 'b', isOn: true } )
					}
				] );

				// The focus logic happens when the dropdown is opened.
				dropdownView.isOpen = true;

				listItems = dropdownView.listView.items;

				expect( document.activeElement ).to.equal( getListViewDomButton( listItems.get( 1 ) ) );
			} );

			it( 'does not break for separator - still focuses nth active item upon dropdown opening', () => {
				definitions.addMany( [
					{
						type: 'button',
						model: new Model( { label: 'a' } )
					},
					{
						type: 'separator'
					},
					{
						type: 'button',
						model: new Model( { label: 'b', isOn: true } )
					}
				] );

				// The focus logic happens when the dropdown is opened.
				dropdownView.isOpen = true;

				listItems = dropdownView.listView.items;

				expect( document.activeElement ).to.equal( getListViewDomButton( listItems.get( 2 ) ) );
			} );

			it( 'focuses the first item if multiple items are active', () => {
				definitions.addMany( [
					{
						type: 'button',
						model: new Model( { label: 'a' } )
					},
					{
						type: 'button',
						model: new Model( { label: 'b', isOn: true } )
					},
					{
						type: 'button',
						model: new Model( { label: 'c', isOn: true } )
					}
				] );

				// The focus logic happens when the dropdown is opened.
				dropdownView.isOpen = true;

				listItems = dropdownView.listView.items;

				expect( document.activeElement ).to.equal( getListViewDomButton( listItems.get( 1 ) ) );
			} );

			it( 'should warn if the active view does not implement the focus() method and therefore cannot be focused', () => {
				definitions.addMany( [
					{
						type: 'button',
						model: new Model( { label: 'a' } )
					},
					{
						type: 'button',
						model: new Model( { label: 'b', isOn: true } )
					}
				] );

				// Make it render the list view.
				dropdownView.isOpen = true;
				dropdownView.isOpen = false;

				const secondChildView = dropdownView.listView.items.get( 1 );

				secondChildView.focus = undefined;

				testUtils.sinon.stub( console, 'warn' );

				// The focus logic happens when the dropdown is opened.
				dropdownView.isOpen = true;

				sinon.assert.calledOnce( console.warn );
				sinon.assert.calledWithExactly(
					console.warn,
					'ui-dropdown-focus-child-on-open-child-missing-focus',
					{ view: secondChildView },
					sinon.match.string
				);
			} );

			function getListViewDomButton( listView ) {
				return listView.children.first.element;
			}
		} );
	} );

	describe( 'addMenuToDropdown()', () => {
		let dropdownView, body, definition;

		beforeEach( () => {
			body = new BodyCollection();
			dropdownView = createDropdown( locale );
			definition = [
				{
					id: 'menu_1',
					menu: 'Menu 1',
					children: [
						{
							id: 'menu_1_1',
							label: 'Item 1'
						},
						{
							id: 'menu_1_2',
							label: 'Item 2'
						},
						{
							id: 'menu_1_3',
							menu: 'Menu 3',
							children: [
								{
									id: 'menu_1_3_1',
									label: 'Item 1'
								}
							]
						}
					]
				}
			];
		} );

		afterEach( () => {
			body.destroy();
		} );

		it( 'should set DropdownView#menuView', () => {
			addMenuToDropdown( dropdownView, body, definition );

			expect( dropdownView.menuView ).to.be.instanceof( DropdownMenuRootListView );
		} );

		it( 'should set a default aria-label for #menuView', () => {
			addMenuToDropdown( dropdownView, body, definition );

			dropdownView.isOpen = true;

			expect( dropdownView.menuView.ariaLabel ).to.equal( 'Dropdown menu' );
		} );

		it( 'should allow for configuring a custom aria-label for #menuView', () => {
			addMenuToDropdown( dropdownView, body, definition, {
				ariaLabel: 'Custom menu dropdown'
			} );

			dropdownView.isOpen = true;

			expect( dropdownView.menuView.ariaLabel ).to.equal( 'Custom menu dropdown' );
		} );

		it( 'should not do anything before the dropdown is opened for the first time', () => {
			addMenuToDropdown( dropdownView, body, definition );

			sinon.spy( dropdownView.menuView, 'render' );

			expect( dropdownView.panelView.children.length ).to.equal( 0 );
			expect( dropdownView.menuView.isRendered ).to.be.false;

			// Rendering the dropdown itself does not change anything.
			dropdownView.render();

			expect( dropdownView.panelView.children.length ).to.equal( 0 );
			expect( dropdownView.menuView.render.called ).to.be.false;
			expect( dropdownView.menuView.isRendered ).to.be.false;
		} );

		it( 'should render dropdown menu just once, after dropdown is opened first time', () => {
			addMenuToDropdown( dropdownView, body, definition );

			sinon.spy( dropdownView.menuView, 'render' );

			dropdownView.render();
			dropdownView.isOpen = true;

			expect( dropdownView.panelView.children.length ).to.equal( 1 );
			expect( dropdownView.menuView.render.calledOnce ).to.be.true;

			dropdownView.isOpen = false;
			dropdownView.isOpen = true;

			expect( dropdownView.panelView.children.length ).to.equal( 1 );
			expect( dropdownView.menuView.render.calledOnce ).to.be.true;
		} );

		// https://github.com/cksource/ckeditor5-commercial/issues/6633
		it( 'should add the menu view to dropdown\'s focus tracker to allow for linking focus trackers and keeping track of the focus ' +
			'when it goes to sub-menus in other DOM sub-trees',
		() => {
			const addSpy = sinon.spy( dropdownView.focusTracker, 'add' );

			addMenuToDropdown( dropdownView, body, definition );

			dropdownView.isOpen = true;

			sinon.assert.calledThrice( addSpy );
			sinon.assert.calledWithExactly( addSpy.firstCall, dropdownView.menuView );
			sinon.assert.calledWithExactly( addSpy.secondCall, dropdownView.menuView.menus[ 0 ] );
			sinon.assert.calledWithExactly( addSpy.thirdCall, dropdownView.menuView.menus[ 1 ] );
		} );

		it( 'should focus dropdown menu view after dropdown is opened', () => {
			addMenuToDropdown( dropdownView, body, definition );

			dropdownView.render();

			sinon.spy( dropdownView.menuView, 'focus' );

			dropdownView.isOpen = true;

			expect( dropdownView.menuView.focus.calledOnce ).to.be.true;

			dropdownView.isOpen = false;
			dropdownView.isOpen = true;

			expect( dropdownView.menuView.focus.calledTwice ).to.be.true;
		} );

		it( 'should delegate menu:execute event from menu to dropdown execute', () => {
			const spy = sinon.spy();
			dropdownView.on( 'execute', spy );

			addMenuToDropdown( dropdownView, body, definition );

			dropdownView.render();
			dropdownView.isOpen = true;

			dropdownView.menuView.fire( 'menu:execute' );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should close menus when dropdown is closed', () => {
			addMenuToDropdown( dropdownView, body, definition );

			sinon.spy( dropdownView.menuView, 'closeMenus' );

			dropdownView.render();
			dropdownView.isOpen = true;

			expect( dropdownView.menuView.closeMenus.calledOnce ).to.be.false;

			dropdownView.isOpen = false;

			expect( dropdownView.menuView.closeMenus.calledOnce ).to.be.true;
		} );

		it( 'dropdown should stay focused and open when nested menus are focused', async () => {
			// Note that nested menus are in body collection, so they are outside of dropdown DOM.
			// That's why this requirement is not obvious.
			addMenuToDropdown( dropdownView, body, definition );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );

			expect( dropdownView.focusTracker.isFocused ).to.be.false;

			dropdownView.isOpen = true;
			dropdownView.buttonView.element.dispatchEvent( new Event( 'focus' ) );

			expect( dropdownView.focusTracker.isFocused ).to.be.true;

			const menu = dropdownView.menuView.menus[ 0 ];
			const nestedMenu = dropdownView.menuView.menus[ 1 ];

			menu.isOpen = true;
			nestedMenu.isOpen = true;

			dropdownView.buttonView.element.dispatchEvent( new Event( 'blur' ) );
			nestedMenu.listView.items.get( 0 ).element.dispatchEvent( new Event( 'focus' ) );

			expect( nestedMenu.focusTracker.isFocused ).to.be.true;
			expect( dropdownView.focusTracker.isFocused ).to.be.true;
			expect( dropdownView.isOpen ).to.be.true;
			expect( menu.isOpen ).to.be.true;
			expect( nestedMenu.isOpen ).to.be.true;

			dropdownView.element.remove();
		} );

		it( 'should correctly add the menu to an open dropdown', () => {
			dropdownView.render();
			dropdownView.isOpen = true;

			addMenuToDropdown( dropdownView, body, definition );

			expect( dropdownView.panelView.children.length ).to.equal( 1 );
			expect( dropdownView.menuView.isRendered ).to.be.true;
		} );
	} );

	describe( 'focusChildOnDropdownOpen()', () => {
		it( 'should do its job after focusDropdownPanelOnOpen()', () => {
			const dropdownView = createDropdown( locale );

			const focusableElementA = document.createElement( 'button' );
			const focusableElementB = document.createElement( 'button' );

			dropdownView.render();
			document.body.appendChild( dropdownView.element );

			dropdownView.panelView.element.appendChild( focusableElementA );
			dropdownView.panelView.element.appendChild( focusableElementB );

			focusChildOnDropdownOpen( dropdownView, () => focusableElementB );

			const panelFocusSpy = sinon.spy( dropdownView.panelView, 'focus' );
			const elementBFocusSpy = sinon.spy( focusableElementB, 'focus' );

			dropdownView.isOpen = true;

			sinon.assert.callOrder( panelFocusSpy, elementBFocusSpy );

			dropdownView.element.remove();
		} );
	} );
} );

function wait( time ) {
	return new Promise( res => {
		global.window.setTimeout( res, time );
	} );
}
