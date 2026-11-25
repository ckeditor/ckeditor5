/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { TableCellHeightEditing } from '../../src/tablecellheight/tablecellheightediting.js';
import { TableCellHeightCommand } from '../../src/tablecellproperties/commands/tablecellheightcommand.js';
import { TableEditing } from '../../src/tableediting.js';
import { assertTableCellStyle } from '../_utils/utils.js';

describe( 'TableCellHeightEditing', () => {
	let editor, model;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableCellHeightEditing, Paragraph ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableCellHeightEditing.pluginName ).toEqual( 'TableCellHeightEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableCellHeightEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableCellHeightEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should require TableEditing', () => {
		expect( TableCellHeightEditing.requires ).toEqual( [ TableEditing ] );
	} );

	it( 'adds tableCellHeight command', () => {
		expect( editor.commands.get( 'tableCellHeight' ) ).to.be.instanceOf( TableCellHeightCommand );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'tableCellHeight' ) ).toBe( true );
		expect( model.schema.getAttributeProperties( 'tableCellHeight' ).isFormatting ).toBe( true );
	} );

	describe( 'upcast conversion', () => {
		it( 'should upcast height style on table cell', () => {
			editor.setData( '<table><tr><td style="height:20px">foo</td></tr></table>' );
			const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

			expect( tableCell.getAttribute( 'tableCellHeight' ) ).toEqual( '20px' );
		} );

		it( 'should upcast height attribute on table cell', () => {
			editor.setData( '<table><tr><td height="50.5">foo</td></tr></table>' );
			const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

			expect( tableCell.getAttribute( 'tableCellHeight' ) ).toEqual( '50.5px' );
		} );

		it( 'should prefer the height style to the height attribute', () => {
			editor.setData( '<table><tr><td height="20" style="height:30px">foo</td></tr></table>' );
			const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

			expect( tableCell.getAttribute( 'tableCellHeight' ) ).toEqual( '30px' );
		} );

		describe( 'with GeneralHtmlSupport', () => {
			let ghsEditor;

			beforeEach( async () => {
				ghsEditor = await ClassicTestEditor.create( '', {
					plugins: [ TableCellHeightEditing, Paragraph, GeneralHtmlSupport ],
					htmlSupport: {
						allow: [ { name: /.*/, styles: true, attributes: true } ]
					}
				} );
			} );

			afterEach( async () => {
				await ghsEditor.destroy();
			} );

			// Microsoft Excel sets both the height attribute and the height style.
			it( 'should not leave the height attribute of a cell with the height style to GHS', () => {
				ghsEditor.setData(
					'<table><tr><td height="20" style="height:15pt">foo</td><th height="20" style="height:15pt">bar</th></tr></table>'
				);

				expect( ghsEditor.getData() ).not.toContain( 'height="' );
			} );
		} );
	} );

	describe( 'downcast conversion', () => {
		let tableCell;

		beforeEach( () => {
			_setModelData( model, '<table><tableRow><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>' );

			tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );
		} );

		it( 'should downcast tableCellHeight attribute', () => {
			model.change( writer => writer.setAttribute( 'tableCellHeight', '20px', tableCell ) );

			expect( editor.getData() ).toEqualMarkup(
				'<figure class="table"><table><tbody><tr><td style="height:20px;">foo</td></tr></tbody></table></figure>'
			);
		} );

		it( 'should downcast tableCellHeight removal', () => {
			model.change( writer => writer.setAttribute( 'tableCellHeight', '1337px', tableCell ) );
			model.change( writer => writer.removeAttribute( 'tableCellHeight', tableCell ) );

			assertTableCellStyle( editor );
		} );
	} );

	describe( 'default table cell height property', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ TableCellHeightEditing, Paragraph ],
				table: {
					tableCellProperties: {
						defaultProperties: {
							height: '250px'
						}
					}
				}
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not upcast the default `height` value', () => {
			editor.setData( '<table><tr><td style="height:250px">foo</td></tr></table>' );
			const tableCell = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );

			expect( tableCell.hasAttribute( 'tableCellHeight' ) ).toBe( false );
		} );
	} );
} );
