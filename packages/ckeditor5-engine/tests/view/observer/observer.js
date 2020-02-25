/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Observer from '../../../src/view/observer/observer';
import View from '../../../src/view/view';
import { StylesProcessor } from '../../../src/view/stylesmap';

describe( 'Observer', () => {
	let stylesProcessor;

	beforeEach( () => {
		stylesProcessor = new StylesProcessor();
	} );

	describe( 'constructor()', () => {
		it( 'should create Observer with properties', () => {
			const view = new View( stylesProcessor );
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
} );
