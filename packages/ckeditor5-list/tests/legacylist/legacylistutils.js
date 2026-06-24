/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LegacyListUtils } from '../../src/legacylist/legacylistutils.js';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

describe( 'LegacyListUtils', () => {
	let editor, plugin;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ LegacyListUtils ]
		} );
		plugin = editor.plugins.get( 'LegacyListUtils' );
	} );

	it( 'should be named', () => {
		expect( LegacyListUtils.pluginName ).toBe( 'LegacyListUtils' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( LegacyListUtils.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( LegacyListUtils.isPremiumPlugin ).toBe( false );
	} );

	describe( 'coverage checks', () => {
		it( 'getListTypeFromListStyleType', () => {
			const mock = 'mock';
			expect( plugin.getListTypeFromListStyleType( mock ) ).toBe( null );
		} );

		it( 'getSelectedListItems', () => {
			expect( Array.isArray( plugin.getSelectedListItems( editor.model ) ) ).toBe( true );
		} );

		it( 'getSiblingNodes', () => {
			const position = editor.model.createPositionAt( editor.model.document.getRoot(), 0 );
			expect( Array.isArray( plugin.getSiblingNodes( position, 'forward' ) ) ).toBe( true );
		} );
	} );
} );
