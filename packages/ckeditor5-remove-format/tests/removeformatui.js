/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import RemoveFormat from '../src/removeformat.js';
import RemoveFormatUI from '../src/removeformatui.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import {
	_clear as clearTranslations,
	add as addTranslations
} from '@ckeditor/ckeditor5-utils/src/translation-service.js';

describe( 'RemoveFormatUI', () => {
	let editor, command, element, button;

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'en', {
			'Remove Format': 'Remove Format'
		} );

		addTranslations( 'pl', {
			'Remove Format': 'Usuń formatowanie'
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
				plugins: [ RemoveFormat, RemoveFormatUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
				command = editor.commands.get( 'removeFormat' );
				button = editor.ui.componentFactory.create( 'removeFormat' );
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
						plugins: [ RemoveFormat, RemoveFormatUI ],
						toolbar: [ 'removeFormat' ],
						language: 'pl'
					} )
					.then( newEditor => {
						button = newEditor.ui.componentFactory.create( 'removeFormat' );
						command = newEditor.commands.get( 'removeFormat' );

						editorElement.remove();

						return newEditor.destroy();
					} );
			}
		} );
	} );
} );
