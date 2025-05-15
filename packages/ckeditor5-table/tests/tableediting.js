/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';

import TableEditing from '../src/tableediting.js';
import { modelTable } from './_utils/utils.js';
import InsertRowCommand from '../src/commands/insertrowcommand.js';
import InsertTableCommand from '../src/commands/inserttablecommand.js';
import InsertColumnCommand from '../src/commands/insertcolumncommand.js';
import RemoveRowCommand from '../src/commands/removerowcommand.js';
import RemoveColumnCommand from '../src/commands/removecolumncommand.js';
import SelectRowCommand from '../src/commands/selectrowcommand.js';
import SelectColumnCommand from '../src/commands/selectcolumncommand.js';
import SplitCellCommand from '../src/commands/splitcellcommand.js';
import MergeCellCommand from '../src/commands/mergecellcommand.js';
import SetHeaderRowCommand from '../src/commands/setheaderrowcommand.js';
import SetHeaderColumnCommand from '../src/commands/setheadercolumncommand.js';
import MediaEmbedEditing from '@ckeditor/ckeditor5-media-embed/src/mediaembedediting.js';

describe( 'TableEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, Paragraph, ImageBlockEditing, MediaEmbedEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableEditing.pluginName ).to.equal( 'TableEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should set proper schema rules', () => {
		// Table:
		expect( model.schema.isRegistered( 'table' ) ).to.be.true;
		expect( model.schema.isObject( 'table' ) ).to.be.true;
		expect( model.schema.isBlock( 'table' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root' ], 'table' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'headingRows' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'headingColumns' ) ).to.be.true;

		// Table row:
		expect( model.schema.isRegistered( 'tableRow' ) ).to.be.true;
		expect( model.schema.isLimit( 'tableRow' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root' ], 'tableRow' ) ).to.be.false;
		expect( model.schema.checkChild( [ 'table' ], 'tableRow' ) ).to.be.true;

		// Table cell:
		expect( model.schema.isRegistered( 'tableCell' ) ).to.be.true;
		expect( model.schema.isLimit( 'tableCell' ) ).to.be.true;
		expect( model.schema.isObject( 'tableCell' ) ).to.be.false;
		expect( model.schema.isSelectable( 'tableCell' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root' ], 'tableCell' ) ).to.be.false;
		expect( model.schema.checkChild( [ 'table' ], 'tableCell' ) ).to.be.false;
		expect( model.schema.checkChild( [ 'tableRow' ], 'tableCell' ) ).to.be.true;
		expect( model.schema.checkChild( [ 'tableCell' ], 'tableCell' ) ).to.be.false;

		expect( model.schema.checkAttribute( [ 'tableCell' ], 'colspan' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ 'tableCell' ], 'rowspan' ) ).to.be.true;

		// Table cell contents:
		expect( model.schema.checkChild( [ '$root', 'table', 'tableRow', 'tableCell' ], '$text' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', 'table', 'tableRow', 'tableCell' ], '$block' ) ).to.be.true;
		expect( model.schema.checkChild( [ '$root', 'table', 'tableRow', 'tableCell' ], 'table' ) ).to.be.true;
		expect( model.schema.checkChild( [ '$root', 'table', 'tableRow', 'tableCell' ], 'imageBlock' ) ).to.be.true;
	} );

	it( 'inherits attributes from $blockObject', () => {
		model.schema.extend( '$blockObject', {
			allowAttributes: 'foo'
		} );

		expect( model.schema.checkAttribute( 'table', 'foo' ) ).to.be.true;
	} );

	it( 'adds insertTable command', () => {
		expect( editor.commands.get( 'insertTable' ) ).to.be.instanceOf( InsertTableCommand );
	} );

	it( 'adds insertRowAbove command', () => {
		expect( editor.commands.get( 'insertTableRowAbove' ) ).to.be.instanceOf( InsertRowCommand );
	} );

	it( 'adds insertRowBelow command', () => {
		expect( editor.commands.get( 'insertTableRowBelow' ) ).to.be.instanceOf( InsertRowCommand );
	} );

	it( 'adds insertColumnLeft command', () => {
		expect( editor.commands.get( 'insertTableColumnLeft' ) ).to.be.instanceOf( InsertColumnCommand );
	} );

	it( 'adds insertColumnRight command', () => {
		expect( editor.commands.get( 'insertTableColumnRight' ) ).to.be.instanceOf( InsertColumnCommand );
	} );

	it( 'adds removeRow command', () => {
		expect( editor.commands.get( 'removeTableRow' ) ).to.be.instanceOf( RemoveRowCommand );
	} );

	it( 'adds removeColumn command', () => {
		expect( editor.commands.get( 'removeTableColumn' ) ).to.be.instanceOf( RemoveColumnCommand );
	} );

	it( 'adds selectRow command', () => {
		expect( editor.commands.get( 'selectTableRow' ) ).to.be.instanceOf( SelectRowCommand );
	} );

	it( 'adds selectColumn command', () => {
		expect( editor.commands.get( 'selectTableColumn' ) ).to.be.instanceOf( SelectColumnCommand );
	} );

	it( 'adds splitCellVertically command', () => {
		expect( editor.commands.get( 'splitTableCellVertically' ) ).to.be.instanceOf( SplitCellCommand );
	} );

	it( 'adds splitCellHorizontally command', () => {
		expect( editor.commands.get( 'splitTableCellHorizontally' ) ).to.be.instanceOf( SplitCellCommand );
	} );

	it( 'adds mergeCellRight command', () => {
		expect( editor.commands.get( 'mergeTableCellRight' ) ).to.be.instanceOf( MergeCellCommand );
	} );

	it( 'adds mergeCellLeft command', () => {
		expect( editor.commands.get( 'mergeTableCellLeft' ) ).to.be.instanceOf( MergeCellCommand );
	} );

	it( 'adds mergeCellDown command', () => {
		expect( editor.commands.get( 'mergeTableCellDown' ) ).to.be.instanceOf( MergeCellCommand );
	} );

	it( 'adds mergeCellUp command', () => {
		expect( editor.commands.get( 'mergeTableCellUp' ) ).to.be.instanceOf( MergeCellCommand );
	} );

	it( 'adds setColumnHeader command', () => {
		expect( editor.commands.get( 'setTableColumnHeader' ) ).to.be.instanceOf( SetHeaderColumnCommand );
	} );

	it( 'adds setRowHeader command', () => {
		expect( editor.commands.get( 'setTableRowHeader' ) ).to.be.instanceOf( SetHeaderRowCommand );
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should create tbody section', () => {
				setModelData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );

				expect( editor.getData() ).to.equal(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr><td>foo</td></tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should create thead section', () => {
				setModelData(
					model,
					'<table headingRows="1"><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>'
				);

				expect( editor.getData() ).to.equal(
					'<figure class="table">' +
						'<table>' +
							'<thead>' +
								'<tr><th>foo</th></tr>' +
							'</thead>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert table', () => {
				editor.setData( '<table><tbody><tr><td>foo</td></tr></tbody></table>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<table><tableRow><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>' );
			} );

			it( 'should convert table with image', () => {
				editor.setData( '<table><tbody><tr><td><img src="sample.png"></td></tr></tbody></table>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<table><tableRow><tableCell><imageBlock src="sample.png"></imageBlock></tableCell></tableRow></table>' );
			} );

			it( 'should insert a paragraph when the cell content is unsupported', () => {
				editor.setData(
					'<table><tbody><tr><td><foo></foo></td></tr></tbody></table>'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>' );
			} );

			it( 'should convert a table with media', () => {
				editor.setData(
					'<table><tbody><tr><td><oembed url="https://www.youtube.com/watch?v=H08tGjXNHO4"></oembed></td></tr></tbody></table>'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<table><tableRow><tableCell>' +
						'<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>' +
					'</tableCell></tableRow></table>' );
			} );

			it( 'should convert table when colspan is string', () => {
				editor.setData( '<table><tbody><tr><td colspan="abc">foo</td></tr></tbody></table>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<table><tableRow><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>' );
			} );

			it( 'should convert table with colspan 0', () => {
				editor.setData( '<table><tbody><tr><td colspan="0">foo</td></tr></tbody></table>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<table><tableRow><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>' );
			} );

			it( 'should convert table with negative rowspan and colspan', () => {
				editor.setData( '<table><tbody><tr><td colspan="-1" rowspan="-1">foo</td></tr></tbody></table>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<table><tableRow><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>' );
			} );
		} );
	} );

	describe( 'enter key', () => {
		let evtDataStub, viewDocument;

		beforeEach( () => {
			evtDataStub = {
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy(),
				isSoft: false
			};

			return VirtualTestEditor
				.create( {
					plugins: [ TableEditing, Paragraph ]
				} )
				.then( newEditor => {
					editor = newEditor;

					sinon.stub( editor, 'execute' );

					viewDocument = editor.editing.view.document;
					model = editor.model;
				} );
		} );

		it( 'should do nothing if not in table cell', () => {
			setModelData( model, '<paragraph>[]foo</paragraph>' );

			viewDocument.fire( 'enter', evtDataStub );

			sinon.assert.notCalled( editor.execute );
			expect( getModelData( model ) ).to.equalMarkup( '<paragraph>[]foo</paragraph>' );
		} );

		it( 'should do nothing if table cell has already a block content', () => {
			setModelData( model, modelTable( [
				[ '<paragraph>[]11</paragraph>' ]
			] ) );

			viewDocument.fire( 'enter', evtDataStub );

			sinon.assert.notCalled( editor.execute );
			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '<paragraph>[]11</paragraph>' ]
			] ) );
		} );

		it( 'should do nothing if table cell with a block content is selected as a whole', () => {
			setModelData( model, modelTable( [
				[ '<paragraph>[1</paragraph><paragraph>1]</paragraph>' ]
			] ) );

			viewDocument.fire( 'enter', evtDataStub );

			sinon.assert.notCalled( editor.execute );
			setModelData( model, modelTable( [
				[ '<paragraph>[1</paragraph><paragraph>1]</paragraph>' ]
			] ) );
		} );

		it( 'should allow default behavior of Shift+Enter pressed', () => {
			setModelData( model, modelTable( [
				[ '[]11' ]
			] ) );

			evtDataStub.isSoft = true;
			viewDocument.fire( 'enter', evtDataStub );

			sinon.assert.notCalled( editor.execute );
			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '[]11' ]
			] ) );
		} );
	} );
} );
