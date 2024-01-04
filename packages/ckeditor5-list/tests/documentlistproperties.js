/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console */

import DocumentListProperties from '../src/documentlistproperties.js';
import ListProperties from '../src/listproperties.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'DocumentListProperties', () => {
	testUtils.createSinonSandbox();

	it( 'should be named', () => {
		expect( DocumentListProperties.pluginName ).to.equal( 'DocumentListProperties' );
	} );

	it( 'should require ListPropertiesEditing and ListPropertiesUI', () => {
		expect( DocumentListProperties.requires ).to.deep.equal( [ ListProperties ] );
	} );

	it( 'should emit warning when instantiated', () => {
		const expectedMessage = '`DocumentListProperties` plugin is obsolete. Use `ListProperties` instead.';

		sinon.stub( console, 'warn' );

		// eslint-disable-next-line no-new
		new DocumentListProperties();

		sinon.assert.calledOnce( console.warn );
		sinon.assert.calledWith( console.warn, sinon.match( expectedMessage ) );
	} );
} );
