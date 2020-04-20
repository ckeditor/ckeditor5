import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { modelTable } from './_utils/utils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting';
import MediaEmbedEditing from '@ckeditor/ckeditor5-media-embed/src/mediaembedediting';
import TableNavigation from '../src/tablenavigation';
import Table from '../src/table';
import TableEditing from '../src/tableediting';
import TableSelection from '../src/tableselection';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting';
import HorizontalLineEditing from '@ckeditor/ckeditor5-horizontal-line/src/horizontallineediting';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

describe( 'TableNavigation', () => {
	let editor, model, modelRoot, tableSelection;

	const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAUCAQAAADRyVAeAAAAKklEQVR42u3PAQ0AAAwCI' +
		'O0f+u/hoAHNZUJFRERERERERERERERERLYiD9N4FAFj2iK6AAAAAElFTkSuQmCC';

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, TableNavigation, TableSelection, Paragraph, ImageEditing, ImageCaptionEditing, MediaEmbedEditing,
					HorizontalLineEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
				modelRoot = model.document.getRoot();
				tableSelection = editor.plugins.get( TableSelection );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableNavigation.pluginName ).to.equal( 'TableNavigation' );
	} );

	describe( 'Tab key handling', () => {
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
			assertEqualMarkup( getModelData( model ), modelTable( [
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
			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '11', '12[]' ]
			] ) );
		} );

		describe( 'on TAB', () => {
			it( 'should do nothing if selection is not in a table', () => {
				setModelData( model, '<paragraph>[]</paragraph>' + modelTable( [ [ '11', '12' ] ] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.notCalled( domEvtDataStub.preventDefault );
				sinon.assert.notCalled( domEvtDataStub.stopPropagation );
				assertEqualMarkup( getModelData( model ), '<paragraph>[]</paragraph>' + modelTable( [
					[ '11', '12' ]
				] ) );
			} );

			it( 'should move to next cell', () => {
				setModelData( model, modelTable( [
					[ '11[]', '12' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '11', '[12]' ]
				] ) );
			} );

			it( 'should create another row and move to first cell in new row', () => {
				setModelData( model, modelTable( [
					[ '11', '[12]' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				assertEqualMarkup( getModelData( model ), modelTable( [
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

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '11', '12[]' ]
				] ) );
			} );

			it( 'should move to the first cell of next row if on end of a row', () => {
				setModelData( model, modelTable( [
					[ '11', '12[]' ],
					[ '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '11', '12' ],
					[ '[21]', '22' ]
				] ) );
			} );

			it( 'should move to the next table cell if part of block content is selected', () => {
				setModelData( model, modelTable( [
					[ '11', '<paragraph>12</paragraph><paragraph>[foo]</paragraph><paragraph>bar</paragraph>', '13' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[
						'11',
						'<paragraph>12</paragraph><paragraph>foo</paragraph><paragraph>bar</paragraph>',
						'[13]'
					]
				] ) );
			} );

			it( 'should move to next cell with an image', () => {
				setModelData( model, modelTable( [
					[ '11[]', '<paragraph>foo</paragraph><image><caption></caption></image>' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '11', '<paragraph>[foo</paragraph><image><caption></caption></image>]' ]
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
				assertEqualMarkup( getModelData( model ), modelTable( [
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

				assertEqualMarkup( getModelData( model ), modelTable( [
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

					assertEqualMarkup( getModelData( model ), modelTable( [
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

					assertEqualMarkup( getModelData( model ), '[<block>foo</block>]' );

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
				assertEqualMarkup( getModelData( model ), '<paragraph>[]</paragraph>' + modelTable( [
					[ '11', '12' ]
				] ) );
			} );

			it( 'should move to previous cell', () => {
				setModelData( model, modelTable( [
					[ '11', '12[]' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '[11]', '12' ]
				] ) );
			} );

			it( 'should not move if caret is in first table cell', () => {
				setModelData( model, '<paragraph>foo</paragraph>' + modelTable( [
					[ '[]11', '12' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				assertEqualMarkup( getModelData( model ),
					'<paragraph>foo</paragraph>' + modelTable( [ [ '[]11', '12' ] ] )
				);
			} );

			it( 'should move to the last cell of previous row if on beginning of a row', () => {
				setModelData( model, modelTable( [
					[ '11', '12' ],
					[ '[]21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '11', '[12]' ],
					[ '21', '22' ]
				] ) );
			} );

			it( 'should move to the previous table cell if part of block content is selected', () => {
				setModelData( model, modelTable( [
					[ '11', '<paragraph>12</paragraph><paragraph>[foo]</paragraph><paragraph>bar</paragraph>', '13' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				assertEqualMarkup( getModelData( model ), modelTable( [
					[
						'[11]',
						'<paragraph>12</paragraph><paragraph>foo</paragraph><paragraph>bar</paragraph>',
						'13'
					]
				] ) );
			} );

			it( 'should move to previous cell with an image', () => {
				setModelData( model, modelTable( [
					[ '<paragraph>foo</paragraph><image><caption></caption></image>', 'bar[]' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				assertEqualMarkup( getModelData( model ), modelTable( [
					[ '<paragraph>[foo</paragraph><image><caption></caption></image>]', 'bar' ]
				] ) );
			} );
		} );
	} );

	describe( 'Arrow keys handling', () => {
		let leftArrowDomEvtDataStub, rightArrowDomEvtDataStub, upArrowDomEvtDataStub, downArrowDomEvtDataStub;

		beforeEach( () => {
			leftArrowDomEvtDataStub = {
				keyCode: getCode( 'ArrowLeft' ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy(),
				domTarget: global.document.body
			};
			rightArrowDomEvtDataStub = {
				keyCode: getCode( 'ArrowRight' ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy(),
				domTarget: global.document.body
			};
			upArrowDomEvtDataStub = {
				keyCode: getCode( 'ArrowUp' ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy(),
				domTarget: global.document.body
			};
			downArrowDomEvtDataStub = {
				keyCode: getCode( 'ArrowDown' ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy(),
				domTarget: global.document.body
			};
		} );

		it( 'should do nothing if not arrow key pressed', () => {
			setModelData( model, modelTable( [
				[ '00', '01[]' ]
			] ) );

			leftArrowDomEvtDataStub.keyCode = getCode( 'a' );

			editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

			sinon.assert.notCalled( leftArrowDomEvtDataStub.preventDefault );
			sinon.assert.notCalled( leftArrowDomEvtDataStub.stopPropagation );

			assertEqualMarkup( getModelData( model ), modelTable( [
				[ '00', '01[]' ]
			] ) );
		} );

		it( 'should do nothing if selection is not in a table', () => {
			const modelData = '<paragraph>[]foobar</paragraph>' + modelTable( [ [ '00', '01' ] ] );

			setModelData( model, modelData );

			editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

			sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
			sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );

			assertEqualMarkup( getModelData( model ), modelData );
		} );

		describe( '#_navigateFromCellInDirection (finding proper cell to move selection to)', () => {
			let tableNavigation;

			beforeEach( () => {
				tableNavigation = editor.plugins.get( TableNavigation );
			} );

			describe( 'with no col/row-spanned cells', () => {
				beforeEach( () => {
					setModelData( model, '<paragraph>foo</paragraph>' + modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '12' ],
						[ '20', '21', '22' ]
					] ) + '<paragraph>bar</paragraph>' );
				} );

				describe( 'from the first table cell', () => {
					let tableCell;

					beforeEach( () => {
						tableCell = modelRoot.getNodeByPath( [ 1, 0, 0 ] );
					} );

					it( 'should navigate to the start position of the cell on the right when direction is "right"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'right' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '[]01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the start position the cell below when direction is "down"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'down' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '[]10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should select a whole table when direction is "up"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'up' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>[' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + ']<paragraph>bar</paragraph>' );
					} );

					it( 'should select a whole table when direction is "left"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'left' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>[' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + ']<paragraph>bar</paragraph>' );
					} );
				} );

				describe( 'from the last table cell', () => {
					let tableCell;

					beforeEach( () => {
						tableCell = modelRoot.getNodeByPath( [ 1, 2, 2 ] );
					} );

					it( 'should navigate to the end position of the cell on the left when direction is "left"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'left' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21[]', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the end position of the cell above when direction is "up"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'up' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12[]' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should select a whole table when direction is "down"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'down' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>[' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + ']<paragraph>bar</paragraph>' );
					} );

					it( 'should select a whole table when direction is "right"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'right' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>[' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + ']<paragraph>bar</paragraph>' );
					} );
				} );

				describe( 'from a cell in the first column (but not first row)', () => {
					let tableCell;

					beforeEach( () => {
						tableCell = modelRoot.getNodeByPath( [ 1, 1, 0 ] );
					} );

					it( 'should navigate to start position of the cell on the right when direction is "right"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'right' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '[]11', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the end position of the cell above when direction is "up"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'up' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>' + modelTable( [
							[ '00[]', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the start position of the cell below when direction is "down"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'down' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '[]20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the end position of the last cell in the previous row when direction is "left"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'left' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02[]' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );
				} );

				describe( 'from a cell in the last column (but not last row)', () => {
					let tableCell;

					beforeEach( () => {
						tableCell = modelRoot.getNodeByPath( [ 1, 1, 2 ] );
					} );

					it( 'should navigate to the end position of the cell on the left when direction is "left"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'left' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11[]', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the end position the cell above when direction is "up"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'up' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02[]' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the start position of the cell below when direction is "down"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'down' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '[]22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the start position of the first cell in the next row when direction is "right"', () => {
						tableNavigation._navigateFromCellInDirection( tableCell, 'right' );

						assertEqualMarkup( getModelData( model ), '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '[]20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );
				} );
			} );

			describe( 'with col/row-spanned cells', () => {
				beforeEach( () => {
					// +----+----+----+----+----+
					// | 00 | 01 | 02 | 03 | 04 |
					// +----+----+----+----+----+
					// | 10 | 11      | 13 | 14 |
					// +----+         +    +----+
					// | 20 |         |    | 24 |
					// +----+----+----+----+----+
					// | 30 | 31      | 33 | 34 |
					// +----+----+----+----+----+
					// | 40 | 41 | 42 | 43 | 44 |
					// +----+----+----+----+----+
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03', '04' ],
						[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
						[ '20', '24' ],
						[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
						[ '40', '41', '42', '43', '44' ]
					] ) );
				} );

				describe( 'when navigating to the right', () => {
					it( 'should navigate to the row-col-spanned cell when approaching from the upper spanned row', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 0 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'right' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '[]11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-col-spanned cell when approaching from the lower spanned row', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 2, 0 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'right' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '[]11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-spanned cell when approaching from the other row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'right' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '[]13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the cell in the upper spanned row when approaching from the row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 2 ] ); // Cell 13.

						tableNavigation._navigateFromCellInDirection( tableCell, 'right' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '[]14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 3, 0 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'right' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '[]31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate from the col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 3, 1 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'right' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '[]33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );
				} );

				describe( 'when navigating to the left', () => {
					it( 'should navigate to the row-spanned cell when approaching from the upper spanned row', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 3 ] ); // Cell 14.

						tableNavigation._navigateFromCellInDirection( tableCell, 'left' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13[]', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-spanned cell when approaching from the lower spanned row', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 2, 1 ] ); // Cell 24.

						tableNavigation._navigateFromCellInDirection( tableCell, 'left' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13[]', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-spanned cell when approaching from the other row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 2 ] ); // Cell 13.

						tableNavigation._navigateFromCellInDirection( tableCell, 'left' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11[]', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the cell in the upper spanned row when approaching from the row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] ); // Cell 11.

						tableNavigation._navigateFromCellInDirection( tableCell, 'left' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10[]', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 3, 2 ] ); // Cell 33.

						tableNavigation._navigateFromCellInDirection( tableCell, 'left' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31[]', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate from the col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 3, 1 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'left' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30[]', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );
				} );

				describe( 'when navigating down', () => {
					it( 'should navigate to the row-col-spanned cell when approaching from the first spanned column', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'down' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '[]11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-col-spanned cell when approaching from the last spanned column', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 0, 2 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'down' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '[]11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-spanned cell when approaching from the other col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'down' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '[]31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the cell in the first spanned column when approaching from the col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] ); // Cell 11.

						tableNavigation._navigateFromCellInDirection( tableCell, 'down' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '[]31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 0, 3 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'down' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '[]13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate from the row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 2 ] ); // Cell 13.

						tableNavigation._navigateFromCellInDirection( tableCell, 'down' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '[]33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );
				} );

				describe( 'when navigating up', () => {
					it( 'should navigate to the col-spanned cell when approaching from the first spanned column', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 4, 1 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'up' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31[]', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the col-spanned cell when approaching from the last spanned column', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 4, 2 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'up' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31[]', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-col-spanned cell when approaching from the other col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 3, 1 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'up' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11[]', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the cell in the first spanned column when approaching from the col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

						tableNavigation._navigateFromCellInDirection( tableCell, 'up' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01[]', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 3, 2 ] ); // Cell 33.

						tableNavigation._navigateFromCellInDirection( tableCell, 'up' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13[]', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate from the row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 2 ] ); // Cell 13.

						tableNavigation._navigateFromCellInDirection( tableCell, 'up' );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02', '03[]', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );
				} );
			} );
		} );

		describe( 'with the table cells selected from outside', () => {
			describe( 'on single table cell selected', () => {
				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '12' ],
						[ '20', '21', '22' ]
					] ) );

					tableSelection._setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 1 ] )
					);
				} );

				it( 'should move to the cell on the left', () => {
					editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

					sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10[]', '11', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move to the cell on the right', () => {
					editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

					sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '[]12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move to the cell above selection', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01[]', '02' ],
						[ '10', '11', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move to the cell below selection', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '12' ],
						[ '20', '[]21', '22' ]
					] ) );
				} );
			} );

			describe( 'on multiple table cell selected vertically', () => {
				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					tableSelection._setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 2, 1 ] )
					);
				} );

				it( 'should move to the cell on the left top of selection', () => {
					editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

					sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10[]', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );
				} );

				it( 'should move to the cell on the right bottom of selection', () => {
					editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

					sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '[]22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );
				} );

				it( 'should move to the cell above selection', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01[]', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );
				} );

				it( 'should move to the cell below selection', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '[]31', '32', '33' ]
					] ) );
				} );
			} );

			describe( 'on multiple table cell selected horizontally', () => {
				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					// Note that this also tests that selection direction doesn't matter.

					tableSelection._setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 2 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 1 ] )
					);
				} );

				it( 'should move to the cell on the left top of selection', () => {
					editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

					sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10[]', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );
				} );

				it( 'should move to the cell on the right bottom of selection', () => {
					editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

					sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '[]13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );
				} );

				it( 'should move to the cell above selection', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01[]', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );
				} );

				it( 'should move to the cell below selection', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '[]22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );
				} );
			} );

			describe( 'on multiple table cell selected diagonally', () => {
				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					tableSelection._setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 2, 2 ] )
					);
				} );

				it( 'should move to the cell on the left top of selection', () => {
					editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

					sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10[]', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );
				} );

				it( 'should move to the cell on the right bottom of selection', () => {
					editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

					sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '[]23' ],
						[ '30', '31', '32', '33' ]
					] ) );
				} );

				it( 'should move to the cell above selection', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01[]', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );
				} );

				it( 'should move to the cell below selection', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '[]32', '33' ]
					] ) );
				} );
			} );
		} );

		describe( 'with selection inside a table cell', () => {
			describe( 'with selection at the edge of a cell', () => {
				describe( 'simple cell text content', () => {
					it( 'should navigate to the cell on the left', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '[]11', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10[]', '11', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell on the right', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11[]', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '[]12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell above', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '[]11', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01[]', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell below', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11[]', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '[]21', '22' ]
						] ) );
					} );
				} );

				describe( 'multiple paragraphs in the cell content', () => {
					it( 'should navigate to the cell on the left', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<paragraph>[]11</paragraph><paragraph>x</paragraph>', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10[]', '<paragraph>11</paragraph><paragraph>x</paragraph>', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell on the right', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<paragraph>11</paragraph><paragraph>x[]</paragraph>', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<paragraph>11</paragraph><paragraph>x</paragraph>', '[]12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell above', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<paragraph>[]11</paragraph><paragraph>x</paragraph>', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01[]', '02' ],
							[ '10', '<paragraph>11</paragraph><paragraph>x</paragraph>', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell below', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<paragraph>11</paragraph><paragraph>x[]</paragraph>', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<paragraph>11</paragraph><paragraph>x</paragraph>', '12' ],
							[ '20', '[]21', '22' ]
						] ) );
					} );
				} );

				describe( 'image widget with caption as only cell content', () => {
					it( 'should navigate to the cell on the left', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<image src="${ imageUrl }"><caption>[]11</caption></image>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10[]', `<image src="${ imageUrl }"><caption>11</caption></image>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell on the right', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<image src="${ imageUrl }"><caption>11[]</caption></image>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<image src="${ imageUrl }"><caption>11</caption></image>`, '[]12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell above', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<image src="${ imageUrl }"><caption>[]11</caption></image>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01[]', '02' ],
							[ '10', `<image src="${ imageUrl }"><caption>11</caption></image>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell below', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<image src="${ imageUrl }"><caption>11[]</caption></image>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<image src="${ imageUrl }"><caption>11</caption></image>`, '12' ],
							[ '20', '[]21', '22' ]
						] ) );
					} );
				} );

				describe( 'horizontal line as only cell content (widget without $text positions)', () => {
					beforeEach( () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '[<horizontalLine></horizontalLine>]', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell on the left', () => {
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10[]', '<horizontalLine></horizontalLine>', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell on the right', () => {
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<horizontalLine></horizontalLine>', '[]12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell above', () => {
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01[]', '02' ],
							[ '10', '<horizontalLine></horizontalLine>', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell below', () => {
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<horizontalLine></horizontalLine>', '12' ],
							[ '20', '[]21', '22' ]
						] ) );
					} );
				} );

				describe( 'two horizontal lines as only cell content (widget without $text positions)', () => {
					it( 'should navigate to the cell on the left', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '[<horizontalLine></horizontalLine>]<horizontalLine></horizontalLine>', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10[]', '<horizontalLine></horizontalLine><horizontalLine></horizontalLine>', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell on the right', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<horizontalLine></horizontalLine>[<horizontalLine></horizontalLine>]', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<horizontalLine></horizontalLine><horizontalLine></horizontalLine>', '[]12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell above', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '[<horizontalLine></horizontalLine>]<horizontalLine></horizontalLine>', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01[]', '02' ],
							[ '10', '<horizontalLine></horizontalLine><horizontalLine></horizontalLine>', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell below', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<horizontalLine></horizontalLine>[<horizontalLine></horizontalLine>]', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<horizontalLine></horizontalLine><horizontalLine></horizontalLine>', '12' ],
							[ '20', '[]21', '22' ]
						] ) );
					} );
				} );
			} );

			describe( 'with selection not at the edge of a cell', () => {
				let editorElement, editor, model, styleElement;

				beforeEach( async () => {
					editorElement = global.document.createElement( 'div' );
					global.document.body.appendChild( editorElement );

					editor = await ClassicTestEditor.create( editorElement, {
						plugins: [ Table, Paragraph, Image, ImageCaption, HorizontalLine ]
					} );

					model = editor.model;

					styleElement = global.document.createElement( 'style' );
					styleElement.type = 'text/css';
					styleElement.appendChild( global.document.createTextNode(
						`
						* { 
							font-size: 12px !important; 
							font-family: sans-serif !important;
							margin: 0 !important; 
							padding: 0 !important; 
							border: 0 !important 
						}
						td { width: 300px !important; }
						`
					) );
					global.document.querySelector( 'head' ).appendChild( styleElement );
				} );

				afterEach( async () => {
					editorElement.remove();
					styleElement.remove();
					await editor.destroy();
				} );

				describe( 'simple cell text content', () => {
					it( 'should not navigate to the cell on the left', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '1[]1', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.notCalled( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( leftArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should not navigate to the cell on the right', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '1[]1', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.notCalled( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( rightArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should not navigate to the cell above', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '1[]1', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '[]11', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not navigate to the cell below', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '1[]1', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11[]', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );
				} );

				describe( 'selection inside paragraph', () => {
					const text = new Array( 100 ).fill( 0 ).map( () => 'word' ).join( ' ' );

					it( 'should not navigate if caret is in the middle line of a text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', text + '[] ' + text, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should move caret to beginning of cell content if caret is in the first line of a text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', 'word[] word' + text, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', '[]word word' + text, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should move caret to end of cell content if caret is in the last line of a text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', text + 'word[] word', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', text + 'word word[]', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should move caret to end if caret is after the last space in the line next to the last one', () => {
						// This is also first position in the last line.
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', text + ' []word word word', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', text + ' word word word[]', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should move caret to end if caret is at the last space in the line next to last one', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', text + '[] word word word', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', text + ' word word word[]', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not move caret if it\'s just before the last space in the line next to last one', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', text.substring( 0, text.length - 2 ) + '[]d word word word', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
					} );
				} );

				describe( 'with multiple paragraphs of text', () => {
					const text = new Array( 100 ).fill( 0 ).map( () => 'word' ).join( ' ' );

					it( 'should not navigate if caret is in the middle line of a text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>${ text }[]${ text }</paragraph><paragraph>foobar</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should move caret to beginning of cell content if caret is in the first line of a text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>word[]${ text }</paragraph><paragraph>foobar</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>[]word${ text }</paragraph><paragraph>foobar</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not move caret to end of cell content if caret is not last line of text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>${ text }word []word</paragraph><paragraph>foobar</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should move caret to end of cell content if caret is in the last line of a text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>foobar</paragraph><paragraph>${ text }word []word</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>foobar</paragraph><paragraph>${ text }word word[]</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );
				} );

				describe( 'with horizontal line widget', () => {
					const text = new Array( 100 ).fill( 0 ).map( () => 'word' ).join( ' ' );

					it( 'should not navigate if caret is in the middle line of a text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<horizontalLine></horizontalLine><paragraph>${ text }[]${ text }</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should move caret to beginning of cell content if caret is in the first line of a text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<horizontalLine></horizontalLine><paragraph>word[] ${ text }</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', `[<horizontalLine></horizontalLine>]<paragraph>word ${ text }</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should move caret to end of cell content if caret is in the last line of a text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>${ text } word []word</paragraph><horizontalLine></horizontalLine>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>${ text } word word</paragraph>[<horizontalLine></horizontalLine>]`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not move caret to end of cell content if widget is selected in middle of cell content', () => {
						const paragraph = `<paragraph>${ text }</paragraph>`;
						const hr = '<horizontalLine></horizontalLine>';

						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `${ paragraph }[${ hr }]${ paragraph }${ hr }`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', `${ paragraph }${ hr }<paragraph>[]${ text }</paragraph>${ hr }`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not move caret to end of cell content if widget is next to selection', () => {
						const paragraph = `<paragraph>${ text }</paragraph>`;
						const hr = '<horizontalLine></horizontalLine>';

						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `${ paragraph }[]${ hr }`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', `${ paragraph }[${ hr }]`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );
				} );

				describe( 'contains image widget with caption and selection inside the caption', () => {
					it( 'should not navigate to the cell on the left', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>foo</paragraph><image src="${ imageUrl }"><caption>[]11</caption></image>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.notCalled( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( leftArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should not navigate to the cell on the right', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<image src="${ imageUrl }"><caption>11[]</caption></image><paragraph>foo</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.notCalled( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( rightArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should not navigate to the cell above', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>foo</paragraph><image src="${ imageUrl }"><caption>1[]1</caption></image>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should not navigate to the cell above but should select image widget', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<image src="${ imageUrl }"><caption>1[]1</caption></image><paragraph>foo</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', `[<image src="${ imageUrl }"><caption>11</caption></image>]<paragraph>foo</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not navigate to the cell below when followed by paragraph', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<image src="${ imageUrl }"><caption>1[]1</caption></image><paragraph>foo</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should not navigate to the cell below but should select image widget', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>foo</paragraph><image src="${ imageUrl }"><caption>1[]1</caption></image>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>foo</paragraph>[<image src="${ imageUrl }"><caption>11</caption></image>]`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not navigate to the cell above but should select image widget without caption', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<image src="${ imageUrl }"><caption></caption></image><paragraph>f[]oo</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', `[<image src="${ imageUrl }"><caption></caption></image>]<paragraph>foo</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not navigate to the cell below but should select image widget without caption', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>f[]oo</paragraph><image src="${ imageUrl }"><caption></caption></image>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						assertEqualMarkup( getModelData( model ), modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>foo</paragraph>[<image src="${ imageUrl }"><caption></caption></image>]`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );
				} );
			} );
		} );

		describe( 'for right-to-left content language', () => {
			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						plugins: [ TableEditing, TableNavigation, TableSelection, Paragraph, ImageEditing, MediaEmbedEditing ],
						language: 'ar'
					} )
					.then( newEditor => {
						editor = newEditor;

						model = editor.model;
						modelRoot = model.document.getRoot();
						tableSelection = editor.plugins.get( TableSelection );
					} );
			} );

			describe( 'with the table cell selected from outside', () => {
				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '12' ],
						[ '20', '21', '22' ]
					] ) );

					tableSelection._setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 1 ] )
					);
				} );

				it( 'should move to the cell on the right (it\'s visually flipped by browser)', () => {
					editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

					sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '[]12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move to the cell on the left (it\'s visually flipped by browser)', () => {
					editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

					sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10[]', '11', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move to the cell above selection', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01[]', '02' ],
						[ '10', '11', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move to the cell below selection', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					assertEqualMarkup( getModelData( model ), modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '12' ],
						[ '20', '[]21', '22' ]
					] ) );
				} );
			} );
		} );
	} );
} );
