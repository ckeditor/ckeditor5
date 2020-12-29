/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Image from '../../src/image/imageediting';
import ImageInlineToBlockCommand from '../../src/image/imageinlinetoblockcommand';

describe( 'ImageInlineToBlockCommand', () => {
	let editor, command, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Image, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new ImageInlineToBlockCommand( editor );

				const schema = model.schema;
				schema.extend( 'image', { allowAttributes: 'uploadId' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be false when the selection directly in the root', () => {
			model.enqueueChange( 'transparent', () => {
				setModelData( model, '[]' );

				command.refresh();
				expect( command.isEnabled ).to.be.false;
			} );
		} );

		it( 'should be false when the selection is in empty block', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when the selection directly in a paragraph', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( '$text', { allowIn: 'block' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block>foo[]</block>' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when the selection is an block image', () => {
			setModelData( model, '[<image></image>]' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true when the selection is an inline image', () => {
			setModelData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when the selection is inside other image', () => {
			model.schema.register( 'caption', {
				allowIn: 'image',
				allowContentOf: '$block',
				isLimit: true
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'caption', view: 'figcaption' } );
			setModelData( model, '<image><caption>[]</caption></image>' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when the selection is on other object', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );
			setModelData( model, '[<object></object>]' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should convert inline image to block image', () => {
			const imgSrc = 'foo/bar.jpg';

			setModelData( model, `<paragraph>[<imageInline alt="alt text" src="${ imgSrc }" srcset="{}"></imageInline>]</paragraph>` );

			command.execute();

			expect( getModelData( model ) ).to.equal( `[<image alt="alt text" src="${ imgSrc }" srcset="{}"></image>]` );
		} );

		it( 'should not convert if "src" attribute is not set', () => {
			setModelData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal( '<paragraph>[<imageInline></imageInline>]</paragraph>' );
		} );
	} );
} );
