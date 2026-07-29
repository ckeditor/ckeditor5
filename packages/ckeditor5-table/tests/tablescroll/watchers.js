/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { _setModelData } from '@ckeditor/ckeditor5-engine';

import { TableEditing } from '../../src/tableediting.js';
import { modelTable } from '../_utils/utils.js';

import { watchTableModelElements, watchRootsWidthResize } from '../../src/tablescroll/watchers.js';

describe( 'table scroll watchers', () => {
	describe( 'watchTableModelElements()', () => {
		let editor, model, element, tables;

		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, Paragraph, Undo ]
			} );

			model = editor.model;
			tables = watchTableModelElements( model );
		} );

		afterEach( async () => {
			await editor.destroy();

			element.remove();
		} );

		it( 'should return an empty collection when there are no tables in the document', () => {
			_setModelData( model, '<paragraph>foo</paragraph>' );

			expect( tables.length ).toBe( 0 );
		} );

		it( 'should contain a table that is already present when the model data is set', () => {
			_setModelData( model, modelTable( [ [ '00', '01' ] ] ) );

			expect( tables.length ).toBe( 1 );
			expect( tables.get( 0 ).is( 'element', 'table' ) ).toBe( true );
		} );

		it( 'should detect a table inserted after initialization', () => {
			_setModelData( model, '<paragraph>foo</paragraph>' );

			model.change( writer => {
				insertTable( writer, model.document.getRoot(), 0 );
			} );

			expect( tables.length ).toBe( 1 );
		} );

		it( 'should detect multiple tables inserted within a single change block', () => {
			_setModelData( model, '<paragraph>foo</paragraph>' );

			model.change( writer => {
				insertTable( writer, model.document.getRoot(), 0 );
				insertTable( writer, model.document.getRoot(), 1 );
			} );

			expect( tables.length ).toBe( 2 );
		} );

		it( 'should detect a table nested inside another table\'s cell', () => {
			_setModelData( model, modelTable( [
				[ modelTable( [ [ '00' ] ] ) ]
			] ) );

			expect( tables.length ).toBe( 2 );
		} );

		it( 'should not react to insertions of non-table elements', () => {
			_setModelData( model, '<paragraph>foo</paragraph>' );

			model.change( writer => {
				writer.insertText( 'bar', model.document.getRoot().getChild( 0 ), 'end' );
			} );

			expect( tables.length ).toBe( 0 );
		} );

		it( 'should not add an already tracked table again when it is moved within the same root', () => {
			_setModelData( model, modelTable( [ [ '00' ] ] ) );

			model.change( writer => {
				const root = model.document.getRoot();
				const table = root.getChild( 0 );

				writer.insertElement( 'paragraph', root, 0 );
				writer.move( model.createRangeOn( table ), root, 0 );
			} );

			expect( tables.length ).toBe( 1 );
		} );

		it( 'should re-fire "remove" and "add" for a table moved within the same root, so listeners learn it moved', () => {
			_setModelData( model, modelTable( [ [ '00' ] ] ) );

			const table = model.document.getRoot().getChild( 0 );

			const addedSpy = vi.fn();
			const removedSpy = vi.fn();

			tables.on( 'add', ( evt, item ) => addedSpy( item ) );
			tables.on( 'remove', ( evt, item ) => removedSpy( item ) );

			model.change( writer => {
				const root = model.document.getRoot();

				writer.insertElement( 'paragraph', root, 0 );
				writer.move( model.createRangeOn( table ), root, 0 );
			} );

			expect( removedSpy ).toHaveBeenCalledWith( table );
			expect( addedSpy ).toHaveBeenCalledWith( table );
			expect( tables.length ).toBe( 1 );
		} );

		it( 'should re-fire "add" for a table moved into a nested position (e.g. another table\'s cell)', () => {
			_setModelData( model, modelTable( [ [ '00' ] ] ) + modelTable( [ [ '00' ] ] ) );

			const [ firstTable, secondTable ] = Array.from( model.document.getRoot().getChildren() );
			const secondTableCell = secondTable.getChild( 0 ).getChild( 0 );

			const addedSpy = vi.fn();

			tables.on( 'add', ( evt, item ) => addedSpy( item ) );

			model.change( writer => {
				writer.move( model.createRangeOn( firstTable ), secondTableCell, 'end' );
			} );

			expect( addedSpy ).toHaveBeenCalledWith( firstTable );
			expect( tables.length ).toBe( 2 );
		} );

		it( 'should remove a table moved to the graveyard', () => {
			_setModelData( model, modelTable( [ [ '00' ] ] ) );

			expect( tables.length ).toBe( 1 );

			model.change( writer => {
				writer.remove( model.document.getRoot().getChild( 0 ) );
			} );

			expect( tables.length ).toBe( 0 );
		} );

		it( 'should remove only the deleted table and keep tracking the remaining ones', () => {
			_setModelData( model, '<paragraph>foo</paragraph>' );

			model.change( writer => {
				insertTable( writer, model.document.getRoot(), 0 );
				insertTable( writer, model.document.getRoot(), 1 );
			} );

			expect( tables.length ).toBe( 2 );

			model.change( writer => {
				writer.remove( model.document.getRoot().getChild( 0 ) );
			} );

			expect( tables.length ).toBe( 1 );
		} );

		it( 'should re-add a table restored from the graveyard (e.g. via undo)', () => {
			_setModelData( model, modelTable( [ [ '00' ] ] ) );

			model.change( writer => {
				writer.remove( model.document.getRoot().getChild( 0 ) );
			} );

			expect( tables.length ).toBe( 0 );

			editor.execute( 'undo' );

			expect( tables.length ).toBe( 1 );
		} );

		it( 'should not pick up tables that already existed before the watcher was attached', () => {
			_setModelData( model, modelTable( [ [ '00' ] ] ) );

			const freshTables = watchTableModelElements( model );

			expect( freshTables.length ).toBe( 0 );
		} );

		it( 'should not throw if an external listener already removed another table from the collection ' +
			'while it is being cleaned up', () => {
			_setModelData( model, '<paragraph>foo</paragraph>' );

			let table1, table2;

			model.change( writer => {
				table1 = insertTable( writer, model.document.getRoot(), 0 );
				table2 = insertTable( writer, model.document.getRoot(), 1 );
			} );

			expect( tables.length ).toBe( 2 );

			tables.on( 'remove', ( evt, removedTable ) => {
				if ( removedTable === table1 && tables.has( table2 ) ) {
					tables.remove( table2 );
				}
			} );

			expect( () => {
				model.change( writer => {
					writer.remove( table1 );
					writer.remove( table2 );
				} );
			} ).not.toThrow();

			expect( tables.length ).toBe( 0 );
		} );

		it( 'should not throw if an external listener already removed another table from the collection ' +
			'while a batch of moves is being processed', () => {
			_setModelData( model, '<paragraph>foo</paragraph>' );

			let table1, table2;

			model.change( writer => {
				table1 = insertTable( writer, model.document.getRoot(), 0 );
				table2 = insertTable( writer, model.document.getRoot(), 1 );
			} );

			expect( tables.length ).toBe( 2 );

			tables.on( 'remove', ( evt, removedTable ) => {
				if ( removedTable === table1 && tables.has( table2 ) ) {
					tables.remove( table2 );
				}
			} );

			expect( () => {
				model.change( writer => {
					const root = model.document.getRoot();

					// Both tables are already tracked, so moving them lands them in `movedTables`, which goes
					// through the same "remove before re-adding" step as the graveyard cleanup above.
					writer.move( model.createRangeOn( table1 ), root, 0 );
					writer.move( model.createRangeOn( table2 ), root, 0 );
				} );
			} ).not.toThrow();
		} );

		function insertTable( writer, parent, index ) {
			const table = writer.createElement( 'table' );
			const row = writer.createElement( 'tableRow' );
			const cell = writer.createElement( 'tableCell' );

			writer.append( cell, row );
			writer.append( row, table );
			writer.insert( table, parent, index );

			return table;
		}
	} );

	describe( 'watchRootsWidthResize()', () => {
		let stopWatching;

		afterEach( () => {
			if ( stopWatching ) {
				stopWatching();
				stopWatching = null;
			}
		} );

		describe( 'single-root editor', () => {
			let editor, element, onResize;

			beforeEach( async () => {
				element = document.createElement( 'div' );
				document.body.appendChild( element );

				editor = await ClassicTestEditor.create( element, {
					plugins: [ TableEditing, Paragraph ]
				} );

				onResize = vi.fn();
			} );

			afterEach( async () => {
				if ( editor ) {
					await editor.destroy();
				}

				element.remove();
			} );

			it( 'should call the callback when the root that exists at watch-time changes width', async () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				const domRoot = editor.editing.view.getDomRoot( 'main' );

				await nextFrame();
				onResize.mockClear();

				await resizeTo( domRoot, 500 );

				expect( onResize ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should not call the callback again if the width is set to the same value', async () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				const domRoot = editor.editing.view.getDomRoot( 'main' );

				await resizeTo( domRoot, 500 );
				onResize.mockClear();

				await resizeTo( domRoot, 500 );

				expect( onResize ).not.toHaveBeenCalled();
			} );

			it( 'should call the callback again once the width changes to a different value', async () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				const domRoot = editor.editing.view.getDomRoot( 'main' );

				await resizeTo( domRoot, 500 );
				onResize.mockClear();

				await resizeTo( domRoot, 480 );

				expect( onResize ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should not call the callback for a height-only change once the width is already known', async () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				const domRoot = editor.editing.view.getDomRoot( 'main' );

				await resizeTo( domRoot, 500 );
				onResize.mockClear();

				domRoot.style.height = '300px';
				await nextFrame();

				expect( onResize ).not.toHaveBeenCalled();
			} );

			it( 'should stop reacting to width changes once its view root is removed from the view directly', async () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				const domRoot = editor.editing.view.getDomRoot( 'main' );
				const viewRoot = editor.editing.view.document.getRoot( 'main' );

				await nextFrame();
				onResize.mockClear();

				editor.editing.view.document.roots.remove( viewRoot );

				await resizeTo( domRoot, 500 );

				expect( onResize ).not.toHaveBeenCalled();
			} );

			it( 'should not throw when a view root without an attached DOM element is removed', () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				editor.model.change( writer => writer.addRoot( 'unattached-root' ) );

				const viewRoot = editor.editing.view.document.getRoot( 'unattached-root' );

				expect( () => {
					editor.editing.view.document.roots.remove( viewRoot );
				} ).not.toThrow();
			} );

			it( 'should not react twice to a single width change after the view re-renders', async () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				const domRoot = editor.editing.view.getDomRoot( 'main' );

				await nextFrame();
				onResize.mockClear();

				editor.editing.view.fire( 'render' );

				await resizeTo( domRoot, 500 );

				expect( onResize ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should stop reacting to width changes once the returned cleanup callback is called', async () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				const domRoot = editor.editing.view.getDomRoot( 'main' );

				await nextFrame();
				onResize.mockClear();

				stopWatching();
				stopWatching = null;

				await resizeTo( domRoot, 999 );

				expect( onResize ).not.toHaveBeenCalled();
			} );

			it( 'should not throw when the cleanup callback is called after the editor was destroyed', async () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				await editor.destroy();
				editor = null;

				expect( () => {
					stopWatching();
					stopWatching = null;
				} ).not.toThrow();
			} );
		} );

		describe( 'multi-root editor', () => {
			let editor, onResize, fooElement, barElement, attachedElements;

			beforeEach( async () => {
				fooElement = document.createElement( 'div' );
				barElement = document.createElement( 'div' );

				document.body.appendChild( fooElement );
				document.body.appendChild( barElement );

				attachedElements = [];

				editor = await MultiRootEditor.create( {
					plugins: [ TableEditing, Paragraph ],
					roots: {
						foo: { element: fooElement },
						bar: { element: barElement }
					}
				} );

				editor.on( 'addRoot', ( evt, root ) => {
					if ( editor.editing.view.getDomRoot( root.rootName ) ) {
						return;
					}

					const domElement = editor.createEditable( root );

					document.body.appendChild( domElement );
					attachedElements.push( domElement );
				} );

				editor.on( 'detachRoot', ( evt, root ) => {
					editor.detachEditable( root ).remove();
				} );

				onResize = vi.fn();
			} );

			afterEach( async () => {
				if ( editor ) {
					await editor.destroy();
				}

				fooElement.remove();
				barElement.remove();

				for ( const domElement of attachedElements ) {
					domElement.remove();
				}
			} );

			it( 'should call the callback independently for each root that changes width', async () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				const domRootFoo = editor.editing.view.getDomRoot( 'foo' );
				const domRootBar = editor.editing.view.getDomRoot( 'bar' );

				await nextFrame();
				onResize.mockClear();

				await resizeTo( domRootFoo, 320 );
				await resizeTo( domRootBar, 640 );

				expect( onResize ).toHaveBeenCalledTimes( 2 );
			} );

			it( 'should react to width changes on a root added dynamically via addRoot()', async () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				editor.addRoot( 'baz', { initialData: '' } );

				const domRootBaz = editor.editing.view.getDomRoot( 'baz' );

				await nextFrame();
				onResize.mockClear();

				await resizeTo( domRootBaz, 250 );

				expect( onResize ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should stop reacting to width changes on a root once it is detached', async () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				const domRootFoo = editor.editing.view.getDomRoot( 'foo' );

				await nextFrame();
				onResize.mockClear();

				editor.detachRoot( 'foo' );

				await nextFrame();
				onResize.mockClear();

				await resizeTo( domRootFoo, 111 );

				expect( onResize ).not.toHaveBeenCalled();
			} );

			it( 'should stop reacting for every root once the returned cleanup callback is called', async () => {
				stopWatching = watchRootsWidthResize( editor.editing.view, onResize );

				const domRootFoo = editor.editing.view.getDomRoot( 'foo' );
				const domRootBar = editor.editing.view.getDomRoot( 'bar' );

				await nextFrame();
				onResize.mockClear();

				stopWatching();
				stopWatching = null;

				await resizeTo( domRootFoo, 111 );
				await resizeTo( domRootBar, 222 );

				expect( onResize ).not.toHaveBeenCalled();
			} );
		} );

		function nextFrame() {
			return new Promise( resolve => requestAnimationFrame( () => requestAnimationFrame( resolve ) ) );
		}

		async function resizeTo( element, width ) {
			element.style.width = `${ width }px`;

			await nextFrame();
		}
	} );
} );
