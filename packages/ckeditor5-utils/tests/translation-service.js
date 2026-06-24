/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, afterEach } from 'vitest';
import { _translate, add, _clear, _unifyTranslations } from '../src/translation-service.js';
import { global } from '../src/dom/global.js';
import { expectToThrowCKEditorError } from '../tests/_utils/utils.js';

describe( 'translation-service', () => {
	afterEach( () => {
		_clear();
	} );

	describe( 'add()', () => {
		it( 'should merge translation added several times', () => {
			add( 'pl', { 'foo': 'foo_pl' } );
			add( 'pl', { 'bar': 'bar_pl' } );

			const translatedFoo = _translate( 'pl', { string: 'foo' } );
			const translatedBar = _translate( 'pl', { string: 'bar' } );

			expect( translatedFoo ).toBe( 'foo_pl' );
			expect( translatedBar ).toBe( 'bar_pl' );
		} );

		it( 'should overwrite previously added translations for the same message ids', () => {
			add( 'pl', { 'foo': 'First' } );
			add( 'pl', { 'foo': 'Second' } );

			const translatedFoo = _translate( 'pl', { string: 'foo' } );

			expect( translatedFoo ).toBe( 'Second' );
		} );

		it( 'should set the plural form function if it is provided', () => {
			add( 'pl', {
				'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ]
			} );

			// eslint-disable-next-line no-nested-ternary
			add( 'pl', {}, n => n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && ( n % 100 < 10 || n % 100 >= 20 ) ? 1 : 2 );

			expect( _translate( 'pl', { string: 'Add space' }, 0 ) ).toBe( 'Dodaj %0 spacji' );
			expect( _translate( 'pl', { string: 'Add space' }, 1 ) ).toBe( 'Dodaj spację' );
			expect( _translate( 'pl', { string: 'Add space' }, 3 ) ).toBe( 'Dodaj %0 spacje' );
			expect( _translate( 'pl', { string: 'Add space' }, 13 ) ).toBe( 'Dodaj %0 spacji' );
		} );
	} );

	describe( '_translate()', () => {
		it( 'should return translated messages when translations are defined', () => {
			add( 'pl', {
				'OK': 'OK',
				'Cancel': 'Anuluj'
			} );

			add( 'en_US', {
				'OK': 'OK',
				'Cancel': 'Cancel'
			} );

			const translatedCancelPL = _translate( 'pl', { string: 'Cancel' } );
			const translatedCancelEN = _translate( 'en', { string: 'Cancel' } );

			expect( translatedCancelPL ).toBe( 'Anuluj' );
			expect( translatedCancelEN ).toBe( 'Cancel' );
		} );

		it( 'should return the original message string if no translation exists for the given message', () => {
			const translatedBold = _translate( 'pl', { string: 'Bold' } );

			expect( translatedBold ).toBe( 'Bold' );
		} );

		it( 'should return the correct plural form of english message if no translation exists for the given message', () => {
			const addSpaces = _translate( 'pl', { string: 'Add a space', plural: 'Add %0 spaces' }, 3 );
			const addASpace = _translate( 'pl', { string: 'Add a space', plural: 'Add %0 spaces' }, 1 );

			expect( addSpaces ).toBe( 'Add %0 spaces' );
			expect( addASpace ).toBe( 'Add a space' );
		} );

		it( 'should return the original message string if a translation for the target language does not exist' +
		'but translation doesn\'t', () => {
			add( 'pl', {
				'OK': 'OK',
				'Cancel': 'Anuluj'
			} );

			const translatedBold = _translate( 'pl', { string: 'Bold' } );

			expect( translatedBold ).toBe( 'Bold' );
		} );

		it( 'should return a translated message when only one language is provided', () => {
			add( 'pl', {
				'OK': 'OK',
				'Cancel': 'Anuluj'
			} );

			const translatedCancel = _translate( 'de', { string: 'Cancel' } );

			expect( translatedCancel ).toBe( 'Anuluj' );
		} );

		it( 'should return a translated message based on message id when it was passed', () => {
			add( 'pl', {
				'ADD_IMAGE': 'obraz'
			} );

			const translatedFooBar = _translate( 'pl', { string: 'image', id: 'ADD_IMAGE' } );

			expect( translatedFooBar ).toBe( 'obraz' );
		} );

		it( 'should return the correct plural form of the message based on the provided function', () => {
			add( 'pl', {
				'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ],
				'Cancel': 'Anuluj'
				// eslint-disable-next-line no-nested-ternary
			}, n => n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && ( n % 100 < 10 || n % 100 >= 20 ) ? 1 : 2 );

			expect( _translate( 'pl', { string: 'Add space' }, 0 ) ).toBe( 'Dodaj %0 spacji' );
			expect( _translate( 'pl', { string: 'Add space' }, 1 ) ).toBe( 'Dodaj spację' );
			expect( _translate( 'pl', { string: 'Add space' }, 3 ) ).toBe( 'Dodaj %0 spacje' );
			expect( _translate( 'pl', { string: 'Add space' }, 13 ) ).toBe( 'Dodaj %0 spacji' );
		} );

		it( 'should return a plural form based on rules for English if no function to determine the plural form was provided', () => {
			add( 'pl', {
				'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ],
				'Cancel': 'Anuluj'
			} );

			expect( _translate( 'pl', { string: 'Add space' }, 1 ) ).toBe( 'Dodaj spację' );

			expect( _translate( 'pl', { string: 'Add space' }, 0 ) ).toBe( 'Dodaj %0 spacje' );
			expect( _translate( 'pl', { string: 'Add space' }, 3 ) ).toBe( 'Dodaj %0 spacje' );
			expect( _translate( 'pl', { string: 'Add space' }, 13 ) ).toBe( 'Dodaj %0 spacje' );
		} );

		it( 'should support a plural form rule that returns a boolean', () => {
			add( 'pl', {
				'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje' ],
				'Cancel': 'Anuluj'
			}, n => n !== 1 );

			expect( _translate( 'pl', { string: 'Add space' }, 1 ) ).toBe( 'Dodaj spację' );

			expect( _translate( 'pl', { string: 'Add space' }, 0 ) ).toBe( 'Dodaj %0 spacje' );
			expect( _translate( 'pl', { string: 'Add space' }, 3 ) ).toBe( 'Dodaj %0 spacje' );
			expect( _translate( 'pl', { string: 'Add space' }, 13 ) ).toBe( 'Dodaj %0 spacje' );
		} );

		it( 'should return a translated message based on message id when translations were passed from config', () => {
			const translations = {
				pl: {
					dictionary: {
						bold: 'Pogrubienie'
					}
				}
			};

			expect( _translate( 'pl', { string: 'bold' }, 1, translations ) ).toBe( 'Pogrubienie' );
		} );

		it( 'should throw error if quantity is not a number', () => {
			expectToThrowCKEditorError( () => {
				_translate( 'pl', { string: 'Add space' }, null );
			}, /^translation-service-quantity-not-a-number/ );
		} );
	} );

	describe( '_unifyTranslations()', () => {
		it( 'should merge two objects if array', () => {
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

			expect( _unifyTranslations( translations ) ).toEqual( {
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

		it( 'should return actual object', () => {
			const translations = {
				pl: {
					dictionary: {
						bold: 'Pogrubienie'
					}
				}
			};

			expect( _unifyTranslations( translations ) ).toEqual(
				{
					pl: {
						dictionary: {
							bold: 'Pogrubienie'
						}
					}
				}
			);
		} );

		it( 'should return undifined if undifined', () => {
			expect( _unifyTranslations( undefined ) ).toBeUndefined();
		} );
	} );

	describe( '_clear()', () => {
		it( 'should not recreate translations dictionary when it does not exist', () => {
			delete global.window.CKEDITOR_TRANSLATIONS;

			_clear();

			expect( global.window.CKEDITOR_TRANSLATIONS ).toBeUndefined();
		} );
	} );
} );
