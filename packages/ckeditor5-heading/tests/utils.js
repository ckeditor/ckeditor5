/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import Heading from '../src/heading.js';
import { getLocalizedOptions } from '../src/utils.js';

describe( 'utils', () => {
	testUtils.createSinonSandbox();

	describe( 'getLocalizedOptions()', () => {
		let editor, editorElement;

		before( () => {
			addTranslations( 'pl', {
				'Choose heading': 'Wybierz nagłówek',
				'Paragraph': 'Akapit',
				'Heading': 'Nagłówek',
				'Heading 1': 'Nagłówek 1',
				'Heading 2': 'Nagłówek 2',
				'Heading 3': 'Nagłówek 3'
			} );
		} );

		after( () => {
			clearTranslations();
		} );

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Heading ],
					toolbar: [ 'heading' ],
					language: 'pl'
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should return localized options', () => {
			const localized = getLocalizedOptions( editor );

			expect( Array.isArray( localized ) ).to.be.true;
			expect( localized.length ).to.equal( editor.config.get( 'heading.options' ).length );

			expect( localized.find( item => item.model == 'paragraph' ).title ).to.equal( 'Akapit' );
			expect( localized.find( item => item.model == 'heading1' ).title ).to.equal( 'Nagłówek 1' );
			expect( localized.find( item => item.model == 'heading2' ).title ).to.equal( 'Nagłówek 2' );
			expect( localized.find( item => item.model == 'heading3' ).title ).to.equal( 'Nagłówek 3' );
		} );
	} );
} );
