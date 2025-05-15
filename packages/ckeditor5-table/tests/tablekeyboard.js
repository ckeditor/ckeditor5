/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import TableKeyboard from '../src/tablekeyboard.js';
import Table from '../src/table.js';
import TableEditing from '../src/tableediting.js';
import TableSelection from '../src/tableselection.js';
import { modelTable } from './_utils/utils.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import MediaEmbedEditing from '@ckeditor/ckeditor5-media-embed/src/mediaembedediting.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed.js';

import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';

describe( 'TableKeyboard', () => {
	let editor, model, modelRoot, tableSelection, tableKeyboard, selection, editorElement;

	const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAUCAQAAADRyVAeAAAAKklEQVR42u3PAQ0AAAwCI' +
		'O0f+u/hoAHNZUJFRERERERERERERERERLYiD9N4FAFj2iK6AAAAAElFTkSuQmCC';

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Table, Paragraph, Image, ImageCaption, HorizontalLine, MediaEmbed ]
		} );

		model = editor.model;
		selection = model.document.selection;
		modelRoot = model.document.getRoot();
		tableSelection = editor.plugins.get( TableSelection );
		tableKeyboard = editor.plugins.get( TableKeyboard );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableKeyboard.pluginName ).to.equal( 'TableKeyboard' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableKeyboard.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableKeyboard.isPremiumPlugin ).to.be.false;
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'table' ).label ).to.equal(
			'Keystrokes that can be used in a table cell'
		);

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'table' ).keystrokes ).to.deep.include( {
			label: 'Move the selection to the next cell',
			keystroke: 'Tab'
		} );

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'table' ).keystrokes ).to.deep.include( {
			label: 'Move the selection to the previous cell',
			keystroke: 'Shift+Tab'
		} );

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'table' ).keystrokes ).to.deep.include( {
			label: 'Insert a new table row (when in the last cell of a table)',
			keystroke: 'Tab'
		} );

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'table' ).keystrokes ).to.deep.include( {
			label: 'Navigate through the table',
			keystroke: [ [ 'arrowup' ], [ 'arrowright' ], [ 'arrowdown' ], [ 'arrowleft' ] ]
		} );
	} );

	describe( 'Tab key handling', () => {
		let domEvtDataStub;

		beforeEach( () => {
			domEvtDataStub = {
				keyCode: getCode( 'Tab' ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy(),
				domTarget: global.document.body
			};
		} );

		it( 'should do nothing if pressed other key', () => {
			setModelData( model, modelTable( [
				[ '11', '12[]' ]
			] ) );

			domEvtDataStub.keyCode = getCode( 'a' );

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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
			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '11', '12[]' ]
			] ) );
		} );

		describe( 'on Tab key press', () => {
			it( 'should do nothing if the selection is not in a table', () => {
				setModelData( model, '<paragraph>[]</paragraph>' + modelTable( [ [ '11', '12' ] ] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.notCalled( domEvtDataStub.preventDefault );
				sinon.assert.notCalled( domEvtDataStub.stopPropagation );
				expect( getModelData( model ) ).to.equalMarkup( '<paragraph>[]</paragraph>' + modelTable( [
					[ '11', '12' ]
				] ) );
			} );

			it( 'should move to the next cell', () => {
				setModelData( model, modelTable( [
					[ '11[]', '12' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '[12]' ]
				] ) );
			} );

			it( 'should create another row and move to the first cell in a new row', () => {
				setModelData( model, modelTable( [
					[ '11', '[12]' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '12' ],
					[ '[]', '' ]
				] ) );
			} );

			it( 'should create another row and move to the first cell in a new row - ignore non-row elements', () => {
				model.schema.register( 'foo', {
					allowIn: 'table',
					allowContentOf: '$block',
					isLimit: true
				} );

				editor.conversion.elementToElement( {
					view: 'foo',
					model: 'foo'
				} );

				setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>00</paragraph></tableCell>' +
							'<tableCell><paragraph>[01]</paragraph></tableCell>' +
						'</tableRow>' +
						'<foo>An extra element</foo>' +
					'</table>'
				);

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( getModelData( model ) ).to.equalMarkup(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>00</paragraph></tableCell>' +
							'<tableCell><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>[]</paragraph></tableCell>' +
							'<tableCell><paragraph></paragraph></tableCell>' +
						'</tableRow>' +
						'<foo>An extra element</foo>' +
					'</table>'
				);
			} );

			it( 'should select the whole table if the "insertTableRowBelow" command is disabled', () => {
				setModelData( model, modelTable( [
					[ '11', '12[]' ]
				] ) );

				const insertTableRowBelowCommand = editor.commands.get( 'insertTableRowBelow' );

				insertTableRowBelowCommand.forceDisabled( 'test' );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( getModelData( model ) ).to.equalMarkup(
					'[' + modelTable( [ [ '11', '12' ] ] ) + ']'
				);
			} );

			it( 'should move to the first cell of the next row if at the end of a row', () => {
				setModelData( model, modelTable( [
					[ '11', '12[]' ],
					[ '21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '12' ],
					[ '[21]', '22' ]
				] ) );
			} );

			it( 'should move to the next table cell if the block content is partially selected', () => {
				setModelData( model, modelTable( [
					[ '11', '<paragraph>12</paragraph><paragraph>[foo]</paragraph><paragraph>bar</paragraph>', '13' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[
						'11',
						'<paragraph>12</paragraph><paragraph>foo</paragraph><paragraph>bar</paragraph>',
						'[13]'
					]
				] ) );
			} );

			it( 'should move to the next cell containing an image', () => {
				setModelData( model, modelTable( [
					[ '11[]', '<paragraph>foo</paragraph><imageBlock><caption></caption></imageBlock>' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '<paragraph>[foo</paragraph><imageBlock><caption></caption></imageBlock>]' ]
				] ) );
			} );

			it( 'should move to the next cell containing a block quote', () => {
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
				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '<blockQuote><paragraph>[foo]</paragraph></blockQuote>' ]
				] ) );
			} );

			it( 'should handle tab press when in table cell and create a new row', () => {
				setModelData( model, modelTable( [
					[ '11', '12[]' ]
				] ) );

				editor.editing.view.document.fire( 'tab', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '12' ],
					[ '[]', '' ]
				] ) );
			} );

			it( 'should handle tab press when in table header and create a new row', () => {
				setModelData( model,
					modelTable(
						[
							[ '11', '12[]' ]
						],
						{
							headingRows: 1
						}
					) );

				editor.editing.view.document.fire( 'tab', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '12' ],
					[ '[]', '' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should not handle tab if it was handled by a listener with higher priority', () => {
				setModelData( model,
					modelTable(
						[
							[ '11', '12[]' ]
						],
						{
							headingRows: 1
						}
					) );

				editor.editing.view.document.on(
					'tab',
					( bubblingEventInfo, domEventData ) => {
						domEventData.preventDefault();
						domEventData.stopPropagation();
						bubblingEventInfo.stop();
					},
					{
						context: [ 'th', 'td' ],
						priority: 'high'
					}
				);

				editor.editing.view.document.fire( 'tab', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '12[]' ]
				], { headingRows: 1 } ) );
			} );

			it( 'should handle event over other listeners with lower priority', () => {
				const lowerPriorityListenerSpy = sinon.spy();

				setModelData( model, modelTable(
					[
						[ '11', '12[]' ]
					],
					{
						headingRows: 1
					}
				) );

				editor.editing.view.document.on(
					'tab',
					lowerPriorityListenerSpy,
					{
						context: [ 'th', 'td' ],
						priority: 'low'
					}
				);

				editor.editing.view.document.fire( 'tab', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				sinon.assert.notCalled( lowerPriorityListenerSpy );

				expect( getModelData( model ) ).to.equalMarkup( modelTable(
					[
						[ '11', '12' ],
						[ '[]', '' ]
					],
					{
						headingRows: 1
					}
				) );
			} );

			it( 'should select whole next table cell if selection is in table header', () => {
				const innerTable = modelTable( [
					[ '' ]
				] );

				setModelData( model,
					modelTable(
						[
							[ innerTable + '<paragraph>[]A</paragraph>', innerTable + '<paragraph>B</paragraph>' ],
							[ 'C', 'D' ]
						],
						{
							headingColumns: 1
						}
					) );

				editor.editing.view.document.fire( 'tab', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ innerTable + '<paragraph>A</paragraph>', '[' + innerTable + '<paragraph>B]</paragraph>' ],
					[ 'C', 'D' ]
				], { headingColumns: 1 } ) );
			} );

			it( 'should select whole next table cell if selection is in table data cell', () => {
				const innerTable = modelTable( [
					[ '' ]
				] );

				setModelData( model,
					modelTable(
						[
							[ innerTable + '<paragraph>A</paragraph>', innerTable + '<paragraph>B[]</paragraph>' ],
							[ 'C', 'D' ]
						],
						{
							headingColumns: 1
						}
					) );

				editor.editing.view.document.fire( 'tab', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ innerTable + '<paragraph>A</paragraph>', innerTable + '<paragraph>B</paragraph>' ],
					[ '[C]', 'D' ]
				], { headingColumns: 1 } ) );
			} );

			it( 'tab handler should execute at target and create a new cell in table header', () => {
				const innerTable = modelTable( [
					[ 'A[]' ]
				] );

				const innerTableOutput = modelTable( [
					[ 'A' ],
					[ '[]' ]
				] );

				setModelData( model, modelTable(
					[
						[ innerTable, 'B' ],
						[ 'C', 'D' ]
					],
					{
						headingColumns: 1
					}
				) );

				editor.editing.view.document.fire( 'tab', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

				expect( getModelData( model ) ).to.equalMarkup(
					modelTable(
						[
							[ innerTableOutput, 'B' ],
							[ 'C', 'D' ]
						],
						{
							headingColumns: 1
						}
					) );
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

					expect( getModelData( model ) ).to.equalMarkup( modelTable( [
						[ '[11]', '12' ]
					] ) );

					// Should cancel event - so no other tab handler is called.
					sinon.assert.notCalled( spy );
				} );

				it( 'shouldn\'t do anything on other blocks', () => {
					const spy = sinon.spy();

					editor.editing.view.document.on( 'tab', spy );

					setModelData( model, '[<block>foo</block>]' );

					editor.editing.view.document.fire( 'keydown', domEvtDataStub );

					sinon.assert.notCalled( domEvtDataStub.preventDefault );
					sinon.assert.notCalled( domEvtDataStub.stopPropagation );

					expect( getModelData( model ) ).to.equalMarkup( '[<block>foo</block>]' );

					// Should not cancel event.
					sinon.assert.calledOnce( spy );
				} );

				it( 'table tab handler for selected table should not capture event if selection is not a table', () => {
					editor.conversion.elementToElement( {
						model: 'fakeFigure',
						view: 'figure'
					} );

					model.schema.register( 'fakeFigure', {
						inheritAllFrom: '$blockObject'
					} );

					setModelData( model, '<fakeFigure>[]</fakeFigure>' );

					editor.editing.view.document.fire( 'keydown', domEvtDataStub );

					sinon.assert.notCalled( domEvtDataStub.preventDefault );
					sinon.assert.notCalled( domEvtDataStub.stopPropagation );
					expect( getModelData( model ) ).to.equalMarkup( '[<fakeFigure></fakeFigure>]' );
				} );

				it( 'table tab handler for td should not capture event if selection is not in a tableCell', () => {
					editor.conversion.elementToElement( {
						model: 'fakeTableCell',
						view: 'td'
					} );

					model.schema.register( 'fakeTableCell', {
						inheritAllFrom: '$blockObject'
					} );

					setModelData( model, '<fakeTableCell>[]</fakeTableCell>' );

					editor.editing.view.document.fire( 'keydown', domEvtDataStub );

					sinon.assert.notCalled( domEvtDataStub.preventDefault );
					sinon.assert.notCalled( domEvtDataStub.stopPropagation );
					expect( getModelData( model ) ).to.equalMarkup( '[<fakeTableCell></fakeTableCell>]' );
				} );

				it( 'table tab handler for th should not capture event if selection is not in a tableCell marked as a header', () => {
					editor.conversion.elementToElement( {
						model: 'fakeTableHeader',
						view: 'th'
					} );

					model.schema.register( 'fakeTableHeader', {
						inheritAllFrom: '$blockObject'
					} );

					setModelData( model, '<fakeTableHeader>[]</fakeTableHeader>' );

					editor.editing.view.document.fire( 'keydown', domEvtDataStub );

					sinon.assert.notCalled( domEvtDataStub.preventDefault );
					sinon.assert.notCalled( domEvtDataStub.stopPropagation );
					expect( getModelData( model ) ).to.equalMarkup( '[<fakeTableHeader></fakeTableHeader>]' );
				} );
			} );
		} );

		describe( 'on Shift+Tab key press', () => {
			beforeEach( () => {
				domEvtDataStub.shiftKey = true;
			} );

			it( 'should do nothing if the selection is not in a table', () => {
				setModelData( model, '<paragraph>[]</paragraph>' + modelTable( [
					[ '11', '12' ]
				] ) );

				domEvtDataStub.keyCode = getCode( 'Tab' );
				domEvtDataStub.shiftKey = true;

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.notCalled( domEvtDataStub.preventDefault );
				sinon.assert.notCalled( domEvtDataStub.stopPropagation );
				expect( getModelData( model ) ).to.equalMarkup( '<paragraph>[]</paragraph>' + modelTable( [
					[ '11', '12' ]
				] ) );
			} );

			it( 'should move to the previous cell', () => {
				setModelData( model, modelTable( [
					[ '11', '12[]' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );

				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '[11]', '12' ]
				] ) );
			} );

			it( 'should select the whole table if the caret is in the first table cell', () => {
				setModelData( model, '<paragraph>foo</paragraph>' + modelTable( [
					[ '[]11', '12' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( getModelData( model ) ).to.equalMarkup(
					'<paragraph>foo</paragraph>[' + modelTable( [ [ '11', '12' ] ] ) + ']'
				);
			} );

			it( 'should move to the last cell of a previous row if at the beginning of a row', () => {
				setModelData( model, modelTable( [
					[ '11', '12' ],
					[ '[]21', '22' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '11', '[12]' ],
					[ '21', '22' ]
				] ) );
			} );

			it( 'should move to the previous table cell if the block content is partially selected', () => {
				setModelData( model, modelTable( [
					[ '11', '<paragraph>12</paragraph><paragraph>[foo]</paragraph><paragraph>bar</paragraph>', '13' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[
						'[11]',
						'<paragraph>12</paragraph><paragraph>foo</paragraph><paragraph>bar</paragraph>',
						'13'
					]
				] ) );
			} );

			it( 'should move to the previous cell containing an image', () => {
				setModelData( model, modelTable( [
					[ '<paragraph>foo</paragraph><imageBlock><caption></caption></imageBlock>', 'bar[]' ]
				] ) );

				editor.editing.view.document.fire( 'keydown', domEvtDataStub );

				sinon.assert.calledOnce( domEvtDataStub.preventDefault );
				sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
				expect( getModelData( model ) ).to.equalMarkup( modelTable( [
					[ '<paragraph>[foo</paragraph><imageBlock><caption></caption></imageBlock>]', 'bar' ]
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

		it( 'should do nothing if pressed some non-arrow key', () => {
			setModelData( model, modelTable( [
				[ '00', '01[]' ]
			] ) );

			leftArrowDomEvtDataStub.keyCode = getCode( 'a' );

			editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

			sinon.assert.notCalled( leftArrowDomEvtDataStub.preventDefault );
			sinon.assert.notCalled( leftArrowDomEvtDataStub.stopPropagation );

			expect( getModelData( model ) ).to.equalMarkup( modelTable( [
				[ '00', '01[]' ]
			] ) );
		} );

		it( 'should do nothing if the selection is not in a table', () => {
			const modelData = '<paragraph>[]foobar</paragraph>' + modelTable( [ [ '00', '01' ] ] );

			setModelData( model, modelData );

			editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

			sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
			sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );

			expect( getModelData( model ) ).to.equalMarkup( modelData );
		} );

		it( 'should do nothing if the selection is on a table', () => {
			const modelData = '<paragraph>foobar</paragraph>[' + modelTable( [ [ '00', '01' ] ] ) + ']';

			setModelData( model, modelData );

			editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

			sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
			sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );

			expect( getModelData( model ) ).to.equalMarkup( modelData );
		} );

		describe( '#_navigateFromCellInDirection (finding a proper cell to move the selection to)', () => {
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

					it( 'should navigate to the start position of the cell on the right when the direction is "right"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'right' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '[]01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the start position of the cell below when the direction is "down"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'down' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '[]10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should select a whole table when the direction is "up"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'up' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>[' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + ']<paragraph>bar</paragraph>' );
					} );

					it( 'should select a whole table when the direction is "left"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'left' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>[' + modelTable( [
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

					it( 'should navigate to the end position of the cell on the left when the direction is "left"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'left' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21[]', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the end position of the cell above when the direction is "up"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'up' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12[]' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should select a whole table when the direction is "down"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'down' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>[' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + ']<paragraph>bar</paragraph>' );
					} );

					it( 'should select a whole table when the direction is "right"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'right' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>[' + modelTable( [
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

					it( 'should navigate to start position of the cell on the right when the direction is "right"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'right' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '[]11', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the end position of the cell above when the direction is "up"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'up' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>' + modelTable( [
							[ '00[]', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the start position of the cell below when the direction is "down"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'down' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '[]20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the end position of the last cell in the previous row when the direction is "left"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'left' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02[]' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );
				} );

				describe( 'from a cell in the last column (but not the last row)', () => {
					let tableCell;

					beforeEach( () => {
						tableCell = modelRoot.getNodeByPath( [ 1, 1, 2 ] );
					} );

					it( 'should navigate to the end position of the cell on the left when the direction is "left"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'left' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11[]', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the end position the cell above when the direction is "up"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'up' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02[]' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the start position of the cell below when the direction is "down"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'down' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '[]22' ]
						] ) + '<paragraph>bar</paragraph>' );
					} );

					it( 'should navigate to the start position of the first cell in the next row when the direction is "right"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'right' );

						expect( getModelData( model ) ).to.equalMarkup( '<paragraph>foo</paragraph>' + modelTable( [
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
					it( 'should navigate to the row-col-spanned cell when approaching from the upper-spanned row', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 0 ] );

						tableKeyboard._navigateFromCellInDirection( tableCell, 'right' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '[]11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-col-spanned cell when approaching from the lower-spanned row', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 2, 0 ] );

						tableKeyboard._navigateFromCellInDirection( tableCell, 'right' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '[]11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-spanned cell when approaching from the other row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

						tableKeyboard._navigateFromCellInDirection( tableCell, 'right' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '[]13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the cell in the upper-spanned row when approaching from the row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 2 ] ); // Cell 13.

						tableKeyboard._navigateFromCellInDirection( tableCell, 'right' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '[]14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 3, 0 ] );

						tableKeyboard._navigateFromCellInDirection( tableCell, 'right' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '[]31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate from the col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 3, 1 ] );

						tableKeyboard._navigateFromCellInDirection( tableCell, 'right' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '[]33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );
				} );

				describe( 'when navigating to the left', () => {
					it( 'should navigate to the row-spanned cell when approaching from the upper-spanned row', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 3 ] ); // Cell 14.

						tableKeyboard._navigateFromCellInDirection( tableCell, 'left' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13[]', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-spanned cell when approaching from the lower-spanned row', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 2, 1 ] ); // Cell 24.

						tableKeyboard._navigateFromCellInDirection( tableCell, 'left' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13[]', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-spanned cell when approaching from the other row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 2 ] ); // Cell 13.

						tableKeyboard._navigateFromCellInDirection( tableCell, 'left' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11[]', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the cell in the upper-spanned row when approaching from the row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] ); // Cell 11.

						tableKeyboard._navigateFromCellInDirection( tableCell, 'left' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10[]', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 3, 2 ] ); // Cell 33.

						tableKeyboard._navigateFromCellInDirection( tableCell, 'left' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31[]', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate from the col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 3, 1 ] );

						tableKeyboard._navigateFromCellInDirection( tableCell, 'left' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						tableKeyboard._navigateFromCellInDirection( tableCell, 'down' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '[]11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-col-spanned cell when approaching from the last spanned column', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 0, 2 ] );

						tableKeyboard._navigateFromCellInDirection( tableCell, 'down' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '[]11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-spanned cell when approaching from the other col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

						tableKeyboard._navigateFromCellInDirection( tableCell, 'down' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '[]31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the cell in the first spanned column when approaching from the col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] ); // Cell 11.

						tableKeyboard._navigateFromCellInDirection( tableCell, 'down' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '[]31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 0, 3 ] );

						tableKeyboard._navigateFromCellInDirection( tableCell, 'down' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '[]13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate from the row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 2 ] ); // Cell 13.

						tableKeyboard._navigateFromCellInDirection( tableCell, 'down' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						tableKeyboard._navigateFromCellInDirection( tableCell, 'up' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31[]', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the col-spanned cell when approaching from the last spanned column', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 4, 2 ] );

						tableKeyboard._navigateFromCellInDirection( tableCell, 'up' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31[]', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-col-spanned cell when approaching from the other col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 3, 1 ] );

						tableKeyboard._navigateFromCellInDirection( tableCell, 'up' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11[]', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the cell in the first spanned column when approaching from the col-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

						tableKeyboard._navigateFromCellInDirection( tableCell, 'up' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01[]', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate to the row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 3, 2 ] ); // Cell 33.

						tableKeyboard._navigateFromCellInDirection( tableCell, 'up' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13[]', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );

					it( 'should navigate from the row-spanned cell', () => {
						const tableCell = modelRoot.getNodeByPath( [ 0, 1, 2 ] ); // Cell 13.

						tableKeyboard._navigateFromCellInDirection( tableCell, 'up' );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03[]', '04' ],
							[ '10', { contents: '11', colspan: 2, rowspan: 2 }, { contents: '13', rowspan: 2 }, '14' ],
							[ '20', '24' ],
							[ '30', { contents: '31', colspan: 2 }, '33', '34' ],
							[ '40', '41', '42', '43', '44' ]
						] ) );
					} );
				} );
			} );

			describe( 'when expanding selection', () => {
				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00[]', '01', '02' ],
						[ '10', '11', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				describe( 'from the first table cell', () => {
					let tableCell;

					beforeEach( () => {
						const tableUtils = editor.plugins.get( 'TableUtils' );

						tableCell = tableUtils.getTableCellsContainingSelection( selection )[ 0 ];
					} );

					it( 'should expand the selection to the cell on the right when the direction is "right"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'right', true );

						expect( tableSelection.getAnchorCell() ).to.equal( tableCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should expand the selection to the cell below when the direction is "down"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'down', true );

						expect( tableSelection.getAnchorCell() ).to.equal( tableCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 0 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should select a whole table when the direction is "up"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'up', true );

						expect( getModelData( model ) ).to.equalMarkup( '[' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + ']' );
					} );

					it( 'should select a whole table when the direction is "left"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'left', true );

						expect( getModelData( model ) ).to.equalMarkup( '[' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + ']' );
					} );
				} );

				describe( 'from the last table cell', () => {
					let tableCell;

					beforeEach( () => {
						tableCell = modelRoot.getNodeByPath( [ 0, 2, 2 ] );
						tableSelection.setCellSelection( tableCell, tableCell );
					} );

					it( 'should expand the selection to the cell on the left when the direction is "left"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'left', true );

						expect( tableSelection.getAnchorCell() ).to.equal( tableCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 2, 1 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should expand the selection to the cell above when the direction is "up"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'up', true );

						expect( tableSelection.getAnchorCell() ).to.equal( tableCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 2 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should select a whole table when the direction is "down"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'down', true );

						expect( getModelData( model ) ).to.equalMarkup( '[' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + ']' );
					} );

					it( 'should select a whole table when the direction is "right"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'right', true );

						expect( getModelData( model ) ).to.equalMarkup( '[' + modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) + ']' );
					} );
				} );

				describe( 'from a cell in the first column (but not first row)', () => {
					let tableCell;

					beforeEach( () => {
						tableCell = modelRoot.getNodeByPath( [ 0, 1, 0 ] );
						tableSelection.setCellSelection( tableCell, tableCell );
					} );

					it( 'should expand the selection to the cell on the right when the direction is "right"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'right', true );

						expect( tableSelection.getAnchorCell() ).to.equal( tableCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should expand the selection to the cell above when the direction is "up"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'up', true );

						expect( tableSelection.getAnchorCell() ).to.equal( tableCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should expand the selection to the cell below when the direction is "down"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'down', true );

						expect( tableSelection.getAnchorCell() ).to.equal( tableCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 2, 0 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should expand the selection to the cell above when the direction is "left"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'left', true );

						expect( tableSelection.getAnchorCell() ).to.equal( tableCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 0, 0 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );
				} );

				describe( 'from a cell in the last column (but not the last row)', () => {
					let tableCell;

					beforeEach( () => {
						tableCell = modelRoot.getNodeByPath( [ 0, 1, 2 ] );
						tableSelection.setCellSelection( tableCell, tableCell );
					} );

					it( 'should expand the selection to the cell on the left when the direction is "left"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'left', true );

						expect( tableSelection.getAnchorCell() ).to.equal( tableCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should expand the selection to the cell above when the direction is "up"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'up', true );

						expect( tableSelection.getAnchorCell() ).to.equal( tableCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 0, 2 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should expand the selection to the cell below when the direction is "down"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'down', true );

						expect( tableSelection.getAnchorCell() ).to.equal( tableCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 2, 2 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should expand the selection to the cell below when the direction is "right"', () => {
						tableKeyboard._navigateFromCellInDirection( tableCell, 'right', true );

						expect( tableSelection.getAnchorCell() ).to.equal( tableCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 2, 2 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );
				} );
			} );
		} );

		describe( 'with the table cells selected from outside', () => {
			describe( 'on a single table cell selected', () => {
				let anchorCell, focusCell;

				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '12' ],
						[ '20', '21', '22' ]
					] ) );

					anchorCell = focusCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

					tableSelection.setCellSelection( anchorCell, focusCell );
				} );

				describe( 'without shift pressed', () => {
					it( 'should move to the cell on the left', () => {
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10[]', '11', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should move to the cell on the right', () => {
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '[]12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should move to the cell above the selection', () => {
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01[]', '02' ],
							[ '10', '11', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should move to the cell below the selection', () => {
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '[]21', '22' ]
						] ) );
					} );
				} );

				describe( 'with shift pressed', () => {
					beforeEach( () => {
						leftArrowDomEvtDataStub.shiftKey = true;
						rightArrowDomEvtDataStub.shiftKey = true;
						upArrowDomEvtDataStub.shiftKey = true;
						downArrowDomEvtDataStub.shiftKey = true;
					} );

					it( 'should move to the cell below if TableSelection plugin is disabled', () => {
						editor.plugins.get( 'TableSelection' ).forceDisabled();

						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10[]', '11', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '[]20', '21', '22' ]
						] ) );

						expect( tableSelection.getAnchorCell() ).to.be.null;
						expect( tableSelection.getFocusCell() ).to.be.null;
						expect( selection.rangeCount ).to.equal( 1 );
					} );

					it( 'should expand the selection to the cell on the left', () => {
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 0 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should expand the selection to the cell on the right', () => {
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 2 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should expand the selection to the cell above the selection', () => {
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );

					it( 'should expand the selection to the cell below the selection', () => {
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 2, 1 ] ) );
						expect( selection.rangeCount ).to.equal( 2 );
					} );
				} );
			} );

			describe( 'on multiple table cells selected vertically (the anchor cell above the focus cell)', () => {
				let anchorCell, focusCell;

				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					anchorCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );
					focusCell = modelRoot.getNodeByPath( [ 0, 2, 1 ] );

					tableSelection.setCellSelection( anchorCell, focusCell );
				} );

				describe( 'without shift pressed', () => {
					it( 'should move to the cell on the top left of the selection', () => {
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10[]', '11', '12', '13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );
					} );

					it( 'should move to the cell on the bottom right of the selection', () => {
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', '11', '12', '13' ],
							[ '20', '21', '[]22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );
					} );

					it( 'should move to the cell above the selection', () => {
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01[]', '02', '03' ],
							[ '10', '11', '12', '13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );
					} );

					it( 'should move to the cell below the selection', () => {
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', '11', '12', '13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '[]31', '32', '33' ]
						] ) );
					} );
				} );

				describe( 'with shift pressed', () => {
					beforeEach( () => {
						leftArrowDomEvtDataStub.shiftKey = true;
						rightArrowDomEvtDataStub.shiftKey = true;
						upArrowDomEvtDataStub.shiftKey = true;
						downArrowDomEvtDataStub.shiftKey = true;
					} );

					it( 'should expand the selection to the cell on the left from the focus cell', () => {
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 2, 0 ] ) );
						expect( selection.rangeCount ).to.equal( 4 );
					} );

					it( 'should expand the selection to the cell on the right from the focus cell', () => {
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 2, 2 ] ) );
						expect( selection.rangeCount ).to.equal( 4 );
					} );

					it( 'should shrink the selection to the anchor cell', () => {
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( anchorCell );
						expect( selection.rangeCount ).to.equal( 1 );
					} );

					it( 'should expand the selection to the cell below the focus cell', () => {
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 3, 1 ] ) );
						expect( selection.rangeCount ).to.equal( 3 );
					} );
				} );
			} );

			describe( 'on multiple table cells selected vertically (the anchor cell below the focus cell)', () => {
				let anchorCell, focusCell;

				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					anchorCell = modelRoot.getNodeByPath( [ 0, 2, 1 ] );
					focusCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );

					tableSelection.setCellSelection( anchorCell, focusCell );
				} );

				describe( 'without shift pressed', () => {
					it( 'should move to the cell on the top left of the selection', () => {
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10[]', '11', '12', '13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );
					} );

					it( 'should move to the cell on the bottom right of the selection', () => {
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', '11', '12', '13' ],
							[ '20', '21', '[]22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );
					} );

					it( 'should move to the cell above the selection', () => {
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01[]', '02', '03' ],
							[ '10', '11', '12', '13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );
					} );

					it( 'should move to the cell below the selection', () => {
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', '11', '12', '13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '[]31', '32', '33' ]
						] ) );
					} );
				} );

				describe( 'with shift pressed', () => {
					beforeEach( () => {
						leftArrowDomEvtDataStub.shiftKey = true;
						rightArrowDomEvtDataStub.shiftKey = true;
						upArrowDomEvtDataStub.shiftKey = true;
						downArrowDomEvtDataStub.shiftKey = true;
					} );

					it( 'should expand the selection to the cell on the left from the focus cell', () => {
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 0 ] ) );
						expect( selection.rangeCount ).to.equal( 4 );
					} );

					it( 'should expand the selection to the cell on the right from the focus cell', () => {
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 2 ] ) );
						expect( selection.rangeCount ).to.equal( 4 );
					} );

					it( 'should shrink the selection to the anchor cell', () => {
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( anchorCell );
						expect( selection.rangeCount ).to.equal( 1 );
					} );

					it( 'should expand the selection to the cell below the focus cell', () => {
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 0, 1 ] ) );
						expect( selection.rangeCount ).to.equal( 3 );
					} );
				} );
			} );

			describe( 'on multiple table cell selected horizontally (the anchor cell is to the left of the focus cell ', () => {
				let anchorCell, focusCell;

				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );

					anchorCell = modelRoot.getNodeByPath( [ 0, 1, 1 ] );
					focusCell = modelRoot.getNodeByPath( [ 0, 1, 2 ] );

					tableSelection.setCellSelection( anchorCell, focusCell );
				} );

				describe( 'without shift pressed', () => {
					it( 'should move to the cell on the top left of the selection', () => {
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10[]', '11', '12', '13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );
					} );

					it( 'should move to the cell on the bottom right of the selection', () => {
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', '11', '12', '[]13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );
					} );

					it( 'should move to the cell above the selection', () => {
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01[]', '02', '03' ],
							[ '10', '11', '12', '13' ],
							[ '20', '21', '22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );
					} );

					it( 'should move to the cell below the selection', () => {
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02', '03' ],
							[ '10', '11', '12', '13' ],
							[ '20', '21', '[]22', '23' ],
							[ '30', '31', '32', '33' ]
						] ) );
					} );
				} );

				describe( 'with shift pressed', () => {
					beforeEach( () => {
						leftArrowDomEvtDataStub.shiftKey = true;
						rightArrowDomEvtDataStub.shiftKey = true;
						upArrowDomEvtDataStub.shiftKey = true;
						downArrowDomEvtDataStub.shiftKey = true;
					} );

					it( 'should expand the selection to the cell above the focus cell', () => {
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 0, 2 ] ) );
						expect( selection.rangeCount ).to.equal( 4 );
					} );

					it( 'should expand the selection to the cell below the focus cell', () => {
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 2, 2 ] ) );
						expect( selection.rangeCount ).to.equal( 4 );
					} );

					it( 'should shrink the selection to the anchor cell', () => {
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( anchorCell );
						expect( selection.rangeCount ).to.equal( 1 );
					} );

					it( 'should expand the selection to the cell on the right to the focus cell', () => {
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						expect( tableSelection.getAnchorCell() ).to.equal( anchorCell );
						expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 3 ] ) );
						expect( selection.rangeCount ).to.equal( 3 );
					} );
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

					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 2, 2 ] )
					);
				} );

				it( 'should move to the cell on the top left of selection', () => {
					editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

					sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

					expect( getModelData( model ) ).to.equalMarkup( modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10[]', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '32', '33' ]
					] ) );
				} );

				it( 'should move to the cell on the bottom right of selection', () => {
					editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

					sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

					expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

					expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

					expect( getModelData( model ) ).to.equalMarkup( modelTable( [
						[ '00', '01', '02', '03' ],
						[ '10', '11', '12', '13' ],
						[ '20', '21', '22', '23' ],
						[ '30', '31', '[]32', '33' ]
					] ) );
				} );
			} );
		} );

		describe( 'with the selection inside a table cell', () => {
			describe( 'with the selection at the boundary of a cell', () => {
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

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ],
							[ '20', '[]21', '22' ]
						] ) );
					} );

					describe( 'with shift key pressed', () => {
						beforeEach( () => {
							leftArrowDomEvtDataStub.shiftKey = true;
							rightArrowDomEvtDataStub.shiftKey = true;
							upArrowDomEvtDataStub.shiftKey = true;
							downArrowDomEvtDataStub.shiftKey = true;
						} );

						it( 'should select multiple cells on right arrow key press if all content of a cell is selected', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', '[11]', '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

							sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

							expect( tableSelection.getAnchorCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );
							expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 2 ] ) );
							expect( selection.rangeCount ).to.equal( 2 );
						} );

						it( 'should select multiple cells on right arrow key press if all content of a cell is selected backward', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', '[11]', '12' ],
								[ '20', '21', '22' ]
							] ), { lastRangeBackward: true } );

							editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

							sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

							expect( tableSelection.getAnchorCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );
							expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 2 ] ) );
							expect( selection.rangeCount ).to.equal( 2 );
						} );

						it( 'should select multiple cells on left arrow key press if all content of a cell is selected', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', '[11]', '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

							sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

							expect( tableSelection.getAnchorCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );
							expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 0 ] ) );
							expect( selection.rangeCount ).to.equal( 2 );
						} );

						it( 'should select multiple cells on left arrow key press if all content of a cell is selected backward', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', '[11]', '12' ],
								[ '20', '21', '22' ]
							] ), { lastRangeBackward: true } );

							editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

							sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

							expect( tableSelection.getAnchorCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );
							expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 0 ] ) );
							expect( selection.rangeCount ).to.equal( 2 );
						} );
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

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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
							[ '10', `<imageBlock src="${ imageUrl }"><caption>[]11</caption></imageBlock>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10[]', `<imageBlock src="${ imageUrl }"><caption>11</caption></imageBlock>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell on the right', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<imageBlock src="${ imageUrl }"><caption>11[]</caption></imageBlock>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<imageBlock src="${ imageUrl }"><caption>11</caption></imageBlock>`, '[]12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell above', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<imageBlock src="${ imageUrl }"><caption>[]11</caption></imageBlock>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01[]', '02' ],
							[ '10', `<imageBlock src="${ imageUrl }"><caption>11</caption></imageBlock>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell below', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<imageBlock src="${ imageUrl }"><caption>11[]</caption></imageBlock>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<imageBlock src="${ imageUrl }"><caption>11</caption></imageBlock>`, '12' ],
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
						// Twice because of fake caret next to widget.
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.called( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.called( leftArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10[]', '<horizontalLine></horizontalLine>', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell on the right', () => {
						// Twice because of fake caret next to widget.
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.called( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.called( rightArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<horizontalLine></horizontalLine>', '[]12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell above', () => {
						// Twice because of fake caret next to widget.
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.called( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.called( upArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01[]', '02' ],
							[ '10', '<horizontalLine></horizontalLine>', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should navigate to the cell below', () => {
						// Twice because of fake caret next to widget.
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.called( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.called( downArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						// Twice because of fake caret next to widget.
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );
						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.called( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.called( leftArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						// Twice because of fake caret next to widget.
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );
						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.called( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.called( rightArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						// Twice because of fake caret next to widget.
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );
						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.called( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.called( upArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						// Twice because of fake caret next to widget.
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.called( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.called( downArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', '<horizontalLine></horizontalLine><horizontalLine></horizontalLine>', '12' ],
							[ '20', '[]21', '22' ]
						] ) );
					} );
				} );
			} );

			describe( 'with selection not at the boundary of a cell', () => {
				let styleElement;

				beforeEach( async () => {
					styleElement = global.document.createElement( 'style' );
					styleElement.type = 'text/css';
					styleElement.appendChild( global.document.createTextNode(
						`
						* {
							font-size: 12px !important;
							font-family: serif !important;
							margin: 0 !important;
							padding: 0 !important;
							border: 0 !important
						}
						table {
							table-layout: initial !important;
						}
						td { width: 30px !important; }
						tr:nth-child(2) td:nth-child(2) { width: 300px !important; }
						`
					) );
					global.document.querySelector( 'head' ).appendChild( styleElement );

					// The editing view must be focused because otherwise in Chrome the DOM selection will not contain
					// any ranges and jumpOverUiElement will crash (for the right arrow when shift is pressed).
					editor.editing.view.focus();
				} );

				afterEach( async () => {
					styleElement.remove();
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

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11[]', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					describe( 'when shift key is pressed', () => {
						beforeEach( () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', '1[]1', '12' ],
								[ '20', '21', '22' ]
							] ) );

							leftArrowDomEvtDataStub.shiftKey = true;
							rightArrowDomEvtDataStub.shiftKey = true;
							upArrowDomEvtDataStub.shiftKey = true;
							downArrowDomEvtDataStub.shiftKey = true;
						} );

						it( 'should not prevent default browser behavior for the left arrow pressed with shift', () => {
							editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

							sinon.assert.notCalled( leftArrowDomEvtDataStub.preventDefault );
							sinon.assert.notCalled( leftArrowDomEvtDataStub.stopPropagation );
						} );

						it( 'should not prevent default browser behavior for the right arrow pressed with shift', () => {
							editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

							sinon.assert.notCalled( rightArrowDomEvtDataStub.preventDefault );
							sinon.assert.notCalled( rightArrowDomEvtDataStub.stopPropagation );
						} );

						it( 'should expand selection to the beginning of the cell content', () => {
							editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

							sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

							expect( getModelData( model ) ).to.equalMarkup( modelTable( [
								[ '00', '01', '02' ],
								[ '10', '[1]1', '12' ],
								[ '20', '21', '22' ]
							] ) );
						} );

						it( 'should expand selection to the end of the cell content', () => {
							editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

							sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

							expect( getModelData( model ) ).to.equalMarkup( modelTable( [
								[ '00', '01', '02' ],
								[ '10', '1[1]', '12' ],
								[ '20', '21', '22' ]
							] ) );
						} );
					} );
				} );

				describe( 'selection inside paragraph', () => {
					const text = new Array( 20 ).fill( 0 ).map( () => 'word' ).join( ' ' );

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

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
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

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', text + 'word word[]', '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not prevent default browser behavior for the left arrow for non-collapsed selection', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '[word] word', '12' ],
							[ '20', '21', '22' ]
						] ), { lastRangeBackward: true } );

						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.notCalled( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( leftArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should not prevent default browser behavior for the right arrow for non-collapsed selection', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', 'word [word]', '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.notCalled( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( rightArrowDomEvtDataStub.stopPropagation );
					} );

					describe( 'when shift key is pressed', () => {
						beforeEach( () => {
							upArrowDomEvtDataStub.shiftKey = true;
							downArrowDomEvtDataStub.shiftKey = true;
							leftArrowDomEvtDataStub.shiftKey = true;
							rightArrowDomEvtDataStub.shiftKey = true;
						} );

						it( 'should not prevent default browser behavior for the up arrow in the middle lines of the cell text', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', text + '[] ' + text, '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

							sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
							sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
						} );

						it( 'should not prevent default browser behavior for the down arrow in the middle lines of cell text', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', text + '[] ' + text, '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

							sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
							sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
						} );

						it( 'should expand collapsed selection to the beginning of the cell content', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', 'word[] word' + text, '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

							sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

							expect( getModelData( model ) ).to.equalMarkup( modelTable( [
								[ '00', '01', '02' ],
								[ '10', '[word] word' + text, '12' ],
								[ '20', '21', '22' ]
							] ) );
						} );

						it( 'should not prevent default browser behavior for shrinking selection (up arrow)', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', 'word [word]' + text, '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

							sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
							sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
						} );

						it( 'should expand not collapsed selection to the beginning of the cell content from the selection anchor', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', 'word [word]' + text, '12' ],
								[ '20', '21', '22' ]
							] ), { lastRangeBackward: true } );

							editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

							sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

							expect( getModelData( model ) ).to.equalMarkup( modelTable( [
								[ '00', '01', '02' ],
								[ '10', '[word word]' + text, '12' ],
								[ '20', '21', '22' ]
							] ) );
						} );

						it( 'should not prevent default browser behavior for expanding selection (left arrow)', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', 'word [word] word', '12' ],
								[ '20', '21', '22' ]
							] ), { lastRangeBackward: true } );

							editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

							sinon.assert.notCalled( leftArrowDomEvtDataStub.preventDefault );
							sinon.assert.notCalled( leftArrowDomEvtDataStub.stopPropagation );
						} );

						it( 'should expand not collapsed selection at the beginning of a cell (left arrow)', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', '[word] word', '12' ],
								[ '20', '21', '22' ]
							] ), { lastRangeBackward: true } );

							editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

							sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

							expect( tableSelection.getAnchorCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );
							expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 0 ] ) );
							expect( selection.rangeCount ).to.equal( 2 );
						} );

						it( 'should not prevent default browser behavior for expanding selection (right arrow)', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', 'word [word] word', '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

							sinon.assert.notCalled( rightArrowDomEvtDataStub.preventDefault );
							sinon.assert.notCalled( rightArrowDomEvtDataStub.stopPropagation );
						} );

						it( 'should expand not collapsed selection at the end of a cell (right arrow)', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', 'word [word]', '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

							sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

							expect( tableSelection.getAnchorCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 1 ] ) );
							expect( tableSelection.getFocusCell() ).to.equal( modelRoot.getNodeByPath( [ 0, 1, 2 ] ) );
							expect( selection.rangeCount ).to.equal( 2 );
						} );

						it( 'should expand collapsed selection to the end of the cell content', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', text + 'word[] word', '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

							sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

							expect( getModelData( model ) ).to.equalMarkup( modelTable( [
								[ '00', '01', '02' ],
								[ '10', text + 'word[ word]', '12' ],
								[ '20', '21', '22' ]
							] ) );
						} );

						it( 'should not prevent default browser behavior for shrinking selection (down arrow)', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', text + '[word] word', '12' ],
								[ '20', '21', '22' ]
							] ), { lastRangeBackward: true } );

							editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

							sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
							sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
						} );

						it( 'should expand not collapsed selection to the end of the cell content from the selection anchor', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', text + '[word] word', '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

							sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

							expect( getModelData( model ) ).to.equalMarkup( modelTable( [
								[ '00', '01', '02' ],
								[ '10', text + '[word word]', '12' ],
								[ '20', '21', '22' ]
							] ) );
						} );
					} );
				} );

				if ( !env.isGecko ) {
					// These tests fails on Travis. They work correctly when started on local machine.
					// Issue is probably related to text rendering and wrapping.

					describe( 'with selection in the wrap area', () => {
						const text = new Array( 10 ).fill( 0 ).map( () => 'word' ).join( ' ' );

						it( 'should move the caret to end if the caret is after the last space in the line next to the last one', () => {
							// This is also first position in the last line.
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', text + ' []word word word', '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

							sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

							expect( getModelData( model ) ).to.equalMarkup( modelTable( [
								[ '00', '01', '02' ],
								[ '10', text + ' word word word[]', '12' ],
								[ '20', '21', '22' ]
							] ) );
						} );

						it( 'should move the caret to end if ther caret is at the last space in the line next to last one', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', text + '[] word word word', '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

							sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

							expect( getModelData( model ) ).to.equalMarkup( modelTable( [
								[ '00', '01', '02' ],
								[ '10', text + ' word word word[]', '12' ],
								[ '20', '21', '22' ]
							] ) );
						} );

						it( 'should not move the caret if its 2 characters before the last space in the line next to last one', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', text.substring( 0, text.length - 2 ) + '[]od word word word', '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

							sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
							sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
						} );

						describe( 'when shift key is pressed', () => {
							beforeEach( () => {
								upArrowDomEvtDataStub.shiftKey = true;
								downArrowDomEvtDataStub.shiftKey = true;
							} );

							it( 'should expand collapsed selection to the end of the cell content', () => {
								setModelData( model, modelTable( [
									[ '00', '01', '02' ],
									[ '10', text + '[] word word word', '12' ],
									[ '20', '21', '22' ]
								] ) );

								editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

								sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
								sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

								expect( getModelData( model ) ).to.equalMarkup( modelTable( [
									[ '00', '01', '02' ],
									[ '10', text + '[ word word word]', '12' ],
									[ '20', '21', '22' ]
								] ) );
							} );

							it( 'should expand not collapsed selection to the end of the cell content from the selection anchor', () => {
								setModelData( model, modelTable( [
									[ '00', '01', '02' ],
									[ '10', text + '[ word] word word', '12' ],
									[ '20', '21', '22' ]
								] ) );

								editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

								sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
								sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

								expect( getModelData( model ) ).to.equalMarkup( modelTable( [
									[ '00', '01', '02' ],
									[ '10', text + '[ word word word]', '12' ],
									[ '20', '21', '22' ]
								] ) );
							} );
						} );
					} );
				}

				describe( 'with multiple paragraphs of text', () => {
					const text = new Array( 100 ).fill( 0 ).map( () => 'word' ).join( ' ' );

					it( 'should not navigate if caret is in the middle of a line of text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>${ text }[]${ text }</paragraph><paragraph>foobar</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should move the caret to the beginning of a cell content if the caret is in the first line of text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>word[]${ text }</paragraph><paragraph>foobar</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>[]word${ text }</paragraph><paragraph>foobar</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not move the caret to the end of a cell content if the caret is not in the last line of text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>${ text }word []word</paragraph><paragraph>foobar</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should move the caret to end of a cell content if the caret is in the last line of text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>foobar</paragraph><paragraph>${ text }word []word</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>foobar</paragraph><paragraph>${ text }word word[]</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					describe( 'when shift key is pressed', () => {
						beforeEach( () => {
							upArrowDomEvtDataStub.shiftKey = true;
							downArrowDomEvtDataStub.shiftKey = true;
						} );

						it( 'should expand selection to the beginning of the cell content', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', `<paragraph>word[] ${ text }</paragraph><paragraph>${ text }</paragraph>`, '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

							sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

							expect( getModelData( model ) ).to.equalMarkup( modelTable( [
								[ '00', '01', '02' ],
								[ '10', `<paragraph>[word] ${ text }</paragraph><paragraph>${ text }</paragraph>`, '12' ],
								[ '20', '21', '22' ]
							] ) );
						} );

						it( 'should expand selection to the end of the cell content', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', `<paragraph>${ text }</paragraph><paragraph>${ text } []word</paragraph>`, '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

							sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

							expect( getModelData( model ) ).to.equalMarkup( modelTable( [
								[ '00', '01', '02' ],
								[ '10', `<paragraph>${ text }</paragraph><paragraph>${ text } [word]</paragraph>`, '12' ],
								[ '20', '21', '22' ]
							] ) );
						} );
					} );
				} );

				describe( 'with horizontal line widget', () => {
					const text = new Array( 100 ).fill( 0 ).map( () => 'word' ).join( ' ' );

					it( 'should not navigate if the caret is in the middle line of text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<horizontalLine></horizontalLine><paragraph>${ text }[]${ text }</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should move the caret to the beginning of cell content if the caret is in the first line of text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<horizontalLine></horizontalLine><paragraph>word[] ${ text }</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<horizontalLine></horizontalLine><paragraph>[]word ${ text }</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should move the caret to the end of cell content if the caret is in the last line of text', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>${ text } word []word</paragraph><horizontalLine></horizontalLine>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>${ text } word word[]</paragraph><horizontalLine></horizontalLine>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not move the caret to the end of cell content if widget is selected in middle of a cell content', () => {
						const paragraph = `<paragraph>${ text }</paragraph>`;
						const hr = '<horizontalLine></horizontalLine>';

						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `${ paragraph }[${ hr }]${ paragraph }${ hr }`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						// Note: Two keydowns are necessary because the first one is handled by the WidgetTypeAround plugin
						// to activate the "fake caret".
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );
						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', `${ paragraph }${ hr }<paragraph>[]${ text }</paragraph>${ hr }`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not move the caret to the end of cell content if widget is next to the selection', () => {
						const paragraph = `<paragraph>${ text }</paragraph>`;
						const hr = '<horizontalLine></horizontalLine>';

						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `${ paragraph }[]${ hr }`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', `${ paragraph }[${ hr }]`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					describe( 'when shift key is pressed', () => {
						beforeEach( () => {
							upArrowDomEvtDataStub.shiftKey = true;
							downArrowDomEvtDataStub.shiftKey = true;
						} );

						it( 'should expand selection to the beginning of the cell content', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', '<horizontalLine></horizontalLine><paragraph>foo[]bar</paragraph>', '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

							sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

							expect( getModelData( model ) ).to.equalMarkup( modelTable( [
								[ '00', '01', '02' ],
								[ '10', '<horizontalLine></horizontalLine><paragraph>[foo]bar</paragraph>', '12' ],
								[ '20', '21', '22' ]
							] ) );
						} );

						it( 'should expand selection to the end of the cell content', () => {
							setModelData( model, modelTable( [
								[ '00', '01', '02' ],
								[ '10', '<paragraph>foo[]bar</paragraph><horizontalLine></horizontalLine>', '12' ],
								[ '20', '21', '22' ]
							] ) );

							editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

							sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
							sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

							expect( getModelData( model ) ).to.equalMarkup( modelTable( [
								[ '00', '01', '02' ],
								[ '10', '<paragraph>foo[bar]</paragraph><horizontalLine></horizontalLine>', '12' ],
								[ '20', '21', '22' ]
							] ) );
						} );
					} );
				} );

				describe( 'contains image widget with caption and selection inside the caption', () => {
					it( 'should not navigate to the cell on the left', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[
								'10',
								`<paragraph>foo</paragraph><imageBlock src="${ imageUrl }"><caption>[]11</caption></imageBlock>`, '12'
							],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

						sinon.assert.notCalled( leftArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( leftArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should not navigate to the cell on the right', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[
								'10',
								`<imageBlock src="${ imageUrl }"><caption>11[]</caption></imageBlock><paragraph>foo</paragraph>`, '12'
							],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

						sinon.assert.notCalled( rightArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( rightArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should not navigate to the cell above (only to closest limit boundary)', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[
								'10',
								`<paragraph>foo</paragraph><imageBlock src="${ imageUrl }"><caption>1[]1</caption></imageBlock>`, '12'
							],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[
								'10',
								`<paragraph>foo</paragraph><imageBlock src="${ imageUrl }"><caption>[]11</caption></imageBlock>`, '12'
							],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not navigate to the cell above (only to paragraph above)', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[
								'10',
								`<paragraph>foo</paragraph><imageBlock src="${ imageUrl }"><caption>[]11</caption></imageBlock>`, '12'
							],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.notCalled( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( upArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should not navigate to the cell above but should put caret at first position of the image caption', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[
								'10',
								`<imageBlock src="${ imageUrl }"><caption>1[]1</caption></imageBlock><paragraph>foo</paragraph>`, '12'
							],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[
								'10',
								`<imageBlock src="${ imageUrl }"><caption>[]11</caption></imageBlock><paragraph>foo</paragraph>`, '12'
							],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not navigate to the cell below when inside the image caption', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[
								'10',
								`<imageBlock src="${ imageUrl }"><caption>1[]1</caption></imageBlock><paragraph>foo</paragraph>`, '12'
							],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[
								'10',
								`<imageBlock src="${ imageUrl }"><caption>11[]</caption></imageBlock><paragraph>foo</paragraph>`, '12'
							],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not navigate to the cell below when followed by a paragraph', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[
								'10',
								`<imageBlock src="${ imageUrl }"><caption>11[]</caption></imageBlock><paragraph>foo</paragraph>`, '12'
							],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.notCalled( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.notCalled( downArrowDomEvtDataStub.stopPropagation );
					} );

					it( 'should navigate to the cell below if the caret on last position in the image caption', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[
								'10',
								`<paragraph>foo</paragraph><imageBlock src="${ imageUrl }"><caption>11[]</caption></imageBlock>`, '12'
							],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
						sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>foo</paragraph><imageBlock src="${ imageUrl }"><caption>11</caption></imageBlock>`, '12' ],
							[ '20', '[]21', '22' ]
						] ) );
					} );

					it( 'should not navigate to the cell above but should select the image widget without caption', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<imageBlock src="${ imageUrl }"><caption></caption></imageBlock><paragraph>[]foo</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

						sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', `[<imageBlock src="${ imageUrl }"><caption></caption></imageBlock>]<paragraph>foo</paragraph>`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );

					it( 'should not navigate to the cell below but should select the image widget without caption', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>foo[]</paragraph><imageBlock src="${ imageUrl }"><caption></caption></imageBlock>`, '12' ],
							[ '20', '21', '22' ]
						] ) );

						editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

						sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );

						expect( getModelData( model ) ).to.equalMarkup( modelTable( [
							[ '00', '01', '02' ],
							[ '10', `<paragraph>foo</paragraph>[<imageBlock src="${ imageUrl }"><caption></caption></imageBlock>]`, '12' ],
							[ '20', '21', '22' ]
						] ) );
					} );
				} );
			} );
		} );

		describe( 'for right-to-left content language', () => {
			let editor, model, modelRoot, tableSelection;

			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						plugins: [ TableEditing, TableKeyboard, TableSelection, Paragraph, ImageBlockEditing, MediaEmbedEditing ],
						language: 'ar'
					} )
					.then( newEditor => {
						editor = newEditor;

						model = editor.model;
						modelRoot = model.document.getRoot();
						tableSelection = editor.plugins.get( TableSelection );
					} );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			describe( 'with the table cell selected from outside', () => {
				beforeEach( () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '12' ],
						[ '20', '21', '22' ]
					] ) );

					tableSelection.setCellSelection(
						modelRoot.getNodeByPath( [ 0, 1, 1 ] ),
						modelRoot.getNodeByPath( [ 0, 1, 1 ] )
					);
				} );

				it( 'should move to the cell on the right (visually flipped by the browser)', () => {
					editor.editing.view.document.fire( 'keydown', leftArrowDomEvtDataStub );

					sinon.assert.calledOnce( leftArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( leftArrowDomEvtDataStub.stopPropagation );

					expect( getModelData( model ) ).to.equalMarkup( modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '[]12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move to the cell on the left (visually flipped by the browser)', () => {
					editor.editing.view.document.fire( 'keydown', rightArrowDomEvtDataStub );

					sinon.assert.calledOnce( rightArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( rightArrowDomEvtDataStub.stopPropagation );

					expect( getModelData( model ) ).to.equalMarkup( modelTable( [
						[ '00', '01', '02' ],
						[ '10[]', '11', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move to the cell above the selection', () => {
					editor.editing.view.document.fire( 'keydown', upArrowDomEvtDataStub );

					sinon.assert.calledOnce( upArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( upArrowDomEvtDataStub.stopPropagation );

					expect( getModelData( model ) ).to.equalMarkup( modelTable( [
						[ '00', '01[]', '02' ],
						[ '10', '11', '12' ],
						[ '20', '21', '22' ]
					] ) );
				} );

				it( 'should move to the cell below the selection', () => {
					editor.editing.view.document.fire( 'keydown', downArrowDomEvtDataStub );

					sinon.assert.calledOnce( downArrowDomEvtDataStub.preventDefault );
					sinon.assert.calledOnce( downArrowDomEvtDataStub.stopPropagation );

					expect( getModelData( model ) ).to.equalMarkup( modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '12' ],
						[ '20', '[]21', '22' ]
					] ) );
				} );
			} );
		} );
	} );
} );
