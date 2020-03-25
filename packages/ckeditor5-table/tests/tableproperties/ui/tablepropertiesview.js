/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Event */

import TablePropertiesView from '../../../src/tableproperties/ui/tablepropertiesview';
import LabeledFieldView from '@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import ColorInputView from '../../../src/ui/colorinputview';

const VIEW_OPTIONS = {
	borderColors: [
		{
			model: 'rgb(255,0,0)',
			label: 'Red',
			hasBorder: false
		},
		{
			model: 'rgb(0,0,255)',
			label: 'Blue',
			hasBorder: false
		}
	],
	backgroundColors: [
		{
			model: 'rgb(0,255,0)',
			label: 'Green',
			hasBorder: false
		}
	]
};

describe( 'table properties', () => {
	describe( 'TablePropertiesView', () => {
		let view, locale;

		testUtils.createSinonSandbox();

		beforeEach( () => {
			locale = { t: val => val };
			view = new TablePropertiesView( locale, VIEW_OPTIONS );
			view.render();
		} );

		afterEach( () => {
			view.destroy();
		} );

		describe( 'constructor()', () => {
			it( 'should set view#options', () => {
				expect( view.options ).to.deep.equal( VIEW_OPTIONS );
			} );

			it( 'should set view#locale', () => {
				expect( view.locale ).to.equal( locale );
			} );

			it( 'should create view#children collection', () => {
				expect( view.children ).to.be.instanceOf( ViewCollection );
			} );

			it( 'should define the public data interface (observable properties)', () => {
				expect( view ).to.include( {
					borderStyle: '',
					borderWidth: '',
					borderColor: '',
					backgroundColor: '',
					width: '',
					height: '',
					alignment: ''
				} );
			} );

			it( 'should create element from template', () => {
				expect( view.element.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-form' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-table-form' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-table-properties-form' ) ).to.be.true;
				expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
			} );

			it( 'should create child views (and references)', () => {
				expect( view.borderStyleDropdown ).to.be.instanceOf( LabeledFieldView );
				expect( view.borderWidthInput ).to.be.instanceOf( LabeledFieldView );
				expect( view.borderColorInput ).to.be.instanceOf( LabeledFieldView );
				expect( view.backgroundInput ).to.be.instanceOf( LabeledFieldView );
				expect( view.widthInput ).to.be.instanceOf( LabeledFieldView );
				expect( view.heightInput ).to.be.instanceOf( LabeledFieldView );
				expect( view.alignmentToolbar ).to.be.instanceOf( ToolbarView );

				expect( view.saveButtonView ).to.be.instanceOf( ButtonView );
				expect( view.cancelButtonView ).to.be.instanceOf( ButtonView );
			} );

			it( 'should have a header', () => {
				const header = view.element.firstChild;

				expect( header.classList.contains( 'ck' ) ).to.be.true;
				expect( header.classList.contains( 'ck-form__header' ) ).to.be.true;
				expect( header.textContent ).to.equal( 'Table properties' );
			} );

			describe( 'form rows', () => {
				describe( 'border row', () => {
					it( 'should be defined', () => {
						const row = view.element.childNodes[ 1 ];

						expect( row.classList.contains( 'ck-form__row' ) ).to.be.true;
						expect( row.classList.contains( 'ck-table-form__border-row' ) ).to.be.true;
						expect( row.childNodes[ 0 ].textContent ).to.equal( 'Border' );
						expect( row.childNodes[ 1 ] ).to.equal( view.borderStyleDropdown.element );
						expect( row.childNodes[ 2 ] ).to.equal( view.borderColorInput.element );
						expect( row.childNodes[ 3 ] ).to.equal( view.borderWidthInput.element );
					} );

					describe( 'border style labeled dropdown', () => {
						let labeledDropdown;

						beforeEach( () => {
							labeledDropdown = view.borderStyleDropdown;
						} );

						it( 'should have properties set', () => {
							expect(	labeledDropdown.label ).to.equal( 'Style' );
							expect(	labeledDropdown.class ).to.equal( 'ck-table-form__border-style' );
						} );

						it( 'should have a button with properties set', () => {
							expect(	labeledDropdown.fieldView.buttonView.isOn ).to.be.false;
							expect(	labeledDropdown.fieldView.buttonView.withText ).to.be.true;
							expect(	labeledDropdown.fieldView.buttonView.tooltip ).to.equal( 'Style' );
						} );

						it( 'should bind button\'s label to #borderStyle property', () => {
							view.borderStyle = 'dotted';
							expect( labeledDropdown.fieldView.buttonView.label ).to.equal( 'Dotted' );

							view.borderStyle = 'dashed';
							expect( labeledDropdown.fieldView.buttonView.label ).to.equal( 'Dashed' );
						} );

						it( 'should change #borderStyle when executed', () => {
							labeledDropdown.fieldView.listView.items.first.children.first.fire( 'execute' );
							expect( view.borderStyle ).to.equal( '' );

							labeledDropdown.fieldView.listView.items.last.children.first.fire( 'execute' );
							expect( view.borderStyle ).to.equal( 'outset' );
						} );

						it( 'should come with a set of pre–defined border styles', () => {
							expect( labeledDropdown.fieldView.listView.items.map( item => {
								return item.children.first.label;
							} ) ).to.have.ordered.members( [
								'None', 'Solid', 'Dotted', 'Dashed', 'Double', 'Groove', 'Ridge', 'Inset', 'Outset'
							] );
						} );

						it( 'should reset border width and color inputs when setting style to none', () => {
							view.borderStyle = 'dotted';
							view.borderWidth = '1px';
							view.borderColor = 'red';

							view.borderStyle = '';

							expect( view.borderColor ).to.equal( '' );
							expect( view.borderWidth ).to.equal( '' );
						} );
					} );

					describe( 'border width input', () => {
						let labeledInput;

						beforeEach( () => {
							labeledInput = view.borderWidthInput;
						} );

						it( 'should be created', () => {
							expect( labeledInput.fieldView ).to.be.instanceOf( InputTextView );
							expect( labeledInput.label ).to.equal( 'Width' );
							expect( labeledInput.class ).to.equal( 'ck-table-form__border-width' );
						} );

						it( 'should reflect #borderWidth property', () => {
							view.borderWidth = 'foo';
							expect( labeledInput.fieldView.value ).to.equal( 'foo' );

							view.borderWidth = 'bar';
							expect( labeledInput.fieldView.value ).to.equal( 'bar' );
						} );

						it( 'should be enabled only when #borderStyle is different than "none"', () => {
							view.borderStyle = '';
							expect( labeledInput.isEnabled ).to.be.false;

							view.borderStyle = 'dotted';
							expect( labeledInput.isEnabled ).to.be.true;
						} );

						it( 'should update #borderWidth on DOM "input" event', () => {
							labeledInput.fieldView.element.value = 'foo';
							labeledInput.fieldView.fire( 'input' );
							expect( view.borderWidth ).to.equal( 'foo' );

							labeledInput.fieldView.element.value = 'bar';
							labeledInput.fieldView.fire( 'input' );
							expect( view.borderWidth ).to.equal( 'bar' );
						} );
					} );

					describe( 'border color input', () => {
						let labeledInput;

						beforeEach( () => {
							labeledInput = view.borderColorInput;
						} );

						it( 'should be created', () => {
							expect( labeledInput.fieldView ).to.be.instanceOf( ColorInputView );
							expect( labeledInput.label ).to.equal( 'Color' );
						} );

						it( 'should get the color configuration', () => {
							expect( labeledInput.fieldView.options.colorDefinitions ).to.deep.equal( [
								{
									color: 'rgb(255,0,0)',
									label: 'Red',
									options: {
										hasBorder: false
									}
								},
								{
									color: 'rgb(0,0,255)',
									label: 'Blue',
									options: {
										hasBorder: false
									}
								}
							] );
						} );

						it( 'should obtain the columns configuration', () => {
							expect( labeledInput.fieldView.options.columns ).to.equal( 5 );
						} );

						it( 'should reflect #borderColor property', () => {
							view.borderColor = 'foo';
							expect( labeledInput.fieldView.value ).to.equal( 'foo' );

							view.borderColor = 'bar';
							expect( labeledInput.fieldView.value ).to.equal( 'bar' );
						} );

						it( 'should be enabled only when #borderStyle is different than "none"', () => {
							view.borderStyle = '';
							expect( labeledInput.isEnabled ).to.be.false;

							view.borderStyle = 'dotted';
							expect( labeledInput.isEnabled ).to.be.true;
						} );

						it( 'should update #borderColor on DOM "input" event', () => {
							labeledInput.fieldView.value = 'foo';
							labeledInput.fieldView.fire( 'input' );
							expect( view.borderColor ).to.equal( 'foo' );

							labeledInput.fieldView.value = 'bar';
							labeledInput.fieldView.fire( 'input' );
							expect( view.borderColor ).to.equal( 'bar' );
						} );
					} );
				} );

				describe( 'background row', () => {
					it( 'should be defined', () => {
						const row = view.element.childNodes[ 2 ];

						expect( row.classList.contains( 'ck-form__row' ) ).to.be.true;
						expect( row.childNodes[ 0 ] ).to.equal( view.backgroundInput.element );
					} );

					describe( 'background color input', () => {
						let labeledInput;

						beforeEach( () => {
							labeledInput = view.backgroundInput;
						} );

						it( 'should be created', () => {
							expect( labeledInput.fieldView ).to.be.instanceOf( ColorInputView );
							expect( labeledInput.label ).to.equal( 'Background' );
							expect( labeledInput.class ).to.equal( 'ck-table-properties-form__background' );
						} );

						it( 'should get the color configuration', () => {
							expect( labeledInput.fieldView.options.colorDefinitions ).to.deep.equal( [
								{
									color: 'rgb(0,255,0)',
									label: 'Green',
									options: {
										hasBorder: false
									}
								}
							] );
						} );

						it( 'should obtain the columns configuration', () => {
							expect( labeledInput.fieldView.options.columns ).to.equal( 5 );
						} );

						it( 'should reflect #backgroundColor property', () => {
							view.backgroundColor = 'foo';
							expect( labeledInput.fieldView.value ).to.equal( 'foo' );

							view.backgroundColor = 'bar';
							expect( labeledInput.fieldView.value ).to.equal( 'bar' );
						} );

						it( 'should update #backgroundColor on DOM "input" event', () => {
							labeledInput.fieldView.value = 'foo';
							labeledInput.fieldView.fire( 'input' );
							expect( view.backgroundColor ).to.equal( 'foo' );

							labeledInput.fieldView.value = 'bar';
							labeledInput.fieldView.fire( 'input' );
							expect( view.backgroundColor ).to.equal( 'bar' );
						} );
					} );
				} );

				describe( 'dimensions row', () => {
					it( 'should be defined', () => {
						const row = view.element.childNodes[ 3 ].childNodes[ 0 ];

						expect( row.classList.contains( 'ck-form__row' ) ).to.be.true;
						expect( row.classList.contains( 'ck-table-form__dimensions-row' ) ).to.be.true;
						expect( row.childNodes[ 0 ].textContent ).to.equal( 'Dimensions' );
						expect( row.childNodes[ 1 ] ).to.equal( view.widthInput.element );
						expect( row.childNodes[ 2 ].textContent ).to.equal( '×' );
						expect( row.childNodes[ 3 ] ).to.equal( view.heightInput.element );
					} );

					describe( 'width input', () => {
						let labeledInput;

						beforeEach( () => {
							labeledInput = view.widthInput;
						} );

						it( 'should be created', () => {
							expect( labeledInput.fieldView ).to.be.instanceOf( InputTextView );
							expect( labeledInput.label ).to.equal( 'Width' );
							expect( labeledInput.class ).to.equal( 'ck-table-form__dimensions-row__width' );
						} );

						it( 'should reflect #width property', () => {
							view.width = 'foo';
							expect( labeledInput.fieldView.value ).to.equal( 'foo' );

							view.width = 'bar';
							expect( labeledInput.fieldView.value ).to.equal( 'bar' );
						} );

						it( 'should update #width on DOM "input" event', () => {
							labeledInput.fieldView.element.value = 'foo';
							labeledInput.fieldView.fire( 'input' );
							expect( view.width ).to.equal( 'foo' );

							labeledInput.fieldView.element.value = 'bar';
							labeledInput.fieldView.fire( 'input' );
							expect( view.width ).to.equal( 'bar' );
						} );
					} );

					describe( 'height input', () => {
						let labeledInput;

						beforeEach( () => {
							labeledInput = view.heightInput;
						} );

						it( 'should be created', () => {
							expect( labeledInput.fieldView ).to.be.instanceOf( InputTextView );
							expect( labeledInput.label ).to.equal( 'Height' );
							expect( labeledInput.class ).to.equal( 'ck-table-form__dimensions-row__height' );
						} );

						it( 'should reflect #height property', () => {
							view.height = 'foo';
							expect( labeledInput.fieldView.value ).to.equal( 'foo' );

							view.height = 'bar';
							expect( labeledInput.fieldView.value ).to.equal( 'bar' );
						} );

						it( 'should update #height on DOM "input" event', () => {
							labeledInput.fieldView.element.value = 'foo';
							labeledInput.fieldView.fire( 'input' );
							expect( view.height ).to.equal( 'foo' );

							labeledInput.fieldView.element.value = 'bar';
							labeledInput.fieldView.fire( 'input' );
							expect( view.height ).to.equal( 'bar' );
						} );
					} );
				} );

				describe( 'dimensions alignment row', () => {
					it( 'should be defined', () => {
						const row = view.element.childNodes[ 3 ].childNodes[ 1 ];

						expect( row.classList.contains( 'ck-form__row' ) ).to.be.true;
						expect( row.classList.contains( 'ck-table-properties-form__alignment-row' ) ).to.be.true;
						expect( row.childNodes[ 0 ].textContent ).to.equal( 'Alignment' );
						expect( row.childNodes[ 1 ] ).to.equal( view.alignmentToolbar.element );
					} );

					describe( 'alignment toolbar', () => {
						let toolbar;

						beforeEach( () => {
							toolbar = view.alignmentToolbar;
						} );

						it( 'should be defined', () => {
							expect( toolbar ).to.be.instanceOf( ToolbarView );
						} );

						it( 'should have an ARIA label', () => {
							expect( toolbar.ariaLabel ).to.equal( 'Table alignment toolbar' );
						} );

						it( 'should bring alignment buttons in the right order (left-to-right UI)', () => {
							expect( toolbar.items.map( ( { label } ) => label ) ).to.have.ordered.members( [
								'Align table to the left',
								'Center table',
								'Align table to the right'
							] );

							expect( toolbar.items.map( ( { isOn } ) => isOn ) ).to.have.ordered.members( [
								false, true, false
							] );
						} );

						it( 'should bring alignment buttons in the right order (right-to-left UI)', () => {
							// Creates its own local instances of locale, view and toolbar.
							const locale = {
								t: val => val,
								uiLanguageDirection: 'rtl',
								contentLanguageDirection: 'rtl'
							};
							const view = new TablePropertiesView( locale, VIEW_OPTIONS );
							const toolbar = view.alignmentToolbar;

							expect( toolbar.items.map( ( { label } ) => label ) ).to.have.ordered.members( [
								'Align table to the right',
								'Center table',
								'Align table to the left'
							] );

							expect( toolbar.items.map( ( { isOn } ) => isOn ) ).to.have.ordered.members( [
								false, true, false
							] );

							view.destroy();
						} );

						it( 'should change the #horizontalAlignment value', () => {
							toolbar.items.last.fire( 'execute' );
							expect( view.alignment ).to.equal( 'right' );
							expect( toolbar.items.last.isOn ).to.be.true;

							toolbar.items.first.fire( 'execute' );
							expect( view.alignment ).to.equal( 'left' );
							expect( toolbar.items.last.isOn ).to.be.false;
							expect( toolbar.items.first.isOn ).to.be.true;
						} );
					} );
				} );

				describe( 'action row', () => {
					it( 'should be defined', () => {
						const row = view.element.childNodes[ 4 ];

						expect( row.classList.contains( 'ck-form__row' ) ).to.be.true;
						expect( row.classList.contains( 'ck-table-form__action-row' ) ).to.be.true;
						expect( row.childNodes[ 0 ] ).to.equal( view.saveButtonView.element );
						expect( row.childNodes[ 1 ] ).to.equal( view.cancelButtonView.element );
					} );

					it( 'should have buttons with right properties', () => {
						expect( view.saveButtonView.label ).to.equal( 'Save' );
						expect( view.saveButtonView.type ).to.equal( 'submit' );
						expect( view.saveButtonView.withText ).to.be.true;
						expect( view.saveButtonView.class ).to.equal( 'ck-button-save' );

						expect( view.cancelButtonView.label ).to.equal( 'Cancel' );
						expect( view.cancelButtonView.withText ).to.be.true;
						expect( view.cancelButtonView.class ).to.equal( 'ck-button-cancel' );
					} );

					it( 'should make the cancel button fire the #cancel event when executed', () => {
						const spy = sinon.spy();

						view.on( 'cancel', spy );

						view.cancelButtonView.fire( 'execute' );

						expect( spy.calledOnce ).to.be.true;
					} );

					it( 'should make sure the #saveButtonView is disabled until text fields are without errors', () => {
						view.borderWidthInput.errorText = 'foo';
						view.borderColorInput.errorText = 'foo';
						view.backgroundInput.errorText = 'foo';
						view.widthInput.errorText = 'foo';
						view.heightInput.errorText = 'foo';

						expect( view.saveButtonView.isEnabled ).to.be.false;

						view.borderWidthInput.errorText = 'foo';
						view.borderColorInput.errorText = 'foo';
						view.backgroundInput.errorText = 'foo';
						view.widthInput.errorText = 'foo';
						view.heightInput.errorText = null;

						expect( view.saveButtonView.isEnabled ).to.be.false;

						view.borderWidthInput.errorText = 'foo';
						view.borderColorInput.errorText = 'foo';
						view.backgroundInput.errorText = 'foo';
						view.widthInput.errorText = null;
						view.heightInput.errorText = null;

						expect( view.saveButtonView.isEnabled ).to.be.false;

						view.borderWidthInput.errorText = 'foo';
						view.borderColorInput.errorText = 'foo';
						view.backgroundInput.errorText = null;
						view.widthInput.errorText = null;
						view.heightInput.errorText = null;

						expect( view.saveButtonView.isEnabled ).to.be.false;

						view.borderWidthInput.errorText = 'foo';
						view.borderColorInput.errorText = null;
						view.backgroundInput.errorText = null;
						view.widthInput.errorText = null;
						view.heightInput.errorText = null;

						expect( view.saveButtonView.isEnabled ).to.be.false;

						view.borderWidthInput.errorText = null;
						view.borderColorInput.errorText = null;
						view.backgroundInput.errorText = null;
						view.widthInput.errorText = null;
						view.heightInput.errorText = null;

						expect( view.saveButtonView.isEnabled ).to.be.true;
					} );
				} );
			} );

			it( 'should create #focusTracker instance', () => {
				expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
			} );

			it( 'should create #keystrokes instance', () => {
				expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
			} );

			it( 'should create #_focusCycler instance', () => {
				expect( view._focusCycler ).to.be.instanceOf( FocusCycler );
			} );

			it( 'should create #_focusables view collection', () => {
				expect( view._focusables ).to.be.instanceOf( ViewCollection );
			} );
		} );

		describe( 'render()', () => {
			it( 'should register child views in #_focusables', () => {
				expect( view._focusables.map( f => f ) ).to.have.members( [
					view.borderStyleDropdown,
					view.borderColorInput,
					view.borderWidthInput,
					view.backgroundInput,
					view.widthInput,
					view.heightInput,
					view.alignmentToolbar,
					view.saveButtonView,
					view.cancelButtonView
				] );
			} );

			it( 'should register child views\' #element in #focusTracker', () => {
				const spy = testUtils.sinon.spy( FocusTracker.prototype, 'add' );
				const view = new TablePropertiesView( { t: val => val }, VIEW_OPTIONS );
				view.render();

				sinon.assert.calledWith( spy, view.borderStyleDropdown.element );
				sinon.assert.calledWith( spy, view.borderColorInput.element );
				sinon.assert.calledWith( spy, view.borderWidthInput.element );
				sinon.assert.calledWith( spy, view.backgroundInput.element );
				sinon.assert.calledWith( spy, view.widthInput.element );
				sinon.assert.calledWith( spy, view.heightInput.element );
				sinon.assert.calledWith( spy, view.alignmentToolbar.element );
				sinon.assert.calledWith( spy, view.saveButtonView.element );
				sinon.assert.calledWith( spy, view.cancelButtonView.element );

				view.destroy();
			} );

			it( 'starts listening for #keystrokes coming from #element', () => {
				const view = new TablePropertiesView( { t: val => val }, VIEW_OPTIONS );
				const spy = sinon.spy( view.keystrokes, 'listenTo' );

				view.render();
				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, view.element );
			} );

			describe( 'activates keyboard navigation for the form', () => {
				it( 'so "tab" focuses the next focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					// Mock the border style dropdown button is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.borderStyleDropdown.element;

					const spy = sinon.spy( view.borderColorInput, 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );

				it( 'so "shift + tab" focuses the previous focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					// Mock the border style dropdown button is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.borderStyleDropdown.element;

					const spy = sinon.spy( view.cancelButtonView, 'focus' );

					view.keystrokes.press( keyEvtData );
					sinon.assert.calledOnce( keyEvtData.preventDefault );
					sinon.assert.calledOnce( keyEvtData.stopPropagation );
					sinon.assert.calledOnce( spy );
				} );
			} );
		} );

		describe( 'DOM bindings', () => {
			describe( 'submit event', () => {
				it( 'should trigger submit event', () => {
					const spy = sinon.spy();

					view.on( 'submit', spy );
					view.element.dispatchEvent( new Event( 'submit' ) );

					expect( spy.calledOnce ).to.be.true;
				} );
			} );
		} );

		describe( 'focus()', () => {
			it( 'focuses the #borderStyleDropdown', () => {
				const spy = sinon.spy( view.borderStyleDropdown, 'focus' );

				view.focus();

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );
