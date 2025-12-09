/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { ImageCaptionEditing } from '../../src/imagecaption/imagecaptionediting.js';
import { ImageBlockEditing } from '../../src/image/imageblockediting.js';
import { ImageInlineEditing } from '../../src/image/imageinlineediting.js';

import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';

describe( 'ToggleImageCaptionCommand', () => {
	let editor, model, command;

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
		vi.restoreAllMocks();

		if ( editor ) {
			await editor.destroy();
			editor = null;
		}
	} );

	describe( '#isEnabled', () => {
		it( 'should be false if the ImageBlockEditing is not loaded', async () => {
			const localEditor = await VirtualTestEditor.create( {
				plugins: [
					ImageInlineEditing,
					ImageCaptionEditing,
					Paragraph
				]
			} );

			expect( localEditor.commands.get( 'toggleImageCaption' ).isEnabled ).toBe( false );

			return localEditor.destroy();
		} );

		it( 'should be false when no element is selected', () => {
			_setModelData( model, '<paragraph>[]foo</paragraph>' );

			expect( command.isEnabled ).toBe( false );
		} );

		it( 'should be false when an element which is neither an image or imageInline is selected', () => {
			_setModelData( model, '[<paragraph>foo</paragraph>]' );

			expect( command.isEnabled ).toBe( false );
		} );

		it( 'should be true when image is selected', () => {
			_setModelData( model, '[<imageBlock src="sample.png"></imageBlock>]' );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be true when imageInline is selected', () => {
			_setModelData( model, '<paragraph>[<imageInline src="sample.png"></imageInline>]</paragraph>' );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be true when the selection is in the caption of an image', () => {
			_setModelData( model, '<imageBlock src="sample.png"><caption>[]</caption></imageBlock>' );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be false when the selection is in the caption of a non-image', () => {
			_setModelData( model, '<nonImage><caption>z[]xc</caption></nonImage>' );

			expect( command.isEnabled ).toBe( false );
		} );

		it( 'should be false when there is more than an image or imageInline selected', () => {
			_setModelData(
				model,
				'<paragraph>f[oo</paragraph><imageBlock src="sample.png"></imageBlock><paragraph>b]ar</paragraph>'
			);

			expect( command.isEnabled ).toBe( false );

			_setModelData( model, '<paragraph>f[oo<imageInline src="sample.png"></imageInline>b]ar</paragraph>' );

			expect( command.isEnabled ).toBe( false );
		} );
	} );

	describe( '#value', () => {
		it( 'should be false if the ImageBlockEditing is not loaded', async () => {
			const localEditor = await VirtualTestEditor.create( {
				plugins: [
					ImageInlineEditing,
					ImageCaptionEditing,
					Paragraph
				]
			} );

			expect( localEditor.commands.get( 'toggleImageCaption' ).value ).toBe( false );

			return localEditor.destroy();
		} );

		it( 'should be false when no element is selected', () => {
			_setModelData( model, '<paragraph>[]foo</paragraph>' );

			expect( command.value ).toBe( false );
		} );

		it( 'should be false when an element which is neither an image or imageInline is selected', () => {
			_setModelData( model, '[<paragraph>foo</paragraph>]' );

			expect( command.value ).toBe( false );
		} );

		it( 'should be false when image without caption is selected', () => {
			_setModelData( model, '[<imageBlock src="sample.png"></imageBlock>]' );

			expect( command.value ).toBe( false );
		} );

		it( 'should be false when imageInline is selected', () => {
			_setModelData( model, '<paragraph>[<imageInline src="sample.png"></imageInline>]</paragraph>' );

			expect( command.value ).toBe( false );
		} );

		it( 'should be true when image with an empty caption is selected', () => {
			_setModelData( model, '[<imageBlock src="sample.png"><caption></caption></imageBlock>]' );

			expect( command.value ).toBe( true );
		} );

		it( 'should be true when the selection is in the caption of an image', () => {
			_setModelData( model, '<imageBlock src="sample.png"><caption>[]</caption></imageBlock>' );

			expect( command.value ).toBe( true );
		} );

		it( 'should be false when the selection is in the caption of a non-image', () => {
			_setModelData( model, '<nonImage><caption>[]</caption></nonImage>' );

			expect( command.value ).toBe( false );
		} );

		it( 'should be true when image with a non-empty caption is selected', () => {
			_setModelData( model, '[<imageBlock src="sample.png"><caption>foo</caption></imageBlock>]' );

			expect( command.value ).toBe( true );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'for a block image without a caption being selected', () => {
			it( 'should add an empty caption element to the image', () => {
				_setModelData( model, '[<imageBlock src="sample.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"><caption></caption></imageBlock>]' );
			} );

			it( 'should add the caption element to the image and attempt to restore its content', () => {
				_setModelData( model, '[<imageBlock src="sample.png"><caption>foo</caption></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"><caption>foo</caption></imageBlock>]' );
			} );
		} );

		describe( 'for a block image with a caption being selected', () => {
			it( 'should remove the caption from the image and save it so it can be restored', () => {
				_setModelData( model, '[<imageBlock src="sample.png"><caption>foo</caption></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"><caption>foo</caption></imageBlock>]' );
			} );

			it( 'should remove the caption from the image and select the image if the selection was in the caption element', () => {
				_setModelData( model, '<imageBlock src="sample.png"><caption>fo[]o</caption></imageBlock>' );

				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"><caption>foo</caption></imageBlock>]' );
			} );

			it( 'should save complex caption content and allow to restore it', () => {
				_setModelData(
					model,
					'[<imageBlock src="sample.png"><caption>foo<$text bold="true">bar</$text></caption></imageBlock>]'
				);

				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe(
					'[<imageBlock src="sample.png"><caption>foo<$text bold="true">bar</$text></caption></imageBlock>]'
				);
			} );

			it( 'should save the empty caption content', () => {
				const imgSrc = 'sample.png';

				_setModelData( model, `[<imageBlock src="${ imgSrc }"><caption>foo</caption></imageBlock>]` );

				editor.execute( 'toggleImageCaption' );
				editor.execute( 'toggleImageCaption' );

				const caption = model.document.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.remove( writer.createRangeIn( caption ) );
				} );

				editor.execute( 'toggleImageCaption' );
				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe( `[<imageBlock src="${ imgSrc }"><caption></caption></imageBlock>]` );
			} );
		} );

		describe( 'for an imageInline being selected', () => {
			it( 'should execute the imageTypeBlock command and convert imageInline->image in the model', () => {
				const spy = vi.spyOn( editor, 'execute' );

				_setModelData( model, '<paragraph>[<imageInline src="sample.png"></imageInline>]</paragraph>' );

				editor.execute( 'toggleImageCaption' );

				expect( spy ).toHaveBeenCalledTimes( 2 );
				expect( spy ).toHaveBeenNthCalledWith( 1, 'toggleImageCaption' );
				expect( spy ).toHaveBeenNthCalledWith( 2, 'imageTypeBlock' );
			} );

			it( 'should add an empty caption element to the image', () => {
				_setModelData( model, '<paragraph>[<imageInline src="sample.png"></imageInline>]</paragraph>' );

				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"><caption></caption></imageBlock>]' );
			} );

			it( 'should add the caption element to the image and attempt to restore its content', () => {
				_setModelData( model, '[<imageBlock src="sample.png"><caption>foo</caption></imageBlock>]' );

				editor.execute( 'imageTypeInline' );

				expect( _getModelData( model ) ).toBe( '<paragraph>[<imageInline src="sample.png"></imageInline>]</paragraph>' );

				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"><caption>foo</caption></imageBlock>]' );
			} );
		} );

		describe( 'the focusCaptionOnShow option', () => {
			it( 'should move the selection to the caption when adding a caption (new empty caption)', () => {
				_setModelData( model, '[<imageBlock src="sample.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				expect( _getModelData( model ) ).toBe( '<imageBlock src="sample.png"><caption>[]</caption></imageBlock>' );
			} );

			it( 'should move the selection to the caption when restoring a caption', () => {
				_setModelData( model, '[<imageBlock src="sample.png"><caption>foo</caption></imageBlock>]' );

				editor.execute( 'toggleImageCaption' );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"></imageBlock>]' );

				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				expect( _getModelData( model ) ).toBe( '<imageBlock src="sample.png"><caption>[foo]</caption></imageBlock>' );
			} );

			it( 'should not affect removal of the caption (selection in the caption)', () => {
				_setModelData( model, '<imageBlock src="sample.png"><caption>foo[]</caption></imageBlock>' );

				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"></imageBlock>]' );
			} );

			it( 'should not affect removal of the caption (selection on the image)', () => {
				_setModelData( model, '[<imageBlock src="sample.png"><caption>foo</caption></imageBlock>]' );

				editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );

				expect( _getModelData( model ) ).toBe( '[<imageBlock src="sample.png"></imageBlock>]' );
			} );
		} );
	} );
} );
