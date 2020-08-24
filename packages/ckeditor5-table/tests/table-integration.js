/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ListEditing from '@ckeditor/ckeditor5-list/src/listediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import TableEditing from '../src/tableediting';
import { modelTable, viewTable } from './_utils/utils';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'Table feature – integration', () => {
	describe( 'with clipboard', () => {
		let editor, clipboard;

		beforeEach( () => {
			return ClassicTestEditor
				.create( '', { plugins: [ Paragraph, TableEditing, ListEditing, BlockQuoteEditing, Widget, Clipboard ] } )
				.then( newEditor => {
					editor = newEditor;
					clipboard = editor.plugins.get( 'Clipboard' );
				} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

		it( 'pastes td as p when pasting into the table', () => {
			setModelData( editor.model, modelTable( [ [ 'foo[]' ] ] ) );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<td>bar</td>' )
			} );

			assertEqualMarkup( getModelData( editor.model ), modelTable( [
				[ 'foobar[]' ]
			] ) );
		} );

		it( 'pastes td as p when pasting into the p', () => {
			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<td>bar</td>' )
			} );

			assertEqualMarkup( getModelData( editor.model ), '<paragraph>foobar[]</paragraph>' );
		} );

		it( 'pastes list into the td', () => {
			setModelData( editor.model, modelTable( [ [ '[]' ] ] ) );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<li>bar</li>' )
			} );

			assertEqualMarkup( getModelData( editor.model ), modelTable( [
				[ '<listItem listIndent="0" listType="bulleted">bar[]</listItem>' ]
			] ) );
		} );

		it( 'pastes blockquote into the td', () => {
			setModelData( editor.model, modelTable( [ [ '[]' ] ] ) );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<blockquote>bar</blockquote>' )
			} );

			assertEqualMarkup( getModelData( editor.model ), modelTable( [
				[ '<blockQuote><paragraph>bar[]</paragraph></blockQuote>' ]
			] ) );
		} );
	} );

	describe( 'with undo', () => {
		let editor, doc, root;

		beforeEach( () => {
			return ClassicTestEditor
				.create( '', { plugins: [ Paragraph, TableEditing, Widget, UndoEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					doc = editor.model.document;
					root = doc.getRoot();
				} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

		it( 'fixing empty roots should be transparent to undo', () => {
			expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' );
			expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;

			editor.data.set( viewTable( [ [ 'foo' ] ] ) );

			expect( editor.getData( { trim: 'none' } ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );

			editor.model.change( writer => {
				writer.remove( root.getChild( 0 ) );
			} );

			expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' );

			editor.execute( 'undo' );

			expect( editor.getData( { trim: 'none' } ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );

			editor.execute( 'redo' );

			expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' );

			editor.execute( 'undo' );

			expect( editor.getData( { trim: 'none' } ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );
		} );

		it( 'fixing empty roots should be transparent to undo - multiple roots', () => {
			const otherRoot = doc.createRoot( '$root', 'otherRoot' );

			editor.data.set( { main: viewTable( [ [ 'foo' ] ] ) } );
			editor.data.set( { otherRoot: viewTable( [ [ 'foo' ] ] ) } );

			editor.model.change( writer => {
				writer.remove( root.getChild( 0 ) );
			} );

			editor.model.change( writer => {
				writer.remove( otherRoot.getChild( 0 ) );
			} );

			expect( editor.data.get( { trim: 'none', rootName: 'main' } ) ).to.equal( '<p>&nbsp;</p>' );
			expect( editor.data.get( { trim: 'none', rootName: 'otherRoot' } ) ).to.equal( '<p>&nbsp;</p>' );

			editor.execute( 'undo' );

			expect( editor.data.get( { trim: 'none', rootName: 'main' } ) ).to.equal( '<p>&nbsp;</p>' );
			expect( editor.data.get( { trim: 'none', rootName: 'otherRoot' } ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );

			editor.execute( 'undo' );

			expect( editor.data.get( { trim: 'none', rootName: 'main' } ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );
			expect( editor.data.get( { trim: 'none', rootName: 'otherRoot' } ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );
		} );
	} );

	describe( 'other', () => {
		let editor;

		beforeEach( () => {
			return ClassicTestEditor
				.create( '', { plugins: [ Paragraph, TableEditing, ListEditing, BlockQuoteEditing, Widget, Typing ] } )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

		it( 'merges elements without throwing errors', () => {
			setModelData( editor.model, modelTable( [
				[ '<blockQuote><paragraph>Foo</paragraph></blockQuote><paragraph>[]Bar</paragraph>' ]
			] ) );

			editor.execute( 'delete' );

			assertEqualMarkup( getModelData( editor.model ), modelTable( [
				[ '<blockQuote><paragraph>Foo[]Bar</paragraph></blockQuote>' ]
			] ) );
		} );

		it( 'should not make the Model#hasContent() method return "true" when an empty table cell is selected', () => {
			setModelData( editor.model, '<table>' +
				'<tableRow>' +
					'[<tableCell><paragraph></paragraph></tableCell>]' +
				'</tableRow>' +
			'</table>' );

			expect( editor.model.hasContent( editor.model.document.selection.getFirstRange() ) ).to.be.false;
		} );
	} );
} );
