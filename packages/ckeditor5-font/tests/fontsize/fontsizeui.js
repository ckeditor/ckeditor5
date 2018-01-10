/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import FontSizeEditing from '../../src/fontsize/fontsizeediting';
import FontSizeUI from '../../src/fontsize/fontsizeui';

import fontSizeIcon from '../../theme/icons/font-size.svg';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { _clear as clearTranslations, add as addTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';
import { normalizeOptions } from '../../src/fontsize/utils';

testUtils.createSinonSandbox();

describe( 'FontSizeUI', () => {
	let editor, command, element;

	before( () => {
		addTranslations( 'en', {
			'Font Size': 'Font Size',
			'Normal': 'Normal',
			'Tiny': 'Tiny',
			'Small': 'Small',
			'Big': 'Big',
			'Huge': 'Huge'
		} );

		addTranslations( 'pl', {
			'Font Size': 'Rozmiar czcionki',
			'Normal': 'Normalny',
			'Tiny': 'Tyci',
			'Small': 'Mały',
			'Big': 'Duży',
			'Huge': 'Ogromny'
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
				plugins: [ FontSizeEditing, FontSizeUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'fontSize Dropdown', () => {
		let dropdown;

		beforeEach( () => {
			command = editor.commands.get( 'fontSize' );
			dropdown = editor.ui.componentFactory.create( 'fontSize' );
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'tooltip', 'Font Size' );
			expect( button ).to.have.property( 'icon', fontSizeIcon );
			expect( button ).to.have.property( 'withText', false );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			const dropdown = editor.ui.componentFactory.create( 'fontSize' );

			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-font-size-dropdown' ) ).to.be.true;
		} );

		it( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );
			const dropdown = editor.ui.componentFactory.create( 'fontSize' );

			dropdown.commandName = 'fontSize';
			dropdown.fire( 'execute' );

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
				return localizedEditor( [ 'tiny', 'small', 'normal', 'big', 'huge' ] );
			} );

			it( 'does not alter normalizeOptions() internals', () => {
				const options = normalizeOptions( [ 'tiny', 'small', 'normal', 'big', 'huge' ] );
				expect( options ).to.deep.equal( [
					{ title: 'Tiny', model: 'text-tiny', view: { name: 'span', class: 'text-tiny' } },
					{ title: 'Small', model: 'text-small', view: { name: 'span', class: 'text-small' } },
					{ title: 'Normal', model: undefined },
					{ title: 'Big', model: 'text-big', view: { name: 'span', class: 'text-big' } },
					{ title: 'Huge', model: 'text-huge', view: { name: 'span', class: 'text-huge' } }
				] );
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				expect( buttonView.tooltip ).to.equal( 'Rozmiar czcionki' );
			} );

			it( 'works for the listView#items in the panel', () => {
				const listView = dropdown.listView;

				expect( listView.items.map( item => item.label ) ).to.deep.equal( [
					'Tyci',
					'Mały',
					'Normalny',
					'Duży',
					'Ogromny'
				] );
			} );

			function localizedEditor( options ) {
				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ FontSizeEditing, FontSizeUI ],
						toolbar: [ 'fontSize' ],
						language: 'pl',
						fontSize: {
							options
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						dropdown = editor.ui.componentFactory.create( 'fontSize' );
						command = editor.commands.get( 'fontSize' );

						editorElement.remove();

						return editor.destroy();
					} );
			}
		} );
	} );
} );
