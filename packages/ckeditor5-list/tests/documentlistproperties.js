/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( DocumentListProperties.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( DocumentListProperties.isPremiumPlugin ).to.be.false;
	} );

	it( 'should emit warning when instantiated', () => {
		sinon.stub( console, 'warn' );

		// eslint-disable-next-line no-new
		new DocumentListProperties();

		sinon.assert.calledOnce( console.warn );
		sinon.assert.calledWithExactly( console.warn,
			sinon.match( /^plugin-obsolete-documentlistproperties/ ),
			{ pluginName: 'DocumentListProperties' },
			sinon.match.string // Link to the documentation
		);
	} );
} );
