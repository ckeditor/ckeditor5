/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import ImageInsertCommand from '../../src/image/imageinsertcommand';
import Image from '../../src/image/imageediting';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageInsertCommand', () => {
	let editor, command, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Image, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new ImageInsertCommand( editor );

				const schema = model.schema;
				schema.extend( 'image', { allowAttributes: 'uploadId' } );
			} );
	} );

	afterEach( () => {
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

		it( 'should be false when the selection is on other image', () => {
			setModelData( model, '[<image></image>]' );
			expect( command.isEnabled ).to.be.false;
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

		it( 'should be true when the selection is inside isLimit element which allows image', () => {
			model.schema.register( 'outerObject', { isObject: true, isBlock: true, allowIn: '$root' } );
			model.schema.register( 'limit', { isLimit: true, allowIn: 'outerObject' } );
			model.schema.extend( '$block', { allowIn: 'limit' } );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'outerObject', view: 'outerObject' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'limit', view: 'limit' } );

			setModelData( model, '<outerObject><limit>[]</limit></outerObject>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection is inside isLimit element which allows image', () => {
			model.schema.register( 'outerObject', { isObject: true, isBlock: true, allowIn: '$root' } );
			model.schema.register( 'limit', { isLimit: true, allowIn: 'outerObject' } );
			model.schema.extend( '$block', { allowIn: 'limit' } );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'outerObject', view: 'outerObject' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'limit', view: 'limit' } );

			setModelData( model, '<outerObject><limit><paragraph>foo[]</paragraph></limit></outerObject>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when schema disallows image', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( 'paragraph', { allowIn: 'block' } );
			// Block image in block.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'image' && context.last.name === 'block' ) {
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
			const imgSrc = 'foo/bar.jpg';

			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( { source: imgSrc } );

			expect( getModelData( model ) ).to.equal( `[<image src="${ imgSrc }"></image>]<paragraph>foo</paragraph>` );
		} );

		it( 'should insert multiple images at selection position as other widgets', () => {
			const imgSrc1 = 'foo/bar.jpg';
			const imgSrc2 = 'foo/baz.jpg';

			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( { source: [ imgSrc1, imgSrc2 ] } );

			expect( getModelData( model ) )
				.to.equal( `<image src="${ imgSrc1 }"></image>[<image src="${ imgSrc2 }"></image>]<paragraph>foo</paragraph>` );
		} );

		it( 'should not insert image nor crash when image could not be inserted', () => {
			const imgSrc = 'foo/bar.jpg';

			model.schema.register( 'other', {
				allowIn: '$root',
				isLimit: true
			} );
			model.schema.extend( '$text', { allowIn: 'other' } );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'other', view: 'p' } );

			setModelData( model, '<other>[]</other>' );

			command.execute( { source: imgSrc } );

			expect( getModelData( model ) ).to.equal( '<other>[]</other>' );
		} );
	} );
} );
