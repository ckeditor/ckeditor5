/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Locale } from '../src/locale.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	add as addTranslations,
	_clear as clearTranslations
} from '../src/translation-service.js';
import { expectToThrowCKEditorError } from './_utils/utils.js';

describe( 'Locale', () => {
	afterEach( () => {
		clearTranslations();
		vi.restoreAllMocks();
	} );

	describe( 'constructor', () => {
		it( 'sets the #language', () => {
			const locale = new Locale( {
				uiLanguage: 'pl'
			} );

			expect( locale ).toHaveProperty( 'uiLanguage', 'pl' );
		} );

		it( 'sets the #contentLanguage', () => {
			const locale = new Locale( {
				uiLanguage: 'pl',
				contentLanguage: 'en'
			} );

			expect( locale ).toHaveProperty( 'uiLanguage', 'pl' );
			expect( locale ).toHaveProperty( 'contentLanguage', 'en' );
		} );

		it( 'sets the #translations', () => {
			const translations = [ {
				pl: {
					dictionary: {
						bold: 'Pogrubienie'
					}
				}
			},
			{
				de: {
					dictionary: {
						bold: 'Fett'
					}
				}
			}
			];

			const locale = new Locale( {
				translations
			} );

			expect( locale ).toHaveProperty( 'translations', {
				pl: {
					dictionary: {
						bold: 'Pogrubienie'
					}
				},
				de: {
					dictionary: {
						bold: 'Fett'
					}
				}
			} );
		} );

		it( 'defaults #language to en', () => {
			const locale = new Locale();

			expect( locale ).toHaveProperty( 'uiLanguage', 'en' );
		} );

		it( 'inherits the #contentLanguage from the #language (if not passed)', () => {
			const locale = new Locale( {
				uiLanguage: 'pl'
			} );

			expect( locale ).toHaveProperty( 'uiLanguage', 'pl' );
			expect( locale ).toHaveProperty( 'contentLanguage', 'pl' );
		} );

		it( 'determines the #uiLanguageDirection', () => {
			expect( new Locale( {
				uiLanguage: 'pl'
			} ) ).toHaveProperty( 'uiLanguageDirection', 'ltr' );

			expect( new Locale( {
				uiLanguage: 'en'
			} ) ).toHaveProperty( 'uiLanguageDirection', 'ltr' );

			expect( new Locale( {
				uiLanguage: 'ar'
			} ) ).toHaveProperty( 'uiLanguageDirection', 'rtl' );

			expect( new Locale( {
				uiLanguage: 'fa'
			} ) ).toHaveProperty( 'uiLanguageDirection', 'rtl' );

			expect( new Locale( {
				uiLanguage: 'he'
			} ) ).toHaveProperty( 'uiLanguageDirection', 'rtl' );

			expect( new Locale( {
				uiLanguage: 'ku'
			} ) ).toHaveProperty( 'uiLanguageDirection', 'rtl' );

			expect( new Locale( {
				uiLanguage: 'ug'
			} ) ).toHaveProperty( 'uiLanguageDirection', 'rtl' );
		} );

		it( 'determines the #contentLanguageDirection (not passed)', () => {
			expect( new Locale( {
				uiLanguage: 'pl'
			} ) ).toHaveProperty( 'contentLanguageDirection', 'ltr' );

			expect( new Locale( {
				uiLanguage: 'en'
			} ) ).toHaveProperty( 'contentLanguageDirection', 'ltr' );

			expect( new Locale( {
				uiLanguage: 'ar'
			} ) ).toHaveProperty( 'contentLanguageDirection', 'rtl' );
		} );

		it( 'determines the #contentLanguageDirection (passed)', () => {
			expect( new Locale( {
				uiLanguage: 'pl',
				contentLanguage: 'pl'
			} ) ).toHaveProperty( 'contentLanguageDirection', 'ltr' );

			expect( new Locale( {
				uiLanguage: 'en',
				contentLanguage: 'ar'
			} ) ).toHaveProperty( 'contentLanguageDirection', 'rtl' );

			expect( new Locale( {
				uiLanguage: 'ar',
				contentLanguage: 'pl'
			} ) ).toHaveProperty( 'contentLanguageDirection', 'ltr' );
		} );
	} );

	describe( 't', () => {
		let locale;

		beforeEach( () => {
			// eslint-disable-next-line no-nested-ternary
			const getPolishPluralForm = n => n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && ( n % 100 < 10 || n % 100 >= 20 ) ? 1 : 2;

			addTranslations( 'pl', {
				'foo': 'foo_pl',
				'bar': [ 'bar_pl_0', '%0 bar_pl_1', '%0 bar_pl_2' ]
			}, getPolishPluralForm );

			addTranslations( 'de', {
				'foo': 'foo_de',
				'bar': [ 'bar_de_0', '%0 bar_de_1', '%0 bar_de_2' ]
			} );

			locale = new Locale( {
				uiLanguage: 'pl',
				contentLanguage: 'de'
			} );
		} );

		it( 'should translate a message to the target ui language', () => {
			const t = locale.t;

			expect( t( 'foo' ) ).toBe( 'foo_pl' );
		} );

		it( 'should translate a message using the message id if it was passed', () => {
			const t = locale.t;

			addTranslations( 'pl', {
				'ADD_IMAGE': 'obrazek',
				'image': 'foo'
			} );

			expect( t( { string: 'image', id: 'ADD_IMAGE' } ) ).toBe( 'obrazek' );
		} );

		it( 'should translate a message supporting plural forms', () => {
			const t = locale.t;

			expect( t( { string: 'bar', plural: '%0 bars' }, 1 ), 1 ).toBe( 'bar_pl_0' );
			expect( t( { string: 'bar', plural: '%0 bars' }, 2 ), 2 ).toBe( '2 bar_pl_1' );
			expect( t( { string: 'bar', plural: '%0 bars' }, 5 ), 3 ).toBe( '5 bar_pl_2' );
		} );

		it( 'should translate a message supporting plural forms with a message id if it was passed', () => {
			const t = locale.t;

			addTranslations( 'pl', {
				'ADD_SPACE': [ '%1 spację', '%1 %0 spacje', '%1 %0 spacji' ],
				'Add': 'Dodaj',
				'Remove': 'Usuń'
			} );

			const addOrRemoveSpaceMessage = { string: '%1 a space', plural: '%1 %0 spaces', id: 'ADD_SPACE' };

			expect( t( addOrRemoveSpaceMessage, [ 1, t( 'Add' ) ] ), 1 ).toBe( 'Dodaj spację' );
			expect( t( addOrRemoveSpaceMessage, [ 2, t( 'Remove' ) ] ), 2 ).toBe( 'Usuń 2 spacje' );
			expect( t( addOrRemoveSpaceMessage, [ 5, t( 'Add' ) ] ), 3 ).toBe( 'Dodaj 5 spacji' );
		} );

		it( 'should interpolate a message with provided values', () => {
			const t = locale.t;

			expect( t( '%0 - %0', 'foo' ) ).toBe( 'foo - foo' );
			expect( t( '%1 - %0 - %2', [ 'a', 'b', 'c' ] ) ).toBe( 'b - a - c' );

			// Those test make sure that if %0 is really to be used, then it's going to work.
			// It'd be a super rare case if one would need to use %0 and at the same time interpolate something.
			expect( t( '%1 - %0 - %2' ) ).toBe( '%1 - %0 - %2' );
			expect( t( '%1 - %0 - %2', 'a' ) ).toBe( '%1 - a - %2' );
		} );

		it( 'should interpolate a message with a provided value (shorthand version)', () => {
			const t = locale.t;

			expect( t( 'Add %0', 'space' ) ).toBe( 'Add space' );
			expect( t( 'Remove %0 %1', 'spaces' ) ).toBe( 'Remove spaces %1' );

			expect( t( '%0 bar %0', 'foo' ) ).toBe( 'foo bar foo' );
		} );

		it( 'should throw an error when a value used to determine the plural version is not a number', () => {
			const t = locale.t;

			expectToThrowCKEditorError( () => {
				t( { string: 'Add space', plural: 'Add %0 spaces' }, 'space' );
			}, 'translation-service-quantity-not-a-number', null, { quantity: 'space' } );

			expectToThrowCKEditorError( () => {
				t( { string: 'Add space', plural: 'Add %0 spaces' }, [ 'space' ] );
			}, 'translation-service-quantity-not-a-number', null, { quantity: 'space' } );

			expect( () => {
				t( { string: 'Add space', plural: 'Add %0 spaces' }, [ 3 ] );
				t( { string: 'Add space', plural: 'Add %0 spaces' }, 3 );
				t( { string: 'Add %1', plural: 'Add %0 %1' }, [ 3, 'spaces' ] );
				t( { string: 'Add %0' }, [ 'space' ] );
				t( { string: 'Add %0' }, 'space' );
			} ).not.toThrow();
		} );
	} );
} );
