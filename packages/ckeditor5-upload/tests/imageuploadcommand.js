/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageUploadCommand from '../src/imageuploadcommand';
import FileRepository from '../src/filerepository';
import { createNativeFileMock, AdapterMock } from './_utils/mocks';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Image from '@ckeditor/ckeditor5-image/src/image/imageengine';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';

describe( 'ImageUploadCommand', () => {
	let editor, command, adapterMock, document, fileRepository;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ FileRepository, Image, Paragraph ]
		} )
		.then( newEditor => {
			editor = newEditor;
			command = new ImageUploadCommand( editor );
			fileRepository = editor.plugins.get( FileRepository );
			fileRepository.createAdapter = loader => {
				adapterMock = new AdapterMock( loader );

				return adapterMock;
			};

			document = editor.document;

			const schema = document.schema;
			schema.allow( { name: 'image', attributes: [ 'uploadId' ], inside: '$root' } );
			schema.requireAttributes( 'image', [ 'uploadId' ] );
		} );
	} );

	describe( '_doExecute', () => {
		it( 'should insert image', () => {
			const file = createNativeFileMock();
			setModelData( document, '<paragraph>[]foo</paragraph>' );

			command._doExecute( { file } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( document ) ).to.equal( `[<image uploadId="${ id }"></image>]<paragraph>foo</paragraph>` );
		} );

		it( 'should insert image after block if selection is at its end', () => {
			const file = createNativeFileMock();
			setModelData( document, '<paragraph>foo[]</paragraph>' );

			command._doExecute( { file } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( document ) ).to.equal( `<paragraph>foo</paragraph>[<image uploadId="${ id }"></image>]` );
		} );

		it( 'should insert image before block if selection is in the middle', () => {
			const file = createNativeFileMock();
			setModelData( document, '<paragraph>f{}oo</paragraph>' );

			command._doExecute( { file } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( document ) ).to.equal( `[<image uploadId="${ id }"></image>]<paragraph>foo</paragraph>` );
		} );

		it( 'should insert image after other image', () => {
			const file = createNativeFileMock();
			setModelData( document, '[<image src="image.png"></image>]' );

			command._doExecute( { file } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( document ) ).to.equal( `<image src="image.png"></image>[<image uploadId="${ id }"></image>]` );
		} );

		it( 'should not insert image when proper insert position cannot be found', () => {
			const file = createNativeFileMock();
			document.schema.registerItem( 'other' );
			document.schema.allow( { name: 'other', inside: '$root' } );
			buildModelConverter().for( editor.editing.modelToView )
				.fromElement( 'other' )
				.toElement( 'span' );

			setModelData( document, '<other>[]</other>' );

			command._doExecute( { file } );

			expect( getModelData( document ) ).to.equal( '<other>[]</other>' );
		} );

		it( 'should not insert non-image', () => {
			const file = createNativeFileMock();
			file.type = 'audio/mpeg3';
			setModelData( document, '<paragraph>foo[]</paragraph>' );
			command._doExecute( { file } );

			expect( getModelData( document ) ).to.equal( '<paragraph>foo[]</paragraph>' );
		} );

		it( 'should allow to provide batch instance', () => {
			const batch = document.batch();
			const file = createNativeFileMock();
			const spy = sinon.spy( batch, 'insert' );

			setModelData( document, '<paragraph>[]foo</paragraph>' );

			command._doExecute( { batch, file } );
			const id = fileRepository.getLoader( file ).id;

			expect( getModelData( document ) ).to.equal( `[<image uploadId="${ id }"></image>]<paragraph>foo</paragraph>` );
			sinon.assert.calledOnce( spy );
		} );
	} );
} );
