/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import schemaDefinitions from '../src/schemadefinitions';

describe( 'schemadefinitions', () => {
	it( 'should be an object', () => {
		// Sanity check if object exists. We will add test coverage later.
		expect( schemaDefinitions ).to.be.an( 'object' );
		expect( schemaDefinitions.block ).to.be.an( 'array' );
		expect( schemaDefinitions.inline ).to.be.an( 'array' );
	} );
} );
