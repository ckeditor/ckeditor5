/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { CodeEditing } from '../../src/code/codeediting.js';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { AttributeCommand } from '../../src/attributecommand.js';

import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { keyCodes } from '@ckeditor/ckeditor5-utils';

describe( 'CodeEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, CodeEditing ]
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
		expect( CodeEditing.pluginName ).toBe( 'CodeEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CodeEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CodeEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CodeEditing ) ).toBeInstanceOf( CodeEditing );
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).toContainEqual( {
			label: 'Move out of an inline code style',
			keystroke: [
				[ 'arrowleft', 'arrowleft' ],
				[ 'arrowright', 'arrowright' ]
			]
		} );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'code' ) ).toBe( true );
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'code' ) ).toBe( true );
	} );

	it( 'should be marked with a formatting property', () => {
		expect( model.schema.getAttributeProperties( 'code' ) ).toEqual( expect.objectContaining( {
			isFormatting: true
		} ) );
	} );

	it( 'its attribute is marked with a copOnEnter property', () => {
		expect( model.schema.getAttributeProperties( 'code' ) ).toEqual( expect.objectContaining( {
			copyOnEnter: false
		} ) );
	} );

	describe( 'command', () => {
		it( 'should register code command', () => {
			const command = editor.commands.get( 'code' );

			expect( command ).toBeInstanceOf( AttributeCommand );
			expect( command ).toHaveProperty( 'attributeKey', 'code' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <code> to code attribute', () => {
			editor.setData( '<p><code>foo</code>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph><$text code="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p><code>foo</code>bar</p>' );
		} );

		// See: https://github.com/ckeditor/ckeditor5/issues/17789
		it( 'should not convert word-wrap:break-word to code attribute', () => {
			editor.setData( '<p><span style="word-wrap: break-word">foo</span>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p>foobar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<code>foo</code>bar' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toEqual( '<paragraph><$text code="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).toEqual( '<p><code>foo</code>bar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			_setModelData( model, '<paragraph><$text code="true">foo</$text>bar</paragraph>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual( '<p><code>foo</code>bar</p>' );
		} );
	} );

	it( 'should add `ck-code_selected` class when caret enters the element', () => {
		// Put selection before the link element.
		_setModelData( editor.model, '<paragraph>foo[]<$text code="true">ba</$text>r</paragraph>' );

		// So let's simulate the `keydown` event.
		editor.editing.view.document.fire( 'keydown', {
			keyCode: keyCodes.arrowright,
			preventDefault: () => {},
			domTarget: document.body
		} );

		expect( _getViewData( editor.editing.view ) ).toEqual(
			'<p>foo<code class="ck-code_selected">{}ba</code>r</p>'
		);
	} );

	it( 'should remove `ck-code_selected` class when caret leaves the element', () => {
		// Put selection before the link element.
		_setModelData( editor.model, '<paragraph>foo<$text code="true">ba[]</$text>r</paragraph>' );

		// So let's simulate the `keydown` event.
		editor.editing.view.document.fire( 'keydown', {
			keyCode: keyCodes.arrowright,
			preventDefault: () => {},
			domTarget: document.body
		} );

		expect( _getViewData( editor.editing.view ) ).toEqual(
			'<p>foo<code>ba</code>{}r</p>'
		);
	} );
} );
