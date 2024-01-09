/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console */

import DocumentList from '../src/documentlist.js';
import List from '../src/list.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'DocumentList', () => {
	testUtils.createSinonSandbox();

	it( 'should be named', () => {
		expect( DocumentList.pluginName ).to.equal( 'DocumentList' );
	} );

	it( 'should require List', () => {
		expect( DocumentList.requires ).to.deep.equal( [ List ] );
	} );

	it( 'should emit warning when instantiated', () => {
		sinon.stub( console, 'warn' );

		// eslint-disable-next-line no-new
		new DocumentList();

		sinon.assert.calledOnce( console.warn );
		sinon.assert.calledWithExactly( console.warn,
			sinon.match( /^plugin-obsolete-documentlist/ ),
			{ pluginName: 'DocumentList' },
			sinon.match.string // Link to the documentation
		);
	} );
} );
