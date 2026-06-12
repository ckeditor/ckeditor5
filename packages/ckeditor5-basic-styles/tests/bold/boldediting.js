/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { BoldEditing } from '../../src/bold/boldediting.js';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { AttributeCommand } from '../../src/attributecommand.js';

import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { keyCodes, env } from '@ckeditor/ckeditor5-utils';

describe( 'BoldEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, BoldEditing ]
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
		expect( BoldEditing.pluginName ).toBe( 'BoldEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( BoldEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( BoldEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( BoldEditing ) ).toBeInstanceOf( BoldEditing );
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).toContainEqual( {
			label: 'Bold text',
			keystroke: 'CTRL+B'
		} );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'bold' ) ).toBe( true );
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'bold' ) ).toBe( true );
	} );

	it( 'should be marked with a formatting property', () => {
		expect( model.schema.getAttributeProperties( 'bold' ) ).toEqual( expect.objectContaining( {
			isFormatting: true
		} ) );
	} );

	it( 'its attribute is marked with a copOnEnter property', () => {
		expect( model.schema.getAttributeProperties( 'bold' ) ).toEqual( expect.objectContaining( {
			copyOnEnter: true
		} ) );
	} );

	it( 'should set editor keystroke', () => {
		const spy = vi.spyOn( editor, 'execute' );
		const keyEventData = {
			keyCode: keyCodes.b,
			ctrlKey: !env.isMac,
			metaKey: env.isMac,
			preventDefault: vi.fn(),
			stopPropagation: vi.fn()
		};

		const wasHandled = editor.keystrokes.press( keyEventData );

		expect( wasHandled ).toBe( true );
		expect( spy ).toHaveBeenCalledOnce();
		expect( keyEventData.preventDefault ).toHaveBeenCalledOnce();
	} );

	describe( 'command', () => {
		it( 'should register bold command', () => {
			const command = editor.commands.get( 'bold' );

			expect( command ).toBeInstanceOf( AttributeCommand );
			expect( command ).toHaveProperty( 'attributeKey', 'bold' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <strong> to bold attribute', () => {
			editor.setData( '<p><strong>foo</strong>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p><strong>foo</strong>bar</p>' );
		} );

		it( 'should convert <b> to bold attribute', () => {
			editor.setData( '<p><b>foo</b>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p><strong>foo</strong>bar</p>' );
		} );

		it( 'should convert font-weight:bold to bold attribute', () => {
			editor.setData( '<p><span style="font-weight: bold;">foo</span>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p><strong>foo</strong>bar</p>' );
		} );

		it( 'should convert font-weight defined as number to bold attribute (if the value is higher or equal to 600)', () => {
			editor.setData( '<p><span style="font-weight: 600;">foo</span>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p><strong>foo</strong>bar</p>' );
		} );

		it( 'should not convert font-weight defined as number to bold attribute (if the value is lower than 600)', () => {
			editor.setData( '<p><span style="font-weight: 500;">foo</span>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p>foobar</p>' );
		} );

		it( 'should not convert font-weight if the value is invalid', () => {
			editor.setData( '<p><span style="font-weight: foo;">foo</span>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p>foobar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<strong>foo</strong>bar' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p><strong>foo</strong>bar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			_setModelData( model, '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual( '<p><strong>foo</strong>bar</p>' );
		} );
	} );
} );
