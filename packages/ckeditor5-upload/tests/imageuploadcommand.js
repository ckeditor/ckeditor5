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
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';

describe( 'ImageUploadCommand', () => {
	let editor, command, doc, fileRepository;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ FileRepository, Image, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				command = new ImageUploadCommand( editor );
				fileRepository = editor.plugins.get( FileRepository );
				fileRepository.createAdapter = loader => {
					return new AdapterMock( loader );
				};

				doc = editor.document;

				const schema = doc.schema;
				schema.allow( { name: 'image', attributes: [ 'uploadId' ], inside: '$root' } );
				schema.requireAttributes( 'image', [ 'uploadId' ] );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'execute()', () => {
		it( 'should insert image at selection position (includes deleting selected content)', () => {
			const file = createNativeFileMock();
			setModelData( doc, '<paragraph>f[o]o</paragraph>' );

			command.execute( { file } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( doc ) )
				.to.equal( `<paragraph>f</paragraph>[<image uploadId="${ id }"></image>]<paragraph>o</paragraph>` );
		} );

		it( 'should insert directly at specified position (options.insertAt)', () => {
			const file = createNativeFileMock();
			setModelData( doc, '<paragraph>f[]oo</paragraph>' );

			const insertAt = new ModelPosition( doc.getRoot(), [ 0, 2 ] ); // fo[]o

			command.execute( { file, insertAt } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( doc ) )
				.to.equal( `<paragraph>fo</paragraph>[<image uploadId="${ id }"></image>]<paragraph>o</paragraph>` );
		} );

		it( 'should allow to provide batch instance (options.batch)', () => {
			const batch = doc.batch();
			const file = createNativeFileMock();
			const spy = sinon.spy( batch, 'insert' );

			setModelData( doc, '<paragraph>[]foo</paragraph>' );

			command.execute( { batch, file } );
			const id = fileRepository.getLoader( file ).id;

			expect( getModelData( doc ) ).to.equal( `[<image uploadId="${ id }"></image>]<paragraph>foo</paragraph>` );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should not insert image nor crash when image could not be inserted', () => {
			const file = createNativeFileMock();
			doc.schema.registerItem( 'other' );
			doc.schema.allow( { name: '$text', inside: 'other' } );
			doc.schema.allow( { name: 'other', inside: '$root' } );
			doc.schema.limits.add( 'other' );
			buildModelConverter().for( editor.editing.modelToView )
				.fromElement( 'other' )
				.toElement( 'p' );

			setModelData( doc, '<other>[]</other>' );

			command.execute( { file } );

			expect( getModelData( doc ) ).to.equal( '<other>[]</other>' );
		} );
	} );
} );
