/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ColorUI from './../../src/ui/colorui';
import FontColorCommand from './../../src/fontcolor/fontcolorcommand';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

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
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'label', 'Test Color' );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'icon', '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"></svg>' );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'testColor' );

			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-color-ui-dropdown' ) ).to.be.true;
		} );

		it( 'should focus view after command execution from dropdown', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'testColor' );

			dropdown.commandName = 'testColorCommand';
			dropdown.fire( 'execute', { value: null } );

			sinon.assert.calledOnce( focusSpy );
		} );

		describe( 'model to command binding', () => {
			it( 'isEnabled', () => {
				command.isEnabled = false;

				expect( dropdown.buttonView.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( dropdown.buttonView.isEnabled ).to.be.true;
			} );
		} );

		describe( 'reacts on change:data event', () => {
			let recentColorsModel;
			beforeEach( () => {
				recentColorsModel = testColorPlugin.colorTableView.recentlyUsedColors;
			} );

			it( 'editor starts with empty colors', () => {
				recentColorsModel.map( ( item, index ) => {
					expect( item ).to.include( {
						color: 'hsla(0, 0%, 0%, 0)',
						isEnabled: false,
						hasBorder: true
					}, `Default item with index: ${ index }, should be empty color.` );
				} );
			} );

			it( 'recent colors are read after initialization', () => {
				setModelData( model, '<paragraph><$text testColor="rgb(10,20,30)">Foo</$text></paragraph>' +
					'<paragraph><$text testColor="gold">Bar</$text></paragraph>' +
					'<paragraph><$text testColor="#FFAACC">Baz</$text></paragraph>' +
					'<paragraph><$text testColor="gold">New Foo</$text></paragraph>' );

				// First color should be reset to gold, because it's appear again in last paragraph
				expect( recentColorsModel.get( 0 ) ).to.include( {
					color: 'gold',
					label: 'gold',
					hasBorder: false
				} );

				expect( recentColorsModel.get( 1 ) ).to.include( {
					color: '#FFAACC',
					label: '#FFAACC',
					hasBorder: false
				} );

				expect( recentColorsModel.get( 2 ) ).to.include( {
					color: 'rgb(10,20,30)',
					label: 'rgb(10,20,30)',
					hasBorder: false
				} );
			} );

			it( 'predefined color is recognized and is not used in recent colors', () => {
				setModelData( model, '<paragraph><$text testColor="rgb(255,255,255)">Foo</$text></paragraph>' );
				expect( recentColorsModel.get( 0 ) ).to.include( {
					color: 'hsla(0, 0%, 0%, 0)',
					isEnabled: false,
					hasBorder: true
				} );
			} );

			it( 'removing color from model doesn\'t change recent colors', () => {
				setModelData( model, '<paragraph><$text testColor="lightgreen">Foo</$text></paragraph>' );

				expect( recentColorsModel.get( 0 ) ).to.include( {
					color: 'lightgreen',
					label: 'lightgreen',
					hasBorder: false
				} );

				const textNode = model.document.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'testColor', textNode );
				} );

				expect( recentColorsModel.get( 0 ) ).to.include( {
					color: 'lightgreen',
					label: 'lightgreen',
					hasBorder: false
				} );
				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>Foo</paragraph>' );
			} );

			it( 'inserting text without color doesn\'t break anything in colors', () => {
				setModelData( model, '<paragraph><$text testColor="lightblue">Foo</$text>[]</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.insertText( 'bar', paragraph, 'end' );
				} );
				expect( recentColorsModel.get( 0 ) ).to.include( {
					color: 'lightblue',
					label: 'lightblue',
					hasBorder: false
				} );
				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><$text testColor="lightblue">Foo</$text>bar</paragraph>' );
			} );

			it( 'changing color value will added as recently used color', () => {
				setModelData( model, '<paragraph><$text testColor="lightblue">Foo</$text>[]</paragraph>' );

				const textNode = model.document.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'testColor', 'lightgreen', textNode );
				} );

				expect( recentColorsModel.get( 0 ) ).to.include( {
					color: 'lightgreen',
					label: 'lightgreen',
					hasBorder: false
				} );
				expect( recentColorsModel.get( 1 ) ).to.include( {
					color: 'lightblue',
					label: 'lightblue',
					hasBorder: false
				} );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><$text testColor="lightgreen">Foo</$text></paragraph>' );
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
} );
