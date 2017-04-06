/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageUploadCommand from '../src/imageuploadcommand';
import FileRepository from '../src/filerepository';
import { createNativeFileMock, AdapterMock } from './_utils/mocks';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Image from '@ckeditor/ckeditor5-image/src/image/imageengine';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'ImageUploadCommand', () => {
	let editor, command, adapterMock, document, fileRepository;

	beforeEach( () => {
		return ClassicTestEditor.create( {
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
			setModelData( document, '<paragraph>foo[]</paragraph>' );
			command._doExecute( { file } );

			const id = fileRepository.getLoader( file ).id;

			expect( getModelData( document ) ).to.equal( `<image uploadId="${ id }"></image><paragraph>foo[]</paragraph>` );
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

			setModelData( document, '<paragraph>foo[]</paragraph>' );

			command._doExecute( { batch, file } );
			const id = fileRepository.getLoader( file ).id;

			expect( getModelData( document ) ).to.equal( `<image uploadId="${ id }"></image><paragraph>foo[]</paragraph>` );
			sinon.assert.calledOnce( spy );
		} );
	} );
} );
