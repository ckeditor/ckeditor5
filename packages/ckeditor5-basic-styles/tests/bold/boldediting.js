/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import BoldEditing from '../../src/bold/boldediting';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import AttributeCommand from '../../src/attributecommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

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
		expect( BoldEditing.pluginName ).to.equal( 'BoldEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( BoldEditing ) ).to.be.instanceOf( BoldEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'bold' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'bold' ) ).to.be.true;
	} );

	it( 'should be marked with a formatting property', () => {
		expect( model.schema.getAttributeProperties( 'bold' ) ).to.include( {
			isFormatting: true
		} );
	} );

	it( 'its attribute is marked with a copOnEnter property', () => {
		expect( model.schema.getAttributeProperties( 'bold' ) ).to.include( {
			copyOnEnter: true
		} );
	} );

	it( 'should set editor keystroke', () => {
		const spy = sinon.spy( editor, 'execute' );
		const keyEventData = {
			keyCode: keyCodes.b,
			ctrlKey: true,
			preventDefault: sinon.spy(),
			stopPropagation: sinon.spy()
		};

		const wasHandled = editor.keystrokes.press( keyEventData );

		expect( wasHandled ).to.be.true;
		expect( spy.calledOnce ).to.be.true;
		expect( keyEventData.preventDefault.calledOnce ).to.be.true;
	} );

	describe( 'command', () => {
		it( 'should register bold command', () => {
			const command = editor.commands.get( 'bold' );

			expect( command ).to.be.instanceOf( AttributeCommand );
			expect( command ).to.have.property( 'attributeKey', 'bold' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <strong> to bold attribute', () => {
			editor.setData( '<p><strong>foo</strong>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><strong>foo</strong>bar</p>' );
		} );

		it( 'should convert <b> to bold attribute', () => {
			editor.setData( '<p><b>foo</b>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><strong>foo</strong>bar</p>' );
		} );

		it( 'should convert font-weight:bold to bold attribute', () => {
			editor.setData( '<p><span style="font-weight: bold;">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><strong>foo</strong>bar</p>' );
		} );

		it( 'should convert font-weight defined as number to bold attribute (if the value is higher or equal to 600)', () => {
			editor.setData( '<p><span style="font-weight: 600;">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><strong>foo</strong>bar</p>' );
		} );

		it( 'should not convert font-weight defined as number to bold attribute (if the value is lower than 600)', () => {
			editor.setData( '<p><span style="font-weight: 500;">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foobar</p>' );
		} );

		it( 'should not convert font-weight if the value is invalid', () => {
			editor.setData( '<p><span style="font-weight: foo;">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foobar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<strong>foo</strong>bar' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><strong>foo</strong>bar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( model, '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><strong>foo</strong>bar</p>' );
		} );
	} );
} );
