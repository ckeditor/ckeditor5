/*
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Input from '../src/input';

import Batch from '@ckeditor/ckeditor5-engine/src/model/batch';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';

import ViewText from '@ckeditor/ckeditor5-engine/src/view/text';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import ViewSelection from '@ckeditor/ckeditor5-engine/src/view/selection';

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'Input feature', () => {
	let editor, model, modelRoot, view, viewRoot, listenter;

	testUtils.createSinonSandbox();

	before( () => {
		listenter = Object.create( EmitterMixin );

		return VirtualTestEditor.create( {
				plugins: [ Input, Paragraph ]
			} )
			.then( newEditor => {
				// Mock image feature.
				newEditor.document.schema.registerItem( 'image', '$inline' );

				buildModelConverter().for( newEditor.data.modelToView, newEditor.editing.modelToView )
					.fromElement( 'image' )
					.toElement( 'img' );

				buildViewConverter().for( newEditor.data.viewToModel )
					.fromElement( 'img' )
					.toElement( 'image' );

				editor = newEditor;
				model = editor.editing.model;
				modelRoot = model.getRoot();
				view = editor.editing.view;
				viewRoot = view.getRoot();
			} );
	} );

	beforeEach( () => {
		editor.setData( '<p>foobar</p>' );

		model.enqueueChanges( () => {
			model.selection.setRanges( [
				ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 3, modelRoot.getChild( 0 ), 3 )
			] );
		} );
	} );

	afterEach( () => {
		listenter.stopListening();
	} );

	describe( 'mutations handling', () => {
		it( 'should handle text mutation', () => {
			view.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foobar',
					newText: 'fooxbar',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foox[]bar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foox{}bar</p>' );
		} );

		it( 'should handle text mutation change', () => {
			view.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foobar',
					newText: 'foodar',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>food[]ar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>food{}ar</p>' );
		} );

		it( 'should handle text node insertion', () => {
			editor.setData( '<p></p>' );

			view.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( 'x' ) ],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>x[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>x{}</p>' );
		} );

		it( 'should do nothing when two nodes were inserted', () => {
			editor.setData( '<p></p>' );

			view.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( 'x' ), new ViewElement( 'img' ) ],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>[]</p>' );
		} );

		it( 'should do nothing when two nodes were inserted and one removed', () => {
			view.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [ new ViewText( 'foobar' ) ],
					newChildren: [ new ViewText( 'x' ), new ViewElement( 'img' ) ],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foo{}bar</p>' );
		} );

		it( 'should handle multiple children in the node', () => {
			editor.setData( '<p>foo<img></img></p>' );

			view.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [ new ViewText( 'foo' ), viewRoot.getChild( 0 ).getChild( 1 ) ],
					newChildren: [ new ViewText( 'foo' ), viewRoot.getChild( 0 ).getChild( 1 ), new ViewText( 'x' ) ],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo<image></image>x[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foo<img></img>x{}</p>' );
		} );

		it( 'should do nothing when node was removed', () => {
			view.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [ new ViewText( 'foobar' ) ],
					newChildren: [],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foo{}bar</p>' );
		} );

		it( 'should do nothing when element was inserted', () => {
			editor.setData( '<p></p>' );

			view.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewElement( 'img' ) ],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>[]</p>' );
		} );

		it( 'should set model selection appropriately to view selection passed in mutations event', () => {
			// This test case emulates spellchecker correction.

			const viewSelection = new ViewSelection();
			viewSelection.collapse( viewRoot.getChild( 0 ).getChild( 0 ), 6 );

			view.fire( 'mutations',
				[ {
					type: 'text',
					oldText: 'foobar',
					newText: 'foodar',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				} ],
				viewSelection
			);

			expect( getModelData( model ) ).to.equal( '<paragraph>foodar[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foodar{}</p>' );
		} );

		it( 'should use up to one insert and remove operations (spellchecker)', () => {
			// This test case emulates spellchecker correction.

			const viewSelection = new ViewSelection();
			viewSelection.collapse( viewRoot.getChild( 0 ).getChild( 0 ), 6 );

			testUtils.sinon.spy( Batch.prototype, 'weakInsert' );
			testUtils.sinon.spy( Batch.prototype, 'remove' );

			view.fire( 'mutations',
				[ {
					type: 'text',
					oldText: 'foobar',
					newText: 'fxobxr',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				} ],
				viewSelection
			);

			expect( Batch.prototype.weakInsert.calledOnce ).to.be.true;
			expect( Batch.prototype.remove.calledOnce ).to.be.true;
		} );

		it( 'should place selection after when correcting to longer word (spellchecker)', () => {
			// This test case emulates spellchecker correction.
			editor.setData( '<p>Foo hous a</p>' );

			const viewSelection = new ViewSelection();
			viewSelection.collapse( viewRoot.getChild( 0 ).getChild( 0 ), 9 );

			view.fire( 'mutations',
				[ {
					type: 'text',
					oldText: 'Foo hous a',
					newText: 'Foo house a',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				} ],
				viewSelection
			);

			expect( getModelData( model ) ).to.equal( '<paragraph>Foo house[] a</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>Foo house{} a</p>' );
		} );

		it( 'should place selection after when correcting to shorter word (spellchecker)', () => {
			// This test case emulates spellchecker correction.
			editor.setData( '<p>Bar athat foo</p>' );

			const viewSelection = new ViewSelection();
			viewSelection.collapse( viewRoot.getChild( 0 ).getChild( 0 ), 8 );

			view.fire( 'mutations',
				[ {
					type: 'text',
					oldText: 'Bar athat foo',
					newText: 'Bar that foo',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				} ],
				viewSelection
			);

			expect( getModelData( model ) ).to.equal( '<paragraph>Bar that[] foo</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>Bar that{} foo</p>' );
		} );

		it( 'should place selection after when merging two words (spellchecker)', () => {
			// This test case emulates spellchecker correction.
			editor.setData( '<p>Foo hous e</p>' );

			const viewSelection = new ViewSelection();
			viewSelection.collapse( viewRoot.getChild( 0 ).getChild( 0 ), 9 );

			view.fire( 'mutations',
				[ {
					type: 'text',
					oldText: 'Foo hous e',
					newText: 'Foo house',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				} ],
				viewSelection
			);

			expect( getModelData( model ) ).to.equal( '<paragraph>Foo house[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>Foo house{}</p>' );
		} );

		it( 'should replace last &nbsp; with space', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 6, modelRoot.getChild( 0 ), 6 )
				] );
			} );

			view.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foobar',
					newText: 'foobar\u00A0',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foobar []</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foobar {}</p>' );
		} );

		it( 'should replace first &nbsp; with space', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 0, modelRoot.getChild( 0 ), 0 )
				] );
			} );

			view.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foobar',
					newText: '\u00A0foobar',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph> []foobar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p> {}foobar</p>' );
		} );

		it( 'should replace all &nbsp; with spaces', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 6, modelRoot.getChild( 0 ), 6 )
				] );
			} );

			view.fire( 'mutations', [
				{
					type: 'text',
					oldText: 'foobar',
					newText: 'foobar\u00A0\u00A0\u00A0baz',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foobar   baz[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foobar   baz{}</p>' );
		} );
	} );

	describe( 'keystroke handling', () => {
		it( 'should remove contents', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			listenter.listenTo( view, 'keydown', () => {
				expect( getModelData( model ) ).to.equal( '<paragraph>fo[]ar</paragraph>' );

				view.fire( 'mutations', [
					{
						type: 'text',
						oldText: 'foar',
						newText: 'foyar',
						node: viewRoot.getChild( 0 ).getChild( 0 )
					}
				] );
			}, { priority: 'lowest' } );

			view.fire( 'keydown', { keyCode: getCode( 'y' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foy[]ar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foy{}ar</p>' );
		} );

		it( 'should do nothing on arrow key', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { keyCode: getCode( 'arrowright' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should do nothing on ctrl combinations', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { ctrlKey: true, keyCode: getCode( 'c' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should do nothing on non printable keys', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { keyCode: 16 } ); // Shift
			view.fire( 'keydown', { keyCode: 35 } ); // Home
			view.fire( 'keydown', { keyCode: 112 } ); // F1

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		// #69
		it( 'should do nothing on tab key', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { keyCode: 9 } ); // Tab

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[ob]ar</paragraph>' );
		} );

		it( 'should do nothing if selection is collapsed', () => {
			view.fire( 'keydown', { ctrlKey: true, keyCode: getCode( 'c' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
		} );

		it( 'should lock buffer if selection is not collapsed', () => {
			const buffer = editor.commands.get( 'input' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { keyCode: getCode( 'y' ) } );

			expect( lockSpy.calledOnce ).to.be.true;
			expect( unlockSpy.calledOnce ).to.be.true;
		} );

		it( 'should not lock buffer on non printable keys', () => {
			const buffer = editor.commands.get( 'input' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			view.fire( 'keydown', { keyCode: 16 } ); // Shift
			view.fire( 'keydown', { keyCode: 35 } ); // Home
			view.fire( 'keydown', { keyCode: 112 } ); // F1

			expect( lockSpy.callCount ).to.be.equal( 0 );
			expect( unlockSpy.callCount ).to.be.equal( 0 );
		} );

		it( 'should not lock buffer on collapsed selection', () => {
			const buffer = editor.commands.get( 'input' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			view.fire( 'keydown', { keyCode: getCode( 'b' ) } );
			view.fire( 'keydown', { keyCode: getCode( 'a' ) } );
			view.fire( 'keydown', { keyCode: getCode( 'z' ) } );

			expect( lockSpy.callCount ).to.be.equal( 0 );
			expect( unlockSpy.callCount ).to.be.equal( 0 );
		} );
	} );
} );

