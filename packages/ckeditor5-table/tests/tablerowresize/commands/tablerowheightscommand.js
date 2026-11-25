/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { TableCaptionEditing } from '../../../src/tablecaption/tablecaptionediting.js';
import { TableCellPropertiesEditing } from '../../../src/tablecellproperties/tablecellpropertiesediting.js';
import { TableRowResizeEditing } from '../../../src/tablerowresize/tablerowresizeediting.js';

describe( 'TableRowHeightsCommand', () => {
	let editor, model, command;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableRowResizeEditing, TableCellPropertiesEditing, TableCaptionEditing, Paragraph, UndoEditing ]
		} );

		model = editor.model;
		command = editor.commands.get( 'resizeRowHeights' );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	function getTable() {
		return model.document.getRoot().getChild( 0 );
	}

	function getRow( index ) {
		return getTable().getChild( index );
	}

	const threeRowTable =
		'<table>' +
			'<tableRow rowHeight="40px"><tableCell><paragraph>00</paragraph></tableCell></tableRow>' +
			'<tableRow><tableCell><paragraph>10</paragraph></tableCell></tableRow>' +
			'<tableRow rowHeight="80px"><tableCell><paragraph>20</paragraph></tableCell></tableRow>' +
		'</table>';

	describe( 'isEnabled', () => {
		it( 'should be enabled when the selection is in a table', () => {
			_setModelData( model, threeRowTable.replace( '>00<', '>[]00<' ) );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be enabled when the selection is outside a table', () => {
			_setModelData( model, '<paragraph>[]foo</paragraph>' + threeRowTable );

			expect( command.isEnabled ).toBe( true );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should set the heights of the rows in order', () => {
			_setModelData( model, '<paragraph>[]foo</paragraph>' + threeRowTable );

			command.execute( { table: model.document.getRoot().getChild( 1 ), rowHeights: [ '50px', '60px', '70px' ] } );

			const table = model.document.getRoot().getChild( 1 );

			expect( table.getChild( 0 ).getAttribute( 'rowHeight' ) ).toBe( '50px' );
			expect( table.getChild( 1 ).getAttribute( 'rowHeight' ) ).toBe( '60px' );
			expect( table.getChild( 2 ).getAttribute( 'rowHeight' ) ).toBe( '70px' );
		} );

		it( 'should remove the height of a row with a null entry', () => {
			_setModelData( model, threeRowTable.replace( '>00<', '>[]00<' ) );

			command.execute( { table: getTable(), rowHeights: [ null, '60px', null ] } );

			expect( getRow( 0 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			expect( getRow( 1 ).getAttribute( 'rowHeight' ) ).toBe( '60px' );
			expect( getRow( 2 ).hasAttribute( 'rowHeight' ) ).toBe( false );
		} );

		it( 'should leave the rows beyond the length of the array unchanged', () => {
			_setModelData( model, threeRowTable.replace( '>00<', '>[]00<' ) );

			command.execute( { table: getTable(), rowHeights: [ '50px' ] } );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '50px' );
			expect( getRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			expect( getRow( 2 ).getAttribute( 'rowHeight' ) ).toBe( '80px' );
		} );

		it( 'should leave the rows with an undefined entry unchanged', () => {
			_setModelData( model,
				'<table>' +
					'<tableRow rowHeight="40px"><tableCell tableCellHeight="90px"><paragraph>[]00</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>10</paragraph></tableCell></tableRow>' +
					'<tableRow rowHeight="80px"><tableCell><paragraph>20</paragraph></tableCell></tableRow>' +
				'</table>'
			);

			// eslint-disable-next-line no-sparse-arrays
			command.execute( { table: getTable(), rowHeights: [ , , '70px' ] } );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
			expect( getRow( 0 ).getChild( 0 ).getAttribute( 'tableCellHeight' ) ).toBe( '90px' );
			expect( getRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			expect( getRow( 2 ).getAttribute( 'rowHeight' ) ).toBe( '70px' );
		} );

		it( 'should not change anything without row heights', () => {
			_setModelData( model, threeRowTable.replace( '>00<', '>[]00<' ) );

			command.execute( { table: getTable() } );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
			expect( getRow( 2 ).getAttribute( 'rowHeight' ) ).toBe( '80px' );
		} );

		it( 'should work on the selected table if it was not passed', () => {
			_setModelData( model, '[' + threeRowTable + ']' );

			command.execute( { rowHeights: [ '50px' ] } );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '50px' );
		} );

		it( 'should skip the table caption', () => {
			_setModelData( model,
				'<table>' +
					'<tableRow><tableCell><paragraph>[]00</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>10</paragraph></tableCell></tableRow>' +
					'<caption>caption</caption>' +
				'</table>'
			);

			command.execute( { table: getTable(), rowHeights: [ '50px', '60px', '70px' ] } );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '50px' );
			expect( getRow( 1 ).getAttribute( 'rowHeight' ) ).toBe( '60px' );
			expect( getTable().getChild( 2 ).hasAttribute( 'rowHeight' ) ).toBe( false );
		} );

		it( 'should remove the heights of the cells covering a resized row', () => {
			_setModelData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell rowspan="2" tableCellHeight="100px"><paragraph>[]00</paragraph></tableCell>' +
						'<tableCell tableCellHeight="90px"><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell tableCellHeight="80px"><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			command.execute( { table: getTable(), rowHeights: [ undefined, '60px' ] } );

			expect( getRow( 0 ).getChild( 0 ).hasAttribute( 'tableCellHeight' ) ).toBe( false );
			expect( getRow( 0 ).getChild( 1 ).getAttribute( 'tableCellHeight' ) ).toBe( '90px' );
			expect( getRow( 1 ).getChild( 0 ).hasAttribute( 'tableCellHeight' ) ).toBe( false );
		} );

		it( 'should remove the heights of the cells covering a row with a null entry', () => {
			_setModelData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell rowspan="2" tableCellHeight="100px"><paragraph>[]00</paragraph></tableCell>' +
						'<tableCell tableCellHeight="90px"><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow rowHeight="60px">' +
						'<tableCell tableCellHeight="80px"><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			command.execute( { table: getTable(), rowHeights: [ undefined, null ] } );

			expect( getRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			expect( getRow( 0 ).getChild( 0 ).hasAttribute( 'tableCellHeight' ) ).toBe( false );
			expect( getRow( 0 ).getChild( 1 ).getAttribute( 'tableCellHeight' ) ).toBe( '90px' );
			expect( getRow( 1 ).getChild( 0 ).hasAttribute( 'tableCellHeight' ) ).toBe( false );
		} );

		it( 'should be a single undo step', () => {
			_setModelData( model, threeRowTable.replace( '>00<', '>[]00<' ) );

			command.execute( { table: getTable(), rowHeights: [ '50px', '60px', null ] } );
			editor.execute( 'undo' );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
			expect( getRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			expect( getRow( 2 ).getAttribute( 'rowHeight' ) ).toBe( '80px' );
		} );

		describe( 'with a default cell height in the configuration', () => {
			beforeEach( async () => {
				await editor.destroy();

				editor = await VirtualTestEditor.create( {
					plugins: [ TableRowResizeEditing, TableCellPropertiesEditing, Paragraph ],
					table: {
						tableCellProperties: { defaultProperties: { height: '50px' } }
					}
				} );

				model = editor.model;
				command = editor.commands.get( 'resizeRowHeights' );
			} );

			// A removed cell height would fall back to the default one.
			it( 'should set the heights of the cells covering a row with a null entry to `auto`', () => {
				_setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell rowspan="2" tableCellHeight="100px"><paragraph>[]00</paragraph></tableCell>' +
							'<tableCell tableCellHeight="90px"><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow rowHeight="60px">' +
							'<tableCell tableCellHeight="80px"><paragraph>11</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				command.execute( { table: getTable(), rowHeights: [ undefined, null ] } );

				expect( getRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
				expect( getRow( 0 ).getChild( 0 ).getAttribute( 'tableCellHeight' ) ).toBe( 'auto' );
				expect( getRow( 0 ).getChild( 1 ).getAttribute( 'tableCellHeight' ) ).toBe( '90px' );
				expect( getRow( 1 ).getChild( 0 ).getAttribute( 'tableCellHeight' ) ).toBe( 'auto' );
			} );
		} );
	} );
} );
