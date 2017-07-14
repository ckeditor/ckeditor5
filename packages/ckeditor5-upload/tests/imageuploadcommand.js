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
	let editor, command, adapterMock, doc, fileRepository;

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

			doc = editor.document;

			const schema = doc.schema;
			schema.allow( { name: 'image', attributes: [ 'uploadId' ], inside: '$root' } );
			schema.requireAttributes( 'image', [ 'uploadId' ] );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should insert image', () => {
			const file = createNativeFileMock();
			setModelData( doc, '<paragraph>[]foo</paragraph>' );

			command.execute( { file } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( doc ) ).to.equal( `[<image uploadId="${ id }"></image>]<paragraph>foo</paragraph>` );
		} );

		it( 'should insert image after block if selection is at its end', () => {
			const file = createNativeFileMock();
			setModelData( doc, '<paragraph>foo[]</paragraph>' );

			command.execute( { file } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( doc ) ).to.equal( `<paragraph>foo</paragraph>[<image uploadId="${ id }"></image>]` );
		} );

		it( 'should insert image before block if selection is in the middle', () => {
			const file = createNativeFileMock();
			setModelData( doc, '<paragraph>f{}oo</paragraph>' );

			command.execute( { file } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( doc ) ).to.equal( `[<image uploadId="${ id }"></image>]<paragraph>foo</paragraph>` );
		} );

		it( 'should insert image after other image', () => {
			const file = createNativeFileMock();
			setModelData( doc, '[<image src="image.png"></image>]' );

			command.execute( { file } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( doc ) ).to.equal( `<image src="image.png"></image>[<image uploadId="${ id }"></image>]` );
		} );

		it( 'should allow to insert image at some custom position (options.insertAt)', () => {
			const file = createNativeFileMock();
			setModelData( doc, '<paragraph>[foo]</paragraph><paragraph>bar</paragraph><paragraph>bom</paragraph>' );

			const customPosition = new ModelPosition( doc.getRoot(), [ 2 ] ); // <p>foo</p><p>bar</p>^<p>bom</p>

			command.execute( { file, insertAt: customPosition } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( doc ) ).to.equal(
				'<paragraph>foo</paragraph><paragraph>bar</paragraph>' +
				`[<image uploadId="${ id }"></image>]` +
				'<paragraph>bom</paragraph>'
			);
		} );

		it( 'should not insert image when proper insert position cannot be found', () => {
			const file = createNativeFileMock();
			doc.schema.registerItem( 'other' );
			doc.schema.allow( { name: 'other', inside: '$root' } );
			buildModelConverter().for( editor.editing.modelToView )
				.fromElement( 'other' )
				.toElement( 'span' );

			setModelData( doc, '<other>[]</other>' );

			command.execute( { file } );

			expect( getModelData( doc ) ).to.equal( '<other>[]</other>' );
		} );

		it( 'should not insert non-image', () => {
			const file = createNativeFileMock();
			file.type = 'audio/mpeg3';
			setModelData( doc, '<paragraph>foo[]</paragraph>' );
			command.execute( { file } );

			expect( getModelData( doc ) ).to.equal( '<paragraph>foo[]</paragraph>' );
		} );

		it( 'should allow to provide batch instance', () => {
			const batch = doc.batch();
			const file = createNativeFileMock();
			const spy = sinon.spy( batch, 'insert' );

			setModelData( doc, '<paragraph>[]foo</paragraph>' );

			command.execute( { batch, file } );
			const id = fileRepository.getLoader( file ).id;

			expect( getModelData( doc ) ).to.equal( `[<image uploadId="${ id }"></image>]<paragraph>foo</paragraph>` );
			sinon.assert.calledOnce( spy );
		} );
	} );
} );
