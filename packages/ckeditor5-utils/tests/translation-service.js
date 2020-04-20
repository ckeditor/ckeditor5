/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { _translate, add, _clear } from '../src/translation-service';

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

			expect( translatedFoo ).to.equal( 'foo_pl' );
			expect( translatedBar ).to.equal( 'bar_pl' );
		} );

		it( 'should overwrite previously added translations for the same message ids', () => {
			add( 'pl', { 'foo': 'First' } );
			add( 'pl', { 'foo': 'Second' } );

			const translatedFoo = _translate( 'pl', { string: 'foo' } );

			expect( translatedFoo ).to.equal( 'Second' );
		} );

		it( 'should set the plural form function if it is provided', () => {
			add( 'pl', {
				'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ]
			} );

			// eslint-disable-next-line no-nested-ternary
			add( 'pl', {}, n => n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && ( n % 100 < 10 || n % 100 >= 20 ) ? 1 : 2 );

			expect( _translate( 'pl', { string: 'Add space' }, 0 ) ).to.equal( 'Dodaj %0 spacji' );
			expect( _translate( 'pl', { string: 'Add space' }, 1 ) ).to.equal( 'Dodaj spację' );
			expect( _translate( 'pl', { string: 'Add space' }, 3 ) ).to.equal( 'Dodaj %0 spacje' );
			expect( _translate( 'pl', { string: 'Add space' }, 13 ) ).to.equal( 'Dodaj %0 spacji' );
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

			expect( translatedCancelPL ).to.be.equal( 'Anuluj' );
			expect( translatedCancelEN ).to.be.equal( 'Cancel' );
		} );

		it( 'should return the original message string if no translation exists for the given message', () => {
			const translatedBold = _translate( 'pl', { string: 'Bold' } );

			expect( translatedBold ).to.be.equal( 'Bold' );
		} );

		it( 'should return the correct plural form of english message if no translation exists for the given message', () => {
			const addSpaces = _translate( 'pl', { string: 'Add a space', plural: 'Add %0 spaces' }, 3 );
			const addASpace = _translate( 'pl', { string: 'Add a space', plural: 'Add %0 spaces' }, 1 );

			expect( addSpaces ).to.be.equal( 'Add %0 spaces' );
			expect( addASpace ).to.be.equal( 'Add a space' );
		} );

		it( 'should return the original message string if a translation for the target language does not exist' +
		'but translation doesn\'t', () => {
			add( 'pl', {
				'OK': 'OK',
				'Cancel': 'Anuluj'
			} );

			const translatedBold = _translate( 'pl', { string: 'Bold' } );

			expect( translatedBold ).to.be.equal( 'Bold' );
		} );

		it( 'should return a translated message when only one language is provided', () => {
			add( 'pl', {
				'OK': 'OK',
				'Cancel': 'Anuluj'
			} );

			const translatedCancel = _translate( 'de', { string: 'Cancel' } );

			expect( translatedCancel ).to.be.equal( 'Anuluj' );
		} );

		it( 'should return a translated message based on message string and message context when both are provided', () => {
			add( 'pl', {
				'foo_bar': 'foo-bar-translation'
			} );

			const translatedFooBar = _translate( 'pl', { string: 'foo', context: 'bar' } );

			expect( translatedFooBar ).to.equal( 'foo-bar-translation' );
		} );

		it( 'should return the correct plural form of the message based on the provided function', () => {
			add( 'pl', {
				'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ],
				'Cancel': 'Anuluj'
				// eslint-disable-next-line no-nested-ternary
			}, n => n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && ( n % 100 < 10 || n % 100 >= 20 ) ? 1 : 2 );

			expect( _translate( 'pl', { string: 'Add space' }, 0 ) ).to.equal( 'Dodaj %0 spacji' );
			expect( _translate( 'pl', { string: 'Add space' }, 1 ) ).to.equal( 'Dodaj spację' );
			expect( _translate( 'pl', { string: 'Add space' }, 3 ) ).to.equal( 'Dodaj %0 spacje' );
			expect( _translate( 'pl', { string: 'Add space' }, 13 ) ).to.equal( 'Dodaj %0 spacji' );
		} );

		it( 'should return a plural form based on rules for English if no function to determine the plural form was provided', () => {
			add( 'pl', {
				'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ],
				'Cancel': 'Anuluj'
			} );

			expect( _translate( 'pl', { string: 'Add space' }, 1 ) ).to.equal( 'Dodaj spację' );

			expect( _translate( 'pl', { string: 'Add space' }, 0 ) ).to.equal( 'Dodaj %0 spacje' );
			expect( _translate( 'pl', { string: 'Add space' }, 3 ) ).to.equal( 'Dodaj %0 spacje' );
			expect( _translate( 'pl', { string: 'Add space' }, 13 ) ).to.equal( 'Dodaj %0 spacje' );
		} );
	} );
} );
