/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { TableHeightEditing } from '../../src/tableheight/tableheightediting.js';
import { TableHeightCommand } from '../../src/tableproperties/commands/tableheightcommand.js';
import { TableEditing } from '../../src/tableediting.js';

describe( 'TableHeightEditing', () => {
	let editor, model;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableHeightEditing, Paragraph ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableHeightEditing.pluginName ).toEqual( 'TableHeightEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableHeightEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableHeightEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should require TableEditing', () => {
		expect( TableHeightEditing.requires ).toEqual( [ TableEditing ] );
	} );

	it( 'adds tableHeight command', () => {
		expect( editor.commands.get( 'tableHeight' ) ).to.be.instanceOf( TableHeightCommand );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'tableHeight' ) ).toBe( true );
		expect( model.schema.getAttributeProperties( 'tableHeight' ).isFormatting ).toBe( true );
	} );

	describe( 'upcast conversion', () => {
		it( 'should upcast height style on the figure', () => {
			editor.setData( '<figure class="table" style="height:200px"><table><tr><td>foo</td></tr></table></figure>' );

			expect( model.document.getRoot().getChild( 0 ).getAttribute( 'tableHeight' ) ).toEqual( '200px' );
		} );

		it( 'should upcast height style on a table without a figure', () => {
			editor.setData( '<table style="height:200px"><tr><td>foo</td></tr></table>' );

			expect( model.document.getRoot().getChild( 0 ).getAttribute( 'tableHeight' ) ).toEqual( '200px' );
		} );

		it( 'should upcast height attribute on the table', () => {
			editor.setData( '<table height="200"><tr><td>foo</td></tr></table>' );

			expect( model.document.getRoot().getChild( 0 ).getAttribute( 'tableHeight' ) ).toEqual( '200px' );
		} );
	} );

	describe( 'downcast conversion', () => {
		let table;

		beforeEach( () => {
			_setModelData( model, '<table><tableRow><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>' );

			table = model.document.getRoot().getChild( 0 );
		} );

		it( 'should downcast tableHeight attribute on the figure', () => {
			model.change( writer => writer.setAttribute( 'tableHeight', '200px', table ) );

			expect( editor.getData() ).toEqualMarkup(
				'<figure class="table" style="height:200px;"><table><tbody><tr><td>foo</td></tr></tbody></table></figure>'
			);
		} );

		it( 'should downcast tableHeight removal', () => {
			model.change( writer => writer.setAttribute( 'tableHeight', '200px', table ) );
			model.change( writer => writer.removeAttribute( 'tableHeight', table ) );

			expect( editor.getData() ).toEqualMarkup(
				'<figure class="table"><table><tbody><tr><td>foo</td></tr></tbody></table></figure>'
			);
		} );
	} );

	describe( 'default table height property', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ TableHeightEditing, Paragraph ],
				table: {
					tableProperties: {
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
			editor.setData( '<figure class="table" style="height:250px"><table><tr><td>foo</td></tr></table></figure>' );

			expect( model.document.getRoot().getChild( 0 ).hasAttribute( 'tableHeight' ) ).toBe( false );
		} );
	} );
} );
