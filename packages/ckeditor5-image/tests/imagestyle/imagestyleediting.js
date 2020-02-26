/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageStyleEditing from '../../src/imagestyle/imagestyleediting';
import ImageEditing from '../../src/image/imageediting';
import ImageStyleCommand from '../../src/imagestyle/imagestylecommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import env from '@ckeditor/ckeditor5-utils/src/env';

describe( 'ImageStyleEditing', () => {
	let editor, model, document, viewDocument;

	testUtils.createSinonSandbox( 'ImageStyleEditing' );

	beforeEach( () => {
		// Most tests assume non-edge environment but we do not set `contenteditable=false` on Edge so stub `env.isEdge`.
		testUtils.sinon.stub( env, 'isEdge' ).get( () => false );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	describe( 'plugin', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageEditing, ImageStyleEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( ImageStyleEditing ) ).to.be.instanceOf( ImageStyleEditing );
		} );
	} );

	describe( 'init', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageEditing, ImageStyleEditing ],
					image: {
						styles: [
							{ name: 'fullStyle', title: 'foo', icon: 'object-center', isDefault: true },
							{ name: 'sideStyle', title: 'bar', icon: 'object-right', className: 'side-class' },
							{ name: 'dummyStyle', title: 'baz', icon: 'object-dummy', className: 'dummy-class' }
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
					plugins: [ ImageEditing, ImageStyleEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;

					expect( newEditor.config.get( 'image.styles' ) ).to.deep.equal( [ 'full', 'side' ] );
				} );
		} );

		it( 'should set schema rules for image style', () => {
			const schema = model.schema;

			expect( schema.checkAttribute( [ '$root', 'image' ], 'imageStyle' ) ).to.be.true;
		} );

		it( 'should register a command', () => {
			expect( editor.commands.get( 'imageStyle' ) ).to.be.instanceOf( ImageStyleCommand );
		} );

		it( 'should convert from view to model', () => {
			editor.setData( '<figure class="image side-class"><img src="/assets/sample.png" /></figure>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<image imageStyle="sideStyle" src="/assets/sample.png"></image>' );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image side-class" contenteditable="false">' +
					'<img src="/assets/sample.png"></img>' +
				'</figure>' );
		} );

		it( 'should not convert from view to model if class is not defined', () => {
			editor.setData( '<figure class="image foo-bar"><img src="/assets/sample.png" /></figure>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<image src="/assets/sample.png"></image>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
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

			editor.setData( '<figure class="image side-class"><img src="/assets/sample.png" /></figure>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<image src="/assets/sample.png"></image>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
			);
		} );

		it( 'should convert model to view: adding attribute', () => {
			setModelData( model, '<image src="/assets/sample.png"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'sideStyle', image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image side-class"><img src="/assets/sample.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image side-class" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
			);
		} );

		it( 'should convert model to view: removing attribute', () => {
			setModelData( model, '<image src="/assets/sample.png" imageStyle="sideStyle"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', null, image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
			);
		} );

		it( 'should convert model to view: change attribute', () => {
			setModelData( model, '<image src="/assets/sample.png" imageStyle="dummy"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'sideStyle', image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image side-class"><img src="/assets/sample.png"></figure>' );

			// https://github.com/ckeditor/ckeditor5-image/issues/132
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image side-class" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
			);

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'dummyStyle', image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image dummy-class"><img src="/assets/sample.png"></figure>' );

			// https://github.com/ckeditor/ckeditor5-image/issues/132
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget dummy-class image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if already consumed: adding attribute', () => {
			editor.editing.downcastDispatcher.on( 'attribute:imageStyle', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'attribute:imageStyle' );
			}, { priority: 'high' } );

			setModelData( model, '<image src="/assets/sample.png"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'sideStyle', image );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
			);
		} );

		it( 'should not set attribute if change was already consumed', () => {
			editor.editing.downcastDispatcher.on( 'attribute:imageStyle', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'attribute:imageStyle' );
			}, { priority: 'high' } );

			setModelData( model, '<image src="/assets/sample.png" imageStyle="dummyStyle"></image>' );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if style is not present: adding attribute', () => {
			setModelData( model, '<image src="/assets/sample.png"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'foo', image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if style is not present: change attribute', () => {
			setModelData( model, '<image src="/assets/sample.png" imageStyle="dummy"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', 'foo', image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
			);
		} );

		it( 'should not convert from model to view if style is not present: remove attribute', () => {
			setModelData( model, '<image src="/assets/sample.png" imageStyle="foo"></image>' );
			const image = document.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'imageStyle', null, image );
			} );

			expect( editor.getData() ).to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>'
			);
		} );
	} );

	describe( 'config', () => {
		it( 'should fall back to defaults when no image.styles', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageEditing, ImageStyleEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;

					expect( newEditor.config.get( 'image.styles' ) ).to.deep.equal( [ 'full', 'side' ] );
				} );
		} );

		it( 'should not alter the image.styles config', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageEditing, ImageStyleEditing ],
					image: {
						styles: [
							'side'
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					expect( newEditor.config.get( 'image.styles' ) ).to.deep.equal( [ 'side' ] );
				} );
		} );

		it( 'should not alter object definitions in the image.styles config', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ImageEditing, ImageStyleEditing ],
					image: {
						styles: [
							{ name: 'side' }
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					expect( newEditor.config.get( 'image.styles' ) ).to.deep.equal( [ { name: 'side' } ] );
				} );
		} );
	} );
} );
