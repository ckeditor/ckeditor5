/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../../src/model/model.js';
import NoOperation from '../../../src/model/operation/nooperation.js';

describe( 'NoOperation', () => {
	let model, noop, doc;

	beforeEach( () => {
		noop = new NoOperation( 0 );
		model = new Model();
		doc = model.document;
	} );

	it( 'should not throw an error when applied', () => {
		expect( () => model.applyOperation( noop ) ).to.not.throw( Error );
	} );

	it( 'should create a NoOperation as a reverse', () => {
		const reverse = noop.getReversed();

		expect( reverse ).to.be.an.instanceof( NoOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
	} );

	it( 'should create NoOperation having same parameters when cloned', () => {
		const clone = noop.clone();

		expect( clone ).to.be.an.instanceof( NoOperation );
		expect( clone.baseVersion ).to.equal( 0 );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const serialized = noop.toJSON();

			expect( serialized ).to.deep.equal( {
				__className: 'NoOperation',
				baseVersion: 0
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper NoOperation from json object', () => {
			const serialized = noop.toJSON();
			const deserialized = NoOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( noop );
		} );
	} );
} );
