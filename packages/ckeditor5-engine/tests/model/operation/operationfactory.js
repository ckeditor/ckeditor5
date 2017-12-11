/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import NoOperation from '../../../src/model/operation/nooperation';
import OperationFactory from '../../../src/model/operation/operationfactory';

describe( 'OperationFactory', () => {
	let doc;

	beforeEach( () => {
		doc = new Document();
	} );

	it( 'should create operation from JSON', () => {
		const operation = OperationFactory.fromJSON( {
			__className: 'engine.model.operation.NoOperation',
			baseVersion: 0
		}, doc );

		expect( operation ).to.instanceof( NoOperation );
		expect( operation.baseVersion ).to.equal( 0 );
	} );
} );
