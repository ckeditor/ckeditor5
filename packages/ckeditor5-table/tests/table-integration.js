/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import TableEditing from '../src/tableediting';
import { formatTable, formattedModelTable, modelTable } from './_utils/utils';

describe( 'Table feature – integration', () => {
	describe( 'with clipboard', () => {
		it( 'pastes td as p when pasting into the table', () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, TableEditing, Widget, Clipboard ] } )
				.then( newEditor => {
					const editor = newEditor;
					const clipboard = editor.plugins.get( 'Clipboard' );

					setModelData( editor.model, modelTable( [ [ 'foo[]' ] ] ) );

					clipboard.fire( 'inputTransformation', {
						content: parseView( '<td>bar</td>' )
					} );

					expect( formatTable( getModelData( editor.model ) ) ).to.equal( formattedModelTable( [
						[ 'foobar[]' ]
					] ) );
				} );
		} );

		it( 'pastes td as p when pasting into the p', () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, TableEditing, Widget, Clipboard ] } )
				.then( newEditor => {
					const editor = newEditor;
					const clipboard = editor.plugins.get( 'Clipboard' );

					setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

					clipboard.fire( 'inputTransformation', {
						content: parseView( '<td>bar</td>' )
					} );

					expect( formatTable( getModelData( editor.model ) ) ).to.equal( '<paragraph>foobar[]</paragraph>' );
				} );
		} );
	} );

	describe( 'with undo', () => {
		it( 'fixing empty roots should be transparent to undo', () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, UndoEditing ] } )
				.then( newEditor => {
					const editor = newEditor;
					const doc = editor.model.document;
					const root = doc.getRoot();

					expect( editor.getData() ).to.equal( '<p>&nbsp;</p>' );
					expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;

					editor.setData( '<p>Foobar.</p>' );

					editor.model.change( writer => {
						writer.remove( root.getChild( 0 ) );
					} );

					expect( editor.getData() ).to.equal( '<p>&nbsp;</p>' );

					editor.execute( 'undo' );

					expect( editor.getData() ).to.equal( '<p>Foobar.</p>' );

					editor.execute( 'redo' );

					expect( editor.getData() ).to.equal( '<p>&nbsp;</p>' );

					editor.execute( 'undo' );

					expect( editor.getData() ).to.equal( '<p>Foobar.</p>' );
				} );
		} );

		it( 'fixing empty roots should be transparent to undo - multiple roots', () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, UndoEditing ] } )
				.then( newEditor => {
					const editor = newEditor;
					const doc = editor.model.document;
					const root = doc.getRoot();
					const otherRoot = doc.createRoot( '$root', 'otherRoot' );

					editor.data.set( '<p>Foobar.</p>', 'main' );
					editor.data.set( '<p>Foobar.</p>', 'otherRoot' );

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
					expect( editor.data.get( 'otherRoot' ) ).to.equal( '<p>Foobar.</p>' );

					editor.execute( 'undo' );

					expect( editor.data.get( 'main' ) ).to.equal( '<p>Foobar.</p>' );
					expect( editor.data.get( 'otherRoot' ) ).to.equal( '<p>Foobar.</p>' );
				} );
		} );
	} );
} );
