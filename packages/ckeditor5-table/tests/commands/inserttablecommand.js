/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

import TableEditing from '../../src/tableediting';
import { modelTable } from '../_utils/utils';

import InsertTableCommand from '../../src/commands/inserttablecommand';
import TablePropertiesEditing from '../../src/tableproperties/tablepropertiesediting';
import TableCellPropertiesEditing from '../../src/tablecellproperties/tablecellpropertiesediting';

describe( 'InsertTableCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ Paragraph, TableEditing ]
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
				setData( model, '[]' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if in paragraph', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if in table', () => {
				setData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'when selection is not collapsed', () => {
			it( 'should be false if an object is selected', () => {
				model.schema.register( 'media', { isObject: true, isBlock: true, allowWhere: '$block' } );

				setData( model, '[<media url="http://ckeditor.com"></media>]' );
				expect( command.isEnabled ).to.be.false;
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

				assertEqualMarkup( getData( model ), modelTable( [
					[ '[]', '' ],
					[ '', '' ]
				] ) );
			} );

			it( 'should insert table with two rows and two columns after non-empty paragraph if selection is at the end', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				command.execute();

				assertEqualMarkup( getData( model ),
					'<paragraph>foo</paragraph>' +
					modelTable( [
						[ '[]', '' ],
						[ '', '' ]
					] )
				);
			} );

			it( 'should insert table with given rows and columns after non-empty paragraph', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				command.execute( { rows: 3, columns: 4 } );

				assertEqualMarkup( getData( model ),
					'<paragraph>foo</paragraph>' +
					modelTable( [
						[ '[]', '', '', '' ],
						[ '', '', '', '' ],
						[ '', '', '', '' ]
					] )
				);
			} );

			it( 'should insert table with given heading rows and heading columns after non-empty paragraph', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				command.execute( { rows: 3, columns: 4, headingRows: 1, headingColumns: 2 } );

				assertEqualMarkup( getData( model ),
					'<paragraph>foo</paragraph>' +
					modelTable( [
						[ '[]', '', '', '' ],
						[ '', '', '', '' ],
						[ '', '', '', '' ]
					], { headingRows: 1, headingColumns: 2 } )
				);
			} );

			it( 'should insert table before after non-empty paragraph if selection is inside', () => {
				setData( model, '<paragraph>f[]oo</paragraph>' );

				command.execute();

				assertEqualMarkup( getData( model ),
					modelTable( [
						[ '[]', '' ],
						[ '', '' ]
					] ) +
					'<paragraph>foo</paragraph>'
				);
			} );

			it( 'should replace empty paragraph with table', () => {
				setData( model, '<paragraph>[]</paragraph>' );

				command.execute( { rows: 3, columns: 4 } );

				assertEqualMarkup( getData( model ),
					modelTable( [
						[ '[]', '', '', '' ],
						[ '', '', '', '' ],
						[ '', '', '', '' ]
					] )
				);
			} );

			describe( 'integration with TablePropertiesEditing', () => {
				let editor, model, command, tableUtils;

				beforeEach( () => {
					return ModelTestEditor
						.create( {
							plugins: [ Paragraph, TableEditing, TablePropertiesEditing ]
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							setData( model, '<paragraph>[]</paragraph>' );

							command = editor.commands.get( 'insertTable' );
							tableUtils = editor.plugins.get( 'TableUtils' );
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				it(
					'should pass the default table styles to "TableUtils.createTable()" function if TablePropertiesEditing is enabled',
					() => {
						const createTableStub = sinon.stub( tableUtils, 'createTable' ).callThrough();

						command.execute();

						expect( createTableStub.callCount ).to.equal( 1 );
						expect( createTableStub.firstCall.args[ 1 ] ).to.deep.equal( {
							defaultProperties: { alignment: 'center' }
						} );
					}
				);

				it( 'should create the table with applied the default properties', () => {
					const defaultProperties = {
						borderStyle: 'solid',
						borderWidth: '2px',
						borderColor: '#f00',
						alignment: 'right'
					};

					editor.config.set( 'table.tableProperties.defaultProperties', defaultProperties );

					command.execute();

					assertEqualMarkup( getData( model ),
						modelTable( [
							[ '[]', '' ],
							[ '', '' ]
						], { ...defaultProperties } )
					);
				} );
			} );

			describe( 'integration with TableCellPropertiesEditing', () => {
				let editor, model, command, tableUtils;

				beforeEach( () => {
					return ModelTestEditor
						.create( {
							plugins: [ Paragraph, TableEditing, TableCellPropertiesEditing ]
						} )
						.then( newEditor => {
							editor = newEditor;
							model = editor.model;
							setData( model, '<paragraph>[]</paragraph>' );

							command = editor.commands.get( 'insertTable' );
							tableUtils = editor.plugins.get( 'TableUtils' );
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				it(
					'should pass the default cell styles to "TableUtils.createTable()" function if TableCellPropertiesEditing is enabled',
					() => {
						const createTableStub = sinon.stub( tableUtils, 'createTable' ).callThrough();

						command.execute();

						expect( createTableStub.callCount ).to.equal( 1 );
						expect( createTableStub.firstCall.args[ 1 ] ).to.deep.equal( {
							defaultCellProperties: {
								horizontalAlignment: 'center',
								verticalAlignment: 'middle'
							}
						} );
					}
				);

				it( 'should create the table and all cells should have applied the default cell properties', () => {
					const defaultProperties = {
						borderStyle: 'solid',
						borderWidth: '2px',
						borderColor: '#f00',
						horizontalAlignment: 'right',
						verticalAlignment: 'bottom'
					};

					editor.config.set( 'table.tableCellProperties.defaultProperties', defaultProperties );

					command.execute();

					assertEqualMarkup( getData( model ),
						modelTable( [
							[ '[]', '' ],
							[ '', '' ]
						], { defaultCellProperties: defaultProperties } )
					);
				} );
			} );
		} );
	} );
} );
