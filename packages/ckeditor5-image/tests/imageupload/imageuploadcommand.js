/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ImageUploadCommand from '../../src/imageupload/imageuploadcommand';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';

import { createNativeFileMock, UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Image from '../../src/image/imageediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';

import log from '@ckeditor/ckeditor5-utils/src/log';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'ImageUploadCommand', () => {
	let editor, command, model, doc, fileRepository;

	testUtils.createSinonSandbox();

	class UploadAdapterPluginMock extends Plugin {
		init() {
			fileRepository = this.editor.plugins.get( FileRepository );
			fileRepository.createUploadAdapter = loader => {
				return new UploadAdapterMock( loader );
			};
		}
	}

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ FileRepository, Image, Paragraph, UploadAdapterPluginMock ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;

				command = new ImageUploadCommand( editor );

				const schema = model.schema;
				schema.extend( 'image', { allowAttributes: 'uploadId' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true when the selection directly in the root', () => {
			setModelData( model, '[]' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection directly in a paragraph', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( '$text', { allowIn: 'block' } );
			editor.conversion.for( 'downcast' ).add( downcastElementToElement( { model: 'block', view: 'block' } ) );

			setModelData( model, '<block>foo[]</block>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when the selection in a limit element', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.register( 'limit', { allowIn: 'block', isLimit: true } );
			model.schema.extend( '$text', { allowIn: 'limit' } );

			editor.conversion.for( 'downcast' ).add( downcastElementToElement( { model: 'block', view: 'block' } ) );
			editor.conversion.for( 'downcast' ).add( downcastElementToElement( { model: 'limit', view: 'limit' } ) );

			setModelData( model, '<block><limit>foo[]</limit></block>' );
			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should insert image at selection position (includes deleting selected content)', () => {
			const file = createNativeFileMock();
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( { files: file } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( model ) )
				.to.equal( `<paragraph>f</paragraph>[<image uploadId="${ id }"></image>]<paragraph>o</paragraph>` );
		} );

		it( 'should insert directly at specified position (options.insertAt)', () => {
			const file = createNativeFileMock();
			setModelData( model, '<paragraph>f[]oo</paragraph>' );

			const insertAt = new ModelPosition( doc.getRoot(), [ 0, 2 ] ); // fo[]o

			command.execute( { files: file, insertAt } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( model ) )
				.to.equal( `<paragraph>fo</paragraph>[<image uploadId="${ id }"></image>]<paragraph>o</paragraph>` );
		} );

		it( 'should use parent batch', () => {
			const file = createNativeFileMock();

			setModelData( model, '<paragraph>[]foo</paragraph>' );

			model.change( writer => {
				expect( writer.batch.operations ).to.length( 0 );

				command.execute( { files: file } );

				expect( writer.batch.operations ).to.length.above( 0 );
			} );
		} );

		it( 'should not insert image nor crash when image could not be inserted', () => {
			const file = createNativeFileMock();

			model.schema.register( 'other', {
				allowIn: '$root',
				isLimit: true
			} );
			model.schema.extend( '$text', { allowIn: 'other' } );

			editor.conversion.for( 'downcast' ).add( downcastElementToElement( { model: 'other', view: 'p' } ) );

			setModelData( model, '<other>[]</other>' );

			command.execute( { files: file } );

			expect( getModelData( model ) ).to.equal( '<other>[]</other>' );
		} );

		it( 'should not throw when upload adapter is not set (FileRepository will log an error anyway)', () => {
			const file = createNativeFileMock();

			fileRepository.createUploadAdapter = undefined;

			const logStub = testUtils.sinon.stub( log, 'error' );

			setModelData( model, '<paragraph>fo[]o</paragraph>' );

			expect( () => {
				command.execute( { files: file } );
			} ).to.not.throw();

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[]o</paragraph>' );
			expect( logStub.calledOnce ).to.be.true;
		} );
	} );
} );
