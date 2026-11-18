/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';
import { Rect } from '@ckeditor/ckeditor5-utils';

import { Table } from '../../src/table.js';
import { TableEditing } from '../../src/tableediting.js';
import { TableUtils } from '../../src/tableutils.js';
import { TableCellPropertiesEditing } from '../../src/tablecellproperties/tablecellpropertiesediting.js';
import { TablePropertiesEditing } from '../../src/tableproperties/tablepropertiesediting.js';
import { TableLayoutEditing } from '../../src/tablelayout/tablelayoutediting.js';
import { TableColumnResize } from '../../src/tablecolumnresize.js';
import { PlainTableOutput } from '../../src/plaintableoutput.js';
import { TableRowResize } from '../../src/tablerowresize.js';
import { TableRowResizeEditing } from '../../src/tablerowresize/tablerowresizeediting.js';
import { TableRowHeightCommand } from '../../src/tablerowresize/commands/tablerowheightcommand.js';
import { TableRowHeightsCommand } from '../../src/tablerowresize/commands/tablerowheightscommand.js';
import { RESIZE_DISTANCE_THRESHOLD } from '../../src/utils/resize.js';

describe( 'TableRowResizeEditing', () => {
	let editor, model;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ TableRowResize, Paragraph ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	function getRow( index, tablePath = [ 0 ] ) {
		return model.document.getRoot().getNodeByPath( [ ...tablePath, index ] );
	}

	it( 'should have a proper name', () => {
		expect( TableRowResizeEditing.pluginName ).toBe( 'TableRowResizeEditing' );
	} );

	it( 'should require TableEditing and TableUtils', () => {
		expect( TableRowResizeEditing.requires ).toEqual( [ TableEditing, TableUtils ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableRowResizeEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `true`', () => {
		expect( TableRowResizeEditing.isPremiumPlugin ).toBe( true );
	} );

	it( 'should have `licenseFeatureCode` static flag set to `TCR`', () => {
		expect( TableRowResizeEditing.licenseFeatureCode ).toBe( 'TCR' );
	} );

	it( 'should register the tableRowHeight command', () => {
		expect( editor.commands.get( 'tableRowHeight' ) ).to.be.instanceOf( TableRowHeightCommand );
	} );

	it( 'should register the resizeRowHeights command', () => {
		expect( editor.commands.get( 'resizeRowHeights' ) ).to.be.instanceOf( TableRowHeightsCommand );
	} );

	describe( 'schema', () => {
		it( 'should allow the rowHeight attribute on tableRow', () => {
			expect( model.schema.checkAttribute( [ '$root', 'table', 'tableRow' ], 'rowHeight' ) ).toBe( true );
		} );

		it( 'should not allow the rowHeight attribute on tableCell', () => {
			expect( model.schema.checkAttribute( [ '$root', 'table', 'tableRow', 'tableCell' ], 'rowHeight' ) ).toBe( false );
		} );

		it( 'should mark the rowHeight attribute as formatting', () => {
			expect( model.schema.getAttributeProperties( 'rowHeight' ).isFormatting ).toBe( true );
		} );
	} );

	describe( 'upcast', () => {
		it( 'should upcast a height in px', () => {
			editor.setData( '<table><tr style="height:40px"><td>foo</td></tr></table>' );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
		} );

		it( 'should upcast a fractional height in px', () => {
			editor.setData( '<table><tr style="height:40.5px"><td>foo</td></tr></table>' );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40.5px' );
		} );

		it( 'should upcast a height in pt converted to px', () => {
			editor.setData( '<table><tr style="height:21pt"><td>foo</td></tr></table>' );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '28px' );
		} );

		it( 'should round the height converted from pt', () => {
			editor.setData( '<table><tr style="height:15.75pt"><td>foo</td></tr></table>' );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '21px' );

			editor.setData( '<table><tr style="height:10pt"><td>foo</td></tr></table>' );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '13.33px' );
		} );

		for ( const height of [ '0px', '0pt', '.0pt' ] ) {
			it( `should not upcast a zero height of "${ height }"`, () => {
				editor.setData( `<table><tr style="height:${ height }"><td>foo</td></tr></table>` );

				expect( getRow( 0 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			} );
		}

		for ( const height of [ '50%', '5em', '2rem', '10vh', '1cm', '0', 'auto', 'inherit', 'fit-content', 'foopx', '-10px' ] ) {
			it( `should not upcast a height of "${ height }", which is not in pixels or points`, () => {
				editor.setData( `<table><tr style="height:${ height }"><td>foo</td></tr></table>` );

				expect( getRow( 0 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			} );
		}

		it( 'should upcast the height attribute in px', () => {
			editor.setData( '<table><tr height="40"><td>foo</td></tr></table>' );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
		} );

		it( 'should prefer the height style to the height attribute', () => {
			editor.setData( '<table><tr height="20" style="height:30pt"><td>foo</td></tr></table>' );

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
		} );

		for ( const height of [ '50%', '0', 'auto' ] ) {
			it( `should not upcast the height attribute of "${ height }"`, () => {
				editor.setData( `<table><tr height="${ height }"><td>foo</td></tr></table>` );

				expect( getRow( 0 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			} );
		}

		it( 'should not set rowHeight on a row without a height', () => {
			editor.setData( '<table><tr><td>foo</td></tr></table>' );

			expect( getRow( 0 ).hasAttribute( 'rowHeight' ) ).toBe( false );
		} );

		it( 'should upcast heights of each row separately', () => {
			editor.setData(
				'<table>' +
					'<tr style="height:40px"><td>11</td></tr>' +
					'<tr><td>21</td></tr>' +
					'<tr style="height:80px"><td>31</td></tr>' +
				'</table>'
			);

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
			expect( getRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			expect( getRow( 2 ).getAttribute( 'rowHeight' ) ).toBe( '80px' );
		} );

		it( 'should upcast heights of rows in thead and tfoot', () => {
			editor.setData(
				'<table>' +
					'<thead><tr style="height:30px"><th>head</th></tr></thead>' +
					'<tbody><tr style="height:40px"><td>body</td></tr></tbody>' +
					'<tfoot><tr style="height:50px"><td>foot</td></tr></tfoot>' +
				'</table>'
			);

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '30px' );
			expect( getRow( 1 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
			expect( getRow( 2 ).getAttribute( 'rowHeight' ) ).toBe( '50px' );
		} );

		it( 'should upcast heights of rows in a nested table', () => {
			editor.setData(
				'<table>' +
					'<tr style="height:40px">' +
						'<td>' +
							'<table><tr style="height:60px"><td>nested</td></tr></table>' +
						'</td>' +
					'</tr>' +
				'</table>'
			);

			expect( getRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
			expect( getRow( 0, [ 0, 0, 0, 0 ] ).getAttribute( 'rowHeight' ) ).toBe( '60px' );
		} );
	} );

	describe( 'downcast', () => {
		it( 'should downcast rowHeight to the height style in the data', () => {
			_setModelData( model,
				'<table>' +
					'<tableRow rowHeight="40px"><tableCell><paragraph>foo</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>bar</paragraph></tableCell></tableRow>' +
				'</table>'
			);

			expect( editor.getData() ).toBe(
				'<figure class="table"><table><tbody>' +
					'<tr style="height:40px;"><td>foo</td></tr>' +
					'<tr><td>bar</td></tr>' +
				'</tbody></table></figure>'
			);
		} );

		it( 'should downcast rowHeight to the height style in the editing view', () => {
			_setModelData( model,
				'<table><tableRow rowHeight="40px"><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>'
			);

			const viewRow = editor.editing.mapper.toViewElement( getRow( 0 ) );

			expect( viewRow.getStyle( 'height' ) ).toBe( '40px' );
		} );

		it( 'should update the height style when rowHeight changes', () => {
			_setModelData( model,
				'<table><tableRow rowHeight="40px"><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>'
			);

			model.change( writer => writer.setAttribute( 'rowHeight', '80px', getRow( 0 ) ) );

			expect( editor.editing.mapper.toViewElement( getRow( 0 ) ).getStyle( 'height' ) ).toBe( '80px' );
			expect( editor.getData() ).toBe(
				'<figure class="table"><table><tbody><tr style="height:80px;"><td>foo</td></tr></tbody></table></figure>'
			);
		} );

		it( 'should remove the height style when rowHeight is removed', () => {
			_setModelData( model,
				'<table><tableRow rowHeight="40px"><tableCell><paragraph>foo</paragraph></tableCell></tableRow></table>'
			);

			model.change( writer => writer.removeAttribute( 'rowHeight', getRow( 0 ) ) );

			expect( editor.editing.mapper.toViewElement( getRow( 0 ) ).hasStyle( 'height' ) ).toBe( false );
			expect( editor.getData() ).toBe( '<figure class="table"><table><tbody><tr><td>foo</td></tr></tbody></table></figure>' );
		} );

		it( 'should output a height in pt converted to px', () => {
			editor.setData( '<table><tr style="height:21pt"><td>foo</td></tr></table>' );

			expect( editor.getData() ).toBe(
				'<figure class="table"><table><tbody><tr style="height:28px;"><td>foo</td></tr></tbody></table></figure>'
			);
		} );
	} );

	describe( 'integration with GeneralHtmlSupport', () => {
		let ghsEditor;

		beforeEach( async () => {
			ghsEditor = await ClassicTestEditor.create( '', {
				plugins: [ TableRowResize, Paragraph, GeneralHtmlSupport ],
				htmlSupport: {
					allow: [ { name: /.*/, styles: true, attributes: true } ]
				}
			} );
		} );

		afterEach( async () => {
			await ghsEditor.destroy();
		} );

		it( 'should not duplicate a supported height', () => {
			ghsEditor.setData( '<table><tr style="height:40px"><td>foo</td></tr></table>' );

			const row = ghsEditor.model.document.getRoot().getNodeByPath( [ 0, 0 ] );

			expect( row.getAttribute( 'rowHeight' ) ).toBe( '40px' );
			expect( ghsEditor.getData() ).toBe(
				'<figure class="table"><table><tbody><tr style="height:40px;"><td>foo</td></tr></tbody></table></figure>'
			);
		} );

		// A height left to GHS would not follow the row resize: the editing view would lose it while the data kept it.
		for ( const height of [ '50%', '5em', 'auto', '0pt' ] ) {
			it( `should not leave a height of "${ height }" to GHS`, () => {
				ghsEditor.setData( `<table><tr style="height:${ height }"><td>foo</td></tr></table>` );

				const row = ghsEditor.model.document.getRoot().getNodeByPath( [ 0, 0 ] );

				expect( row.hasAttribute( 'rowHeight' ) ).toBe( false );
				expect( ghsEditor.getData() ).toBe(
					'<figure class="table"><table><tbody><tr><td>foo</td></tr></tbody></table></figure>'
				);
			} );
		}

		// Microsoft Excel sets both the height attribute and the height style.
		for ( const tr of [ '<tr height="20" style="height:15pt">', '<tr height="50%">' ] ) {
			it( `should not leave the height attribute of "${ tr }" to GHS`, () => {
				ghsEditor.setData( `<table>${ tr }<td>foo</td></tr></table>` );

				expect( ghsEditor.getData() ).not.toContain( 'height="' );
			} );
		}

		it( 'should keep other row styles in GHS', () => {
			ghsEditor.setData( '<table><tr style="height:40px;background-color:red"><td>foo</td></tr></table>' );

			const row = ghsEditor.model.document.getRoot().getNodeByPath( [ 0, 0 ] );

			expect( row.getAttribute( 'rowHeight' ) ).toBe( '40px' );
			expect( ghsEditor.getData() ).toBe(
				'<figure class="table"><table><tbody>' +
					'<tr style="background-color:red;height:40px;"><td>foo</td></tr>' +
				'</tbody></table></figure>'
			);
		} );
	} );

	describe( 'integration with TableColumnResizeEditing', () => {
		let resizeEditor;

		beforeEach( async () => {
			resizeEditor = await ClassicTestEditor.create( '', {
				plugins: [ TableRowResize, TableColumnResize, Paragraph ]
			} );
		} );

		afterEach( async () => {
			await resizeEditor.destroy();
		} );

		it( 'should keep both the column widths and the row heights', () => {
			const data =
				'<figure class="table" style="width:400px;"><table class="ck-table-resized">' +
					'<colgroup><col style="width:30%;"><col style="width:70%;"></colgroup>' +
					'<tbody>' +
						'<tr style="height:40px;"><td>11</td><td>12</td></tr>' +
						'<tr><td>21</td><td>22</td></tr>' +
					'</tbody>' +
				'</table></figure>';

			resizeEditor.setData( data );

			const row = resizeEditor.model.document.getRoot().getNodeByPath( [ 0, 0 ] );

			expect( row.getAttribute( 'rowHeight' ) ).toBe( '40px' );
			expect( resizeEditor.getData() ).toBe( data );
		} );
	} );

	describe( 'integration with PlainTableOutput', () => {
		let ptoEditor;

		beforeEach( async () => {
			ptoEditor = await ClassicTestEditor.create( '', {
				plugins: [ TableRowResize, Paragraph, PlainTableOutput ]
			} );
		} );

		afterEach( async () => {
			await ptoEditor.destroy();
		} );

		it( 'should produce the row heights in a table not wrapped in <figure>', () => {
			ptoEditor.setData(
				'<figure class="table"><table><tbody>' +
					'<tr style="height:40px;"><td>11</td></tr>' +
					'<tr style="height:30pt;"><td>21</td></tr>' +
				'</tbody></table></figure>'
			);

			expect( ptoEditor.getData() ).toBe(
				'<table class="table"><tbody>' +
					'<tr style="height:40px;"><td>11</td></tr>' +
					'<tr style="height:40px;"><td>21</td></tr>' +
				'</tbody></table>'
			);
		} );
	} );

	describe( 'resizing allowed state', () => {
		let resizePlugin;

		beforeEach( () => {
			resizePlugin = editor.plugins.get( TableRowResizeEditing );
		} );

		it( 'should be allowed by default', () => {
			expect( resizePlugin._isResizingAllowed ).toBe( true );
			expect( editor.editing.view.document.getRoot().hasClass( 'ck-row-resize_disabled' ) ).toBe( false );
		} );

		it( 'should not be allowed in the read-only mode', () => {
			editor.enableReadOnlyMode( 'test' );

			expect( resizePlugin._isResizingAllowed ).toBe( false );
			expect( editor.editing.view.document.getRoot().hasClass( 'ck-row-resize_disabled' ) ).toBe( true );

			editor.disableReadOnlyMode( 'test' );

			expect( resizePlugin._isResizingAllowed ).toBe( true );
			expect( editor.editing.view.document.getRoot().hasClass( 'ck-row-resize_disabled' ) ).toBe( false );
		} );

		it( 'should not be allowed when the resizeRowHeights command is disabled', () => {
			editor.commands.get( 'resizeRowHeights' ).forceDisabled( 'test' );

			expect( resizePlugin._isResizingAllowed ).toBe( false );
		} );

		it( 'should follow the editing plugin state when it is loaded without the TableRowResize plugin', async () => {
			const editingOnlyEditor = await VirtualTestEditor.create( { plugins: [ TableRowResizeEditing, Paragraph ] } );
			const editingPlugin = editingOnlyEditor.plugins.get( TableRowResizeEditing );

			editingPlugin.forceDisabled( 'test' );

			expect( editingPlugin._isResizingAllowed ).toBe( false );

			await editingOnlyEditor.destroy();
		} );
	} );

	describe( 'resizers', () => {
		let classicEditor, editorElement, view;

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			classicEditor = await ClassicEditor.create( editorElement, {
				plugins: [ TableRowResize, Paragraph ]
			} );

			view = classicEditor.editing.view;

			_setModelData( classicEditor.model,
				'<table>' +
					'<tableRow>' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
					'<tableRow>' +
						'<tableCell><paragraph>10</paragraph></tableCell>' +
						'<tableCell><paragraph>11</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);
		} );

		afterEach( async () => {
			await classicEditor.destroy();
			editorElement.remove();
		} );

		function getViewCell( rowIndex, cellIndex ) {
			const modelCell = classicEditor.model.document.getRoot().getNodeByPath( [ 0, rowIndex, cellIndex ] );

			return classicEditor.editing.mapper.toViewElement( modelCell );
		}

		function getViewResizers( viewCell ) {
			return Array
				.from( viewCell.getChildren() )
				.filter( child => child.is( 'uiElement' ) && child.hasClass( 'ck-table-row-resizer' ) );
		}

		function getViewResizer( rowIndex, cellIndex ) {
			return getViewResizers( getViewCell( rowIndex, cellIndex ) )[ 0 ];
		}

		it( 'should add a single resizer to every cell in the editing view', () => {
			for ( const [ rowIndex, cellIndex ] of [ [ 0, 0 ], [ 0, 1 ], [ 1, 0 ], [ 1, 1 ] ] ) {
				expect( getViewResizers( getViewCell( rowIndex, cellIndex ) ) ).toHaveLength( 1 );
			}
		} );

		it( 'should place the resizer at the end of the cell', () => {
			const viewCell = getViewCell( 0, 0 );

			expect( viewCell.getChild( viewCell.childCount - 1 ) ).toBe( getViewResizer( 0, 0 ) );
		} );

		it( 'should add resizers to the cells of an inserted row', () => {
			const table = classicEditor.model.document.getRoot().getChild( 0 );

			classicEditor.plugins.get( 'TableUtils' ).insertRows( table, { at: 2 } );

			expect( getViewResizers( getViewCell( 2, 0 ) ) ).toHaveLength( 1 );
			expect( getViewResizers( getViewCell( 2, 1 ) ) ).toHaveLength( 1 );
		} );

		it( 'should not output the resizers to the data', () => {
			expect( classicEditor.getData() ).not.toContain( 'ck-table-row-resizer' );
		} );

		it( 'should stretch the resizer over the whole table width on mouseover and restore it on mouseout', () => {
			const viewResizer = getViewResizer( 0, 1 );
			const domTable = view.domConverter.mapViewToDom( viewResizer.findAncestor( 'table' ) );
			const domCell = view.domConverter.mapViewToDom( getViewCell( 0, 1 ) );
			const tableRect = new Rect( domTable );
			const cellRect = new Rect( domCell );

			view.document.fire( 'mouseover', { target: viewResizer } );

			expect( viewResizer.getStyle( 'left' ) ).toBe( `${ Number( ( tableRect.left - cellRect.left ).toFixed( 4 ) ) }px` );
			expect( viewResizer.getStyle( 'right' ) ).toBe( `${ Number( ( cellRect.right - tableRect.right ).toFixed( 4 ) ) }px` );

			view.document.fire( 'mouseout', { target: viewResizer } );

			expect( viewResizer.hasStyle( 'left' ) ).toBe( false );
			expect( viewResizer.hasStyle( 'right' ) ).toBe( false );
		} );

		it( 'should ignore mouseover and mouseout on elements other than the resizer', () => {
			const viewCell = getViewCell( 0, 0 );

			view.document.fire( 'mouseover', { target: viewCell } );

			expect( viewCell.hasStyle( 'left' ) ).toBe( false );
			expect( getViewResizer( 0, 0 ).hasStyle( 'left' ) ).toBe( false );

			view.change( writer => writer.setStyle( 'left', '1px', viewCell ) );
			view.document.fire( 'mouseout', { target: viewCell } );

			expect( viewCell.getStyle( 'left' ) ).toBe( '1px' );
		} );

		it( 'should not stretch the resizer on mouseover when resizing is not allowed', () => {
			const viewResizer = getViewResizer( 0, 1 );

			classicEditor.enableReadOnlyMode( 'test' );
			view.document.fire( 'mouseover', { target: viewResizer } );

			expect( viewResizer.hasStyle( 'left' ) ).toBe( false );
			expect( viewResizer.hasStyle( 'right' ) ).toBe( false );
		} );

		it( 'should not touch the resizer on mouseout when resizing is not allowed', () => {
			const viewResizer = getViewResizer( 0, 1 );

			view.document.fire( 'mouseover', { target: viewResizer } );

			const left = viewResizer.getStyle( 'left' );

			classicEditor.enableReadOnlyMode( 'test' );
			view.document.fire( 'mouseout', { target: viewResizer } );

			expect( viewResizer.getStyle( 'left' ) ).toBe( left );
		} );

		it( 'should not be allowed when the TableRowResize plugin is disabled', () => {
			classicEditor.plugins.get( TableRowResize ).forceDisabled( 'test' );

			expect( classicEditor.plugins.get( TableRowResizeEditing )._isResizingAllowed ).toBe( false );
			expect( view.document.getRoot().hasClass( 'ck-row-resize_disabled' ) ).toBe( true );
		} );
	} );

	describe( 'resizing', () => {
		let classicEditor, editorElement, view, model, resizePlugin;

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			classicEditor = await ClassicEditor.create( editorElement, {
				plugins: [ TableRowResize, TableCellPropertiesEditing, TablePropertiesEditing, Paragraph, Undo ]
			} );

			view = classicEditor.editing.view;
			model = classicEditor.model;
			resizePlugin = classicEditor.plugins.get( TableRowResizeEditing );
		} );

		afterEach( async () => {
			await classicEditor.destroy();
			editorElement.remove();
		} );

		const START_Y = 100;

		function getModelRow( rowIndex, tablePath = [ 0 ] ) {
			return model.document.getRoot().getNodeByPath( [ ...tablePath, rowIndex ] );
		}

		function getViewResizer( rowIndex, cellIndex, tablePath = [ 0 ] ) {
			const modelCell = model.document.getRoot().getNodeByPath( [ ...tablePath, rowIndex, cellIndex ] );
			const viewCell = classicEditor.editing.mapper.toViewElement( modelCell );

			return Array
				.from( viewCell.getChildren() )
				.find( child => child.is( 'uiElement' ) && child.hasClass( 'ck-table-row-resizer' ) );
		}

		function getDomRowHeight( rowIndex, tablePath = [ 0 ] ) {
			const viewRow = classicEditor.editing.mapper.toViewElement( getModelRow( rowIndex, tablePath ) );

			return new Rect( view.domConverter.mapViewToDom( viewRow ) ).height;
		}

		function mouseDown( viewResizer, options = {} ) {
			const domEventData = {
				target: viewResizer,
				domEvent: { clientY: START_Y },
				preventDefault: options.preventDefault || vi.fn()
			};

			resizePlugin._onMouseDownHandler( { stop: options.stop || vi.fn() }, domEventData );
		}

		function mouseMove( dy ) {
			resizePlugin._onMouseMoveHandler( {}, { clientY: START_Y + dy } );
		}

		function mouseUp() {
			resizePlugin._onMouseUpHandler();
		}

		function drag( viewResizer, dy ) {
			mouseDown( viewResizer );
			mouseMove( dy );
			mouseUp();
		}

		// Two rows with the same single-line content, the first one taller than its content.
		const twoRowTable =
			'<table>' +
				'<tableRow rowHeight="80px">' +
					'<tableCell><paragraph>00</paragraph></tableCell>' +
					'<tableCell><paragraph>01</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph>10</paragraph></tableCell>' +
					'<tableCell><paragraph>11</paragraph></tableCell>' +
				'</tableRow>' +
			'</table>';

		describe( 'mousedown', () => {
			beforeEach( () => {
				_setModelData( model, twoRowTable );
			} );

			it( 'should prevent the default action and stop the event on a resizer', () => {
				const preventDefault = vi.fn();
				const stop = vi.fn();

				mouseDown( getViewResizer( 0, 0 ), { preventDefault, stop } );

				expect( preventDefault ).toHaveBeenCalledOnce();
				expect( stop ).toHaveBeenCalledOnce();
			} );

			it( 'should be handled when fired on the view document', () => {
				const viewResizer = getViewResizer( 0, 0 );

				view.document.fire( 'mousedown', {
					target: viewResizer,
					domEvent: { clientY: START_Y },
					preventDefault: vi.fn()
				} );
				mouseMove( 20 );
				mouseUp();

				expect( getModelRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '100px' );
			} );

			it( 'should ignore elements other than the resizer', () => {
				const preventDefault = vi.fn();
				const viewCell = getViewResizer( 0, 0 ).parent;

				mouseDown( viewCell, { preventDefault } );
				mouseMove( 20 );

				expect( preventDefault ).not.toHaveBeenCalled();
				expect( resizePlugin._isResizingActive ).toBe( false );
			} );

			it( 'should do nothing when resizing is not allowed', () => {
				const preventDefault = vi.fn();

				classicEditor.enableReadOnlyMode( 'test' );
				mouseDown( getViewResizer( 0, 0 ), { preventDefault } );
				mouseMove( 20 );

				expect( preventDefault ).not.toHaveBeenCalled();
				expect( resizePlugin._isResizingActive ).toBe( false );
			} );

			it( 'should do nothing when the table cannot be edited', () => {
				const preventDefault = vi.fn();

				vi.spyOn( model, 'canEditAt' ).mockReturnValue( false );
				mouseDown( getViewResizer( 0, 0 ), { preventDefault } );
				mouseMove( 20 );

				expect( preventDefault ).not.toHaveBeenCalled();
				expect( resizePlugin._isResizingActive ).toBe( false );
			} );
		} );

		describe( 'threshold', () => {
			beforeEach( () => {
				_setModelData( model, twoRowTable );
			} );

			it( 'should not start resizing before the mouse moves past the threshold', () => {
				mouseDown( getViewResizer( 0, 0 ) );
				mouseMove( RESIZE_DISTANCE_THRESHOLD - 1 );

				expect( resizePlugin._isResizingActive ).toBe( false );

				mouseUp();

				expect( getModelRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '80px' );
			} );

			it( 'should start resizing once the mouse moves past the threshold', () => {
				mouseDown( getViewResizer( 0, 0 ) );
				mouseMove( -RESIZE_DISTANCE_THRESHOLD );

				expect( resizePlugin._isResizingActive ).toBe( true );

				mouseUp();
			} );

			it( 'should not change anything on a plain click', () => {
				const dataBefore = _getModelData( model );

				mouseDown( getViewResizer( 0, 0 ) );
				mouseUp();

				expect( _getModelData( model ) ).toBe( dataBefore );
			} );

			it( 'should ignore mouse moves when the mouse button is not pressed', () => {
				mouseMove( 20 );

				expect( resizePlugin._isResizingActive ).toBe( false );
			} );
		} );

		describe( 'preview', () => {
			beforeEach( () => {
				_setModelData( model, twoRowTable );
			} );

			it( 'should change the row height only in the editing view while dragging', () => {
				mouseDown( getViewResizer( 0, 0 ) );
				mouseMove( 30 );

				const viewRow = classicEditor.editing.mapper.toViewElement( getModelRow( 0 ) );

				expect( viewRow.getStyle( 'height' ) ).toBe( '110px' );
				expect( getModelRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '80px' );

				mouseUp();
			} );

			it( 'should mark the resizer as active and set the resizing cursor while dragging', () => {
				const viewResizer = getViewResizer( 0, 0 );

				mouseDown( viewResizer );
				mouseMove( 30 );

				expect( viewResizer.hasClass( 'ck-table-row-resizer__active' ) ).toBe( true );
				expect( document.body.classList.contains( 'ck-table-row-resize__resizing-cursor' ) ).toBe( true );

				mouseUp();

				expect( viewResizer.hasClass( 'ck-table-row-resizer__active' ) ).toBe( false );
				expect( document.body.classList.contains( 'ck-table-row-resize__resizing-cursor' ) ).toBe( false );
			} );

			it( 'should not restore the resizer size on mouseout while dragging', () => {
				const viewResizer = getViewResizer( 0, 1 );

				view.document.fire( 'mouseover', { target: viewResizer } );
				mouseDown( viewResizer );
				mouseMove( 30 );
				view.document.fire( 'mouseout', { target: viewResizer } );

				expect( viewResizer.hasStyle( 'left' ) ).toBe( true );

				mouseUp();

				// The mouse is not over the resizer after the drag, so its size is restored.
				expect( viewResizer.hasStyle( 'left' ) ).toBe( false );
			} );

			it( 'should keep the resizer size after the drag when the mouse is still over it', () => {
				const viewResizer = getViewResizer( 0, 1 );
				const domResizer = view.domConverter.mapViewToDom( viewResizer );

				view.document.fire( 'mouseover', { target: viewResizer } );
				mouseDown( viewResizer );
				mouseMove( 30 );

				vi.spyOn( domResizer, 'matches' ).mockReturnValue( true );
				mouseUp();

				expect( viewResizer.hasStyle( 'left' ) ).toBe( true );
			} );
		} );

		describe( 'commit', () => {
			it( 'should set the new height of a row that has a height', () => {
				_setModelData( model, twoRowTable );

				drag( getViewResizer( 0, 0 ), 30 );

				expect( getModelRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '110px' );
				expect( getModelRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			} );

			it( 'should set the height of a row that had no height', () => {
				_setModelData( model, twoRowTable );

				const initialHeight = getDomRowHeight( 1 );

				drag( getViewResizer( 1, 0 ), 25 );

				expect( parseFloat( getModelRow( 1 ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( initialHeight + 25, 1 );
			} );

			it( 'should not let the row get lower than its content', () => {
				_setModelData( model, twoRowTable );

				// The second row has the same content and no height, so it is as high as the content requires.
				const contentHeight = getDomRowHeight( 1 );

				drag( getViewResizer( 0, 0 ), -500 );

				expect( parseFloat( getModelRow( 0 ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( contentHeight, 1 );
				expect( getDomRowHeight( 0 ) ).toBeCloseTo( contentHeight, 1 );
			} );

			it( 'should be a single undo step', () => {
				_setModelData( model, twoRowTable );

				mouseDown( getViewResizer( 0, 0 ) );
				mouseMove( 10 );
				mouseMove( 20 );
				mouseMove( 30 );
				mouseUp();

				expect( getModelRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '110px' );

				classicEditor.execute( 'undo' );

				expect( getModelRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '80px' );
			} );

			it( 'should resize the dragged row when a row is inserted above it during the drag', () => {
				_setModelData( model, twoRowTable );

				const draggedRow = getModelRow( 1 );

				mouseDown( getViewResizer( 1, 0 ) );
				mouseMove( 30 );

				// Another user inserts a row above the dragged one.
				classicEditor.plugins.get( 'TableUtils' ).insertRows( model.document.getRoot().getChild( 0 ), { at: 0 } );

				mouseUp();

				expect( getModelRow( 2 ) ).toBe( draggedRow );
				expect( draggedRow.hasAttribute( 'rowHeight' ) ).toBe( true );
				expect( getModelRow( 0 ).hasAttribute( 'rowHeight' ) ).toBe( false );
				expect( getModelRow( 1 ).getAttribute( 'rowHeight' ) ).toBe( '80px' );
			} );

			it( 'should resize the dragged row when a row is removed above it during the drag', () => {
				_setModelData( model,
					'<table>' +
						'<tableRow rowHeight="80px"><tableCell><paragraph>00</paragraph></tableCell></tableRow>' +
						'<tableRow><tableCell><paragraph>10</paragraph></tableCell></tableRow>' +
						'<tableRow><tableCell><paragraph>20</paragraph></tableCell></tableRow>' +
					'</table>'
				);

				const draggedRow = getModelRow( 1 );

				mouseDown( getViewResizer( 1, 0 ) );
				mouseMove( 30 );

				// Another user removes the row above the dragged one.
				model.change( writer => writer.remove( getModelRow( 0 ) ) );

				mouseUp();

				expect( getModelRow( 0 ) ).toBe( draggedRow );
				expect( draggedRow.hasAttribute( 'rowHeight' ) ).toBe( true );
				expect( getModelRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			} );

			it( 'should resize a heading row', () => {
				classicEditor.setData(
					'<table>' +
						'<thead><tr style="height:80px"><th>00</th><th>01</th></tr></thead>' +
						'<tbody><tr><td>10</td><td>11</td></tr></tbody>' +
					'</table>'
				);

				expect( getViewResizer( 0, 0 ).parent.name ).toBe( 'th' );

				drag( getViewResizer( 0, 0 ), 30 );

				expect( getModelRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '110px' );
			} );

			it( 'should resize the last row of a cell spanning several rows', () => {
				_setModelData( model,
					'<table>' +
						'<tableRow rowHeight="40px">' +
							'<tableCell rowspan="2"><paragraph>00</paragraph></tableCell>' +
							'<tableCell><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow rowHeight="60px">' +
							'<tableCell><paragraph>11</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				drag( getViewResizer( 0, 0 ), 20 );

				expect( getModelRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
				expect( getModelRow( 1 ).getAttribute( 'rowHeight' ) ).toBe( '80px' );
			} );

			it( 'should remove the cell heights that kept the row from shrinking', () => {
				_setModelData( model,
					'<table>' +
						'<tableRow rowHeight="40px">' +
							'<tableCell tableCellHeight="100px" colspan="2"><paragraph>00</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>10</paragraph></tableCell>' +
							'<tableCell><paragraph>11</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				const contentHeight = getDomRowHeight( 1 );

				drag( getViewResizer( 0, 0 ), -80 );

				expect( model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] ).hasAttribute( 'tableCellHeight' ) ).toBe( false );
				expect( parseFloat( getModelRow( 0 ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( contentHeight, 1 );
			} );

			it( 'should resize a row of a nested table without changing the outer table', () => {
				_setModelData( model,
					'<table>' +
						'<tableRow rowHeight="40px">' +
							'<tableCell>' +
								'<table>' +
									'<tableRow rowHeight="60px"><tableCell><paragraph>nested</paragraph></tableCell></tableRow>' +
								'</table>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				drag( getViewResizer( 0, 0, [ 0, 0, 0, 0 ] ), 20 );

				expect( getModelRow( 0, [ 0, 0, 0, 0 ] ).getAttribute( 'rowHeight' ) ).toBe( '80px' );
				expect( getModelRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
			} );
		} );

		describe( 'revert', () => {
			it( 'should restore the row and cell heights in the view when the height did not change', () => {
				_setModelData( model,
					'<table>' +
						'<tableRow rowHeight="40px">' +
							'<tableCell tableCellHeight="30px"><paragraph>00</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				const viewResizer = getViewResizer( 0, 0 );
				const viewRow = classicEditor.editing.mapper.toViewElement( getModelRow( 0 ) );
				const dataBefore = _getModelData( model );

				mouseDown( viewResizer );
				mouseMove( 10 );
				mouseMove( 0 );
				mouseUp();

				expect( _getModelData( model ) ).toBe( dataBefore );
				expect( viewRow.getStyle( 'height' ) ).toBe( '40px' );
				expect( viewResizer.parent.getStyle( 'height' ) ).toBe( '30px' );
			} );

			it( 'should not set a height on a row that had none when the drag ends where it started', () => {
				_setModelData( model, twoRowTable );

				const viewRow = classicEditor.editing.mapper.toViewElement( getModelRow( 1 ) );

				mouseDown( getViewResizer( 1, 0 ) );
				mouseMove( 10 );
				mouseMove( 0 );
				mouseUp();

				expect( getModelRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
				expect( viewRow.hasStyle( 'height' ) ).toBe( false );
			} );

			it( 'should remove the preview height of a row that had no height when resizing is cancelled', () => {
				_setModelData( model, twoRowTable );

				const viewRow = classicEditor.editing.mapper.toViewElement( getModelRow( 1 ) );

				mouseDown( getViewResizer( 1, 0 ) );
				mouseMove( 30 );
				classicEditor.enableReadOnlyMode( 'test' );
				mouseMove( 40 );

				expect( resizePlugin._isResizingActive ).toBe( false );
				expect( getModelRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
				expect( viewRow.hasStyle( 'height' ) ).toBe( false );
			} );

			it( 'should restore the preview and leave the model untouched when the editor becomes read-only', () => {
				_setModelData( model, twoRowTable );

				const viewRow = classicEditor.editing.mapper.toViewElement( getModelRow( 0 ) );

				mouseDown( getViewResizer( 0, 0 ) );
				mouseMove( 30 );
				classicEditor.enableReadOnlyMode( 'test' );
				mouseUp();

				expect( getModelRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '80px' );
				expect( viewRow.getStyle( 'height' ) ).toBe( '80px' );
			} );

			it( 'should not fail when the row is removed while dragging', () => {
				_setModelData( model, twoRowTable );

				const executeSpy = vi.spyOn( classicEditor, 'execute' );

				mouseDown( getViewResizer( 0, 0 ) );
				mouseMove( 30 );

				model.change( writer => writer.remove( getModelRow( 0 ) ) );

				expect( () => mouseUp() ).not.toThrow();
				expect( executeSpy ).not.toHaveBeenCalled();
				expect( resizePlugin._isResizingActive ).toBe( false );
			} );

			it( 'should do nothing on mouseup when resizing is not active', () => {
				_setModelData( model, twoRowTable );

				const dataBefore = _getModelData( model );

				mouseUp();

				expect( _getModelData( model ) ).toBe( dataBefore );
			} );
		} );

		// Without the table and cell properties, the heights changed by the row resize must not be left to GHS: the editing view
		// would lose them while the data kept them.
		describe( 'with GeneralHtmlSupport, without the table and cell properties', () => {
			beforeEach( async () => {
				await classicEditor.destroy();

				classicEditor = await ClassicEditor.create( editorElement, {
					plugins: [ TableRowResize, Paragraph, Undo, GeneralHtmlSupport ],
					htmlSupport: {
						allow: [ { name: /.*/, styles: true, attributes: true } ]
					}
				} );

				view = classicEditor.editing.view;
				model = classicEditor.model;
				resizePlugin = classicEditor.plugins.get( TableRowResizeEditing );
			} );

			it( 'should remove a cell height from the data when the row is resized', () => {
				classicEditor.setData(
					'<figure class="table"><table><tbody>' +
						'<tr><td style="height:100px">foo</td></tr>' +
					'</tbody></table></figure>'
				);

				const initialHeight = getDomRowHeight( 0 );

				drag( getViewResizer( 0, 0 ), -40 );

				expect( classicEditor.getData() ).toBe(
					'<figure class="table"><table><tbody>' +
						`<tr style="height:${ getModelRow( 0 ).getAttribute( 'rowHeight' ) };"><td>foo</td></tr>` +
					'</tbody></table></figure>'
				);
				expect( getDomRowHeight( 0 ) ).toBeCloseTo( initialHeight - 40, 0 );
			} );

			it( 'should replace the table height with the rendered heights of the rows in the data when a row is resized', () => {
				classicEditor.setData(
					'<figure class="table" style="height:300px"><table><tbody>' +
						'<tr><td>foo</td></tr>' +
						'<tr><td>bar</td></tr>' +
					'</tbody></table></figure>'
				);

				const heights = [ 0, 1 ].map( index => getDomRowHeight( index ) );

				drag( getViewResizer( 0, 0 ), -40 );

				expect( model.document.getRoot().getChild( 0 ).hasAttribute( 'tableHeight' ) ).toBe( false );
				expect( classicEditor.getData() ).not.toContain( 'height:300px' );
				expect( parseFloat( getModelRow( 1 ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( heights[ 1 ], 1 );
				expect( getDomRowHeight( 0 ) ).toBeCloseTo( heights[ 0 ] - 40, 0 );
			} );
		} );

		describe( 'in a table with a height', () => {
			// The table height is a minimum height, so the browser stretches the rows to fill it.
			const tableWithHeight =
				'<table tableHeight="300px">' +
					'<tableRow rowHeight="40px"><tableCell><paragraph>00</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>10</paragraph></tableCell></tableRow>' +
					'<tableRow><tableCell><paragraph>20</paragraph></tableCell></tableRow>' +
				'</table>';

			let heights;

			function getTable() {
				return model.document.getRoot().getChild( 0 );
			}

			function getViewFigure() {
				return classicEditor.editing.mapper.toViewElement( getTable() );
			}

			function expectRowHeightsCloseTo( expectedHeights ) {
				expectedHeights.forEach( ( height, index ) => {
					expect( parseFloat( getModelRow( index ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( height, 1 );
					expect( getDomRowHeight( index ) ).toBeCloseTo( height, 1 );
				} );
			}

			beforeEach( () => {
				_setModelData( model, tableWithHeight );

				heights = [ 0, 1, 2 ].map( index => getDomRowHeight( index ) );
			} );

			it( 'should replace the table height with the rendered heights of the other rows', () => {
				drag( getViewResizer( 0, 0 ), 30 );

				expectRowHeightsCloseTo( [ heights[ 0 ] + 30, heights[ 1 ], heights[ 2 ] ] );
				expect( getTable().hasAttribute( 'tableHeight' ) ).toBe( false );
			} );

			it( 'should not move the other rows when the resizing starts', () => {
				mouseDown( getViewResizer( 0, 0 ) );
				mouseMove( RESIZE_DISTANCE_THRESHOLD );

				expect( getDomRowHeight( 0 ) ).toBeCloseTo( heights[ 0 ] + RESIZE_DISTANCE_THRESHOLD, 1 );
				expect( getDomRowHeight( 1 ) ).toBeCloseTo( heights[ 1 ], 1 );
				expect( getDomRowHeight( 2 ) ).toBeCloseTo( heights[ 2 ], 1 );
				expect( getViewFigure().hasStyle( 'height' ) ).toBe( false );

				mouseUp();
			} );

			it( 'should replace the table height with the rendered heights of the rows in a single undo step', () => {
				const dataBefore = _getModelData( model );

				drag( getViewResizer( 1, 0 ), 30 );

				const dataAfter = _getModelData( model );

				classicEditor.execute( 'undo' );

				expect( _getModelData( model ) ).toBe( dataBefore );
				expect( getViewFigure().getStyle( 'height' ) ).toBe( '300px' );

				classicEditor.execute( 'redo' );

				expect( _getModelData( model ) ).toBe( dataAfter );
			} );

			it( 'should restore the rows and the table height in the view when the height did not change', () => {
				const dataBefore = _getModelData( model );

				mouseDown( getViewResizer( 1, 0 ) );
				mouseMove( 10 );
				mouseMove( 0 );
				mouseUp();

				expect( _getModelData( model ) ).toBe( dataBefore );
				expect( getViewFigure().getStyle( 'height' ) ).toBe( '300px' );
				expect( classicEditor.editing.mapper.toViewElement( getModelRow( 0 ) ).getStyle( 'height' ) ).toBe( '40px' );
				expect( classicEditor.editing.mapper.toViewElement( getModelRow( 1 ) ).hasStyle( 'height' ) ).toBe( false );
				expect( classicEditor.editing.mapper.toViewElement( getModelRow( 2 ) ).hasStyle( 'height' ) ).toBe( false );
			} );

			it( 'should restore the heights of the stretched rows in the view when the height did not change', () => {
				// All rows have heights, so the browser stretches all of them.
				_setModelData( model,
					'<table tableHeight="300px">' +
						'<tableRow rowHeight="40px"><tableCell><paragraph>00</paragraph></tableCell></tableRow>' +
						'<tableRow rowHeight="60px"><tableCell><paragraph>10</paragraph></tableCell></tableRow>' +
					'</table>'
				);

				mouseDown( getViewResizer( 1, 0 ) );
				mouseMove( 10 );
				mouseMove( 0 );
				mouseUp();

				expect( classicEditor.editing.mapper.toViewElement( getModelRow( 0 ) ).getStyle( 'height' ) ).toBe( '40px' );
				expect( classicEditor.editing.mapper.toViewElement( getModelRow( 1 ) ).getStyle( 'height' ) ).toBe( '60px' );
			} );

			it( 'should restore the other rows and the table height in the view when the dragged row is removed', () => {
				mouseDown( getViewResizer( 1, 0 ) );
				mouseMove( 30 );

				// Another user removes the dragged row.
				model.change( writer => writer.remove( getModelRow( 1 ) ) );

				mouseUp();

				expect( getViewFigure().getStyle( 'height' ) ).toBe( '300px' );
				expect( classicEditor.editing.mapper.toViewElement( getModelRow( 0 ) ).getStyle( 'height' ) ).toBe( '40px' );
				expect( classicEditor.editing.mapper.toViewElement( getModelRow( 1 ) ).hasStyle( 'height' ) ).toBe( false );
			} );

			it( 'should not set a height on a row inserted during the drag', () => {
				mouseDown( getViewResizer( 0, 0 ) );
				mouseMove( 30 );

				// Another user inserts a row at the end of the table.
				classicEditor.plugins.get( 'TableUtils' ).insertRows( getTable(), { at: 3 } );

				mouseUp();

				expect( parseFloat( getModelRow( 0 ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( heights[ 0 ] + 30, 1 );
				expect( parseFloat( getModelRow( 2 ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( heights[ 2 ], 1 );
				expect( getModelRow( 3 ).hasAttribute( 'rowHeight' ) ).toBe( false );
			} );

			it( 'should keep the cell heights of the rows whose rendered heights replace the table height', () => {
				model.change( writer => writer.setAttribute( 'tableCellHeight', '20px', getModelRow( 2 ).getChild( 0 ) ) );

				drag( getViewResizer( 0, 0 ), 30 );

				expect( getModelRow( 2 ).getChild( 0 ).getAttribute( 'tableCellHeight' ) ).toBe( '20px' );
			} );

			it( 'should not set the rendered height of a row removed during the drag', () => {
				const removedRow = getModelRow( 2 );

				mouseDown( getViewResizer( 0, 0 ) );
				mouseMove( 30 );

				// Another user removes another row.
				model.change( writer => writer.remove( removedRow ) );

				mouseUp();

				expect( removedRow.hasAttribute( 'rowHeight' ) ).toBe( false );
				expect( parseFloat( getModelRow( 1 ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( heights[ 1 ], 1 );
			} );

			// An integration that takes over the command execution (as track changes does) must see the whole change.
			it( 'should not change anything when the resizeRowHeights command execution is stopped', () => {
				const dataBefore = _getModelData( model );

				classicEditor.commands.get( 'resizeRowHeights' ).on( 'execute', evt => evt.stop(), { priority: 'high' } );

				drag( getViewResizer( 0, 0 ), 30 );

				expect( _getModelData( model ) ).toBe( dataBefore );
			} );

			describe( 'with the resizeRowHeights command', () => {
				it( 'should replace the table height with the rendered heights of the other rows', () => {
					classicEditor.execute( 'resizeRowHeights', { table: getTable(), rowHeights: [ undefined, '100px' ] } );

					expectRowHeightsCloseTo( [ heights[ 0 ], 100, heights[ 2 ] ] );
					expect( getTable().hasAttribute( 'tableHeight' ) ).toBe( false );
				} );

				it( 'should replace the table height when the row heights do not change', () => {
					classicEditor.execute( 'resizeRowHeights', { table: getTable(), rowHeights: [ '40px' ] } );

					expectRowHeightsCloseTo( heights );
					expect( getTable().hasAttribute( 'tableHeight' ) ).toBe( false );
				} );
			} );

			describe( 'with the tableRowHeight command', () => {
				beforeEach( () => {
					model.change( writer => writer.setSelection( getModelRow( 1 ).getChild( 0 ).getChild( 0 ), 0 ) );
				} );

				it( 'should replace the table height with the rendered heights of the other rows', () => {
					classicEditor.execute( 'tableRowHeight', { value: '100' } );

					expectRowHeightsCloseTo( [ heights[ 0 ], 100, heights[ 2 ] ] );
					expect( getTable().hasAttribute( 'tableHeight' ) ).toBe( false );
				} );

				it( 'should replace the table height with the rendered heights of the rows in a single undo step', () => {
					const dataBefore = _getModelData( model );

					classicEditor.execute( 'tableRowHeight', { value: '100' } );
					classicEditor.execute( 'undo' );

					expect( _getModelData( model ) ).toBe( dataBefore );
				} );

				// An integration that takes over the command execution (as track changes does) must see the table before the change.
				it( 'should replace the table height when the command is executed, not before', () => {
					let tableHeightOnExecute;

					classicEditor.commands.get( 'tableRowHeight' ).on( 'execute', () => {
						tableHeightOnExecute = getTable().getAttribute( 'tableHeight' );
					}, { priority: 'high' } );

					classicEditor.execute( 'tableRowHeight', { value: '100' } );

					expect( tableHeightOnExecute ).toBe( '300px' );
					expect( getTable().hasAttribute( 'tableHeight' ) ).toBe( false );
				} );

				it( 'should make all changes in the given batch a single undo step', () => {
					const dataBefore = _getModelData( model );
					const batch = model.createBatch();

					classicEditor.execute( 'tableRowHeight', { value: '100', batch } );
					classicEditor.execute( 'tableRowHeight', { value: '120', batch } );

					expectRowHeightsCloseTo( [ heights[ 0 ], 120, heights[ 2 ] ] );

					classicEditor.execute( 'undo' );

					expect( _getModelData( model ) ).toBe( dataBefore );
				} );

				it( 'should replace the table height with the rendered heights of the other rows when the height is removed', () => {
					classicEditor.execute( 'tableRowHeight', { value: '' } );

					expectRowHeightsCloseTo( [ heights[ 0 ] ] );
					expect( getModelRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
					expect( parseFloat( getModelRow( 2 ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( heights[ 2 ], 1 );
					expect( getTable().hasAttribute( 'tableHeight' ) ).toBe( false );
				} );

				it( 'should replace the table height when the height is removed with only whitespace', () => {
					classicEditor.execute( 'tableRowHeight', { value: '  ' } );

					expect( getModelRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
					expect( parseFloat( getModelRow( 2 ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( heights[ 2 ], 1 );
					expect( getTable().hasAttribute( 'tableHeight' ) ).toBe( false );
				} );

				it( 'should replace the table height when executed without options', () => {
					classicEditor.execute( 'tableRowHeight' );

					expect( getModelRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
					expect( parseFloat( getModelRow( 2 ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( heights[ 2 ], 1 );
					expect( getTable().hasAttribute( 'tableHeight' ) ).toBe( false );
				} );

				for ( const value of [ '2em', '-5px' ] ) {
					it( `should not change anything for an invalid value "${ value }"`, () => {
						const dataBefore = _getModelData( model );

						classicEditor.execute( 'tableRowHeight', { value } );

						expect( _getModelData( model ) ).toBe( dataBefore );
					} );
				}

				it( 'should not change anything when the command is disabled', () => {
					const dataBefore = _getModelData( model );

					classicEditor.enableReadOnlyMode( 'test' );
					classicEditor.execute( 'tableRowHeight', { value: '100' } );

					expect( _getModelData( model ) ).toBe( dataBefore );
				} );

				it( 'should keep the cell heights of the rows whose rendered heights replace the table height', () => {
					model.change( writer => writer.setAttribute( 'tableCellHeight', '20px', getModelRow( 2 ).getChild( 0 ) ) );

					classicEditor.execute( 'tableRowHeight', { value: '100' } );

					expect( getModelRow( 2 ).getChild( 0 ).getAttribute( 'tableCellHeight' ) ).toBe( '20px' );
				} );

				it( 'should not set the rendered height of a row inserted in the same change before it is rendered', () => {
					model.change( () => {
						classicEditor.plugins.get( 'TableUtils' ).insertRows( getTable(), { at: 0 } );
						classicEditor.execute( 'tableRowHeight', { value: '60' } );
					} );

					expect( getModelRow( 0 ).hasAttribute( 'rowHeight' ) ).toBe( false );
					expect( getModelRow( 2 ).getAttribute( 'rowHeight' ) ).toBe( '60px' );
					expect( parseFloat( getModelRow( 3 ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( heights[ 2 ], 1 );
					expect( getTable().hasAttribute( 'tableHeight' ) ).toBe( false );
				} );

				it( 'should change only the selected row in a table without a height', () => {
					model.change( writer => writer.removeAttribute( 'tableHeight', getTable() ) );

					classicEditor.execute( 'tableRowHeight', { value: '100' } );

					expect( getModelRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
					expect( getModelRow( 1 ).getAttribute( 'rowHeight' ) ).toBe( '100px' );
					expect( getModelRow( 2 ).hasAttribute( 'rowHeight' ) ).toBe( false );
				} );
			} );
		} );

		describe( 'with the default table and cell heights in the configuration', () => {
			let styleElement;

			// The default heights are kept in the content styles only, so a removed height falls back to them.
			const threeRowTable =
				'<table>' +
					[ 0, 1, 2 ].map( row =>
						`<tableRow><tableCell><paragraph>${ row }0</paragraph></tableCell>` +
						`<tableCell><paragraph>${ row }1</paragraph></tableCell></tableRow>`
					).join( '' ) +
				'</table>';

			let heights;

			function getTable() {
				return model.document.getRoot().getChild( 0 );
			}

			function getCellHeights( rowIndex ) {
				return Array.from( getModelRow( rowIndex ).getChildren() ).map( cell => cell.getAttribute( 'tableCellHeight' ) );
			}

			beforeEach( async () => {
				styleElement = document.createElement( 'style' );
				styleElement.textContent =
					'.ck-content figure.table:not(.layout-table) { height: 300px; }' +
					'.ck-content figure.table:not(.layout-table) td { height: 50px; }';
				document.head.appendChild( styleElement );

				await classicEditor.destroy();

				classicEditor = await ClassicEditor.create( editorElement, {
					plugins: [ TableRowResize, TableCellPropertiesEditing, TablePropertiesEditing, TableLayoutEditing, Paragraph, Undo ],
					table: {
						tableProperties: { defaultProperties: { height: '300px' } },
						tableCellProperties: { defaultProperties: { height: '50px' } }
					}
				} );

				view = classicEditor.editing.view;
				model = classicEditor.model;
				resizePlugin = classicEditor.plugins.get( TableRowResizeEditing );

				_setModelData( model, threeRowTable );

				heights = [ 0, 1, 2 ].map( index => getDomRowHeight( index ) );
			} );

			afterEach( () => {
				styleElement.remove();
			} );

			it( 'should set the rendered heights of the rows and the table height to `auto`, so the default one does not apply', () => {
				drag( getViewResizer( 0, 0 ), -20 );

				expect( getTable().getAttribute( 'tableHeight' ) ).toBe( 'auto' );
				expect( getDomRowHeight( 0 ) ).toBeCloseTo( heights[ 0 ] - 20, 0 );
				expect( getDomRowHeight( 1 ) ).toBeCloseTo( heights[ 1 ], 0 );
				expect( parseFloat( getModelRow( 1 ).getAttribute( 'rowHeight' ) ) ).toBeCloseTo( heights[ 1 ], 1 );
			} );

			it( 'should set the heights of the cells of the resized row to `auto`, so the default one does not apply', () => {
				drag( getViewResizer( 0, 0 ), -200 );

				expect( getCellHeights( 0 ) ).toEqual( [ 'auto', 'auto' ] );
				expect( getCellHeights( 1 ) ).toEqual( [ undefined, undefined ] );
				// The row gets as low as its content, below the default cell height.
				expect( getDomRowHeight( 0 ) ).toBeLessThan( 50 );
			} );

			it( 'should set the table and cell heights to `auto` in the preview', () => {
				mouseDown( getViewResizer( 0, 0 ) );
				mouseMove( -20 );

				const viewCell = classicEditor.editing.mapper.toViewElement( getModelRow( 0 ).getChild( 0 ) );

				expect( classicEditor.editing.mapper.toViewElement( getTable() ).getStyle( 'height' ) ).toBe( 'auto' );
				expect( viewCell.getStyle( 'height' ) ).toBe( 'auto' );

				mouseUp();
			} );

			it( 'should restore the table and cell heights in the view when the height did not change', () => {
				const dataBefore = _getModelData( model );

				mouseDown( getViewResizer( 0, 0 ) );
				mouseMove( 10 );
				mouseMove( 0 );
				mouseUp();

				const viewCell = classicEditor.editing.mapper.toViewElement( getModelRow( 0 ).getChild( 0 ) );

				expect( _getModelData( model ) ).toBe( dataBefore );
				expect( classicEditor.editing.mapper.toViewElement( getTable() ).hasStyle( 'height' ) ).toBe( false );
				expect( viewCell.hasStyle( 'height' ) ).toBe( false );
			} );

			it( 'should undo the resize in a single step', () => {
				const dataBefore = _getModelData( model );

				drag( getViewResizer( 0, 0 ), -20 );
				classicEditor.execute( 'undo' );

				expect( _getModelData( model ) ).toBe( dataBefore );
			} );

			it( 'should set the table height to `auto` instead of removing a table height set in the model', () => {
				model.change( writer => writer.setAttribute( 'tableHeight', '500px', getTable() ) );

				drag( getViewResizer( 0, 0 ), -20 );

				expect( getTable().getAttribute( 'tableHeight' ) ).toBe( 'auto' );
			} );

			it( 'should not set the rendered heights of the rows of a table with the `auto` height', () => {
				model.change( writer => writer.setAttribute( 'tableHeight', 'auto', getTable() ) );

				drag( getViewResizer( 0, 0 ), 20 );

				expect( getModelRow( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
				expect( getTable().getAttribute( 'tableHeight' ) ).toBe( 'auto' );
			} );

			it( 'should remove the table and cell heights of a layout table, as it does not use the default ones', () => {
				model.change( writer => {
					writer.setAttribute( 'tableType', 'layout', getTable() );
					writer.setAttribute( 'tableHeight', '300px', getTable() );
					writer.setAttribute( 'tableCellHeight', '80px', getModelRow( 0 ).getChild( 0 ) );
				} );

				drag( getViewResizer( 0, 0 ), -20 );

				expect( getTable().hasAttribute( 'tableHeight' ) ).toBe( false );
				expect( getCellHeights( 0 ) ).toEqual( [ undefined, undefined ] );
			} );

			describe( 'with the tableRowHeight command', () => {
				beforeEach( () => {
					model.change( writer => writer.setSelection( getModelRow( 0 ).getChild( 0 ).getChild( 0 ), 0 ) );
				} );

				it( 'should set the table and cell heights to `auto`', () => {
					classicEditor.execute( 'tableRowHeight', { value: '40' } );

					expect( getTable().getAttribute( 'tableHeight' ) ).toBe( 'auto' );
					expect( getModelRow( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
					expect( getCellHeights( 0 ) ).toEqual( [ 'auto', 'auto' ] );
					expect( getDomRowHeight( 0 ) ).toBeCloseTo( 40, 0 );
				} );

				it( 'should set the cell heights to `auto` when the row height is removed and show it as no height', () => {
					classicEditor.execute( 'tableRowHeight', { value: '' } );

					expect( getModelRow( 0 ).hasAttribute( 'rowHeight' ) ).toBe( false );
					expect( getCellHeights( 0 ) ).toEqual( [ 'auto', 'auto' ] );
					expect( classicEditor.commands.get( 'tableRowHeight' ).value ).toBe( null );
				} );
			} );
		} );

		it( 'should remove the resizing cursor when the editor is destroyed while resizing', async () => {
			_setModelData( model, twoRowTable );

			mouseDown( getViewResizer( 0, 0 ) );
			mouseMove( 30 );

			await classicEditor.destroy();

			expect( document.body.classList.contains( 'ck-table-row-resize__resizing-cursor' ) ).toBe( false );

			// Let the `afterEach()` destroy a fresh editor.
			classicEditor = await ClassicEditor.create( editorElement, { plugins: [ TableRowResize, Paragraph ] } );
		} );
	} );

	describe( 'in a right-to-left editor and next to the column resize feature', () => {
		const START_Y = 100;

		let testEditor, editorElement;

		afterEach( async () => {
			await testEditor.destroy();
			editorElement.remove();
		} );

		async function createTestEditor( config ) {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			testEditor = await ClassicEditor.create( editorElement, config );
		}

		function getViewCell( rowIndex, cellIndex ) {
			const modelCell = testEditor.model.document.getRoot().getNodeByPath( [ 0, rowIndex, cellIndex ] );

			return testEditor.editing.mapper.toViewElement( modelCell );
		}

		function getViewResizer( rowIndex, cellIndex, className = 'ck-table-row-resizer' ) {
			return Array
				.from( getViewCell( rowIndex, cellIndex ).getChildren() )
				.find( child => child.is( 'uiElement' ) && child.hasClass( className ) );
		}

		function drag( viewResizer, dy ) {
			const plugin = testEditor.plugins.get( TableRowResizeEditing );

			plugin._onMouseDownHandler(
				{ stop: vi.fn() },
				{ target: viewResizer, domEvent: { clientY: START_Y }, preventDefault: vi.fn() }
			);
			plugin._onMouseMoveHandler( {}, { clientY: START_Y + dy } );
			plugin._onMouseUpHandler();
		}

		const resizedTable =
			'<table tableWidth="400px">' +
				'<tableRow rowHeight="40px">' +
					'<tableCell><paragraph>00</paragraph></tableCell>' +
					'<tableCell><paragraph>01</paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow><tableCell><paragraph>10</paragraph></tableCell><tableCell><paragraph>11</paragraph></tableCell></tableRow>' +
				'<tableColumnGroup>' +
					'<tableColumn columnWidth="150px"></tableColumn>' +
					'<tableColumn columnWidth="250px"></tableColumn>' +
				'</tableColumnGroup>' +
			'</table>';

		it( 'should stretch the resizer over the whole table width and resize the row in a right-to-left editor', async () => {
			await createTestEditor( { plugins: [ TableRowResize, Paragraph ], language: 'ar' } );

			_setModelData( testEditor.model,
				'<table>' +
					'<tableRow rowHeight="40px">' +
						'<tableCell><paragraph>00</paragraph></tableCell>' +
						'<tableCell><paragraph>01</paragraph></tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			const view = testEditor.editing.view;
			const viewResizer = getViewResizer( 0, 1 );
			const tableRect = new Rect( view.domConverter.mapViewToDom( viewResizer.findAncestor( 'table' ) ) );
			const cellRect = new Rect( view.domConverter.mapViewToDom( getViewCell( 0, 1 ) ) );

			expect( testEditor.locale.contentLanguageDirection ).toBe( 'rtl' );

			view.document.fire( 'mouseover', { target: viewResizer } );

			expect( viewResizer.getStyle( 'left' ) ).toBe( `${ Number( ( tableRect.left - cellRect.left ).toFixed( 4 ) ) }px` );
			expect( viewResizer.getStyle( 'right' ) ).toBe( `${ Number( ( cellRect.right - tableRect.right ).toFixed( 4 ) ) }px` );

			drag( viewResizer, 30 );

			expect( testEditor.model.document.getRoot().getNodeByPath( [ 0, 0 ] ).getAttribute( 'rowHeight' ) ).toBe( '70px' );
		} );

		it( 'should add both resizers to every cell when the column resize feature is loaded', async () => {
			await createTestEditor( { plugins: [ TableRowResize, TableColumnResize, Paragraph ] } );

			_setModelData( testEditor.model, resizedTable );

			for ( const [ rowIndex, cellIndex ] of [ [ 0, 0 ], [ 0, 1 ], [ 1, 0 ], [ 1, 1 ] ] ) {
				expect( getViewResizer( rowIndex, cellIndex ) ).toBeDefined();
				expect( getViewResizer( rowIndex, cellIndex, 'ck-table-column-resizer' ) ).toBeDefined();
			}
		} );

		it( 'should not change the column widths and the table width when a row is resized', async () => {
			await createTestEditor( { plugins: [ TableRowResize, TableColumnResize, Paragraph ] } );

			_setModelData( testEditor.model, resizedTable );

			drag( getViewResizer( 0, 0 ), 30 );

			const table = testEditor.model.document.getRoot().getChild( 0 );
			const columns = Array.from( table.getChild( 2 ).getChildren() );

			expect( table.getChild( 0 ).getAttribute( 'rowHeight' ) ).toBe( '70px' );
			expect( table.getAttribute( 'tableWidth' ) ).toBe( '400px' );
			expect( columns.map( column => column.getAttribute( 'columnWidth' ) ) ).toEqual( [ '150px', '250px' ] );
		} );

		it( 'should not change the row heights when the columns are resized', async () => {
			await createTestEditor( { plugins: [ TableRowResize, TableColumnResize, Paragraph ] } );

			_setModelData( testEditor.model, resizedTable );

			const table = testEditor.model.document.getRoot().getChild( 0 );

			testEditor.execute( 'resizeColumnWidths', { table, tableWidth: '400px', columnWidths: [ '200px', '200px' ] } );

			expect( table.getChild( 0 ).getAttribute( 'rowHeight' ) ).toBe( '40px' );
			expect( table.getChild( 1 ).hasAttribute( 'rowHeight' ) ).toBe( false );
		} );
	} );
	for ( const mode of [ 'open', 'closed' ] ) {
		describe( `in a ${ mode } shadow root`, () => {
			const START_Y = 100;

			let host, testEditor;

			beforeEach( async () => {
				host = document.createElement( 'div' );
				document.body.appendChild( host );

				const editorElement = document.createElement( 'div' );

				host.attachShadow( { mode } ).appendChild( editorElement );

				// The `Table` plugin brings the observer of the mouse events, as in a real setup.
				testEditor = await ClassicEditor.create( editorElement, { plugins: [ Table, TableRowResize, Paragraph, Undo ] } );

				_setModelData( testEditor.model,
					'<table>' +
						'<tableRow rowHeight="80px">' +
							'<tableCell><paragraph>00</paragraph></tableCell>' +
							'<tableCell><paragraph>01</paragraph></tableCell>' +
						'</tableRow>' +
						'<tableRow>' +
							'<tableCell><paragraph>10</paragraph></tableCell>' +
							'<tableCell><paragraph>11</paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			afterEach( async () => {
				await testEditor.destroy();
				host.remove();
			} );

			function getDomResizer( rowIndex, cellIndex ) {
				const modelCell = testEditor.model.document.getRoot().getNodeByPath( [ 0, rowIndex, cellIndex ] );
				const viewCell = testEditor.editing.mapper.toViewElement( modelCell );

				return testEditor.editing.view.domConverter.mapViewToDom( viewCell ).querySelector( '.ck-table-row-resizer' );
			}

			// Mouse events are composed, so the ones fired inside the shadow root reach the document too.
			function fireMouseEvent( domTarget, type, clientY = START_Y ) {
				domTarget.dispatchEvent( new MouseEvent( type, { bubbles: true, composed: true, clientY } ) );
			}

			it( 'should stretch the resizer over the whole table width on mouseover', () => {
				const domResizer = getDomResizer( 0, 1 );

				fireMouseEvent( domResizer, 'mouseover' );

				expect( domResizer.style.left ).not.toBe( '' );
				expect( domResizer.style.right ).not.toBe( '' );
			} );

			it( 'should resize a row by dragging its edge', () => {
				const domResizer = getDomResizer( 0, 0 );

				fireMouseEvent( domResizer, 'mousedown' );
				fireMouseEvent( domResizer, 'mousemove', START_Y + 30 );
				fireMouseEvent( domResizer, 'mouseup', START_Y + 30 );

				expect( testEditor.model.document.getRoot().getNodeByPath( [ 0, 0 ] ).getAttribute( 'rowHeight' ) ).toBe( '110px' );
				expect( testEditor.plugins.get( TableRowResizeEditing )._isResizingActive ).toBe( false );
			} );
		} );
	}
} );
