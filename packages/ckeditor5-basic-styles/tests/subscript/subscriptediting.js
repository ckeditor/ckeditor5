/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import SubEditing from '../../src/subscript/subscriptediting';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import AttributeCommand from '../../src/attributecommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'SubEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, SubEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( SubEditing ) ).to.be.instanceOf( SubEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'sub' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'sub' ) ).to.be.true;
	} );

	describe( 'command', () => {
		it( 'should register sub command', () => {
			const command = editor.commands.get( 'sub' );

			expect( command ).to.be.instanceOf( AttributeCommand );
			expect( command ).to.have.property( 'attributeKey', 'sub' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <sub> to sub attribute', () => {
			editor.setData( '<p><sub>foo</sub>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text sub="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><sub>foo</sub>bar</p>' );
		} );

		it( 'should convert vertical-align:sub to sub attribute', () => {
			editor.setData( '<p><span style="vertical-align: sub;">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text sub="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><sub>foo</sub>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<sub>foo</sub>bar' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text sub="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><sub>foo</sub>bar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( model, '<paragraph><$text sub="true">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><sub>foo</sub>bar</p>' );
		} );
	} );
} );
