/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

import Observer from '/ckeditor5/engine/view/observer/observer.js';

describe( 'Observer', () => {
	describe( 'constructor', () => {
		it( 'should create Observer with properties', () => {
			const viewDocument = {};
			const observer = new Observer( viewDocument );

			expect( observer ).to.be.an.instanceof( Observer );
			expect( observer ).to.have.property( 'document' ).that.equals( viewDocument );
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
} );
