/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ItalicEditing } from '../../src/italic/italicediting.js';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { AttributeCommand } from '../../src/attributecommand.js';

import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

describe( 'ItalicEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ItalicEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ItalicEditing.pluginName ).toBe( 'ItalicEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ItalicEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ItalicEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ItalicEditing ) ).toBeInstanceOf( ItalicEditing );
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).toContainEqual( {
			label: 'Italic text',
			keystroke: 'CTRL+I'
		} );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'italic' ) ).toBe( true );
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'italic' ) ).toBe( true );
	} );

	it( 'should be marked with a formatting property', () => {
		expect( model.schema.getAttributeProperties( 'italic' ) ).toEqual( expect.objectContaining( {
			isFormatting: true
		} ) );
	} );

	it( 'its attribute is marked with a copOnEnter property', () => {
		expect( model.schema.getAttributeProperties( 'italic' ) ).toEqual( expect.objectContaining( {
			copyOnEnter: true
		} ) );
	} );

	describe( 'command', () => {
		it( 'should register italic command', () => {
			const command = editor.commands.get( 'italic' );

			expect( command ).toBeInstanceOf( AttributeCommand );
			expect( command ).toHaveProperty( 'attributeKey', 'italic' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <em> to italic attribute', () => {
			editor.setData( '<p><em>foo</em>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p><i>foo</i>bar</p>' );
		} );

		it( 'should convert <i> to italic attribute', () => {
			editor.setData( '<p><i>foo</i>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p><i>foo</i>bar</p>' );
		} );

		it( 'should convert font-weight:italic to italic attribute', () => {
			editor.setData( '<p><span style="font-style: italic;">foo</span>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p><i>foo</i>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<i>foo</i>bar' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p><i>foo</i>bar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			_setModelData( model, '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual( '<p><i>foo</i>bar</p>' );
		} );
	} );
} );
