/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ModelDocumentSelection, _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

import { TableEditing } from '../../src/tableediting.js';
import { modelTable } from '../_utils/utils.js';

import { InsertTableCommand } from '../../src/commands/inserttablecommand.js';

describe( 'InsertTableCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ Paragraph, TableEditing ],
				table: {
					enableFooters: true
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new InsertTableCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		describe( 'when selection is collapsed', () => {
			it( 'should be true if in a root', () => {
				_setModelData( model, '[]' );
				expect( command.isEnabled ).toBe( true );
			} );

			it( 'should be true if in paragraph', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph>' );
				expect( command.isEnabled ).toBe( true );
			} );

			it( 'should be true if in table', () => {
				_setModelData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
				expect( command.isEnabled ).toBe( true );
			} );
		} );

		describe( 'when selection is not collapsed', () => {
			it( 'should be true if an object is selected', () => {
				model.schema.register( 'media', { isObject: true, isBlock: true, allowWhere: '$block' } );

				_setModelData( model, '[<media url="http://ckeditor.com"></media>]' );
				expect( command.isEnabled ).toBe( true );
			} );

			it( 'should be true if in a paragraph', () => {
				_setModelData( model, '<paragraph>[Foo]</paragraph>' );
				expect( command.isEnabled ).toBe( true );
			} );

			it( 'should be true if a non-object element is selected', () => {
				model.schema.register( 'element', { allowIn: '$root', isSelectable: true } );

				_setModelData( model, '[<element></element>]' );
				expect( command.isEnabled ).toBe( true );
			} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should create a single batch', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );

			const spy = vi.fn();

			model.document.on( 'change', spy );

			command.execute( { rows: 3, columns: 4 } );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		describe( 'collapsed selection', () => {
			it( 'should insert table in empty root', () => {
				_setModelData( model, '[]' );

				command.execute();

				expect( _getModelData( model ) ).toEqualMarkup( modelTable( [
					[ '[]', '' ],
					[ '', '' ]
				] ) );
			} );

			it( 'should insert table with two rows and two columns after non-empty paragraph if selection is at the end', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				command.execute();

				expect( _getModelData( model ) ).toEqualMarkup(
					'<paragraph>foo</paragraph>' +
					modelTable( [
						[ '[]', '' ],
						[ '', '' ]
					] )
				);
			} );

			it( 'should insert table with given rows and columns after non-empty paragraph', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				command.execute( { rows: 3, columns: 4 } );

				expect( _getModelData( model ) ).toEqualMarkup(
					'<paragraph>foo</paragraph>' +
					modelTable( [
						[ '[]', '', '', '' ],
						[ '', '', '', '' ],
						[ '', '', '', '' ]
					] )
				);
			} );

			it( 'should insert table with given heading rows and heading columns after non-empty paragraph', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				command.execute( { rows: 3, columns: 4, headingRows: 1, headingColumns: 2 } );

				expect( _getModelData( model ) ).toEqualMarkup(
					'<paragraph>foo</paragraph>' +
					modelTable( [
						[ '[]', '', '', '' ],
						[ '', '', '', '' ],
						[ '', '', '', '' ]
					], { headingRows: 1, headingColumns: 2 } )
				);
			} );

			it( 'should insert table before after non-empty paragraph if selection is inside', () => {
				_setModelData( model, '<paragraph>f[]oo</paragraph>' );

				command.execute();

				expect( _getModelData( model ) ).toEqualMarkup(
					modelTable( [
						[ '[]', '' ],
						[ '', '' ]
					] ) +
					'<paragraph>foo</paragraph>'
				);
			} );

			it( 'should replace empty paragraph with table', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );

				command.execute( { rows: 3, columns: 4 } );

				expect( _getModelData( model ) ).toEqualMarkup(
					modelTable( [
						[ '[]', '', '', '' ],
						[ '', '', '', '' ],
						[ '', '', '', '' ]
					] )
				);
			} );
		} );

		describe( 'expanded selection', () => {
			it( 'should replace an existing selected object with a table', () => {
				model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

				_setModelData( model, '<paragraph>foo</paragraph>[<object></object>]<paragraph>bar</paragraph>' );

				command.execute( { rows: 1, columns: 2 } );

				expect( _getModelData( model ) )
					.toEqual( '<paragraph>foo</paragraph>' + modelTable( [ [ '[]', '' ] ] ) + '<paragraph>bar</paragraph>' );
			} );

			it( 'should replace an existing table with another table', () => {
				_setModelData( model,
					'<paragraph>foo</paragraph>[' + modelTable( [ [ '', '' ], [ '', '' ] ] ) + ']<paragraph>bar</paragraph>'
				);

				command.execute( { rows: 1, columns: 2 } );

				expect( _getModelData( model ) )
					.toEqual( '<paragraph>foo</paragraph>' + modelTable( [ [ '[]', '' ] ] ) + '<paragraph>bar</paragraph>' );
			} );
		} );

		describe( 'auto headings', () => {
			it( 'should have first row as a heading by default', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing ],
						table: {
							defaultHeadings: { rows: 1 }
						}
					} );

				const model = editor.model;
				const command = new InsertTableCommand( editor );

				_setModelData( model, '[]' );

				command.execute( { rows: 2, columns: 3 } );

				expect( _getModelData( model ) ).toEqual( modelTable( [
					[ '[]', '', '' ],
					[ '', '', '' ]
				], { headingRows: 1 } ) );

				await editor.destroy();
			} );

			it( 'should have first column as a heading by default', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing ],
						table: {
							defaultHeadings: { columns: 1 }
						}
					} );

				const model = editor.model;
				const command = new InsertTableCommand( editor );

				_setModelData( model, '[]' );

				command.execute( { rows: 2, columns: 3 } );

				expect( _getModelData( model ) ).toEqual( modelTable( [
					[ '[]', '', '' ],
					[ '', '', '' ]
				], { headingColumns: 1 } ) );

				await editor.destroy();
			} );

			it( 'should have first row and first column as a heading by default', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing ],
						table: {
							defaultHeadings: { rows: 1, columns: 1 }
						}
					} );

				const model = editor.model;
				const command = new InsertTableCommand( editor );

				_setModelData( model, '[]' );

				command.execute( { rows: 3, columns: 3 } );

				expect( _getModelData( model ) ).toEqual( modelTable( [
					[ '[]', '', '' ],
					[ '', '', '' ],
					[ '', '', '' ]
				], { headingRows: 1, headingColumns: 1 } ) );

				await editor.destroy();
			} );

			it( 'should have first three rows and two columns as a heading by default', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing ],
						table: {
							defaultHeadings: { rows: 3, columns: 2 }
						}
					} );

				const model = editor.model;
				const command = new InsertTableCommand( editor );

				_setModelData( model, '[]' );

				command.execute( { rows: 4, columns: 3 } );

				expect( _getModelData( model ) ).toEqual( modelTable( [
					[ '[]', '', '' ],
					[ '', '', '' ],
					[ '', '', '' ],
					[ '', '', '' ]
				], { headingRows: 3, headingColumns: 2 } ) );

				await editor.destroy();
			} );

			it( 'should have auto headings not to be greater than table rows and columns', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing ],
						table: {
							defaultHeadings: { rows: 3, columns: 3 }
						}
					} );

				const model = editor.model;
				const command = new InsertTableCommand( editor );

				_setModelData( model, '[]' );

				command.execute( { rows: 2, columns: 2 } );

				expect( _getModelData( model ) ).toEqual( modelTable( [
					[ '[]', '' ],
					[ '', '' ]
				], { headingRows: 2, headingColumns: 2 } ) );

				await editor.destroy();
			} );

			it( 'should work when heading rows and columns are explicitly set to 0', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing ],
						table: {
							defaultHeadings: { rows: 3, columns: 2 }
						}
					} );

				const model = editor.model;
				const command = new InsertTableCommand( editor );

				_setModelData( model, '[]' );

				command.execute( { rows: 4, columns: 3, headingRows: 0, headingColumns: 0 } );

				expect( _getModelData( model ) ).toEqual( modelTable( [
					[ '[]', '', '' ],
					[ '', '', '' ],
					[ '', '', '' ],
					[ '', '', '' ]
				] ) );

				await editor.destroy();
			} );
		} );

		describe( 'auto footers', () => {
			it( 'should ignore footer rows option when footers are disabled', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing ],
						table: {
							enableFooters: false
						}
					} );

				const model = editor.model;
				const command = new InsertTableCommand( editor );

				_setModelData( model, '[]' );

				command.execute( { rows: 2, columns: 2, footerRows: 1 } );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
					modelTable( [
						[ '', '' ],
						[ '', '' ]
					] )
				);

				await editor.destroy();
			} );

			it( 'should insert table with given footer rows after non-empty paragraph', () => {
				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				command.execute( { rows: 3, columns: 4, footerRows: 1 } );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
					'<paragraph>foo</paragraph>' +
					modelTable( [
						[ '', '', '', '' ],
						[ '', '', '', '' ],
						[ '', '', '', '' ]
					], { footerRows: 1 } )
				);
			} );

			it( 'should have last row as a footer by default', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing ],
						table: {
							enableFooters: true,
							defaultFooters: 1
						}
					} );

				const model = editor.model;
				const command = new InsertTableCommand( editor );

				_setModelData( model, '[]' );

				command.execute( { rows: 2, columns: 3 } );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
					modelTable( [
						[ '', '', '' ],
						[ '', '', '' ]
					], { footerRows: 1 } )
				);

				await editor.destroy();
			} );

			it( 'should trim footer rows if greater than table rows', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing ],
						table: {
							enableFooters: true,
							defaultFooters: 3
						}
					} );

				const model = editor.model;
				const command = new InsertTableCommand( editor );

				_setModelData( model, '[]' );

				command.execute( { rows: 2, columns: 3 } );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
					modelTable( [
						[ '', '', '' ],
						[ '', '', '' ]
					], { footerRows: 2 } )
				);

				await editor.destroy();
			} );

			it( 'should trim footer rows if sum of heading and footer rows is greater than table rows', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing ],
						table: {
							enableFooters: true,
							defaultHeadings: { rows: 2 },
							defaultFooters: 2
						}
					} );

				const model = editor.model;
				const command = new InsertTableCommand( editor );

				_setModelData( model, '[]' );

				command.execute( { rows: 3, columns: 3 } );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
					modelTable( [
						[ '', '', '' ],
						[ '', '', '' ],
						[ '', '', '' ]
					], { headingRows: 2, footerRows: 1 } )
				);

				await editor.destroy();
			} );
		} );

		describe( 'inheriting attributes', () => {
			let editor;
			let model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing ],
						table: {
							defaultHeadings: { rows: 1 }
						}
					} );

				model = editor.model;
				command = new InsertTableCommand( editor );

				const attributes = [ 'smart', 'pretty' ];

				model.schema.extend( '$block', {
					allowAttributes: attributes
				} );

				model.schema.extend( '$blockObject', {
					allowAttributes: attributes
				} );

				for ( const attribute of attributes ) {
					model.schema.setAttributeProperties( attribute, {
						copyOnReplace: true
					} );
				}
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should copy $block attributes on a table element when inserting it in $block', async () => {
				_setModelData( model, '<paragraph pretty="true" smart="true">[]</paragraph>' );

				command.execute( { rows: 2, columns: 2 } );

				expect( _getModelData( model ) ).toEqual( modelTable( [
					[ '[]', '' ],
					[ '', '' ]
				], { headingRows: 1, pretty: true, smart: true } ) );
			} );

			it( 'should copy attributes from first selected element', () => {
				_setModelData( model, '<paragraph pretty="true">[foo</paragraph><paragraph smart="true" >bar]</paragraph>' );

				command.execute( { rows: 2, columns: 2 } );

				expect( _getModelData( model ) ).toEqual( modelTable( [
					[ '[]', '' ],
					[ '', '' ]
				], { headingRows: 1, pretty: true } ) +
					'<paragraph pretty="true">foo</paragraph>' +
					'<paragraph smart="true">bar</paragraph>' );
			} );

			it( 'should only copy $block attributes marked with copyOnReplace', () => {
				_setModelData( model, '<paragraph pretty="true" smart="true" nice="false">[]</paragraph>' );

				command.execute( { rows: 2, columns: 2 } );

				expect( _getModelData( model ) ).toEqual( modelTable( [
					[ '[]', '' ],
					[ '', '' ]
				], { headingRows: 1, pretty: true, smart: true } ) );
			} );

			it( 'should copy attributes from object when it is selected during insertion', () => {
				model.schema.register( 'object', { isObject: true, inheritAllFrom: '$blockObject' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

				_setModelData( model, '[<object pretty="true" smart="true"></object>]' );

				command.execute( { rows: 2, columns: 2 } );

				expect( _getModelData( model ) ).toEqual( modelTable( [
					[ '[]', '' ],
					[ '', '' ]
				], { headingRows: 1, pretty: true, smart: true } ) );
			} );
		} );

		describe( 'inheriting text formatting attributes (inheritTextFormattingAttributes)', () => {
			let editor, model, command;

			beforeEach( async () => {
				editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing ]
					} );

				model = editor.model;
				command = new InsertTableCommand( editor );

				model.schema.extend( '$text', { allowAttributes: [ 'foo', 'bar' ] } );
				model.schema.setAttributeProperties( 'foo', { copyOnEnter: true } );
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			/**
			 * Returns every empty block found inside the given table's cells, in reading order.
			 */
			function getCellBlocks( table ) {
				const blocks = [];

				for ( const row of table.getChildren() ) {
					for ( const cell of row.getChildren() ) {
						for ( const block of cell.getChildren() ) {
							blocks.push( block );
						}
					}
				}

				return blocks;
			}

			function getStoredAttribute( element, key ) {
				return element.getAttribute( ModelDocumentSelection._getStoreAttributeKey( key ) );
			}

			it( 'defaults to true - copies attributes onto the selection and onto every empty cell', () => {
				_setModelData( model, '<paragraph><$text foo="true">Hello[]</$text></paragraph>' );

				command.execute();

				expect( model.document.selection.getAttribute( 'foo' ) ).toEqual( true );

				const table = model.document.getRoot().getChild( 1 );
				const blocks = getCellBlocks( table );

				expect( blocks ).to.have.length( 4 );

				for ( const block of blocks ) {
					expect( getStoredAttribute( block, 'foo' ) ).toEqual( true );
				}
			} );

			it( 'copies attributes onto a cell other than the first one too', () => {
				_setModelData( model, '<paragraph><$text foo="true">Hello[]</$text></paragraph>' );

				command.execute();

				const table = model.document.getRoot().getChild( 1 );
				const lastCellBlock = getCellBlocks( table ).at( -1 );

				expect( getStoredAttribute( lastCellBlock, 'foo' ) ).toEqual( true );
			} );

			it( 'does not copy anything when explicitly disabled', () => {
				_setModelData( model, '<paragraph><$text foo="true">Hello[]</$text></paragraph>' );

				command.execute( { inheritTextFormattingAttributes: false } );

				expect( model.document.selection.getAttribute( 'foo' ) ).toBeUndefined();

				const table = model.document.getRoot().getChild( 1 );

				for ( const block of getCellBlocks( table ) ) {
					expect( getStoredAttribute( block, 'foo' ) ).toBeUndefined();
				}
			} );

			it( 'does not copy anything when there is no formatting to inherit', () => {
				_setModelData( model, '<paragraph>Hello[]</paragraph>' );

				command.execute();

				const table = model.document.getRoot().getChild( 1 );

				for ( const block of getCellBlocks( table ) ) {
					expect( getStoredAttribute( block, 'foo' ) ).toBeUndefined();
				}
			} );

			it( 'does not copy an attribute that is not marked with copyOnEnter', () => {
				_setModelData( model, '<paragraph><$text bar="true">Hello[]</$text></paragraph>' );

				command.execute();

				const table = model.document.getRoot().getChild( 1 );

				for ( const block of getCellBlocks( table ) ) {
					expect( getStoredAttribute( block, 'bar' ) ).toBeUndefined();
				}
			} );

			it( 'does not throw when inserting into a completely empty document', () => {
				_setModelData( model, '[]' );

				expect( () => command.execute() ).not.toThrow();
			} );
		} );
	} );
} );
