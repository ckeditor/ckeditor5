/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Autoformat } from '../src/autoformat.js';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ListEditing, _ListItemUid as ListItemUid } from '@ckeditor/ckeditor5-list';
import { HeadingEditing } from '@ckeditor/ckeditor5-heading';
import { BoldEditing, CodeEditing, StrikethroughEditing, ItalicEditing } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Delete } from '@ckeditor/ckeditor5-typing';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

import { _setModelData, _getModelData, ViewDocumentDomEventData } from '@ckeditor/ckeditor5-engine';

describe( 'Autoformat undo integration', () => {
	let editor, model, doc;

	beforeEach( () => {
		let uidNum = 0xa00;

		vi.spyOn( ListItemUid, 'next' ).mockImplementation( () => ( uidNum++ ).toString( 16 ).padStart( 3, '000' ) );
	} );

	afterEach( async () => {
		if ( editor ) {
			await editor.destroy();
		}
	} );

	describe( 'inline', () => {
		beforeEach( createVirtualEditorInstance );

		it( 'should undo replacing "**" with bold', () => {
			_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph>**foobar**[]</paragraph>' );
		} );

		it( 'should undo replacing "__" with bold', () => {
			_setModelData( model, '<paragraph>__foobar_[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '_', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph>__foobar__[]</paragraph>' );
		} );

		it( 'should undo replacing "*" with italic', () => {
			_setModelData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph>*foobar*[]</paragraph>' );
		} );

		it( 'should undo replacing "_" with italic', () => {
			_setModelData( model, '<paragraph>_foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '_', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph>_foobar_[]</paragraph>' );
		} );

		it( 'should undo replacing "`" with code', () => {
			_setModelData( model, '<paragraph>`foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph><$text code="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph>`foobar`[]</paragraph>' );
		} );

		it( 'should undo replacing "~~" with strikethrough', () => {
			_setModelData( model, '<paragraph>~~foobar~[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '~', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph><$text strikethrough="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph>~~foobar~~[]</paragraph>' );
		} );
	} );

	describe( 'block', () => {
		beforeEach( createVirtualEditorInstance );

		it( 'should work when replacing asterisk', () => {
			_setModelData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph listIndent="0" listItemId="a00" listType="bulleted">[]</paragraph>' );

			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph>* []</paragraph>' );
		} );

		it( 'should work when replacing minus character', () => {
			_setModelData( model, '<paragraph>-[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph listIndent="0" listItemId="a00" listType="bulleted">[]</paragraph>' );

			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph>- []</paragraph>' );
		} );

		it( 'should work when replacing digit with numbered list item using the dot format', () => {
			_setModelData( model, '<paragraph>1.[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph listIndent="0" listItemId="a00" listType="numbered">[]</paragraph>' );

			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph>1. []</paragraph>' );
		} );

		it( 'should work when replacing digit with numbered list item using the parenthesis format', () => {
			_setModelData( model, '<paragraph>1)[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph listIndent="0" listItemId="a00" listType="numbered">[]</paragraph>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph>1) []</paragraph>' );
		} );

		it( 'should work when replacing hash character with heading', () => {
			_setModelData( model, '<paragraph>#[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<heading1>[]</heading1>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph># []</paragraph>' );
		} );

		it( 'should work when replacing two hash characters with heading level 2', () => {
			_setModelData( model, '<paragraph>##[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<heading2>[]</heading2>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph>## []</paragraph>' );
		} );

		it( 'should work when replacing greater-than character with block quote', () => {
			_setModelData( model, '<paragraph>>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<blockQuote><paragraph>[]</paragraph></blockQuote>' );
			editor.execute( 'undo' );
			expect( _getModelData( model ) ).toBe( '<paragraph>> []</paragraph>' );
		} );
	} );

	describe( 'by pressing backspace', () => {
		let viewDocument, deleteEvent;

		beforeEach( async () => {
			const newEditor = await ModelTestEditor
				.create( {
					plugins: [
						Autoformat,
						Paragraph,
						BoldEditing,
						ListEditing,
						Delete,
						UndoEditing
					]
				} );

			editor = newEditor;
			model = editor.model;
			doc = model.document;
			viewDocument = editor.editing.view.document;
			deleteEvent = new ViewDocumentDomEventData(
				viewDocument,
				{ preventDefault: vi.fn() },
				{ direction: 'backward', unit: 'codePoint', sequence: 1 }
			);
		} );

		it( 'should undo after inline autoformat', () => {
			_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );

			viewDocument.fire( 'delete', deleteEvent );

			expect( _getModelData( model ) ).toBe( '<paragraph>**foobar**[]</paragraph>' );
		} );

		it( 'should undo after block autoformat', () => {
			_setModelData( model, '<paragraph>-[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph listIndent="0" listItemId="a00" listType="bulleted">[]</paragraph>' );

			viewDocument.fire( 'delete', deleteEvent );

			expect( _getModelData( model ) ).toBe( '<paragraph>- []</paragraph>' );
		} );

		it( 'should not undo after selection has changed', () => {
			_setModelData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );

			model.change( writer => {
				const selection = model.createSelection();
				writer.setSelection( selection );
			} );

			viewDocument.fire( 'delete', deleteEvent );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toBe( '<paragraph><$text bold="true">foobar</$text></paragraph>' );
		} );
	} );

	async function createVirtualEditorInstance() {
		const newEditor = await VirtualTestEditor
			.create( {
				plugins: [
					Enter,
					UndoEditing,
					Paragraph,
					Autoformat,
					ListEditing,
					HeadingEditing,
					BoldEditing,
					ItalicEditing,
					CodeEditing,
					StrikethroughEditing,
					BlockQuoteEditing
				]
			} );

		editor = newEditor;
		model = editor.model;
		doc = model.document;
	}
} );
