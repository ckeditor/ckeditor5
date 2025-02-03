/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ListPropertiesUtils } from '../../src/index.js';

describe( 'ListPropertiesUtils', () => {
	let editor, plugin;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ ListPropertiesUtils ]
		} );
		plugin = editor.plugins.get( 'ListPropertiesUtils' );
	} );

	it( 'should be named', () => {
		expect( ListPropertiesUtils.pluginName ).to.equal( 'ListPropertiesUtils' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListPropertiesUtils.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListPropertiesUtils.isPremiumPlugin ).to.be.false;
	} );

	describe( 'coverage checks', () => {
		it( 'getAllSupportedStyleTypes', () => {
			expect( plugin.getAllSupportedStyleTypes() ).to.be.an( 'array' );
		} );

		it( 'getListTypeFromListStyleType', () => {
			const mock = 'mock';
			expect( plugin.getListTypeFromListStyleType( mock ) ).to.equal( null );
		} );

		it( 'getListStyleTypeFromTypeAttribute', () => {
			const mock = 'mock';
			expect( plugin.getListStyleTypeFromTypeAttribute( mock ) ).to.equal( null );
		} );

		it( 'getTypeAttributeFromListStyleType', () => {
			const mock = 'mock';
			expect( plugin.getTypeAttributeFromListStyleType( mock ) ).to.equal( null );
		} );
	} );
} );
