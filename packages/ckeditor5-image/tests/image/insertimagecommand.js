/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import InsertImageCommand from '../../src/image/insertimagecommand';
import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageInlineEditing from '../../src/image/imageinlineediting';

describe( 'InsertImageCommand', () => {
	let editor, command, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new InsertImageCommand( editor );

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

		it( 'should be true when the selection is on another image', () => {
			setModelData( model, '[<image></image>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when the selection is inside another image', () => {
			model.schema.register( 'caption', {
				allowIn: 'image',
				allowContentOf: '$block',
				isLimit: true
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'caption', view: 'figcaption' } );

			setModelData( model, '<image><caption>[]</caption></image>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true when the selection is on another object', () => {
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

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when schema disallows image', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( 'paragraph', { allowIn: 'block' } );
			// Block image in block.
			model.schema.addChildCheck( ( context, childDefinition ) => {
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
			const imgSrc = 'foo/bar.jpg';

			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( { source: imgSrc } );

			expect( getModelData( model ) ).to.equal( `<paragraph>f[<imageInline src="${ imgSrc }"></imageInline>]o</paragraph>` );
		} );

		it( 'should insert multiple images at selection position as other widgets for inline type images', () => {
			const imgSrc1 = 'foo/bar.jpg';
			const imgSrc2 = 'foo/baz.jpg';

			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( { source: [ imgSrc1, imgSrc2 ] } );

			expect( getModelData( model ) )
				.to.equal(
					'<paragraph>' +
						`f<imageInline src="${ imgSrc1 }"></imageInline>[<imageInline src="${ imgSrc2 }"></imageInline>]o` +
					'</paragraph>'
				);
		} );

		it( 'should insert multiple images at selection position as other widgets for block type images', () => {
			const imgSrc1 = 'foo/bar.jpg';
			const imgSrc2 = 'foo/baz.jpg';

			setModelData( model, '[]' );

			command.execute( { source: [ imgSrc1, imgSrc2 ] } );

			expect( getModelData( model ) )
				.to.equal( `<image src="${ imgSrc1 }"></image>[<image src="${ imgSrc2 }"></image>]` );
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

		it( 'should replace an existing selected object with an image', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

			setModelData( model, '<paragraph>foo</paragraph>[<object></object>]<paragraph>bar</paragraph>' );

			command.execute( { source: 'foo/bar.jpg' } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>[<image src="foo/bar.jpg"></image>]<paragraph>bar</paragraph>'
			);
		} );

		it( 'should replace a selected object with multiple block images', () => {
			const imgSrc1 = 'foo/bar.jpg';
			const imgSrc2 = 'foo/baz.jpg';

			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

			setModelData( model, '<paragraph>foo</paragraph>[<object></object>]<paragraph>bar</paragraph>' );

			command.execute( { source: [ imgSrc1, imgSrc2 ] } );

			expect( getModelData( model ) ).to.equal(
				`<paragraph>foo</paragraph><image src="${ imgSrc1 }"></image>[<image src="${ imgSrc2 }"></image>]<paragraph>bar</paragraph>`
			);
		} );

		it( 'should replace a selected inline object with multiple inline images', () => {
			const imgSrc1 = 'foo/bar.jpg';
			const imgSrc2 = 'foo/baz.jpg';

			model.schema.register( 'placeholder', {
				allowWhere: '$text',
				isInline: true,
				isObject: true
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'placeholder', view: 'placeholder' } );

			setModelData( model, '<paragraph>foo[<placeholder></placeholder>]bar</paragraph>' );

			command.execute( { source: [ imgSrc1, imgSrc2 ] } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo' +
					`<imageInline src="${ imgSrc1 }"></imageInline>[<imageInline src="${ imgSrc2 }"></imageInline>]` +
				'bar</paragraph>'
			);
		} );

		it( 'should replace a selected block image with another block image', () => {
			setModelData( model, '<paragraph>foo</paragraph>[<image src="foo/bar.jpg"></image>]<paragraph>bar</paragraph>' );

			command.execute( { source: 'new/image.jpg' } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>[<image src="new/image.jpg"></image>]<paragraph>bar</paragraph>'
			);
		} );

		it( 'should replace a selected inline image with another inline image', () => {
			setModelData( model, '<paragraph>foo[<imageInline src="foo/bar.jpg"></imageInline>]bar</paragraph>' );

			command.execute( { source: 'new/image.jpg' } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo[<imageInline src="new/image.jpg"></imageInline>]bar</paragraph>'
			);
		} );
	} );
} );
