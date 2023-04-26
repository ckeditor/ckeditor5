/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document,Event */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ColorTableView from './../../src/ui/colortableview';
import ColorTileView from '@ckeditor/ckeditor5-ui/src/colorgrid/colortileview';
import { icons } from 'ckeditor5/src/core';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import ColorPickerView from '@ckeditor/ckeditor5-ui/src/colorpicker/colorpickerview';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import TestColorPlugin from '../_utils/testcolorplugin';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import removeButtonIcon from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';

describe( 'ColorTableView', () => {
	let locale, colorTableView;

	const colorDefinitions = [
		{
			color: '#000',
			label: 'Black',
			options: {
				hasBorder: false
			}
		},
		{
			color: 'rgb(255, 255, 255)',
			label: 'White',
			options: {
				hasBorder: true
			}
		},
		{
			color: 'red',
			label: 'Red',
			options: {
				hasBorder: false
			}
		}
	];
	const testColorConfig = {
		colors: [
			'yellow',
			{
				color: '#000'
			},
			{
				color: 'rgb(255, 255, 255)',
				label: 'White',
				hasBorder: true
			},
			{
				color: 'red',
				label: 'Red'
			},
			{
				color: '#00FF00',
				label: 'Green',
				hasBorder: false
			}
		],
		columns: 3
	};

	beforeEach( () => {
		locale = { t() {} };
		colorTableView = new ColorTableView( locale, {
			colors: colorDefinitions,
			columns: 5,
			removeButtonLabel: 'Remove color',
			documentColorsLabel: 'Document colors',
			documentColorsCount: 4
		} );
		// Grids rendering is deferred (#6192) therefore render happens before appending grids.
		colorTableView.render();
		colorTableView.appendGrids();

		document.body.appendChild( colorTableView.element );
	} );

	afterEach( () => {
		colorTableView.destroy();
		colorTableView.element.remove();
	} );

	testUtils.createSinonSandbox();

	describe( 'constructor()', () => {
		it( 'should store colors\' definitions', () => {
			expect( colorTableView.colorTableComponent.colorDefinitions ).to.be.instanceOf( Array );
			expect( colorTableView.colorTableComponent.colorDefinitions ).to.deep.equal( colorDefinitions );
		} );

		it( 'should create focus tracker', () => {
			expect( colorTableView.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should create keystroke handler', () => {
			expect( colorTableView.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should create observable for selected color', () => {
			expect( colorTableView.selectedColor ).to.be.undefined;

			colorTableView.set( 'selectedColor', 'white' );

			expect( colorTableView.selectedColor ).to.equal( 'white' );
		} );

		it( 'should set label for the remove color button', () => {
			expect( colorTableView.colorTableComponent.removeButtonLabel ).to.equal( 'Remove color' );
		} );

		it( 'should set number of drawn columns', () => {
			expect( colorTableView.colorTableComponent.columns ).to.equal( 5 );
		} );

		it( 'should create collection of document colors', () => {
			expect( colorTableView.colorTableComponent.documentColors ).to.be.instanceOf( Collection );
		} );

		it( 'should set maximum number of document colors', () => {
			expect( colorTableView.colorTableComponent.documentColorsCount ).to.equal( 4 );
		} );

		it( 'should create focus cycler', () => {
			expect( colorTableView._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'should apply correct classes', () => {
			expect( colorTableView.element.classList.contains( 'ck' ) ).to.be.true;
			expect( colorTableView.element.classList.contains( 'ck-color-table' ) ).to.be.true;
		} );

		it( 'should have correct amount of children', () => {
			expect( colorTableView.colorTableComponent.items.length ).to.equal( 4 );
		} );

		it( 'should have 1 item', () => {
			expect( colorTableView.items.length ).to.equal( 1 );
		} );
	} );

	describe( 'ColorTableView components', () => {
		beforeEach( () => {
			colorTableView.appendColorPicker( {} );
		} );

		describe( 'ColorTableComponent', () => {
			it( 'should have proper classname', () => {
				const colorTable = colorTableView.colorTableComponent;
				expect( colorTable.element.classList.contains( 'ck-color-table-component' ) ).to.be.true;
			} );
		} );

		describe( 'ColorPickerComponent', () => {
			it( 'should have proper classname', () => {
				const colorPicker = colorTableView.colorPickerComponent;
				expect( colorPicker.element.classList.contains( 'ck-color-picker-component' ) ).to.be.true;
			} );
		} );

		describe( 'showColorTable()', () => {
			it( 'color picker should be hidden', () => {
				colorTableView.showColorTable();

				expect( colorTableView.colorPickerComponent.element.classList.contains( 'ck-hidden' ) ).to.be.true;
			} );

			it( 'color picker should be hidden by default', () => {
				expect( colorTableView.colorPickerComponent.element.classList.contains( 'ck-hidden' ) ).to.be.true;
			} );

			describe( '#isColorTableVisible', () => {
				it( 'should be set on true', () => {
					// should be set on true by defualt
					expect( colorTableView.isColorTableVisible ).to.be.true;

					colorTableView.showColorTable();

					expect( colorTableView.isColorTableVisible ).to.be.true;
				} );
			} );

			describe( '#isColorPickerVisible', () => {
				it( 'should be set on false', () => {
					// should be set on false by defualt
					expect( colorTableView.isColorPickerVisible ).to.be.false;

					colorTableView.showColorTable();

					expect( colorTableView.isColorPickerVisible ).to.be.false;
				} );
			} );
		} );

		describe( 'showColorPicker()', () => {
			it( 'color table should be hidden', () => {
				colorTableView.showColorPicker();

				expect( colorTableView.colorTableComponent.element.classList.contains( 'ck-hidden' ) ).to.be.true;
			} );

			describe( '#isColorPickerVisible', () => {
				it( 'should be set on true', () => {
					colorTableView.showColorPicker();

					expect( colorTableView.isColorPickerVisible ).to.be.true;
				} );
			} );

			describe( '#isColorTableVisible', () => {
				it( 'should be set on false', () => {
					colorTableView.showColorPicker();

					expect( colorTableView.isColorTableVisible ).to.be.false;
				} );
			} );
		} );

		it( 'should not to show the color picker', () => {
			colorTableView.colorPickerComponent.colorPickerView = null;
			colorTableView.showColorPicker();

			expect( colorTableView.isColorPickerVisible ).to.be.false;
			expect( colorTableView.isColorTableVisible ).to.be.true;
		} );
	} );

	describe( 'appendGrids()', () => {
		it( 'shouldn\'t duplicate views if called more than once', () => {
			colorTableView.appendGrids();
			colorTableView.appendGrids();
			expect( colorTableView.colorTableComponent.items.length ).to.equal( 4 );
		} );
	} );

	describe( 'appendColorPicker()', () => {
		let dropdown, editor, element;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			colorTableView.appendColorPicker( {} );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Paragraph, TestColorPlugin ],
					testColor: Object.assign( {
						documentColors: 3
					}, testColorConfig )
				} )
				.then( newEditor => {
					editor = newEditor;

					dropdown = editor.ui.componentFactory.create( 'testColor' );
					dropdown.render();
					global.document.body.appendChild( dropdown.element );
				} );
		} );

		afterEach( () => {
			element.remove();
			dropdown.element.remove();
			dropdown.destroy();

			return editor.destroy();
		} );

		it( 'creates a color picker', () => {
			expect( colorTableView.colorPickerComponent.colorPickerView ).to.be.instanceOf( ColorPickerView );
		} );

		it( 'binds container\'s selected color to the color picker\'s color', () => {
			colorTableView.selectedColor = 'hsl( 120, 100%, 50% )';
			expect( colorTableView.colorPickerComponent.colorPickerView.color ).to.equal( 'hsl( 120, 100%, 50% )' );
		} );

		it( 'shouldn\'t duplicate views if called more than once', () => {
			colorTableView.appendColorPicker( {} );
			colorTableView.appendColorPicker( {} );

			expect( colorTableView.colorPickerComponent.items.length ).to.equal( 2 );
		} );

		it( 'should navigate forwards using the Tab key', () => {
			const keyEvtData = {
				keyCode: keyCodes.tab,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			colorTableView.colorTableComponent.colorPickerButtonView.fire( 'execute' );

			// Mock the remove color button is focused.
			colorTableView.focusTracker.isFocused = true;
			colorTableView.focusTracker.focusedElement = colorTableView.colorPickerComponent.colorPickerView.slidersView.first.element;

			const spy = sinon.spy( colorTableView.colorPickerComponent.colorPickerView.slidersView.get( 1 ), 'focus' );

			colorTableView.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should navigate backwards using the Shift+Tab key', () => {
			const keyEvtData = {
				keyCode: keyCodes.tab,
				shiftKey: true,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			colorTableView.colorTableComponent.colorPickerButtonView.fire( 'execute' );

			// Mock the remove color button is focused.
			colorTableView.focusTracker.isFocused = true;
			colorTableView.focusTracker.focusedElement = colorTableView.colorPickerComponent.colorPickerView.slidersView.get( 1 ).element;

			const spy = sinon.spy( colorTableView.colorPickerComponent.colorPickerView.slidersView.first, 'focus' );

			colorTableView.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should stop propagation when use arrow keys', () => {
			const keyEvtData = {
				keyCode: keyCodes.arrowright,
				stopPropagation: sinon.spy()
			};

			dropdown.colorTableView.appendColorPicker( {} );

			dropdown.colorTableView.focusTracker.focusedElement = colorTableView.colorTableComponent.removeColorButtonView;
			dropdown.colorTableView.focusTracker.isFocused = true;

			// console.log( dropdown.colorTableView.focusTracker );

			dropdown.colorTableView.keystrokes.press( keyEvtData );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = sinon.spy( colorTableView.focusTracker, 'destroy' );

			colorTableView.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = sinon.spy( colorTableView.keystrokes, 'destroy' );

			colorTableView.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );
	} );

	describe( 'focus tracking', () => {
		it( 'should focus first child of colorTableView in DOM on focus()', () => {
			const spy = sinon.spy( colorTableView._focusCycler, 'focusFirst' );

			colorTableView.focus();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should focus the last child of colorTableView in DOM on focusLast()', () => {
			const spy = sinon.spy( colorTableView._focusCycler, 'focusLast' );

			colorTableView.focusLast();

			sinon.assert.calledOnce( spy );
		} );

		describe( 'navigation across table controls using Tab and Shift+Tab keys', () => {
			beforeEach( () => {
				// Needed for the document colors grid to show up in the view.
				colorTableView.colorTableComponent.documentColors.add( {
					color: '#000000',
					label: 'Black',
					options: {
						hasBorder: false
					}
				} );
			} );

			it( 'should navigate forwards using the Tab key', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the remove color button is focused.
				colorTableView.focusTracker.isFocused = true;
				colorTableView.focusTracker.focusedElement = colorTableView.colorTableComponent.removeColorButtonView.element;

				const spy = sinon.spy( colorTableView.colorTableComponent.staticColorsGrid, 'focus' );

				colorTableView.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( 'should navigate backwards using the Shift+Tab key', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the remove color button is focused.
				colorTableView.focusTracker.isFocused = true;
				colorTableView.focusTracker.focusedElement = colorTableView.colorTableComponent.removeColorButtonView.element;

				const spy = sinon.spy( colorTableView.colorTableComponent.documentColorsGrid, 'focus' );

				colorTableView.keystrokes.press( keyEvtData );

				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'remove color button', () => {
		let removeButton;

		beforeEach( () => {
			removeButton = colorTableView.colorTableComponent.items.first;
		} );

		it( 'should have proper class', () => {
			expect( removeButton.element.classList.contains( 'ck-color-table__remove-color' ) ).to.be.true;
		} );

		it( 'should have proper settings', () => {
			expect( removeButton.withText ).to.be.true;
			expect( removeButton.icon ).to.equal( removeButtonIcon );
			expect( removeButton.label ).to.equal( 'Remove color' );
		} );

		it( 'should execute event with "null" value', () => {
			const spy = sinon.spy();
			colorTableView.on( 'execute', spy );

			removeButton.element.dispatchEvent( new Event( 'click' ) );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, sinon.match.any, { value: null } );
		} );
	} );

	describe( 'action bar', () => {
		let actionBar, saveButton, cancelButton;

		beforeEach( () => {
			colorTableView.appendColorPicker( {} );
			actionBar = colorTableView.colorPickerComponent.actionBarView;
			saveButton = colorTableView.colorPickerComponent.saveButtonView;
			cancelButton = colorTableView.colorPickerComponent.cancelButtonView;
		} );

		it( 'should have a proper CSS class name', () => {
			expect( actionBar.element.classList.contains( 'ck-color-table_action-bar' ) ).to.be.true;
		} );

		describe( 'save button', () => {
			it( 'should have a proper CSS class name', () => {
				expect( saveButton.element.classList.contains( 'ck-button-save' ) ).to.be.true;
			} );

			it( 'should have proper settings', () => {
				expect( saveButton.withText ).to.be.false;
				expect( saveButton.icon ).to.equal( icons.check );
			} );

			it( 'should execute event with "null" value', () => {
				const spy = sinon.spy();
				colorTableView.on( 'execute', spy );

				saveButton.element.dispatchEvent( new Event( 'click' ) );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWith( spy, sinon.match.any, { value: colorTableView.selectedColor } );
			} );
		} );

		describe( 'cancel button', () => {
			it( 'should have a proper CSS class name', () => {
				expect( cancelButton.element.classList.contains( 'ck-button-cancel' ) ).to.be.true;
			} );

			it( 'should have proper settings', () => {
				expect( cancelButton.withText ).to.be.false;
				expect( cancelButton.icon ).to.equal( icons.cancel );
			} );
		} );
	} );

	describe( 'static colors grid', () => {
		let staticColorTable;

		beforeEach( () => {
			staticColorTable = colorTableView.colorTableComponent.items.get( 1 );
		} );

		it( 'should have added 3 children from definition', () => {
			expect( staticColorTable.items.length ).to.equal( 3 );
		} );

		colorDefinitions.forEach( ( item, index ) => {
			it( `should dispatch event to parent element for color: ${ item.color }`, () => {
				const spy = sinon.spy();
				colorTableView.on( 'execute', spy );

				staticColorTable.items.get( index ).element.dispatchEvent( new Event( 'click' ) );

				sinon.assert.calledOnce( spy );
				sinon.assert.calledWith( spy, sinon.match.any, {
					value: item.color,
					label: item.label,
					hasBorder: item.options.hasBorder
				} );
			} );
		} );
	} );

	describe( 'document colors', () => {
		const colorBlack = {
			color: '#000000',
			label: 'Black',
			options: {
				hasBorder: false
			}
		};
		const colorWhite = {
			color: '#FFFFFF',
			label: 'Black',
			options: {
				hasBorder: true
			}
		};
		const colorRed = {
			color: 'rgb(255,0,0)',
			options: {
				hasBorder: false
			}
		};
		const colorEmpty = {
			color: 'hsla(0,0%,0%,0)',
			options: {
				hasBorder: true
			}
		};

		describe( 'default checks', () => {
			let documentColorsGridView, documentColors;

			beforeEach( () => {
				documentColors = colorTableView.colorTableComponent.documentColors;
				documentColorsGridView = colorTableView.colorTableComponent.documentColorsGrid;
			} );

			describe( 'model manipulation', () => {
				it( 'should add item to document colors', () => {
					expect( documentColors.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.length ).to.equal( 1 );
					expect( documentColors.first.color ).to.equal( '#000000' );
					expect( documentColors.first.label ).to.equal( 'Black' );
					expect( documentColors.first.options.hasBorder ).to.be.false;
				} );

				it( 'should not add same item twice one after another', () => {
					expect( documentColors.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.first ).to.own.include( colorBlack );
					expect( documentColors.length ).to.equal( 1 );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.first ).to.own.include( colorBlack );
					expect( documentColors.length ).to.equal( 1 );
				} );

				it( 'should not add item if it\'s present on the documentColor list', () => {
					expect( documentColors.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );
					documentColors.add( Object.assign( {}, colorWhite ) );
					documentColors.add( Object.assign( {}, colorRed ) );

					expect( documentColors.length ).to.equal( 3 );
					expect( documentColors.get( 0 ) ).to.own.include( colorBlack );
					expect( documentColors.get( 1 ) ).to.own.include( colorWhite );
					expect( documentColors.get( 2 ) ).to.own.include( colorRed );

					documentColors.add( Object.assign( {}, colorBlack ) );

					expect( documentColors.length ).to.equal( 3 );
					expect( documentColors.get( 0 ) ).to.own.include( colorBlack );
					expect( documentColors.get( 1 ) ).to.own.include( colorWhite );
					expect( documentColors.get( 2 ) ).to.own.include( colorRed );
				} );

				it( 'should correctly add disabled colors', () => {
					expect( documentColors.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorEmpty ) );

					expect( documentColors.length ).to.equal( 1 );
					expect( documentColors.first.color ).to.equal( 'hsla(0,0%,0%,0)' );
					expect( documentColors.first.options.hasBorder ).to.be.true;
				} );
			} );

			describe( 'events', () => {
				it( 'should delegate execute to parent', () => {
					const spy = sinon.spy();
					colorTableView.on( 'execute', spy );

					documentColors.add( Object.assign( {}, colorBlack ) );
					documentColorsGridView.items.first.element.dispatchEvent( new Event( 'click' ) );

					sinon.assert.calledOnce( spy );
					sinon.assert.calledWith( spy, sinon.match.any, {
						value: '#000000'
					} );
				} );
			} );

			describe( 'binding', () => {
				it( 'should add new colorTile item when document colors model is updated', () => {
					let colorTile;

					expect( documentColors.length ).to.equal( 0 );
					expect( documentColorsGridView.items.length ).to.equal( 0 );

					documentColors.add( Object.assign( {}, colorBlack ) );
					expect( documentColors.length ).to.equal( 1 );
					expect( documentColorsGridView.items.length ).to.equal( 1 );

					colorTile = documentColorsGridView.items.first;
					expect( colorTile ).to.be.instanceOf( ColorTileView );
					expect( colorTile.label ).to.equal( 'Black' );
					expect( colorTile.color ).to.equal( '#000000' );
					expect( colorTile.hasBorder ).to.be.false;

					documentColors.add( Object.assign( {}, colorEmpty ) );
					colorTile = documentColorsGridView.items.get( 1 );
					expect( colorTile ).to.be.instanceOf( ColorTileView );
					expect( colorTile.color ).to.equal( 'hsla(0,0%,0%,0)' );
					expect( colorTile.hasBorder ).to.be.true;
				} );
			} );
		} );

		describe( 'empty', () => {
			let colorTableView;
			beforeEach( () => {
				locale = { t() {} };
				colorTableView = new ColorTableView( locale, {
					colors: colorDefinitions,
					columns: 5,
					removeButtonLabel: 'Remove color',
					documentColorsCount: 0
				} );
				// Grids rendering is deferred (#6192) therefore render happens before appending grids.
				colorTableView.render();
				colorTableView.appendGrids();
			} );

			afterEach( () => {
				colorTableView.destroy();
			} );

			it( 'should not add document colors grid to the view', () => {
				expect( colorTableView.colorTableComponent.items.length ).to.equal( 2 );
				expect( colorTableView.colorTableComponent.documentColors.length ).to.equal( 0 );
				expect( colorTableView.colorTableComponent.documentColorsCount ).to.equal( 0 );
			} );
		} );
	} );

	describe( '_addColorToDocumentColors', () => {
		it( 'should add custom color', () => {
			colorTableView.colorTableComponent._addColorToDocumentColors( '#123456' );
			expect( colorTableView.colorTableComponent.documentColors.get( 0 ) ).to.deep.include( {
				color: '#123456',
				label: '#123456',
				options: {
					hasBorder: false
				}
			} );
		} );

		it( 'should detect already define color based on color value and use', () => {
			colorTableView.colorTableComponent._addColorToDocumentColors( 'rgb(255,255,255)' );
			// Color values are kept without spaces.
			expect( colorTableView.colorTableComponent.documentColors.get( 0 ) ).to.deep.include( {
				color: 'rgb(255,255,255)'
			} );
		} );
	} );

	describe( 'updateSelectedColors() with document colors', () => {
		let element, editor, model, dropdown, staticColorsGrid, documentColorsGrid;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Paragraph, TestColorPlugin ],
					testColor: Object.assign( {
						documentColors: 3
					}, testColorConfig )
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;

					dropdown = editor.ui.componentFactory.create( 'testColor' );
					dropdown.render();
					global.document.body.appendChild( dropdown.element );

					dropdown.isOpen = true;
					dropdown.isOpen = false;

					staticColorsGrid = dropdown.colorTableView.colorTableComponent.staticColorsGrid;
					documentColorsGrid = dropdown.colorTableView.colorTableComponent.documentColorsGrid;
				} );
		} );

		afterEach( () => {
			element.remove();
			dropdown.element.remove();
			dropdown.destroy();

			return editor.destroy();
		} );

		it( 'should have color tile turned on in document colors and static colors section', () => {
			const command = editor.commands.get( 'testColorCommand' );

			setModelData( model,
				'<paragraph><$text testColor="red">Foo</$text></paragraph>'
			);
			command.value = 'red';

			dropdown.isOpen = true;

			expect( staticColorsGrid.selectedColor ).to.equal( 'red' );
			expect( documentColorsGrid.selectedColor ).to.equal( 'red' );

			const redStaticColorTile = staticColorsGrid.items.find( tile => tile.color === 'red' );
			const redDocumentColorTile = documentColorsGrid.items.get( 0 );

			expect( redStaticColorTile.isOn ).to.be.true;
			expect( redDocumentColorTile.isOn ).to.be.true;
		} );

		it( 'should have color tile turned on in static colors section when document colors are full', () => {
			const command = editor.commands.get( 'testColorCommand' );

			setModelData( model,
				'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
				'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>' +
				'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>' +
				'<paragraph><$text testColor="#00FF00">Test</$text></paragraph>'
			);
			command.value = '#00FF00';

			dropdown.isOpen = true;

			expect( staticColorsGrid.selectedColor ).to.equal( '#00FF00' );
			expect( documentColorsGrid.selectedColor ).to.equal( '#00FF00' );

			const redStaticColorTile = staticColorsGrid.items.find( tile => tile.color === '#00FF00' );
			const activeDocumentColorTile = documentColorsGrid.items.find( tile => tile.isOn );

			expect( redStaticColorTile.isOn ).to.be.true;
			expect( activeDocumentColorTile ).to.be.undefined;
		} );

		it( 'should not have a selection for unknown colors exceeding document colors limit', () => {
			const command = editor.commands.get( 'testColorCommand' );

			setModelData( model,
				'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
				'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>' +
				'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>' +
				'<paragraph><$text testColor="pink">Test</$text></paragraph>'
			);
			command.value = 'pink';

			dropdown.isOpen = true;

			expect( staticColorsGrid.selectedColor ).to.equal( 'pink' );
			expect( documentColorsGrid.selectedColor ).to.equal( 'pink' );

			const activeStaticDocumentTile = staticColorsGrid.items.find( tile => tile.isOn );
			const activeDocumentColorTile = documentColorsGrid.items.find( tile => tile.isOn );

			expect( activeStaticDocumentTile ).to.be.undefined;
			expect( activeDocumentColorTile ).to.be.undefined;
		} );
	} );

	describe( 'disabled document colors section', () => {
		let editor, element, dropdown, model;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Paragraph, TestColorPlugin ],
					testColor: Object.assign( {
						documentColors: 0
					}, testColorConfig )
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					dropdown = editor.ui.componentFactory.create( 'testColor' );

					dropdown.render();
					global.document.body.appendChild( dropdown.element );
				} );
		} );

		afterEach( () => {
			element.remove();
			dropdown.element.remove();
			dropdown.destroy();

			return editor.destroy();
		} );

		it( 'should not create document colors section', () => {
			const colorTableView = dropdown.colorTableView.colorTableComponent;

			setModelData( model,
				'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
				'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>' +
				'<paragraph><$text testColor="gold">New Foo</$text></paragraph>' +
				'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>'
			);

			dropdown.isOpen = true;

			expect( colorTableView.documentColorsCount ).to.equal( 0 );
			expect( colorTableView.documentColorsLabel ).to.be.undefined;
		} );
	} );
} );
