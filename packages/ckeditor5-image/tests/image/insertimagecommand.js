/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

import { InsertImageCommand } from '../../src/image/insertimagecommand.js';
import { ImageBlockEditing } from '../../src/image/imageblockediting.js';
import { ImageInlineEditing } from '../../src/image/imageinlineediting.js';

describe( 'InsertImageCommand', () => {
	let editor, command, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ],
				image: { insert: { type: 'auto' } }
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new InsertImageCommand( editor );

				const schema = model.schema;
				schema.extend( 'imageBlock', { allowAttributes: 'uploadId' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true when the selection directly in the root', () => {
			model.enqueueChange( { isUndoable: false }, () => {
				_setModelData( model, '[]' );

				command.refresh();
				expect( command.isEnabled ).toBe( true );
			} );
		} );

		it( 'should be true when the selection is in empty block', () => {
			_setModelData( model, '<paragraph>[]</paragraph>' );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be true when the selection directly in a paragraph', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be true when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block', allowChildren: '$text' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			_setModelData( model, '<block>foo[]</block>' );
			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be true when the selection is on another image', () => {
			_setModelData( model, '[<imageBlock></imageBlock>]' );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be false when the selection is inside another image', () => {
			model.schema.register( 'caption', {
				allowIn: 'imageBlock',
				allowContentOf: '$block',
				isLimit: true
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'caption', view: 'figcaption' } );

			_setModelData( model, '<imageBlock><caption>[]</caption></imageBlock>' );

			expect( command.isEnabled ).toBe( false );
		} );

		it( 'should be true when the selection is on another object', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

			_setModelData( model, '[<object></object>]' );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be true when the selection is inside block element inside isLimit element which allows image', () => {
			model.schema.register( 'table', { allowWhere: '$block', isLimit: true, isObject: true, isBlock: true } );
			model.schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
			model.schema.register( 'tableCell', { allowIn: 'tableRow', isLimit: true, isSelectable: true } );
			model.schema.extend( '$block', { allowIn: 'tableCell' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'table', view: 'table' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableRow', view: 'tableRow' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableCell', view: 'tableCell' } );

			_setModelData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );

			expect( command.isEnabled ).toBe( true );
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

			_setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			expect( command.isEnabled ).toBe( false );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should insert image at selection position as other widgets', () => {
			const imgSrc = 'assets/sample.png';

			_setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( { source: imgSrc } );

			expect( _getModelData( model ) ).toBe( `<paragraph>f[<imageInline src="${ imgSrc }"></imageInline>]o</paragraph>` );
		} );

		it( 'should be possible to specify image type as image (imageBlock)', () => {
			const imgSrc = 'assets/sample.png';

			_setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( {
				imageType: 'imageBlock',
				source: imgSrc
			} );

			expect( _getModelData( model ) ).toBe( `[<imageBlock src="${ imgSrc }"></imageBlock>]<paragraph>foo</paragraph>` );
		} );

		it( 'should be possible to specify image type as image (imageInline)', () => {
			const imgSrc1 = 'assets/sample.png';
			const imgSrc2 = 'assets/sample2.png';

			_setModelData( model, '[]' );

			command.execute( {
				imageType: 'imageInline',
				source: [ imgSrc1, imgSrc2 ]
			} );

			expect( _getModelData( model ) )
				.toBe(
					`<paragraph><imageInline src="${ imgSrc1 }"></imageInline>` +
					`[<imageInline src="${ imgSrc2 }"></imageInline>]</paragraph>`
				);
		} );

		it( 'should be possible to break the block with an inserted image', () => {
			const imgSrc = 'assets/sample.png';

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );

			command.execute( {
				imageType: 'imageBlock',
				source: imgSrc,
				breakBlock: true
			} );

			expect( _getModelData( model ) ).toBe(
				`<paragraph>f</paragraph>[<imageBlock src="${ imgSrc }"></imageBlock>]<paragraph>oo</paragraph>`
			);
		} );

		it( 'should insert multiple images at selection position as other widgets for inline type images', () => {
			const imgSrc1 = 'assets/sample.png';
			const imgSrc2 = 'assets/sample2.png';

			_setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( { source: [ imgSrc1, imgSrc2 ] } );

			expect( _getModelData( model ) )
				.toBe(
					'<paragraph>' +
						`f<imageInline src="${ imgSrc1 }"></imageInline>[<imageInline src="${ imgSrc2 }"></imageInline>]o` +
					'</paragraph>'
				);
		} );

		it( 'should insert multiple images at selection position as other widgets for block type images', () => {
			const imgSrc1 = 'assets/sample.png';
			const imgSrc2 = 'assets/sample2.png';

			_setModelData( model, '[]' );

			command.execute( { source: [ imgSrc1, imgSrc2 ] } );

			expect( _getModelData( model ) )
				.toBe( `<imageBlock src="${ imgSrc1 }"></imageBlock>[<imageBlock src="${ imgSrc2 }"></imageBlock>]` );
		} );

		it( 'should not insert image nor crash when image could not be inserted', () => {
			const imgSrc = 'assets/sample.png';

			model.schema.register( 'other', {
				allowIn: '$root',
				isLimit: true
			} );
			model.schema.extend( '$text', { allowIn: 'other' } );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'other', view: 'p' } );

			_setModelData( model, '<other>[]</other>' );

			command.execute( { source: imgSrc } );

			expect( _getModelData( model ) ).toBe( '<other>[]</other>' );
		} );

		it( 'should replace an existing selected object with an image', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

			_setModelData( model, '<paragraph>foo</paragraph>[<object></object>]<paragraph>bar</paragraph>' );

			command.execute( { source: 'assets/sample.png' } );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>foo</paragraph>[<imageBlock src="assets/sample.png"></imageBlock>]<paragraph>bar</paragraph>'
			);
		} );

		it( 'should replace a selected object with multiple block images', () => {
			const imgSrc1 = 'assets/sample.png';
			const imgSrc2 = 'assets/sample2.png';

			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

			_setModelData( model, '<paragraph>foo</paragraph>[<object></object>]<paragraph>bar</paragraph>' );

			command.execute( { source: [ imgSrc1, imgSrc2 ] } );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>foo</paragraph>' +
				`<imageBlock src="${ imgSrc1 }"></imageBlock>[<imageBlock src="${ imgSrc2 }"></imageBlock>]<paragraph>bar</paragraph>`
			);
		} );

		it( 'should replace a selected inline object with multiple inline images', () => {
			const imgSrc1 = 'assets/sample.png';
			const imgSrc2 = 'assets/sample2.png';

			model.schema.register( 'placeholder', {
				allowWhere: '$text',
				isInline: true,
				isObject: true
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'placeholder', view: 'placeholder' } );

			_setModelData( model, '<paragraph>foo[<placeholder></placeholder>]bar</paragraph>' );

			command.execute( { source: [ imgSrc1, imgSrc2 ] } );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>foo' +
					`<imageInline src="${ imgSrc1 }"></imageInline>[<imageInline src="${ imgSrc2 }"></imageInline>]` +
				'bar</paragraph>'
			);
		} );

		it( 'should replace a selected block image with another block image', () => {
			_setModelData(
				model,
				'<paragraph>foo</paragraph>[<imageBlock src="assets/sample.png"></imageBlock>]<paragraph>bar</paragraph>'
			);

			command.execute( { source: 'assets/sample2.png' } );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>foo</paragraph>[<imageBlock src="assets/sample2.png"></imageBlock>]<paragraph>bar</paragraph>'
			);
		} );

		it( 'should replace a selected inline image with another inline image', () => {
			_setModelData( model, '<paragraph>foo[<imageInline src="assets/sample.png"></imageInline>]bar</paragraph>' );

			command.execute( { source: 'assets/sample2.png' } );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>foo[<imageInline src="assets/sample2.png"></imageInline>]bar</paragraph>'
			);
		} );

		it( 'should set document selection attributes on an image to maintain their continuity in downcast (e.g. links)', () => {
			editor.model.schema.extend( '$text', { allowAttributes: [ 'foo', 'bar', 'baz' ] } );

			const imgSrc = 'assets/sample.png';

			_setModelData( model, '<paragraph><$text bar="b" baz="c" foo="a">f[o]o</$text></paragraph>' );

			command.execute( { source: imgSrc } );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>' +
					'<$text bar="b" baz="c" foo="a">f</$text>' +
					'[<imageInline bar="b" baz="c" foo="a" src="assets/sample.png"></imageInline>]' +
					'<$text bar="b" baz="c" foo="a">o</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should allow to set all image attributes declaratively (single image)', () => {
			const imgSrc = 'assets/sample.png';

			editor.model.schema.extend( 'imageInline', {
				allowAttributes: [ 'foo', 'bar' ]
			} );

			_setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( {
				source: {
					src: imgSrc,
					foo: 'foo-value'
				}
			} );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>f' +
					`[<imageInline foo="foo-value" src="${ imgSrc }"></imageInline>]` +
				'o</paragraph>'
			);
		} );

		it( 'should allow to set all image attributes declaratively (multiple images)', () => {
			const imgSrc1 = 'assets/sample.png';
			const imgSrc2 = 'assets/sample2.png';

			editor.model.schema.extend( 'imageInline', {
				allowAttributes: [ 'foo', 'bar' ]
			} );

			_setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( {
				source: [
					{
						src: imgSrc1,
						foo: 'foo-value'
					},
					{
						src: imgSrc2,
						bar: 'bar-value'
					}
				]
			} );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>f' +
					`<imageInline foo="foo-value" src="${ imgSrc1 }"></imageInline>` +
					`[<imageInline bar="bar-value" src="${ imgSrc2 }"></imageInline>]` +
				'o</paragraph>'
			);
		} );

		describe( 'inheriting attributes', () => {
			const imgSrc = 'assets/sample.png';

			beforeEach( () => {
				const attributes = [ 'smart', 'pretty' ];

				model.schema.extend( '$block', {
					allowAttributes: attributes
				} );

				model.schema.extend( '$blockObject', {
					allowAttributes: attributes
				} );

				for ( const attribute of attributes ) {
					model.schema.setAttributeProperties( attribute, {
						copyOnReplace: true
					} );
				}
			} );

			it( 'should copy $block attributes on a block image element when inserting it in $block', () => {
				_setModelData( model, '<paragraph pretty="true" smart="true">[]</paragraph>' );

				command.execute( {
					source: {
						src: imgSrc
					}
				} );

				expect( _getModelData( model ) ).toEqualMarkup(
					'[<imageBlock pretty="true" smart="true" src="assets/sample.png"></imageBlock>]'
				);
			} );

			it( 'should not copy $block attributes on an inline image element when inserting it in $block', () => {
				_setModelData( model, '<paragraph pretty="true" smart="true">Foo []</paragraph>' );

				command.execute( {
					source: {
						src: imgSrc
					}
				} );

				expect( _getModelData( model ) ).toEqualMarkup(
					'<paragraph pretty="true" smart="true">' +
						'Foo [<imageInline src="assets/sample.png"></imageInline>]' +
					'</paragraph>'
				);
			} );

			it( 'should not copy attributes when inserting inline image (non-collapsed selection)', () => {
				_setModelData( model, '<paragraph pretty="true">[foo</paragraph><paragraph smart="true">bar]</paragraph>' );

				command.execute( {
					source: {
						src: imgSrc
					}
				} );

				expect( _getModelData( model ) ).toEqualMarkup(
					'<paragraph>' +
						'[<imageInline src="assets/sample.png"></imageInline>]' +
					'</paragraph>'
				);
			} );

			it( 'should only copy $block attributes marked with copyOnReplace', () => {
				_setModelData( model, '<paragraph pretty="true" smart="true" nice="true">[]</paragraph>' );

				command.execute( {
					source: {
						src: imgSrc
					}
				} );

				expect( _getModelData( model ) ).toEqualMarkup(
					'[<imageBlock pretty="true" smart="true" src="assets/sample.png"></imageBlock>]'
				);
			} );

			it( 'should copy attributes from object when it is selected during insertion', () => {
				model.schema.register( 'object', { isObject: true, inheritAllFrom: '$blockObject' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

				_setModelData( model, '[<object pretty="true" smart="true"></object>]' );

				command.execute( {
					source: {
						src: imgSrc
					}
				} );

				expect( _getModelData( model ) ).toEqualMarkup(
					'[<imageBlock pretty="true" smart="true" src="assets/sample.png"></imageBlock>]'
				);
			} );
		} );
	} );

	describe( 'execute() in an inline-only insertion context', () => {
		describe( 'with $inlineRoot as the editor root', () => {
			let inlineEditor, inlineModel;

			beforeEach( async () => {
				inlineEditor = await VirtualTestEditor.create( {
					plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ],
					root: { modelElement: '$inlineRoot' }
				} );
				inlineModel = inlineEditor.model;
			} );

			afterEach( () => inlineEditor.destroy() );

			it( 'should insert an inline image when image.insert.type is not set (defaults to block)', () => {
				_setModelData( inlineModel, 'foo[]bar' );

				inlineEditor.execute( 'insertImage', { source: 'assets/sample.png' } );

				expect( _getModelData( inlineModel ) ).toBe(
					'foo[<imageInline src="assets/sample.png"></imageInline>]bar'
				);
			} );

			it( 'should insert an inline image when image.insert.type is set to "block"', () => {
				inlineEditor.config.set( 'image.insert.type', 'block' );

				_setModelData( inlineModel, 'foo[]bar' );

				inlineEditor.execute( 'insertImage', { source: 'assets/sample.png' } );

				expect( _getModelData( inlineModel ) ).toBe(
					'foo[<imageInline src="assets/sample.png"></imageInline>]bar'
				);
			} );

			it( 'should insert an inline image when image.insert.type is set to "auto"', () => {
				inlineEditor.config.set( 'image.insert.type', 'auto' );

				_setModelData( inlineModel, 'foo[]bar' );

				inlineEditor.execute( 'insertImage', { source: 'assets/sample.png' } );

				expect( _getModelData( inlineModel ) ).toBe(
					'foo[<imageInline src="assets/sample.png"></imageInline>]bar'
				);
			} );

			it( 'should not silently fall back to inline when caller passes explicit imageType="imageBlock"', () => {
				_setModelData( inlineModel, 'foo[]bar' );

				inlineEditor.execute( 'insertImage', {
					source: 'assets/sample.png',
					imageType: 'imageBlock'
				} );

				// The schema rejects imageBlock inside $inlineRoot, so insertContent leaves the root unchanged.
				// The key assertion is that no imageInline was inserted - the explicit caller choice is respected
				// over the inline-root override.
				expect( _getModelData( inlineModel ) ).not.toMatch( /imageInline/ );
			} );

			it( 'should insert an inline image when the root is empty', () => {
				_setModelData( inlineModel, '[]' );

				inlineEditor.execute( 'insertImage', { source: 'assets/sample.png' } );

				expect( _getModelData( inlineModel ) ).toBe(
					'[<imageInline src="assets/sample.png"></imageInline>]'
				);
			} );
		} );

		describe( 'with a deeper container that disallows imageBlock', () => {
			let editor, model;

			beforeEach( async () => {
				editor = await VirtualTestEditor.create( {
					plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ]
				} );
				model = editor.model;

				// A limit element that allows blocks like a paragraph but explicitly disallows imageBlock as a child.
				model.schema.register( 'inlineOnlyContainer', {
					allowIn: '$root',
					allowContentOf: '$root',
					isLimit: true
				} );
				model.schema.addChildCheck( ( context, childDefinition ) => {
					if ( context.endsWith( 'inlineOnlyContainer' ) && childDefinition.name === 'imageBlock' ) {
						return false;
					}
				} );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'inlineOnlyContainer', view: 'div' } );
			} );

			afterEach( () => editor.destroy() );

			it( 'should insert an inline image even though the default config is "block"', () => {
				_setModelData( model, '<inlineOnlyContainer><paragraph>foo[]bar</paragraph></inlineOnlyContainer>' );

				editor.execute( 'insertImage', { source: 'assets/sample.png' } );

				expect( _getModelData( model ) ).toBe(
					'<inlineOnlyContainer>' +
						'<paragraph>foo[<imageInline src="assets/sample.png"></imageInline>]bar</paragraph>' +
					'</inlineOnlyContainer>'
				);
			} );
		} );
	} );
} );
