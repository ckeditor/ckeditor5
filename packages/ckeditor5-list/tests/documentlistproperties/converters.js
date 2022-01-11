/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, parse as parseModel, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import stubUid from '../documentlist/_utils/uid';
import DocumentListPropertiesEditing from '../../src/documentlistproperties/documentlistpropertiesediting';
import { modelList } from '../documentlist/_utils/utils';

describe( 'DocumentListPropertiesEditing - converters', () => {
	let editor, model, modelDoc, modelRoot, view, viewDoc, viewRoot;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, IndentEditing, ClipboardPipeline, BoldEditing, DocumentListPropertiesEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing, AlignmentEditing ],
			list: {
				properties: {
					styles: true,
					startIndex: true,
					reversed: true
				}
			}
		} );

		model = editor.model;
		modelDoc = model.document;
		modelRoot = modelDoc.getRoot();

		view = editor.editing.view;
		viewDoc = view.document;
		viewRoot = viewDoc.getRoot();

		model.schema.register( 'foo', {
			allowWhere: '$block',
			allowAttributesOf: '$container',
			isBlock: true,
			isObject: true
		} );

		// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => {
		} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'data pipeline', () => {
		beforeEach( () => {
			stubUid( 0 );
		} );

		it( 'should 1', () => {
			const input =
				'<ol style="list-style-type:upper-roman;" reversed="reversed" start="7">' +
					'<li>foo</li>' +
					'<li>bar</li>' +
				'</ol>';

			editor.setData( input );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( [
				'# foo {reversed:true} {start:7} {style:upper-roman}',
				'# bar'
			] ) );

			expect( editor.getData() ).to.equalMarkup( input );
		} );
	} );
} );
