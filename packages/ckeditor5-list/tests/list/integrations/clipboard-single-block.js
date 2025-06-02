/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListEditing from '../../../src/list/listediting.js';
import { isListItemBlock } from '../../../src/list/utils/model.js';
import { modelList } from '../_utils/utils.js';

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import {
	getData as getModelData,
	parse as parseModel,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import stubUid from '../_utils/uid.js';

describe( 'ListEditing (multiBlock=false) integrations: clipboard copy & paste', () => {
	let element, editor, model, modelDoc, modelRoot, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [
				Paragraph, ClipboardPipeline, BoldEditing, ListEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing, ImageBlockEditing, ImageInlineEditing, Widget
			],
			list: {
				multiBlock: false
			}
		} );

		model = editor.model;
		modelDoc = model.document;
		modelRoot = modelDoc.getRoot();

		view = editor.editing.view;

		model.schema.extend( 'paragraph', {
			allowAttributes: 'foo'
		} );

		// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => { } );
		stubUid();
		modelList.defaultBlock = 'listItem';
	} );

	afterEach( async () => {
		element.remove();
		modelList.defaultBlock = 'paragraph';

		await editor.destroy();
	} );

	describe( 'copy and getSelectedContent()', () => {
		it( 'should be able to downcast part of a nested list', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A</listItem>' +
				'[<listItem listType="bulleted" listItemId="b" listIndent="1">B1</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="1">B2</listItem>' +
				'<listItem listType="bulleted" listItemId="d" listIndent="2">C1</listItem>]' +
				'<listItem listType="bulleted" listItemId="e" listIndent="2">C2</listItem>'
			);

			const modelFragment = model.getSelectedContent( model.document.selection );
			const viewFragment = editor.data.toView( modelFragment, { skipListItemIds: true } );
			const data = editor.data.htmlProcessor.toData( viewFragment );

			expect( data ).to.equal(
				'<ul>' +
					'<li>B1</li>' +
					'<li>B2' +
						'<ul>' +
							'<li>C1</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);
		} );

		it( 'should be able to downcast part of a deep nested list', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B1</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="1">B2</listItem>' +
				'[<listItem listType="bulleted" listItemId="d" listIndent="2">C1</listItem>' +
				'<listItem listType="bulleted" listItemId="e" listIndent="2">C2</listItem>]'
			);

			const modelFragment = model.getSelectedContent( model.document.selection );
			const viewFragment = editor.data.toView( modelFragment, { skipListItemIds: true } );
			const data = editor.data.htmlProcessor.toData( viewFragment );

			expect( data ).to.equal(
				'<ul>' +
					'<li>C1</li>' +
					'<li>C2</li>' +
				'</ul>'
			);
		} );

		describe( 'UX enhancements', () => {
			describe( 'preserving list structure when a cross-list item selection existed', () => {
				it( 'should return a list structure, if more than a single list item was selected', () => {
					setModelData( model, modelList( [
						'* Fo[o',
						'* Ba]r'
					] ) );

					const modelFragment = model.getSelectedContent( model.document.selection );

					expect( modelFragment.childCount ).to.equal( 2 );
					expect( Array.from( modelFragment.getChildren() ).every( isListItemBlock ) ).to.be.true;
				} );

				it( 'should return a list structure, if a nested items were included in the selection', () => {
					setModelData( model, modelList( [
						'* Fo[o',
						'  Bar',
						'  * B]az'
					] ) );

					const modelFragment = model.getSelectedContent( model.document.selection );

					expect( modelFragment.childCount ).to.equal( 3 );
					expect( Array.from( modelFragment.getChildren() ).every( isListItemBlock ) ).to.be.true;
				} );

				// Note: This test also verifies support for arbitrary selection passed to getSelectedContent().
				it( 'should return a list structure, if multiple list items were selected from the outside', () => {
					setModelData( model, modelList( [
						'* Foo',
						'* Bar'
					] ) );

					// [* Foo
					//  * Bar]
					//
					// Note: It is impossible to set a document selection like this because the postfixer will normalize it to
					// * [Foo
					// * Bar]
					const modelFragment = model.getSelectedContent( model.createSelection( model.document.getRoot(), 'in' ) );

					expect( modelFragment.childCount ).to.equal( 2 );
					expect( Array.from( modelFragment.getChildren() ).every( isListItemBlock ) ).to.be.true;
				} );
			} );
		} );
	} );

	describe( 'paste and insertContent() integration', () => {
		it( 'should be triggered on DataController#insertContent()', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="2">C</listItem>'
			);

			editor.model.insertContent(
				parseModel(
					'<listItem listType="bulleted" listItemId="x" listIndent="0">X</listItem>' +
					'<listItem listType="bulleted" listItemId="y" listIndent="1">Y</listItem>',
					model.schema
				)
			);

			expect( getModelData( model ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">BX</listItem>' +
				'<listItem listIndent="2" listItemId="y" listType="bulleted">Y[]</listItem>' +
				'<listItem listIndent="2" listItemId="c" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should be triggered when selectable is passed', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="2">C</listItem>'
			);

			model.insertContent(
				parseModel(
					'<listItem listType="bulleted" listItemId="x" listIndent="0">X</listItem>' +
					'<listItem listType="bulleted" listItemId="y" listIndent="1">Y</listItem>',
					model.schema
				),
				model.createRange(
					model.createPositionFromPath( modelRoot, [ 1, 1 ] ),
					model.createPositionFromPath( modelRoot, [ 1, 1 ] )
				)
			);

			expect( getModelData( model ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">B[]X</listItem>' +
				'<listItem listIndent="2" listItemId="y" listType="bulleted">Y</listItem>' +
				'<listItem listIndent="2" listItemId="c" listType="bulleted">C</listItem>'
			);
		} );

		// Just checking that it doesn't crash. #69
		it( 'should work if an element is passed to DataController#insertContent()', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="2">C</listItem>'
			);

			model.change( writer => {
				const item = writer.createElement( 'listItem', { listType: 'bulleted', listItemId: 'x', listIndent: '0' } );
				writer.insertText( 'X', item );

				model.insertContent( item );
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">BX[]</listItem>' +
				'<listItem listIndent="2" listItemId="c" listType="bulleted">C</listItem>'
			);
		} );

		// Just checking that it doesn't crash. #69
		it( 'should work if an element is passed to DataController#insertContent() - case #69', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="2">C</listItem>'
			);

			model.change( writer => {
				model.insertContent( writer.createText( 'X' ) );
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">BX[]</listItem>' +
				'<listItem listIndent="2" listItemId="c" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should fix indents of pasted list items', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="2">C</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>X<ul><li>Y</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">BX</listItem>' +
				'<listItem listIndent="2" listItemId="a00" listType="bulleted">Y[]</listItem>' +
				'<listItem listIndent="2" listItemId="c" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should not fix indents of list items that are separated by non-list element', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="2">C</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>W<ul><li>X</li></ul></li></ul><p>Y</p><ul><li>Z</li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">BW</listItem>' +
				'<listItem listIndent="2" listItemId="a00" listType="bulleted">X</listItem>' +
				'<listItem listIndent="1" listItemId="a03" listType="bulleted">Y</listItem>' +
				'<listItem listIndent="1" listItemId="a02" listType="bulleted">Z[]</listItem>' +
				'<listItem listIndent="2" listItemId="c" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should co-work correctly with post fixer', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="2">C</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<p>X</p><ul><li>Y</li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">BX</listItem>' +
				'<listItem listIndent="1" listItemId="a00" listType="bulleted">Y[]</listItem>' +
				'<listItem listIndent="2" listItemId="c" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should work if items are pasted between paragraph elements', () => {
			// Wrap all changes in one block to avoid post-fixing the selection
			// (which may be incorret) in the meantime.
			model.change( () => {
				setModelData( model,
					'<listItem listType="bulleted" listItemId="a" listIndent="0">A</listItem>' +
					'<listItem listType="bulleted" listItemId="b" listIndent="1">B</listItem>[]' +
					'<listItem listType="bulleted" listItemId="c" listIndent="2">C</listItem>'
				);

				const clipboard = editor.plugins.get( 'ClipboardPipeline' );

				clipboard.fire( 'inputTransformation', {
					content: parseView( '<ul><li>X<ul><li>Y</li></ul></li></ul>' )
				} );
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">B</listItem>' +
				'<listItem listIndent="1" listItemId="a01" listType="bulleted">X</listItem>' +
				'<listItem listIndent="2" listItemId="a00" listType="bulleted">Y[]</listItem>' +
				'<listItem listIndent="2" listItemId="c" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should create correct model when list items are pasted in top-level list', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A[]</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>X<ul><li>Y</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">AX</listItem>' +
				'<listItem listIndent="1" listItemId="a00" listType="bulleted">Y[]</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">B</listItem>'
			);
		} );

		it( 'should create correct model when list items are pasted in non-list context', () => {
			setModelData( model,
				'<paragraph>A[]</paragraph>' +
				'<paragraph>B</paragraph>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>X<ul><li>Y</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph>AX</paragraph>' +
				'<listItem listIndent="0" listItemId="a00" listType="bulleted">Y[]</listItem>' +
				'<paragraph>B</paragraph>'
			);
		} );

		it( 'should not crash when "empty content" is inserted', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			expect( () => {
				model.change( writer => {
					editor.model.insertContent( writer.createDocumentFragment() );
				} );
			} ).not.to.throw();
		} );

		it( 'should correctly handle item that is pasted between list items without its parent', () => {
			// Wrap all changes in one block to avoid post-fixing the selection
			// (which may be incorret) in the meantime.
			model.change( () => {
				setModelData( model,
					'<paragraph>Foo</paragraph>' +
					'<listItem listType="numbered" listItemId="a" listIndent="0">A</listItem>' +
					'<listItem listType="numbered" listItemId="b" listIndent="1">B</listItem>' +
					'[]' +
					'<listItem listType="numbered" listItemId="c" listIndent="1">C</listItem>' +
					'<paragraph>Bar</paragraph>'
				);

				const clipboard = editor.plugins.get( 'ClipboardPipeline' );

				clipboard.fire( 'inputTransformation', {
					content: parseView( '<li>X</li>' )
				} );
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph>Foo</paragraph>' +
				'<listItem listIndent="0" listItemId="a" listType="numbered">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="numbered">B</listItem>' +
				'<listItem listIndent="1" listItemId="a00" listType="numbered">X[]</listItem>' +
				'<listItem listIndent="1" listItemId="c" listType="numbered">C</listItem>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should correctly handle item that is pasted between list items without its parent #2', () => {
			// Wrap all changes in one block to avoid post-fixing the selection
			// (which may be incorret) in the meantime.
			model.change( () => {
				setModelData( model,
					'<paragraph>Foo</paragraph>' +
					'<listItem listType="numbered" listItemId="a" listIndent="0">A</listItem>' +
					'<listItem listType="numbered" listItemId="b" listIndent="1">B</listItem>' +
					'[]' +
					'<listItem listType="numbered" listItemId="c" listIndent="1">C</listItem>' +
					'<paragraph>Bar</paragraph>'
				);

				const clipboard = editor.plugins.get( 'ClipboardPipeline' );

				clipboard.fire( 'inputTransformation', {
					content: parseView( '<li>X<ul><li>Y</li></ul></li>' )
				} );
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph>Foo</paragraph>' +
				'<listItem listIndent="0" listItemId="a" listType="numbered">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="numbered">B</listItem>' +
				'<listItem listIndent="1" listItemId="a01" listType="numbered">X</listItem>' +
				'<listItem listIndent="2" listItemId="a00" listType="numbered">Y[]</listItem>' +
				'<listItem listIndent="1" listItemId="c" listType="numbered">C</listItem>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should correctly handle item that is pasted after last list item without its parent', () => {
			// Wrap all changes in one block to avoid post-fixing the selection
			// (which may be incorret) in the meantime.
			model.change( () => {
				setModelData( model,
					'<paragraph>Foo</paragraph>' +
					'<listItem listType="numbered" listItemId="a" listIndent="0">A</listItem>' +
					'<listItem listType="numbered" listItemId="b" listIndent="1">B</listItem>' +
					'[]' +
					'<paragraph>Bar</paragraph>'
				);

				const clipboard = editor.plugins.get( 'ClipboardPipeline' );

				clipboard.fire( 'inputTransformation', {
					content: parseView( '<li>X</li>' )
				} );
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph>Foo</paragraph>' +
				'<listItem listIndent="0" listItemId="a" listType="numbered">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="numbered">B</listItem>' +
				'<listItem listIndent="0" listItemId="a00" listType="bulleted">X[]</listItem>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should correctly handle item that is pasted after last list item without its parent #2', () => {
			// Wrap all changes in one block to avoid post-fixing the selection
			// (which may be incorret) in the meantime.
			model.change( () => {
				setModelData( model,
					'<paragraph>Foo</paragraph>' +
					'<listItem listType="numbered" listItemId="a" listIndent="0">A</listItem>' +
					'<listItem listType="numbered" listItemId="b" listIndent="1">B</listItem>' +
					'[]' +
					'<paragraph>Bar</paragraph>'
				);

				const clipboard = editor.plugins.get( 'ClipboardPipeline' );

				clipboard.fire( 'inputTransformation', {
					content: parseView( '<li>X<ul><li>Y</li></ul></li>' )
				} );
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph>Foo</paragraph>' +
				'<listItem listIndent="0" listItemId="a" listType="numbered">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="numbered">B</listItem>' +
				'<listItem listIndent="0" listItemId="a01" listType="bulleted">X</listItem>' +
				'<listItem listIndent="1" listItemId="a00" listType="bulleted">Y[]</listItem>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should handle block elements inside pasted list #1', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="2">C</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>W<ul><li>X<p>Y</p>Z</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">BW</listItem>' +
				'<listItem listIndent="2" listItemId="a00" listType="bulleted">X</listItem>' +
				'<listItem listIndent="2" listItemId="a02" listType="bulleted">Y</listItem>' +
				'<listItem listIndent="2" listItemId="a03" listType="bulleted">Z[]</listItem>' +
				'<listItem listIndent="2" listItemId="c" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should handle block elements inside pasted list #2', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A[]</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="2">C</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>W<ul><li>X<p>Y</p>Z</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">AW</listItem>' +
				'<listItem listIndent="1" listItemId="a00" listType="bulleted">X</listItem>' +
				'<listItem listIndent="1" listItemId="a02" listType="bulleted">Y</listItem>' +
				'<listItem listIndent="1" listItemId="a03" listType="bulleted">Z[]</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">B</listItem>' +
				'<listItem listIndent="2" listItemId="c" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should handle block elements inside pasted list #3', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A[]</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="2">C</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li><p>W</p><p>X</p><p>Y</p></li><li>Z</li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">AW</listItem>' +
				'<listItem listIndent="0" listItemId="a00" listType="bulleted">X</listItem>' +
				'<listItem listIndent="0" listItemId="a02" listType="bulleted">Y</listItem>' +
				'<listItem listIndent="0" listItemId="a01" listType="bulleted">Z[]</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">B</listItem>' +
				'<listItem listIndent="2" listItemId="c" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should properly handle split of list items with non-standard converters', () => {
			setModelData( model,
				'<listItem listType="bulleted" listItemId="a" listIndent="0">A[]</listItem>' +
				'<listItem listType="bulleted" listItemId="b" listIndent="1">B</listItem>' +
				'<listItem listType="bulleted" listItemId="c" listIndent="2">C</listItem>'
			);

			editor.model.schema.register( 'splitBlock', { allowWhere: '$block' } );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'splitBlock', view: 'splitBlock' } );
			editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:splitBlock', ( evt, data, conversionApi ) => {
				const splitBlock = conversionApi.writer.createElement( 'splitBlock' );

				conversionApi.consumable.consume( data.viewItem, { name: true } );
				conversionApi.safeInsert( splitBlock, data.modelCursor );
				conversionApi.updateConversionResult( splitBlock, data );
			} ) );

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>a<splitBlock></splitBlock>b</li></ul>' )
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a" listType="bulleted">Aa</listItem>' +
				'<splitBlock></splitBlock>' +
				'<listItem listIndent="0" listItemId="a00" listType="bulleted">b</listItem>' +
				'<listItem listIndent="1" listItemId="b" listType="bulleted">B</listItem>' +
				'<listItem listIndent="2" listItemId="c" listType="bulleted">C</listItem>'
			);
		} );
	} );
} );
