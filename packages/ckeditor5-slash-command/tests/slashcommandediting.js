/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import SlashCommandEditing from '../src/slashcommandediting';

describe( 'SlashCommandEditing', () => {
	it( 'should have pluginName property', () => {
		expect( SlashCommandEditing.pluginName ).to.equal( 'SlashCommandEditing' );
	} );
} );
