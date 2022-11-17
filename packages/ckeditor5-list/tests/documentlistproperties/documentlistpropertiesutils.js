/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { DocumentListPropertiesUtils } from '../../src';

describe( 'DocumentListPropertiesUtils', () => {
	let editor, plugin;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ DocumentListPropertiesUtils ]
		} );
		plugin = editor.plugins.get( 'DocumentListPropertiesUtils' );
	} );

	it( 'should be named', () => {
		expect( DocumentListPropertiesUtils.pluginName ).to.equal( 'DocumentListPropertiesUtils' );
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
