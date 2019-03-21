/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import FontColorEditing from '../../src/fontcolor/fontcolorediting';
import FontColorUI from '../../src/fontcolor/fontcolorui';

import fontColorIcon from '../../theme/icons/font-color.svg';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';

describe( 'FontColorUI', () => {
	let editor, command, element;

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'en', {
			'Font Color': 'Font Color',
			'Remove color': 'Remove text color',
			'Black': 'Black',
			'White': 'White',
			'Red': 'Red',
			'Orange': 'Orange',
			'Blue': 'Blue',
			'Green': 'Green'
		} );

		addTranslations( 'pl', {
			'Font Color': 'Kolor czcionki',
			'Remove color': 'Usuń kolor',
			'Black': 'Czarny',
			'White': 'Biały',
			'Red': 'Czerwony',
			'Orange': 'Pomarańczowy',
			'Blue': 'Niebieski',
			'Green': 'Zielony',
			'Yellow': 'Żółty'
		} );
	} );

	after( () => {
		clearTranslations();
	} );

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ FontColorEditing, FontColorUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'fontColor Dropdown', () => {
		let dropdown;

		beforeEach( () => {
			command = editor.commands.get( 'fontColor' );
			dropdown = editor.ui.componentFactory.create( 'fontColor' );
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'label', 'Font Color' );
			expect( button ).to.have.property( 'tooltip', true );
			expect( button ).to.have.property( 'icon', fontColorIcon );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'fontColor' );

			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-font-color-dropdown' ) ).to.be.true;
		} );

		it( 'should focus view after command execution from dropdown', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'fontColor' );

			dropdown.commandName = 'fontColor';
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

		describe( 'localization', () => {
			beforeEach( () => {
				return localizedEditor();
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				expect( buttonView.label ).to.equal( 'Kolor czcionki' );
			} );

			it( 'works for the colorTableView#items in the panel', () => {
				const colorTableView = dropdown.colorTableView;
				expect( colorTableView.removeButtonTooltip ).to.equal( 'Usuń kolor' );
				expect( colorTableView.items.first.label ).to.equal( 'Usuń kolor' );
			} );

			describe( 'works for', () => {
				const colors = [
					{
						color: 'hsl(0, 0%, 0%)',
						label: 'Czarny'
					}, {
						color: 'hsl(0, 0%, 100%)',
						label: 'Biały'
					}, {
						color: 'hsl(0, 75%, 60%)',
						label: 'Czerwony'
					}, {
						color: 'hsl(30, 75%, 60%)',
						label: 'Pomarańczowy'
					}, {
						color: 'hsl(240, 75%, 60%)',
						label: 'Niebieski'
					}, {
						color: 'hsl(120, 75%, 60%)',
						label: 'Zielony'
					}, {
						color: 'hsl(60, 75%, 60%)',
						label: 'Żółty'
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
			function localizedEditor() {
				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ FontColorEditing, FontColorUI ],
						toolbar: [ 'fontColor' ],
						language: 'pl',
					} )
					.then( newEditor => {
						editor = newEditor;
						dropdown = editor.ui.componentFactory.create( 'fontColor' );
						command = editor.commands.get( 'fontColor' );

						editorElement.remove();

						return editor.destroy();
					} );
			}
		} );
	} );
} );
