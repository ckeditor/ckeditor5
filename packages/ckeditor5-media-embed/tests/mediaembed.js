/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { MediaEmbed } from '../src/mediaembed.js';
import { MediaEmbedEditing } from '../src/mediaembedediting.js';
import { MediaEmbedUI } from '../src/mediaembedui.js';
import { AutoMediaEmbed } from '../src/automediaembed.js';
import { Widget } from '@ckeditor/ckeditor5-widget';
import { global } from '@ckeditor/ckeditor5-utils';

describe( 'MediaEmbed', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ MediaEmbed ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( MediaEmbed ) ).toBeInstanceOf( MediaEmbed );
	} );

	it( 'should load MediaEmbedEditing plugin', () => {
		expect( editor.plugins.get( MediaEmbedEditing ) ).toBeInstanceOf( MediaEmbedEditing );
	} );

	it( 'should load Widget plugin', () => {
		expect( editor.plugins.get( Widget ) ).toBeInstanceOf( Widget );
	} );

	it( 'should load MediaEmbedUI plugin', () => {
		expect( editor.plugins.get( MediaEmbedUI ) ).toBeInstanceOf( MediaEmbedUI );
	} );

	it( 'should load AutoMediaEmbed plugin', () => {
		expect( editor.plugins.get( AutoMediaEmbed ) ).toBeInstanceOf( AutoMediaEmbed );
	} );

	it( 'has proper name', () => {
		expect( MediaEmbed.pluginName ).toBe( 'MediaEmbed' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbed.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbed.isPremiumPlugin ).toBe( false );
	} );
} );
