/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../../src/model/model';
import NoOperation from '../../../src/model/operation/nooperation';

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

	describe( 'is()', () => {
		it( 'should return true for all valid names of "no" operation', () => {
			expect( noop.is( 'operation' ) ).to.be.true;
			expect( noop.is( 'model:operation' ) ).to.be.true;
			expect( noop.is( 'noOperation' ) ).to.be.true;
			expect( noop.is( 'model:operation:no' ) ).to.be.true;
		} );

		it( 'should return false for invalid parameters', () => {
			expect( noop.is( 'operation:no' ) ).to.be.false;
			expect( noop.is( 'model:operation:insert' ) ).to.be.false;
			expect( noop.is( 'attributeOperation' ) ).to.be.false;
			expect( noop.is( 'detachOperation' ) ).to.be.false;
			expect( noop.is( 'rootAttributeOperation' ) ).to.be.false;
			expect( noop.is( 'model:operation:rootAttribute' ) ).to.be.false;
		} );
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
