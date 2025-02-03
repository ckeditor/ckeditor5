/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import InsertImageCommand from '../../src/image/insertimagecommand.js';
import ImageBlockEditing from '../../src/image/imageblockediting.js';
import ImageInlineEditing from '../../src/image/imageinlineediting.js';

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
			model.schema.register( 'block', { inheritAllFrom: '$block', allowChildren: '$text' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block>foo[]</block>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection is on another image', () => {
			setModelData( model, '[<imageBlock></imageBlock>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when the selection is inside another image', () => {
			model.schema.register( 'caption', {
				allowIn: 'imageBlock',
				allowContentOf: '$block',
				isLimit: true
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'caption', view: 'figcaption' } );

			setModelData( model, '<imageBlock><caption>[]</caption></imageBlock>' );

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

		it( 'should be possible to specify image type as image (imageBlock)', () => {
			const imgSrc = 'foo/bar.jpg';

			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( {
				imageType: 'imageBlock',
				source: imgSrc
			} );

			expect( getModelData( model ) ).to.equal( `[<imageBlock src="${ imgSrc }"></imageBlock>]<paragraph>foo</paragraph>` );
		} );

		it( 'should be possible to specify image type as image (imageInline)', () => {
			const imgSrc1 = 'foo/bar.jpg';
			const imgSrc2 = 'foo/baz.jpg';

			setModelData( model, '[]' );

			command.execute( {
				imageType: 'imageInline',
				source: [ imgSrc1, imgSrc2 ]
			} );

			expect( getModelData( model ) )
				.to.equal(
					`<paragraph><imageInline src="${ imgSrc1 }"></imageInline>` +
					`[<imageInline src="${ imgSrc2 }"></imageInline>]</paragraph>`
				);
		} );

		it( 'should be possible to break the block with an inserted image', () => {
			const imgSrc = 'foo/bar.jpg';

			setModelData( model, '<paragraph>f[]oo</paragraph>' );

			command.execute( {
				imageType: 'imageBlock',
				source: imgSrc,
				breakBlock: true
			} );

			expect( getModelData( model ) ).to.equal(
				`<paragraph>f</paragraph>[<imageBlock src="${ imgSrc }"></imageBlock>]<paragraph>oo</paragraph>`
			);
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
				.to.equal( `<imageBlock src="${ imgSrc1 }"></imageBlock>[<imageBlock src="${ imgSrc2 }"></imageBlock>]` );
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
				'<paragraph>foo</paragraph>[<imageBlock src="foo/bar.jpg"></imageBlock>]<paragraph>bar</paragraph>'
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
				'<paragraph>foo</paragraph>' +
				`<imageBlock src="${ imgSrc1 }"></imageBlock>[<imageBlock src="${ imgSrc2 }"></imageBlock>]<paragraph>bar</paragraph>`
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
			setModelData( model, '<paragraph>foo</paragraph>[<imageBlock src="foo/bar.jpg"></imageBlock>]<paragraph>bar</paragraph>' );

			command.execute( { source: 'new/image.jpg' } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph>[<imageBlock src="new/image.jpg"></imageBlock>]<paragraph>bar</paragraph>'
			);
		} );

		it( 'should replace a selected inline image with another inline image', () => {
			setModelData( model, '<paragraph>foo[<imageInline src="foo/bar.jpg"></imageInline>]bar</paragraph>' );

			command.execute( { source: 'new/image.jpg' } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo[<imageInline src="new/image.jpg"></imageInline>]bar</paragraph>'
			);
		} );

		it( 'should set document selection attributes on an image to maintain their continuity in downcast (e.g. links)', () => {
			editor.model.schema.extend( '$text', { allowAttributes: [ 'foo', 'bar', 'baz' ] } );

			const imgSrc = 'foo/bar.jpg';

			setModelData( model, '<paragraph><$text bar="b" baz="c" foo="a">f[o]o</$text></paragraph>' );

			command.execute( { source: imgSrc } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text bar="b" baz="c" foo="a">f</$text>' +
					'[<imageInline bar="b" baz="c" foo="a" src="foo/bar.jpg"></imageInline>]' +
					'<$text bar="b" baz="c" foo="a">o</$text>' +
				'</paragraph>'
			);
		} );

		it( 'should allow to set all image attributes declaratively (single image)', () => {
			const imgSrc = 'foo/bar.jpg';

			editor.model.schema.extend( 'imageInline', {
				allowAttributes: [ 'foo', 'bar' ]
			} );

			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute( {
				source: {
					src: imgSrc,
					foo: 'foo-value'
				}
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>f' +
					`[<imageInline foo="foo-value" src="${ imgSrc }"></imageInline>]` +
				'o</paragraph>'
			);
		} );

		it( 'should allow to set all image attributes declaratively (multiple images)', () => {
			const imgSrc1 = 'foo/bar.jpg';
			const imgSrc2 = 'foo/baz.jpg';

			editor.model.schema.extend( 'imageInline', {
				allowAttributes: [ 'foo', 'bar' ]
			} );

			setModelData( model, '<paragraph>f[o]o</paragraph>' );

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

			expect( getModelData( model ) ).to.equal(
				'<paragraph>f' +
					`<imageInline foo="foo-value" src="${ imgSrc1 }"></imageInline>` +
					`[<imageInline bar="bar-value" src="${ imgSrc2 }"></imageInline>]` +
				'o</paragraph>'
			);
		} );

		describe( 'inheriting attributes', () => {
			const imgSrc = '/foo.jpg';

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
				setModelData( model, '<paragraph pretty="true" smart="true">[]</paragraph>' );

				command.execute( {
					source: {
						src: imgSrc
					}
				} );

				expect( getModelData( model ) ).to.equalMarkup(
					'[<imageBlock pretty="true" smart="true" src="/foo.jpg"></imageBlock>]'
				);
			} );

			it( 'should not copy $block attributes on an inline image element when inserting it in $block', () => {
				setModelData( model, '<paragraph pretty="true" smart="true">Foo []</paragraph>' );

				command.execute( {
					source: {
						src: imgSrc
					}
				} );

				expect( getModelData( model ) ).to.equalMarkup(
					'<paragraph pretty="true" smart="true">' +
						'Foo [<imageInline src="/foo.jpg"></imageInline>]' +
					'</paragraph>'
				);
			} );

			it( 'should not copy attributes when inserting inline image (non-collapsed selection)', () => {
				setModelData( model, '<paragraph pretty="true">[foo</paragraph><paragraph smart="true">bar]</paragraph>' );

				command.execute( {
					source: {
						src: imgSrc
					}
				} );

				expect( getModelData( model ) ).to.equalMarkup(
					'<paragraph>' +
						'[<imageInline src="/foo.jpg"></imageInline>]' +
					'</paragraph>'
				);
			} );

			it( 'should only copy $block attributes marked with copyOnReplace', () => {
				setModelData( model, '<paragraph pretty="true" smart="true" nice="true">[]</paragraph>' );

				command.execute( {
					source: {
						src: imgSrc
					}
				} );

				expect( getModelData( model ) ).to.equalMarkup(
					'[<imageBlock pretty="true" smart="true" src="/foo.jpg"></imageBlock>]'
				);
			} );

			it( 'should copy attributes from object when it is selected during insertion', () => {
				model.schema.register( 'object', { isObject: true, inheritAllFrom: '$blockObject' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

				setModelData( model, '[<object pretty="true" smart="true"></object>]' );

				command.execute( {
					source: {
						src: imgSrc
					}
				} );

				expect( getModelData( model ) ).to.equalMarkup(
					'[<imageBlock pretty="true" smart="true" src="/foo.jpg"></imageBlock>]'
				);
			} );
		} );
	} );
} );
