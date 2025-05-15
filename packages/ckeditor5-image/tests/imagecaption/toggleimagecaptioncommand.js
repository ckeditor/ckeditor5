/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import ImageCaptionEditing from '../../src/imagecaption/imagecaptionediting.js';
import ImageBlockEditing from '../../src/image/imageblockediting.js';
import ImageInlineEditing from '../../src/image/imageinlineediting.js';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'ToggleImageCaptionCommand', () => {
	let editor, model, command;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				ImageBlockEditing,
				ImageInlineEditing,
				ImageCaptionEditing,
				Paragraph
			]
		} );

		model = editor.model;

		model.schema.register( 'nonImage', {
			inheritAllFrom: '$block',
			isObject: true,
			allowIn: '$root'
		} );

		model.schema.extend( 'caption', { allowIn: 'nonImage' } );

		editor.conversion.elementToElement( {
			model: 'nonImage',
			view: 'nonImage'
		} );

		editor.conversion.elementToElement( {
			model: 'caption',
			view: ( modelItem, { writer } ) => {
				if ( !modelItem.parent.is( 'element', 'nonImage' ) ) {
					return null;
				}

				return writer.createContainerElement( 'figcaption' );
			}
		} );

		command = editor.commands.get( 'toggleImageCaption' );
	} );

	afterEach( async () => {
		return editor.destroy();
	} );

	describe( '#isEnabled', () => {
		it( 'should be false if the ImageBlockEditing is not loaded', async () => {
			const editor = await VirtualTestEditor.create( {
				plugins: [
					ImageInlineEditing,
					ImageCaptionEditing,
					Paragraph
				]
			} );

			expect( editor.commands.get( 'toggleImageCaption' ).isEnabled ).to.be.false;

			return editor.destroy();
		} );

		it( 'should be false when no element is selected', () => {
			setModelData( model, '<paragraph>[]foo</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when an element which is neither an image or imageInline is selected', () => {
			setModelData( model, '[<paragraph>foo</paragraph>]' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true when image is selected', () => {
			setModelData( model, '[<imageBlock src="test.png"></imageBlock>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when imageInline is selected', () => {
			setModelData( model, '<paragraph>[<imageInline src="test.png"></imageInline>]</paragraph>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection is in the caption of an image', () => {
			setModelData( model, '<imageBlock src="test.png"><caption>[]</caption></imageBlock>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when the selection is in the caption of a non-image', () => {
			setModelData( model, '<nonImage><caption>z[]xc</caption></nonImage>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when there is more than an image or imageInline selected', () => {
			setModelData( model, '<paragraph>f[oo</paragraph><imageBlock src="test.png"></imageBlock><paragraph>b]ar</paragraph>' );

			expect( command.isEnabled ).to.be.false;

			setModelData( model, '<paragraph>f[oo<imageInline src="test.png"></imageInline>b]ar</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( '#value', () => {
		it( 'should be false if the ImageBlockEditing is not loaded', async () => {
			const editor = await VirtualTestEditor.create( {
				plugins: [
					ImageInlineEditing,
					ImageCaptionEditing,
					Paragraph
				]
			} );

			expect( editor.commands.get( 'toggleImageCaption' ).value ).to.be.false;

			return editor.destroy();
		} );

		it( 'should be false when no element is selected', () => {
			setModelData( model, '<paragraph>[]foo</paragraph>' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false when an element which is neither an image or imageInline is selected', () => {
			setModelData( model, '[<paragraph>foo</paragraph>]' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false when image without caption is selected', () => {
			setModelData( model, '[<imageBlock src="test.png"></imageBlock>]' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false when imageInline is selected', () => {
			setModelData( model, '<paragraph>[<imageInline src="test.png"></imageInline>]</paragraph>' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be true when image with an empty caption is selected', () => {
			setModelData( model, '[<imageBlock src="test.png"><caption></caption></imageBlock>]' );

			expect( command.value ).to.be.true;
		} );

		it( 'should be true when the selection is in the caption of an image', () => {
			setModelData( model, '<imageBlock src="test.png"><caption>[]</caption></imageBlock>' );

			expect( command.value ).to.be.true;
		} );

		it( 'should be false when the selection is in the caption of a non-image', () => {
			setModelData( model, '<nonImage><caption>[]</caption></nonImage>' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be true when image with a non-empty caption is selected', () => {
			setModelData( model, '[<imageBlock src="test.png"><caption>foo</caption></imageBlock>]' );

			expect( command.value ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		describe( 'for a block image without a caption being selected', () => {
			it( 'should add an empty caption element to the image', () => {
				setModelData( model, '[<imageBlock src="test.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"><caption></caption></imageBlock>]' );
			} );

			it( 'should add the caption element to the image and attempt to restore its content', () => {
				setModelData( model, '[<imageBlock src="test.png"><caption>foo</caption></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"><caption>foo</caption></imageBlock>]' );
			} );
		} );

		describe( 'for a block image with a caption being selected', () => {
			it( 'should remove the caption from the image and save it so it can be restored', () => {
				setModelData( model, '[<imageBlock src="test.png"><caption>foo</caption></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"><caption>foo</caption></imageBlock>]' );
			} );

			it( 'should remove the caption from the image and select the image if the selection was in the caption element', () => {
				setModelData( model, '<imageBlock src="test.png"><caption>fo[]o</caption></imageBlock>' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"><caption>foo</caption></imageBlock>]' );
			} );

			it( 'should save complex caption content and allow to restore it', () => {
				setModelData( model, '[<imageBlock src="test.png"><caption>foo<$text bold="true">bar</$text></caption></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal(
					'[<imageBlock src="test.png"><caption>foo<$text bold="true">bar</$text></caption></imageBlock>]'
				);
			} );

			it( 'should save the empty caption content', () => {
				const imgSrc = 'foo/bar.jpg';

				setModelData( model, `[<imageBlock src="${ imgSrc }"><caption>foo</caption></imageBlock>]` );

				editor.execute( 'toggleImageCaption' );
				editor.execute( 'toggleImageCaption' );

				const caption = model.document.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.remove( writer.createRangeIn( caption ) );
				} );

				editor.execute( 'toggleImageCaption' );
				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( `[<imageBlock src="${ imgSrc }"><caption></caption></imageBlock>]` );
			} );
		} );

		describe( 'for an imageInline being selected', () => {
			it( 'should execute the imageTypeBlock command and convert imageInline->image in the model', () => {
				const spy = sinon.spy( editor, 'execute' );

				setModelData( model, '<paragraph>[<imageInline src="test.png"></imageInline>]</paragraph>' );

				editor.execute( 'toggleImageCaption' );

				sinon.assert.calledTwice( spy );
				sinon.assert.calledWithExactly( spy.firstCall, 'toggleImageCaption' );
				sinon.assert.calledWithExactly( spy.secondCall, 'imageTypeBlock' );
			} );

			it( 'should add an empty caption element to the image', () => {
				setModelData( model, '<paragraph>[<imageInline src="test.png"></imageInline>]</paragraph>' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"><caption></caption></imageBlock>]' );
			} );

			it( 'should add the caption element to the image and attempt to restore its content', () => {
				setModelData( model, '[<imageBlock src="test.png"><caption>foo</caption></imageBlock>]' );

				editor.execute( 'imageTypeInline' );

				expect( getModelData( model ) ).to.equal( '<paragraph>[<imageInline src="test.png"></imageInline>]</paragraph>' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"><caption>foo</caption></imageBlock>]' );
			} );
		} );

		describe( 'the focusCaptionOnShow option', () => {
			it( 'should move the selection to the caption when adding a caption (new empty caption)', () => {
				setModelData( model, '[<imageBlock src="test.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				expect( getModelData( model ) ).to.equal( '<imageBlock src="test.png"><caption>[]</caption></imageBlock>' );
			} );

			it( 'should move the selection to the caption when restoring a caption', () => {
				setModelData( model, '[<imageBlock src="test.png"><caption>foo</caption></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				expect( getModelData( model ) ).to.equal( '<imageBlock src="test.png"><caption>[foo]</caption></imageBlock>' );
			} );

			it( 'should not affect removal of the caption (selection in the caption)', () => {
				setModelData( model, '<imageBlock src="test.png"><caption>foo[]</caption></imageBlock>' );

				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"></imageBlock>]' );
			} );

			it( 'should not affect removal of the caption (selection on the image)', () => {
				setModelData( model, '[<imageBlock src="test.png"><caption>foo</caption></imageBlock>]' );

				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				expect( getModelData( model ) ).to.equal( '[<imageBlock src="test.png"></imageBlock>]' );
			} );
		} );
	} );
} );
