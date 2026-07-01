/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { Observer } from '../../../src/view/observer/observer.js';
import { EditingView } from '../../../src/view/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'Observer', () => {
	describe( 'constructor()', () => {
		it( 'should create Observer with properties', () => {
			const view = new EditingView( new StylesProcessor() );
			const observer = new Observer( view );

			expect( observer ).toBeInstanceOf( Observer );
			expect( observer ).toHaveProperty( 'document' );
			expect( observer.document ).toBe( view.document );
			expect( observer ).toHaveProperty( 'isEnabled' );
			expect( observer.isEnabled ).toBe( false );
		} );
	} );

	describe( 'enable', () => {
		it( 'should set isEnabled to true', () => {
			const observer = new Observer( {} );

			expect( observer.isEnabled ).toBe( false );

			observer.enable();

			expect( observer.isEnabled ).toBe( true );
		} );
	} );

	describe( 'disable', () => {
		it( 'should set isEnabled to false', () => {
			const observer = new Observer( {} );

			observer.enable();

			expect( observer.isEnabled ).toBe( true );

			observer.disable();

			expect( observer.isEnabled ).toBe( false );
		} );
	} );

	describe( 'checkShouldIgnoreEventFromTarget()', () => {
		it( 'should not ignore on targets which are non-element node types', () => {
			const observer = new Observer( {} );

			expect( observer.checkShouldIgnoreEventFromTarget( {} ) ).toBe( false );
			expect( observer.checkShouldIgnoreEventFromTarget( { nodeType: 2 } ) ).toBe( false );
			expect( observer.checkShouldIgnoreEventFromTarget( { nodeType: 3 } ) ).toBe( false );
			expect( observer.checkShouldIgnoreEventFromTarget( { nodeType: 3, parentNode: null } ) ).toBe( false );
		} );

		it( 'should not ignore on targets without the `data-cke-ignore-events` attribute neither on itself nor in any ancestor', () => {
			const documentFragment = document.createDocumentFragment();
			const section = document.createElement( 'section' );
			const div = document.createElement( 'div' );
			const button = document.createElement( 'button' );

			documentFragment.appendChild( section ).appendChild( div ).appendChild( button );

			const observer = new Observer( {} );

			expect( observer.checkShouldIgnoreEventFromTarget( section ) ).toBe( false );
			expect( observer.checkShouldIgnoreEventFromTarget( div ) ).toBe( false );
			expect( observer.checkShouldIgnoreEventFromTarget( button ) ).toBe( false );
		} );

		it( 'should ignore on targets with the `data-cke-ignore-events` attribute set on itself or on any ancestor', () => {
			const documentFragment = document.createDocumentFragment();
			const section = document.createElement( 'section' );
			const div = document.createElement( 'div' );
			const button = document.createElement( 'button' );

			section.setAttribute( 'data-cke-ignore-events', 'true' );
			documentFragment.appendChild( section ).appendChild( div ).appendChild( button );

			const observer = new Observer( {} );

			expect( observer.checkShouldIgnoreEventFromTarget( section ) ).toBe( true );
			expect( observer.checkShouldIgnoreEventFromTarget( div ) ).toBe( true );
			expect( observer.checkShouldIgnoreEventFromTarget( button ) ).toBe( true );
		} );
	} );
} );
