/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import RemoveFormat from '../src/removeformat';
import RemoveFormatUi from '../src/removeformatui';

// import markerIcon from '../theme/icons/marker.svg';
// import penIcon from '../theme/icons/pen.svg';
// import eraserIcon from '../theme/icons/eraser.svg';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import {
	_clear as clearTranslations,
	add as addTranslations
} from '@ckeditor/ckeditor5-utils/src/translation-service';

describe( 'RemoveFormatUI', () => {
	let editor, command, element, button;

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'en', {
			'Remove format': 'Remove format'
		} );

		addTranslations( 'pl', {
			'Remove format': 'Usuń formatowanie'
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
				plugins: [ RemoveFormat, RemoveFormatUi ]
			} )
			.then( newEditor => {
				editor = newEditor;
				command = editor.commands.get( 'removeformat' );
				button = editor.ui.componentFactory.create( 'removeformat' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'removeformat button', () => {
		describe( 'is bound to the command state', () => {
			it( 'isEnabled', () => {
				command.isEnabled = false;

				expect( button.isEnabled ).to.be.false;

				command.isEnabled = true;
				expect( button.isEnabled ).to.be.true;
			} );
		} );

		it( 'should change relay execute to the command', () => {
			const commandSpy = testUtils.sinon.spy( command, 'execute' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( commandSpy );
		} );

		describe( 'localization', () => {
			beforeEach( () => {
				return localizedEditor();
			} );

			it( 'label localized correctly', () => {
				expect( button.label ).to.equal( 'Usuń formatowanie' );
			} );

			function localizedEditor() {
				const editorElement = document.createElement( 'div' );
				document.body.appendChild( editorElement );

				return ClassicTestEditor
					.create( editorElement, {
						plugins: [ RemoveFormat, RemoveFormatUi ],
						toolbar: [ 'removeformat' ],
						language: 'pl'
					} )
					.then( newEditor => {
						editor = newEditor;
						button = editor.ui.componentFactory.create( 'removeformat' );
						command = editor.commands.get( 'removeformat' );

						editorElement.remove();

						return editor.destroy();
					} );
			}
		} );
	} );
} );
