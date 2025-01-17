/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import StrikethroughEditing from '../../src/strikethrough/strikethroughediting.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import AttributeCommand from '../../src/attributecommand.js';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

describe( 'StrikethroughEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, StrikethroughEditing ]
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
		expect( StrikethroughEditing.pluginName ).to.equal( 'StrikethroughEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( StrikethroughEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( StrikethroughEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( StrikethroughEditing ) ).to.be.instanceOf( StrikethroughEditing );
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
			label: 'Strikethrough text',
			keystroke: 'CTRL+SHIFT+X'
		} );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'strikethrough' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'strikethrough' ) ).to.be.true;
	} );

	it( 'should be marked with a formatting property', () => {
		expect( model.schema.getAttributeProperties( 'strikethrough' ) ).to.include( {
			isFormatting: true
		} );
	} );

	it( 'its attribute is marked with a copOnEnter property', () => {
		expect( model.schema.getAttributeProperties( 'strikethrough' ) ).to.include( {
			copyOnEnter: true
		} );
	} );

	describe( 'command', () => {
		it( 'should register strikethrough command', () => {
			const command = editor.commands.get( 'strikethrough' );

			expect( command ).to.be.instanceOf( AttributeCommand );
			expect( command ).to.have.property( 'attributeKey', 'strikethrough' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <strike> to strikethrough attribute', () => {
			editor.setData( '<p><strike>foo</strike>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text strikethrough="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><s>foo</s>bar</p>' );
		} );
		it( 'should convert <del> to strikethrough attribute', () => {
			editor.setData( '<p><del>foo</del>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text strikethrough="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><s>foo</s>bar</p>' );
		} );

		it( 'should convert <s> to strikethrough attribute', () => {
			editor.setData( '<p><s>foo</s>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text strikethrough="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><s>foo</s>bar</p>' );
		} );

		it( 'should convert text-decoration:line-through to strikethrough attribute', () => {
			editor.setData( '<p><span style="text-decoration: line-through;">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text strikethrough="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><s>foo</s>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<s>foo</s>bar' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text strikethrough="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><s>foo</s>bar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( model, '<paragraph><$text strikethrough="true">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><s>foo</s>bar</p>' );
		} );
	} );
} );
