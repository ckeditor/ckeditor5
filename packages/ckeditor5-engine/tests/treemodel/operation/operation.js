/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import Delta from '/ckeditor5/engine/treemodel/delta/delta.js';
import Operation from '/ckeditor5/engine/treemodel/operation/operation.js';
import treeModelTestUtils from '/tests/engine/treemodel/_utils/utils.js';

describe( 'Operation', () => {
	it( 'should save its base version', () => {
		let op = new Operation( 4 );

		expect( op.baseVersion ).to.equal( 4 );
	} );

	it( 'should be correctly transformed to JSON', () => {
		let delta = new Delta();
		let opInDelta = new Operation( 0 );
		delta.addOperation( opInDelta );

		let opOutsideDelta = new Operation( 0 );

		let parsedOutside = treeModelTestUtils.jsonParseStringify( opOutsideDelta );

		expect( parsedOutside.delta ).to.be.undefined;
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const op = new Operation( 4 );

			const serialized = treeModelTestUtils.jsonParseStringify( op );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.treeModel.operation.Operation',
				baseVersion: 4
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper Operation from json object', () => {
			const op = new Operation( 4 );

			const serialized = treeModelTestUtils.jsonParseStringify( op );
			const deserialized = Operation.fromJSON( serialized );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
