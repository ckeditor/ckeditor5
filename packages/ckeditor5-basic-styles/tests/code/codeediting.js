/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import CodeEditing from '../../src/code/codeediting.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import AttributeCommand from '../../src/attributecommand.js';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CodeEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CodeEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CodeEditing ) ).to.be.instanceOf( CodeEditing );
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
			label: 'Move out of an inline code style',
			keystroke: [
				[ 'arrowleft', 'arrowleft' ],
				[ 'arrowright', 'arrowright' ]
			]
		} );
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

		// See: https://github.com/ckeditor/ckeditor5/issues/17789
		it( 'should not convert word-wrap:break-word to code attribute', () => {
			editor.setData( '<p><span style="word-wrap: break-word">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foobar</p>' );
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
