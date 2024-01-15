/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
