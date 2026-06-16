/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { HtmlEmbed } from '../src/htmlembed.js';
import { HtmlEmbedUI } from '../src/htmlembedui.js';
import { HtmlEmbedEditing } from '../src/htmlembedediting.js';
import { Widget } from '@ckeditor/ckeditor5-widget';

describe( 'HtmlEmbed', () => {
	it( 'should require HtmlEmbedEditing, HtmlEmbedUI and Widget', () => {
		expect( HtmlEmbed.requires ).toEqual( [ HtmlEmbedEditing, HtmlEmbedUI, Widget ] );
	} );

	it( 'should be named', () => {
		expect( HtmlEmbed.pluginName ).toBe( 'HtmlEmbed' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( HtmlEmbed.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( HtmlEmbed.isPremiumPlugin ).toBe( false );
	} );
} );
