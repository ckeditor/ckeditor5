/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ImageCaptionEditing from '../../src/imagecaption/imagecaptionediting';
import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageInlineEditing from '../../src/image/imageinlineediting';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

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
			setModelData( model, '[<image src="test.png"></image>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when imageInline is selected', () => {
			setModelData( model, '<paragraph>[<imageInline src="test.png"></imageInline>]</paragraph>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection is in the caption of an image', () => {
			setModelData( model, '<image src="test.png"><caption>[]</caption></image>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when the selection is in the caption of a non-image', () => {
			setModelData( model, '<nonImage><caption>z[]xc</caption></nonImage>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when there is more than an image or imageInline selected', () => {
			setModelData( model, '<paragraph>f[oo</paragraph><image src="test.png"></image><paragraph>b]ar</paragraph>' );

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
			setModelData( model, '[<image src="test.png"></image>]' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false when imageInline is selected', () => {
			setModelData( model, '<paragraph>[<imageInline src="test.png"></imageInline>]</paragraph>' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be true when image with an empty caption is selected', () => {
			setModelData( model, '[<image src="test.png"><caption></caption></image>]' );

			expect( command.value ).to.be.true;
		} );

		it( 'should be true when the selection is in the caption of an image', () => {
			setModelData( model, '<image src="test.png"><caption>[]</caption></image>' );

			expect( command.value ).to.be.true;
		} );

		it( 'should be false when the selection is in the caption of a non-image', () => {
			setModelData( model, '<nonImage><caption>[]</caption></nonImage>' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be true when image with a non-empty caption is selected', () => {
			setModelData( model, '[<image src="test.png"><caption>foo</caption></image>]' );

			expect( command.value ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		describe( 'for an image without a caption being selected', () => {
			it( 'should add an empty caption element to the image', () => {
				setModelData( model, '[<image src="test.png"></image>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<image src="test.png"><caption></caption></image>]' );
			} );

			it( 'should add the caption element to the image and attempt to restore its content from the attribute', () => {
				setModelData( model, '[<image caption=\'{"name":"caption","children":[{"data":"foo"}]}\' src="test.png"></image>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<image src="test.png"><caption>foo</caption></image>]' );
			} );
		} );

		describe( 'for an image with a caption being selected', () => {
			it( 'should remove the caption from the image and store its content in the caption attribute', () => {
				setModelData( model, '[<image src="test.png"><caption>foo</caption></image>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal(
					'[<image caption="{"name":"caption","children":[{"data":"foo"}]}" src="test.png"></image>]'
				);
			} );

			it( 'should remove the caption from the image and select the image if the selection was in the caption element', () => {
				setModelData( model, '<image src="test.png"><caption>fo[]o</caption></image>' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal(
					'[<image caption="{"name":"caption","children":[{"data":"foo"}]}" src="test.png"></image>]'
				);
			} );

			it( 'should store complex caption content in the caption attribute', () => {
				setModelData( model, '[<image src="test.png"><caption>foo<$text bold="true">bar</$text></caption></image>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal(
					'[<image ' +
						'caption="{"name":"caption","children":[{"data":"foo"},{"attributes":{"bold":true},"data":"bar"}]}"' +
						' src="test.png">' +
					'</image>]'
				);
			} );

			it( 'should not store the caption content in the caption attribute if empty', () => {
				setModelData( model, '[<image src="test.png"><caption></caption></image>]' );

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal(
					'[<image src="test.png"></image>]'
				);
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

				expect( getModelData( model ) ).to.equal( '[<image src="test.png"><caption></caption></image>]' );
			} );

			it( 'should add the caption element to the image and attempt to restore its content from the caption attribute', () => {
				setModelData( model,
					'<paragraph>' +
						'[<imageInline caption=\'{"name":"caption","children":[{"data":"foo"}]}\' src="test.png"></imageInline>]' +
					'</paragraph>'
				);

				editor.execute( 'toggleImageCaption' );

				expect( getModelData( model ) ).to.equal( '[<image src="test.png"><caption>foo</caption></image>]' );
			} );
		} );

		describe( 'the focusCaptionOnShow option', () => {
			it( 'should move the selection to the caption when adding a caption (new empty caption)', () => {
				setModelData( model, '[<image src="test.png"></image>]' );

				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				expect( getModelData( model ) ).to.equal( '<image src="test.png"><caption>[]</caption></image>' );
			} );

			it( 'should move the selection to the caption when adding a caption (restoring caption from an attribute)', () => {
				setModelData( model, '[<image src="test.png" caption=\'{"name":"caption","children":[{"data":"foo"}]}\'></image>]' );

				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				expect( getModelData( model ) ).to.equal( '<image src="test.png"><caption>[foo]</caption></image>' );
			} );

			it( 'should not affect removal of the caption (selection in the caption)', () => {
				setModelData( model, '<image src="test.png"><caption>foo[]</caption></image>' );

				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				expect( getModelData( model ) ).to.equal(
					'[<image caption="{"name":"caption","children":[{"data":"foo"}]}" src="test.png"></image>]'
				);
			} );

			it( 'should not affect removal of the caption (selection on the image)', () => {
				setModelData( model, '[<image src="test.png"><caption>foo</caption></image>]' );

				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				expect( getModelData( model ) ).to.equal(
					'[<image caption="{"name":"caption","children":[{"data":"foo"}]}" src="test.png"></image>]'
				);
			} );
		} );
	} );
} );
