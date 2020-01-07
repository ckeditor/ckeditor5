/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import MediaEmbedEditing from '../src/mediaembedediting';
import MediaEmbedCommand from '../src/mediaembedcommand';

describe( 'MediaEmbedCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ MediaEmbedEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = new MediaEmbedCommand( editor );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true if in a root', () => {
			setData( model, '[]' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if in a paragraph (collapsed)', () => {
			setData( model, '<p>foo[]</p>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if in a paragraph (not collapsed)', () => {
			setData( model, '<p>[foo]</p>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true if a media is selected', () => {
			setData( model, '[<media url="http://ckeditor.com"></media>]' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( '$text', { allowIn: 'block' } );

			setData( model, '<block>foo[]</block>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when the selection in a limit element', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.register( 'limit', { allowIn: 'block', isLimit: true } );
			model.schema.extend( '$text', { allowIn: 'limit' } );

			setData( model, '<block><limit>foo[]</limit></block>' );
			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'value', () => {
		it( 'should be null when no media is selected (paragraph)', () => {
			setData( model, '<p>foo[]</p>' );
			expect( command.value ).to.be.null;
		} );

		it( 'should equal the url of the selected media', () => {
			setData( model, '[<media url="http://ckeditor.com"></media>]' );
			expect( command.value ).to.equal( 'http://ckeditor.com' );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should create a single batch', () => {
			setData( model, '<p>foo[]</p>' );

			const spy = sinon.spy();

			model.document.on( 'change', spy );

			command.execute( 'http://ckeditor.com' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should insert a media in an empty root and select it', () => {
			setData( model, '[]' );

			command.execute( 'http://ckeditor.com' );

			expect( getData( model ) ).to.equal( '[<media url="http://ckeditor.com"></media>]' );
		} );

		it( 'should update media url', () => {
			setData( model, '[<media url="http://ckeditor.com"></media>]' );

			command.execute( 'http://cksource.com' );

			expect( getData( model ) ).to.equal( '[<media url="http://cksource.com"></media>]' );
		} );
	} );
} );
