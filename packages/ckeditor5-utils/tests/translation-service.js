/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { translate, define, _clear } from '../src/translation-service';

describe( 'translationService', () => {
	beforeEach( () => {
		_clear();
	} );

	it( 'should return english string if no translation exists', () => {
		const translation = translate( 'pl', 'Bold' );

		expect( translation ).to.be.equal( 'Bold' );
	} );

	it( 'should return english string without context if no translation exists', () => {
		const translation = translate( 'pl', 'Bold [context: bold]' );

		expect( translation ).to.be.equal( 'Bold' );
	} );

	it( 'should return translation if the translation for the concrete language is defined', () => {
		define( 'pl', {
			'OK': 'OK',
			'Cancel [context: reject]': 'Anuluj'
		} );

		const translation = translate( 'pl', 'Cancel [context: reject]' );

		expect( translation ).to.be.equal( 'Anuluj' );
	} );

	it( 'should return english string without context if the translations for the concrete language exist, but translation doesn\'t', () => {
		define( 'pl', {
			'OK': 'OK',
			'Cancel [context: reject]': 'Anuluj'
		} );

		const translation = translate( 'pl', 'Bold [context: bold]' );

		expect( translation ).to.be.equal( 'Bold' );
	} );

	it( 'should be able to merge translations', () => {
		define( 'pl', {
			'OK': 'OK',
			'Cancel [context: reject]': 'Anuluj'
		} );

		define( 'en_US', {
			'OK': 'OK',
			'Cancel [context: reject]': 'Cancel'
		} );

		const translationPL = translate( 'pl', 'Cancel [context: reject]' );
		const translationEN = translate( 'en', 'Cancel [context: reject]' );

		expect( translationPL ).to.be.equal( 'Anuluj' );
		expect( translationEN ).to.be.equal( 'Cancel' );
	} );
} );
