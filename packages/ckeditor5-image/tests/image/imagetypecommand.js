/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import ImageInline from '../../src/image/imageinlineediting.js';
import ImageBlockEditing from '../../src/image/imageblockediting.js';
import ImageCaptionEditing from '../../src/imagecaption/imagecaptionediting.js';

describe( 'ImageTypeCommand', () => {
	let editor, blockCommand, inlineCommand, model, root;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ ImageBlockEditing, ImageInline, ImageCaptionEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot();

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
				model.enqueueChange( { isUndoable: false }, () => {
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
				setModelData( model, '[<imageBlock></imageBlock>]' );
				expect( blockCommand.isEnabled ).to.be.false;
			} );

			it( 'should be true when the selection is an inline image', () => {
				setModelData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );
				expect( blockCommand.isEnabled ).to.be.true;
			} );

			it( 'should be false when the selection is inside other image', () => {
				setModelData( model, '<imageBlock><caption>[]</caption></imageBlock>' );
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
				model.enqueueChange( { isUndoable: false }, () => {
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
				setModelData( model, '[<imageBlock></imageBlock>]' );
				expect( inlineCommand.isEnabled ).to.be.true;
			} );

			it( 'should be false when the selection is on an inline image', () => {
				setModelData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );
				expect( inlineCommand.isEnabled ).to.be.false;
			} );

			it( 'should be false when the selection is on other object', () => {
				model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );
				setModelData( model, '[<object></object>]' );

				expect( inlineCommand.isEnabled ).to.be.false;
			} );

			it( 'should be true when the selection is in a block image caption', () => {
				setModelData( model, '<imageBlock><caption>[]Foo</caption></imageBlock>' );

				expect( inlineCommand.isEnabled ).to.be.true;
			} );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'block command', () => {
			const imgSrc = 'foo/bar.jpg';

			it( 'should return an object containing the old and new image elements', () => {
				setModelData( model, `<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` );

				const oldElement = model.document.getRoot().getChild( 0 ).getChild( 0 );
				const returned = blockCommand.execute();

				expect( getModelData( model ) ).to.equal( `[<imageBlock src="${ imgSrc }"></imageBlock>]` );

				const newElement = model.document.getRoot().getChild( 0 );

				expect( returned ).to.deep.equal( { oldElement, newElement } );
			} );

			it( 'should convert inline image to block image', () => {
				setModelData( model, `<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal( `[<imageBlock src="${ imgSrc }"></imageBlock>]` );
			} );

			it( 'should convert inline image with alt attribute to block image', () => {
				setModelData( model,
					`<paragraph>
						[<imageInline alt="alt text" src="${ imgSrc }"></imageInline>]
					</paragraph>`
				);

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`[<imageBlock alt="alt text" src="${ imgSrc }"></imageBlock>]`
				);
			} );

			it( 'should convert inline image with srcset attribute to block image', () => {
				setModelData( model,
					`<paragraph>
						[<imageInline src="${ imgSrc }" srcset="small.png 148w, big.png 1024w"></imageInline>]
					</paragraph>`
				);

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`[<imageBlock src="${ imgSrc }" srcset="small.png 148w, big.png 1024w"></imageBlock>]`
				);
			} );

			it( 'should not convert if "src" attribute is not set', () => {
				setModelData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );

				const returned = blockCommand.execute();

				expect( getModelData( model ) ).to.equal( '<paragraph>[<imageInline></imageInline>]</paragraph>' );
				expect( returned ).to.be.null;
			} );

			it( 'should convert if "src" attribute is not set (but "uploadId" is) because this is what happens during image upload', () => {
				model.schema.extend( 'imageBlock', {
					allowAttributes: 'uploadId'
				} );

				model.schema.extend( 'imageInline', {
					allowAttributes: 'uploadId'
				} );

				setModelData( model, '<paragraph>[<imageInline uploadId="1234"></imageInline>]</paragraph>' );

				const oldElement = model.document.getRoot().getChild( 0 ).getChild( 0 );
				const returned = blockCommand.execute();
				const newElement = model.document.getRoot().getChild( 0 );

				expect( getModelData( model ) ).to.equal( '[<imageBlock uploadId="1234"></imageBlock>]' );
				expect( returned ).to.deep.equal( { oldElement, newElement } );
			} );

			it( 'should not convert an inline image to a block image if it is not allowed by the schema', () => {
				model.schema.addChildCheck( ( context, childDefinition ) => {
					if ( childDefinition.name == 'imageBlock' ) {
						return false;
					}
				} );

				setModelData( model, `<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` );

				const result = blockCommand.execute();

				expect( result ).to.be.null;
				expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			} );

			it( 'should set width and height attributes when converting inline image to block image', async () => {
				setModelData( model,
					'<paragraph>' +
						'[<imageInline src="/assets/sample.png"></imageInline>]' +
					'</paragraph>'
				);

				blockCommand.execute();
				await timeout( 100 );

				expect( getModelData( model ) ).to.equal(
					'[<imageBlock height="96" src="/assets/sample.png" width="96"></imageBlock>]'
				);
			} );

			it( 'should not set width and height when command `setImageSizes` parameter is false', async () => {
				setModelData( model,
					'<paragraph>' +
						'[<imageInline src="/assets/sample.png"></imageInline>]' +
					'</paragraph>'
				);

				blockCommand.execute( { setImageSizes: false } );
				await timeout( 100 );

				expect( getModelData( model ) ).to.equal(
					'[<imageBlock src="/assets/sample.png"></imageBlock>]'
				);
			} );

			describe( 'should preserve markers', () => {
				it( 'on the image while converting inline image to block image', () => {
					setModelData( model, `<paragraph>foo[<imageInline src="${ imgSrc }"></imageInline>]bar</paragraph>` );

					model.change( writer => {
						writer.addMarker( 'foo', {
							range: model.document.selection.getFirstRange(),
							usingOperation: true
						} );
					} );

					blockCommand.execute();

					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						`[<imageBlock src="${ imgSrc }"></imageBlock>]` +
						'<paragraph>bar</paragraph>'
					);

					const expectedRange = model.createRangeOn( root.getChild( 1 ) );

					expect( model.markers.get( 'foo' ).getRange().isEqual( expectedRange ) ).to.be.true;
				} );

				it( 'ending on the image while converting inline image to block image', () => {
					setModelData( model, `<paragraph>foo[<imageInline src="${ imgSrc }"></imageInline>]bar</paragraph>` );

					model.change( writer => {
						writer.addMarker( 'foo', {
							range: model.createRange(
								model.createPositionFromPath( root, [ 0, 1 ] ),
								model.createPositionFromPath( root, [ 0, 4 ] )
							),
							usingOperation: true
						} );
					} );

					blockCommand.execute();

					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						`[<imageBlock src="${ imgSrc }"></imageBlock>]` +
						'<paragraph>bar</paragraph>'
					);

					const expectedRange = model.createRange(
						model.createPositionFromPath( root, [ 0, 1 ] ),
						model.createPositionFromPath( root, [ 2 ] )
					);

					expect( model.markers.get( 'foo' ).getRange().isEqual( expectedRange ) ).to.be.true;
				} );

				it( 'starting on the image while converting inline image to block image', () => {
					setModelData( model, `<paragraph>foo[<imageInline src="${ imgSrc }"></imageInline>]bar</paragraph>` );

					model.change( writer => {
						writer.addMarker( 'foo', {
							range: model.createRange(
								model.createPositionFromPath( root, [ 0, 3 ] ),
								model.createPositionFromPath( root, [ 0, 6 ] )
							),
							usingOperation: true
						} );
					} );

					blockCommand.execute();

					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						`[<imageBlock src="${ imgSrc }"></imageBlock>]` +
						'<paragraph>bar</paragraph>'
					);

					const expectedRange = model.createRange(
						model.createPositionFromPath( root, [ 1 ] ),
						model.createPositionFromPath( root, [ 2, 2 ] )
					);

					expect( model.markers.get( 'foo' ).getRange().isEqual( expectedRange ) ).to.be.true;
				} );

				it( 'overlapping the image while converting inline image to block image', () => {
					setModelData( model, `<paragraph>foo[<imageInline src="${ imgSrc }"></imageInline>]bar</paragraph>` );

					model.change( writer => {
						writer.addMarker( 'foo', {
							range: model.createRange(
								model.createPositionFromPath( root, [ 0, 1 ] ),
								model.createPositionFromPath( root, [ 0, 6 ] )
							),
							usingOperation: true
						} );
					} );

					blockCommand.execute();

					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						`[<imageBlock src="${ imgSrc }"></imageBlock>]` +
						'<paragraph>bar</paragraph>'
					);

					const expectedRange = model.createRange(
						model.createPositionFromPath( root, [ 0, 1 ] ),
						model.createPositionFromPath( root, [ 2, 2 ] )
					);

					expect( model.markers.get( 'foo' ).getRange().isEqual( expectedRange ) ).to.be.true;
				} );
			} );

			it( 'should not preserve markers inside the image element', () => {
				setModelData( model, `<paragraph>foo[<imageInline src="${ imgSrc }"></imageInline>]bar</paragraph>` );

				model.change( writer => {
					writer.addMarker( 'foo', {
						range: model.createRange(
							model.createPositionFromPath( root, [ 0, 3, 0 ] ),
							model.createPositionFromPath( root, [ 0, 3, 0 ] )
						),
						usingOperation: true
					} );
				} );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					`[<imageBlock src="${ imgSrc }"></imageBlock>]` +
					'<paragraph>bar</paragraph>'
				);

				expect( model.markers.get( 'foo' ).getRange().root.rootName ).to.equal( '$graveyard' );
			} );
		} );

		describe( 'inline command', () => {
			const imgSrc = 'foo/bar.jpg';

			it( 'should return an object containing the old and new image elements', () => {
				const imgSrc = 'foo/bar.jpg';

				setModelData( model, `[<imageBlock src="${ imgSrc }"></imageBlock>]` );

				const oldElement = model.document.getRoot().getChild( 0 );
				const returned = inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>`
				);

				const newElement = model.document.getRoot().getChild( 0 ).getChild( 0 );

				expect( returned ).to.deep.equal( { oldElement, newElement } );
			} );

			it( 'should convert block image to inline image', () => {
				setModelData( model, `[<imageBlock src="${ imgSrc }"></imageBlock>]` );

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>`
				);
			} );

			it( 'should convert block image with alt attribute to inline image', () => {
				setModelData( model,
					`[<imageBlock src="${ imgSrc }" alt="alt text"></imageBlock>]`
				);

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						`[<imageInline alt="alt text" src="${ imgSrc }"></imageInline>]` +
					'</paragraph>'
				);
			} );

			it( 'should convert block image with srcset attribute to inline image', () => {
				setModelData( model,
					`[<imageBlock src="${ imgSrc }" srcset="small.png 148w, big.png 1024w"></imageBlock>]`
				);

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						`[<imageInline src="${ imgSrc }" srcset="small.png 148w, big.png 1024w"></imageInline>]` +
					'</paragraph>'
				);
			} );

			it( 'should convert and set selection on the new image if the selection is in a block image caption', () => {
				setModelData( model, `<imageBlock src="${ imgSrc }"><caption>[]Foo</caption></imageBlock>` );

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
					`[<imageInline src="${ imgSrc }"></imageInline>]` +
					'</paragraph>'
				);
			} );

			it( 'should not convert a block image to an inline image if it is not allowed by the schema', () => {
				model.schema.register( 'block', {
					inheritAllFrom: '$block',
					allowChildren: 'imageBlock'
				} );

				editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

				model.schema.addChildCheck( ( context, childDefinition ) => {
					if ( childDefinition.name == 'imageInline' ) {
						return false;
					}
				} );

				setModelData( model, `<block>[<imageBlock src="${ imgSrc }"></imageBlock>]</block>` );

				const result = inlineCommand.execute();

				expect( result ).to.be.null;
				expect( getModelData( model ) ).to.equal( '<block>[]</block>' );
			} );

			it( 'should set width and height attributes when converting block image to inline image', async () => {
				setModelData( model, '[<imageBlock src="/assets/sample.png"></imageBlock>]' );

				inlineCommand.execute();
				await timeout( 100 );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>[<imageInline height="96" src="/assets/sample.png" width="96"></imageInline>]</paragraph>'
				);
			} );

			it( 'should not set width and height when command `setImageSizes` parameter is false', async () => {
				setModelData( model, '[<imageBlock src="/assets/sample.png"></imageBlock>]' );

				inlineCommand.execute( { setImageSizes: false } );
				await timeout( 100 );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>[<imageInline src="/assets/sample.png"></imageInline>]</paragraph>'
				);
			} );

			describe( 'should preserve markers', () => {
				it( 'on the image while converting block image to inline image', () => {
					setModelData( model,
						'<paragraph>foo</paragraph>' +
						`[<imageBlock src="${ imgSrc }"></imageBlock>]` +
						'<paragraph>bar</paragraph>'
					);

					model.change( writer => {
						writer.addMarker( 'foo', {
							range: model.document.selection.getFirstRange(),
							usingOperation: true
						} );
					} );

					inlineCommand.execute();

					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						`<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` +
						'<paragraph>bar</paragraph>'
					);

					const expectedRange = model.createRangeOn( root.getNodeByPath( [ 1, 0 ] ) );

					expect( model.markers.get( 'foo' ).getRange().isEqual( expectedRange ) ).to.be.true;
				} );

				it( 'ending on the image while converting block image to inline image', () => {
					setModelData( model,
						'<paragraph>foo</paragraph>' +
						`[<imageBlock src="${ imgSrc }"></imageBlock>]` +
						'<paragraph>bar</paragraph>'
					);

					model.change( writer => {
						writer.addMarker( 'foo', {
							range: model.createRange(
								model.createPositionFromPath( root, [ 0, 1 ] ),
								model.createPositionFromPath( root, [ 2 ] )
							),
							usingOperation: true
						} );
					} );

					inlineCommand.execute();

					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						`<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` +
						'<paragraph>bar</paragraph>'
					);

					const expectedRange = model.createRange(
						model.createPositionFromPath( root, [ 0, 1 ] ),
						model.createPositionFromPath( root, [ 1, 1 ] )
					);

					expect( model.markers.get( 'foo' ).getRange().isEqual( expectedRange ) ).to.be.true;
				} );

				it( 'starting on the image while converting block image to inline image', () => {
					setModelData( model,
						'<paragraph>foo</paragraph>' +
						`[<imageBlock src="${ imgSrc }"></imageBlock>]` +
						'<paragraph>bar</paragraph>'
					);

					model.change( writer => {
						writer.addMarker( 'foo', {
							range: model.createRange(
								model.createPositionFromPath( root, [ 1 ] ),
								model.createPositionFromPath( root, [ 2, 2 ] )
							),
							usingOperation: true
						} );
					} );

					inlineCommand.execute();

					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						`<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` +
						'<paragraph>bar</paragraph>'
					);

					const expectedRange = model.createRange(
						model.createPositionFromPath( root, [ 1, 0 ] ),
						model.createPositionFromPath( root, [ 2, 2 ] )
					);

					expect( model.markers.get( 'foo' ).getRange().isEqual( expectedRange ) ).to.be.true;
				} );

				it( 'overlapping the image while converting block image to inline image', () => {
					setModelData( model,
						'<paragraph>foo</paragraph>' +
						`[<imageBlock src="${ imgSrc }"></imageBlock>]` +
						'<paragraph>bar</paragraph>'
					);

					model.change( writer => {
						writer.addMarker( 'foo', {
							range: model.createRange(
								model.createPositionFromPath( root, [ 0, 1 ] ),
								model.createPositionFromPath( root, [ 2, 2 ] )
							),
							usingOperation: true
						} );
					} );

					inlineCommand.execute();

					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						`<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` +
						'<paragraph>bar</paragraph>'
					);

					const expectedRange = model.createRange(
						model.createPositionFromPath( root, [ 0, 1 ] ),
						model.createPositionFromPath( root, [ 2, 2 ] )
					);

					expect( model.markers.get( 'foo' ).getRange().isEqual( expectedRange ) ).to.be.true;
				} );
			} );

			it( 'should not preserve markers inside the image element', () => {
				setModelData( model,
					'<paragraph>foo</paragraph>' +
					`[<imageBlock src="${ imgSrc }"></imageBlock>]` +
					'<paragraph>bar</paragraph>'
				);

				model.change( writer => {
					writer.addMarker( 'foo', {
						range: model.createRange(
							model.createPositionFromPath( root, [ 1, 0 ] ),
							model.createPositionFromPath( root, [ 1, 0 ] )
						),
						usingOperation: true
					} );
				} );

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					`<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` +
					'<paragraph>bar</paragraph>'
				);

				expect( model.markers.get( 'foo' ).getRange().root.rootName ).to.equal( '$graveyard' );
			} );
		} );

		describe( 'integration with ImageCaptionEditing', () => {
			it( 'should preserve the caption so it can be restored', () => {
				const imgSrc = 'foo/bar.jpg';

				setModelData( model, `[<imageBlock src="${ imgSrc }"><caption>foo</caption></imageBlock>]` );

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>`
				);

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`[<imageBlock src="${ imgSrc }"></imageBlock>]`
				);

				editor.execute( 'toggleImageCaption' );

				setModelData( model, `[<imageBlock src="${ imgSrc }"><caption>foo</caption></imageBlock>]` );
			} );

			it( 'should preserve the caption if the selection was in the caption at the moment of type change', () => {
				const imgSrc = 'foo/bar.jpg';

				setModelData( model, `<imageBlock src="${ imgSrc }"><caption>f[o]o</caption></imageBlock>` );

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>`
				);

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`[<imageBlock src="${ imgSrc }"></imageBlock>]`
				);

				editor.execute( 'toggleImageCaption' );

				setModelData( model, `[<imageBlock src="${ imgSrc }"><caption>foo</caption></imageBlock>]` );
			} );
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

			it( 'should copy parent block attributes to image block', () => {
				setModelData( model,
					'<paragraph pretty="true" smart="true">' +
						`[<imageInline src="${ imgSrc }"></imageInline>]` +
					'</paragraph>'
				);

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal( `[<imageBlock pretty="true" smart="true" src="${ imgSrc }"></imageBlock>]` );
			} );

			it( 'should copy a block image attributes to an inline image\'s parent block', () => {
				setModelData( model, `[<imageBlock pretty="true" smart="true" src="${ imgSrc }"></imageBlock>]` );

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph pretty="true" smart="true">' +
						`[<imageInline src="${ imgSrc }"></imageInline>]` +
					'</paragraph>' );
			} );
		} );

		function timeout( ms ) {
			return new Promise( res => setTimeout( res, ms ) );
		}
	} );
} );
