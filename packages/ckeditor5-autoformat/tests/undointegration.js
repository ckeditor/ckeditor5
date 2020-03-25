/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Autoformat from '../src/autoformat';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ListEditing from '@ckeditor/ckeditor5-list/src/listediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import CodeEditing from '@ckeditor/ckeditor5-basic-styles/src/code/codeediting';
import StrikethroughEditing from '@ckeditor/ckeditor5-basic-styles/src/strikethrough/strikethroughediting';
import ItalicEditing from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Undo from '@ckeditor/ckeditor5-undo/src/undoediting';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Autoformat undo integration', () => {
	let editor, model, doc;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [
					Enter,
					Undo,
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
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'inline', () => {
		it( 'should undo replacing "**" with bold', () => {
			setData( model, '<paragraph>**foobar*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>**foobar**[]</paragraph>' );
		} );

		it( 'should undo replacing "__" with bold', () => {
			setData( model, '<paragraph>__foobar_[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '_', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>__foobar__[]</paragraph>' );
		} );

		it( 'should undo replacing "*" with italic', () => {
			setData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>*foobar*[]</paragraph>' );
		} );

		it( 'should undo replacing "_" with italic', () => {
			setData( model, '<paragraph>_foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '_', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>_foobar_[]</paragraph>' );
		} );

		it( 'should undo replacing "`" with code', () => {
			setData( model, '<paragraph>`foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '`', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text code="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>`foobar`[]</paragraph>' );
		} );

		it( 'should undo replacing "~~" with strikethrough', () => {
			setData( model, '<paragraph>~~foobar~[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '~', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<paragraph><$text strikethrough="true">foobar</$text>[]</paragraph>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>~~foobar~~[]</paragraph>' );
		} );
	} );

	describe( 'block', () => {
		it( 'should work when replacing asterisk', () => {
			setData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">[]</listItem>' );

			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>* []</paragraph>' );
		} );

		it( 'should work when replacing minus character', () => {
			setData( model, '<paragraph>-[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="bulleted">[]</listItem>' );

			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>- []</paragraph>' );
		} );

		it( 'should work when replacing digit with numbered list item using the dot format', () => {
			setData( model, '<paragraph>1.[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">[]</listItem>' );

			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>1. []</paragraph>' );
		} );

		it( 'should work when replacing digit with numbered list item using the parenthesis format', () => {
			setData( model, '<paragraph>1)[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<listItem listIndent="0" listType="numbered">[]</listItem>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>1) []</paragraph>' );
		} );

		it( 'should work when replacing hash character with heading', () => {
			setData( model, '<paragraph>#[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<heading1>[]</heading1>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph># []</paragraph>' );
		} );

		it( 'should work when replacing two hash characters with heading level 2', () => {
			setData( model, '<paragraph>##[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<heading2>[]</heading2>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>## []</paragraph>' );
		} );

		it( 'should work when replacing greater-than character with block quote', () => {
			setData( model, '<paragraph>>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( getData( model ) ).to.equal( '<blockQuote><paragraph>[]</paragraph></blockQuote>' );
			editor.execute( 'undo' );
			expect( getData( model ) ).to.equal( '<paragraph>> []</paragraph>' );
		} );
	} );
} );
