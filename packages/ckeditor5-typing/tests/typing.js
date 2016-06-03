/*
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import VirtualTestEditor from '/tests/ckeditor5/_utils/virtualtesteditor.js';
import Typing from '/ckeditor5/typing/typing.js';
import Paragraph from '/ckeditor5/paragraph/paragraph.js';

import ModelRange from '/ckeditor5/engine/model/range.js';

import ViewText from '/ckeditor5/engine/view/text.js';
import ViewElement from '/ckeditor5/engine/view/element.js';

import EmitterMixin from '/ckeditor5/utils/emittermixin.js';
import { getCode } from '/ckeditor5/utils/keyboard.js';

import { getData as getModelData } from '/tests/engine/_utils/model.js';
import { getData as getViewData } from '/tests/engine/_utils/view.js';

describe( 'Typing feature', () => {
	let editor, model, modelRoot, view, viewRoot, listenter;

	before( () => {
		listenter = Object.create( EmitterMixin );

		return VirtualTestEditor.create( {
				features: [ Typing, Paragraph ]
			} )
			.then( newEditor => {
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
				ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 3, modelRoot.getChild( 0 ), 3 ) ] );
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

			expect( getModelData( model ) ).to.equal( '<paragraph>foox<selection />bar</paragraph>' );
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

			expect( getModelData( model ) ).to.equal( '<paragraph>food<selection />ar</paragraph>' );
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

			expect( getModelData( model ) ).to.equal( '<paragraph>x<selection /></paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>x{}</p>' );
		} );

		it( 'should do nothing when two nodes where inserted', () => {
			editor.setData( '<p></p>' );

			view.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( 'x' ), new ViewElement( 'img' ) ],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph></paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p></p>' );
		} );

		it( 'should do nothing when node was removed', () => {
			view.fire( 'mutations', [
				{
					type: 'children',
					oldChildren: [ viewRoot.getChild( 0 ).getChild( 0 ) ],
					newChildren: [],
					node: viewRoot.getChild( 0 )
				}
			] );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo<selection />bar</paragraph>' );
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

			expect( getModelData( model ) ).to.equal( '<paragraph></paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p></p>' );
		} );
	} );

	describe( 'keystroke handling', () => {
		it( 'should remove contents', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			listenter.listenTo( view, 'keydown', () => {
				expect( getModelData( model ) ).to.equal( '<paragraph>fo<selection />ar</paragraph>' );

				view.fire( 'mutations', [
					{
						type: 'text',
						oldText: 'foar',
						newText: 'foyar',
						node: viewRoot.getChild( 0 ).getChild( 0 )
					}
				] );
			}, null, 1000000 );

			view.fire( 'keydown', { keyCode: getCode( 'y' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foy<selection />ar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foy{}ar</p>' );
		} );

		it( 'should do nothing on arrow key', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { keyCode: getCode( 'arrowright' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>fo<selection>ob</selection>ar</paragraph>' );
		} );

		it( 'should do nothing on ctrl combinations', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { ctrlKey: true, keyCode: getCode( 'c' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>fo<selection>ob</selection>ar</paragraph>' );
		} );

		it( 'should do nothing on non printable keys', () => {
			model.enqueueChanges( () => {
				model.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 2, modelRoot.getChild( 0 ), 4 ) ] );
			} );

			view.fire( 'keydown', { keyCode: 16 } ); // Shift
			view.fire( 'keydown', { keyCode: 35 } ); // Home
			view.fire( 'keydown', { keyCode: 112 } ); // F1

			expect( getModelData( model ) ).to.equal( '<paragraph>fo<selection>ob</selection>ar</paragraph>' );
		} );

		it( 'should do nothing if selection is collapsed', () => {
			view.fire( 'keydown', { ctrlKey: true, keyCode: getCode( 'c' ) } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo<selection />bar</paragraph>' );
		} );
	} );

	describe( 'destroy', () => {
		it( 'should destroy change buffer', () => {
			const typing = new Typing( new VirtualTestEditor() );
			typing.init();

			const destroy = typing._buffer.destroy = sinon.spy();

			typing.destroy();

			expect( destroy.calledOnce ).to.be.true;
			expect( typing._buffer ).to.be.null;
		} );
	} );
} );

