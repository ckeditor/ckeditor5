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
		it( 'should be not active at start', () => {
			expect( normalizer.isActive ).to.be.false;
		} );

		it( 'should not have assigned data', () => {
			expect( normalizer.data ).to.be.null;
		} );

		it( 'should have assigned activation trigger', () => {
			expect( normalizer.activationTrigger ).to.be.a( 'function' );
			expect( normalizer.activationTrigger ).to.equal( sinonTrigger );
		} );

		it( 'should initialize sets for filters', () => {
			expect( normalizer._filters ).to.be.a( 'set' );
			expect( normalizer._fullContentFilters ).to.be.a( 'set' );
		} );
	} );

	describe( 'setInputData()', () => {
		let data;

		beforeEach( () => {
			data = Object.assign( {}, templateData );
		} );

		describe( 'trigger activated', () => {
			beforeEach( () => {
				normalizer.setInputData( data );
			} );

			it( 'should set data', () => {
				expect( normalizer.data ).to.equal = data;
			} );

			it( 'should check if activates normalizer', () => {
				sinon.assert.calledOnce( sinonTrigger );
				sinon.assert.calledWith( sinonTrigger, 'test data' );

				expect( normalizer.isActive ).to.be.true;
			} );

			it( 'should add flag to data processed by paste from office plugin', () => {
				expect( data.isTransformedWithPasteFromOffice ).to.be.false;
			} );
		} );

		describe( 'trigger not activated', () => {
			beforeEach( () => {
				sinonTrigger = sinon.fake.returns( false );

				normalizer = new ContentNormalizer( {
					activationTrigger: sinonTrigger
				} );

				normalizer.setInputData( data );
			} );

			it( 'should not be active', () => {
				sinon.assert.calledOnce( sinonTrigger );
				sinon.assert.calledWith( sinonTrigger, 'test data' );

				expect( normalizer.isActive ).to.be.false;
			} );

			it( 'should not keep reference to data when is not active', () => {
				expect( normalizer.data ).to.be.null;
			} );

			it( 'should not add flag to not processed data', () => {
				expect( data.isTransformedWithPasteFromOffice ).to.be.undefined;
			} );
		} );

		describe( 'already processed data', () => {
			beforeEach( () => {
				data.isTransformedWithPasteFromOffice = true;

				normalizer.addFilter( {
					fullContent: true,
					// eslint-disable-next-line no-unused-vars
					exec: d => { d = {}; }
				} );
			} );

			it( 'should not change data', () => {
				normalizer.setInputData( data );

				expect( data.isTransformedWithPasteFromOffice ).to.be.true;
				expect( data ).to.deep.include( templateData );
			} );
		} );
	} );

	describe( 'addFilter()', () => {
		let filter;
		describe( 'fullContentFilters', () => {
			beforeEach( () => {
				filter = {
					fullContent: true,
					exec: () => {}
				};

				normalizer.addFilter( filter );
			} );

			it( 'should add filter to fullContentFilters set', () => {
				expect( normalizer._fullContentFilters.size ).to.equal( 1 );
				expect( normalizer._filters.size ).to.equal( 0 );

				const firstFilter = [ ...normalizer._fullContentFilters ][ 0 ];
				expect( firstFilter ).to.equal( filter );
			} );
		} );
	} );

	describe( 'exec()', () => {
		let data, filter;
		beforeEach( () => {
			data = Object.assign( {}, templateData );
			filter = {
				fullContent: true,
				exec: data => {
					data.content = 'Foo bar baz.';
				}
			};

			normalizer.addFilter( filter );
		} );

		it( 'should apply filter#exec to data', () => {
			normalizer.setInputData( data );

			expect( data.content ).to.be.undefined;

			normalizer.exec();

			expect( data.content ).to.equal( 'Foo bar baz.' );
		} );

		it( 'should mark data as processed with paste from office', () => {
			normalizer.setInputData( data );

			expect( data.isTransformedWithPasteFromOffice ).to.be.false;

			normalizer.exec();

			expect( data.isTransformedWithPasteFromOffice ).to.be.true;
		} );

		describe( 'already processed data', () => {
			let execFake;
			beforeEach( () => {
				execFake = sinon.fake();
				normalizer = new ContentNormalizer( { activationTrigger: () => true } );

				normalizer.addFilter( {
					fullContent: true,
					exec: execFake
				} );
			} );

			it( 'should not apply filter on already processed data', () => {
				normalizer.setInputData( data );

				sinon.assert.notCalled( execFake );
				expect( data.isTransformedWithPasteFromOffice ).to.be.false;

				normalizer.exec();
				sinon.assert.calledOnce( execFake );
				sinon.assert.calledWith( execFake, data );
				expect( data.isTransformedWithPasteFromOffice ).to.be.true;

				normalizer.exec();
				sinon.assert.calledOnce( execFake );
			} );
		} );

		describe( 'normalizer without filter', () => {
			beforeEach( () => {
				normalizer = new ContentNormalizer( { activationTrigger: () => true } );
			} );

			it( 'should do nothing with data', () => {
				normalizer.setInputData( data );

				expect( data ).to.deep.include( templateData );
				expect( data.isTransformedWithPasteFromOffice ).to.be.false;

				normalizer.exec();

				expect( data ).to.deep.include( templateData );
				expect( data.isTransformedWithPasteFromOffice ).to.be.true;
			} );
		} );
	} );
} );
