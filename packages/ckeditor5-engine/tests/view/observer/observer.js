/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Observer from '../../../src/view/observer/observer.js';
import View from '../../../src/view/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'Observer', () => {
	describe( 'constructor()', () => {
		it( 'should create Observer with properties', () => {
			const view = new View( new StylesProcessor() );
			const observer = new Observer( view );

			expect( observer ).to.be.an.instanceof( Observer );
			expect( observer ).to.have.property( 'document' ).that.equals( view.document );
			expect( observer ).to.have.property( 'isEnabled' ).that.is.false;
		} );
	} );

	describe( 'enable', () => {
		it( 'should set isEnabled to true', () => {
			const observer = new Observer( {} );

			expect( observer.isEnabled ).to.be.false;

			observer.enable();

			expect( observer.isEnabled ).to.be.true;
		} );
	} );

	describe( 'disable', () => {
		it( 'should set isEnabled to false', () => {
			const observer = new Observer( {} );

			observer.enable();

			expect( observer.isEnabled ).to.be.true;

			observer.disable();

			expect( observer.isEnabled ).to.be.false;
		} );
	} );

	describe( 'checkShouldIgnoreEventFromTarget()', () => {
		it( 'should not ignore on targets which are non-element node types', () => {
			const observer = new Observer( {} );

			expect( observer.checkShouldIgnoreEventFromTarget( {} ) ).to.be.false;
			expect( observer.checkShouldIgnoreEventFromTarget( { nodeType: 2 } ) ).to.be.false;
			expect( observer.checkShouldIgnoreEventFromTarget( { nodeType: 3 } ) ).to.be.false;
			expect( observer.checkShouldIgnoreEventFromTarget( { nodeType: 3, parentNode: null } ) ).to.be.false;
		} );

		it( 'should not ignore on targets without the `data-cke-ignore-events` attribute neither on itself nor in any ancestor', () => {
			const documentFragment = document.createDocumentFragment();
			const section = document.createElement( 'section' );
			const div = document.createElement( 'div' );
			const button = document.createElement( 'button' );

			documentFragment.appendChild( section ).appendChild( div ).appendChild( button );

			const observer = new Observer( {} );

			expect( observer.checkShouldIgnoreEventFromTarget( section ) ).to.be.false;
			expect( observer.checkShouldIgnoreEventFromTarget( div ) ).to.be.false;
			expect( observer.checkShouldIgnoreEventFromTarget( button ) ).to.be.false;
		} );

		it( 'should ignore on targets with the `data-cke-ignore-events` attribute set on itself or on any ancestor', () => {
			const documentFragment = document.createDocumentFragment();
			const section = document.createElement( 'section' );
			const div = document.createElement( 'div' );
			const button = document.createElement( 'button' );

			section.setAttribute( 'data-cke-ignore-events', 'true' );
			documentFragment.appendChild( section ).appendChild( div ).appendChild( button );

			const observer = new Observer( {} );

			expect( observer.checkShouldIgnoreEventFromTarget( section ) ).to.be.true;
			expect( observer.checkShouldIgnoreEventFromTarget( div ) ).to.be.true;
			expect( observer.checkShouldIgnoreEventFromTarget( button ) ).to.be.true;
		} );
	} );
} );
