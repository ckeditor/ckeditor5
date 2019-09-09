/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import Locale from '../src/locale';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Locale', () => {
	let locale;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();
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
		it( 'has the context bound', () => {
			const t = locale.t;

			expect( t( 'Foo' ) ).to.equal( 'Foo' );
		} );

		it( 'interpolates 1 value', () => {
			const t = locale.t;

			expect( t( '%0 - %0', [ 'foo' ] ) ).to.equal( 'foo - foo' );
		} );

		it( 'interpolates 3 values', () => {
			const t = locale.t;

			expect( t( '%1 - %0 - %2', [ 'a', 'b', 'c' ] ) ).to.equal( 'b - a - c' );
		} );

		// Those test make sure that if %0 is really to be used, then it's going to work.
		// It'd be a super rare case if one would need to use %0 and at the same time interpolate something.
		it( 'does not interpolate placeholders if values not passed', () => {
			const t = locale.t;

			expect( t( '%1 - %0 - %2' ) ).to.equal( '%1 - %0 - %2' );
		} );

		it( 'does not interpolate those placeholders for which values has not been passed', () => {
			const t = locale.t;

			expect( t( '%1 - %0 - %2', [ 'a' ] ) ).to.equal( '%1 - a - %2' );
		} );
	} );

	describe( 'language()', () => {
		it( 'should return #uiLanguage', () => {
			expect( locale.language ).to.equal( locale.uiLanguage );
		} );

		it( 'should warn about deprecation', () => {
			const stub = testUtils.sinon.stub( console, 'warn' );

			expect( locale.language ).to.equal( 'en' );
			sinon.assert.calledWithMatch( stub, 'locale-deprecated-language-property' );
		} );
	} );
} );
