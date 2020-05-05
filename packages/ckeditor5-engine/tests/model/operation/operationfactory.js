/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../../src/model/model';
import NoOperation from '../../../src/model/operation/nooperation';
import OperationFactory from '../../../src/model/operation/operationfactory';

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
