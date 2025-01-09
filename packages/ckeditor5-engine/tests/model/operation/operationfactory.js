/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../../src/model/model.js';
import NoOperation from '../../../src/model/operation/nooperation.js';
import OperationFactory from '../../../src/model/operation/operationfactory.js';

describe( 'OperationFactory', () => {
	let model;

	beforeEach( () => {
		model = new Model();
	} );

	it( 'should create operation from JSON', () => {
		const operation = OperationFactory.fromJSON( {
			__className: 'NoOperation',
			baseVersion: 0
		}, model.doc );

		expect( operation ).to.instanceof( NoOperation );
		expect( operation.baseVersion ).to.equal( 0 );
	} );
} );
