/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TableCellPropertiesView } from '../../../src/tablecellproperties/ui/tablecellpropertiesview.js';
import { LabeledFieldView, FocusCycler, ViewCollection, ToolbarView, ButtonView, InputTextView } from '@ckeditor/ckeditor5-ui';
import { keyCodes, KeystrokeHandler, FocusTracker } from '@ckeditor/ckeditor5-utils';
import { ColorInputView } from '../../../src/ui/colorinputview.js';

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
	],
	defaultTableCellProperties: {
		borderColor: '',
		borderStyle: 'none',
		borderWidth: '',
		horizontalAlignment: 'left',
		verticalAlignment: 'middle',
		width: '',
		height: '',
		padding: '',
		backgroundColor: ''
	}
};

describe( 'table cell properties', () => {
	describe( 'TableCellPropertiesView', () => {
		let view, locale;

		beforeEach( () => {
			locale = { t: val => val };
			view = new TableCellPropertiesView( locale, VIEW_OPTIONS );
			view.render();
			document.body.appendChild( view.element );
		} );

		afterEach( () => {
			view.element.remove();
			view.destroy();
		} );

		describe( 'constructor()', () => {
			it( 'should set view#options', () => {
				expect( view.options ).toEqual( VIEW_OPTIONS );
			} );

			it( 'should set view#locale', () => {
				expect( view.locale ).toBe( locale );
			} );

			it( 'should create view#children collection', () => {
				expect( view.children ).toBeInstanceOf( ViewCollection );
			} );

			it( 'should define the public data interface (observable properties)', () => {
				expect( view ).toMatchObject( {
					borderStyle: '',
					borderWidth: '',
					borderColor: '',
					padding: '',
					backgroundColor: '',
					horizontalAlignment: '',
					verticalAlignment: ''
				} );
			} );

			it( 'should create element from template', () => {
				expect( view.element.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-form' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-table-form' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-table-cell-properties-form' ) ).toBe( true );
				expect( view.element.getAttribute( 'tabindex' ) ).toBe( '-1' );
			} );

			it( 'should create child views (and references)', () => {
				expect( view.borderStyleDropdown ).toBeInstanceOf( LabeledFieldView );
				expect( view.borderWidthInput ).toBeInstanceOf( LabeledFieldView );
				expect( view.borderColorInput ).toBeInstanceOf( LabeledFieldView );
				expect( view.backgroundInput ).toBeInstanceOf( LabeledFieldView );
				expect( view.cellTypeDropdown ).toBeInstanceOf( LabeledFieldView );
				expect( view.paddingInput ).toBeInstanceOf( LabeledFieldView );
				expect( view.horizontalAlignmentToolbar ).toBeInstanceOf( ToolbarView );
				expect( view.verticalAlignmentToolbar ).toBeInstanceOf( ToolbarView );

				expect( view.saveButtonView ).toBeInstanceOf( ButtonView );
				expect( view.cancelButtonView ).toBeInstanceOf( ButtonView );
				expect( view.backButtonView ).toBeInstanceOf( ButtonView );
			} );

			it( 'should have a header', () => {
				const header = view.element.firstChild;

				expect( header.classList.contains( 'ck' ) ).toBe( true );
				expect( header.classList.contains( 'ck-form__header' ) ).toBe( true );
				expect( header.children[ 1 ].textContent ).toBe( 'Cell properties' );
			} );

			describe( 'form rows', () => {
				describe( 'border row', () => {
					it( 'should be defined', () => {
						const row = view.element.childNodes[ 1 ];

						expect( row.classList.contains( 'ck-form__row' ) ).toBe( true );
						expect( row.classList.contains( 'ck-table-form__border-row' ) ).toBe( true );
						expect( row.childNodes[ 0 ].textContent ).toBe( 'Border' );
						expect( row.childNodes[ 1 ] ).toBe( view.borderStyleDropdown.element );
						expect( row.childNodes[ 2 ] ).toBe( view.borderWidthInput.element );
						expect( row.childNodes[ 3 ] ).toBe( view.borderColorInput.element );
					} );

					describe( 'border style labeled dropdown', () => {
						let labeledDropdown;

						beforeEach( () => {
							labeledDropdown = view.borderStyleDropdown;
						} );

						it( 'should have properties set', () => {
							expect(	labeledDropdown.label ).toBe( 'Style' );
							expect(	labeledDropdown.class ).toBe( 'ck-table-form__border-style' );
						} );

						it( 'should have a button with properties set', () => {
							expect(	labeledDropdown.fieldView.buttonView.isOn ).toBe( false );
							expect(	labeledDropdown.fieldView.buttonView.withText ).toBe( true );
							expect(	labeledDropdown.fieldView.buttonView.tooltip ).toBe( 'Style' );
							expect( labeledDropdown.fieldView.buttonView.ariaLabel ).toBe( 'Style' );
							expect( labeledDropdown.fieldView.buttonView.ariaLabelledBy ).toBeUndefined();
						} );

						it( 'should bind button\'s label to #borderStyle property', () => {
							view.borderStyle = 'dotted';
							expect( labeledDropdown.fieldView.buttonView.label ).toBe( 'Dotted' );

							view.borderStyle = 'dashed';
							expect( labeledDropdown.fieldView.buttonView.label ).toBe( 'Dashed' );
						} );

						it( 'should bind #isEmpty to #borderStyle property', () => {
							view.borderStyle = 'dotted';
							expect( labeledDropdown.isEmpty ).toBe( false );

							view.borderStyle = null;
							expect( labeledDropdown.isEmpty ).toBe( true );
						} );

						it( 'should change #borderStyle when executed', () => {
							labeledDropdown.fieldView.isOpen = true;
							labeledDropdown.fieldView.listView.items.first.children.first.fire( 'execute' );
							expect( view.borderStyle ).toBe( 'none' );

							labeledDropdown.fieldView.listView.items.last.children.first.fire( 'execute' );
							expect( view.borderStyle ).toBe( 'outset' );
						} );

						it( 'should come with a set of pre–defined border styles', () => {
							labeledDropdown.fieldView.isOpen = true;

							expect( labeledDropdown.fieldView.listView.items.map( item => {
								return item.children.first.label;
							} ) ).toEqual( [
								'None', 'Solid', 'Dotted', 'Dashed', 'Double', 'Groove', 'Ridge', 'Inset', 'Outset'
							] );
						} );

						it( 'should reset border width and color inputs when setting style to none', () => {
							view.borderStyle = 'dotted';
							view.borderWidth = '1px';
							view.borderColor = 'red';

							view.borderStyle = 'none';

							expect( view.borderColor ).toBe( '' );
							expect( view.borderWidth ).toBe( '' );
						} );

						it( 'listView should have properties set', () => {
							labeledDropdown.fieldView.isOpen = true;

							const listView = labeledDropdown.fieldView.listView;

							expect( listView.element.role ).toBe( 'menu' );
							expect( listView.element.ariaLabel ).toBe( 'Style' );
						} );
					} );

					describe( 'border width input', () => {
						let labeledInput;

						beforeEach( () => {
							labeledInput = view.borderWidthInput;
						} );

						it( 'should be created', () => {
							expect( labeledInput.fieldView ).toBeInstanceOf( InputTextView );
							expect( labeledInput.label ).toBe( 'Width' );
							expect( labeledInput.class ).toBe( 'ck-table-form__border-width' );
						} );

						it( 'should reflect #borderWidth property', () => {
							view.borderWidth = 'foo';
							expect( labeledInput.fieldView.value ).toBe( 'foo' );

							view.borderWidth = 'bar';
							expect( labeledInput.fieldView.value ).toBe( 'bar' );
						} );

						it( 'should be enabled only when #borderStyle is different than "none"', () => {
							view.borderStyle = 'none';
							expect( labeledInput.isEnabled ).toBe( false );

							view.borderStyle = 'dotted';
							expect( labeledInput.isEnabled ).toBe( true );
						} );

						it( 'should update #borderWidth on DOM "input" event', () => {
							labeledInput.fieldView.element.value = 'foo';
							labeledInput.fieldView.fire( 'input' );
							expect( view.borderWidth ).toBe( 'foo' );

							labeledInput.fieldView.element.value = 'bar';
							labeledInput.fieldView.fire( 'input' );
							expect( view.borderWidth ).toBe( 'bar' );
						} );
					} );

					describe( 'border color input', () => {
						let labeledInput;

						beforeEach( () => {
							labeledInput = view.borderColorInput;
						} );

						it( 'should be created', () => {
							expect( labeledInput.fieldView ).toBeInstanceOf( ColorInputView );
							expect( labeledInput.label ).toBe( 'Color' );
						} );

						it( 'should get the color configuration', () => {
							expect( labeledInput.fieldView.options.colorDefinitions ).toEqual( [
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

						it( 'should reflect #borderColor property', () => {
							view.borderColor = 'foo';
							expect( labeledInput.fieldView.value ).toBe( 'foo' );

							view.borderColor = 'bar';
							expect( labeledInput.fieldView.value ).toBe( 'bar' );
						} );

						it( 'should be enabled only when #borderStyle is different than "none"', () => {
							view.borderStyle = 'none';
							expect( labeledInput.isEnabled ).toBe( false );

							view.borderStyle = 'dotted';
							expect( labeledInput.isEnabled ).toBe( true );
						} );

						it( 'should update #borderColor on DOM "input" event', () => {
							labeledInput.fieldView.value = 'foo';
							labeledInput.fieldView.fire( 'input' );
							expect( view.borderColor ).toBe( 'foo' );

							labeledInput.fieldView.value = 'bar';
							labeledInput.fieldView.fire( 'input' );
							expect( view.borderColor ).toBe( 'bar' );
						} );
					} );
				} );

				describe( 'cell type row', () => {
					it( 'should be defined', () => {
						const row = view.element.childNodes[ 2 ].children[ 0 ];

						expect( row.classList.contains( 'ck-form__row' ) ).toBe( true );
						expect( row.classList.contains( 'ck-table-form__cell-type-row' ) ).toBe( true );
						expect( row.childNodes[ 0 ].textContent ).toBe( 'Cell type' );
						expect( row.childNodes[ 1 ] ).toBe( view.cellTypeDropdown.element );
					} );

					describe( 'cell type dropdown', () => {
						let labeledDropdown;

						beforeEach( () => {
							labeledDropdown = view.cellTypeDropdown;
						} );

						it( 'should have properties set', () => {
							expect( labeledDropdown.label ).toBe( 'Cell type' );
							expect( labeledDropdown.class ).toBe( 'ck-table-cell-properties-form__cell-type' );
						} );

						it( 'should have a button with properties set', () => {
							expect( labeledDropdown.fieldView.buttonView.isOn ).toBe( false );
							expect( labeledDropdown.fieldView.buttonView.withText ).toBe( true );
							expect( labeledDropdown.fieldView.buttonView.tooltip ).toBe( 'Cell type' );
							expect( labeledDropdown.fieldView.buttonView.ariaLabel ).toBe( 'Cell type' );
							expect( labeledDropdown.fieldView.buttonView.ariaLabelledBy ).toBeUndefined();
						} );

						it( 'should bind button\'s label to #cellType property', () => {
							view.cellType = 'data';
							expect( labeledDropdown.fieldView.buttonView.label ).toBe( 'Data cell' );

							view.cellType = 'header';
							expect( labeledDropdown.fieldView.buttonView.label ).toBe( 'Header cell' );
						} );

						it( 'should bind #isEmpty to #cellType property', () => {
							view.cellType = 'data';
							expect( labeledDropdown.isEmpty ).toBe( false );

							view.cellType = '';
							expect( labeledDropdown.isEmpty ).toBe( true );
						} );

						it( 'should change #cellType when executed', () => {
							labeledDropdown.fieldView.isOpen = true;
							labeledDropdown.fieldView.listView.items.first.children.first.fire( 'execute' );
							expect( view.cellType ).toBe( 'data' );

							labeledDropdown.fieldView.listView.items.last.children.first.fire( 'execute' );
							expect( view.cellType ).toBe( 'header' );
						} );

						it( 'should come with a set of pre–defined cell types', () => {
							labeledDropdown.fieldView.isOpen = true;

							expect( labeledDropdown.fieldView.listView.items.map( item => {
								return item.children.first.label;
							} ) ).toEqual( [
								'Data cell', 'Header cell'
							] );
						} );

						it( 'listView should have properties set', () => {
							labeledDropdown.fieldView.isOpen = true;

							const listView = labeledDropdown.fieldView.listView;

							expect( listView.element.role ).toBe( 'menu' );
							expect( listView.element.ariaLabel ).toBe( 'Cell type' );
						} );
					} );
				} );

				describe( 'background row', () => {
					it( 'should be defined', () => {
						const row = view.element.childNodes[ 2 ].children[ 1 ];

						expect( row.classList.contains( 'ck-form__row' ) ).toBe( true );
						expect( row.classList.contains( 'ck-table-form__background-row' ) ).toBe( true );

						expect( row.classList.contains( 'ck-form__row' ) ).toBe( true );
						expect( row.childNodes[ 0 ].textContent ).toBe( 'Background' );
						expect( row.childNodes[ 1 ] ).toBe( view.backgroundInput.element );
					} );

					describe( 'background color input', () => {
						let labeledInput;

						beforeEach( () => {
							labeledInput = view.backgroundInput;
						} );

						it( 'should be created', () => {
							expect( labeledInput.fieldView ).toBeInstanceOf( ColorInputView );
							expect( labeledInput.label ).toBe( 'Color' );
							expect( labeledInput.class ).toBe( 'ck-table-cell-properties-form__background' );
						} );

						it( 'should get the color configuration', () => {
							expect( labeledInput.fieldView.options.colorDefinitions ).toEqual( [
								{
									color: 'rgb(0,255,0)',
									label: 'Green',
									options: {
										hasBorder: false
									}
								}
							] );
						} );

						it( 'should reflect #backgroundColor property', () => {
							view.backgroundColor = 'foo';
							expect( labeledInput.fieldView.value ).toBe( 'foo' );

							view.backgroundColor = 'bar';
							expect( labeledInput.fieldView.value ).toBe( 'bar' );
						} );

						it( 'should update #backgroundColor on DOM "input" event', () => {
							labeledInput.fieldView.value = 'foo';
							labeledInput.fieldView.fire( 'input' );
							expect( view.backgroundColor ).toBe( 'foo' );

							labeledInput.fieldView.value = 'bar';
							labeledInput.fieldView.fire( 'input' );
							expect( view.backgroundColor ).toBe( 'bar' );
						} );
					} );
				} );

				describe( 'dimensions row', () => {
					it( 'should be defined', () => {
						const row = view.element.childNodes[ 3 ].childNodes[ 0 ];

						expect( row.classList.contains( 'ck-form__row' ) ).toBe( true );
						expect( row.classList.contains( 'ck-table-form__dimensions-row' ) ).toBe( true );
						expect( row.childNodes[ 0 ].textContent ).toBe( 'Dimensions' );
						expect( row.childNodes[ 1 ] ).toBe( view.widthInput.element );
						expect( row.childNodes[ 2 ].textContent ).toBe( '×' );
						expect( row.childNodes[ 3 ] ).toBe( view.heightInput.element );
					} );

					describe( 'width input', () => {
						let labeledInput;

						beforeEach( () => {
							labeledInput = view.widthInput;
						} );

						it( 'should be created', () => {
							expect( labeledInput.fieldView ).toBeInstanceOf( InputTextView );
							expect( labeledInput.label ).toBe( 'Width' );
							expect( labeledInput.class ).toBe( 'ck-table-form__dimensions-row__width' );
						} );

						it( 'should reflect #width property', () => {
							view.width = 'foo';
							expect( labeledInput.fieldView.value ).toBe( 'foo' );

							view.width = 'bar';
							expect( labeledInput.fieldView.value ).toBe( 'bar' );
						} );

						it( 'should update #width on DOM "input" event', () => {
							labeledInput.fieldView.element.value = 'foo';
							labeledInput.fieldView.fire( 'input' );
							expect( view.width ).toBe( 'foo' );

							labeledInput.fieldView.element.value = 'bar';
							labeledInput.fieldView.fire( 'input' );
							expect( view.width ).toBe( 'bar' );
						} );
					} );

					describe( 'height input', () => {
						let labeledInput;

						beforeEach( () => {
							labeledInput = view.heightInput;
						} );

						it( 'should be created', () => {
							expect( labeledInput.fieldView ).toBeInstanceOf( InputTextView );
							expect( labeledInput.label ).toBe( 'Height' );
							expect( labeledInput.class ).toBe( 'ck-table-form__dimensions-row__height' );
						} );

						it( 'should reflect #height property', () => {
							view.height = 'foo';
							expect( labeledInput.fieldView.value ).toBe( 'foo' );

							view.height = 'bar';
							expect( labeledInput.fieldView.value ).toBe( 'bar' );
						} );

						it( 'should update #height on DOM "input" event', () => {
							labeledInput.fieldView.element.value = 'foo';
							labeledInput.fieldView.fire( 'input' );
							expect( view.height ).toBe( 'foo' );

							labeledInput.fieldView.element.value = 'bar';
							labeledInput.fieldView.fire( 'input' );
							expect( view.height ).toBe( 'bar' );
						} );
					} );
				} );

				describe( 'padding row', () => {
					it( 'should be defined', () => {
						const row = view.element.childNodes[ 3 ].childNodes[ 1 ];

						expect( row.classList.contains( 'ck-form__row' ) ).toBe( true );
						expect( row.classList.contains( 'ck-table-cell-properties-form__padding-row' ) ).toBe( true );
						expect( row.childNodes[ 0 ] ).toBe( view.paddingInput.element );
					} );

					describe( 'padding input', () => {
						let labeledInput;

						beforeEach( () => {
							labeledInput = view.paddingInput;
						} );

						it( 'should be created', () => {
							expect( labeledInput.fieldView ).toBeInstanceOf( InputTextView );
							expect( labeledInput.label ).toBe( 'Padding' );
							expect( labeledInput.class ).toBe( 'ck-table-cell-properties-form__padding' );
						} );

						it( 'should reflect #padding property', () => {
							view.padding = 'foo';
							expect( labeledInput.fieldView.value ).toBe( 'foo' );

							view.padding = 'bar';
							expect( labeledInput.fieldView.value ).toBe( 'bar' );
						} );

						it( 'should update #padding on DOM "input" event', () => {
							labeledInput.fieldView.element.value = 'foo';
							labeledInput.fieldView.fire( 'input' );
							expect( view.padding ).toBe( 'foo' );

							labeledInput.fieldView.element.value = 'bar';
							labeledInput.fieldView.fire( 'input' );
							expect( view.padding ).toBe( 'bar' );
						} );
					} );
				} );

				describe( 'text alignment row', () => {
					it( 'should be defined', () => {
						const row = view.element.childNodes[ 4 ];

						expect( row.classList.contains( 'ck-form__row' ) ).toBe( true );
						expect( row.classList.contains( 'ck-table-cell-properties-form__alignment-row' ) ).toBe( true );
						expect( row.childNodes[ 0 ].textContent ).toBe( 'Table cell text alignment' );
						expect( row.childNodes[ 1 ] ).toBe( view.horizontalAlignmentToolbar.element );
						expect( row.childNodes[ 2 ] ).toBe( view.verticalAlignmentToolbar.element );
					} );

					describe( 'horizontal text alignment toolbar', () => {
						let toolbar;

						beforeEach( () => {
							toolbar = view.horizontalAlignmentToolbar;
						} );

						it( 'should be defined', () => {
							expect( toolbar ).toBeInstanceOf( ToolbarView );
						} );

						it( 'should have an ARIA label', () => {
							expect( toolbar.ariaLabel ).toBe( 'Horizontal text alignment toolbar' );
						} );

						it( 'should have a dedicated CSS class', () => {
							expect( view.horizontalAlignmentToolbar.element.classList.contains(
								'ck-table-cell-properties-form__horizontal-alignment-toolbar'
							) ).toBe( true );
						} );

						it( 'should bring alignment buttons in the right order (left-to-right UI)', () => {
							expect( toolbar.items.map( ( { label } ) => label ) ).toEqual( [
								'Align cell text to the left',
								'Align cell text to the center',
								'Align cell text to the right',
								'Justify cell text'
							] );

							expect( toolbar.items.map( ( { isOn } ) => isOn ) ).toEqual( [
								true, false, false, false
							] );
						} );

						it( 'should bring alignment buttons in the right order (right-to-left UI)', () => {
							// Creates its own local instances of locale, view and toolbar.
							const locale = {
								t: val => val,
								uiLanguageDirection: 'rtl',
								contentLanguageDirection: 'rtl'
							};
							const view = new TableCellPropertiesView( locale, VIEW_OPTIONS );
							const toolbar = view.horizontalAlignmentToolbar;

							expect( toolbar.items.map( ( { label } ) => label ) ).toEqual( [
								'Align cell text to the right',
								'Align cell text to the center',
								'Align cell text to the left',
								'Justify cell text'
							] );

							expect( toolbar.items.map( ( { isOn } ) => isOn ) ).toEqual( [
								true, false, false, false
							] );

							view.destroy();
						} );

						it( 'should change the #horizontalAlignment value', () => {
							toolbar.items.last.fire( 'execute' );
							expect( view.horizontalAlignment ).toBe( 'justify' );
							expect( toolbar.items.last.isOn ).toBe( true );

							toolbar.items.first.fire( 'execute' );
							expect( view.horizontalAlignment ).toBe( 'left' );
							expect( toolbar.items.last.isOn ).toBe( false );
							expect( toolbar.items.first.isOn ).toBe( true );
						} );

						it( 'should have proper ARIA properties', () => {
							expect( toolbar.role ).toBe( 'radiogroup' );
							expect( toolbar.ariaLabel ).toBe( 'Horizontal text alignment toolbar' );
						} );

						it( 'should have role=radio set on buttons', () => {
							expect( [ ...toolbar.items ].some( ( { role, isToggleable } ) => role && isToggleable ) ).toBe( true );
							expect( toolbar.items.length ).toBe( 4 );
						} );
					} );

					describe( 'vertical text alignment toolbar', () => {
						let toolbar;

						beforeEach( () => {
							toolbar = view.verticalAlignmentToolbar;
						} );

						it( 'should be defined', () => {
							expect( toolbar ).toBeInstanceOf( ToolbarView );
						} );

						it( 'should have an ARIA label', () => {
							expect( toolbar.ariaLabel ).toBe( 'Vertical text alignment toolbar' );
						} );

						it( 'should have a dedicated CSS class', () => {
							expect( view.verticalAlignmentToolbar.element.classList.contains(
								'ck-table-cell-properties-form__vertical-alignment-toolbar'
							) ).toBe( true );
						} );

						it( 'should bring alignment buttons', () => {
							expect( toolbar.items.map( ( { label } ) => label ) ).toEqual( [
								'Align cell text to the top',
								'Align cell text to the middle',
								'Align cell text to the bottom'
							] );

							expect( toolbar.items.map( ( { isOn } ) => isOn ) ).toEqual( [
								false, true, false
							] );
						} );

						it( 'should change the #verticalAlignment value', () => {
							toolbar.items.last.fire( 'execute' );
							expect( view.verticalAlignment ).toBe( 'bottom' );
							expect( toolbar.items.last.isOn ).toBe( true );

							toolbar.items.first.fire( 'execute' );
							expect( view.verticalAlignment ).toBe( 'top' );
							expect( toolbar.items.last.isOn ).toBe( false );
							expect( toolbar.items.first.isOn ).toBe( true );
						} );

						it( 'should have proper ARIA properties', () => {
							expect( toolbar.role ).toBe( 'radiogroup' );
							expect( toolbar.isCompact ).toBe( true );
							expect( toolbar.ariaLabel ).toBe( 'Vertical text alignment toolbar' );
						} );

						it( 'should have role=radio set on buttons', () => {
							expect( [ ...toolbar.items ].some( ( { role, isToggleable } ) => role && isToggleable ) ).toBe( true );
							expect( toolbar.items.length ).toBe( 3 );
						} );
					} );
				} );

				describe( 'back button', () => {
					it( 'should be defined', () => {
						const header = view.element.firstChild;

						expect( header.childNodes[ 0 ] ).toBe( view.backButtonView.element );
					} );

					it( 'should have button with right properties', () => {
						expect( view.backButtonView.label ).toBe( 'Back' );
						expect( view.backButtonView.type ).toBe( 'button' );
						expect( view.backButtonView.class ).toBe( 'ck-button-back' );
					} );

					it( 'should delegate execute to cancel event', () => {
						const spy = vi.fn();

						view.on( 'cancel', spy );
						view.backButtonView.fire( 'execute' );

						expect( spy ).toHaveBeenCalledTimes( 1 );
					} );
				} );

				describe( 'action row', () => {
					it( 'should be defined', () => {
						const row = view.element.childNodes[ 5 ];

						expect( row.classList.contains( 'ck-form__row' ) ).toBe( true );
						expect( row.classList.contains( 'ck-table-form__action-row' ) ).toBe( true );
						expect( row.childNodes[ 0 ] ).toBe( view.cancelButtonView.element );
						expect( row.childNodes[ 1 ] ).toBe( view.saveButtonView.element );
					} );

					it( 'should have buttons with right properties', () => {
						expect( view.saveButtonView.label ).toBe( 'Save' );
						expect( view.saveButtonView.type ).toBe( 'submit' );
						expect( view.saveButtonView.withText ).toBe( true );
						expect( view.saveButtonView.class ).toBe( 'ck-button-action' );

						expect( view.cancelButtonView.label ).toBe( 'Cancel' );
						expect( view.cancelButtonView.withText ).toBe( true );
						expect( view.cancelButtonView.type ).toBe( 'button' );
					} );

					it( 'should make the cancel button fire the #cancel event when executed', () => {
						const spy = vi.fn();

						view.on( 'cancel', spy );

						view.cancelButtonView.fire( 'execute' );

						expect( spy ).toHaveBeenCalledTimes( 1 );
					} );

					it( 'should make sure the #saveButtonView is disabled until text fields are without errors', () => {
						view.borderWidthInput.errorText = 'foo';
						view.borderColorInput.errorText = 'foo';
						view.backgroundInput.errorText = 'foo';
						view.paddingInput.errorText = 'foo';

						expect( view.saveButtonView.isEnabled ).toBe( false );

						view.borderWidthInput.errorText = 'foo';
						view.borderColorInput.errorText = 'foo';
						view.backgroundInput.errorText = 'foo';
						view.paddingInput.errorText = null;

						expect( view.saveButtonView.isEnabled ).toBe( false );

						view.borderWidthInput.errorText = 'foo';
						view.borderColorInput.errorText = 'foo';
						view.backgroundInput.errorText = null;
						view.paddingInput.errorText = null;

						expect( view.saveButtonView.isEnabled ).toBe( false );

						view.borderWidthInput.errorText = 'foo';
						view.borderColorInput.errorText = null;
						view.backgroundInput.errorText = null;
						view.paddingInput.errorText = null;

						expect( view.saveButtonView.isEnabled ).toBe( false );

						view.borderWidthInput.errorText = null;
						view.borderColorInput.errorText = null;
						view.backgroundInput.errorText = null;
						view.paddingInput.errorText = null;

						expect( view.saveButtonView.isEnabled ).toBe( true );
					} );
				} );
			} );

			it( 'should create #focusTracker instance', () => {
				expect( view.focusTracker ).toBeInstanceOf( FocusTracker );
			} );

			it( 'should create #keystrokes instance', () => {
				expect( view.keystrokes ).toBeInstanceOf( KeystrokeHandler );
			} );

			it( 'should create #_focusCycler instance', () => {
				expect( view._focusCycler ).toBeInstanceOf( FocusCycler );
			} );

			it( 'should create #_focusables view collection', () => {
				expect( view._focusables ).toBeInstanceOf( ViewCollection );
			} );
		} );

		describe( 'render()', () => {
			it( 'should register child views in #_focusables', () => {
				const expectedMembers = [
					view.borderStyleDropdown,
					view.borderColorInput,
					view.borderWidthInput,
					view.cellTypeDropdown,
					view.backgroundInput,
					view.widthInput,
					view.heightInput,
					view.paddingInput,
					view.horizontalAlignmentToolbar,
					view.verticalAlignmentToolbar,
					view.cancelButtonView,
					view.saveButtonView,
					view.backButtonView
				];
				const actualMembers = view._focusables.map( f => f );

				expect( actualMembers ).toHaveLength( expectedMembers.length );
				expect( actualMembers ).toEqual( expect.arrayContaining( expectedMembers ) );
			} );

			it( 'should register child views\' #element in #focusTracker', () => {
				const spy = vi.spyOn( FocusTracker.prototype, 'add' );
				const view = new TableCellPropertiesView( { t: val => val }, VIEW_OPTIONS );
				view.render();

				expect( spy ).toHaveBeenCalledWith( view.borderStyleDropdown.element );
				expect( spy ).toHaveBeenCalledWith( view.borderColorInput.element );
				expect( spy ).toHaveBeenCalledWith( view.borderWidthInput.element );
				expect( spy ).toHaveBeenCalledWith( view.backgroundInput.element );
				expect( spy ).toHaveBeenCalledWith( view.paddingInput.element );
				expect( spy ).toHaveBeenCalledWith( view.horizontalAlignmentToolbar.element );
				expect( spy ).toHaveBeenCalledWith( view.verticalAlignmentToolbar.element );
				expect( spy ).toHaveBeenCalledWith( view.saveButtonView.element );
				expect( spy ).toHaveBeenCalledWith( view.cancelButtonView.element );

				view.destroy();
			} );

			it( 'starts listening for #keystrokes coming from #element', () => {
				const view = new TableCellPropertiesView( { t: val => val }, VIEW_OPTIONS );
				const spy = vi.spyOn( view.keystrokes, 'listenTo' );

				view.render();
				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy ).toHaveBeenCalledWith( view.element );
			} );

			describe( 'activates keyboard navigation for the form', () => {
				it( 'so "tab" focuses the next focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the border style dropdown button is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.borderStyleDropdown.element;

					const spy = vi.spyOn( view.borderColorInput, 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );

				it( 'so "shift + tab" focuses the previous focusable item', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the border style dropdown button is focused.
					view.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.borderStyleDropdown.element;

					const spy = vi.spyOn( view.backButtonView, 'focus' );

					view.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );

				it( 'providing seamless forward navigation over child views with their own focusable children and focus cyclers', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the border color dropdown button button is focused.
					view.focusTracker.isFocused = view.borderColorInput.fieldView.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.borderColorInput.element;
					view.borderColorInput.fieldView.focusTracker.focusedElement =
						view.borderColorInput.fieldView.dropdownView.buttonView.element;

					const spy = vi.spyOn( view.borderWidthInput, 'focus' );

					view.borderColorInput.fieldView.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );

				it( 'providing seamless backward navigation over child views with their own focusable children and focus cyclers', () => {
					const keyEvtData = {
						keyCode: keyCodes.tab,
						shiftKey: true,
						preventDefault: vi.fn(),
						stopPropagation: vi.fn()
					};

					// Mock the border color dropdown input is focused.
					view.focusTracker.isFocused = view.borderColorInput.fieldView.focusTracker.isFocused = true;
					view.focusTracker.focusedElement = view.borderColorInput.element;
					view.borderColorInput.fieldView.focusTracker.focusedElement =
						view.borderColorInput.fieldView.inputView.element;

					const spy = vi.spyOn( view.borderStyleDropdown, 'focus' );

					view.borderColorInput.fieldView.keystrokes.press( keyEvtData );
					expect( keyEvtData.preventDefault ).toHaveBeenCalledTimes( 1 );
					expect( keyEvtData.stopPropagation ).toHaveBeenCalledTimes( 1 );
					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
			} );
		} );

		describe( 'destroy()', () => {
			it( 'should destroy the FocusTracker instance', () => {
				const destroySpy = vi.spyOn( view.focusTracker, 'destroy' );

				view.destroy();

				expect( destroySpy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should destroy the KeystrokeHandler instance', () => {
				const destroySpy = vi.spyOn( view.keystrokes, 'destroy' );

				view.destroy();

				expect( destroySpy ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		describe( 'DOM bindings', () => {
			describe( 'submit event', () => {
				it( 'should trigger submit event', () => {
					const spy = vi.fn();

					view.on( 'submit', spy );
					view.element.dispatchEvent( new Event( 'submit' ) );

					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );
			} );
		} );

		describe( 'focus()', () => {
			it( 'focuses the #borderStyleDropdown', () => {
				const spy = vi.spyOn( view.borderStyleDropdown, 'focus' );

				view.focus();

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		describe( 'options.showScopedHeaderOptions', () => {
			it( 'should include scoped header options when set to true', () => {
				const view = new TableCellPropertiesView( locale, {
					...VIEW_OPTIONS,
					showScopedHeaderOptions: true
				} );
				view.render();

				const labeledDropdown = view.cellTypeDropdown;
				labeledDropdown.fieldView.isOpen = true;

				expect( labeledDropdown.fieldView.listView.items.map( item => item.children.first.label ) ).toEqual( [
					'Data cell', 'Header cell', 'Column header', 'Row header'
				] );

				view.destroy();
			} );

			it( 'should not include scoped header options when set to false', () => {
				const labeledDropdown = view.cellTypeDropdown;
				labeledDropdown.fieldView.isOpen = true;

				expect( labeledDropdown.fieldView.listView.items.map( item => item.children.first.label ) ).toEqual( [
					'Data cell', 'Header cell'
				] );
			} );
		} );
	} );
} );
