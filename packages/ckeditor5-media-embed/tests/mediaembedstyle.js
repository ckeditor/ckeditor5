/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { global } from '@ckeditor/ckeditor5-utils';

import { MediaEmbed } from '../src/mediaembed.js';
import { MediaEmbedStyle } from '../src/mediaembedstyle.js';
import { MediaEmbedStyleEditing } from '../src/mediaembedstyle/mediaembedstyleediting.js';
import { MediaEmbedStyleUI } from '../src/mediaembedstyle/mediaembedstyleui.js';

describe( 'MediaEmbedStyle', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( {
				attachTo: editorElement,
				plugins: [ MediaEmbedStyle ]
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
		expect( editor.plugins.get( MediaEmbedStyle ) ).toBeInstanceOf( MediaEmbedStyle );
	} );

	it( 'should load MediaEmbedStyleEditing plugin', () => {
		expect( editor.plugins.get( MediaEmbedStyleEditing ) ).toBeInstanceOf( MediaEmbedStyleEditing );
	} );

	it( 'should load MediaEmbedStyleUI plugin', () => {
		expect( editor.plugins.get( MediaEmbedStyleUI ) ).toBeInstanceOf( MediaEmbedStyleUI );
	} );

	it( 'has proper name', () => {
		expect( MediaEmbedStyle.pluginName ).toBe( 'MediaEmbedStyle' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedStyle.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedStyle.isPremiumPlugin ).toBe( false );
	} );

	describe( 'config.mediaEmbed.styles wiring', () => {
		let configuredEditor, configuredEditorElement;

		beforeEach( async () => {
			configuredEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( configuredEditorElement );

			configuredEditor = await ClassicTestEditor.create( {
				attachTo: configuredEditorElement,
				plugins: [ MediaEmbed, MediaEmbedStyle ],
				mediaEmbed: {
					styles: {
						options: [
							{ name: 'alignBlockLeft', title: 'Left (relabeled)' },
							{
								name: 'natural',
								title: 'Natural',
								icon: 'center',
								isDefault: true
							},
							{
								name: 'side',
								title: 'Side',
								icon: '<svg/>',
								className: 'media-style-side'
							}
						]
					}
				}
			} );
		} );

		afterEach( async () => {
			configuredEditorElement.remove();
			await configuredEditor.destroy();
		} );

		it( 'honors config.mediaEmbed.styles.options end-to-end', () => {
			const editing = configuredEditor.plugins.get( MediaEmbedStyleEditing );

			expect( editing.normalizedStyles.map( s => s.name ) ).toEqual( [
				'alignBlockLeft', 'natural', 'side'
			] );
		} );

		it( 'registers only the configured buttons in the UI factory', () => {
			const factory = configuredEditor.ui.componentFactory;

			expect( factory.has( 'mediaEmbed:alignBlockLeft' ) ).toBe( true );
			expect( factory.has( 'mediaEmbed:natural' ) ).toBe( true );
			expect( factory.has( 'mediaEmbed:side' ) ).toBe( true );

			expect( factory.has( 'mediaEmbed:alignLeft' ) ).toBe( false );
			expect( factory.has( 'mediaEmbed:alignCenter' ) ).toBe( false );
			expect( factory.has( 'mediaEmbed:alignRight' ) ).toBe( false );
			expect( factory.has( 'mediaEmbed:alignBlockRight' ) ).toBe( false );
		} );

		it( 'skips both default dropdowns when their items don\'t survive the filter', () => {
			const factory = configuredEditor.ui.componentFactory;

			expect( factory.has( 'mediaEmbed:wrapText' ) ).toBe( false );
			expect( factory.has( 'mediaEmbed:breakText' ) ).toBe( false );
		} );
	} );
} );
