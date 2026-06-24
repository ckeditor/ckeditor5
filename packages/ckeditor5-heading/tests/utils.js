/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { add as addTranslations, _clearTranslations } from '@ckeditor/ckeditor5-utils';
import { Heading } from '../src/heading.js';
import { getLocalizedOptions } from '../src/utils.js';

describe( 'utils', () => {
	describe( 'getLocalizedOptions()', () => {
		let editor, editorElement;

		beforeAll( () => {
			addTranslations( 'pl', {
				'Choose heading': 'Wybierz nagłówek',
				'Paragraph': 'Akapit',
				'Heading': 'Nagłówek',
				'Heading 1': 'Nagłówek 1',
				'Heading 2': 'Nagłówek 2',
				'Heading 3': 'Nagłówek 3'
			} );
		} );

		afterAll( () => {
			_clearTranslations();
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

			expect( Array.isArray( localized ) ).toBe( true );
			expect( localized.length ).toEqual( editor.config.get( 'heading.options' ).length );

			expect( localized.find( item => item.model == 'paragraph' ).title ).toEqual( 'Akapit' );
			expect( localized.find( item => item.model == 'heading1' ).title ).toEqual( 'Nagłówek 1' );
			expect( localized.find( item => item.model == 'heading2' ).title ).toEqual( 'Nagłówek 2' );
			expect( localized.find( item => item.model == 'heading3' ).title ).toEqual( 'Nagłówek 3' );
		} );
	} );
} );
