/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import FindAndReplaceEditing from '../src/findandreplaceediting';
import ReplaceCommand from '../src/replacecommand';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';

describe( 'ReplaceCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ FindAndReplaceEditing, Paragraph, BoldEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new ReplaceCommand( editor );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be enabled in empty document', () => {
			setData( model, '[]' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be enabled by default', () => {
			setData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should replace single search result using text', () => {
			setData( model, '<paragraph>Foo bar baz</paragraph><paragraph>Foo [bar] baz</paragraph>' );

			const range = editor.model.document.selection.getFirstRange();
			const markerId = 'my-marker-id';

			model.change( writer => {
				const marker = writer.addMarker( markerId, {
					usingOperation: false,
					affectsData: false,
					range
				} );

				editor.execute( 'replace', { marker }, 'new' );
			} );

			expect( editor.getData() ).to.equal( '<p>Foo bar baz</p><p>Foo new baz</p>' );
		} );

		it( 'should replace single search result using callback', () => {
			setData( model, '<paragraph>Foo bar baz</paragraph><paragraph>Foo [bar] baz</paragraph>' );

			const range = editor.model.document.selection.getFirstRange();
			const markerId = 'my-marker-id';

			model.change( writer => {
				const marker = writer.addMarker( markerId, {
					usingOperation: false,
					affectsData: false,
					range
				} );

				editor.execute( 'replace', { marker }, writer => writer.createText( 'new', { bold: true } ) );
			} );

			expect( editor.getData() ).to.equal( '<p>Foo bar baz</p><p>Foo <strong>new</strong> baz</p>' );
		} );
	} );
} );
