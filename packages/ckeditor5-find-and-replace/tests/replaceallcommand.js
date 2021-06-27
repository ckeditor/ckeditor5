/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import FindAndReplaceEditing from '../src/findandreplaceediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';

import { uid, Collection } from 'ckeditor5/src/utils';

describe( 'ReplaceAllCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ FindAndReplaceEditing, Paragraph, BoldEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'replaceAll' );
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

	describe( 'state', () => {
		it( 'is set to plugin\'s state', () => {
			expect( command._state ).to.equal( editor.plugins.get( 'FindAndReplaceEditing' ).state );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should replace all text occurrences in the document', () => {
			setData( model, '<paragraph>Foo bar baz</paragraph><paragraph>Foo bar baz</paragraph>' );

			editor.execute( 'replaceAll', 'new', 'bar' );

			expect( editor.getData() ).to.equal( '<p>Foo new baz</p><p>Foo new baz</p>' );
		} );

		it( 'should not change model if nothing was matched', () => {
			setData( model, '<paragraph>Foo bar baz</paragraph><paragraph>Foo bar baz</paragraph>' );

			editor.execute( 'replaceAll', 'new', 'baar' );

			expect( editor.getData() ).to.equal( '<p>Foo bar baz</p><p>Foo bar baz</p>' );
		} );

		it( 'should replace all passed results in the document document', () => {
			setData( model, '<paragraph>Foo bar [b]az</paragraph><paragraph>[Foo] bar baz</paragraph>' );

			const ranges = editor.model.document.selection.getRanges();
			const results = new Collection();

			model.change( writer => {
				for ( const range of ranges ) {
					const id = uid();

					results.add( {
						id,
						label: 'label',
						marker: writer.addMarker( id, {
							usingOperation: false,
							affectsData: false,
							range
						} )
					} );
				}
			} );

			editor.execute( 'replaceAll', 'new', results );

			expect( editor.getData() ).to.equal( '<p>Foo bar newaz</p><p>new bar baz</p>' );
		} );

		it( 'should work with empty document', () => {
			setData( model, '' );

			editor.execute( 'replaceAll', 'new', 'bar' );

			expect( editor.getData() ).to.equal( '' );
		} );
	} );
} );
