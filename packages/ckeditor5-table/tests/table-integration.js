/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ListEditing from '@ckeditor/ckeditor5-list/src/listediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import TableEditing from '../src/tableediting';
import { formatTable, formattedModelTable, modelTable, viewTable } from './_utils/utils';

describe( 'Table feature – integration', () => {
	describe( 'with clipboard', () => {
		let editor, clipboard;

		beforeEach( () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, TableEditing, ListEditing, BlockQuoteEditing, Widget, Clipboard ] } )
				.then( newEditor => {
					editor = newEditor;
					clipboard = editor.plugins.get( 'Clipboard' );
				} );
		} );

		it( 'pastes td as p when pasting into the table', () => {
			setModelData( editor.model, modelTable( [ [ 'foo[]' ] ] ) );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<td>bar</td>' )
			} );

			expect( formatTable( getModelData( editor.model ) ) ).to.equal( formattedModelTable( [
				[ 'foobar[]' ]
			] ) );
		} );

		it( 'pastes td as p when pasting into the p', () => {
			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<td>bar</td>' )
			} );

			expect( formatTable( getModelData( editor.model ) ) ).to.equal( '<paragraph>foobar[]</paragraph>' );
		} );

		it( 'pastes list into the td', () => {
			setModelData( editor.model, modelTable( [ [ '[]' ] ] ) );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<li>bar</li>' )
			} );

			expect( formatTable( getModelData( editor.model ) ) ).to.equal( formattedModelTable( [
				[ '<listItem listIndent="0" listType="bulleted">bar[]</listItem>' ]
			] ) );
		} );

		it( 'pastes blockquote into the td', () => {
			setModelData( editor.model, modelTable( [ [ '[]' ] ] ) );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<blockquote>bar</blockquote>' )
			} );

			expect( formatTable( getModelData( editor.model ) ) ).to.equal( formattedModelTable( [
				[ '<blockQuote><paragraph>bar[]</paragraph></blockQuote>' ]
			] ) );
		} );
	} );

	describe( 'with undo', () => {
		let editor, doc, root;

		beforeEach( () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, TableEditing, Widget, UndoEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					doc = editor.model.document;
					root = doc.getRoot();
				} );
		} );

		it( 'fixing empty roots should be transparent to undo', () => {
			expect( editor.getData() ).to.equal( '<p>&nbsp;</p>' );
			expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;

			editor.data.set( viewTable( [ [ 'foo' ] ] ) );

			expect( editor.getData() ).to.equal( viewTable( [ [ 'foo' ] ] ) );

			editor.model.change( writer => {
				writer.remove( root.getChild( 0 ) );
			} );

			expect( editor.getData() ).to.equal( '<p>&nbsp;</p>' );

			editor.execute( 'undo' );

			expect( editor.getData() ).to.equal( viewTable( [ [ 'foo' ] ] ) );

			editor.execute( 'redo' );

			expect( editor.getData() ).to.equal( '<p>&nbsp;</p>' );

			editor.execute( 'undo' );

			expect( editor.getData() ).to.equal( viewTable( [ [ 'foo' ] ] ) );
		} );

		it( 'fixing empty roots should be transparent to undo - multiple roots', () => {
			const otherRoot = doc.createRoot( '$root', 'otherRoot' );

			editor.data.set( viewTable( [ [ 'foo' ] ] ), 'main' );
			editor.data.set( viewTable( [ [ 'foo' ] ] ), 'otherRoot' );

			editor.model.change( writer => {
				writer.remove( root.getChild( 0 ) );
			} );

			editor.model.change( writer => {
				writer.remove( otherRoot.getChild( 0 ) );
			} );

			expect( editor.data.get( 'main' ) ).to.equal( '<p>&nbsp;</p>' );
			expect( editor.data.get( 'otherRoot' ) ).to.equal( '<p>&nbsp;</p>' );

			editor.execute( 'undo' );

			expect( editor.data.get( 'main' ) ).to.equal( '<p>&nbsp;</p>' );
			expect( editor.data.get( 'otherRoot' ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );

			editor.execute( 'undo' );

			expect( editor.data.get( 'main' ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );
			expect( editor.data.get( 'otherRoot' ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );
		} );
	} );
} );
