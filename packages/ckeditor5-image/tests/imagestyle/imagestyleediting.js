/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageStyleEditing from '../../src/imagestyle/imagestyleediting';
import ImageEditing from '../../src/image/imageediting';
import ImageStyleCommand from '../../src/imagestyle/imagestylecommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import log from '@ckeditor/ckeditor5-utils/src/log';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import fullWidthIcon from '@ckeditor/ckeditor5-core/theme/icons/object-full-width.svg';
import leftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import centerIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import rightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'ImageStyleEditing', () => {
	let editor, plugin, model, document, viewDocument;

	afterEach( () => {
		editor.destroy();
	} );

	describe( 'plugin', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEditing ],
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( ImageStyleEditing ) ).to.be.instanceOf( ImageStyleEditing );
		} );

		it( 'should load image editing', () => {
			expect( editor.plugins.get( ImageEditing ) ).to.be.instanceOf( ImageEditing );
		} );
	} );

	describe( 'init', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEditing ],
					image: {
						styles: [
							{ name: 'fullStyle', title: 'foo', icon: 'object-center', isDefault: true },
							{ name: 'sideStyle', title: 'bar', icon: 'object-right', className: 'side-class' },
							{ name: 'dummyStyle', title: 'baz', icon: 'object-dummy', className: 'dummy-class' },
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					document = model.document;
					viewDocument = editor.editing.view;
				} );
		} );

		it( 'should define image.styles config', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;

					expect( newEditor.config.get( 'image.styles' ) ).to.deep.equal( [ 'imageStyleFull', 'imageStyleSide' ] );
				} );
		} );

		it( 'should set schema rules for image style', () => {
			const schema = model.schema;

			expect( schema.checkAttribute( [ '$root', 'image' ], 'imageStyle' ) ).to.be.true;
		} );

		it( 'should register separate command for each style', () => {
			expect( editor.commands.get( 'fullStyle' ) ).to.be.instanceOf( ImageStyleCommand );
			expect( editor.commands.get( 'sideStyle' ) ).to.be.instanceOf( ImageStyleCommand );
			expect( editor.commands.get( 'dummyStyle' ) ).to.be.instanceOf( ImageStyleCommand );
		} );

		it( 'should convert from view to model', () => {
			editor.setData( '<figure class="image side-class"><img src="foo.png" /></figure>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<image imageStyle="sideStyle" src="foo.png"></image>' );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image side-class" contenteditable="false">' +
					'<img src="foo.png"></img>' +
				'</figure>' );
		} );

		it( 'should not convert from view to model if class is not defined', () => {
			editor.setData( '<figure class="image foo-bar"><img src="foo.png" /></figure>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<image src="foo.png"></image>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not convert from view to model when not in image figure', () => {
			editor.setData( '<figure class="side-class"></figure>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( '' );
		} );

		it( 'should not convert from view to model if schema prevents it', () => {
			model.schema.addAttributeCheck( ( ctx, attributeName ) => {
				if ( ctx.endsWith( 'image' ) && attributeName == 'imageStyle' ) {
					return false;
				}
			} );

			editor.setData( '<figure class="image side-class"><img src="foo.png" /></figure>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<image src="foo.png"></image>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should convert model to view: adding attribute', () => {
			setModelData( model, '<image src="foo.png"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'sideStyle', image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image side-class"><img src="foo.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image side-class" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should convert model to view: removing attribute', () => {
			setModelData( model, '<image src="foo.png" imageStyle="sideStyle"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', null, image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should convert model to view: change attribute', () => {
			setModelData( model, '<image src="foo.png" imageStyle="dummy"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'sideStyle', image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image side-class"><img src="foo.png"></figure>' );

			// https://github.com/ckeditor/ckeditor5-image/issues/132
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image side-class" contenteditable="false"><img src="foo.png"></img></figure>'
			);

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'dummyStyle', image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image dummy-class"><img src="foo.png"></figure>' );

			// https://github.com/ckeditor/ckeditor5-image/issues/132
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget dummy-class image" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if already consumed: adding attribute', () => {
			editor.editing.downcastDispatcher.on( 'attribute:imageStyle', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'attribute:imageStyle' );
			}, { priority: 'high' } );

			setModelData( model, '<image src="foo.png"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'sideStyle', image );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not set attribute if change was already consumed', () => {
			editor.editing.downcastDispatcher.on( 'attribute:imageStyle', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'attribute:imageStyle' );
			}, { priority: 'high' } );

			setModelData( model, '<image src="foo.png" imageStyle="dummyStyle"></image>' );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if style is not present: adding attribute', () => {
			setModelData( model, '<image src="foo.png"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'foo', image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if style is not present: change attribute', () => {
			setModelData( model, '<image src="foo.png" imageStyle="dummy"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'foo', image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if style is not present: remove attribute', () => {
			setModelData( model, '<image src="foo.png" imageStyle="foo"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', null, image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );
	} );

	describe( 'imageStyles()', () => {
		it( 'should fall back to defaults when no image.styles', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;

					expect( newEditor.config.get( 'image.styles' ) ).to.deep.equal( [ 'imageStyleFull', 'imageStyleSide' ] );
				} );
		} );

		it( 'should not alter the image.styles config', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEditing ],
					image: {
						styles: [
							'imageStyleSide'
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					expect( newEditor.config.get( 'image.styles' ) ).to.deep.equal( [ 'imageStyleSide' ] );
				} );
		} );

		it( 'should not alter object definitions in the image.styles config', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEditing ],
					image: {
						styles: [
							{ name: 'imageStyleSide' }
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					expect( newEditor.config.get( 'image.styles' ) ).to.deep.equal( [ { name: 'imageStyleSide' } ] );
				} );
		} );

		it( 'should cache the styles', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;
					plugin = editor.plugins.get( ImageStyleEditing );

					expect( plugin.imageStyles ).to.equal( plugin.imageStyles );
				} );
		} );

		describe( 'object format', () => {
			beforeEach( () => {
				class TranslationMock extends Plugin {
					init() {
						sinon.stub( this.editor, 't' ).returns( 'Default translation' );
					}
				}

				return VirtualTestEditor
					.create( {
						plugins: [ TranslationMock, ImageStyleEditing ],
						image: {
							styles: [
								// Custom user styles.
								{ name: 'foo', title: 'foo', icon: 'custom', isDefault: true, className: 'foo-class' },
								{ name: 'bar', title: 'bar', icon: 'right', className: 'bar-class' },
								{ name: 'baz', title: 'Side image', icon: 'custom', className: 'baz-class' },

								// Customized default styles.
								{ name: 'imageStyleFull', icon: 'left', title: 'Custom title' }
							]
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						plugin = editor.plugins.get( ImageStyleEditing );
					} );
			} );

			it( 'should pass through if #name not found in default styles', () => {
				expect( plugin.imageStyles[ 0 ] ).to.deep.equal( {
					name: 'foo',
					title: 'foo',
					icon: 'custom',
					isDefault: true,
					className: 'foo-class'
				} );
			} );

			it( 'should use one of default icons if #icon matches', () => {
				expect( plugin.imageStyles[ 1 ].icon ).to.equal( ImageStyleEditing.defaultIcons.right );
			} );

			it( 'should use one of default translations if #title matches', () => {
				expect( plugin.imageStyles[ 2 ].title ).to.deep.equal( 'Default translation' );
			} );

			it( 'should extend one of default styles if #name matches', () => {
				expect( plugin.imageStyles[ 3 ] ).to.deep.equal( {
					name: 'imageStyleFull',
					title: 'Custom title',
					icon: ImageStyleEditing.defaultIcons.left,
					isDefault: true
				} );
			} );
		} );

		describe( 'string format', () => {
			it( 'should use one of default styles if #name matches', () => {
				return VirtualTestEditor
					.create( {
						plugins: [ ImageStyleEditing ],
						image: {
							styles: [ 'imageStyleFull' ]
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						plugin = editor.plugins.get( ImageStyleEditing );
						expect( plugin.imageStyles[ 0 ] ).to.deep.equal( ImageStyleEditing.defaultStyles.imageStyleFull );
					} );
			} );

			it( 'should warn if a #name not found in default styles', () => {
				testUtils.sinon.stub( log, 'warn' );

				return VirtualTestEditor
					.create( {
						plugins: [ ImageStyleEditing ],
						image: {
							styles: [ 'foo' ]
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						plugin = editor.plugins.get( ImageStyleEditing );

						expect( plugin.imageStyles[ 0 ] ).to.deep.equal( {
							name: 'foo'
						} );

						sinon.assert.calledOnce( log.warn );
						sinon.assert.calledWithExactly( log.warn,
							sinon.match( /^image-style-not-found/ ),
							{ name: 'foo' }
						);
					} );
			} );
		} );
	} );

	describe( 'localizedDefaultStylesTitles()', () => {
		it( 'should return localized titles of default styles', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;
					plugin = editor.plugins.get( ImageStyleEditing );

					expect( plugin.localizedDefaultStylesTitles ).to.deep.equal( {
						'Full size image': 'Full size image',
						'Side image': 'Side image',
						'Left aligned image': 'Left aligned image',
						'Centered image': 'Centered image',
						'Right aligned image': 'Right aligned image'
					} );
				} );
		} );
	} );

	describe( 'defaultStyles', () => {
		it( 'should be defined', () => {
			expect( ImageStyleEditing.defaultStyles ).to.deep.equal( {
				imageStyleFull: {
					name: 'imageStyleFull',
					title: 'Full size image',
					icon: fullWidthIcon,
					isDefault: true
				},
				imageStyleSide: {
					name: 'imageStyleSide',
					title: 'Side image',
					icon: rightIcon,
					className: 'image-style-side'
				},
				imageStyleAlignLeft: {
					name: 'imageStyleAlignLeft',
					title: 'Left aligned image',
					icon: leftIcon,
					className: 'image-style-align-left'
				},
				imageStyleAlignCenter: {
					name: 'imageStyleAlignCenter',
					title: 'Centered image',
					icon: centerIcon,
					className: 'image-style-align-center'
				},
				imageStyleAlignRight: {
					name: 'imageStyleAlignRight',
					title: 'Right aligned image',
					icon: rightIcon,
					className: 'image-style-align-right'
				}
			} );
		} );
	} );

	describe( 'defaultIcons', () => {
		it( 'should be defined', () => {
			expect( ImageStyleEditing.defaultIcons ).to.deep.equal( {
				full: fullWidthIcon,
				left: leftIcon,
				right: rightIcon,
				center: centerIcon,
			} );
		} );
	} );
} );
