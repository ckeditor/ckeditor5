/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting';

import TableEditing from '../src/tableediting';
import { formatTable, formattedModelTable, formattedViewTable, modelTable } from './_utils/utils';
import InsertRowCommand from '../src/commands/insertrowcommand';
import InsertTableCommand from '../src/commands/inserttablecommand';
import InsertColumnCommand from '../src/commands/insertcolumncommand';
import RemoveRowCommand from '../src/commands/removerowcommand';
import RemoveColumnCommand from '../src/commands/removecolumncommand';
import SplitCellCommand from '../src/commands/splitcellcommand';
import MergeCellsCommand from '../src/commands/mergecellscommand';
import SetHeaderRowCommand from '../src/commands/setheaderrowcommand';
import SetHeaderColumnCommand from '../src/commands/setheadercolumncommand';
import MediaEmbedEditing from '@ckeditor/ckeditor5-media-embed/src/mediaembedediting';

describe( 'TableEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, Paragraph, ImageEditing, MediaEmbedEditing ]
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
		expect( TableEditing.pluginName ).to.equal( 'TableEditing' );
	} );

	it( 'should set proper schema rules', () => {
		// Table:
		expect( model.schema.isRegistered( 'table' ) ).to.be.true;
		expect( model.schema.isObject( 'table' ) ).to.be.true;
		expect( model.schema.isBlock( 'table' ) ).to.be.true;
		expect( model.schema.isLimit( 'table' ) ).to.be.true;

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

		expect( model.schema.checkChild( [ '$root' ], 'tableCell' ) ).to.be.false;
		expect( model.schema.checkChild( [ 'table' ], 'tableCell' ) ).to.be.false;
		expect( model.schema.checkChild( [ 'tableRow' ], 'tableCell' ) ).to.be.true;
		expect( model.schema.checkChild( [ 'tableCell' ], 'tableCell' ) ).to.be.false;

		expect( model.schema.checkAttribute( [ 'tableCell' ], 'colspan' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ 'tableCell' ], 'rowspan' ) ).to.be.true;

		// Table cell contents:
		expect( model.schema.checkChild( [ '$root', 'table', 'tableRow', 'tableCell' ], '$text' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', 'table', 'tableRow', 'tableCell' ], '$block' ) ).to.be.true;
		expect( model.schema.checkChild( [ '$root', 'table', 'tableRow', 'tableCell' ], 'table' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', 'table', 'tableRow', 'tableCell' ], 'image' ) ).to.be.true;
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

	it( 'adds splitCellVertically command', () => {
		expect( editor.commands.get( 'splitTableCellVertically' ) ).to.be.instanceOf( SplitCellCommand );
	} );

	it( 'adds splitCellHorizontally command', () => {
		expect( editor.commands.get( 'splitTableCellHorizontally' ) ).to.be.instanceOf( SplitCellCommand );
	} );

	it( 'adds mergeTableCells command', () => {
		expect( editor.commands.get( 'mergeTableCells' ) ).to.be.instanceOf( MergeCellsCommand );
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
					.to.equal( '<table><tableRow><tableCell><image src="sample.png"></image></tableCell></tableRow></table>' );
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
		} );
	} );

	describe( 'caret movement', () => {
		let domEvtDataStub;

		beforeEach( () => {
			domEvtDataStub = {
				keyCode: getCode( 'Tab' ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
		} );

		it( 'should do nothing if not tab pressed', () => {
			setModelData( model, modelTable( [
				[ '11', '12[]' ]
			] ) );

			domEvtDataStub.keyCode = getCode( 'a' );

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '11', '12[]' ]
			] ) );
		} );

		it( 'should do nothing if Ctrl+Tab is pressed', () => {
			setModelData( model, modelTable( [
				[ '11', '12[]' ]
			] ) );

			domEvtDataStub.ctrlKey = true;

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '11', '12[]' ]
			] ) );
		} );

		describe( 'on TAB', () => {
			it( 'should do nothing if selection is not in a table', () => {
				setModelData( model, '<paragraph>[]</paragraph>' + modelTable( [ [ '11', '12' ] ] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.notCalled( domEvtDataStub.preventDefault );
				sinon.assert.notCalled( domEvtDataStub.stopPropagation );
				expect( formatTable( getModelData( model ) ) )
					.to.equal( '<paragraph>[]</paragraph>' + formattedModelTable( [ [ '11', '12' ] ] ) );
			} );

			it( 'should move to next cell', () => {
				setModelData( model, modelTable( [
					[ '11[]', '12' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '[12]' ]
				] ) );
			} );

			it( 'should create another row and move to first cell in new row', () => {
				setModelData( model, modelTable( [
					[ '11', '[12]' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '12' ],
					[ '[]', '' ]
				] ) );
			} );

			it( 'should not create another row and not move the caret if insertTableRowBelow command is disabled', () => {
				setModelData( model, modelTable( [
					[ '11', '12[]' ]
				] ) );

				const insertTableRowBelowCommand = editor.commands.get( 'insertTableRowBelow' );

				insertTableRowBelowCommand.forceDisabled( 'test' );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '12[]' ]
				] ) );
			} );

			it( 'should move to the first cell of next row if on end of a row', () => {
				setModelData( model, modelTable( [
					[ '11', '12[]' ],
					[ '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '12' ],
					[ '[21]', '22' ]
				] ) );
			} );

			it( 'should move to the next table cell if part of block content is selected', () => {
				setModelData( model, modelTable( [
					[ '11', '<paragraph>12</paragraph><paragraph>[foo]</paragraph><paragraph>bar</paragraph>', '13' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[
						'11',
						'<paragraph>12</paragraph><paragraph>foo</paragraph><paragraph>bar</paragraph>',
						'[13]'
					]
				] ) );
			} );

			it( 'should move to next cell with an image', () => {
				setModelData( model, modelTable( [
					[ '11[]', '<paragraph>foo</paragraph><image></image>' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '<paragraph>[foo</paragraph><image></image>]' ]
				] ) );
			} );

			it( 'should move to next cell with an blockQuote', () => {
				model.schema.register( 'blockQuote', {
					allowWhere: '$block',
					allowContentOf: '$root'
				} );
				editor.conversion.elementToElement( { model: 'blockQuote', view: 'blockquote' } );

				setModelData( model, modelTable( [
					[ '11[]', '<blockQuote><paragraph>foo</paragraph></blockQuote>' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '<blockQuote><paragraph>[foo]</paragraph></blockQuote>' ]
				] ) );
			} );

			it( 'should listen with lower priority then its children', () => {
				// Cancel TAB event.
				editor.keystrokes.set( 'Tab', ( data, cancel ) => cancel() );

				setModelData( model, modelTable( [
					[ '11[]', '12' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

				expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '11[]', '12' ]
				] ) );
			} );

			describe( 'on table widget selected', () => {
				beforeEach( () => {
					editor.model.schema.register( 'block', {
						allowWhere: '$block',
						allowContentOf: '$block',
						isObject: true
					} );

					editor.conversion.elementToElement( { model: 'block', view: 'block' } );
				} );

				it( 'should move caret to the first table cell on TAB', () => {
					const spy = sinon.spy();

					editor.keystrokes.set( 'Tab', spy, { priority: 'lowest' } );

					setModelData( model, '[' + modelTable( [
						[ '11', '12' ]
					] ) + ']' );

					editor.editing.view.document.fire( 'keydown', domEvtDataStub );

					sinon.assert.calledOnce( domEvtDataStub.preventDefault );
					sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

					expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
						[ '[11]', '12' ]
					] ) );

					// Should cancel event - so no other tab handler is called.
					sinon.assert.notCalled( spy );
				} );

				it( 'shouldn\'t do anything on other blocks', () => {
					const spy = sinon.spy();

					editor.editing.view.document.on( 'keydown', spy );

					setModelData( model, '[<block>foo</block>]' );

					editor.editing.view.document.fire( 'keydown', domEvtDataStub );

					sinon.assert.notCalled( domEvtDataStub.preventDefault );
					sinon.assert.notCalled( domEvtDataStub.stopPropagation );

					expect( formatTable( getModelData( model ) ) ).to.equal( '[<block>foo</block>]' );

					// Should not cancel event.
					sinon.assert.calledOnce( spy );
				} );
			} );
		} );

		describe( 'on SHIFT+TAB', () => {
			beforeEach( () => {
				domEvtDataStub.shiftKey = true;
			} );

			it( 'should do nothing if selection is not in a table', () => {
				setModelData( model, '<paragraph>[]</paragraph>' + modelTable( [
					[ '11', '12' ]
				] ) );

				domEvtDataStub.keyCode = getCode( 'Tab' );
				domEvtDataStub.shiftKey = true;

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.notCalled( domEvtDataStub.preventDefault );
				sinon.assert.notCalled( domEvtDataStub.stopPropagation );
				expect( formatTable( getModelData( model ) ) )
					.to.equal( '<paragraph>[]</paragraph>' + formattedModelTable( [ [ '11', '12' ] ] ) );
			} );

			it( 'should move to previous cell', () => {
				setModelData( model, modelTable( [
					[ '11', '12[]' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

				expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '[11]', '12' ]
				] ) );
			} );

			it( 'should not move if caret is in first table cell', () => {
				setModelData( model, '<paragraph>foo</paragraph>' + modelTable( [
					[ '[]11', '12' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( formatTable( getModelData( model ) ) ).to.equal(
					'<paragraph>foo</paragraph>' + formattedModelTable( [ [ '[]11', '12' ] ] )
				);
			} );

			it( 'should move to the last cell of previous row if on beginning of a row', () => {
				setModelData( model, modelTable( [
					[ '11', '12' ],
					[ '[]21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '11', '[12]' ],
					[ '21', '22' ]
				] ) );
			} );

			it( 'should move to the previous table cell if part of block content is selected', () => {
				setModelData( model, modelTable( [
					[ '11', '<paragraph>12</paragraph><paragraph>[foo]</paragraph><paragraph>bar</paragraph>', '13' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[
						'[11]',
						'<paragraph>12</paragraph><paragraph>foo</paragraph><paragraph>bar</paragraph>',
						'13'
					]
				] ) );
			} );

			it( 'should move to previous cell with an image', () => {
				setModelData( model, modelTable( [
					[ '<paragraph>foo</paragraph><image></image>', 'bar[]' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
					[ '<paragraph>[foo</paragraph><image></image>]', 'bar' ]
				] ) );
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
			expect( formatTable( getModelData( model ) ) ).to.equal( '<paragraph>[]foo</paragraph>' );
		} );

		it( 'should do nothing if table cell has already a block content', () => {
			setModelData( model, modelTable( [
				[ '<paragraph>[]11</paragraph>' ]
			] ) );

			viewDocument.fire( 'enter', evtDataStub );

			sinon.assert.notCalled( editor.execute );
			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
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
			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]11' ]
			] ) );
		} );
	} );

	describe( 'table selection', () => {
		let view, domEvtDataStub;

		beforeEach( () => {
			view = editor.editing.view;

			domEvtDataStub = {
				domEvent: {
					buttons: 1
				},
				target: undefined,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};
		} );

		it( 'should not start table selection when mouse move is inside one table cell', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );

			view.document.fire( 'mousedown', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			view.document.fire( 'mousemove', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should start table selection when mouse move expands over two cells', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );

			expect( formatTable( getViewData( view ) ) ).to.equal( formattedViewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ '10', '11' ]
			], { asWidget: true } ) );
		} );

		it( 'should select rectangular table cells when mouse moved to diagonal cell (up -> down)', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true } ]
			] ) );

			expect( formatTable( getViewData( view ) ) ).to.equal( formattedViewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ { contents: '10', class: 'selected', isSelected: true }, { contents: '11', class: 'selected', isSelected: true } ]
			], { asWidget: true } ) );
		} );

		it( 'should select rectangular table cells when mouse moved to diagonal cell (down -> up)', () => {
			setModelData( model, modelTable( [
				[ '00', '01' ],
				[ '10', '[]11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousedown', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '00', '01' ],
				[ '10', '[]11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousemove', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true } ]
			] ) );

			expect( formatTable( getViewData( view ) ) ).to.equal( formattedViewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ { contents: '10', class: 'selected', isSelected: true }, { contents: '11', class: 'selected', isSelected: true } ]
			], { asWidget: true } ) );
		} );

		it( 'should update view selection after changing selection rect', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01', '02' ],
				[ '10', '11', '12' ],
				[ '20', '21', '22' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			selectTableCell( domEvtDataStub, view, 0, 0, 2, 2 );
			view.document.fire( 'mousemove', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true }, { contents: '02', isSelected: true } ],
				[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true }, { contents: '12', isSelected: true } ],
				[ { contents: '20', isSelected: true }, { contents: '21', isSelected: true }, { contents: '22', isSelected: true } ]
			] ) );

			expect( formatTable( getViewData( view ) ) ).to.equal( formattedViewTable( [
				[
					{ contents: '00', class: 'selected', isSelected: true },
					{ contents: '01', class: 'selected', isSelected: true },
					{ contents: '02', class: 'selected', isSelected: true }
				],
				[
					{ contents: '10', class: 'selected', isSelected: true },
					{ contents: '11', class: 'selected', isSelected: true },
					{ contents: '12', class: 'selected', isSelected: true }
				],
				[
					{ contents: '20', class: 'selected', isSelected: true },
					{ contents: '21', class: 'selected', isSelected: true },
					{ contents: '22', class: 'selected', isSelected: true }
				]
			], { asWidget: true } ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true }, '02' ],
				[ { contents: '10', isSelected: true }, { contents: '11', isSelected: true }, '12' ],
				[ '20', '21', '22' ]
			] ) );

			expect( formatTable( getViewData( view ) ) ).to.equal( formattedViewTable( [
				[
					{ contents: '00', class: 'selected', isSelected: true },
					{ contents: '01', class: 'selected', isSelected: true },
					'02'
				],
				[
					{ contents: '10', class: 'selected', isSelected: true },
					{ contents: '11', class: 'selected', isSelected: true },
					'12'
				],
				[
					'20',
					'21',
					'22'
				]
			], { asWidget: true } ) );
		} );

		it( 'should stop selecting after "mouseup" event', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			view.document.fire( 'mouseup', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );

			expect( formatTable( getViewData( view ) ) ).to.equal( formattedViewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ '10', '11' ]
			], { asWidget: true } ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should stop selection mode on "mouseleve" event', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			view.document.fire( 'mouseleave', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );

			expect( formatTable( getViewData( view ) ) ).to.equal( formattedViewTable( [
				[ { contents: '00', class: 'selected', isSelected: true }, { contents: '01', class: 'selected', isSelected: true } ],
				[ '10', '11' ]
			], { asWidget: true } ) );

			selectTableCell( domEvtDataStub, view, 0, 0, 1, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ { contents: '00', isSelected: true }, { contents: '01', isSelected: true } ],
				[ '10', '11' ]
			] ) );
		} );

		it( 'should clear view table selection after mouse click outside table', () => {
			setModelData( model, modelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) + '<paragraph>foo</paragraph>' );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 0 );
			view.document.fire( 'mousedown', domEvtDataStub );

			expect( formatTable( getModelData( model ) ) ).to.equal( formattedModelTable( [
				[ '[]00', '01' ],
				[ '10', '11' ]
			] ) + '<paragraph>foo</paragraph>' );

			selectTableCell( domEvtDataStub, view, 0, 0, 0, 1 );
			view.document.fire( 'mousemove', domEvtDataStub );

			domEvtDataStub.target = view.document.getRoot().getChild( 1 );

			view.document.fire( 'mousemove', domEvtDataStub );
			view.document.fire( 'mousedown', domEvtDataStub );
			view.document.fire( 'mouseup', domEvtDataStub );

			// The click in the DOM would trigger selection change and it will set the selection:
			model.change( writer => {
				writer.setSelection( writer.createRange( writer.createPositionAt( model.document.getRoot().getChild( 1 ), 0 ) ) );
			} );

			expect( formatTable( getViewData( view ) ) ).to.equal( formattedViewTable( [
				[ '00', '01' ],
				[ '10', '11' ]
			], { asWidget: true } ) + '<p>{}foo</p>' );
		} );
	} );
} );

function selectTableCell( domEvtDataStub, view, tableIndex, sectionIndex, rowInSectionIndex, tableCellIndex ) {
	domEvtDataStub.target = view.document.getRoot()
		.getChild( tableIndex )
		.getChild( 1 ) // Table is second in widget
		.getChild( sectionIndex )
		.getChild( rowInSectionIndex )
		.getChild( tableCellIndex );
}
