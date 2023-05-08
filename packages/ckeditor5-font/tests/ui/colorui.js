/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import TestColorPlugin from '../_utils/testcolorplugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ColorGridView from '@ckeditor/ckeditor5-ui/src/colorgrid/colorgridview';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

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

	describe( 'testColor Dropdown', () => {
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
			dropdown.colorTableView.fire( 'execute', { value: null } );

			sinon.assert.calledOnce( focusSpy );
		} );

		it( 'colorTableView has set proper default attributes', () => {
			const colorTableView = dropdown.colorTableView.colorGridsPageView;

			expect( colorTableView.documentColorsCount ).to.equal( 3 );
		} );

		it( 'does not initialize grids when not open', () => {
			const localDropdown = editor.ui.componentFactory.create( 'testColor' );
			localDropdown.render();

			for ( const item of localDropdown.colorTableView.colorGridsPageView.items ) {
				expect( item ).not.to.be.instanceOf( ColorGridView );
			}
		} );

		it( 'should focus the first active button when dropdown is opened', () => {
			global.document.body.appendChild( dropdown.element );

			const secondButton = dropdown.colorTableView.colorGridsPageView.staticColorsGrid.items.get( 1 );
			const spy = sinon.spy( secondButton, 'focus' );

			secondButton.isOn = true;
			dropdown.isOpen = false;
			dropdown.isOpen = true;
			sinon.assert.calledOnce( spy );

			dropdown.element.remove();
		} );

		describe( 'color picker', () => {
			it( 'should execute command if the color gets changed when dropdown is open', () => {
				const spy = sinon.spy( editor, 'execute' );
				dropdown.colorTableView.colorPickerPageView.colorPickerView.color = '#a37474';

				sinon.assert.calledWithExactly( spy, 'testColorCommand', sinon.match( { value: 'hsl( 0, 20%, 55% )' } ) );
			} );

			it( 'should not execute command if the color gets changed when dropdown is closed', () => {
				const spy = sinon.spy( editor, 'execute' );

				dropdown.isOpen = false;
				dropdown.colorTableView.colorPickerPageView.colorPickerView.color = '#a37474';

				sinon.assert.notCalled( spy );
			} );

			it( 'should undo changes', () => {
				const spyUndo = sinon.spy( editor.commands.get( 'undo' ), 'execute' );

				dropdown.isOpen = true;
				testColorPlugin.colorTableView.fire( 'showColorPicker' );

				dropdown.colorTableView.selectedColor = 'hsl( 0, 0%, 100% )';

				editor.commands.get( 'testColorCommand' ).isEnabled = true;

				dropdown.colorTableView.fire( 'execute', {
					value: 'hsl( 210, 65%, 20% )',
					source: 'colorPicker'
				} );

				dropdown.colorTableView.colorPickerPageView.cancelButtonView.fire( 'execute' );

				sinon.assert.calledOnce( spyUndo );
			} );

			it( 'should create new batch when color picker is showed', () => {
				dropdown.isOpen = true;
				testColorPlugin.colorTableView.colorGridsPageView.colorPickerButtonView.fire( 'execute' );

				dropdown.colorTableView.selectedColor = '#000000';

				editor.commands.get( 'testColorCommand' ).isEnabled = true;

				dropdown.colorTableView.fire( 'execute', {
					value: 'hsl( 210, 65%, 20% )',
					source: 'colorPicker'
				} );

				expect( testColorPlugin._undoStepBatch.operations.length,
					'should have 1 change in batch' ).to.equal( 1 );

				dropdown.colorTableView.fire( 'execute', {
					value: 'hsl( 110, 60%, 12% )',
					source: 'saveButton'
				} );

				dropdown.isOpen = true;
				testColorPlugin.colorTableView.colorGridsPageView.colorPickerButtonView.fire( 'execute' );

				expect( testColorPlugin._undoStepBatch.operations.length,
					'should have 0 changes in batch' ).to.equal( 0 );
			} );

			it( 'should avoid call the command multiple times', () => {
				const spy = sinon.spy( editor, 'execute' );
				// Color format normalization could result with command being called multiple times.
				dropdown.colorTableView.colorPickerPageView.colorPickerView.color = '#a37474';

				expect( spy.callCount ).to.equal( 1 );
			} );

			it( 'should call appendColorPicker when dropdown is opened', async () => {
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
				const spy = sinon.spy( dropdown.colorTableView, '_appendColorPicker' );

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
				documentColorsModel = dropdown.colorTableView.colorGridsPageView.documentColors;
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

			it( 'works for the colorTableView#items in the panel', () => {
				const colorTableView = dropdown.colorTableView.colorGridsPageView;

				// expect( colorTableView.removeButtonLabel ).to.equal( 'Usuń kolor' );
				expect( colorTableView.items.first.label ).to.equal( 'Usuń kolor' );
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
						const colorGrid = dropdown.colorTableView.colorGridsPageView.items.get( 1 );
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

			expect( dropdown.colorTableView.colorPickerView ).to.be.undefined;
		} );
	} );
} );
