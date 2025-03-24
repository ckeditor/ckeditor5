/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TableEditing from '../../src/tableediting.js';
import TableColumnResize from '../../src/tablecolumnresize.js';
import TableCaptionEditing from '../../src/tablecaption/tablecaptionediting.js';
import TableLayoutEditing from '../../src/tablelayout/tablelayoutediting.js';
import InsertTableLayoutCommand from '../../src/commands/inserttablelayoutcommand.js';

import { modelTable } from '../_utils/utils.js';

describe( 'InsertTableLayoutCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ Paragraph, TableEditing, TableCaptionEditing, TableLayoutEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new InsertTableLayoutCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		describe( 'when selection is collapsed', () => {
			it( 'should be true if in a root', () => {
				setData( model, '[]' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if in paragraph', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if in table', () => {
				setData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if in table caption', () => {
				setData( model,
					'<table>' +
						'<tableRow><tableCell><paragraph>foo</paragraph></tableCell></tableRow>' +
						'<caption>[]</caption>' +
					'</table>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'when selection is not collapsed', () => {
			it( 'should be true if an object is selected', () => {
				model.schema.register( 'media', { isObject: true, isBlock: true, allowWhere: '$block' } );

				setData( model, '[<media url="http://ckeditor.com"></media>]' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if in a paragraph', () => {
				setData( model, '<paragraph>[Foo]</paragraph>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if a non-object element is selected', () => {
				model.schema.register( 'element', { allowIn: '$root', isSelectable: true } );

				setData( model, '[<element></element>]' );
				expect( command.isEnabled ).to.be.true;
			} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should create a single batch', () => {
			setData( model, '<paragraph>foo[]</paragraph>' );

			const spy = sinon.spy();

			model.document.on( 'change', spy );

			command.execute( { rows: 3, columns: 4 } );

			sinon.assert.calledOnce( spy );
		} );

		describe( 'collapsed selection', () => {
			it( 'should insert table in empty root', () => {
				setData( model, '[]' );

				command.execute();

				expect( getData( model ) ).to.equalMarkup(
					modelTable( [
						[ '[]', '' ],
						[ '', '' ]
					],
					{ tableType: 'layout', tableWidth: '100%', columnWidths: '50%,50%' } )
				);
			} );

			it( 'should insert table with two rows and two columns after non-empty paragraph if selection is at the end', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				command.execute();

				expect( getData( model ) ).to.equalMarkup(
					'<paragraph>foo</paragraph>' +
					modelTable( [
						[ '[]', '' ],
						[ '', '' ]
					],
					{ tableType: 'layout', tableWidth: '100%', columnWidths: '50%,50%' } )
				);
			} );

			it( 'should insert table with given rows and columns after non-empty paragraph', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				command.execute( { rows: 3, columns: 4 } );

				expect( getData( model ) ).to.equalMarkup(
					'<paragraph>foo</paragraph>' +
					modelTable( [
						[ '[]', '', '', '' ],
						[ '', '', '', '' ],
						[ '', '', '', '' ]
					],
					{ tableType: 'layout', tableWidth: '100%', columnWidths: '25%,25%,25%,25%' } )
				);
			} );

			it( 'should insert table with given heading rows and heading columns after non-empty paragraph', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				command.execute( { rows: 3, columns: 4, headingRows: 1, headingColumns: 2 } );

				expect( getData( model ) ).to.equalMarkup(
					'<paragraph>foo</paragraph>' +
					modelTable( [
						[ '[]', '', '', '' ],
						[ '', '', '', '' ],
						[ '', '', '', '' ]
					], { tableType: 'layout', tableWidth: '100%', columnWidths: '25%,25%,25%,25%' } )
				);
			} );

			it( 'should insert table before after non-empty paragraph if selection is inside', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );

				command.execute();

				expect( getData( model ) ).to.equalMarkup(
					modelTable( [
						[ '[]', '' ],
						[ '', '' ]
					],
					{ tableType: 'layout', tableWidth: '100%', columnWidths: '50%,50%' } ) +
					'<paragraph>foo</paragraph>'
				);
			} );

			it( 'should replace empty paragraph with table', () => {
				setData( model, '<paragraph>[]</paragraph>' );

				command.execute( { rows: 3, columns: 4 } );

				expect( getData( model ) ).to.equalMarkup(
					modelTable( [
						[ '[]', '', '', '' ],
						[ '', '', '', '' ],
						[ '', '', '', '' ]
					],
					{ tableType: 'layout', tableWidth: '100%', columnWidths: '25%,25%,25%,25%' } )
				);
			} );
		} );

		describe( 'expanded selection', () => {
			it( 'should replace an existing selected object with a table', () => {
				model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

				setData( model, '<paragraph>foo</paragraph>[<object></object>]<paragraph>bar</paragraph>' );

				command.execute( { rows: 1, columns: 2 } );

				expect( getData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' + modelTable( [ [ '[]', '' ] ],
						{ tableType: 'layout', tableWidth: '100%', columnWidths: '50%,50%' } ) + '<paragraph>bar</paragraph>'
				);
			} );

			it( 'should replace an existing table with another table', () => {
				setData( model, '<paragraph>foo</paragraph>[' + modelTable( [ [ '', '' ], [ '', '' ] ] ) + ']<paragraph>bar</paragraph>' );

				command.execute( { rows: 1, columns: 2 } );

				expect( getData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' + modelTable( [ [ '[]', '' ] ],
						{ tableType: 'layout', tableWidth: '100%', columnWidths: '50%,50%' } ) + '<paragraph>bar</paragraph>'
				);
			} );
		} );

		describe( 'with `TableColumnResize` plugin added', () => {
			let editor, model, command;

			beforeEach( () => {
				return ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing, TableLayoutEditing, TableColumnResize ]
					} )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						command = new InsertTableLayoutCommand( editor );
					} );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'collapsed selection', () => {
				it( 'should insert table in empty root', () => {
					setData( model, '[]' );

					command.execute();

					expect( getData( model ) ).to.equalMarkup(
						modelTable( [
							[ '[]', '' ],
							[ '', '' ]
						],
						{ tableType: 'layout', tableWidth: '100%', columnWidths: '50%,50%' } )
					);
				} );

				it( 'should insert table with two rows and two columns after non-empty paragraph if selection is at the end', () => {
					setData( model, '<paragraph>foo[]</paragraph>' );

					command.execute();

					expect( getData( model ) ).to.equalMarkup(
						'<paragraph>foo</paragraph>' +
						modelTable( [
							[ '[]', '' ],
							[ '', '' ]
						],
						{ tableType: 'layout', tableWidth: '100%', columnWidths: '50%,50%' } )
					);
				} );

				it( 'should insert table with given rows and columns after non-empty paragraph', () => {
					setData( model, '<paragraph>foo[]</paragraph>' );

					command.execute( { rows: 3, columns: 4 } );

					expect( getData( model ) ).to.equalMarkup(
						'<paragraph>foo</paragraph>' +
						modelTable( [
							[ '[]', '', '', '' ],
							[ '', '', '', '' ],
							[ '', '', '', '' ]
						],
						{ tableType: 'layout', tableWidth: '100%', columnWidths: '25%,25%,25%,25%' } )
					);
				} );

				it( 'should insert table with given heading rows and heading columns after non-empty paragraph', () => {
					setData( model, '<paragraph>foo[]</paragraph>' );

					command.execute( { rows: 3, columns: 4, headingRows: 1, headingColumns: 2 } );

					expect( getData( model ) ).to.equalMarkup(
						'<paragraph>foo</paragraph>' +
						modelTable( [
							[ '[]', '', '', '' ],
							[ '', '', '', '' ],
							[ '', '', '', '' ]
						],
						{ tableType: 'layout', tableWidth: '100%', columnWidths: '25%,25%,25%,25%' } )
					);
				} );

				it( 'should insert table before after non-empty paragraph if selection is inside', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );

					command.execute();

					expect( getData( model ) ).to.equalMarkup(
						modelTable( [
							[ '[]', '' ],
							[ '', '' ]
						],
						{ tableType: 'layout', tableWidth: '100%', columnWidths: '50%,50%' } ) +
						'<paragraph>foo</paragraph>'
					);
				} );

				it( 'should replace empty paragraph with table', () => {
					setData( model, '<paragraph>[]</paragraph>' );

					command.execute( { rows: 3, columns: 4 } );

					expect( getData( model ) ).to.equalMarkup(
						modelTable( [
							[ '[]', '', '', '' ],
							[ '', '', '', '' ],
							[ '', '', '', '' ]
						],
						{ tableType: 'layout', tableWidth: '100%', columnWidths: '25%,25%,25%,25%' } )
					);
				} );
			} );

			describe( 'expanded selection', () => {
				it( 'should replace an existing selected object with a table', () => {
					model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
					editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

					setData( model, '<paragraph>foo</paragraph>[<object></object>]<paragraph>bar</paragraph>' );

					command.execute( { rows: 1, columns: 2 } );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' + modelTable( [ [ '[]', '' ] ],
							{ tableType: 'layout', tableWidth: '100%', columnWidths: '50%,50%' } ) + '<paragraph>bar</paragraph>'
					);
				} );

				it( 'should replace an existing table with another table', () => {
					setData( model, '<paragraph>foo</paragraph>[' +
						modelTable( [ [ '', '' ], [ '', '' ] ] ) +
						']<paragraph>bar</paragraph>' );

					command.execute( { rows: 1, columns: 2 } );

					expect( getData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' + modelTable( [ [ '[]', '' ] ],
							{ tableType: 'layout', tableWidth: '100%', columnWidths: '50%,50%' } ) + '<paragraph>bar</paragraph>'
					);
				} );
			} );
		} );

		describe( 'auto headings', () => {
			it( 'should not have first row as a heading by default', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing, TableColumnResize ],
						table: {
							defaultHeadings: { rows: 1 }
						}
					} );

				const model = editor.model;
				const command = new InsertTableLayoutCommand( editor );

				setData( model, '[]' );

				command.execute( { rows: 2, columns: 3 } );

				expect( getData( model ) ).to.equal(
					modelTable( [
						[ '[]', '', '' ],
						[ '', '', '' ]
					], { tableWidth: '100%', columnWidths: '33.33%,33.33%,33.34%' } )
				);

				await editor.destroy();
			} );

			it( 'should not have first column as a heading by default', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing, TableColumnResize ],
						table: {
							defaultHeadings: { columns: 1 }
						}
					} );

				const model = editor.model;
				const command = new InsertTableLayoutCommand( editor );

				setData( model, '[]' );

				command.execute( { rows: 2, columns: 3 } );

				expect( getData( model ) ).to.equal(
					modelTable( [
						[ '[]', '', '' ],
						[ '', '', '' ]
					], { tableWidth: '100%', columnWidths: '33.33%,33.33%,33.34%' } )
				);

				await editor.destroy();
			} );

			it( 'should not have first row and first column as a heading by default', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing, TableColumnResize ],
						table: {
							defaultHeadings: { rows: 1, columns: 1 }
						}
					} );

				const model = editor.model;
				const command = new InsertTableLayoutCommand( editor );

				setData( model, '[]' );

				command.execute( { rows: 3, columns: 3 } );

				expect( getData( model ) ).to.equal(
					modelTable( [
						[ '[]', '', '' ],
						[ '', '', '' ],
						[ '', '', '' ]
					], { tableWidth: '100%', columnWidths: '33.33%,33.33%,33.34%' } )
				);

				await editor.destroy();
			} );

			it( 'should not have first three rows and two columns as a heading by default', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing, TableColumnResize ],
						table: {
							defaultHeadings: { rows: 3, columns: 2 }
						}
					} );

				const model = editor.model;
				const command = new InsertTableLayoutCommand( editor );

				setData( model, '[]' );

				command.execute( { rows: 4, columns: 3 } );

				expect( getData( model ) ).to.equal(
					modelTable( [
						[ '[]', '', '' ],
						[ '', '', '' ],
						[ '', '', '' ],
						[ '', '', '' ]
					], { tableWidth: '100%', columnWidths: '33.33%,33.33%,33.34%' } )
				);

				await editor.destroy();
			} );

			it( 'should not have auto headings not to be greater than table rows and columns', async () => {
				const editor = await ModelTestEditor
					.create( {
						plugins: [ Paragraph, TableEditing, TableColumnResize ],
						table: {
							defaultHeadings: { rows: 3, columns: 3 }
						}
					} );

				const model = editor.model;
				const command = new InsertTableLayoutCommand( editor );

				setData( model, '[]' );

				command.execute( { rows: 2, columns: 2 } );

				expect( getData( model ) ).to.equal(
					modelTable( [
						[ '[]', '' ],
						[ '', '' ]
					], { tableWidth: '100%', columnWidths: '50%,50%' } )
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
						plugins: [ Paragraph, TableEditing, TableColumnResize ],
						table: {
							defaultHeadings: { rows: 1 }
						}
					} );

				model = editor.model;
				command = new InsertTableLayoutCommand( editor );

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
				setData( model, '<paragraph pretty="true" smart="true">[]</paragraph>' );

				command.execute( { rows: 2, columns: 2 } );

				expect( getData( model ) ).to.equal(
					modelTable( [
						[ '[]', '' ],
						[ '', '' ]
					], { pretty: true, smart: true, tableWidth: '100%', columnWidths: '50%,50%' } )
				);
			} );

			it( 'should copy attributes from first selected element', () => {
				setData( model, '<paragraph pretty="true">[foo</paragraph><paragraph smart="true" >bar]</paragraph>' );

				command.execute( { rows: 2, columns: 2 } );

				expect( getData( model ) ).to.equal(
					modelTable( [
						[ '[]', '' ],
						[ '', '' ]
					], { pretty: true, tableWidth: '100%', columnWidths: '50%,50%' } ) +
					'<paragraph pretty="true">foo</paragraph>' +
					'<paragraph smart="true">bar</paragraph>'
				);
			} );

			it( 'should only copy $block attributes marked with copyOnReplace', () => {
				setData( model, '<paragraph pretty="true" smart="true" nice="false">[]</paragraph>' );

				command.execute( { rows: 2, columns: 2 } );

				expect( getData( model ) ).to.equal(
					modelTable( [
						[ '[]', '' ],
						[ '', '' ]
					], { pretty: true, smart: true, tableWidth: '100%', columnWidths: '50%,50%' } )
				);
			} );

			it( 'should copy attributes from object when it is selected during insertion', () => {
				model.schema.register( 'object', { isObject: true, inheritAllFrom: '$blockObject' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

				setData( model, '[<object pretty="true" smart="true"></object>]' );

				command.execute( { rows: 2, columns: 2 } );

				expect( getData( model ) ).to.equal(
					modelTable( [
						[ '[]', '' ],
						[ '', '' ]
					], { pretty: true, smart: true, tableWidth: '100%', columnWidths: '50%,50%' } )
				);
			} );
		} );
	} );
} );
