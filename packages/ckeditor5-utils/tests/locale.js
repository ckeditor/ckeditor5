/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import Locale from '../src/locale';
import {
	add as addTranslations,
	_clear as clearTranslations
} from '../src/translation-service';
import { expectToThrowCKEditorError } from './_utils/utils';

describe( 'Locale', () => {
	afterEach( () => {
		clearTranslations();
		sinon.restore();
	} );

	describe( 'constructor', () => {
		it( 'sets the #language', () => {
			const locale = new Locale( {
				uiLanguage: 'pl'
			} );

			expect( locale ).to.have.property( 'uiLanguage', 'pl' );
		} );

		it( 'sets the #contentLanguage', () => {
			const locale = new Locale( {
				uiLanguage: 'pl',
				contentLanguage: 'en'
			} );

			expect( locale ).to.have.property( 'uiLanguage', 'pl' );
			expect( locale ).to.have.property( 'contentLanguage', 'en' );
		} );

		it( 'defaults #language to en', () => {
			const locale = new Locale();

			expect( locale ).to.have.property( 'uiLanguage', 'en' );
		} );

		it( 'inherits the #contentLanguage from the #language (if not passed)', () => {
			const locale = new Locale( {
				uiLanguage: 'pl'
			} );

			expect( locale ).to.have.property( 'uiLanguage', 'pl' );
			expect( locale ).to.have.property( 'contentLanguage', 'pl' );
		} );

		it( 'determines the #uiLanguageDirection', () => {
			expect( new Locale( {
				uiLanguage: 'pl'
			} ) ).to.have.property( 'uiLanguageDirection', 'ltr' );

			expect( new Locale( {
				uiLanguage: 'en'
			} ) ).to.have.property( 'uiLanguageDirection', 'ltr' );

			expect( new Locale( {
				uiLanguage: 'ar'
			} ) ).to.have.property( 'uiLanguageDirection', 'rtl' );

			expect( new Locale( {
				uiLanguage: 'fa'
			} ) ).to.have.property( 'uiLanguageDirection', 'rtl' );

			expect( new Locale( {
				uiLanguage: 'he'
			} ) ).to.have.property( 'uiLanguageDirection', 'rtl' );

			expect( new Locale( {
				uiLanguage: 'ku'
			} ) ).to.have.property( 'uiLanguageDirection', 'rtl' );

			expect( new Locale( {
				uiLanguage: 'ug'
			} ) ).to.have.property( 'uiLanguageDirection', 'rtl' );
		} );

		it( 'determines the #contentLanguageDirection (not passed)', () => {
			expect( new Locale( {
				uiLanguage: 'pl'
			} ) ).to.have.property( 'contentLanguageDirection', 'ltr' );

			expect( new Locale( {
				uiLanguage: 'en'
			} ) ).to.have.property( 'contentLanguageDirection', 'ltr' );

			expect( new Locale( {
				uiLanguage: 'ar'
			} ) ).to.have.property( 'contentLanguageDirection', 'rtl' );
		} );

		it( 'determines the #contentLanguageDirection (passed)', () => {
			expect( new Locale( {
				uiLanguage: 'pl',
				contentLanguage: 'pl'
			} ) ).to.have.property( 'contentLanguageDirection', 'ltr' );

			expect( new Locale( {
				uiLanguage: 'en',
				contentLanguage: 'ar'
			} ) ).to.have.property( 'contentLanguageDirection', 'rtl' );

			expect( new Locale( {
				uiLanguage: 'ar',
				contentLanguage: 'pl'
			} ) ).to.have.property( 'contentLanguageDirection', 'ltr' );
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

			expect( t( 'foo' ) ).to.equal( 'foo_pl' );
		} );

		it( 'should translate a message including the message string and the message context', () => {
			const t = locale.t;

			addTranslations( 'pl', {
				'foo_bar': 'foo_bar_pl'
			} );

			expect( t( { string: 'foo', context: 'bar' } ) ).to.equal( 'foo_bar_pl' );
		} );

		it( 'should translate a message supporting plural forms', () => {
			const t = locale.t;

			expect( t( { string: 'bar', plural: '%0 bars' }, [ 1 ] ), 1 ).to.equal( 'bar_pl_0' );
			expect( t( { string: 'bar', plural: '%0 bars' }, [ 2 ] ), 2 ).to.equal( '2 bar_pl_1' );
			expect( t( { string: 'bar', plural: '%0 bars' }, [ 5 ] ), 3 ).to.equal( '5 bar_pl_2' );
		} );

		it( 'should translate a message supporting plural forms with a context', () => {
			const t = locale.t;

			addTranslations( 'pl', {
				'%1 a space_Add/Remove a space': [ '%1 spację', '%1 %0 spacje', '%1 %0 spacji' ],
				'Add': 'Dodaj',
				'Remove': 'Usuń'
			} );

			const addOrRemoveSpaceMessage = { string: '%1 a space', plural: '%1 %0 spaces', context: 'Add/Remove a space' };

			expect( t( addOrRemoveSpaceMessage, [ 1, t( 'Add' ) ] ), 1 ).to.equal( 'Dodaj spację' );
			expect( t( addOrRemoveSpaceMessage, [ 2, t( 'Remove' ) ] ), 2 ).to.equal( 'Usuń 2 spacje' );
			expect( t( addOrRemoveSpaceMessage, [ 5, t( 'Add' ) ] ), 3 ).to.equal( 'Dodaj 5 spacji' );
		} );

		it( 'should interpolate a message with provided values', () => {
			const t = locale.t;

			expect( t( '%0 - %0', [ 'foo' ] ) ).to.equal( 'foo - foo' );
			expect( t( '%1 - %0 - %2', [ 'a', 'b', 'c' ] ) ).to.equal( 'b - a - c' );

			// Those test make sure that if %0 is really to be used, then it's going to work.
			// It'd be a super rare case if one would need to use %0 and at the same time interpolate something.
			expect( t( '%1 - %0 - %2' ) ).to.equal( '%1 - %0 - %2' );
			expect( t( '%1 - %0 - %2', [ 'a' ] ) ).to.equal( '%1 - a - %2' );
		} );

		it( 'should interpolate a message with a provided value (shorthand version)', () => {
			const t = locale.t;

			expect( t( 'Add %0', 'space' ) ).to.equal( 'Add space' );
			expect( t( 'Remove %0 %1', 'spaces' ) ).to.equal( 'Remove spaces %1' );

			expect( t( '%0 bar %0', 'foo' ) ).to.equal( 'foo bar foo' );
		} );

		it( 'should throw an error when a value used to determine the plural version is not a number', () => {
			const t = locale.t;

			expectToThrowCKEditorError( () => {
				t( { string: 'Add space', plural: 'Add %0 spaces' }, 'space' );
			}, /translation-service-quantity-not-a-number:/, null, { quantity: 'space' } );

			expectToThrowCKEditorError( () => {
				t( { string: 'Add space', plural: 'Add %0 spaces' }, [ 'space' ] );
			}, /translation-service-quantity-not-a-number:/, null, { quantity: 'space' } );

			expect( () => {
				t( { string: 'Add space', plural: 'Add %0 spaces' }, [ 3 ] );
				t( { string: 'Add space', plural: 'Add %0 spaces' }, 3 );
				t( { string: 'Add %1', plural: 'Add %0 %1' }, [ 3, 'spaces' ] );
				t( { string: 'Add %0' }, [ 'space' ] );
				t( { string: 'Add %0' }, 'space' );
			} ).to.not.throw();
		} );
	} );

	describe( 'language()', () => {
		it( 'should return #uiLanguage', () => {
			const stub = sinon.stub( console, 'warn' );
			const locale = new Locale();

			expect( locale.language ).to.equal( locale.uiLanguage );
			sinon.assert.calledWithMatch( stub, 'locale-deprecated-language-property' );
		} );

		it( 'should warn about deprecation', () => {
			const stub = sinon.stub( console, 'warn' );
			const locale = new Locale();

			expect( locale.language ).to.equal( 'en' );
			sinon.assert.calledWithMatch( stub, 'locale-deprecated-language-property' );
		} );
	} );
} );
