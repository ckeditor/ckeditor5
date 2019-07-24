/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ContentNormalizer from '../src/contentnormalizer';
import { createDataTransfer } from './_utils/utils';

describe( 'ContentNormalizer', () => {
	let normalizer, sinonTrigger;
	const templateData = {
		dataTransfer: createDataTransfer( {
			'text/html': 'test data'
		} )
	};

	testUtils.createSinonSandbox();

	beforeEach( () => {
		sinonTrigger = sinon.fake.returns( true );

		normalizer = new ContentNormalizer( {
			activationTrigger: sinonTrigger
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should have assigned activation trigger', () => {
			expect( normalizer.activationTrigger ).to.be.a( 'function' );
			expect( normalizer.activationTrigger ).to.equal( sinonTrigger );
		} );
	} );

	describe( 'transform()', () => {
		let data;

		beforeEach( () => {
			data = Object.assign( {}, templateData );
		} );

		describe( 'valid data', () => {
			it( 'should mark data as transformed', () => {
				expect( data.isTransformedWithPasteFromOffice ).to.be.undefined;

				normalizer.transform( data );

				expect( data.isTransformedWithPasteFromOffice ).to.be.true;
			} );

			it( 'should call for activation trigger to check input data', () => {
				sinon.assert.notCalled( sinonTrigger );

				normalizer.transform( data );

				sinon.assert.calledOnce( sinonTrigger );
				sinon.assert.calledWith( sinonTrigger, 'test data' );
			} );

			it( 'should execute filters over data', () => {
				const filter = sinon.fake();

				normalizer.addFilter( filter );
				normalizer.transform( data );

				sinon.assert.calledOnce( filter );
				sinon.assert.calledWith( filter, { data } );
			} );

			it( 'should not process again already transformed data', () => {
				const filter = sinon.fake();

				// Filters should not be executed
				data.isTransformedWithPasteFromOffice = true;

				normalizer.addFilter( filter );
				normalizer.transform( data );

				sinon.assert.notCalled( filter );
			} );
		} );

		describe( 'invalid data', () => {
			let normalizer, sinonTrigger;

			beforeEach( () => {
				sinonTrigger = sinon.fake.returns( false );

				normalizer = new ContentNormalizer( { activationTrigger: sinonTrigger } );
			} );

			it( 'should not change data content', () => {
				normalizer.transform( data );

				expect( data.isTransformedWithPasteFromOffice ).to.be.undefined;
				expect( data ).to.deep.equal( templateData );
			} );

			it( 'should not fire any filter', () => {
				const filter = sinon.fake();

				normalizer.addFilter( filter );
				normalizer.transform( data );

				expect( normalizer._filters.size ).to.equal( 1 );
				sinon.assert.notCalled( filter );
			} );
		} );
	} );

	describe( 'addFilter()', () => {
		let filter;

		beforeEach( () => {
			filter = {
				exec: () => {}
			};

			normalizer.addFilter( filter );
		} );

		it( 'should add filter to fullContentFilters set', () => {
			expect( normalizer._filters.size ).to.equal( 1 );

			const firstFilter = [ ...normalizer._filters ][ 0 ];
			expect( firstFilter ).to.equal( filter );
		} );
	} );
} );
