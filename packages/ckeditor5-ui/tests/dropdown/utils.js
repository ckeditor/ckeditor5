/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document Event */

import utilsTestUtils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import Model from '../../src/model';

import ButtonView from '../../src/button/buttonview';
import DropdownView from '../../src/dropdown/dropdownview';
import DropdownPanelView from '../../src/dropdown/dropdownpanelview';
import SplitButtonView from '../../src/button/splitbuttonview';
import View from '../../src/view';
import ToolbarView from '../../src/toolbar/toolbarview';
import { createDropdown, createSplitButtonDropdown, addToolbarToDropdown } from '../../src/dropdown/utils';

const assertBinding = utilsTestUtils.assertBinding;

describe( 'utils', () => {
	let locale, dropdownView;

	beforeEach( () => {
		locale = { t() {} };
	} );

	describe( 'createDropdown()', () => {
		let model;

		beforeEach( () => {
			model = new Model();
			dropdownView = createDropdown( model, locale );
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

		it( 'binds button attributes to the model', () => {
			const modelDef = {
				label: 'foo',
				isOn: false,
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			model = new Model( modelDef );
			dropdownView = createDropdown( model, locale );

			assertBinding( dropdownView.buttonView,
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
			dropdownView = createDropdown( model, locale );

			dropdownView.isOpen = false;
			expect( dropdownView.buttonView.isOn ).to.be.false;

			model.isOn = true;
			expect( dropdownView.buttonView.isOn ).to.be.true;

			dropdownView.isOpen = true;
			expect( dropdownView.buttonView.isOn ).to.be.true;

			model.isOn = false;
			expect( dropdownView.buttonView.isOn ).to.be.true;
		} );

		it( 'binds dropdown#isEnabled to the model', () => {
			const modelDef = {
				label: 'foo',
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			model = new Model( modelDef );
			dropdownView = createDropdown( model, locale );

			assertBinding( dropdownView,
				{ isEnabled: true },
				[
					[ model, { isEnabled: false } ]
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

			it( 'delegates "execute" to "select" event', () => {
				const spy = sinon.spy();

				dropdownView.buttonView.on( 'select', spy );

				dropdownView.buttonView.fire( 'execute' );

				sinon.assert.calledOnce( spy );
			} );
		} );

		addDefaultBehaviorTests();
	} );

	describe( 'createSplitButtonDropdown()', () => {
		let model;

		beforeEach( () => {
			model = new Model();
			dropdownView = createSplitButtonDropdown( model, locale );
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

		it( 'creates dropdown#buttonView out of SplitButtonView', () => {
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

			model = new Model( modelDef );
			dropdownView = createDropdown( model, locale );

			assertBinding( dropdownView.buttonView,
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
			dropdownView = createDropdown( model, locale );

			dropdownView.isOpen = false;
			expect( dropdownView.buttonView.isOn ).to.be.false;

			model.isOn = true;
			expect( dropdownView.buttonView.isOn ).to.be.true;

			dropdownView.isOpen = true;
			expect( dropdownView.buttonView.isOn ).to.be.true;

			model.isOn = false;
			expect( dropdownView.buttonView.isOn ).to.be.true;
		} );

		it( 'binds dropdown#isEnabled to the model', () => {
			const modelDef = {
				label: 'foo',
				isEnabled: true,
				withText: false,
				tooltip: false
			};

			model = new Model( modelDef );
			dropdownView = createDropdown( model, locale );

			assertBinding( dropdownView,
				{ isEnabled: true },
				[
					[ model, { isEnabled: false } ]
				],
				{ isEnabled: false }
			);
		} );

		describe( '#buttonView', () => {
			it( 'accepts locale', () => {
				expect( dropdownView.buttonView.locale ).to.equal( locale );
			} );

			it( 'returns SplitButtonView instance', () => {
				expect( dropdownView.buttonView ).to.be.instanceof( SplitButtonView );
			} );
		} );

		addDefaultBehaviorTests();
	} );

	describe( 'addToolbarToDropdown()', () => {
		let model, buttons;

		beforeEach( () => {
			buttons = [ '<svg>foo</svg>', '<svg>bar</svg>' ].map( icon => {
				const button = new ButtonView();

				button.icon = icon;

				return button;
			} );

			model = new Model( { isVertical: true } );

			dropdownView = createDropdown( model, locale );
			addToolbarToDropdown( dropdownView, buttons, model );

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
				model.isVertical = false;
				expect( dropdownView.toolbarView.isVertical ).to.be.false;

				model.isVertical = true;
				expect( dropdownView.toolbarView.isVertical ).to.be.true;
			} );
		} );
	} );

	function addDefaultBehaviorTests() {
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

					// TODO: describe this as #contentView instead of #listView and #toolbarView
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
	}
} );
