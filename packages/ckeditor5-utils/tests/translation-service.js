/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { translate, add, _clear } from '../src/translation-service';

describe( 'translation-service', () => {
	afterEach( () => {
		_clear();
	} );

	describe( 'add()', () => {
		it( 'should merge translation added several times', () => {
			add( 'pl', { 'foo': 'foo_pl' } );
			add( 'pl', { 'bar': 'bar_pl' } );

			const translatedFoo = translate( 'pl', { string: 'foo' } );
			const translatedBar = translate( 'pl', { string: 'bar' } );

			expect( translatedFoo ).to.equal( 'foo_pl' );
			expect( translatedBar ).to.equal( 'bar_pl' );
		} );

		it( 'should overwrite previously added translations for the same message ids', () => {
			add( 'pl', { 'foo': 'First' } );
			add( 'pl', { 'foo': 'Second' } );

			const translatedFoo = translate( 'pl', { string: 'foo' } );

			expect( translatedFoo ).to.equal( 'Second' );
		} );

		it( 'should set the plural form function if it is provided', () => {
			add( 'pl', {
				'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ],
			} );

			add( 'pl', {}, n => n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && ( n % 100 < 10 || n % 100 >= 20 ) ? 1 : 2 );

			expect( translate( 'pl', 'Add space', 0 ) ).to.equal( 'Dodaj %0 spacji' );
			expect( translate( 'pl', 'Add space', 1 ) ).to.equal( 'Dodaj spację' );
			expect( translate( 'pl', 'Add space', 3 ) ).to.equal( 'Dodaj %0 spacje' );
			expect( translate( 'pl', 'Add space', 13 ) ).to.equal( 'Dodaj %0 spacji' );
		} );
	} );

	describe( 'translate()', () => {
		it( 'should return the message string if no translation exists', () => {
			const translatedBold = translate( 'pl', { string: 'Bold' } );

			expect( translatedBold ).to.be.equal( 'Bold' );
		} );

		it( 'should return a translation if it is defined in the target language dictionary', () => {
			add( 'pl', {
				'OK': 'OK',
				'Cancel': 'Anuluj'
			} );

			const translatedCancel = translate( 'pl', { string: 'Cancel' } );

			expect( translatedCancel ).to.be.equal( 'Anuluj' );
		} );

		it( 'should return the message string if a translation for the target language does not exist' +
			'but translation doesn\'t', () => {
				add( 'pl', {
					'OK': 'OK',
					'Cancel': 'Anuluj'
				} );

				const translatedBold = translate( 'pl', { string: 'Bold' } );

				expect( translatedBold ).to.be.equal( 'Bold' );
			} );

		it( 'should return a translated message when only one language is provided', () => {
			add( 'pl', {
				'OK': 'OK',
				'Cancel': 'Anuluj'
			} );

			const translatedCancel = translate( 'de', { string: 'Cancel' } );

			expect( translatedCancel ).to.be.equal( 'Anuluj' );
		} );

		it( 'should return translated messages when translations are defined', () => {
			add( 'pl', {
				'OK': 'OK',
				'Cancel': 'Anuluj'
			} );

			add( 'en_US', {
				'OK': 'OK',
				'Cancel': 'Cancel'
			} );

			const translatedCancelPL = translate( 'pl', { string: 'Cancel' } );
			const translatedCancelEN = translate( 'en', { string: 'Cancel' } );

			expect( translatedCancelPL ).to.be.equal( 'Anuluj' );
			expect( translatedCancelEN ).to.be.equal( 'Cancel' );
		} );

		it( 'should construct message id from message string and message context when both are provided', () => {
			add( 'pl', {
				'foo_bar': 'foo-bar-translation',
			} );

			const translatedFooBar = translate( 'pl', { string: 'foo', context: 'bar' } );

			expect( translatedFooBar ).to.equal( 'foo-bar-translation' );
		} );

		it( 'should support a deprecated form of using translate() function with string as a message', () => {
			add( 'pl', {
				'OK': 'OK',
				'Cancel': 'Anuluj'
			} );

			const translation = translate( 'pl', 'Cancel' );

			expect( translation ).to.equal( 'Anuluj' );
		} );

		it( 'should return the correct plural form of the translation', () => {
			add( 'pl', {
				'Add space': [ 'Dodaj spację', 'Dodaj %0 spacje', 'Dodaj %0 spacji' ],
				'Cancel': 'Anuluj'
			}, n => n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && ( n % 100 < 10 || n % 100 >= 20 ) ? 1 : 2 );

			expect( translate( 'pl', 'Add space', 0 ) ).to.equal( 'Dodaj %0 spacji' );
			expect( translate( 'pl', 'Add space', 1 ) ).to.equal( 'Dodaj spację' );
			expect( translate( 'pl', 'Add space', 3 ) ).to.equal( 'Dodaj %0 spacje' );
			expect( translate( 'pl', 'Add space', 13 ) ).to.equal( 'Dodaj %0 spacji' );
		} );
	} );
} );
