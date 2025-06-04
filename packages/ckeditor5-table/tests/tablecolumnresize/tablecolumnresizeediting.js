/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import TableColumnResizeEditing from '../../src/tablecolumnresize/tablecolumnresizeediting.js';
import TableColumnResize from '../../src/tablecolumnresize.js';
import TableCaption from '../../src/tablecaption.js';
import TableToolbar from '../../src/tabletoolbar.js';
import Table from '../../src/table.js';
import TableProperties from '../../src/tableproperties.js';
import PlainTableOutput from '../../src/plaintableoutput.js';

// ClassicTestEditor can't be used, as it doesn't handle the focus, which is needed to test resizer visual cues.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import HighlightEditing from '@ckeditor/ckeditor5-highlight/src/highlightediting.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';

import { focusEditor } from '@ckeditor/ckeditor5-widget/tests/widgetresize/_utils/utils.js';
import { modelTable } from '../_utils/utils.js';
import {
	getComputedStyle,
	getDomTable,
	getModelTable,
	getViewTable,
	getColumnWidth,
	getViewColumnWidthsPx,
	getModelColumnWidthsPc,
	getViewColumnWidthsPc,
	getDomTableRects,
	getDomTableCellRects,
	tableColumnResizeMouseSimulator,
	getDomResizer
} from './_utils/utils.js';
import {
	COLUMN_MIN_WIDTH_IN_PIXELS,
	COLUMN_RESIZE_DISTANCE_THRESHOLD
} from '../../src/tablecolumnresize/constants.js';
import {
	clamp,
	getDomCellOuterWidth,
	getTableColumnsWidths,
	getColumnGroupElement
} from '../../src/tablecolumnresize/utils.js';
import TableWidthsCommand from '../../src/tablecolumnresize/tablewidthscommand.js';
import WidgetResize from '@ckeditor/ckeditor5-widget/src/widgetresize.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect.js';

describe( 'TableColumnResizeEditing', () => {
	let model, editor, view, editorElement, contentDirection, resizePlugin;
	const PERCENTAGE_PRECISION = 0.001;
	const PIXEL_PRECISION = 1;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
		editor = await createEditor();

		model = editor.model;
		view = editor.editing.view;
		contentDirection = editor.locale.contentLanguageDirection;
		resizePlugin = editor.plugins.get( 'TableColumnResizeEditing' );
	} );

	afterEach( async () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'should have a proper name', () => {
		expect( TableColumnResizeEditing.pluginName ).to.equal( 'TableColumnResizeEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableColumnResizeEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableColumnResizeEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should have defined column widths in model', () => {
		setModelData( model, modelTable( [
			[ '00', '01', '02' ],
			[ '10', '11', '12' ]
		], { columnWidths: '25%,25%,50%' } ) );

		expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '25%', '25%', '50%' ] );
	} );

	it( 'should have defined col widths in view', () => {
		setModelData( model, modelTable( [
			[ '00', '01', '02' ],
			[ '10', '11', '12' ]
		], { columnWidths: '25%,25%,50%' } ) );

		const viewColWidths = [];

		for ( const item of view.createRangeIn( view.document.getRoot() ) ) {
			if ( item.item.is( 'element', 'col' ) ) {
				viewColWidths.push( item.item.getStyle( 'width' ) );
			}
		}

		expect( viewColWidths ).to.be.deep.equal( [ '25%', '25%', '50%' ] );
	} );

	it( 'adds `resizeTableWidth` command', () => {
		expect( editor.commands.get( 'resizeTableWidth' ) ).to.be.instanceOf( TableWidthsCommand );
	} );

	it( 'adds `resizeColumnWidths` command', () => {
		expect( editor.commands.get( 'resizeColumnWidths' ) ).to.be.instanceOf( TableWidthsCommand );
	} );

	describe( 'conversion', () => {
		describe( 'upcast', () => {
			it( 'the table width style set on <figure> element to tableWidth attribute correctly', () => {
				editor.setData(
					`<figure class="table" style="width: 100%">
						<table>
							<colgroup>
								<col style="width:50%;">
								<col style="width:50%;">
							</colgroup>
							<tbody>
								<tr>
									<td>11</td>
									<td>12</td>
								</tr>
							</tbody>
						</table>
					</figure>`
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table tableWidth="100%">' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>11</paragraph>' +
							'</tableCell>' +
							'<tableCell>' +
								'<paragraph>12</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
						'<tableColumnGroup>' +
							'<tableColumn columnWidth="50%"></tableColumn>' +
							'<tableColumn columnWidth="50%"></tableColumn>' +
						'</tableColumnGroup>' +
					'</table>'
				);
			} );

			it( 'the table width style set on <table> element to tableWidth attribute correctly', () => {
				editor.setData(
					`<table class="table" style="width: 100%">
						<colgroup>
							<col style="width:50%;">
							<col style="width:50%;">
						</colgroup>
						<tbody>
							<tr>
								<td>11</td>
								<td>12</td>
							</tr>
						</tbody>
					</table>`
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table tableWidth="100%">' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>11</paragraph>' +
							'</tableCell>' +
							'<tableCell>' +
								'<paragraph>12</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
						'<tableColumnGroup>' +
							'<tableColumn columnWidth="50%"></tableColumn>' +
							'<tableColumn columnWidth="50%"></tableColumn>' +
						'</tableColumnGroup>' +
					'</table>'
				);
			} );

			it( 'the table width style set on <figure> element and on <table> should be convert to tableWidth attribute correctly', () => {
				editor.setData(
					`<figure class="table" style="width: 200px">
						<table style="width:100px">
							<colgroup>
								<col style="width:50%;">
								<col style="width:50%;">
							</colgroup>
							<tbody>
								<tr>
									<td>11</td>
									<td>12</td>
								</tr>
							</tbody>
						</table>
					</figure>`
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table tableWidth="200px">' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>11</paragraph>' +
							'</tableCell>' +
							'<tableCell>' +
								'<paragraph>12</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
						'<tableColumnGroup>' +
							'<tableColumn columnWidth="50%"></tableColumn>' +
							'<tableColumn columnWidth="50%"></tableColumn>' +
						'</tableColumnGroup>' +
					'</table>'
				);
			} );

			describe( 'when upcasting <colgroup> element', () => {
				it( 'should handle the correct number of <col> elements', () => {
					editor.setData(
						`<figure class="table">
							<table>
								<colgroup>
									<col style="width:33.33%;">
									<col style="width:33.33%;">
									<col style="width:33.34%;">
								</colgroup>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
										<td>13</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>11</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>12</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>13</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="33.33%"></tableColumn>' +
								'<tableColumn columnWidth="33.33%"></tableColumn>' +
								'<tableColumn columnWidth="33.34%"></tableColumn>' +
						'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'should handle too small number of <col> elements', () => {
					editor.setData(
						`<figure class="table">
							<table>
								<colgroup>
									<col style="width:33.33%;">
									<col style="width:33.33%;">
								</colgroup>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
										<td>13</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>11</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>12</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>13</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="33.33%"></tableColumn>' +
								'<tableColumn columnWidth="33.33%"></tableColumn>' +
								'<tableColumn columnWidth="33.34%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'should handle too big number of <col> elements', () => {
					editor.setData(
						`<figure class="table">
							<table>
								<colgroup>
									<col style="width:33.33%;">
									<col style="width:33.33%;">
									<col style="width:33.34%;">
									<col style="width:33.33%;">
								</colgroup>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
										<td>13</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>11</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>12</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>13</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="33.33%"></tableColumn>' +
								'<tableColumn columnWidth="33.33%"></tableColumn>' +
								'<tableColumn columnWidth="33.34%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'should handle <col> with pixel width', () => {
					editor.setData(
						`<figure class="table">
							<table>
								<colgroup>
									<col style="width:33.33%;">
									<col style="width:33.33%;">
									<col style="width:450px">
								</colgroup>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
										<td>13</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>11</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>12</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>13</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="33.33%"></tableColumn>' +
								'<tableColumn columnWidth="33.33%"></tableColumn>' +
								'<tableColumn columnWidth="33.34%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'should handle <col> with pt width', () => {
					editor.setData(
						`<figure class="table">
							<table>
								<colgroup>
									<col style="width:30pt;">
									<col style="width:30pt;">
									<col style="width:60pt">
								</colgroup>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
										<td>13</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>11</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>12</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>13</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="25%"></tableColumn>' +
								'<tableColumn columnWidth="25%"></tableColumn>' +
								'<tableColumn columnWidth="50%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'should handle <col> with pt width summing to less than 100', () => {
					editor.setData(
						`<figure class="table">
							<table>
								<colgroup>
									<col style="width:15pt;">
									<col style="width:15pt;">
									<col style="width:30pt">
								</colgroup>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
										<td>13</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>11</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>12</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>13</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="25%"></tableColumn>' +
								'<tableColumn columnWidth="25%"></tableColumn>' +
								'<tableColumn columnWidth="50%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'should adjust the missing column widths proportionally', () => {
					editor.setData(
						`<figure class="table">
							<table>
								<colgroup>
									<col style="width:50%;">
								</colgroup>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
										<td>13</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>11</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>12</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>13</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="50%"></tableColumn>' +
								'<tableColumn columnWidth="25%"></tableColumn>' +
								'<tableColumn columnWidth="25%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'should handle the incorrect elements inside', () => {
					editor.setData(
						`<figure class="table">
							<table>
								<colgroup>
									<p style="width:33.33%;"></p>
								</colgroup>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
										<td>13</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>11</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>12</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>13</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="33.33%"></tableColumn>' +
								'<tableColumn columnWidth="33.33%"></tableColumn>' +
								'<tableColumn columnWidth="33.34%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'should not convert if colgroup was already converted', () => {
					editor.conversion.for( 'upcast' ).add( dispatcher => {
						dispatcher.on( 'element:colgroup', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.viewItem, { name: true } );
							data.modelRange = conversionApi.writer.createRange( data.modelCursor );
						}, { priority: 'highest' } );
					} );

					editor.setData(
						`<figure class="table" style="width: 100%">
							<table>
								<colgroup>
									<col style="width:50%;">
									<col style="width:50%;">
								</colgroup>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table tableWidth="100%">' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>11</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>12</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>'
					);
				} );

				it( 'should apply auto width if <col> element does not have style specified', () => {
					editor.setData(
						`<figure class="table">
							<table>
								<colgroup>
									<col>
									<col style="width:33.33%;">
									<col style="width:33.34%;">
								</colgroup>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
										<td>13</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>11</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>12</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>13</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="33.33%"></tableColumn>' +
								'<tableColumn columnWidth="33.33%"></tableColumn>' +
								'<tableColumn columnWidth="33.34%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'should convert the `col[span]` attribute', () => {
					editor.setData(
						`<figure class="table">
							<table>
								<colgroup>
									<col style="width:10%;" span="2">
									<col style="width:50%;">
									<col style="width:10%;" span="3">
								</colgroup>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
										<td>13</td>
										<td>14</td>
										<td>15</td>
										<td>16</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>11</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>12</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>13</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>14</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>15</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>16</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="10%"></tableColumn>' +
								'<tableColumn columnWidth="10%"></tableColumn>' +
								'<tableColumn columnWidth="50%"></tableColumn>' +
								'<tableColumn columnWidth="10%"></tableColumn>' +
								'<tableColumn columnWidth="10%"></tableColumn>' +
								'<tableColumn columnWidth="10%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'should handle the `col[span]` attribute and missing cols', () => {
					editor.setData(
						`<figure class="table">
							<table>
								<colgroup>
									<col style="width:10%;" span="2">
									<col style="width:50%;">
								</colgroup>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
										<td>13</td>
										<td>14</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>11</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>12</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>13</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>14</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="10%"></tableColumn>' +
								'<tableColumn columnWidth="10%"></tableColumn>' +
								'<tableColumn columnWidth="50%"></tableColumn>' +
								'<tableColumn columnWidth="30%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );
			} );
		} );

		describe( 'downcast', () => {
			it( 'the tableWidth attribute correctly', () => {
				setModelData( model, modelTable( [
					[ '11', '12' ]
				], { columnWidths: '50%,50%', tableWidth: '100%' } ) );

				expect( editor.getData() ).to.equal(
					'<figure class="table" style="width:100%;">' +
						'<table class="ck-table-resized">' +
							'<colgroup>' +
								'<col style="width:50%;">' +
								'<col style="width:50%;">' +
							'</colgroup>' +
							'<tbody>' +
								'<tr>' +
									'<td>11</td>' +
									'<td>12</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );

			it( 'should remove <colgroup> element if <tableColumnGroup> element was removed', () => {
				setModelData( model, modelTable( [
					[ '11', '12' ]
				], { columnWidths: '50%,50%', tableWidth: '100%' } ) );

				model.change( writer => {
					const tableColumnGroup = resizePlugin.getColumnGroupElement( model.document.getRoot().getChild( 0 ) );

					writer.remove( tableColumnGroup );
				} );

				expect( editor.getData() ).to.equal(
					'<figure class="table" style="width:100%;">' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td>11</td>' +
									'<td>12</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>'
				);
			} );
		} );

		describe( 'model change integration', () => {
			describe( 'and the widhtStrategy is "manualWidth"', () => {
				it( 'should create resizers when table is inserted', () => {
					editor.execute( 'insertTable' );

					model.change( writer => {
						const table = model.document.getRoot().getChild( 0 );

						writer.setAttribute( 'widthStrategy', 'manualWidth', table );
					} );

					const domTable = getDomTable( view );
					const resizers = Array.from( domTable.querySelectorAll( '.ck-table-column-resizer' ) );

					expect( resizers.length ).to.equal( 4 );
				} );

				it( 'should create resizers when row is inserted', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '[12]' ]
					], { columnWidths: '25%,25%,50%' } ) );

					editor.execute( 'insertTableRowBelow' );

					const domTable = getDomTable( view );
					const resizers = Array.from( domTable.querySelectorAll( '.ck-table-column-resizer' ) );

					expect( resizers.length ).to.equal( 9 );
				} );

				it( 'should create resizers when cell from splitting is inserted', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ],
						[ '10', '11', '[12]' ]
					], { columnWidths: '25%,25%,50%' } ) );

					editor.execute( 'splitTableCellVertically' );

					const domTable = getDomTable( view );
					const resizers = Array.from( domTable.querySelectorAll( '.ck-table-column-resizer' ) );

					expect( resizers.length ).to.equal( 7 );
				} );
			} );
		} );
	} );

	describe( 'post-fixer', () => {
		it( 'should find and allow for resizing nested tables', () => {
			editor.setData(
				`<figure class="table">
					<table>
						<tbody
							<tr>
								<td>
									<figure class="table">
										<table>
											<tbody>
												<tr>
													<td>20</td>
													<td>21</td>
												</tr>
											</tbody>
										</table>
									</figure>
								</td>
								<td>11</td>
							</tr>
						</tbody>
					</table>
				</figure>`
			);

			expect( document.getElementsByClassName( 'ck-table-column-resizer' ).length ).to.equal( 4 );
		} );
	} );

	describe( '_isResizingAllowed property', () => {
		describe( 'should be set to "false"', () => {
			it( 'if editor is in the read-only mode', () => {
				editor.enableReadOnlyMode( 'test' );

				expect( resizePlugin._isResizingAllowed ).to.equal( false );
			} );

			it( 'if the TableColumnResize plugin is disabled', () => {
				editor.plugins.get( 'TableColumnResize' ).isEnabled = false;

				expect( resizePlugin._isResizingAllowed ).to.equal( false );
			} );

			it( 'if resizeTableWidth command is disabled', () => {
				editor.commands.get( 'resizeTableWidth' ).isEnabled = false;

				expect( resizePlugin._isResizingAllowed ).to.equal( false );
			} );

			it( 'if resizeColumnWidths command is disabled', () => {
				editor.commands.get( 'resizeColumnWidths' ).isEnabled = false;

				expect( resizePlugin._isResizingAllowed ).to.equal( false );
			} );
		} );

		describe( 'should be set to "true"', () => {
			it( 'if the editor is not read-only and plugin and commands are enabled', () => {
				editor.plugins.get( 'TableColumnResize' ).isEnabled = true;
				editor.commands.get( 'resizeTableWidth' ).isEnabled = true;
				editor.commands.get( 'resizeColumnWidths' ).isEnabled = true;

				expect( resizePlugin._isResizingAllowed ).to.equal( true );
			} );
		} );

		describe( 'should change value to "false"', () => {
			it( 'if editor was switched to the read-only mode at runtime', () => {
				const spy = sinon.spy();
				editor.listenTo( resizePlugin, 'change:_isResizingAllowed', spy );

				editor.enableReadOnlyMode( 'test' );

				expect( spy.calledOnce, 'Property value should have changed once' ).to.be.true;
				expect( resizePlugin._isResizingAllowed ).to.equal( false );
			} );

			it( 'if the TableResizeEditing plugin was disabled at runtime', () => {
				const spy = sinon.spy();

				editor.listenTo( resizePlugin, 'change:_isResizingAllowed', spy );

				editor.plugins.get( 'TableColumnResize' ).isEnabled = false;

				expect( spy.calledOnce, 'Property value should have changed once' ).to.be.true;
				expect( resizePlugin._isResizingAllowed ).to.equal( false );
			} );

			it( 'if resizeTableWidth command was disabled at runtime', () => {
				const spy = sinon.spy();

				editor.listenTo( resizePlugin, 'change:_isResizingAllowed', spy );

				editor.commands.get( 'resizeTableWidth' ).isEnabled = false;

				expect( spy.calledOnce, 'Property value should have changed once' ).to.be.true;
				expect( resizePlugin._isResizingAllowed ).to.equal( false );
			} );

			it( 'if resizeColumnWidths command was disabled at runtime', () => {
				const spy = sinon.spy();

				editor.listenTo( resizePlugin, 'change:_isResizingAllowed', spy );

				editor.commands.get( 'resizeColumnWidths' ).isEnabled = false;

				expect( spy.calledOnce, 'Property value should have changed once' ).to.be.true;
				expect( resizePlugin._isResizingAllowed ).to.equal( false );
			} );
		} );

		describe( 'should change value to "true"', () => {
			it( 'if read-only mode was disabled at runtime', () => {
				editor.enableReadOnlyMode( 'test' );

				const spy = sinon.spy();

				editor.listenTo( resizePlugin, 'change:_isResizingAllowed', spy );

				editor.disableReadOnlyMode( 'test' );

				expect( spy.calledOnce, 'Property value should have changed once' ).to.be.true;
				expect( resizePlugin._isResizingAllowed ).to.equal( true );
			} );

			it( 'if the TableResizeEditing plugin was enabled at runtime', () => {
				editor.plugins.get( 'TableColumnResize' ).isEnabled = false;

				const spy = sinon.spy();

				editor.listenTo( resizePlugin, 'change:_isResizingAllowed', spy );

				editor.plugins.get( 'TableColumnResize' ).isEnabled = true;

				expect( spy.calledOnce, 'Property value should have changed once' ).to.be.true;
				expect( resizePlugin._isResizingAllowed ).to.equal( true );
			} );

			it( 'if resizeTableWidth command was enabled at runtime', () => {
				editor.commands.get( 'resizeTableWidth' ).isEnabled = false;

				const spy = sinon.spy();

				editor.listenTo( resizePlugin, 'change:_isResizingAllowed', spy );

				editor.commands.get( 'resizeTableWidth' ).isEnabled = true;

				expect( spy.calledOnce, 'Property value should have changed once' ).to.be.true;
				expect( resizePlugin._isResizingAllowed ).to.equal( true );
			} );

			it( 'if resizeColumnWidths command was enabled at runtime', () => {
				editor.commands.get( 'resizeColumnWidths' ).isEnabled = false;

				const spy = sinon.spy();

				editor.listenTo( resizePlugin, 'change:_isResizingAllowed', spy );

				editor.commands.get( 'resizeColumnWidths' ).isEnabled = true;

				expect( spy.calledOnce, 'Property value should have changed once' ).to.be.true;
				expect( resizePlugin._isResizingAllowed ).to.equal( true );
			} );
		} );

		it( 'editable should not have the "ck-column-resize_disabled" class if "_isResizingAllowed" is set to "true"', () => {
			resizePlugin._isResizingAllowed = true;

			expect( editor.editing.view.document.getRoot().hasClass( 'ck-column-resize_disabled' ) ).to.equal( false );
		} );

		it( 'editable should have the "ck-column-resize_disabled" class if "_isResizingAllowed" is set to "false"', () => {
			resizePlugin._isResizingAllowed = false;

			expect( editor.editing.view.document.getRoot().hasClass( 'ck-column-resize_disabled' ) ).to.equal( true );
		} );
	} );

	describe( 'does not start resizing', () => {
		it( 'if not clicked on the resizer', () => {
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

			tableColumnResizeMouseSimulator.down( editor, view.getDomRoot() );

			expect( resizePlugin._isResizingActive ).to.be.false;
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );

			tableColumnResizeMouseSimulator.over( editor, view.getDomRoot() );

			expect( resizePlugin._isResizingActive ).to.be.false;
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );

			tableColumnResizeMouseSimulator.out( editor, view.getDomRoot() );

			expect( resizePlugin._isResizingActive ).to.be.false;
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );
		} );

		it( 'if resizing is not allowed', () => {
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

			resizePlugin._isResizingAllowed = false;

			tableColumnResizeMouseSimulator.down( editor, getDomResizer( getDomTable( view ), 0, 0 ) );

			expect( resizePlugin._isResizingActive ).to.be.false;
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );

			tableColumnResizeMouseSimulator.over( editor, getDomResizer( getDomTable( view ), 0, 0 ) );

			expect( resizePlugin._isResizingActive ).to.be.false;
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );

			tableColumnResizeMouseSimulator.out( editor, getDomResizer( getDomTable( view ), 0, 0 ) );

			expect( resizePlugin._isResizingActive ).to.be.false;
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );
		} );

		it( 'without dragging', () => {
			// Test-specific.
			const columnToResizeIndex = 0;
			const mouseMovementVector = { x: 0, y: 0 };

			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

			// Test-agnostic.
			const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector, 1 );

			const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

			assertModelWidthsSum( finalModelColumnWidthsPc );

			const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

			assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

			const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
			const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
				initialViewColumnWidthsPx,
				mouseMovementVector,
				contentDirection,
				columnToResizeIndex
			);

			assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
		} );

		it( 'without mousedown event before mousemove', () => {
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

			const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			// tableColumnResizeMouseSimulator.down( editor, getDomResizer( getDomTable( view ), 0, 0 ) );
			tableColumnResizeMouseSimulator.move( editor, getDomResizer( getDomTable( view ), 0, 0 ), { x: 10, y: 0 } );

			const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			expect( finalViewColumnWidthsPx ).to.deep.equal( initialViewColumnWidthsPx );
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );
		} );

		it( 'after mouseover sets resizer sizes, after mouseout removes them', () => {
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

			const tableRect = getDomTableRects( getDomTable( view ) );

			const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
			const resizerBeforeMouseOver = getDomResizer( getDomTable( view ), 0, 0 );

			expect( resizerBeforeMouseOver.outerHTML ).to.equal( '<div class="ck-table-column-resizer"></div>' );
			expect( getComputedStyle( resizerBeforeMouseOver, 'top' ) ).to.equal( '0px' );
			expect( getComputedStyle( resizerBeforeMouseOver, 'bottom' ) ).to.equal( '0px' );

			tableColumnResizeMouseSimulator.over( editor, getDomResizer( getDomTable( view ), 0, 0 ) );

			const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
			const resizerAfterMouseOver = getDomResizer( getDomTable( view ), 0, 0 );

			const resizerRect = new Rect( resizerAfterMouseOver.parentElement );

			const top = Number( ( tableRect.top - resizerRect.top ).toFixed( 4 ) );
			const bottom = Number( ( resizerRect.bottom - tableRect.bottom ).toFixed( 4 ) );

			expect( getComputedStyle( resizerAfterMouseOver, 'top' ) ).to.equal( top + 'px' );
			expect( getComputedStyle( resizerAfterMouseOver, 'bottom' ) ).to.equal( bottom + 'px' );

			expect( resizerAfterMouseOver.outerHTML ).to.equal(
				`<div class="ck-table-column-resizer" style="bottom:${ bottom }px;top:${ top }px;"></div>`
			);

			const resizerAfterMouseOut = getDomResizer( getDomTable( view ), 0, 0 );

			tableColumnResizeMouseSimulator.out( editor, getDomResizer( getDomTable( view ), 0, 0 ), { x: 10, y: 0 } );

			expect( getComputedStyle( resizerAfterMouseOut, 'top' ) ).to.equal( '0px' );
			expect( getComputedStyle( resizerAfterMouseOut, 'bottom' ) ).to.equal( '0px' );

			expect( resizerAfterMouseOut.outerHTML ).to.equal(
				'<div class="ck-table-column-resizer"></div>'
			);

			expect( finalViewColumnWidthsPx ).to.deep.equal( initialViewColumnWidthsPx );
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );
		} );
	} );

	describe( 'while resizing', () => {
		it( 'cancels resizing if resizing is not allowed during mousemove (plugin does not allow)', () => {
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

			const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			tableColumnResizeMouseSimulator.down( editor, getDomResizer( getDomTable( view ), 0, 0 ) );
			tableColumnResizeMouseSimulator.move( editor, getDomResizer( getDomTable( view ), 0, 0 ), { x: 10, y: 0 } );

			resizePlugin._isResizingAllowed = false;

			tableColumnResizeMouseSimulator.move( editor, getDomResizer( getDomTable( view ), 0, 0 ), { x: 10, y: 0 } );

			const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			expect( finalViewColumnWidthsPx ).to.deep.equal( initialViewColumnWidthsPx );
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );
		} );

		it( 'cancels resizing if resizing is not allowed during mousemove (readonly mode)', () => {
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

			const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			model.document.isReadOnly = true;

			tableColumnResizeMouseSimulator.down( editor, getDomResizer( getDomTable( view ), 0, 0 ) );
			tableColumnResizeMouseSimulator.move( editor, getDomResizer( getDomTable( view ), 0, 0 ), { x: 10, y: 0 } );

			const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			expect( finalViewColumnWidthsPx ).to.deep.equal( initialViewColumnWidthsPx );
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );
		} );

		it( 'does nothing on mouseup if resizing was not started', () => {
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

			const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			tableColumnResizeMouseSimulator.up( editor );

			const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			expect( finalViewColumnWidthsPx ).to.deep.equal( initialViewColumnWidthsPx );
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );
		} );

		it( 'does not clean the resizer styles on mouseover if resizing was not finished', () => {
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

			const tableRect = getDomTableRects( getDomTable( view ) );

			tableColumnResizeMouseSimulator.over( editor, getDomResizer( getDomTable( view ), 0, 0 ) );
			tableColumnResizeMouseSimulator.down( editor, getDomResizer( getDomTable( view ), 0, 0 ) );
			tableColumnResizeMouseSimulator.move( editor, getDomResizer( getDomTable( view ), 0, 0 ), { x: 10, y: 0 } );

			const resizerAfterMouseOver = getDomResizer( getDomTable( view ), 0, 0 );
			const resizerRect = new Rect( resizerAfterMouseOver.parentElement );

			const top = Number( ( tableRect.top - resizerRect.top ).toFixed( 4 ) );
			const bottom = Number( ( resizerRect.bottom - tableRect.bottom ).toFixed( 4 ) );

			expect( getComputedStyle( resizerAfterMouseOver, 'top' ) ).to.equal( top + 'px' );
			expect( getComputedStyle( resizerAfterMouseOver, 'bottom' ) ).to.equal( bottom + 'px' );

			expect( resizerAfterMouseOver.outerHTML ).to.equal(
				`<div class="ck-table-column-resizer ck-table-column-resizer__active" style="bottom:${ bottom }px;top:${ top }px;"></div>`
			);

			const resizerAfterMouseOut = getDomResizer( getDomTable( view ), 0, 0 );

			tableColumnResizeMouseSimulator.out( editor, getDomResizer( getDomTable( view ), 0, 0 ), { x: 10, y: 0 } );

			expect( getComputedStyle( resizerAfterMouseOut, 'top' ) ).to.equal( top + 'px' );
			expect( getComputedStyle( resizerAfterMouseOut, 'bottom' ) ).to.equal( bottom + 'px' );

			expect( resizerAfterMouseOut.outerHTML ).to.equal(
				`<div class="ck-table-column-resizer ck-table-column-resizer__active" style="bottom:${ bottom }px;top:${ top }px;"></div>`
			);
		} );

		it( 'does not change the widths if the movement vector was {0,0}', () => {
			// Test-specific.
			const columnToResizeIndex = 0;
			const mouseMovementVector = { x: 0, y: 0 };

			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '25%,25%,50%', tableWidth: '40%' } ) );

			// Test-agnostic.
			const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

			const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

			assertModelWidthsSum( finalModelColumnWidthsPc );

			const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

			assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

			const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
				initialViewColumnWidthsPx,
				mouseMovementVector,
				contentDirection,
				columnToResizeIndex
			);

			assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
		} );

		describe( 'cancels resizing if resizing is not allowed during mouseup', () => {
			it( 'if only columnWidths was changed', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '20%,25%,55%', tableWidth: '40%' } ) );

				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.down( editor, getDomResizer( getDomTable( view ), 0, 0 ) );
				tableColumnResizeMouseSimulator.move( editor, getDomResizer( getDomTable( view ), 0, 0 ), { x: 10, y: 0 } );

				resizePlugin._isResizingAllowed = false;

				tableColumnResizeMouseSimulator.up( editor );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				expect( finalViewColumnWidthsPx ).to.deep.equal( initialViewColumnWidthsPx );
				expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );
			} );

			it( 'if columnWidths was set for the first time', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				] ) );

				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.down( editor, getDomResizer( getDomTable( view ), 0, 0 ) );
				tableColumnResizeMouseSimulator.move( editor, getDomResizer( getDomTable( view ), 0, 0 ), { x: 10, y: 0 } );

				resizePlugin._isResizingAllowed = false;

				tableColumnResizeMouseSimulator.up( editor );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				expect( finalViewColumnWidthsPx ).to.deep.equal( initialViewColumnWidthsPx );
				expect( getColumnGroupElement( model.document.getRoot().getChild( 0 ) ) ).to.be.undefined;
			} );

			it( 'if tableWidth was changed', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '20%,25%,55%', tableWidth: '40%' } ) );

				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.down( editor, getDomResizer( getDomTable( view ), 2, 0 ) );
				tableColumnResizeMouseSimulator.move( editor, getDomResizer( getDomTable( view ), 2, 0 ), { x: 10, y: 0 } );

				resizePlugin._isResizingAllowed = false;

				tableColumnResizeMouseSimulator.up( editor );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				expect( finalViewColumnWidthsPx ).to.deep.equal( initialViewColumnWidthsPx );
				expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );
			} );

			it( 'if tableWidth was set for the first time', () => {
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '20%,25%,55%' } ) );

				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.down( editor, getDomResizer( getDomTable( view ), 2, 0 ) );
				tableColumnResizeMouseSimulator.move( editor, getDomResizer( getDomTable( view ), 2, 0 ), { x: 10, y: 0 } );

				resizePlugin._isResizingAllowed = false;

				tableColumnResizeMouseSimulator.up( editor );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				expect( finalViewColumnWidthsPx ).to.deep.equal( initialViewColumnWidthsPx );
				expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );
			} );
		} );

		describe( 'right or left', () => {
			it( 'shrinks the first table column on dragging left', () => {
				// Test-specific.
				const columnToResizeIndex = 0;
				const mouseMovementVector = { x: -10, y: 0 };

				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '25%,25%,50%', tableWidth: '500px' } ) );

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			it( 'shrinks the first table header column on dragging left', () => {
				// Test-specific.
				const columnToResizeIndex = 0;
				const mouseMovementVector = { x: -10, y: 0 };

				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '25%,25%,50%', tableWidth: '500px', headingColumns: 1 } ) );

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			it( 'expands the first table column on dragging right', () => {
				// Test-specific.
				const columnToResizeIndex = 0;
				const mouseMovementVector = { x: 10, y: 0 };

				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '25%,25%,50%', tableWidth: '500px' } ) );

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			it( 'shrinks the last column on dragging left', () => {
				// Test-specific.
				const columnToResizeIndex = 2;
				const mouseMovementVector = { x: -10, y: 0 };

				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '25%,25%,50%', tableWidth: '500px' } ) );

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			it( 'correctly resizes a table with only header rows', () => {
				// Test-specific.
				const columnToResizeIndex = 0;
				const mouseMovementVector = { x: 10, y: 0 };

				setModelData( model, modelTable( [ [ '0', '1' ] ], { headingRows: '1', columnWidths: '50%,50%' } ) );

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			it( 'does not remove column when it was shrinked to negative width', () => {
				// Test-specific.
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

				const columnToResizeIndex = 1;
				const initialColumnWidth = getColumnWidth( getDomTable( view ), columnToResizeIndex );
				const mouseMovementVector = { x: -( initialColumnWidth * 1.05 ), y: 0 };

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );

				expect( view.document.getRoot()
					.getChild( 0 ) // figure
					.getChild( 1 ) // table
					.getChild( 1 ) // tbody
					.getChild( 0 ) // tr
					.childCount
				).to.equal( 3 );
			} );

			it( 'does not remove column when adjacent column was expanded over it', () => {
				// Test-specific.
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

				const columnToResizeIndex = 0;
				const initialColumnWidth = getColumnWidth( getDomTable( view ), columnToResizeIndex );
				const mouseMovementVector = { x: ( initialColumnWidth * 1.05 ), y: 0 };

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );

				expect( view.document.getRoot()
					.getChild( 0 ) // figure
					.getChild( 1 ) // table
					.getChild( 1 ) // tbody
					.getChild( 0 ) // tr
					.childCount
				).to.equal( 3 );
			} );

			it( 'resizes column with a colspan in the first row', () => {
				// Test-specific.
				const columnToResizeIndex = 0;
				const mouseMovementVector = { x: -10, y: 0 };

				setModelData( model, modelTable( [
					[ { contents: '00', colspan: 2 }, '02' ],
					[ '10', '11', '12' ],
					[ '20', '21', '22' ]
				], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector, 1 );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			it( 'resizes correct column with a rowspan in the last column', () => {
				// Test-specific.
				const columnToResizeIndex = 1;
				const mouseMovementVector = { x: -10, y: 0 };

				setModelData( model, modelTable( [
					[ '00', '01', { contents: '02', rowspan: 3 } ],
					[ '10', '11' ],
					[ '20', '21' ]
				], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector, 2 );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			describe( 'in editor with TableProperties, where there are 2 tables: centered and aligned', () => {
				let editor, view, editorElement;

				beforeEach( async () => {
					editorElement = document.createElement( 'div' );
					document.body.appendChild( editorElement );
					editor = await createEditor( null, [ TableProperties ] );

					view = editor.editing.view;
					contentDirection = editor.locale.contentLanguageDirection;
				} );

				afterEach( async () => {
					if ( editorElement ) {
						editorElement.remove();
					}

					if ( editor ) {
						await editor.destroy();
					}
				} );

				it( 'shrinks the table twice as much when resizing centered table as compared to aligned table', () => {
					const columnToResizeIndex = 1;
					const mouseMovementVector = { x: -10, y: 0 };

					editor.setData(
						`<figure class="table" style="float:left;width:500px;">
							<table>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector, 0 );

					const alignedTableColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

					editor.setData(
						`<figure class="table" style="width:500px;">
							<table>
								<tbody>
									<tr>
										<td>11</td>
										<td>12</td>
									</tr>
								</tbody>
							</table>
						</figure>`
					);

					tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector, 0 );

					const centeredTableColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
					const widthDifference = centeredTableColumnWidthsPx[ 1 ] - alignedTableColumnWidthsPx[ 1 ];

					expect( Math.abs( widthDifference - mouseMovementVector.x ) < PIXEL_PRECISION ).to.be.true;
				} );
			} );

			describe( 'nested table ', () => {
				it( 'correctly shrinks when the last column is dragged to the left', () => {
					// Test-specific.
					const columnToResizeIndex = 1;
					const mouseMovementVector = { x: -10, y: 0 };

					setModelData( editor.model,
						'<table tableWidth="100%">' +
							'<tableRow>' +
								'<tableCell>' +
									'[<table>' +
										'<tableRow>' +
											'<tableCell>' +
												'<paragraph>foo</paragraph>' +
											'</tableCell>' +
											'<tableCell>' +
												'<paragraph>bar</paragraph>' +
											'</tableCell>' +
										'</tableRow>' +
										'<tableColumnGroup>' +
											'<tableColumn columnWidth="50%"></tableColumn>' +
											'<tableColumn columnWidth="50%"></tableColumn>' +
										'</tableColumnGroup>' +
									'</table>]' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);

					const modelNestedTable = model.document.selection.getSelectedElement();
					const domNestedTable = getDomTable( view ).querySelectorAll( 'table' )[ 1 ];
					const viewNestedTable = view.document.selection.getSelectedElement().getChild( 1 );

					setInitialWidthsInPx( editor, viewNestedTable, 201, 400 );

					// Test-agnostic.
					const initialViewColumnWidthsPx = getViewColumnWidthsPx( domNestedTable );

					tableColumnResizeMouseSimulator.resize( editor, domNestedTable, columnToResizeIndex, mouseMovementVector, 0 );

					const finalModelColumnWidthsPc = getModelColumnWidthsPc( modelNestedTable );

					assertModelWidthsSum( finalModelColumnWidthsPc );

					const finalViewColumnWidthsPc = getViewColumnWidthsPc( viewNestedTable );

					assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

					const finalViewColumnWidthsPx = getViewColumnWidthsPx( domNestedTable );
					const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
						initialViewColumnWidthsPx,
						mouseMovementVector,
						contentDirection,
						columnToResizeIndex
					);

					assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );

					expect( getModelData( model, { withoutSelection: true } ) ).to.match(
						new RegExp(
							'<table tableWidth="100%">' +
								'<tableRow>' +
									'<tableCell>' +
										'<table tableWidth="46\\.7[\\d]%">' +
											'<tableRow>' +
												'<tableCell>' +
													'<paragraph>foo</paragraph>' +
												'</tableCell>' +
												'<tableCell>' +
													'<paragraph>bar</paragraph>' +
												'</tableCell>' +
											'</tableRow>' +
											'<tableColumnGroup>' +
												'<tableColumn columnWidth="55\\.5[\\d]%"></tableColumn>' +
												'<tableColumn columnWidth="44\\.4[\\d]%"></tableColumn>' +
											'</tableColumnGroup>' +
										'</table>' +
									'</tableCell>' +
								'</tableRow>' +
								'<tableColumnGroup>' +
									'<tableColumn columnWidth="100%"></tableColumn>' +
								'</tableColumnGroup>' +
							'</table>'
						)
					);
				} );

				it( 'correctly expands when the last column is dragged to the right', () => {
					// Test-specific.
					const columnToResizeIndex = 1;
					const mouseMovementVector = { x: 10, y: 0 };

					setModelData( editor.model,
						'<table tableWidth="100%">' +
							'<tableRow>' +
								'<tableCell>' +
									'[<table tableWidth="90%">' +
										'<tableRow>' +
											'<tableCell>' +
												'<paragraph>foo</paragraph>' +
											'</tableCell>' +
											'<tableCell>' +
												'<paragraph>bar</paragraph>' +
											'</tableCell>' +
										'</tableRow>' +
										'<tableColumnGroup>' +
											'<tableColumn columnWidth="50%"></tableColumn>' +
											'<tableColumn columnWidth="50%"></tableColumn>' +
										'</tableColumnGroup>' +
									'</table>]' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);

					const modelNestedTable = model.document.selection.getSelectedElement();
					const domNestedTable = getDomTable( view ).querySelectorAll( 'table' )[ 1 ];
					const viewNestedTable = view.document.selection.getSelectedElement().getChild( 1 );

					setInitialWidthsInPx( editor, viewNestedTable, 201, 300 );

					// Test-agnostic.
					const initialViewColumnWidthsPx = getViewColumnWidthsPx( domNestedTable );

					tableColumnResizeMouseSimulator.resize( editor, domNestedTable, columnToResizeIndex, mouseMovementVector, 0 );

					const finalModelColumnWidthsPc = getModelColumnWidthsPc( modelNestedTable );

					assertModelWidthsSum( finalModelColumnWidthsPc );

					const finalViewColumnWidthsPc = getViewColumnWidthsPc( viewNestedTable );

					assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

					const finalViewColumnWidthsPx = getViewColumnWidthsPx( domNestedTable );
					const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
						initialViewColumnWidthsPx,
						mouseMovementVector,
						contentDirection,
						columnToResizeIndex
					);

					assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );

					expect( getModelData( model, { withoutSelection: true } ) ).to.match(
						new RegExp(
							'<table tableWidth="100%">' +
								'<tableRow>' +
									'<tableCell>' +
										'<table tableWidth="77\\.1[\\d]%">' +
											'<tableRow>' +
												'<tableCell>' +
													'<paragraph>foo</paragraph>' +
												'</tableCell>' +
												'<tableCell>' +
													'<paragraph>bar</paragraph>' +
												'</tableCell>' +
											'</tableRow>' +
											'<tableColumnGroup>' +
												'<tableColumn columnWidth="45\\.45%"></tableColumn>' +
												'<tableColumn columnWidth="54\\.55%"></tableColumn>' +
											'</tableColumnGroup>' +
										'</table>' +
									'</tableCell>' +
								'</tableRow>' +
								'<tableColumnGroup>' +
									'<tableColumn columnWidth="100%"></tableColumn>' +
								'</tableColumnGroup>' +
							'</table>'
						)
					);
				} );

				it( 'correctly updates the widths of the columns, when any of the inside ones has been resized', () => {
					// Test-specific.
					const columnToResizeIndex = 1;
					const mouseMovementVector = { x: 10, y: 0 };

					setModelData( editor.model,
						'<table tableWidth="100%">' +
							'<tableRow>' +
								'<tableCell>' +
									'[<table tableWidth="100%">' +
										'<tableRow>' +
											'<tableCell>' +
												'<paragraph>foo</paragraph>' +
											'</tableCell>' +
											'<tableCell>' +
												'<paragraph>bar</paragraph>' +
											'</tableCell>' +
											'<tableCell>' +
												'<paragraph>baz</paragraph>' +
											'</tableCell>' +
										'</tableRow>' +
										'<tableColumnGroup>' +
											'<tableColumn columnWidth="25%"></tableColumn>' +
											'<tableColumn columnWidth="25%"></tableColumn>' +
											'<tableColumn columnWidth="50%"></tableColumn>' +
										'</tableColumnGroup>' +
									'</table>]' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);

					const modelNestedTable = model.document.selection.getSelectedElement();
					const domNestedTable = getDomTable( view ).querySelectorAll( 'table' )[ 1 ];
					const viewNestedTable = view.document.selection.getSelectedElement().getChild( 1 );

					setInitialWidthsInPx( editor, viewNestedTable, null, 300 );

					// Test-agnostic.
					const initialViewColumnWidthsPx = getViewColumnWidthsPx( domNestedTable );

					tableColumnResizeMouseSimulator.resize( editor, domNestedTable, columnToResizeIndex, mouseMovementVector, 0 );

					const finalModelColumnWidthsPc = getModelColumnWidthsPc( modelNestedTable );

					assertModelWidthsSum( finalModelColumnWidthsPc );

					const finalViewColumnWidthsPc = getViewColumnWidthsPc( viewNestedTable );

					assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

					const finalViewColumnWidthsPx = getViewColumnWidthsPx( domNestedTable );

					const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
						initialViewColumnWidthsPx,
						mouseMovementVector,
						contentDirection,
						columnToResizeIndex
					);
					assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<table tableWidth="100%">' +
							'<tableRow>' +
								'<tableCell>' +
									'<table tableWidth="100%">' +
										'<tableRow>' +
											'<tableCell>' +
												'<paragraph>foo</paragraph>' +
											'</tableCell>' +
											'<tableCell>' +
												'<paragraph>bar</paragraph>' +
											'</tableCell>' +
											'<tableCell>' +
												'<paragraph>baz</paragraph>' +
											'</tableCell>' +
										'</tableRow>' +
										'<tableColumnGroup>' +
											'<tableColumn columnWidth="25%"></tableColumn>' +
											'<tableColumn columnWidth="28.52%"></tableColumn>' +
											'<tableColumn columnWidth="46.48%"></tableColumn>' +
										'</tableColumnGroup>' +
									'</table>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );
			} );
		} );

		describe( 'right or left (RTL)', () => {
			beforeEach( async () => {
				if ( editor ) {
					await editor.destroy();
				}

				editor = await createEditor( {
					language: 'ar'
				} );

				model = editor.model;
				view = editor.editing.view;
				contentDirection = editor.locale.contentLanguageDirection;
			} );

			it( 'shrinks the first table column on dragging right', () => {
				// Test-specific.
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '25%,25%,50%', tableWidth: '100%' } ) );

				const columnToResizeIndex = 0;
				const mouseMovementVector = { x: 10, y: 0 };

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			it( 'expands the first table column on dragging left', () => {
				// Test-specific.
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '25%,25%,50%', tableWidth: '100%' } ) );

				const columnToResizeIndex = 0;
				const mouseMovementVector = { x: -10, y: 0 };

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			it( 'shrinks the last column on dragging left', () => {
				// Test-specific.
				const columnToResizeIndex = 2;
				const mouseMovementVector = { x: 10, y: 0 };

				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '25%,25%,50%', tableWidth: '100%' } ) );

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			it( 'does not remove column when it was shrinked to negative width', () => {
				// Test-specific.
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '20%,25%,55%', tableWidth: '100%' } ) );

				const columnToResizeIndex = 1;
				const initialColumnWidth = getColumnWidth( getDomTable( view ), columnToResizeIndex );
				const mouseMovementVector = { x: initialColumnWidth * 1.05, y: 0 };

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );

				expect( view.document.getRoot()
					.getChild( 0 ) // figure
					.getChild( 1 ) // table
					.getChild( 1 ) // tbody
					.getChild( 0 ) // tr
					.childCount
				).to.equal( 3 );
			} );

			it( 'does not remove column when adjacent column was expanded over it', () => {
				// Test-specific.
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '20%,25%,55%', tableWidth: '100%' } ) );

				const columnToResizeIndex = 0;
				const initialColumnWidth = getColumnWidth( getDomTable( view ), columnToResizeIndex );
				const mouseMovementVector = { x: -( initialColumnWidth * 1.05 ), y: 0 };

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );
		} );

		describe( 'if cursor was moved outside the table', () => {
			it( 'resizes correctly if cursor was placed above the table', () => {
				// Test-specific.
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '20%,25%,55%', tableWidth: '100%' } ) );

				const columnToResizeIndex = 0;
				const cellRect = getDomTableCellRects( getDomTable( view ), columnToResizeIndex );
				const mouseMovementVector = { x: 10, y: -( cellRect.height ) };

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			it( 'resizes correctly if cursor was placed under the table', () => {
				// Test-specific.
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '20%,25%,55%', tableWidth: '100%' } ) );

				const columnToResizeIndex = 0;
				const tableRect = getDomTableRects( getDomTable( view ) );
				const mouseMovementVector = { x: 10, y: tableRect.height };

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			it( 'resizes correctly if cursor was placed outside left table border', () => {
				// Test-specific.
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '20%,25%,55%', tableWidth: '100%' } ) );

				const columnToResizeIndex = 0;
				const cellRect = getDomTableCellRects( getDomTable( view ), columnToResizeIndex );
				const mouseMovementVector = { x: -( cellRect.width + 20 ), y: 0 };

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );

			it( 'resizes correctly if cursor was placed outside right table border', () => {
				// Test-specific.
				setModelData( model, modelTable( [
					[ '00', '01', '02' ],
					[ '10', '11', '12' ]
				], { columnWidths: '20%,25%,55%', tableWidth: '100%' } ) );

				const columnToResizeIndex = 1;
				// We need the width of the last cell to move the cursor beyond it.
				const cellRect = getDomTableCellRects( getDomTable( view ), 2 );
				const mouseMovementVector = { x: ( cellRect.width + 40 ), y: 0 };

				// Test-agnostic.
				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalModelColumnWidthsPc = getModelColumnWidthsPc( getModelTable( model ) );

				assertModelWidthsSum( finalModelColumnWidthsPc );

				const finalViewColumnWidthsPc = getViewColumnWidthsPc( getViewTable( view ) );

				assertModelViewSync( finalModelColumnWidthsPc, finalViewColumnWidthsPc );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );
		} );
	} );

	describe( 'getTableColumnGroup()', () => {
		it( 'should return tableColumnGroup when it exists', () => {
			setModelData( model, modelTable( [ [ '01', '02' ] ], { columnWidths: '50%,50%' } ) );

			expect( resizePlugin.getColumnGroupElement( model.document.getRoot().getChild( 0 ) ) ).to.not.be.undefined;
		} );

		it( 'should not return anything if tableColumnGroup does not exists', () => {
			setModelData( model, modelTable( [ [ '01', '02' ] ] ) );

			expect( resizePlugin.getColumnGroupElement( model.document.getRoot().getChild( 0 ) ) ).to.be.undefined;
		} );

		it( 'should return the same tableColumnGroup element if it was passed as an argument', () => {
			setModelData( model, modelTable( [ [ '01', '02' ] ], { columnWidths: '50%,50%' } ) );

			const tableColumnGroup = model.document.getRoot().getChild( 0 ).getChild( 1 );

			expect( resizePlugin.getColumnGroupElement( tableColumnGroup ) ).to.equal( tableColumnGroup );
		} );
	} );

	describe( 'getTableColumns()', () => {
		it( 'should return tableColumn array when there are columns', () => {
			setModelData( model, modelTable( [ [ '01', '02' ] ], { columnWidths: '50%,50%' } ) );

			expect( resizePlugin.getTableColumnElements( model.document.getRoot().getChild( 0 ) ) ).to.have.length( 2 );
		} );
	} );

	describe( 'getTableColumnsWidths()', () => {
		it( 'should return tableColumnGroup count when there are columns', () => {
			setModelData( model, modelTable( [ [ '01', '02' ] ], { columnWidths: '50%,50%' } ) );

			expect( resizePlugin.getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '50%', '50%' ] );
		} );
	} );

	describe( 'in integration with', () => {
		describe( 'undo', () => {
			it( 'should resize correctly after undoing column insertion and resize', () => {
				setModelData( model, modelTable( [
					[ '00[]', '01' ],
					[ '10', '11' ]
				] ) );

				let columnToResizeIndex = 0;
				let mouseMovementVector = { x: -10, y: 0 };

				// Insert a column and resize it.
				editor.commands.get( 'insertTableColumnRight' ).execute();
				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				// Undo to the initial table state.
				editor.execute( 'undo' );
				editor.execute( 'undo' );

				const tableRow = getDomTable( view )
					.children[ 1 ] // table
					.children[ 0 ] // tbody
					.children[ 0 ]; // tr

				const initialViewColumnWidthsPx = [
					getDomCellOuterWidth( tableRow.children[ 0 ] ),
					getDomCellOuterWidth( tableRow.children[ 1 ] )
				];

				// Resize the restored table.
				columnToResizeIndex = 1;
				mouseMovementVector = { x: 2, y: 0 };

				tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
				const expectedViewColumnWidthsPx = calculateExpectedWidthPixels(
					initialViewColumnWidthsPx,
					mouseMovementVector,
					contentDirection,
					columnToResizeIndex
				);

				assertViewPixelWidths( finalViewColumnWidthsPx, expectedViewColumnWidthsPx );
			} );
		} );

		describe( 'table', () => {
			describe( 'structure manipulation', () => {
				describe( 'should adjust attributes in model', () => {
					it( 'when new column was inserted at the beginning', () => {
						setModelData( model, modelTable( [
							[ '00[]', '01', '02' ],
							[ '10', '11', '12' ]
						], { columnWidths: '20%,20%,60%', tableWidth: '50%' } ) );

						editor.commands.get( 'insertTableColumnLeft' ).execute();

						const wholeContentRange = model.createRangeIn( model.document.getRoot() );

						for ( const item of wholeContentRange ) {
							if ( item.item.is( 'element', 'table' ) ) {
								// Expect `columnWidths` to have 4 values.
								expect( getTableColumnsWidths( item.item ).length ).to.equal( 4 );
								// Expect a new column (it is the narrowest one) to be inserted at the first position.
								expect( parseFloat( getTableColumnsWidths( item.item )[ 0 ] ) < 10 ).to.be.true;
							}
						}
					} );

					it( 'when new column was inserted in the middle', () => {
						setModelData( model, modelTable( [
							[ '00[]', '01', '02' ],
							[ '10', '11', '12' ]
						], { columnWidths: '20%,20%,60%', tableWidth: '50%' } ) );

						editor.commands.get( 'insertTableColumnRight' ).execute();

						const wholeContentRange = model.createRangeIn( model.document.getRoot() );

						for ( const item of wholeContentRange ) {
							if ( item.item.is( 'element', 'table' ) ) {
								// Expect `columnWidths` to have 4 values.
								expect( getTableColumnsWidths( item.item ).length ).to.equal( 4 );
								// Expect a new column (it is the narrowest one) to be inserted at the second position.
								expect( parseFloat( getTableColumnsWidths( item.item )[ 1 ] ) < 10 ).to.be.true;
							}
						}
					} );

					it( 'when new column was inserted at the end', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02[]' ],
							[ '10', '11', '12' ]
						], { columnWidths: '20%,20%,60%', tableWidth: '50%' } ) );

						editor.commands.get( 'insertTableColumnRight' ).execute();

						const wholeContentRange = model.createRangeIn( model.document.getRoot() );

						for ( const item of wholeContentRange ) {
							if ( item.item.is( 'element', 'table' ) ) {
								// Expect `columnWidths` to have 4 values.
								expect( getTableColumnsWidths( item.item ).length ).to.equal( 4 );
								// Expect a new column (it is the narrowest one) to be inserted at the last position.
								expect( parseFloat( getTableColumnsWidths( item.item )[ 3 ] ) < 10 ).to.be.true;
							}
						}
					} );

					it( 'when first column was removed', () => {
						setModelData( model, modelTable( [
							[ '00[]', '01', '02' ],
							[ '10', '11', '12' ]
						], { columnWidths: '20%,25%,55%' } ) );

						editor.execute( 'removeTableColumn' );

						const wholeContentRange = model.createRangeIn( model.document.getRoot() );

						for ( const item of wholeContentRange ) {
							// Expect `columnWidths` to have 2 values and the next column to take over the width of removed one.
							if ( item.item.is( 'element', 'table' ) ) {
								const columnWidths = getTableColumnsWidths( item.item );
								expect( columnWidths.length ).to.equal( 2 );
								expect( columnWidths[ 0 ] ).to.equal( '45%' );
								expect( columnWidths[ 1 ] ).to.equal( '55%' );
							}
						}
					} );

					it( 'when middle column was removed', () => {
						setModelData( model, modelTable( [
							[ '00', '01[]', '02' ],
							[ '10', '11', '12' ]
						], { columnWidths: '20%,25%,55%' } ) );

						editor.execute( 'removeTableColumn' );

						const wholeContentRange = model.createRangeIn( model.document.getRoot() );

						for ( const item of wholeContentRange ) {
							// Expect `columnWidths` to have 2 values and the previous column to take over the width of removed one.
							if ( item.item.is( 'element', 'table' ) ) {
								const columnWidths = getTableColumnsWidths( item.item );
								expect( columnWidths.length ).to.equal( 2 );
								expect( columnWidths[ 0 ] ).to.equal( '45%' );
								expect( columnWidths[ 1 ] ).to.equal( '55%' );
							}
						}
					} );

					it( 'when last column was removed', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02[]' ],
							[ '10', '11', '12' ]
						], { columnWidths: '20%,25%,55%' } ) );

						editor.execute( 'removeTableColumn' );

						const wholeContentRange = model.createRangeIn( model.document.getRoot() );

						for ( const item of wholeContentRange ) {
							// Expect `columnWidths` to have 2 values and the previous column to take over the width of removed one.
							if ( item.item.is( 'element', 'table' ) ) {
								const columnWidths = getTableColumnsWidths( item.item );
								expect( columnWidths.length ).to.equal( 2 );
								expect( columnWidths[ 0 ] ).to.equal( '20%' );
								expect( columnWidths[ 1 ] ).to.equal( '80%' );
							}
						}
					} );

					it( 'when two columns were merged', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ]
						], { columnWidths: '20%,25%,55%' } ) );

						selectNodes( model, [
							[ 0, 0, 0 ],
							[ 0, 1, 0 ],
							[ 0, 0, 1 ],
							[ 0, 1, 1 ]
						] );

						editor.execute( 'mergeTableCells' );

						const wholeContentRange = model.createRangeIn( model.document.getRoot() );

						for ( const item of wholeContentRange ) {
							// Expect `columnWidths` to have 2 values and the first column to take over the width of merged one.
							if ( item.item.is( 'element', 'table' ) ) {
								const columnWidths = getTableColumnsWidths( item.item );
								expect( columnWidths.length ).to.equal( 2 );
								expect( columnWidths[ 0 ] ).to.equal( '45%' );
							}
						}
					} );

					it( 'when the whole table was merged', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ]
						], { columnWidths: '20%,25%,55%' } ) );

						selectNodes( model, [
							[ 0, 0, 0 ],
							[ 0, 1, 0 ],
							[ 0, 0, 1 ],
							[ 0, 1, 1 ],
							[ 0, 0, 2 ],
							[ 0, 1, 2 ]
						] );

						editor.execute( 'mergeTableCells' );

						const wholeContentRange = model.createRangeIn( model.document.getRoot() );

						for ( const item of wholeContentRange ) {
							// Expect `columnWidths` to have 2 values and the first column to take over the width of merged one.
							if ( item.item.is( 'element', 'table' ) ) {
								const columnWidths = getTableColumnsWidths( item.item );
								expect( columnWidths.length ).to.equal( 1 );
								expect( columnWidths[ 0 ] ).to.equal( '100%' );
							}
						}
					} );
				} );

				describe( 'should not adjust `columnWidths` attribute in model', () => {
					it( 'when only some cells from two columns were merged', () => {
						setModelData( model, modelTable( [
							[ '00', '01', '02' ],
							[ '10', '11', '12' ]
						], { columnWidths: '20%,25%,55%' } ) );

						selectNodes( model, [
							[ 0, 0, 0 ],
							[ 0, 0, 1 ]
						] );

						editor.execute( 'mergeTableCells' );

						const wholeContentRange = model.createRangeIn( model.document.getRoot() );

						for ( const item of wholeContentRange ) {
							// Expect `columnWidths` to have 3 unchanged values.
							if ( item.item.is( 'element', 'table' ) ) {
								const columnWidths = getTableColumnsWidths( item.item );
								expect( columnWidths.length ).to.equal( 3 );
								expect( columnWidths[ 0 ] ).to.equal( '20%' );
								expect( columnWidths[ 1 ] ).to.equal( '25%' );
								expect( columnWidths[ 2 ] ).to.equal( '55%' );
							}
						}
					} );
				} );

				describe( 'should not remove colgroup', () => {
					it( 'after pasting a table that increases number of rows and columns at the same time', () => {
						setModelData( model, modelTable( [
							[ '00', '01' ],
							[ '10', '[11]' ]
						], { columnWidths: '50%,50%' } ) );

						model.change( () => {
							editor.execute( 'insertTableRowBelow' );
							editor.execute( 'insertTableColumnRight' );
						} );

						const tableView = view.document.getRoot().getChild( 0 ).getChild( 1 );

						expect( [ ...tableView.getChildren() ].find(
							viewElement => viewElement.is( 'element', 'colgroup' ) )
						).to.not.be.undefined;
					} );
				} );
			} );

			describe( 'tableWidth attribute', () => {
				it( 'should not be set initially when creating a table', () => {
					setModelData( model, modelTable( [
						[ '00', '01', '02' ]
					], { columnWidths: '20%,25%,55%' } ) );

					expect( getModelData( model ) ).to.equal(
						'[<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>00</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>01</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>02</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="20%"></tableColumn>' +
								'<tableColumn columnWidth="25%"></tableColumn>' +
								'<tableColumn columnWidth="55%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>]'
					);
				} );

				it( 'should be set if table was initiated with a tableWidth value', () => {
					setModelData( model, modelTable( [ [ '[]foo' ] ], { tableWidth: '100px' } ) );

					expect( getModelData( editor.model ) ).to.equal(
						'<table tableWidth="100px">' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>[]foo</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>'
					);
				} );

				it( 'should be added to the table after the last column has been resized', () => {
					const columnToResizeIndex = 2;
					const mouseMovementVector = { x: 10, y: 0 };

					setModelData( model, modelTable( [
						[ '00', '01', '02' ]
					] ) );

					setInitialWidthsInPx( editor, null, null, 300 );

					tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

					expect( getModelData( model, { withoutSelection: true } ) ).to.match(
						new RegExp(
							'<table tableWidth="52\\.4[\\d]%">' +
								'<tableRow>' +
									'<tableCell>' +
										'<paragraph>00</paragraph>' +
									'</tableCell>' +
									'<tableCell>' +
										'<paragraph>01</paragraph>' +
									'</tableCell>' +
									'<tableCell>' +
										'<paragraph>02</paragraph>' +
									'</tableCell>' +
								'</tableRow>' +
								'<tableColumnGroup>' +
									'<tableColumn columnWidth="29\\.1%"></tableColumn>' +
									'<tableColumn columnWidth="29\\.1%"></tableColumn>' +
									'<tableColumn columnWidth="41\\.8%"></tableColumn>' +
								'</tableColumnGroup>' +
							'</table>'
						)
					);
				} );

				it( 'is updated correctly after the last column has been resized', () => {
					const columnToResizeIndex = 2;
					const mouseMovementVector = { x: 10, y: 0 };

					setModelData( model, modelTable( [
						[ '00', '01', '02' ]
					], { tableWidth: '100px', columnWidths: '25%,25%,50%' } ) );

					setInitialWidthsInPx( editor, null, 201, 300 );

					tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

					expect( getModelData( editor.model ) ).to.equal(
						'[<table tableWidth="73.33%">' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>00</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>01</paragraph>' +
								'</tableCell>' +
								'<tableCell>' +
									'<paragraph>02</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="22.73%"></tableColumn>' +
								'<tableColumn columnWidth="22.73%"></tableColumn>' +
								'<tableColumn columnWidth="54.54%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>]'
					);
				} );

				it( 'does not change when one of the middle columns is resized', () => {
					const columnToResizeIndex = 1;
					const mouseMovementVector = { x: 10, y: 0 };

					setModelData( model, modelTable( [
						[ '[00', '01', '02]' ]
					], { tableWidth: '40%', columnWidths: '25%,25%,50%' } ) );

					tableColumnResizeMouseSimulator.resize( editor, getDomTable( view ), columnToResizeIndex, mouseMovementVector );

					// The actual column widths will vary depending on the screen properties.
					// In different tests it is handled by setting the particular editor and table width,
					// but here we want to make sure that once set, `tableWidth` prop doesn't change,
					// while the rest (column widths) is covered elsewhere not very important.
					expect( getModelData( model, { withoutSelection: true } ) ).to.match(
						new RegExp(
							'<table tableWidth="40%">' +
								'<tableRow>' +
									'<tableCell>' +
										'<paragraph>00</paragraph>' +
									'</tableCell>' +
									'<tableCell>' +
										'<paragraph>01</paragraph>' +
									'</tableCell>' +
									'<tableCell>' +
										'<paragraph>02</paragraph>' +
									'</tableCell>' +
								'</tableRow>' +
								'<tableColumnGroup>' +
									'<tableColumn columnWidth="25%"></tableColumn>' +
									'<tableColumn columnWidth="2[\\d]\\.[\\d][\\d]%"></tableColumn>' +
									'<tableColumn columnWidth="4[\\d]\\.[\\d][\\d]%"></tableColumn>' +
								'</tableColumnGroup>' +
							'</table>'
						)
					);
				} );
			} );

			describe( 'should not crash', () => {
				let model, editor, editorElement;

				beforeEach( async () => {
					editorElement = document.createElement( 'div' );
					document.body.appendChild( editorElement );

					editor = await createEditor(
						{ table: { contentToolbar: [ 'toggleTableCaption' ] } },
						[ LinkEditing, HighlightEditing, Bold, TableToolbar, TableCaption, ClipboardPipeline ]
					);
					model = editor.model;
				} );

				afterEach( async () => {
					if ( editorElement ) {
						editorElement.remove();
					}

					if ( editor ) {
						await editor.destroy();
					}
				} );

				it( 'when link is being removed', () => {
					const linkCommand = editor.commands.get( 'link' );
					const unlinkCommand = editor.commands.get( 'unlink' );

					setModelData( model,
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>' +
										'[<$text linkHref="url">foo</$text>]' +
									'</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);

					expect( linkCommand.value ).to.be.equal( 'url' );

					unlinkCommand.execute();

					expect( getModelData( model ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>[foo]</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'when highlight is being removed', () => {
					const highlightCommand = editor.commands.get( 'highlight' );

					setModelData( model,
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>' +
										'[<$text highlight="greenMarker">foo</$text>]' +
									'</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);

					expect( highlightCommand.value ).to.equal( 'greenMarker' );

					highlightCommand.execute();

					expect( getModelData( model ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>[foo]</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'when bold is being removed', () => {
					setModelData( model,
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>' +
										'[<$text bold="true">foo</$text>]' +
									'</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);

					editor.commands.get( 'bold' ).execute();

					expect( getModelData( model ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>[foo]</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);
				} );

				it( 'when caption is being added', () => {
					const widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
					const toolbar = widgetToolbarRepository._toolbarDefinitions.get( 'tableContent' ).view;

					setModelData( model,
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>' +
										'[foo]' +
									'</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>'
					);

					toolbar.items.get( 0 ).fire( 'execute' );

					expect( getModelData( model ) ).to.equal(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>foo</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
							'<caption>[]</caption>' +
						'</table>'
					);
				} );

				it( 'when table is being removed', () => {
					setModelData( model,
						'[<table tableWidth="100%">' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>' +
										'foo' +
									'</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<tableColumnGroup>' +
								'<tableColumn columnWidth="100%"></tableColumn>' +
							'</tableColumnGroup>' +
						'</table>]'
					);

					model.deleteContent( model.document.selection );

					expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
				} );
			} );

			it( 'should upcast tableCellWidth property correctly', () => {
				editor.setData(
					'<table>' +
						'<tbody>' +
							'<tr>' +
								'<td style="width:94px">&nbsp;</td>' +
								'<td style="width:291px">&nbsp;</td>' +
							'</tr>' +
							'<tr>' +
								'<td style="width:94px">&nbsp;</td>' +
								'<td style="width:291px">&nbsp;</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>' );

				const tableCell00 = model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );
				const tableCell01 = model.document.getRoot().getNodeByPath( [ 0, 0, 1 ] );

				expect( tableCell00.getAttribute( 'tableCellWidth' ) ).to.equal( '94px' );
				expect( tableCell01.getAttribute( 'tableCellWidth' ) ).to.equal( '291px' );
			} );
		} );

		describe( 'GHS integration', () => {
			let ghsEditor;

			beforeEach( async () => {
				ghsEditor = await createEditor( {
					plugins: [ Table, TableColumnResize, Paragraph, WidgetResize, GeneralHtmlSupport, ClipboardPipeline ],
					htmlSupport: {
						allow: [
							{
								name: /^.*$/,
								styles: true,
								attributes: true,
								classes: true
							}
						]
					}
				} );
			} );

			afterEach( async () => {
				await ghsEditor.destroy();
			} );

			it( 'doesn\'t consider <colgroup> / <col> to be unsafe elements', () => {
				ghsEditor.setData( `<figure class="table">
					<table>
						<colgroup>
							<col style="width:33.33%;">
							<col style="width:33.33%;">
							<col style="width:33.34%;">
						</colgroup>
						<tbody>
							<tr>
								<td>test</td>
								<td>&nbsp;</td>
								<td>&nbsp;</td>
							</tr>
						</tbody>
					</table>
				</figure>` );

				expect( ghsEditor.editing.view.getDomRoot().innerHTML.includes( 'data-ck-unsafe-element' ) ).to.be.false;
			} );

			it( 'should save and load data correctly', () => {
				// (#12191)
				setModelData( ghsEditor.model, modelTable( [
					[ '[00', '01', '02]' ]
				], { tableWidth: '80%', columnWidths: '25%,25%,50%' } ) );

				const initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( ghsEditor.editing.view ) );

				ghsEditor.setData( ghsEditor.getData() );

				const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( ghsEditor.editing.view ) );

				expect( initialViewColumnWidthsPx ).to.deep.equal( finalViewColumnWidthsPx );
			} );
		} );

		describe( 'PlainTableOutput', () => {
			let ptoEditor;

			beforeEach( async () => {
				ptoEditor = await createEditor( {
					plugins: [ Table, TableColumnResize, Paragraph, PlainTableOutput, ClipboardPipeline ]
				} );
			} );

			afterEach( async () => {
				await ptoEditor.destroy();
			} );

			it( 'should not crash', () => {
				const table = modelTable(
					[ [ 'Some', 'Data' ] ],
					{ columnWidths: '80%,20%', tableWidth: '100%' }
				);
				setModelData( ptoEditor.model, table );

				expect( () => ptoEditor.getData() ).to.not.throw();
			} );

			it( 'should produce table not wrapped in <figure>', () => {
				const table = modelTable(
					[ [ 'Some', 'Data' ] ],
					{ columnWidths: '80%,20%', tableWidth: '100%' }
				);
				setModelData( ptoEditor.model, table );

				expect( ptoEditor.getData() ).to.equal(
					'<table class="table ck-table-resized" style="width:100%;">' +
						'<colgroup>' +
							'<col style="width:80%;">' +
							'<col style="width:20%;">' +
						'</colgroup>' +
						'<tbody>' +
							'<tr>' +
								'<td>Some</td>' +
								'<td>Data</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should not scroll `tbody` inside `table` after scrolling to the selection in a cell.', () => {
				setModelData( editor.model,
					'<table tableWidth="100%">' +
						'<tableRow>' +
							'<tableCell>' +
								'<table tableWidth="90%">' +
									'<tableRow>' +
										'<tableCell>' +
											'<paragraph></paragraph>' +
										'</tableCell>' +
										'<tableCell>' +
											'<paragraph></paragraph>' +
										'</tableCell>' +
									'</tableRow>' +
									'<tableRow>' +
										'<tableCell>' +
											'<paragraph></paragraph>' +
										'</tableCell>' +
										'<tableCell>' +
											'<paragraph></paragraph>' +
										'</tableCell>' +
									'</tableRow>' +
									'<tableRow>' +
										'<tableCell>' +
											'<paragraph></paragraph>' +
										'</tableCell>' +
										'<tableCell>' +
											'<paragraph></paragraph>' +
										'</tableCell>' +
									'</tableRow>' +
									'<tableRow>' +
										'<tableCell>' +
											'<paragraph>[]foo</paragraph>' +
										'</tableCell>' +
										'<tableCell>' +
											'<paragraph>bar</paragraph>' +
										'</tableCell>' +
									'</tableRow>' +
									'<tableColumnGroup>' +
										'<tableColumn columnWidth="50%"></tableColumn>' +
										'<tableColumn columnWidth="50%"></tableColumn>' +
									'</tableColumnGroup>' +
								'</table>' +
							'</tableCell>' +
						'</tableRow>' +
						'<tableColumnGroup>' +
							'<tableColumn columnWidth="100%"></tableColumn>' +
						'</tableColumnGroup>' +
					'</table>' + '<paragraph></paragraph>'.repeat( 50 )
				);

				const table = document.getElementsByTagName( 'tbody' )[ 0 ];
				const shift = table.getBoundingClientRect().y - table.parentElement.getBoundingClientRect().y;

				editor.editing.view.scrollToTheSelection( {
					alignToTop: true,
					forceScroll: true
				} );

				expect( table.getBoundingClientRect().y - table.parentElement.getBoundingClientRect().y ).to.be.equal( shift );
			} );
		} );

		describe( 'multi-root editor integration', () => {
			let multiRoot, tableColumnPlugin;

			beforeEach( async () => {
				multiRoot = await MultiRootEditor
					.create( {
						foo: document.createElement( 'div' ),
						bar: document.createElement( 'div' )
					}, {
						plugins: [
							Paragraph, Table, TableColumnResize, Paragraph, WidgetResize, ClipboardPipeline
						]
					} );
				tableColumnPlugin = multiRoot.plugins.get( 'TableColumnResizeEditing' );
			} );

			afterEach( async () => {
				multiRoot.destroy();
			} );

			it( 'change of _isResizingAllowed should affect all roots', async () => {
				tableColumnPlugin._isResizingAllowed = false;

				expect( multiRoot.editing.view.document.getRoot( 'foo' ).hasClass( 'ck-column-resize_disabled' ) ).to.equal( true );
				expect( multiRoot.editing.view.document.getRoot( 'bar' ).hasClass( 'ck-column-resize_disabled' ) ).to.equal( true );
			} );
		} );
	} );

	describe( 'resize threshold', () => {
		let initialViewColumnWidthsPx;

		beforeEach( () => {
			setModelData( model, modelTable( [
				[ '00', '01', '02' ],
				[ '10', '11', '12' ]
			], { columnWidths: '20%,25%,55%', tableWidth: '500px' } ) );

			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );

			initialViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );
		} );

		it( 'should not start resizing when mouse movement is below threshold', () => {
			tableColumnResizeMouseSimulator.down( editor, getDomResizer( getDomTable( view ), 0, 0 ), { ignoreThreshold: false } );
			tableColumnResizeMouseSimulator.move(
				editor,
				getDomResizer( getDomTable( view ), 0, 0 ),
				{ x: COLUMN_RESIZE_DISTANCE_THRESHOLD - 1, y: 0 }
			);

			const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			expect( finalViewColumnWidthsPx ).to.deep.equal( initialViewColumnWidthsPx );
			expect( resizePlugin._isResizingActive ).to.be.false;
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );
		} );

		it( 'should start resizing when mouse movement reaches threshold', () => {
			tableColumnResizeMouseSimulator.down( editor, getDomResizer( getDomTable( view ), 0, 0 ), { ignoreThreshold: false } );
			tableColumnResizeMouseSimulator.move(
				editor,
				getDomResizer( getDomTable( view ), 0, 0 ),
				{ x: COLUMN_RESIZE_DISTANCE_THRESHOLD, y: 0 }
			);

			const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			expect( finalViewColumnWidthsPx ).to.not.deep.equal( initialViewColumnWidthsPx );
			expect( resizePlugin._isResizingActive ).to.be.true;
		} );

		it( 'should not start resizing after mouseup even at threshold distance', () => {
			tableColumnResizeMouseSimulator.down( editor, getDomResizer( getDomTable( view ), 0, 0 ), { ignoreThreshold: false } );
			tableColumnResizeMouseSimulator.up( editor );
			tableColumnResizeMouseSimulator.move( editor, getDomResizer( getDomTable( view ), 0, 0 ), { x: 10, y: 0 } );

			const finalViewColumnWidthsPx = getViewColumnWidthsPx( getDomTable( view ) );

			expect( finalViewColumnWidthsPx ).to.deep.equal( initialViewColumnWidthsPx );
			expect( resizePlugin._isResizingActive ).to.be.false;
			expect( getTableColumnsWidths( model.document.getRoot().getChild( 0 ) ) ).to.deep.equal( [ '20%', '25%', '55%' ] );
		} );
	} );

	async function createEditor( configCustomization, additionalPlugins ) {
		const plugins = [ Table, TableColumnResize, TableColumnResizeEditing, Paragraph, WidgetResize, Undo, ClipboardPipeline ];

		if ( additionalPlugins ) {
			plugins.push( ...additionalPlugins );
		}

		const newEditor = await ClassicEditor.create( editorElement, Object.assign( {}, {
			plugins
		}, configCustomization ) );

		await focusEditor( newEditor );

		return newEditor;
	}

	function selectNodes( model, paths ) {
		const root = model.document.getRoot( 'main' );

		model.change( writer => {
			const ranges = paths.map( path => writer.createRangeOn( root.getNodeByPath( path ) ) );

			writer.setSelection( ranges );
		} );
	}

	function assertModelViewSync( modelColumnWidths, viewColumnWidths ) {
		expect( modelColumnWidths ).to.be.deep.equal( viewColumnWidths );
	}

	function assertViewPixelWidths( finalViewWidths, expectedViewWidths ) {
		for ( let i = 0; i < finalViewWidths.length; i++ ) {
			// We can't use `expect( finalViewWidths[ i ] ).to.equal( expectedViewWidths[ i ] )`
			// because we need to tolerate some error margin.
			expect(
				Math.abs( finalViewWidths[ i ] - expectedViewWidths[ i ] ) < PIXEL_PRECISION,
				'column ' + i + ' has width ' + finalViewWidths[ i ] + ' instead of ' + expectedViewWidths[ i ]
			).to.be.true;
		}
	}

	function assertModelWidthsSum( columnWidths ) {
		const widthsSum = columnWidths.reduce( ( sum, width ) => sum + parseFloat( width ), 0 );

		expect( ( Math.abs( 100 - widthsSum ) ) < PERCENTAGE_PRECISION, 'Models widths dont sum up well' ).to.be.true;
	}

	function calculateExpectedWidthPixels( initialWidths, vector, contentDirection, columnIndex ) {
		const resultingWidths = initialWidths.slice();

		resultingWidths[ columnIndex ] = clamp(
			resultingWidths[ columnIndex ] + ( contentDirection == 'ltr' ? vector.x : -vector.x ),
			COLUMN_MIN_WIDTH_IN_PIXELS,
			// Seemingly complex logic but it just ensures that the next column is at least COLUMN_MIN_WIDTH_IN_PIXELS wide.
			resultingWidths[ columnIndex ] + resultingWidths[ columnIndex + 1 ] - COLUMN_MIN_WIDTH_IN_PIXELS
		);

		const widthChange = resultingWidths[ columnIndex ] - initialWidths[ columnIndex ];

		// If the last column is resized, it decreases the width twice as much but no other column
		// changes the size.
		if ( !resultingWidths[ columnIndex + 1 ] ) {
			resultingWidths[ columnIndex ] += widthChange;

			return resultingWidths;
		}

		// Expect the other column to shrink/expand just as much as the first one was resized.
		resultingWidths[ columnIndex + 1 ] = initialWidths[ columnIndex + 1 ] - widthChange;

		return resultingWidths;
	}

	// Sets initial width in pixels to table and/or editor.
	//
	// We define table width precisely when we want to correctly predict column widths in % after resizing.
	// E.g. setting table width to 201px when we have 3 columns defined: '25%,25%,50%' causes the columns
	// to have initially: [50px][50px][100px] (the difference of 1px is important).
	// We define editor width to avoid situations where table width is 100% and we resize it by providing
	// move vector in px - this results in different widths in % depending on browser width. So to fix this
	// we set editor width so the % values don't depend on browser width anymore.
	//
	// @param {module:core/editor/editor~Editor} editor
	// @param {module:engine/view/element~Element} [viewTable]
	// @param {Number} [tableWidth]
	// @param {Number} [editorWidth]
	function setInitialWidthsInPx( editor, viewTable, tableWidth, editorWidth ) {
		const view = editor.editing.view;

		view.change( writer => {
			if ( editorWidth ) {
				const root = view.document.getRoot();
				writer.setAttribute( 'style', `width: ${ editorWidth }px;`, root );
			}

			if ( tableWidth ) {
				const figure = ( viewTable ) ? viewTable.parent : view.document.getRoot().getChild( 0 );
				writer.setAttribute( 'style', `width: ${ tableWidth }px;`, figure );
			}
		} );
	}
} );
