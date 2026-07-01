/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { UnderlineEditing } from '../../src/underline/underlineediting.js';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { AttributeCommand } from '../../src/attributecommand.js';

import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

describe( 'UnderlineEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, UnderlineEditing ]
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
		expect( UnderlineEditing.pluginName ).toBe( 'UnderlineEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( UnderlineEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( UnderlineEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( UnderlineEditing ) ).toBeInstanceOf( UnderlineEditing );
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).toContainEqual( {
			label: 'Underline text',
			keystroke: 'CTRL+U'
		} );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'underline' ) ).toBe( true );
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'underline' ) ).toBe( true );
	} );

	it( 'should be marked with a formatting property', () => {
		expect( model.schema.getAttributeProperties( 'underline' ) ).toMatchObject( {
			isFormatting: true
		} );
	} );

	it( 'its attribute is marked with a copOnEnter property', () => {
		expect( model.schema.getAttributeProperties( 'underline' ) ).toMatchObject( {
			copyOnEnter: true
		} );
	} );

	describe( 'command', () => {
		it( 'should register underline command', () => {
			const command = editor.commands.get( 'underline' );

			expect( command ).toBeInstanceOf( AttributeCommand );
			expect( command ).toHaveProperty( 'attributeKey', 'underline' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <u> to underline attribute', () => {
			editor.setData( '<p><u>foo</u>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toBe( '<paragraph><$text underline="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toBe( '<p><u>foo</u>bar</p>' );
		} );

		it( 'should convert text-decoration:underline to underline attribute', () => {
			editor.setData( '<p><span style="text-decoration: underline;">foo</span>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toBe( '<paragraph><$text underline="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toBe( '<p><u>foo</u>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<u>foo</u>bar' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toBe( '<paragraph><$text underline="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toBe( '<p><u>foo</u>bar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			_setModelData( model, '<paragraph><$text underline="true">foo</$text>bar</paragraph>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe( '<p><u>foo</u>bar</p>' );
		} );
	} );
} );
