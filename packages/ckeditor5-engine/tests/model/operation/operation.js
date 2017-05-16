/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Delta from '../../../src/model/delta/delta';
import Operation from '../../../src/model/operation/operation';
import { jsonParseStringify } from '../../../tests/model/_utils/utils';

describe( 'Operation', () => {
	it( 'should save its base version', () => {
		const op = new Operation( 4 );

		expect( op.baseVersion ).to.equal( 4 );
	} );

	it( 'should be correctly transformed to JSON', () => {
		const delta = new Delta();
		const opInDelta = new Operation( 0 );
		delta.addOperation( opInDelta );

		const opOutsideDelta = new Operation( 0 );

		const parsedOutside = jsonParseStringify( opOutsideDelta );

		expect( parsedOutside.delta ).to.be.undefined;
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const op = new Operation( 4 );

			const serialized = jsonParseStringify( op );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.model.operation.Operation',
				baseVersion: 4
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper Operation from json object', () => {
			const op = new Operation( 4 );

			const serialized = jsonParseStringify( op );
			const deserialized = Operation.fromJSON( serialized );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
