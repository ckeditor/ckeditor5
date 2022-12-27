/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CodeEditing from '../../src/code/codeediting';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import AttributeCommand from '../../src/attributecommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

/* global document */

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
		expect( CodeEditing.pluginName ).to.equal( 'CodeEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CodeEditing ) ).to.be.instanceOf( CodeEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'code' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'code' ) ).to.be.true;
	} );

	it( 'should be marked with a formatting property', () => {
		expect( model.schema.getAttributeProperties( 'code' ) ).to.include( {
			isFormatting: true
		} );
	} );

	it( 'its attribute is marked with a copOnEnter property', () => {
		expect( model.schema.getAttributeProperties( 'code' ) ).to.include( {
			copyOnEnter: false
		} );
	} );

	describe( 'command', () => {
		it( 'should register code command', () => {
			const command = editor.commands.get( 'code' );

			expect( command ).to.be.instanceOf( AttributeCommand );
			expect( command ).to.have.property( 'attributeKey', 'code' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <code> to code attribute', () => {
			editor.setData( '<p><code>foo</code>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text code="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><code>foo</code>bar</p>' );
		} );

		it( 'should convert word-wrap:break-word to code attribute', () => {
			editor.setData( '<p><span style="word-wrap: break-word">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text code="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><code>foo</code>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<code>foo</code>bar' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text code="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><code>foo</code>bar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( model, '<paragraph><$text code="true">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><code>foo</code>bar</p>' );
		} );
	} );

	it( 'should add `ck-code_selected` class when caret enters the element', () => {
		// Put selection before the link element.
		setModelData( editor.model, '<paragraph>foo[]<$text code="true">ba</$text>r</paragraph>' );

		// So let's simulate the `keydown` event.
		editor.editing.view.document.fire( 'keydown', {
			keyCode: keyCodes.arrowright,
			preventDefault: () => {},
			domTarget: document.body
		} );

		expect( getViewData( editor.editing.view ) ).to.equal(
			'<p>foo<code class="ck-code_selected">{}ba</code>r</p>'
		);
	} );

	it( 'should remove `ck-code_selected` class when caret leaves the element', () => {
		// Put selection before the link element.
		setModelData( editor.model, '<paragraph>foo<$text code="true">ba[]</$text>r</paragraph>' );

		// So let's simulate the `keydown` event.
		editor.editing.view.document.fire( 'keydown', {
			keyCode: keyCodes.arrowright,
			preventDefault: () => {},
			domTarget: document.body
		} );

		expect( getViewData( editor.editing.view ) ).to.equal(
			'<p>foo<code>ba</code>{}r</p>'
		);
	} );
} );
