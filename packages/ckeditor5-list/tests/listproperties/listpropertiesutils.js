/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ListPropertiesUtils } from '../../src/index.js';

describe( 'ListPropertiesUtils', () => {
	let editor, plugin;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ ListPropertiesUtils ]
		} );
		plugin = editor.plugins.get( 'ListPropertiesUtils' );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( ListPropertiesUtils.pluginName ).toBe( 'ListPropertiesUtils' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListPropertiesUtils.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListPropertiesUtils.isPremiumPlugin ).toBe( false );
	} );

	describe( 'coverage checks', () => {
		it( 'getAllSupportedStyleTypes', () => {
			expect( Array.isArray( plugin.getAllSupportedStyleTypes() ) ).toBe( true );
		} );

		it( 'getListTypeFromListStyleType', () => {
			const mock = 'mock';
			expect( plugin.getListTypeFromListStyleType( mock ) ).toBe( null );
		} );

		it( 'getListStyleTypeFromTypeAttribute', () => {
			const mock = 'mock';
			expect( plugin.getListStyleTypeFromTypeAttribute( mock ) ).toBe( null );
		} );

		it( 'getTypeAttributeFromListStyleType', () => {
			const mock = 'mock';
			expect( plugin.getTypeAttributeFromListStyleType( mock ) ).toBe( null );
		} );
	} );
} );
