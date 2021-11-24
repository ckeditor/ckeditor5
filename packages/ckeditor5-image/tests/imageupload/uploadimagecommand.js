/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import UploadImageCommand from '../../src/imageupload/uploadimagecommand';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';

import { createNativeFileMock, UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ImageBlockEditing from '../../src/image/imageblockediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageInlineEditing from '../../src/image/imageinlineediting';

describe( 'UploadImageCommand', () => {
	let editor, command, model, fileRepository;

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
				plugins: [ FileRepository, ImageBlockEditing, ImageInlineEditing, Paragraph, UploadAdapterPluginMock ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new UploadImageCommand( editor );

				const schema = model.schema;
				schema.extend( 'imageBlock', { allowAttributes: 'uploadId' } );
				schema.extend( 'imageInline', { allowAttributes: 'uploadId' } );
			} );
	} );

	afterEach( () => {
		sinon.restore();

		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true when the selection directly in the root', () => {
			model.enqueueChange( 'transparent', () => {
				setModelData( model, '[]' );

				command.refresh();
				expect( command.isEnabled ).to.be.true;
			} );
		} );

		it( 'should be true when the selection is in empty block', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection directly in a paragraph', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( '$text', { allowIn: 'block' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block>foo[]</block>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection is on other image', () => {
			setModelData( model, '[<imageBlock></imageBlock>]' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when the selection is inside other image', () => {
			model.schema.register( 'caption', {
				allowIn: 'imageBlock',
				allowContentOf: '$block',
				isLimit: true
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'caption', view: 'figcaption' } );
			setModelData( model, '<imageBlock><caption>[]</caption></imageBlock>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true when the selection is on other object', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );
			setModelData( model, '[<object></object>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection is inside block element inside isLimit element which allows image', () => {
			model.schema.register( 'table', { allowWhere: '$block', isLimit: true, isObject: true, isBlock: true } );
			model.schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
			model.schema.register( 'tableCell', { allowIn: 'tableRow', isLimit: true, isSelectable: true } );
			model.schema.extend( '$block', { allowIn: 'tableCell' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'table', view: 'table' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableRow', view: 'tableRow' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableCell', view: 'tableCell' } );

			setModelData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
		} );

		it( 'should be false when schema disallows image', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( 'paragraph', { allowIn: 'block' } );
			// Block image in block.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'imageBlock' && context.last.name === 'block' ) {
					return false;
				}
				if ( childDefinition.name === 'imageInline' && context.last.name === 'paragraph' ) {
					return false;
				}
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should insert image at selection position as other widgets', () => {
			const file = createNativeFileMock();
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( { file } );

			const id = fileRepository.getLoader( file ).id;
			expect( getModelData( model ) )
				.to.equal( `<paragraph>f[<imageInline uploadId="${ id }"></imageInline>]o</paragraph>` );
		} );

		it( 'should insert multiple images at selection position, one after another', () => {
			const file = [ createNativeFileMock(), createNativeFileMock(), createNativeFileMock() ];
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( { file } );

			const idA = fileRepository.getLoader( file[ 0 ] ).id;
			const idB = fileRepository.getLoader( file[ 1 ] ).id;
			const idC = fileRepository.getLoader( file[ 2 ] ).id;

			expect( getModelData( model ) ).to.equal(
				'<paragraph>f' +
					`<imageInline uploadId="${ idA }"></imageInline>` +
					`<imageInline uploadId="${ idB }"></imageInline>` +
					`[<imageInline uploadId="${ idC }"></imageInline>]` +
				'o</paragraph>'
			);
		} );

		it( 'should use parent batch', () => {
			const file = createNativeFileMock();

			setModelData( model, '<paragraph>[]foo</paragraph>' );

			model.change( writer => {
				expect( writer.batch.operations ).to.length( 0 );

				command.execute( { file } );

				expect( writer.batch.operations ).to.length.above( 0 );
			} );
		} );

		it( 'should not insert image nor crash when image could not be inserted', () => {
			const file = createNativeFileMock();

			model.schema.register( 'other', {
				allowIn: '$root',
				allowChildren: '$text',
				isLimit: true
			} );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'other', view: 'p' } );

			setModelData( model, '<other>[]</other>' );

			command.execute( { file } );

			expect( getModelData( model ) ).to.equal( '<other>[]</other>' );
		} );

		it( 'should not throw when upload adapter is not set (FileRepository will log an warn anyway)', () => {
			const file = createNativeFileMock();

			fileRepository.createUploadAdapter = undefined;

			const consoleWarnStub = sinon.stub( console, 'warn' );

			setModelData( model, '<paragraph>fo[]o</paragraph>' );

			expect( () => {
				command.execute( { file } );
			} ).to.not.throw();

			expect( getModelData( model ) ).to.equal( '<paragraph>fo[]o</paragraph>' );
			sinon.assert.calledOnce( consoleWarnStub );
		} );

		it( 'should set document selection attributes on an image to maintain attribute continuity in downcast (e.g. links)', () => {
			editor.model.schema.extend( '$text', { allowAttributes: [ 'foo', 'bar', 'baz' ] } );

			const file = createNativeFileMock();
			setModelData( model, '<paragraph><$text bar="b" baz="c" foo="a">f[o]o</$text></paragraph>' );

			command.execute( { file } );

			const id = fileRepository.getLoader( file ).id;

			expect( getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text bar="b" baz="c" foo="a">f</$text>' +
					`[<imageInline bar="b" baz="c" foo="a" uploadId="${ id }"></imageInline>]` +
					'<$text bar="b" baz="c" foo="a">o</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should set document selection attributes on multiple images to maintain attribute continuity in downcast (e.g. links)', () => {
			editor.model.schema.extend( '$text', { allowAttributes: [ 'foo', 'bar', 'baz' ] } );

			const file = [ createNativeFileMock(), createNativeFileMock(), createNativeFileMock() ];
			setModelData( model, '<paragraph><$text bar="b" baz="c" foo="a">f[o]o</$text></paragraph>' );

			command.execute( { file } );

			const idA = fileRepository.getLoader( file[ 0 ] ).id;
			const idB = fileRepository.getLoader( file[ 1 ] ).id;
			const idC = fileRepository.getLoader( file[ 2 ] ).id;

			expect( getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text bar="b" baz="c" foo="a">f</$text>' +
					`<imageInline bar="b" baz="c" foo="a" uploadId="${ idA }"></imageInline>` +
					`<imageInline bar="b" baz="c" foo="a" uploadId="${ idB }"></imageInline>` +
					`[<imageInline bar="b" baz="c" foo="a" uploadId="${ idC }"></imageInline>]` +
					'<$text bar="b" baz="c" foo="a">o</$text>' +
				'</paragraph>'
			);
		} );
	} );
} );
