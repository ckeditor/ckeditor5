/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { global } from '@ckeditor/ckeditor5-utils';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { TableEditing } from '../../src/tableediting.js';
import { TableCaptionEditing } from '../../src/tablecaption/tablecaptionediting.js';
import { TableScrollEditing } from '../../src/tablescroll/tablescrollediting.js';
import { modelTable } from '../_utils/utils.js';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

const DEFAULT_CONTAINER_WIDTH = 300;

describe( 'TableScrollEditing', () => {
	describe( 'plugin definition', () => {
		it( 'should have a name', () => {
			expect( TableScrollEditing.pluginName ).toBe( 'TableScrollEditing' );
		} );

		it( 'should be marked as an official plugin', () => {
			expect( TableScrollEditing.isOfficialPlugin ).toBe( true );
		} );

		it( 'should require TableEditing', () => {
			expect( TableScrollEditing.requires ).toEqual( [ TableEditing ] );
		} );
	} );

	describe( 'overflow state', () => {
		let editor, model, element, tableScrollEditing;

		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, TableCaptionEditing, Paragraph, TableScrollEditing ]
			} );

			model = editor.model;
			tableScrollEditing = editor.plugins.get( 'TableScrollEditing' );

			setContainerWidth( editor, DEFAULT_CONTAINER_WIDTH );
		} );

		afterEach( async () => {
			if ( editor ) {
				await editor.destroy();
			}

			element.remove();
		} );

		it( 'should default `table.tableScroll.tableTypes` to [ \'content\' ]', () => {
			expect( editor.config.get( 'table.tableScroll.tableTypes' ) ).toEqual( [ 'content' ] );
		} );

		it( 'should not mark a newly inserted table without a tableWidth attribute as overflowing', () => {
			_setModelData( model, modelTable( [ [ '00' ] ] ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
			expect( viewFigure.getStyle( 'width' ) ).toBeUndefined();
			expect( viewTable.getStyle( 'width' ) ).toBeUndefined();
		} );

		it( 'should not throw and should leave the figure untouched when the editing root has no DOM element attached yet', () => {
			vi.spyOn( editor.editing.view, 'getDomRoot' ).mockReturnValue( undefined );

			expect( () => {
				_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );
			} ).not.toThrow();

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
			expect( viewFigure.getStyle( 'width' ) ).toBeUndefined();
			expect( viewTable.getStyle( 'width' ) ).toBeUndefined();
		} );

		it( 'should evaluate the overflow state once the editing root DOM element becomes available again', () => {
			const getDomRootSpy = vi.spyOn( editor.editing.view, 'getDomRoot' ).mockReturnValue( undefined );

			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );

			const table = model.document.getRoot().getChild( 0 );

			getDomRootSpy.mockRestore();
			setContainerWidth( editor, DEFAULT_CONTAINER_WIDTH );

			tableScrollEditing._updateTableScrollOverflowState( table );

			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( true );
			expect( viewTable.getStyle( 'width' ) ).toBe( '900px' );
		} );

		it( 'should apply the width to the figure and not mark the table as overflowing when it fits the container', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '150px' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
			expect( viewFigure.getStyle( 'width' ) ).toBe( '150px' );
			expect( viewTable.getStyle( 'width' ) ).toBeUndefined();
		} );

		it( 'should mark the table as overflowing when its pixel width exceeds the container width', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( true );
			expect( viewFigure.getStyle( 'width' ) ).toBeUndefined();
			expect( viewTable.getStyle( 'width' ) ).toBe( '900px' );
		} );

		it( 'should mark the table as overflowing when its percentage width exceeds 100%, regardless of container width', () => {
			setContainerWidth( editor, 10000 );

			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '150%' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( true );
		} );

		it( 'should not mark the table as overflowing when its percentage width is 100% or less', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '80%' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
		} );

		it( 'should not mark the table as overflowing for a non-pixel, non-percentage width, even when it would clearly overflow', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '10in' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
			expect( viewFigure.getStyle( 'width' ) ).toBe( '10in' );
			expect( viewTable.getStyle( 'width' ) ).toBeUndefined();
		} );

		it( 'should evaluate the overflow state of a table inserted after initialization', () => {
			_setModelData( model, '<paragraph>foo</paragraph>' );

			model.change( writer => {
				const table = writer.createElement( 'table', { tableWidth: '900px' } );
				const row = writer.createElement( 'tableRow' );
				const cell = writer.createElement( 'tableCell' );

				writer.append( cell, row );
				writer.append( row, table );
				writer.insert( table, model.document.getRoot(), 0 );
			} );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( true );
		} );

		it( 'should update the overflow state when the tableWidth attribute changes', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '150px' } ) );

			const table = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'tableWidth', '900px', table );
			} );

			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( true );
			expect( viewTable.getStyle( 'width' ) ).toBe( '900px' );
		} );

		it( 'should reset the overflow state when the tableWidth attribute is removed', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );

			const table = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.removeAttribute( 'tableWidth', table );
			} );

			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
			expect( viewFigure.getStyle( 'width' ) ).toBeUndefined();
			expect( viewTable.getStyle( 'width' ) ).toBeUndefined();
		} );

		it( 'should stop marking a table as overflowing once it is converted from content to layout', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );

			const table = model.document.getRoot().getChild( 0 );

			expect( getViewElements( editor, table ).viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( true );

			model.change( writer => {
				writer.setAttribute( 'tableType', 'layout', table );
			} );

			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
			expect( viewFigure.getStyle( 'width' ) ).toBe( '900px' );
			expect( viewTable.getStyle( 'width' ) ).toBeUndefined();
		} );

		it( 'should start marking a table as overflowing once it is converted from layout to content', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px', tableType: 'layout' } ) );

			const table = model.document.getRoot().getChild( 0 );

			expect( getViewElements( editor, table ).viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );

			model.change( writer => {
				writer.setAttribute( 'tableType', 'content', table );
			} );

			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( true );
			expect( viewTable.getStyle( 'width' ) ).toBe( '900px' );
		} );

		it( 'should remove the width from the figure once the table starts overflowing', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '150px' } ) );

			const table = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'tableWidth', '900px', table );
			} );

			const { viewFigure } = getViewElements( editor, table );

			expect( viewFigure.getStyle( 'width' ) ).toBeUndefined();
		} );

		it( 'should restore the width on the figure once an overflowing table stops overflowing', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );

			const table = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'tableWidth', '150px', table );
			} );

			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
			expect( viewFigure.getStyle( 'width' ) ).toBe( '150px' );
			expect( viewTable.getStyle( 'width' ) ).toBeUndefined();
		} );

		it( 'should clear the scroll offset custom property once an overflowing table stops overflowing', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure } = getViewElements( editor, table );

			editor.editing.view.change( writer => {
				writer.setStyle( '--ck-table-scroll-offset', '50px', viewFigure );
			} );

			model.change( writer => {
				writer.setAttribute( 'tableWidth', '150px', table );
			} );

			expect( viewFigure.getStyle( '--ck-table-scroll-offset' ) ).toBeUndefined();
		} );

		it( 'should apply the table width to a figcaption sibling as well when the table overflows', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );

			const table = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				const caption = writer.createElement( 'caption' );

				writer.insert( caption, table, 'end' );
				writer.insertText( 'Caption', caption, 0 );
			} );

			const { viewFigcaption } = getViewElements( editor, table );

			expect( viewFigcaption ).not.toBeUndefined();
			expect( viewFigcaption.getStyle( 'width' ) ).toBe( '900px' );
		} );

		it( 'should remove the width from the figcaption when the table does not overflow', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '150px' } ) );

			const table = model.document.getRoot().getChild( 0 );

			model.change( writer => {
				const caption = writer.createElement( 'caption' );

				writer.insert( caption, table, 'end' );
				writer.insertText( 'Caption', caption, 0 );
			} );

			const { viewFigcaption } = getViewElements( editor, table );

			expect( viewFigcaption ).not.toBeUndefined();
			expect( viewFigcaption.getStyle( 'width' ) ).toBeUndefined();
		} );

		it( 'should re-evaluate every table when the browser window is resized', async () => {
			_setModelData( model,
				modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) +
				modelTable( [ [ '00' ] ], { tableWidth: '900px' } )
			);

			const [ firstTable, secondTable ] = Array.from( model.document.getRoot().getChildren() );

			setContainerWidth( editor, 10000 );

			global.window.dispatchEvent( new Event( 'resize' ) );

			await wait( 150 );

			expect( getViewElements( editor, firstTable ).viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
			expect( getViewElements( editor, secondTable ).viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
		} );

		it( 'should let an explicit tableWidthOverride take precedence over the tableWidth attribute', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '150px' } ) );

			const table = model.document.getRoot().getChild( 0 );

			tableScrollEditing._updateTableScrollOverflowState( table, '900px' );

			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( true );
			expect( viewTable.getStyle( 'width' ) ).toBe( '900px' );
		} );

		it( 'should treat an explicit null override as "no width", overriding the tableWidth attribute', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );

			const table = model.document.getRoot().getChild( 0 );

			tableScrollEditing._updateTableScrollOverflowState( table, null );

			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
			expect( viewFigure.getStyle( 'width' ) ).toBeUndefined();
			expect( viewTable.getStyle( 'width' ) ).toBeUndefined();
		} );

		describe( '_isTableScrollable()', () => {
			it( 'should return true for a content table sitting directly in the root', () => {
				_setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = model.document.getRoot().getChild( 0 );

				expect( tableScrollEditing._isTableScrollable( table ) ).toBe( true );
			} );

			it( 'should return false for a table nested inside another table', () => {
				_setModelData( model, modelTable( [ [ '00' ] ] ) );

				const outerTable = model.document.getRoot().getChild( 0 );
				const outerCell = outerTable.getChild( 0 ).getChild( 0 );

				let nestedTable;

				model.change( writer => {
					nestedTable = writer.createElement( 'table', { tableWidth: '900px' } );
					const row = writer.createElement( 'tableRow' );
					const cell = writer.createElement( 'tableCell' );

					writer.append( cell, row );
					writer.append( row, nestedTable );
					writer.append( nestedTable, outerCell );
				} );

				expect( tableScrollEditing._isTableScrollable( nestedTable ) ).toBe( false );
			} );

			it( 'should return false for a layout table by default', () => {
				_setModelData( model, modelTable( [ [ '00' ] ], { tableType: 'layout' } ) );

				const table = model.document.getRoot().getChild( 0 );

				expect( tableScrollEditing._isTableScrollable( table ) ).toBe( false );
			} );

			it( 'should return true for a layout table when included via `table.tableScroll.tableTypes`', () => {
				editor.config.set( 'table.tableScroll.tableTypes', [ 'content', 'layout' ] );

				_setModelData( model, modelTable( [ [ '00' ] ], { tableType: 'layout' } ) );

				const table = model.document.getRoot().getChild( 0 );

				expect( tableScrollEditing._isTableScrollable( table ) ).toBe( true );
			} );

			it( 'should treat a table without an explicit `tableType` attribute as a content table', () => {
				_setModelData( model, modelTable( [ [ '00' ] ] ) );

				const table = model.document.getRoot().getChild( 0 );

				expect( table.hasAttribute( 'tableType' ) ).toBe( false );
				expect( tableScrollEditing._isTableScrollable( table ) ).toBe( true );
			} );
		} );

		it( 'should not mark a table nested inside another table as overflowing even when its width exceeds the container', () => {
			_setModelData( model, modelTable( [ [ '00' ] ] ) );

			const outerTable = model.document.getRoot().getChild( 0 );
			const outerCell = outerTable.getChild( 0 ).getChild( 0 );

			let nestedTable;

			model.change( writer => {
				nestedTable = writer.createElement( 'table', { tableWidth: '900px' } );
				const row = writer.createElement( 'tableRow' );
				const cell = writer.createElement( 'tableCell' );

				writer.append( cell, row );
				writer.append( row, nestedTable );
				writer.append( nestedTable, outerCell );
			} );

			const { viewFigure } = getViewElements( editor, nestedTable );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
		} );

		it( 'should not mark a layout table as overflowing by default, even when its width exceeds the container', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px', tableType: 'layout' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
			expect( viewFigure.getStyle( 'width' ) ).toBe( '900px' );
		} );

		it( 'should mark a layout table as overflowing when included via `table.tableScroll.tableTypes`', () => {
			editor.config.set( 'table.tableScroll.tableTypes', [ 'content', 'layout' ] );

			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px', tableType: 'layout' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( true );
			expect( viewTable.getStyle( 'width' ) ).toBe( '900px' );
		} );
	} );

	describe( 'conversion guard clauses', () => {
		let editor, model, element, tableScrollEditing;

		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, TableCaptionEditing, Paragraph, TableScrollEditing ]
			} );

			model = editor.model;
			tableScrollEditing = editor.plugins.get( 'TableScrollEditing' );

			setContainerWidth( editor, DEFAULT_CONTAINER_WIDTH );
		} );

		afterEach( async () => {
			if ( editor ) {
				await editor.destroy();
			}

			element.remove();
		} );

		it( 'should return early without touching the view when the table has no corresponding view element', () => {
			let looseTable;

			model.change( writer => {
				looseTable = writer.createElement( 'table' );
			} );

			const viewChangeSpy = vi.spyOn( editor.editing.view, 'change' );

			expect( () => tableScrollEditing._updateTableScrollOverflowState( looseTable ) ).not.toThrow();
			expect( viewChangeSpy ).not.toHaveBeenCalled();
		} );

		it( 'should return early without touching the view when the figure has no inner <table> view element', () => {
			_setModelData( model, modelTable( [ [ '00' ] ] ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure, viewTable } = getViewElements( editor, table );

			editor.editing.view.change( writer => {
				writer.remove( viewTable );
			} );

			const viewChangeSpy = vi.spyOn( editor.editing.view, 'change' );

			expect( () => tableScrollEditing._updateTableScrollOverflowState( table, '900px' ) ).not.toThrow();
			expect( viewChangeSpy ).not.toHaveBeenCalled();
			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
		} );

		it( 'should do nothing when a "caption" is downcast with a parent that is not a table', () => {
			model.schema.extend( 'caption', { allowIn: '$root' } );

			editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
				dispatcher.on( 'insert:caption', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, evt.name );
				}, { priority: 'highest' } );
			} );

			const updateSpy = vi.spyOn( tableScrollEditing, '_updateTableScrollOverflowState' );

			expect( () => {
				model.change( writer => {
					writer.insertElement( 'caption', model.document.getRoot(), 'end' );
				} );
			} ).not.toThrow();

			expect( updateSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'scroll handling', () => {
		let editor, model, element;

		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, Paragraph, TableScrollEditing ]
			} );

			model = editor.model;

			setContainerWidth( editor, DEFAULT_CONTAINER_WIDTH );
		} );

		afterEach( async () => {
			if ( editor ) {
				await editor.destroy();
			}

			element.remove();
		} );

		it( 'should update the scroll offset custom property when an overflowing table\'s figure is scrolled', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure } = getViewElements( editor, table );
			const domFigure = editor.editing.view.domConverter.mapViewToDom( viewFigure );

			dispatchScroll( domFigure, 42 );

			expect( viewFigure.getStyle( '--ck-table-scroll-offset' ) ).toBe( '42px' );
		} );

		it( 'should not update the scroll offset custom property for a non-overflowing table', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '150px' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure } = getViewElements( editor, table );
			const domFigure = editor.editing.view.domConverter.mapViewToDom( viewFigure );

			expect( () => dispatchScroll( domFigure, 42 ) ).not.toThrow();
			expect( viewFigure.getStyle( '--ck-table-scroll-offset' ) ).toBeUndefined();
		} );

		it( 'should not throw when a scroll event is fired on an element unrelated to the editor', () => {
			const outsideElement = document.createElement( 'div' );

			document.body.appendChild( outsideElement );

			expect( () => dispatchScroll( outsideElement, 10 ) ).not.toThrow();

			outsideElement.remove();
		} );

		it( 'should not throw when the scrolled element has the overflowing class but isn\'t mapped to any view element', () => {
			const outsideElement = document.createElement( 'div' );

			outsideElement.classList.add( 'ck-table-overflowing' );
			document.body.appendChild( outsideElement );

			expect( () => dispatchScroll( outsideElement, 10 ) ).not.toThrow();

			outsideElement.remove();
		} );

		it( 'should stop reacting to scroll events once the editor is destroyed', async () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure } = getViewElements( editor, table );
			const domFigure = editor.editing.view.domConverter.mapViewToDom( viewFigure );

			await editor.destroy();
			editor = null;

			expect( () => dispatchScroll( domFigure, 99 ) ).not.toThrow();
		} );
	} );

	describe( 'window resize handling', () => {
		let editor, model, element;

		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, Paragraph, TableScrollEditing ]
			} );

			model = editor.model;

			setContainerWidth( editor, DEFAULT_CONTAINER_WIDTH );
		} );

		afterEach( async () => {
			if ( editor ) {
				await editor.destroy();
			}

			element.remove();
		} );

		it( 'should not throw when the window is resized after the editor is destroyed', async () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );

			await editor.destroy();
			editor = null;

			expect( () => {
				global.window.dispatchEvent( new Event( 'resize' ) );
			} ).not.toThrow();
		} );
	} );

	describe( 'integration with TableColumnResizeEditing', () => {
		let editor, model, element, columnResizeEditing, tableScrollEditing;

		class ColumnResizeEditingMock extends Plugin {
			static get pluginName() {
				return 'TableColumnResizeEditing';
			}

			constructor( editor ) {
				super( editor );

				this.resizingTable = null;
			}
		}

		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, Paragraph, ColumnResizeEditingMock, TableScrollEditing ]
			} );

			model = editor.model;
			columnResizeEditing = editor.plugins.get( 'TableColumnResizeEditing' );
			tableScrollEditing = editor.plugins.get( 'TableScrollEditing' );

			setContainerWidth( editor, DEFAULT_CONTAINER_WIDTH );
		} );

		afterEach( async () => {
			if ( editor ) {
				await editor.destroy();
			}

			element.remove();
		} );

		it( 'should update the table\'s overflow state and stop the event when "_setResizingTableWidth" is fired', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '150px' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure } = getViewElements( editor, table );

			let lowerPriorityListenerCalled = false;

			columnResizeEditing.on( '_setResizingTableWidth', () => {
				lowerPriorityListenerCalled = true;
			} );

			columnResizeEditing.fire( '_setResizingTableWidth', [ null, viewFigure, '900px' ] );

			expect( lowerPriorityListenerCalled ).toBe( false );
			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( true );
		} );

		it( 'should return the figure width and stop the event when "_getResizingTableWidth" is fired for a non-overflowing table', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '150px' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure } = getViewElements( editor, table );

			let lowerPriorityListenerCalled = false;

			columnResizeEditing.on( '_getResizingTableWidth', () => {
				lowerPriorityListenerCalled = true;
			} );

			const result = columnResizeEditing.fire( '_getResizingTableWidth', [ viewFigure ] );

			expect( lowerPriorityListenerCalled ).toBe( false );
			expect( result ).toBe( '150px' );
		} );

		it( 'should return the table\'s width (not the figure\'s) when "_getResizingTableWidth" is fired for an overflowing table', () => {
			_setModelData( model, modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) );

			const table = model.document.getRoot().getChild( 0 );
			const { viewFigure } = getViewElements( editor, table );

			const result = columnResizeEditing.fire( '_getResizingTableWidth', [ viewFigure ] );

			expect( result ).toBe( '900px' );
		} );

		it( 'should skip the currently resizing table when recalculating overflow state on window resize', async () => {
			_setModelData( model,
				modelTable( [ [ '00' ] ], { tableWidth: '900px' } ) +
				modelTable( [ [ '00' ] ], { tableWidth: '900px' } )
			);

			const [ resizingTable, otherTable ] = Array.from( model.document.getRoot().getChildren() );

			columnResizeEditing.resizingTable = resizingTable;

			const updateSpy = vi.spyOn( tableScrollEditing, '_updateTableScrollOverflowState' );

			global.window.dispatchEvent( new Event( 'resize' ) );

			await wait( 150 );

			expect( updateSpy ).not.toHaveBeenCalledWith( resizingTable );
			expect( updateSpy ).toHaveBeenCalledWith( otherTable );
		} );
	} );

	describe( 'integration with GeneralHtmlSupport', () => {
		let editor, model, element;

		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, TableCaptionEditing, Paragraph, GeneralHtmlSupport, TableScrollEditing ],
				htmlSupport: {
					allow: [
						{
							name: 'figure',
							styles: true,
							classes: true,
							attributes: true
						}
					]
				}
			} );

			model = editor.model;

			setContainerWidth( editor, DEFAULT_CONTAINER_WIDTH );
		} );

		afterEach( async () => {
			if ( editor ) {
				await editor.destroy();
			}

			element.remove();
		} );

		function insertGhsFigureWidthTable() {
			editor.setData(
				'<figure class="table" style="width:250px">' +
					'<table><tbody><tr><td>00</td></tr></tbody></table>' +
				'</figure>'
			);

			return model.document.getRoot().getChild( 0 );
		}

		it( 'should not remove a figure width set through GHS ("htmlFigureAttributes") from a table with no "tableWidth" attribute', () => {
			const table = insertGhsFigureWidthTable();
			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.getStyle( 'width' ) ).toBe( '250px' );
			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( false );
			expect( viewTable.getStyle( 'width' ) ).toBeUndefined();
		} );

		it( 'should not throw and should leave the GHS figure width untouched for a newly ' +
				'inserted table with no "tableWidth" attribute', () => {
			_setModelData( model, '<paragraph>foo</paragraph>' );

			let table;

			expect( () => {
				model.change( writer => {
					table = writer.createElement( 'table', {
						htmlFigureAttributes: {
							styles: { width: '250px' }
						}
					} );
					const row = writer.createElement( 'tableRow' );
					const cell = writer.createElement( 'tableCell' );

					writer.append( cell, row );
					writer.append( row, table );
					writer.insert( table, model.document.getRoot(), 0 );
				} );
			} ).not.toThrow();

			const { viewFigure } = getViewElements( editor, table );

			expect( viewFigure.getStyle( 'width' ) ).toBe( '250px' );
		} );

		it( 'should not remove the GHS figure width when every table in the document is re-evaluated on window resize', async () => {
			const table = insertGhsFigureWidthTable();

			global.window.dispatchEvent( new Event( 'resize' ) );

			await wait( 150 );

			const { viewFigure } = getViewElements( editor, table );

			expect( viewFigure.getStyle( 'width' ) ).toBe( '250px' );
		} );

		it( 'should not remove the GHS figure width when the table\'s "tableType" attribute changes', () => {
			const table = insertGhsFigureWidthTable();

			model.change( writer => {
				writer.setAttribute( 'tableType', 'layout', table );
			} );

			const { viewFigure } = getViewElements( editor, table );

			expect( viewFigure.getStyle( 'width' ) ).toBe( '250px' );
		} );

		it( 'should not remove the GHS figure width when a caption is inserted into the table', () => {
			const table = insertGhsFigureWidthTable();

			model.change( writer => {
				const caption = writer.createElement( 'caption' );

				writer.insert( caption, table, 'end' );
				writer.insertText( 'Caption', caption, 0 );
			} );

			const { viewFigure } = getViewElements( editor, table );

			expect( viewFigure.getStyle( 'width' ) ).toBe( '250px' );
		} );

		it( 'should let the "tableWidth" attribute take over from the GHS figure width once it is set (e.g. by TableProperties)', () => {
			const table = insertGhsFigureWidthTable();

			// Sanity check: the GHS width is really there before `tableWidth` takes over.
			expect( getViewElements( editor, table ).viewFigure.getStyle( 'width' ) ).toBe( '250px' );

			model.change( writer => {
				writer.setAttribute( 'tableWidth', '900px', table );
			} );

			const { viewFigure, viewTable } = getViewElements( editor, table );

			expect( viewFigure.hasClass( 'ck-table-overflowing' ) ).toBe( true );
			expect( viewFigure.getStyle( 'width' ) ).toBeUndefined();
			expect( viewTable.getStyle( 'width' ) ).toBe( '900px' );
		} );
	} );
} );

function getViewElements( editor, table ) {
	const viewFigure = editor.editing.mapper.toViewElement( table );
	const viewTable = findChildElement( viewFigure, 'table' );
	const viewFigcaption = findChildElement( viewFigure, 'figcaption' );

	return { viewFigure, viewTable, viewFigcaption };
}

function findChildElement( parent, elementName ) {
	return Array
		.from( parent.getChildren() )
		.find( child => child.is( 'element', elementName ) );
}

function dispatchScroll( domElement, scrollLeft ) {
	Object.defineProperty( domElement, 'scrollLeft', { value: scrollLeft, configurable: true } );
	domElement.dispatchEvent( new Event( 'scroll' ) );
}

function setContainerWidth( editor, width, rootName = 'main' ) {
	const domRoot = editor.editing.view.getDomRoot( rootName );

	domRoot.style.width = `${ width }px`;
}

function wait( ms ) {
	return new Promise( resolve => setTimeout( resolve, ms ) );
}
