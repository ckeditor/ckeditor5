/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import HighlightEditing from '../src/highlightediting';
import HighlightUI from '../src/highlightui';

import markerIcon from '../theme/icons/marker.svg';
import penIcon from '../theme/icons/pen.svg';
import eraserIcon from '../theme/icons/eraser.svg';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { _clear as clearTranslations, add as addTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';

testUtils.createSinonSandbox();

describe( 'HighlightUI', () => {
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
				plugins: [ HighlightEditing, HighlightUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'highlight Dropdown', () => {
		let dropdown;

		beforeEach( () => {
			command = editor.commands.get( 'highlight' );
			dropdown = editor.ui.componentFactory.create( 'highlightDropdown' );
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'tooltip', 'Highlight' );
			expect( button ).to.have.property( 'icon', markerIcon );
			expect( button ).to.have.property( 'withText', false );
		} );

		it( 'should add custom CSS class to dropdown', () => {
			dropdown.render();

			expect( dropdown.element.classList.contains( 'ck-highlight-dropdown' ) ).to.be.true;
		} );

		it.skip( 'should focus view after command execution', () => {
			const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

			dropdown.commandName = 'highlight';
			dropdown.fire( 'execute' );

			sinon.assert.calledOnce( focusSpy );
		} );

		it( 'should have proper icons in dropdown', () => {
			const toolbar = dropdown.toolbarView;

			// Not in a selection with highlight.
			command.value = undefined;

			expect( toolbar.items.map( item => item.icon ) )
				.to.deep.equal( [ markerIcon, markerIcon, markerIcon, penIcon, penIcon, undefined, eraserIcon ] );
		} );

		it( 'should activate current option in dropdown', () => {
			const toolbar = dropdown.toolbarView;

			// Not in a selection with highlight.
			command.value = undefined;

			expect( toolbar.items.map( item => item.isOn ) )
				.to.deep.equal( [ false, false, false, false, false, undefined, false ] );

			// Inside a selection with highlight.
			command.value = 'greenMarker';

			// The second item is 'greenMarker' highlighter.
			expect( toolbar.items.map( item => item.isOn ) ).to.deep.equal( [ false, true, false, false, false, undefined, false ] );
		} );

		describe( 'toolbar button behavior', () => {
			let button, buttons, options;

			beforeEach( () => {
				button = dropdown.buttonView;
				buttons = dropdown.toolbarView.items.map( b => b );
				options = editor.config.get( 'highlight.options' );
			} );

			function validateButton( which ) {
				expect( button.icon ).to.equal( buttons[ which ].icon );
				expect( button.actionView.color ).to.equal( options[ which ].color );
			}

			it( 'should have properties of first defined highlighter', () => {
				validateButton( 0 );
			} );

			it( 'should change button on selection', () => {
				command.value = 'redPen';

				validateButton( 3 );

				command.value = undefined;

				validateButton( 0 );
			} );

			it( 'should change button on execute option', () => {
				command.value = 'marker';
				validateButton( 0 );

				buttons[ 4 ].fire( 'execute' );
				command.value = 'bluePen';

				// Simulate selection moved to not highlighted text.
				command.value = undefined;

				validateButton( 4 );
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

		describe.skip( 'localization', () => {
			beforeEach( () => {
				return localizedEditor( [ 'tiny', 'small', 'normal', 'big', 'huge' ] );
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
						plugins: [ HighlightEditing, HighlightUI ],
						toolbar: [ 'highlight' ],
						language: 'pl',
						highlight: {
							options
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						dropdown = editor.ui.componentFactory.create( 'highlightDropdown' );
						command = editor.commands.get( 'highlight' );

						editorElement.remove();

						return editor.destroy();
					} );
			}
		} );
	} );
} );
