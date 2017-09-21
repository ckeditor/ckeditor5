/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageStyleEngine from '../../src/imagestyle/imagestyleengine';
import ImageEngine from '../../src/image/imageengine';
import ImageStyleCommand from '../../src/imagestyle/imagestylecommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import log from '@ckeditor/ckeditor5-utils/src/log';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import fullWidthIcon from '@ckeditor/ckeditor5-core/theme/icons/object-full-width.svg';
import leftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import centerIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import rightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';

describe( 'ImageStyleEngine', () => {
	let editor, plugin, document, viewDocument;

	afterEach( () => {
		editor.destroy();
	} );

	describe( 'plugin', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEngine ],
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( ImageStyleEngine ) ).to.be.instanceOf( ImageStyleEngine );
		} );

		it( 'should load image engine', () => {
			expect( editor.plugins.get( ImageEngine ) ).to.be.instanceOf( ImageEngine );
		} );
	} );

	describe( 'init', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEngine ],
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
					document = editor.document;
					viewDocument = editor.editing.view;
				} );
		} );

		it( 'should define image.styles config', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEngine ]
				} )
				.then( newEditor => {
					editor = newEditor;

					expect( newEditor.config.get( 'image.styles' ) ).to.deep.equal( [ 'imageStyleFull', 'imageStyleSide' ] );
				} );
		} );

		it( 'should set schema rules for image style', () => {
			const schema = document.schema;

			expect( schema.check( { name: 'image', attributes: [ 'imageStyle', 'src' ], inside: '$root' } ) ).to.be.true;
		} );

		it( 'should register separate command for each style', () => {
			expect( editor.commands.get( 'fullStyle' ) ).to.be.instanceOf( ImageStyleCommand );
			expect( editor.commands.get( 'sideStyle' ) ).to.be.instanceOf( ImageStyleCommand );
			expect( editor.commands.get( 'dummyStyle' ) ).to.be.instanceOf( ImageStyleCommand );
		} );

		it( 'should convert from view to model', () => {
			editor.setData( '<figure class="image side-class"><img src="foo.png" /></figure>' );

			expect( getModelData( document, { withoutSelection: true } ) )
				.to.equal( '<image imageStyle="sideStyle" src="foo.png"></image>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget side-class" contenteditable="false">' +
					'<img src="foo.png"></img>' +
				'</figure>' );
		} );

		it( 'should not convert from view to model if class is not defined', () => {
			editor.setData( '<figure class="image foo-bar"><img src="foo.png" /></figure>' );

			expect( getModelData( document, { withoutSelection: true } ) ).to.equal( '<image src="foo.png"></image>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not convert from view to model when not in image figure', () => {
			editor.setData( '<figure class="side-class"></figure>' );

			expect( getModelData( document, { withoutSelection: true } ) ).to.equal( '' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( '' );
		} );

		it( 'should not convert from view to model if schema prevents it', () => {
			document.schema.disallow( { name: 'image', attributes: 'imageStyle' } );
			editor.setData( '<figure class="image side-class"><img src="foo.png" /></figure>' );

			expect( getModelData( document, { withoutSelection: true } ) ).to.equal( '<image src="foo.png"></image>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should convert model to view: adding attribute', () => {
			setModelData( document, '<image src="foo.png"></image>' );
			const image = document.getRoot().getChild( 0 );
			const batch = document.batch();

			document.enqueueChanges( () => {
				batch.setAttribute( image, 'imageStyle', 'sideStyle' );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image side-class"><img src="foo.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget side-class" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should convert model to view: removing attribute', () => {
			setModelData( document, '<image src="foo.png" imageStyle="imageStyleSide"></image>' );
			const image = document.getRoot().getChild( 0 );
			const batch = document.batch();

			document.enqueueChanges( () => {
				batch.setAttribute( image, 'imageStyle', null );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should convert model to view: change attribute', () => {
			setModelData( document, '<image src="foo.png" imageStyle="dummy"></image>' );
			const image = document.getRoot().getChild( 0 );
			const batch = document.batch();

			document.enqueueChanges( () => {
				batch.setAttribute( image, 'imageStyle', 'sideStyle' );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image side-class"><img src="foo.png"></figure>' );

			// https://github.com/ckeditor/ckeditor5-image/issues/132
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget side-class" contenteditable="false"><img src="foo.png"></img></figure>'
			);

			document.enqueueChanges( () => {
				batch.setAttribute( image, 'imageStyle', 'dummyStyle' );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image dummy-class"><img src="foo.png"></figure>' );

			// https://github.com/ckeditor/ckeditor5-image/issues/132
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget dummy-class" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if already consumed: adding attribute', () => {
			editor.editing.modelToView.on( 'addAttribute:imageStyle', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'addAttribute:imageStyle' );
			}, { priority: 'high' } );

			setModelData( document, '<image src="foo.png"></image>' );
			const image = document.getRoot().getChild( 0 );
			const batch = document.batch();

			document.enqueueChanges( () => {
				batch.setAttribute( image, 'imageStyle', 'sideStyle' );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if already consumed: removing attribute', () => {
			editor.editing.modelToView.on( 'removeAttribute:imageStyle', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'removeAttribute:imageStyle' );
			}, { priority: 'high' } );

			setModelData( document, '<image src="foo.png" imageStyle="sideStyle"></image>' );
			const image = document.getRoot().getChild( 0 );
			const batch = document.batch();

			document.enqueueChanges( () => {
				batch.setAttribute( image, 'imageStyle', null );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget side-class" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if already consumed: change attribute', () => {
			editor.editing.modelToView.on( 'changeAttribute:imageStyle', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'changeAttribute:imageStyle' );
			}, { priority: 'high' } );

			setModelData( document, '<image src="foo.png" imageStyle="dummyStyle"></image>' );
			const image = document.getRoot().getChild( 0 );
			const batch = document.batch();

			document.enqueueChanges( () => {
				batch.setAttribute( image, 'imageStyle', 'sideStyle' );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget dummy-class" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if style is not present: adding attribute', () => {
			setModelData( document, '<image src="foo.png"></image>' );
			const image = document.getRoot().getChild( 0 );
			const batch = document.batch();

			document.enqueueChanges( () => {
				batch.setAttribute( image, 'imageStyle', 'foo' );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if style is not present: change attribute', () => {
			setModelData( document, '<image src="foo.png" imageStyle="dummy"></image>' );
			const image = document.getRoot().getChild( 0 );
			const batch = document.batch();

			document.enqueueChanges( () => {
				batch.setAttribute( image, 'imageStyle', 'foo' );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if style is not present: remove attribute', () => {
			setModelData( document, '<image src="foo.png" imageStyle="foo"></image>' );
			const image = document.getRoot().getChild( 0 );
			const batch = document.batch();

			document.enqueueChanges( () => {
				batch.setAttribute( image, 'imageStyle', null );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false"><img src="foo.png"></img></figure>'
			);
		} );
	} );

	describe( 'imageStyles()', () => {
		it( 'should fall back to defaults when no image.styles', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEngine ]
				} )
				.then( newEditor => {
					editor = newEditor;

					expect( newEditor.config.get( 'image.styles' ) ).to.deep.equal( [ 'imageStyleFull', 'imageStyleSide' ] );
				} );
		} );

		it( 'should not alter the image.styles config', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageStyleEngine ],
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
					plugins: [ ImageStyleEngine ],
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
					plugins: [ ImageStyleEngine ]
				} )
				.then( newEditor => {
					editor = newEditor;
					plugin = editor.plugins.get( ImageStyleEngine );

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
						plugins: [ TranslationMock, ImageStyleEngine ],
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
						plugin = editor.plugins.get( ImageStyleEngine );
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
				expect( plugin.imageStyles[ 1 ].icon ).to.equal( ImageStyleEngine.defaultIcons.right );
			} );

			it( 'should use one of default translations if #title matches', () => {
				expect( plugin.imageStyles[ 2 ].title ).to.deep.equal( 'Default translation' );
			} );

			it( 'should extend one of default styles if #name matches', () => {
				expect( plugin.imageStyles[ 3 ] ).to.deep.equal( {
					name: 'imageStyleFull',
					title: 'Custom title',
					icon: ImageStyleEngine.defaultIcons.left,
					isDefault: true
				} );
			} );
		} );

		describe( 'string format', () => {
			it( 'should use one of default styles if #name matches', () => {
				return VirtualTestEditor
					.create( {
						plugins: [ ImageStyleEngine ],
						image: {
							styles: [ 'imageStyleFull' ]
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						plugin = editor.plugins.get( ImageStyleEngine );
						expect( plugin.imageStyles[ 0 ] ).to.deep.equal( ImageStyleEngine.defaultStyles.imageStyleFull );
					} );
			} );

			it( 'should warn if a #name not found in default styles', () => {
				sinon.stub( log, 'warn' );

				return VirtualTestEditor
					.create( {
						plugins: [ ImageStyleEngine ],
						image: {
							styles: [ 'foo' ]
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						plugin = editor.plugins.get( ImageStyleEngine );

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
					plugins: [ ImageStyleEngine ]
				} )
				.then( newEditor => {
					editor = newEditor;
					plugin = editor.plugins.get( ImageStyleEngine );

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
			expect( ImageStyleEngine.defaultStyles ).to.deep.equal( {
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
			expect( ImageStyleEngine.defaultIcons ).to.deep.equal( {
				full: fullWidthIcon,
				left: leftIcon,
				right: rightIcon,
				center: centerIcon,
			} );
		} );
	} );
} );
