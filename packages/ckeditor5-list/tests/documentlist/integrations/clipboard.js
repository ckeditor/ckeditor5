/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentListEditing from '../../../src/documentlist/documentlistediting';

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import {
	getData as getModelData,
	parse as parseModel,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import stubUid from '../_utils/uid';

describe( 'DocumentListEditing integrations: clipboard copy & paste', () => {
	let editor, model, modelDoc, modelRoot, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				Paragraph, ClipboardPipeline, BoldEditing, DocumentListEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing
			]
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
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'copy and getSelectedContent()', () => {
		it( 'should be able to downcast part of a nested list', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>' +
				'[<paragraph listType="bulleted" listItemId="b" listIndent="1">B1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B2</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C1</paragraph>]' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C2</paragraph>'
			);

			const modelFragment = model.getSelectedContent( model.document.selection );
			const viewFragment = editor.data.toView( modelFragment );
			const data = editor.data.htmlProcessor.toData( viewFragment );

			expect( data ).to.equal(
				'<ul>' +
				'<li>' +
				'<p>B1</p>' +
				'<p>B2</p>' +
				'<ul>' +
				'<li>C1</li>' +
				'</ul>' +
				'</li>' +
				'</ul>'
			);
		} );

		it( 'should be able to downcast part of a deep nested list', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B2</paragraph>' +
				'[<paragraph listType="bulleted" listItemId="c" listIndent="2">C1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C2</paragraph>]'
			);

			const modelFragment = model.getSelectedContent( model.document.selection );
			const viewFragment = editor.data.toView( modelFragment );
			const data = editor.data.htmlProcessor.toData( viewFragment );

			expect( data ).to.equal(
				'<ul>' +
				'<li>' +
				'<p>C1</p>' +
				'<p>C2</p>' +
				'</li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'paste and insertContent() integration', () => {
		it( 'should be triggered on DataController#insertContent()', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B[]</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>'
			);

			editor.model.insertContent(
				parseModel(
					'<paragraph listType="bulleted" listItemId="x" listIndent="0">X</paragraph>' +
					'<paragraph listType="bulleted" listItemId="y" listIndent="1">Y</paragraph>',
					model.schema
				)
			);

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">A</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">BX</paragraph>' +
				'<paragraph listIndent="2" listItemId="y" listType="bulleted">Y[]</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">C</paragraph>'
			);
		} );

		it( 'should be triggered when selectable is passed', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B[]</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>'
			);

			model.insertContent(
				parseModel(
					'<paragraph listType="bulleted" listItemId="x" listIndent="0">X</paragraph>' +
					'<paragraph listType="bulleted" listItemId="y" listIndent="1">Y</paragraph>',
					model.schema
				),
				model.createRange(
					model.createPositionFromPath( modelRoot, [ 1, 1 ] ),
					model.createPositionFromPath( modelRoot, [ 1, 1 ] )
				)
			);

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">A</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">B[]X</paragraph>' +
				'<paragraph listIndent="2" listItemId="y" listType="bulleted">Y</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">C</paragraph>'
			);
		} );

		// Just checking that it doesn't crash. #69
		it( 'should work if an element is passed to DataController#insertContent()', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B[]</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>'
			);

			model.change( writer => {
				const paragraph = writer.createElement( 'paragraph', { listType: 'bulleted', listItemId: 'x', listIndent: '0' } );
				writer.insertText( 'X', paragraph );

				model.insertContent( paragraph );
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">A</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">BX[]</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">C</paragraph>'
			);
		} );

		// Just checking that it doesn't crash. #69
		it( 'should work if an element is passed to DataController#insertContent() - case #69', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B[]</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>'
			);

			model.change( writer => {
				model.insertContent( writer.createText( 'X' ) );
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">A</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">BX[]</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">C</paragraph>'
			);
		} );

		it( 'should fix indents of pasted list items', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B[]</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>X<ul><li>Y</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">A</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">BX</paragraph>' +
				'<paragraph listIndent="2" listItemId="a00" listType="bulleted">Y[]</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">C</paragraph>'
			);
		} );

		it( 'should not fix indents of list items that are separated by non-list element', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B[]</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>W<ul><li>X</li></ul></li></ul><p>Y</p><ul><li>Z</li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">A</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">BW</paragraph>' +
				'<paragraph listIndent="2" listItemId="a00" listType="bulleted">X</paragraph>' +
				'<paragraph>Y</paragraph>' +
				'<paragraph listIndent="0" listItemId="a02" listType="bulleted">Z[]</paragraph>' +
				'<paragraph listIndent="1" listItemId="c" listType="bulleted">C</paragraph>'
			);
		} );

		it( 'should co-work correctly with post fixer', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B[]</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<p>X</p><ul><li>Y</li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">A</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">BX</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Y[]</paragraph>' +
				'<paragraph listIndent="1" listItemId="c" listType="bulleted">C</paragraph>'
			);
		} );

		it( 'should work if items are pasted between paragraph elements', () => {
			// Wrap all changes in one block to avoid post-fixing the selection
			// (which may be incorret) in the meantime.
			model.change( () => {
				setModelData( model,
					'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>' +
					'<paragraph listType="bulleted" listItemId="b" listIndent="1">B</paragraph>[]' +
					'<paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>'
				);

				const clipboard = editor.plugins.get( 'ClipboardPipeline' );

				clipboard.fire( 'inputTransformation', {
					content: parseView( '<ul><li>X<ul><li>Y</li></ul></li></ul>' )
				} );
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">A</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">B</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="bulleted">X</paragraph>' +
				'<paragraph listIndent="2" listItemId="a00" listType="bulleted">Y[]</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">C</paragraph>'
			);
		} );

		it( 'should create correct model when list items are pasted in top-level list', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A[]</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B</paragraph>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>X<ul><li>Y</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">AX</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="bulleted">Y[]</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">B</paragraph>'
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
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Y[]</paragraph>' +
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

		it( 'should correctly handle item that is pasted without its parent', () => {
			// Wrap all changes in one block to avoid post-fixing the selection
			// (which may be incorret) in the meantime.
			model.change( () => {
				setModelData( model,
					'<paragraph>Foo</paragraph>' +
					'<paragraph listType="numbered" listItemId="a" listIndent="0">A</paragraph>' +
					'<paragraph listType="numbered" listItemId="b" listIndent="1">B</paragraph>' +
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
				'<paragraph listIndent="0" listItemId="a" listType="numbered">A</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="numbered">B</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="bulleted">X[]</paragraph>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should correctly handle item that is pasted without its parent #2', () => {
			// Wrap all changes in one block to avoid post-fixing the selection
			// (which may be incorret) in the meantime.
			model.change( () => {
				setModelData( model,
					'<paragraph>Foo</paragraph>' +
					'<paragraph listType="numbered" listItemId="a" listIndent="0">A</paragraph>' +
					'<paragraph listType="numbered" listItemId="b" listIndent="1">B</paragraph>' +
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
				'<paragraph listIndent="0" listItemId="a" listType="numbered">A</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="numbered">B</paragraph>' +
				'<paragraph listIndent="1" listItemId="a01" listType="bulleted">X</paragraph>' +
				'<paragraph listIndent="2" listItemId="a00" listType="bulleted">Y[]</paragraph>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should handle block elements inside pasted list #1', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B[]</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>W<ul><li>X<p>Y</p>Z</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">A</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">BW</paragraph>' +
				'<paragraph listIndent="2" listItemId="a00" listType="bulleted">X</paragraph>' +
				'<paragraph listIndent="2" listItemId="a00" listType="bulleted">Y</paragraph>' +
				'<paragraph listIndent="2" listItemId="a00" listType="bulleted">Z[]</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">C</paragraph>'
			);
		} );

		it( 'should handle block elements inside pasted list #2', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A[]</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>W<ul><li>X<p>Y</p>Z</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">AW</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="bulleted">X</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="bulleted">Y</paragraph>' +
				'<paragraph listIndent="1" listItemId="a00" listType="bulleted">Z[]</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">B</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">C</paragraph>'
			);
		} );

		it( 'should handle block elements inside pasted list #3', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A[]</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li><p>W</p><p>X</p><p>Y</p></li><li>Z</li></ul>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">AW</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">X</paragraph>' +
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">Y</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">Z[]</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">B</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">C</paragraph>'
			);
		} );

		it( 'should properly handle split of list items with non-standard converters', () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A[]</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">B</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="2">C</paragraph>'
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
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">Aa</paragraph>' +
				'<splitBlock></splitBlock>' +
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">b</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">B</paragraph>' +
				'<paragraph listIndent="2" listItemId="c" listType="bulleted">C</paragraph>'
			);
		} );
	} );
} );
