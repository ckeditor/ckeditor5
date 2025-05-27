/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import TestColorPlugin from '../_utils/testcolorplugin.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ColorGridView from '@ckeditor/ckeditor5-ui/src/colorgrid/colorgridview.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'ColorUI', () => {
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

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'pl', {
			'Test Color': 'Testowy plugin',
			'Remove color': 'Usuń kolor',
			'Yellow': 'Żółty',
			'White': 'Biały',
			'Red': 'Czerwony',
			'Green': 'Zielony'
		} );
		addTranslations( 'en', {
			'Test Color': 'Test Color',
			'Remove color': 'Remove color',
			'Yellow': 'Yellow',
			'White': 'White',
			'Red': 'Red',
			'Green': 'Green'
		} );
	} );

	after( () => {
		clearTranslations();
	} );

	let editor, element, model, testColorPlugin, command;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Paragraph, TestColorPlugin, Undo ],
				testColor: testColorConfig
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				testColorPlugin = newEditor.plugins.get( 'TestColorPlugin' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'has assigned proper commandName', () => {
			expect( testColorPlugin.commandName ).to.equal( 'testColorCommand' );
		} );

		it( 'has assigned proper componentName', () => {
			expect( testColorPlugin.componentName ).to.equal( 'testColor' );
		} );

		it( 'has assigned proper icon', () => {
			expect( testColorPlugin.icon ).to.equal( '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"></svg>' );
		} );

		it( 'has assigned proper dropdownLabel', () => {
			expect( testColorPlugin.dropdownLabel ).to.equal( 'Test Color' );
		} );

		it( 'has assigned proper amount of columns', () => {
			// Value taken from editor's config above.
			expect( testColorPlugin.columns ).to.equal( 3 );
		} );
	} );

	describe( 'toolbar testColor Dropdown', () => {
		let dropdown;

		beforeEach( () => {
			command = editor.commands.get( 'testColorCommand' );
			dropdown = editor.ui.componentFactory.create( 'testColor' );
			dropdown.isOpen = true;

			dropdown.render();
		} );

		afterEach( () => {
			dropdown.destroy();
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'label', 'Test Color' );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'icon', '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"></svg>' );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			expect( dropdown.element.classList.contains( 'ck-color-ui-dropdown' ) ).to.be.true;
		} );

		it( 'should focus view after command execution from dropdown', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'testColor' );

			dropdown.commandName = 'testColorCommand';
			dropdown.colorSelectorView.fire( 'execute', { value: null } );

			sinon.assert.calledOnce( focusSpy );
		} );

		it( 'colorSelectorView has set proper default attributes', () => {
			const colorSelectorView = dropdown.colorSelectorView.colorGridsFragmentView;

			expect( colorSelectorView.documentColorsCount ).to.equal( 3 );
		} );

		it( 'does not initialize grids when not open', () => {
			const localDropdown = editor.ui.componentFactory.create( 'testColor' );
			localDropdown.render();

			for ( const item of localDropdown.colorSelectorView.colorGridsFragmentView.items ) {
				expect( item ).not.to.be.instanceOf( ColorGridView );
			}
		} );

		it( 'should focus the first active button when dropdown is opened', () => {
			global.document.body.appendChild( dropdown.element );

			const secondButton = dropdown.colorSelectorView.colorGridsFragmentView.staticColorsGrid.items.get( 1 );
			const spy = sinon.spy( secondButton, 'focus' );

			secondButton.isOn = true;
			dropdown.isOpen = false;
			dropdown.isOpen = true;
			sinon.assert.calledOnce( spy );

			dropdown.element.remove();
		} );

		it( 'should show the color grids fragment of the color selector when opened', () => {
			global.document.body.appendChild( dropdown.element );

			const showGridsSpy = sinon.spy( dropdown.colorSelectorView, 'showColorGridsFragment' );

			dropdown.isOpen = false;

			sinon.assert.notCalled( showGridsSpy );

			dropdown.isOpen = true;

			sinon.assert.calledOnce( showGridsSpy );

			dropdown.element.remove();
		} );

		it( 'should update selected colors of the color selector when opened', () => {
			global.document.body.appendChild( dropdown.element );

			const updateColorSpy = sinon.spy( dropdown.colorSelectorView, 'updateSelectedColors' );

			dropdown.isOpen = false;

			sinon.assert.notCalled( updateColorSpy );

			dropdown.isOpen = true;

			sinon.assert.calledOnce( updateColorSpy );

			dropdown.element.remove();
		} );

		describe( 'color picker', () => {
			it( 'should execute command if the color gets changed when dropdown is open', () => {
				const spy = sinon.spy( editor, 'execute' );

				dropdown.colorSelectorView.colorPickerFragmentView.colorPickerView.fire( 'colorSelected', { color: '#a37474' } );

				sinon.assert.calledWithExactly( spy, 'testColorCommand', sinon.match( { value: '#a37474' } ) );
			} );

			it( 'should not execute command if the color gets changed when dropdown is closed', () => {
				const spy = sinon.spy( editor, 'execute' );

				dropdown.isOpen = false;
				dropdown.colorSelectorView.colorPickerFragmentView.colorPickerView.color = '#a37474';

				sinon.assert.notCalled( spy );
			} );

			it( 'should undo changes', () => {
				const spyUndo = sinon.spy( editor.commands.get( 'undo' ), 'execute' );

				dropdown.isOpen = true;
				dropdown.colorSelectorView.fire( 'colorPicker:show' );

				dropdown.colorSelectorView.selectedColor = 'hsl( 0, 0%, 100% )';

				editor.commands.get( 'testColorCommand' ).isEnabled = true;

				dropdown.colorSelectorView.fire( 'execute', {
					value: 'hsl( 210, 65%, 20% )',
					source: 'colorPicker'
				} );

				dropdown.colorSelectorView.colorPickerFragmentView.cancelButtonView.fire( 'execute' );

				sinon.assert.calledOnce( spyUndo );
			} );

			it( 'should create new batch when color picker is showed', () => {
				dropdown.isOpen = true;
				dropdown.colorSelectorView.colorGridsFragmentView.colorPickerButtonView.fire( 'execute' );

				dropdown.colorSelectorView.selectedColor = '#000000';

				editor.commands.get( 'testColorCommand' ).isEnabled = true;

				dropdown.colorSelectorView.fire( 'execute', {
					value: 'hsl( 210, 65%, 20% )',
					source: 'colorPicker'
				} );

				expect( testColorPlugin._undoStepBatch.operations.length,
					'should have 1 change in batch' ).to.equal( 1 );

				dropdown.colorSelectorView.fire( 'execute', {
					value: 'hsl( 110, 60%, 12% )',
					source: 'saveButton'
				} );

				dropdown.isOpen = true;
				dropdown.colorSelectorView.colorGridsFragmentView.colorPickerButtonView.fire( 'execute' );

				expect( testColorPlugin._undoStepBatch.operations.length,
					'should have 0 changes in batch' ).to.equal( 0 );
			} );

			it( 'should avoid call the command multiple times', () => {
				const spy = sinon.spy( editor, 'execute' );
				// Color format normalization could result with command being called multiple times.
				dropdown.colorSelectorView.colorPickerFragmentView.colorPickerView.fire( 'colorSelected', { color: '#a37474' } );

				expect( spy.callCount ).to.equal( 1 );
			} );

			it( 'should close dropdown when "save button" is pressed', () => {
				dropdown.isOpen = true;

				dropdown.colorSelectorView.fire( 'execute', {
					source: 'colorPickerSaveButton'
				} );

				expect( dropdown.isOpen ).to.be.false;
			} );

			it( 'should call _appendColorPickerFragment() when dropdown is opened', async () => {
				// This test uses scoped `element`, `editor` and `dropdown` elements on purpose.
				const element = document.createElement( 'div' );
				document.body.appendChild( element );

				const editor = await ClassicTestEditor
					.create( element, {
						plugins: [
							Paragraph,
							TestColorPlugin
						],
						testColor: Object.assign( {
							colorPicker: {
								format: 'rgb'
							}
						}, testColorConfig )
					} );

				const dropdown = editor.ui.componentFactory.create( 'testColor' );
				const spy = sinon.spy( dropdown.colorSelectorView, '_appendColorPickerFragment' );

				dropdown.isOpen = true;

				spy.restore();

				element.remove();
				dropdown.destroy();
				await editor.destroy();

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'model to command binding', () => {
			it( 'isEnabled', () => {
				command.isEnabled = false;

				expect( dropdown.buttonView.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).to.be.true;
			} );
		} );

		describe( 'properly detects document colors on dropdown open', () => {
			let documentColorsModel, dropdown;
			beforeEach( () => {
				dropdown = editor.ui.componentFactory.create( 'testColor' );
				dropdown.render();
				documentColorsModel = dropdown.colorSelectorView.colorGridsFragmentView.documentColors;
				global.document.body.appendChild( dropdown.element );
			} );
			afterEach( () => {
				dropdown.element.remove();
				dropdown.destroy();
			} );

			it( 'adds to model colors from editor and not duplicates it', () => {
				setModelData( model,
					'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
					'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>' +
					'<paragraph><$text testColor="gold">New Foo</$text></paragraph>' +
					'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>'
				);

				dropdown.isOpen = true;

				expect( documentColorsModel.get( 0 ) ).to.deep.include( {
					color: 'gold',
					label: 'gold',
					options: {
						hasBorder: false
					}
				} );

				expect( documentColorsModel.get( 1 ) ).to.deep.include( {
					color: 'rgb(10,20,30)',
					label: 'rgb(10,20,30)',
					options: {
						hasBorder: false
					}
				} );

				expect( documentColorsModel.get( 2 ) ).to.deep.include( {
					color: '#FFAACC',
					label: '#FFAACC',
					options: {
						hasBorder: false
					}
				} );
			} );

			it( 'reacts on document model changes', () => {
				setModelData( model,
					'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>'
				);

				dropdown.isOpen = true;

				expect( documentColorsModel.length ).to.equal( 1 );
				expect( documentColorsModel.get( 0 ) ).to.deep.include( {
					color: 'rgb(10,20,30)',
					label: 'rgb(10,20,30)',
					options: {
						hasBorder: false
					}
				} );

				dropdown.isOpen = false;

				setModelData( model,
					'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
					'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>'
				);

				dropdown.isOpen = true;

				expect( documentColorsModel.length ).to.equal( 2 );

				expect( documentColorsModel.get( 0 ) ).to.deep.include( {
					color: 'gold',
					label: 'gold',
					options: {
						hasBorder: false
					}
				} );

				expect( documentColorsModel.get( 1 ) ).to.deep.include( {
					color: '#FFAACC',
					label: '#FFAACC',
					options: {
						hasBorder: false
					}
				} );
			} );
		} );

		describe( 'localization', () => {
			let editor, editorElement;

			beforeEach( () => {
				editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return createLocalizedEditor( editorElement )
					.then( localizedEditor => {
						editor = localizedEditor;
					} );
			} );

			afterEach( () => {
				editorElement.remove();

				return editor.destroy();
			} );

			it( 'works for the colorSelectorView#items in the panel', () => {
				const colorSelectorView = dropdown.colorSelectorView.colorGridsFragmentView;

				// expect( colorSelectorView.removeButtonLabel ).to.equal( 'Usuń kolor' );
				expect( colorSelectorView.items.first.label ).to.equal( 'Usuń kolor' );
			} );

			describe( 'works for', () => {
				const colors = [
					{
						color: 'yellow',
						label: 'yellow'
					},
					{
						color: '#000',
						label: '#000'
					},
					{
						color: 'rgb(255, 255, 255)',
						label: 'Biały'
					},
					{
						color: 'red',
						label: 'Czerwony'
					},
					{
						color: '#00FF00',
						label: 'Zielony'
					}
				];

				colors.forEach( test => {
					it( `tested color "${ test.color }" translated to "${ test.label }".`, () => {
						dropdown.isOpen = true;
						const colorGrid = dropdown.colorSelectorView.colorGridsFragmentView.items.get( 1 );
						const tile = colorGrid.items.find( colorTile => test.color === colorTile.color );

						expect( tile.label ).to.equal( test.label );
					} );
				} );
			} );

			function createLocalizedEditor( editorElement ) {
				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ TestColorPlugin ],
						testColor: testColorConfig,
						toolbar: [ 'testColor' ],
						language: 'pl'
					} )
					.then( newEditor => {
						editor = newEditor;
						dropdown = editor.ui.componentFactory.create( 'testColor' );
						command = editor.commands.get( 'testColorCommand' );

						return editor;
					} );
			}
		} );
	} );

	describe( 'menu bar testColor menu', () => {
		let subMenu, colorSelectorView;

		beforeEach( () => {
			command = editor.commands.get( 'testColorCommand' );
			subMenu = editor.ui.componentFactory.create( 'menuBar:testColor' );
			subMenu.isOpen = true;
			colorSelectorView = subMenu.panelView.children.get( 0 );

			subMenu.render();
		} );

		afterEach( () => {
			subMenu.destroy();
		} );

		it( 'button has the base properties', () => {
			const button = subMenu.buttonView;

			expect( button ).to.have.property( 'label', 'Test Color' );
			expect( button ).to.have.property( 'icon', '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"></svg>' );
		} );

		it( 'should focus view after command execution from sub menu', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			colorSelectorView.fire( 'execute', { value: null } );

			sinon.assert.calledOnce( focusSpy );
		} );

		it( 'colorSelectorView has set proper default attributes', () => {
			expect( colorSelectorView.colorGridsFragmentView.documentColorsCount ).to.equal( 3 );
		} );

		describe( 'model to command binding', () => {
			it( 'isEnabled', () => {
				command.isEnabled = false;
				expect( subMenu.buttonView.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( subMenu.buttonView.isEnabled ).to.be.true;
			} );
		} );

		it( 'should not use document colors if they have value 0 in config', async () => {
			const emptyColorConfig = {
				colors: [],
				columns: 0,
				documentColors: 0
			};

			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const customizedEditor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, TestColorPlugin ],
					testColor: {
						...emptyColorConfig,
						colorPicker: false
					}
				} );

			const subMenu = customizedEditor.ui.componentFactory.create( 'menuBar:testColor' );

			subMenu.isOpen = true;

			expect( subMenu.panelView.children.first.colorGridsFragmentView._documentColorsLabel ).to.equal( '' );

			editorElement.remove();
			await customizedEditor.destroy();
		} );

		describe( 'properly detects document colors on dropdown open', () => {
			let documentColorsModel;

			beforeEach( () => {
				documentColorsModel = colorSelectorView.colorGridsFragmentView.documentColors;
				global.document.body.appendChild( subMenu.panelView.element );
			} );

			afterEach( () => {
				subMenu.panelView.element.remove();
				subMenu.destroy();
			} );

			it( 'adds to model colors from editor and not duplicates it', () => {
				setModelData( model,
					'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
					'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>' +
					'<paragraph><$text testColor="gold">New Foo</$text></paragraph>' +
					'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>'
				);

				subMenu.isOpen = false;
				subMenu.isOpen = true;

				expect( documentColorsModel.get( 0 ) ).to.deep.include( {
					color: 'gold',
					label: 'gold',
					options: {
						hasBorder: false
					}
				} );

				expect( documentColorsModel.get( 1 ) ).to.deep.include( {
					color: 'rgb(10,20,30)',
					label: 'rgb(10,20,30)',
					options: {
						hasBorder: false
					}
				} );

				expect( documentColorsModel.get( 2 ) ).to.deep.include( {
					color: '#FFAACC',
					label: '#FFAACC',
					options: {
						hasBorder: false
					}
				} );
			} );

			it( 'reacts on document model changes', () => {
				setModelData( model,
					'<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>'
				);

				subMenu.isOpen = false;
				subMenu.isOpen = true;

				expect( documentColorsModel.length ).to.equal( 1 );
				expect( documentColorsModel.get( 0 ) ).to.deep.include( {
					color: 'rgb(10,20,30)',
					label: 'rgb(10,20,30)',
					options: {
						hasBorder: false
					}
				} );

				setModelData( model,
					'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
					'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>'
				);

				subMenu.isOpen = false;
				subMenu.isOpen = true;

				expect( documentColorsModel.length ).to.equal( 2 );

				expect( documentColorsModel.get( 0 ) ).to.deep.include( {
					color: 'gold',
					label: 'gold',
					options: {
						hasBorder: false
					}
				} );

				expect( documentColorsModel.get( 1 ) ).to.deep.include( {
					color: '#FFAACC',
					label: '#FFAACC',
					options: {
						hasBorder: false
					}
				} );
			} );
		} );

		describe( 'localization', () => {
			let editor, editorElement;

			beforeEach( () => {
				editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return createLocalizedEditor( editorElement )
					.then( localizedEditor => {
						editor = localizedEditor;
					} );
			} );

			afterEach( () => {
				editorElement.remove();

				return editor.destroy();
			} );

			it( 'works for the colorSelectorView#items in the panel', () => {
				expect( colorSelectorView.colorGridsFragmentView.items.first.label ).to.equal( 'Usuń kolor' );
			} );

			describe( 'works for', () => {
				const colors = [
					{
						color: 'yellow',
						label: 'yellow'
					},
					{
						color: '#000',
						label: '#000'
					},
					{
						color: 'rgb(255, 255, 255)',
						label: 'Biały'
					},
					{
						color: 'red',
						label: 'Czerwony'
					},
					{
						color: '#00FF00',
						label: 'Zielony'
					}
				];

				colors.forEach( test => {
					it( `tested color "${ test.color }" translated to "${ test.label }".`, () => {
						const colorGrid = colorSelectorView.colorGridsFragmentView.items.get( 1 );
						const tile = colorGrid.items.find( colorTile => test.color === colorTile.color );

						expect( tile.label ).to.equal( test.label );
					} );
				} );
			} );

			function createLocalizedEditor( editorElement ) {
				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ TestColorPlugin ],
						testColor: testColorConfig,
						toolbar: [ 'testColor' ],
						language: 'pl'
					} )
					.then( newEditor => {
						editor = newEditor;
						subMenu = editor.ui.componentFactory.create( 'menuBar:testColor' );
						subMenu.isOpen = true;
						colorSelectorView = subMenu.panelView.children.get( 0 );
						command = editor.commands.get( 'testColorCommand' );

						return editor;
					} );
			}
		} );
	} );

	describe( 'config.colorPicker', () => {
		it( 'can be turned off', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const customizedEditor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, TestColorPlugin ],
					testColor: {
						...testColorConfig,
						colorPicker: false
					}
				} );

			const dropdown = customizedEditor.ui.componentFactory.create( 'testColor' );

			dropdown.isOpen = true;

			editorElement.remove();
			await customizedEditor.destroy();

			expect( dropdown.colorSelectorView.colorPickerView ).to.be.undefined;
		} );
	} );

	// Issue: https://github.com/ckeditor/ckeditor5/issues/15580
	// For simplicity we create editor with two same buttons in toolbar
	// instead overcomplicating stuff with ballon toolbar.
	describe( 'toolbar with two same instance of testColor', () => {
		let editor, element;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Paragraph, TestColorPlugin, Undo ],
					testColor: testColorConfig,
					toolbar: [ 'testColor' ]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					testColorPlugin = newEditor.plugins.get( 'TestColorPlugin' );
				} );
		} );

		afterEach( () => {
			element.remove();

			return editor.destroy();
		} );

		describe( 'testColor Dropdown', () => {
			let dropdown, dropdown2;

			beforeEach( () => {
				command = editor.commands.get( 'testColorCommand' );
				dropdown = editor.ui.componentFactory.create( 'testColor' );
				dropdown2 = editor.ui.componentFactory.create( 'testColor' );
			} );

			afterEach( () => {
				dropdown.destroy();
				dropdown2.destroy();
			} );

			it( 'should execute command if in toolbar there are more than one dropdowns', () => {
				const spy = sinon.spy( editor, 'execute' );

				dropdown.isOpen = true;

				dropdown.colorSelectorView.colorPickerFragmentView.colorPickerView.fire( 'colorSelected', { color: '#a37474' } );

				sinon.assert.calledWithExactly( spy, 'testColorCommand', sinon.match( { value: '#a37474' } ) );

				dropdown2.isOpen = true;

				dropdown2.colorSelectorView.colorPickerFragmentView.colorPickerView.fire( 'colorSelected', { color: '#ffffff' } );

				sinon.assert.calledWithExactly( spy, 'testColorCommand', sinon.match( { value: '#ffffff' } ) );
			} );
		} );
	} );
} );
