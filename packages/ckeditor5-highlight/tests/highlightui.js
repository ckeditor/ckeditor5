/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import HighlightEditing from '../src/highlightediting';
import HighlightUI from '../src/highlightui';

import markerIcon from '../theme/icons/marker.svg';
import penIcon from '../theme/icons/pen.svg';
import eraserIcon from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { _clear as clearTranslations, add as addTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';

describe( 'HighlightUI', () => {
	let editor, command, element;

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'en', {
			'Highlight': 'Highlight',
			'Yellow marker': 'Yellow marker',
			'Green marker': 'Green marker',
			'Pink marker': 'Pink marker',
			'Red pen': 'Red pen',
			'Blue pen': 'Blue pen',
			'Remove highlight': 'Remove highlight'
		} );

		addTranslations( 'pl', {
			'Highlight': 'Zakreślacz',
			'Yellow marker': 'Żółty marker',
			'Green marker': 'Zielony marker',
			'Pink marker': 'Różowy marker',
			'Blue marker': 'Niebieski marker',
			'Red pen': 'Czerwony długopis',
			'Green pen': 'Zielony długopis',
			'Remove highlight': 'Usuń zaznaczenie'
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
			dropdown = editor.ui.componentFactory.create( 'highlight' );
		} );

		it( 'button has the base properties', () => {
			const button = dropdown.buttonView;

			expect( button ).to.have.property( 'tooltip', 'Highlight' );
			expect( button ).to.have.property( 'icon', markerIcon );
			expect( button ).to.have.property( 'isToggleable', true );
		} );

		it( 'toolbar nas the basic properties', () => {
			const toolbarView = dropdown.toolbarView;

			expect( toolbarView ).to.have.property( 'ariaLabel', 'Text highlight toolbar' );
		} );

		it( 'should have proper icons in dropdown', () => {
			const toolbar = dropdown.toolbarView;

			// Not in a selection with highlight.
			command.value = undefined;

			expect( toolbar.items.map( item => item.icon ) )
				.to.deep.equal( [ markerIcon, markerIcon, markerIcon, markerIcon, penIcon, penIcon, undefined, eraserIcon ] );
		} );

		it( 'should have proper colors in dropdown', () => {
			const toolbar = dropdown.toolbarView;

			expect( toolbar.items.map( item => item.iconView && item.iconView.fillColor ) ).to.deep.equal( [
				'var(--ck-highlight-marker-yellow)',
				'var(--ck-highlight-marker-green)',
				'var(--ck-highlight-marker-pink)',
				'var(--ck-highlight-marker-blue)',
				'var(--ck-highlight-pen-red)',
				'var(--ck-highlight-pen-green)',
				undefined,
				''
			] );
		} );

		it( 'should activate current option in dropdown', () => {
			const toolbar = dropdown.toolbarView;

			// Not in a selection with highlight.
			command.value = undefined;

			expect( toolbar.items.map( item => item.isOn ) )
				.to.deep.equal( [ false, false, false, false, false, false, undefined, false ] );

			// Inside a selection with highlight.
			command.value = 'greenMarker';

			// The second item is 'greenMarker' highlighter.
			expect( toolbar.items.map( item => item.isOn ) )
				.to.deep.equal( [ false, true, false, false, false, false, undefined, false ] );
		} );

		it( 'should mark as toggleable all markers and pens', () => {
			const toolbar = dropdown.toolbarView;

			expect( toolbar.items.map( item => item.isToggleable ) )
				.to.deep.equal( [ true, true, true, true, true, true, undefined, false ] );
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
				expect( button.actionView.iconView.fillColor ).to.equal( options[ which ].color );
			}

			it( 'should have properties of first defined highlighter', () => {
				validateButton( 0 );
			} );

			it( 'should change button on selection', () => {
				command.value = 'redPen';

				validateButton( 4 );

				command.value = undefined;

				validateButton( 0 );
			} );

			it( 'should change button on execute option', () => {
				command.value = 'yellowMarker';
				validateButton( 0 );

				buttons[ 5 ].fire( 'execute' );
				command.value = 'greenPen';

				// Simulate selection moved to not highlighted text.
				command.value = undefined;

				validateButton( 5 );
			} );

			it( 'should focus view after command execution', () => {
				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				dropdown.buttonView.commandName = 'highlight';
				dropdown.buttonView.fire( 'execute' );

				sinon.assert.calledOnce( focusSpy );
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
				return localizedEditor();
			} );

			it( 'works for the #buttonView', () => {
				const buttonView = dropdown.buttonView;

				expect( buttonView.tooltip ).to.equal( 'Zakreślacz' );
			} );

			it( 'works for the listView#items in the panel', () => {
				const listView = dropdown.toolbarView;

				expect( listView.items.map( item => item.label ).filter( label => !!label ) ).to.deep.equal( [
					'Żółty marker',
					'Zielony marker',
					'Różowy marker',
					'Niebieski marker',
					'Czerwony długopis',
					'Zielony długopis',
					'Usuń zaznaczenie'
				] );
			} );

			function localizedEditor() {
				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ HighlightEditing, HighlightUI ],
						toolbar: [ 'highlight' ],
						language: 'pl'
					} )
					.then( newEditor => {
						dropdown = newEditor.ui.componentFactory.create( 'highlight' );
						command = newEditor.commands.get( 'highlight' );

						editorElement.remove();

						return newEditor.destroy();
					} );
			}
		} );
	} );
} );
