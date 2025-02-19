/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import ImageStyleEditing from '../../src/imagestyle/imagestyleediting.js';
import ImageBlockEditing from '../../src/image/imageblockediting.js';
import ImageInlineEditing from '../../src/image/imageinlineediting.js';
import ImageStyleCommand from '../../src/imagestyle/imagestylecommand.js';
import imageStyleUtils from '../../src/imagestyle/utils.js';
import ImageEditing from '../../src/image/imageediting.js';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting.js';
import ImageUtils from '../../src/imageutils.js';

describe( 'ImageStyleEditing', () => {
	describe( 'plugin', () => {
		let editor;

		beforeEach( async () => {
			editor = await ModelTestEditor.create( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing ]
			} );
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( ImageStyleEditing ) ).to.be.instanceOf( ImageStyleEditing );
		} );

		it( 'should have pluginName', () => {
			expect( ImageStyleEditing.pluginName ).to.equal( 'ImageStyleEditing' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( ImageStyleEditing.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( ImageStyleEditing.isPremiumPlugin ).to.be.false;
		} );

		it( 'requires ImageUtils ', () => {
			expect( ImageStyleEditing.requires ).to.deep.equal( [ ImageUtils ] );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );
	} );

	describe( 'init()', () => {
		testUtils.createSinonSandbox();

		describe( 'default styles configuration', () => {
			it( 'should not alter the image.styles configuration', async () => {
				const editor = await ModelTestEditor.create( {
					plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing ],
					image: { styles: { options: [ 'block' ] } }
				} );

				expect( editor.config.get( 'image.styles' ) ).to.deep.equal( { options: [ 'block' ] } );

				await editor.destroy();
			} );

			it( 'should not alter the object definitions in the image.styles configuration', async () => {
				const editor = await ModelTestEditor.create( {
					plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing ],
					image: { styles: { options: [ { name: 'block', modelElements: [ 'imageBlock' ] } ] } }
				} );

				expect( editor.config.get( 'image.styles' ) )
					.to.deep.equal( { options: [ { name: 'block', modelElements: [ 'imageBlock' ] } ] } );

				await editor.destroy();
			} );

			describe( 'no image styles are defined in the editor configuration', () => {
				it( 'should set the proper default config if both image editing plugins are loaded', async () => {
					const editor = await ModelTestEditor.create( {
						plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing ]
					} );

					expect( editor.config.get( 'image.styles' ) ).to.deep.equal( {
						options: [
							'inline', 'alignLeft', 'alignRight',
							'alignCenter', 'alignBlockLeft', 'alignBlockRight',
							'block', 'side'
						]
					} );

					await editor.destroy();
				} );

				it( 'should not set a default config if neither image editing plugins are loaded', async () => {
					const editor = await ModelTestEditor.create( {
						plugins: [ ImageStyleEditing ]
					} );

					expect( editor.config.get( 'image.styles' ) ).to.deep.equal( {} );

					await editor.destroy();
				} );

				it( 'should set the proper default config if only the ImageInlineEditing plugin is loaded', async () => {
					const editor = await ModelTestEditor.create( {
						plugins: [ ImageInlineEditing, ImageStyleEditing ]
					} );

					expect( editor.config.get( 'image.styles' ) ).to.deep.equal( {
						options: [ 'inline', 'alignLeft', 'alignRight' ]
					} );

					await editor.destroy();
				} );

				it( 'should set the proper default config if only the ImageBlockEditing plugin is loaded', async () => {
					const editor = await ModelTestEditor.create( {
						plugins: [ ImageBlockEditing, ImageStyleEditing ]
					} );

					expect( editor.config.get( 'image.styles' ) ).to.deep.equal( {
						options: [ 'block', 'side' ]
					} );

					await editor.destroy();
				} );
			} );
		} );

		describe( 'setting the schema', () => {
			it( 'should add the imageStyle to the block image schema if the ImageBlockEditing plugin is loaded', async () => {
				const editor = await ModelTestEditor.create( {
					plugins: [ ImageBlockEditing, ImageStyleEditing ]
				} );

				expect( editor.model.schema.checkAttribute( 'imageBlock', 'imageStyle' ) ).to.be.true;
				expect( editor.model.schema.checkAttribute( 'imageInline', 'imageStyle' ) ).to.be.false;

				await editor.destroy();
			} );

			it( 'should add the imageStyle to the inline image schema if the ImageInlineEditing plugin is loaded', async () => {
				const editor = await ModelTestEditor.create( {
					plugins: [ ImageInlineEditing, ImageStyleEditing ]
				} );

				expect( editor.model.schema.checkAttribute( 'imageInline', 'imageStyle' ) ).to.be.true;
				expect( editor.model.schema.checkAttribute( 'imageBlock', 'imageStyle' ) ).to.be.false;

				await editor.destroy();
			} );

			it( 'should add the imageStyle to the both image schemas if both ImageEditing plugins are loaded', async () => {
				const editor = await ModelTestEditor.create( {
					plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing ]
				} );

				expect( editor.model.schema.checkAttribute( 'imageInline', 'imageStyle' ) ).to.be.true;
				expect( editor.model.schema.checkAttribute( 'imageBlock', 'imageStyle' ) ).to.be.true;

				await editor.destroy();
			} );
		} );

		it( 'should call the normalizedStyles with the proper arguments', async () => {
			const normalizationSpy = testUtils.sinon.spy( imageStyleUtils, 'normalizeStyles' );

			const editor = await ModelTestEditor.create( {
				plugins: [ ImageBlockEditing, ImageStyleEditing ]
			} );

			expect( normalizationSpy.firstCall.args[ 0 ] ).to.deep.equal( {
				configuredStyles: editor.config.get( 'image.styles' ),
				isBlockPluginLoaded: editor.plugins.has( 'ImageBlockEditing' ),
				isInlinePluginLoaded: editor.plugins.has( 'ImageInlineEditing' )
			} );

			await editor.destroy();
		} );

		it( 'should set the normalizedStyles properly', async () => {
			const customStyles = [ {
				name: 'customStyle',
				modelElements: [ 'imageBlock' ]
			} ];

			testUtils.sinon.stub( imageStyleUtils, 'normalizeStyles' ).callsFake( () => customStyles );

			const editor = await ModelTestEditor.create( {
				plugins: [ ImageBlockEditing, ImageStyleEditing ]
			} );

			expect( editor.plugins.get( ImageStyleEditing ).normalizedStyles ).to.equal( customStyles );

			await editor.destroy();
		} );

		it( 'should register the imageStyle command', async () => {
			const editor = await ModelTestEditor.create( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing ]
			} );

			expect( editor.commands.get( 'imageStyle' ) ).to.be.instanceOf( ImageStyleCommand );

			await editor.destroy();
		} );
	} );

	describe( 'model post-fixer', () => {
		let editor, model, document;

		beforeEach( async () => {
			editor = await ModelTestEditor.create( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, Paragraph ],
				image: {
					styles: {
						options: [
							{ name: 'forBlock', modelElements: [ 'imageBlock' ] },
							{ name: 'forInline', modelElements: [ 'imageInline' ] }
						]
					}
				}
			} );

			model = editor.model;
			document = model.document;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should remove imageStyle attribute with invalid value', () => {
			setModelData( model, '<imageBlock src="/assets/sample.png" imageStyle="foo"></imageBlock>' );

			const image = document.getRoot().getChild( 0 );

			expect( image.hasAttribute( 'imageStyle' ) ).to.be.false;
		} );

		it( 'should remove imageStyle attribute with invalid value (after changing attribute value)', () => {
			setModelData( model, '<imageBlock src="/assets/sample.png"></imageBlock>' );

			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'foo', image );
			} );

			expect( image.hasAttribute( 'imageStyle' ) ).to.be.false;
		} );

		it( 'should remove imageStyle attribute with invalid value (after changing image type)', () => {
			setModelData( model, '[<imageBlock src="/assets/sample.png" imageStyle="block"></imageBlock>]' );

			editor.execute( 'imageTypeInline' );

			const image = document.getRoot().getChild( 0 ).getChild( 0 );

			expect( image.hasAttribute( 'imageStyle' ) ).to.be.false;
		} );

		it( 'should remove imageStyle attribute with value not allowed for a block image', () => {
			setModelData( model, '[<imageBlock src="/assets/sample.png" imageStyle="forInline"></imageBlock>]' );

			const image = document.getRoot().getChild( 0 );

			expect( image.hasAttribute( 'imageStyle' ) ).to.be.false;
		} );

		it( 'should remove imageStyle attribute with value not allowed for an inline image', () => {
			setModelData( model, '<paragraph>[<imageInline src="/assets/sample.png" imageStyle="forBlock"></imageInline>]</paragraph>' );

			const image = document.getRoot().getChild( 0 ).getChild( 0 );

			expect( image.hasAttribute( 'imageStyle' ) ).to.be.false;
		} );

		it( 'should not remove imageStyle attribute with value allowed for a block image', () => {
			setModelData( model, '[<imageBlock src="/assets/sample.png" imageStyle="forBlock"></imageBlock>]' );

			const image = document.getRoot().getChild( 0 );

			expect( image.getAttribute( 'imageStyle' ) ).to.equal( 'forBlock' );
		} );

		it( 'should not remove imageStyle attribute with value allowed for an inline image', () => {
			setModelData( model, '<paragraph>[<imageInline src="/assets/sample.png" imageStyle="forInline"></imageInline>]</paragraph>' );

			const image = document.getRoot().getChild( 0 ).getChild( 0 );

			expect( image.getAttribute( 'imageStyle' ) ).to.equal( 'forInline' );
		} );
	} );

	describe( 'conversion', () => {
		let editor, model, viewDocument, document;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, Paragraph ]
			} );

			model = editor.model;
			document = model.document;
			viewDocument = editor.editing.view;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( 'view to model', () => {
			describe( 'of the inline image', () => {
				it( 'should convert from view to model', () => {
					editor.setData( '<p><span><img class="image-style-align-left" src="/assets/sample.png" /></span></p>' );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<paragraph><imageInline imageStyle="alignLeft" src="/assets/sample.png"></imageInline></paragraph>' );

					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline image-style-align-left" contenteditable="false">' +
							'<img src="/assets/sample.png"></img>' +
						'</span></p>' );
					// ASK: Why class is once on the span element and once on the image?
				} );

				it( 'should not convert from view to model if class refers to not defined style', () => {
					editor.setData( '<p><span><img class="foo-bar" src="/assets/sample.png" /></span></p>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>'
					);
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false"><img src="/assets/sample.png"></img></span></p>'
					);
				} );

				it( 'should not convert from view to model if schema prevents it', () => {
					model.schema.addAttributeCheck( ( ctx, attributeName ) => {
						if ( ctx.endsWith( 'imageInline' ) && attributeName == 'imageStyle' ) {
							return false;
						}
					} );

					editor.setData( '<p><span><img class="image-style-align-left" src="/assets/sample.png" /></span></p>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>'
					);
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false"><img src="/assets/sample.png"></img></span></p>'
					);
				} );

				it( 'should not convert from view to model if class is not supported by the inline image', () => {
					editor.setData( '<p><span><img class="image-style-block-align-left" src="/assets/sample.png" /></span></p>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>'
					);
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false"><img src="/assets/sample.png"></img></span></p>'
					);
				} );

				describe( 'with non-existing resource', () => {
					it( 'inserts an image with no "src" when the "src" attribute is missing', () => {
						editor.setData(
							'<p><span><img class="image-style-align-left" /></span></p>'
						);

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '<paragraph><imageInline imageStyle="alignLeft"></imageInline></paragraph>' );
					} );
				} );
			} );

			describe( 'of the block image', () => {
				it( 'should convert from view to model', () => {
					editor.setData( '<figure class="image image-style-align-center"><img src="/assets/sample.png" /></figure>' );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<imageBlock imageStyle="alignCenter" src="/assets/sample.png"></imageBlock>' );

					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image image-style-align-center" contenteditable="false">' +
							'<img src="/assets/sample.png"></img>' +
						'</figure>' );
				} );

				it( 'should not convert from view to model if class refers to not defined style', () => {
					editor.setData( '<figure class="image foo-bar"><img src="/assets/sample.png" /></figure>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock src="/assets/sample.png"></imageBlock>'
					);
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
					);
				} );

				it( 'should not convert from view to model when no image in the figure', () => {
					editor.setData( '<figure class="image-style-align-center"></figure>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph></paragraph>' );
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( '<p></p>' );
				} );

				it( 'should not convert from view to model if schema prevents it', () => {
					model.schema.addAttributeCheck( ( ctx, attributeName ) => {
						if ( ctx.endsWith( 'imageBlock' ) && attributeName == 'imageStyle' ) {
							return false;
						}
					} );

					editor.setData( '<figure class="image image-style-align-center"><img src="/assets/sample.png" /></figure>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock src="/assets/sample.png"></imageBlock>'
					);
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
					);
				} );

				it( 'should not convert from view to model if class is not supported by the block image', async () => {
					const customEditor = await VirtualTestEditor.create( {
						plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing ],
						image: {
							styles: {
								options: [ {
									name: 'onlyInline',
									modelElements: [ 'imageInline' ],
									className: 'image-style-inline'
								} ]
							}
						}
					} );

					customEditor.setData( '<figure class="image image-style-inline"><img src="/assets/sample.png" /></figure>' );

					expect( getModelData( customEditor.model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock src="/assets/sample.png"></imageBlock>'
					);
					expect( getViewData( customEditor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
					);

					await customEditor.destroy();
				} );

				describe( 'with non-existing resource', () => {
					it( 'inserts an image when the "src" attribute is missing', () => {
						editor.setData(
							'<figure class="image image-style-align-center">' +
								'<img alt="Foo." />' +
							'</figure>'
						);

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '<imageBlock alt="Foo." imageStyle="alignCenter"></imageBlock>' );
					} );

					it( 'inserts an image with the "figcaption" content when the "src" attribute is missing (img + figcaption)', () => {
						editor.setData(
							'<figure class="image image-style-align-center">' +
								'<img alt="Foo." />' +
								'<figcaption>Bar.</figcaption>' +
							'</figure>'
						);

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '<imageBlock alt="Foo." imageStyle="alignCenter"></imageBlock>' );
					} );

					it( 'inserts an image with the "figcaption" content when the "src" attribute is missing (figcaption + img)', () => {
						editor.setData(
							'<figure class="image image-style-align-center">' +
								'<figcaption>Bar.</figcaption>' +
								'<img alt="Foo." />' +
							'</figure>'
						);

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( '<imageBlock alt="Foo." imageStyle="alignCenter"></imageBlock>' );
					} );
				} );
			} );

			it( 'should not convert figure from another feature (for example media embed or table)', () => {
				editor.conversion.for( 'upcast' ).add( dispatcher => {
					dispatcher.on( 'element:figure', converter );

					function converter( evt, data, conversionApi ) {
						if ( !conversionApi.consumable.consume( data.viewItem, { name: true, classes: 'media' } ) ) {
							return;
						}

						const { modelRange, modelCursor } = conversionApi.convertChildren( data.viewItem, data.modelCursor );

						data.modelRange = modelRange;
						data.modelCursor = modelCursor;
					}
				} );

				editor.setData( '<figure class="media"><o-embed url="https://ckeditor.com"></o-embed></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph></paragraph>'
				);
				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<p></p>'
				);
			} );
		} );

		describe( 'model to view', () => {
			describe( 'of the block image', () => {
				it( 'should add the class when imageStyle attribute is being added', () => {
					setModelData( model, '<imageBlock src="/assets/sample.png"></imageBlock>' );
					const image = document.getRoot().getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', 'alignLeft', image );
					} );

					expect( editor.getData() ).to.equal(
						'<figure class="image image-style-align-left"><img src="/assets/sample.png"></figure>'
					);
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image image-style-align-left" contenteditable="false">' +
							'<img src="/assets/sample.png"></img>' +
						'</figure>'
					);
				} );

				it( 'should remove the class when imageStyle attribute is being removed', () => {
					setModelData( model, '<imageBlock src="/assets/sample.png" imageStyle="alignLeft"></imageBlock>' );
					const image = document.getRoot().getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', null, image );
					} );

					expect( editor.getData() ).to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
					);
				} );

				it( 'should change the class when imageStyle attribute is being changed', () => {
					setModelData( model, '<imageBlock src="/assets/sample.png" imageStyle="alignLeft"></imageBlock>' );
					const image = document.getRoot().getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', 'alignRight', image );
					} );

					expect( editor.getData() ).to.equal(
						'<figure class="image image-style-align-right"><img src="/assets/sample.png"></figure>'
					);

					// https://github.com/ckeditor/ckeditor5-image/issues/132
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image image-style-align-right" contenteditable="false">' +
							'<img src="/assets/sample.png"></img>' +
						'</figure>'
					);

					model.change( writer => {
						writer.setAttribute( 'imageStyle', 'alignLeft', image );
					} );

					expect( editor.getData() )
						.to.equal( '<figure class="image image-style-align-left"><img src="/assets/sample.png"></figure>' );

					// https://github.com/ckeditor/ckeditor5-image/issues/132
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image image-style-align-left" contenteditable="false">' +
							'<img src="/assets/sample.png"></img>' +
						'</figure>'
					);
				} );

				it( 'should not add the class if change was already consumed', () => {
					editor.editing.downcastDispatcher.on( 'attribute:imageStyle', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, 'attribute:imageStyle' );
					}, { priority: 'high' } );

					setModelData( model, '<imageBlock src="/assets/sample.png"></imageBlock>' );
					const image = document.getRoot().getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', 'alignLeft', image );
					} );

					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
					);
				} );

				it( 'should not set the class if change was already consumed', () => {
					editor.editing.downcastDispatcher.on( 'attribute:imageStyle', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, 'attribute:imageStyle' );
					}, { priority: 'high' } );

					setModelData( model, '<imageBlock src="/assets/sample.png" imageStyle="alignLeft"></imageBlock>' );

					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
					);
				} );

				it( 'should not convert if current imageStyle is not present and the new imageStyle attribute is not defined', () => {
					setModelData( model, '<imageBlock src="/assets/sample.png"></imageBlock>' );
					const image = document.getRoot().getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', 'foo', image );
					} );

					expect( editor.getData() ).to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
					);
				} );

				it( 'should not convert if current imageStyle is present and the new imageStyle attribute is not defined', () => {
					setModelData( model, '<imageBlock src="/assets/sample.png" imageStyle="alignLeft"></imageBlock>' );
					const image = document.getRoot().getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', 'foo', image );
					} );

					expect( editor.getData() ).to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
					);
				} );

				it( 'should not convert if current imageStyle is not defined and the new imageStyle attribute is null', () => {
					setModelData( model, '<imageBlock src="/assets/sample.png" imageStyle="foo"></imageBlock>' );
					const image = document.getRoot().getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', null, image );
					} );

					expect( editor.getData() ).to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
					);
				} );

				// See: https://github.com/ckeditor/ckeditor5/issues/8270.
				it( 'should stop conversion when model element is not found', async () => {
					const customEditor = await VirtualTestEditor
						.create( {
							plugins: [ ImageEditing, ImageResizeEditing, ImageStyleEditing ]
						} );

					expect(
						() => customEditor.setData( '<figure class="image image_resized" style="width:331px;"></figure>' )
					).not.to.throw();

					// No conversion has been done.
					expect( customEditor.getData() ).to.equal( '' );

					await customEditor.destroy();
				} );
			} );

			describe( 'of the inline image', () => {
				it( 'should add the class when imageStyle attribute is being added', () => {
					setModelData( model, '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>' );
					const image = document.getRoot().getChild( 0 ).getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', 'alignLeft', image );
					} );

					expect( editor.getData() ).to.equal( '<p><img class="image-style-align-left" src="/assets/sample.png"></p>' );
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline image-style-align-left" contenteditable="false">' +
							'<img src="/assets/sample.png"></img>' +
						'</span></p>'
					);
				} );

				it( 'should remove the class when imageStyle attribute is being removed', () => {
					setModelData( model,
						'<paragraph><imageInline src="/assets/sample.png" imageStyle="alignLeft"></imageInline></paragraph>'
					);
					const image = document.getRoot().getChild( 0 ).getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', null, image );
					} );

					expect( editor.getData() ).to.equal( '<p><img src="/assets/sample.png"></p>' );
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false"><img src="/assets/sample.png"></img></span></p>'
					);
				} );

				it( 'should change the class when imageStyle attribute is being changed', () => {
					setModelData( model,
						'<paragraph><imageInline src="/assets/sample.png" imageStyle="alignLeft"></imageInline></paragraph>'
					);
					const image = document.getRoot().getChild( 0 ).getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', 'alignRight', image );
					} );

					expect( editor.getData() ).to.equal( '<p><img class="image-style-align-right" src="/assets/sample.png"></p>' );

					// https://github.com/ckeditor/ckeditor5-image/issues/132
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline image-style-align-right" contenteditable="false">' +
							'<img src="/assets/sample.png"></img>' +
						'</span></p>'
					);

					model.change( writer => {
						writer.setAttribute( 'imageStyle', 'alignLeft', image );
					} );

					expect( editor.getData() ).to.equal( '<p><img class="image-style-align-left" src="/assets/sample.png"></p>' );

					// https://github.com/ckeditor/ckeditor5-image/issues/132
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline image-style-align-left" contenteditable="false">' +
							'<img src="/assets/sample.png"></img>' +
						'</span></p>'
					);
				} );

				it( 'should not add the class if change was already consumed', () => {
					editor.editing.downcastDispatcher.on( 'attribute:imageStyle', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, 'attribute:imageStyle' );
					}, { priority: 'high' } );

					setModelData( model, '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>' );
					const image = document.getRoot().getChild( 0 ).getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', 'alignLeft', image );
					} );

					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false"><img src="/assets/sample.png"></img></span></p>'
					);
				} );

				it( 'should not set the class if change was already consumed', () => {
					editor.editing.downcastDispatcher.on( 'attribute:imageStyle', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, 'attribute:imageStyle' );
					}, { priority: 'high' } );

					setModelData( model,
						'<paragraph><imageInline src="/assets/sample.png" imageStyle="alignLeft"></imageInline></paragraph>'
					);

					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false"><img src="/assets/sample.png"></img></span></p>'
					);
				} );

				it( 'should not convert if current imageStyle is not present and the new imageStyle attribute is not defined', () => {
					setModelData( model, '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>' );
					const image = document.getRoot().getChild( 0 ).getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', 'foo', image );
					} );

					expect( editor.getData() ).to.equal( '<p><img src="/assets/sample.png"></p>' );
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false"><img src="/assets/sample.png"></img></span></p>'
					);
				} );

				it( 'should not convert if current imageStyle is present and the new imageStyle attribute is not defined', () => {
					setModelData( model,
						'<paragraph><imageInline src="/assets/sample.png" imageStyle="alignLeft"></imageInline></paragraph>'
					);
					const image = document.getRoot().getChild( 0 ).getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', 'foo', image );
					} );

					expect( editor.getData() ).to.equal( '<p><img src="/assets/sample.png"></p>' );
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false"><img src="/assets/sample.png"></img></span></p>'
					);
				} );

				it( 'should not convert if current imageStyle is not defined and the new imageStyle attribute is null', () => {
					setModelData( model, '<paragraph><imageInline src="/assets/sample.png" imageStyle="foo"></imageInline></paragraph>' );
					const image = document.getRoot().getChild( 0 ).getChild( 0 );

					model.change( writer => {
						writer.setAttribute( 'imageStyle', null, image );
					} );

					expect( editor.getData() ).to.equal( '<p><img src="/assets/sample.png"></p>' );
					expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false"><img src="/assets/sample.png"></img></span></p>'
					);
				} );

				// See: https://github.com/ckeditor/ckeditor5/issues/8270.
				it( 'should stop conversion when model element is not found', async () => {
					const customEditor = await VirtualTestEditor
						.create( {
							plugins: [ ImageEditing, ImageResizeEditing, ImageStyleEditing ]
						} );

					expect(
						() => customEditor.setData( '<figure class="image image_resized" style="width:331px;"></figure>' )
					).not.to.throw();

					// No conversion has been done.
					expect( customEditor.getData() ).to.equal( '' );

					await customEditor.destroy();
				} );
			} );
		} );
	} );
} );
