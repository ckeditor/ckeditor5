/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import ImageInline from '../../src/image/imageinlineediting';
import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageCaptionEditing from '../../src/imagecaption/imagecaptionediting';

describe( 'ImageTypeCommand', () => {
	let editor, blockCommand, inlineCommand, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ ImageBlockEditing, ImageInline, ImageCaptionEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				blockCommand = editor.commands.get( 'imageTypeBlock' );
				inlineCommand = editor.commands.get( 'imageTypeInline' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		describe( 'block command', () => {
			it( 'should be false when the selection directly in the root', () => {
				model.enqueueChange( 'transparent', () => {
					setModelData( model, '[]' );

					blockCommand.refresh();
					expect( blockCommand.isEnabled ).to.be.false;
				} );
			} );

			it( 'should be false when the selection is in empty block', () => {
				setModelData( model, '<paragraph>[]</paragraph>' );

				expect( blockCommand.isEnabled ).to.be.false;
			} );

			it( 'should be false when the selection directly in a paragraph', () => {
				setModelData( model, '<paragraph>foo[]</paragraph>' );
				expect( blockCommand.isEnabled ).to.be.false;
			} );

			it( 'should be false when the selection directly in a block', () => {
				model.schema.register( 'block', { inheritAllFrom: '$block' } );
				model.schema.extend( '$text', { allowIn: 'block' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

				setModelData( model, '<block>foo[]</block>' );
				expect( blockCommand.isEnabled ).to.be.false;
			} );

			it( 'should be false when the selection is on a block image', () => {
				setModelData( model, '[<image></image>]' );
				expect( blockCommand.isEnabled ).to.be.false;
			} );

			it( 'should be true when the selection is an inline image', () => {
				setModelData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );
				expect( blockCommand.isEnabled ).to.be.true;
			} );

			it( 'should be false when the selection is inside other image', () => {
				setModelData( model, '<image><caption>[]</caption></image>' );
				expect( blockCommand.isEnabled ).to.be.false;
			} );

			it( 'should be false when the selection is on other object', () => {
				model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );
				setModelData( model, '[<object></object>]' );

				expect( blockCommand.isEnabled ).to.be.false;
			} );
		} );

		describe( 'inline command', () => {
			it( 'should be false when the selection directly in the root', () => {
				model.enqueueChange( 'transparent', () => {
					setModelData( model, '[]' );

					inlineCommand.refresh();
					expect( inlineCommand.isEnabled ).to.be.false;
				} );
			} );

			it( 'should be false when the selection is in empty block', () => {
				setModelData( model, '<paragraph>[]</paragraph>' );

				expect( inlineCommand.isEnabled ).to.be.false;
			} );

			it( 'should be false when the selection directly in a paragraph', () => {
				setModelData( model, '<paragraph>foo[]</paragraph>' );
				expect( inlineCommand.isEnabled ).to.be.false;
			} );

			it( 'should be false when the selection directly in a block', () => {
				model.schema.register( 'block', { inheritAllFrom: '$block' } );
				model.schema.extend( '$text', { allowIn: 'block' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

				setModelData( model, '<block>foo[]</block>' );
				expect( inlineCommand.isEnabled ).to.be.false;
			} );

			it( 'should be true when the selection is on a block image', () => {
				setModelData( model, '[<image></image>]' );
				expect( inlineCommand.isEnabled ).to.be.true;
			} );

			it( 'should be false when the selection is on an inline image', () => {
				setModelData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );
				expect( inlineCommand.isEnabled ).to.be.false;
			} );

			it( 'should be false when the selection is inside other image', () => {
				setModelData( model, '<image><caption>[]</caption></image>' );
				expect( blockCommand.isEnabled ).to.be.false;
			} );

			it( 'should be false when the selection is on other object', () => {
				model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );
				setModelData( model, '[<object></object>]' );

				expect( inlineCommand.isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'block command', () => {
			it( 'should convert inline image to block image', () => {
				const imgSrc = 'foo/bar.jpg';

				setModelData( model, `<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal( `[<image src="${ imgSrc }"></image>]` );
			} );

			it( 'should convert inline image with alt attribute to block image', () => {
				const imgSrc = 'foo/bar.jpg';

				setModelData( model,
					`<paragraph>
						[<imageInline alt="alt text" src="${ imgSrc }"></imageInline>]
						</paragraph>`
				);

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`[<image alt="alt text" src="${ imgSrc }"></image>]`
				);
			} );

			it( 'should convert inline image with srcset attribute to block image', () => {
				const imgSrc = 'foo/bar.jpg';

				setModelData( model,
					`<paragraph>
						[<imageInline src="${ imgSrc }" srcset='{ "data": "small.png 148w, big.png 1024w" }'></imageInline>]
						</paragraph>`
				);

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`[<image src="${ imgSrc }" srcset="{"data":"small.png 148w, big.png 1024w"}"></image>]`
				);
			} );

			it( 'should convert inline image with caption attribute to block image', () => {
				const imgSrc = 'foo/bar.jpg';

				setModelData( model,
					`<paragraph>
						[<imageInline caption="foo" src="${ imgSrc }"></imageInline>]
						</paragraph>`
				);

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`[<image caption="foo" src="${ imgSrc }"></image>]`
				);
			} );

			it( 'should not convert if "src" attribute is not set', () => {
				setModelData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal( '<paragraph>[<imageInline></imageInline>]</paragraph>' );
			} );
		} );

		describe( 'inline command', () => {
			it( 'should convert block image to inline image', () => {
				const imgSrc = 'foo/bar.jpg';

				setModelData( model, `[<image src="${ imgSrc }"></image>]` );

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>`
				);
			} );

			it( 'should convert block image with alt attribute to inline image', () => {
				const imgSrc = 'foo/bar.jpg';

				setModelData( model,
					`[<image src="${ imgSrc }" alt="alt text"></image>]`
				);

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
					`[<imageInline alt="alt text" src="${ imgSrc }"></imageInline>]` +
					'</paragraph>'
				);
			} );

			it( 'should convert block image with srcset attribute to inline image', () => {
				const imgSrc = 'foo/bar.jpg';

				setModelData( model,
					`[<image src="${ imgSrc }" srcset='{ "data": "small.png 148w, big.png 1024w" }'></image>]`
				);

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
					`[<imageInline src="${ imgSrc }" srcset="{"data":"small.png 148w, big.png 1024w"}"></imageInline>]` +
					'</paragraph>'
				);
			} );

			it( 'should convert block image with caption attribute to inline image', () => {
				const imgSrc = 'foo/bar.jpg';

				setModelData( model,
					`[<image caption="foo" src="${ imgSrc }"></image>]`
				);

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
					`[<imageInline caption="foo" src="${ imgSrc }"></imageInline>]` +
					'</paragraph>'
				);
			} );
		} );
	} );
} );
