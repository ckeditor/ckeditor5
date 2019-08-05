/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Locale from '../src/locale';

describe( 'Locale', () => {
	let locale;

	beforeEach( () => {
		locale = new Locale();
	} );

	describe( 'constructor', () => {
		it( 'sets the #language', () => {
			const locale = new Locale( 'pl' );

			expect( locale ).to.have.property( 'language', 'pl' );
		} );

		it( 'sets the #contentLanguage', () => {
			const locale = new Locale( 'pl', 'en' );

			expect( locale ).to.have.property( 'language', 'pl' );
			expect( locale ).to.have.property( 'contentLanguage', 'en' );
		} );

		it( 'defaults #language to en', () => {
			const locale = new Locale();

			expect( locale ).to.have.property( 'language', 'en' );
		} );

		it( 'inherits the #contentLanguage from the #language (if not passed)', () => {
			const locale = new Locale( 'pl' );

			expect( locale ).to.have.property( 'language', 'pl' );
			expect( locale ).to.have.property( 'contentLanguage', 'pl' );
		} );

		it( 'determines the #languageDirection', () => {
			expect( new Locale( 'pl' ) ).to.have.property( 'languageDirection', 'ltr' );
			expect( new Locale( 'en' ) ).to.have.property( 'languageDirection', 'ltr' );

			expect( new Locale( 'ar' ) ).to.have.property( 'languageDirection', 'rtl' );
			expect( new Locale( 'fa' ) ).to.have.property( 'languageDirection', 'rtl' );
			expect( new Locale( 'he' ) ).to.have.property( 'languageDirection', 'rtl' );
			expect( new Locale( 'ku' ) ).to.have.property( 'languageDirection', 'rtl' );
			expect( new Locale( 'ug' ) ).to.have.property( 'languageDirection', 'rtl' );
		} );

		it( 'determines the #contentLanguageDirection (not passed)', () => {
			expect( new Locale( 'pl' ) ).to.have.property( 'contentLanguageDirection', 'ltr' );
			expect( new Locale( 'en' ) ).to.have.property( 'contentLanguageDirection', 'ltr' );
			expect( new Locale( 'ar' ) ).to.have.property( 'contentLanguageDirection', 'rtl' );
		} );

		it( 'determines the #contentLanguageDirection (passed)', () => {
			expect( new Locale( 'pl', 'pl' ) ).to.have.property( 'contentLanguageDirection', 'ltr' );
			expect( new Locale( 'en', 'ar' ) ).to.have.property( 'contentLanguageDirection', 'rtl' );
			expect( new Locale( 'ar', 'pl' ) ).to.have.property( 'contentLanguageDirection', 'ltr' );
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
} );
