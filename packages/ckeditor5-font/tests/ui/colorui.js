/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ColorUI from './../../src/ui/colorui';
import FontColorCommand from './../../src/fontcolor/fontcolorcommand';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ColorUI', () => {
	class TestColorPlugin extends ColorUI {
		constructor( editor ) {
			super( editor, {
				commandName: 'testColorCommand',
				componentName: 'testColor',
				icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"></svg>',
				dropdownLabel: editor.locale.t( 'Test Color' )
			} );

			editor.commands.add( 'testColorCommand', new FontColorCommand( editor ) );
			editor.model.schema.extend( '$text', { allowAttributes: 'testColor' } );
		}

		static get pluginName() {
			return 'TestColorPlugin';
		}
	}

	const testColorConfig = {
		colors: [
			'yellow',
			{
				color: '#000',
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
				plugins: [ Paragraph, TestColorPlugin ],
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
			dropdown.fire( 'execute', { value: null } );

			sinon.assert.calledOnce( focusSpy );
		} );

		it( 'colorTableView has set proper default attributes', () => {
			const colorTableView = dropdown.colorTableView;

			expect( colorTableView.documentColorsLabel ).to.equal( 'Document colors' );
			expect( colorTableView.documentColorsCount ).to.equal( 3 );
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
				documentColorsModel = dropdown.colorTableView.documentColors;
				global.document.body.appendChild( dropdown.element );
			} );
			afterEach( () => {
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
				const colorTableView = dropdown.colorTableView;

				expect( colorTableView.removeButtonLabel ).to.equal( 'Usuń kolor' );
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
						color: 'rgb(255,255,255)',
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
						const colorGrid = dropdown.colorTableView.items.get( 1 );
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
						language: 'pl',
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

	describe( 'addColorToDocumentColors', () => {
		let dropdown;

		beforeEach( () => {
			dropdown = editor.ui.componentFactory.create( 'testColor' );
			dropdown.render();
		} );

		afterEach( () => {
			dropdown.destroy();
		} );

		it( 'add custom color from not defined colors', () => {
			testColorPlugin.addColorToDocumentColors( '#123456' );
			expect( dropdown.colorTableView.documentColors.get( 0 ) ).to.deep.include( {
				color: '#123456',
				label: '#123456',
				options: {
					hasBorder: false
				}
			} );
		} );

		it( 'add already define color absed on color value', () => {
			testColorPlugin.addColorToDocumentColors( 'rgb(255,255,255)' );
			// Color values are kept without spaces.
			expect( dropdown.colorTableView.documentColors.get( 0 ) ).to.deep.include( {
				color: 'rgb(255,255,255)',
				label: 'White',
				options: {
					hasBorder: true
				}
			} );
		} );
	} );

	describe( 'empty document colors', () => {
		let editor, element;

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
					testColorPlugin = newEditor.plugins.get( 'TestColorPlugin' );
				} );
		} );

		afterEach( () => {
			element.remove();

			return editor.destroy();
		} );

		it( 'document colors are not created', () => {
			const dropdown = editor.ui.componentFactory.create( 'testColor' );
			dropdown.render();

			const colorTableView = dropdown.colorTableView;

			expect( colorTableView.documentColorsCount ).to.equal( 0 );
			expect( colorTableView.documentColorsLabel ).to.be.undefined;
		} );
	} );
} );
