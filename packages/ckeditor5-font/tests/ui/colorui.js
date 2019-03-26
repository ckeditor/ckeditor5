/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, Event */

import ColorUI from './../../src/ui/colorui';
import FontColorCommand from './../../src/fontcolor/fontcolorcommand';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';

describe( 'ColorUI', () => {
	class TestColorPlugin extends ColorUI {
		constructor( editor ) {
			super( editor, {
				commandName: 'testColorCommand',
				componentName: 'testColor',
				icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"></svg>',
				dropdownLabel: 'Test Color'
			} );

			editor.commands.add( 'testColorCommand', new FontColorCommand( editor ) );
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
				label: 'RED'
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
		addTranslations( 'en', {
			'Test Color': 'Test Color',
			'Remove color': 'Remove color',
			'yellow': 'yellow',
			'White': 'White',
			'RED': 'RED',
			'Green': 'Green'
		} );

		addTranslations( 'pl', {
			'Test Color': 'Testowy plugin do kolorów',
			'Remove color': 'Usuń kolor',
			'yellow': 'żółty',
			'White': 'Biały',
			'RED': 'CZERWONY',
			'Green': 'Zielony'
		} );
	} );

	after( () => {
		clearTranslations();
	} );

	let editor, element, testColorPlugin, command;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ TestColorPlugin ],
				testColor: testColorConfig
			} )
			.then( newEditor => {
				editor = newEditor;
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
			expect( testColorPlugin.colorColumns ).to.equal( 3 );
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

		it( 'static color grid should impact on recent colors', () => {
			const firstStaticTile = dropdown.colorTableView.items.get( 1 ).items.first;
			const recentColorsModel = dropdown.colorTableView.recentlyUsedColors;
			const spy = sinon.spy();

			dropdown.on( 'execute', spy );

			firstStaticTile.element.dispatchEvent( new Event( 'click' ) );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, sinon.match.any, {
				value: 'yellow',
				label: 'yellow',
				hasBorder: false
			} );
			expect( recentColorsModel.get( 0 ) ).to.include( {
				color: 'yellow',
				label: 'yellow',
				hasBorder: false
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

		describe( 'localization', () => {
			beforeEach( () => {
				return createLocalizedEditor();
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				expect( buttonView.label ).to.equal( 'Testowy plugin do kolorów' );
			} );

			it( 'works for the colorTableView#items in the panel', () => {
				const colorTableView = dropdown.colorTableView;
				expect( colorTableView.removeButtonTooltip ).to.equal( 'Usuń kolor' );
				expect( colorTableView.items.first.label ).to.equal( 'Usuń kolor' );
			} );

			describe( 'works for', () => {
				const colors = [
					{
						color: 'yellow',
						label: 'żółty'
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
						label: 'CZERWONY'
					},
					{
						color: '#00FF00',
						label: 'Zielony'
					}
				];

				colors.forEach( test => {
					it( `tested color ${ test.color } with name ${ test.label }.`, () => {
						const colorGrid = dropdown.colorTableView.items.get( 1 );
						const tile = colorGrid.items.find( colorTile => test.color === colorTile.color );

						expect( tile.label ).to.equal( test.label );
					} );
				} );
			} );

			function createLocalizedEditor() {
				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

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

						editorElement.remove();

						return editor.destroy();
					} );
			}
		} );
	} );
} );
