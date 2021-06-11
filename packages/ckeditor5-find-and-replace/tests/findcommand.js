/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import FindAndReplaceEditing from '../src/findandreplaceediting';
import FindCommand from '../src/findcommand';

describe( 'FindCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ FindAndReplaceEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new FindCommand( editor );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );
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
			setData( model, '<p>foo[]</p>' );
			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe.skip( 'execute()', () => {
		describe( 'with string passed', () => {
			it( 'matches the first occurrence', () => {
				setData( model, '<p>[]Foo bar baz. Bam bar bom.</p>' );

				command.execute( 'bar' );

				expect( getData( model ) ).to.equal( '<p>Foo [bar] baz. Bam bar bom.</p>' );
			} );

			it( 'matches second occurrence', () => {
				setData( model, '<p>Foo bar b[]az. Bam bar bom.</p>' );

				command.execute( 'bar' );

				expect( getData( model ) ).to.equal( '<p>Foo bar baz. Bam [bar] bom.</p>' );
			} );
		} );

		// it( 'should insert a media in an empty root and select it', () => {
		// 	setData( model, '[]' );

		// 	command.execute( 'http://ckeditor.com' );

		// 	expect( getData( model ) ).to.equal( '[<media url="http://ckeditor.com"></media>]' );
		// } );

		// it( 'should update media url', () => {
		// 	setData( model, '[<media url="http://ckeditor.com"></media>]' );

		// 	command.execute( 'http://cksource.com' );

		// 	expect( getData( model ) ).to.equal( '[<media url="http://cksource.com"></media>]' );
		// } );
	} );
} );
