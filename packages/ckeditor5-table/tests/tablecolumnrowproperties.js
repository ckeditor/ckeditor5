/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import TableEditing from '../src/tableediting';
import TableColumnRowProperties from '../src/tablecolumnrowproperites';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe.only( 'TableColumnRowProperties', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableColumnRowProperties, Paragraph, TableEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableColumnRowProperties.pluginName ).to.equal( 'TableColumnRowProperties' );
	} );

	describe( 'column width', () => {
		it( 'should set proper schema rules', () => {
			expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'width' ) ).to.be.true;
		} );

		describe( 'upcast conversion', () => {
			it( 'should upcast width attribute on table cell', () => {
				editor.setData( '<table><tr><td style="width:20px">foo</td></tr></table>' );
				const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

				expect( tableCell.getAttribute( 'width' ) ).to.equal( '20px' );
			} );
		} );

		describe( 'downcast conversion', () => {
			let tableCell;

			beforeEach( () => {
				setModelData(
					model,
					'<table headingRows="0" headingColumns="0">' +
					'<tableRow>' +
					'<tableCell>' +
					'<paragraph>foo</paragraph>' +
					'</tableCell>' +
					'</tableRow>' +
					'</table>'
				);

				tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );
			} );

			it( 'should downcast width attribute', () => {
				model.change( writer => writer.setAttribute( 'width', '20px', tableCell ) );

				assertEqualMarkup(
					editor.getData(),
					'<figure class="table"><table><tbody><tr><td style="width:20px;">foo</td></tr></tbody></table></figure>'
				);
			} );
		} );
	} );

	describe( 'row height', () => {
		it( 'should set proper schema rules', () => {
			expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'height' ) ).to.be.true;
		} );

		describe( 'upcast conversion', () => {
			it( 'should upcast height attribute on table cell', () => {
				editor.setData( '<table><tr><td style="height:20px">foo</td></tr></table>' );
				const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

				expect( tableCell.getAttribute( 'height' ) ).to.equal( '20px' );
			} );
		} );

		describe( 'downcast conversion', () => {
			let tableCell;

			beforeEach( () => {
				setModelData(
					model,
					'<table headingRows="0" headingColumns="0">' +
					'<tableRow>' +
					'<tableCell>' +
					'<paragraph>foo</paragraph>' +
					'</tableCell>' +
					'</tableRow>' +
					'</table>'
				);

				tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );
			} );

			it( 'should downcast height attribute', () => {
				model.change( writer => writer.setAttribute( 'height', '20px', tableCell ) );

				assertEqualMarkup(
					editor.getData(),
					'<figure class="table"><table><tbody><tr><td style="height:20px;">foo</td></tr></tbody></table></figure>'
				);
			} );
		} );
	} );
} );
