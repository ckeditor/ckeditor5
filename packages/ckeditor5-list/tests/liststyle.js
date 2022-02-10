/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console */

import ListStyle from '../src/liststyle';
import ListProperties from '../src/listproperties';

describe( 'ListStyle', () => {
	it( 'should be named', () => {
		expect( ListStyle.pluginName ).to.equal( 'ListStyle' );
	} );

	it( 'should require ListProperties', () => {
		expect( ListStyle.requires ).to.deep.equal( [ ListProperties ] );
	} );

	it( 'should emit warning when instantiated', () => {
		const expectedMessage = '`ListStyle` plugin is obsolete. Use `ListProperties` instead.';

		try {
			sinon.stub( console, 'warn' );

			// eslint-disable-next-line no-new
			new ListStyle();

			sinon.assert.calledOnce( console.warn );
			sinon.assert.calledWith( console.warn, sinon.match( expectedMessage ) );
		} finally {
			console.warn.restore();
		}
	} );
} );
