/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting';

import CKFinderCommand from '../src/ckfindercommand';

describe( 'CKFinderCommand', () => {
	let editor, command, model;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ImageEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new CKFinderCommand( editor );

				const schema = model.schema;
				schema.extend( 'image' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true when the selection directly in the root', () => {
			model.enqueueChange( 'transparent', () => {
				setModelData( model, '[]' );

				command.refresh();
				expect( command.isEnabled ).to.be.true;
			} );
		} );

		it( 'should be true when the selection is in empty block', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		const finderMock = {
			on: ( eventName, callback ) => {
				finderMock[ eventName ] = callback;
			}
		};

		beforeEach( () => {
			window.CKFinder = {
				modal: config => {
					config.onInit( finderMock );
				}
			};
		} );

		it( 'should register proper listeners on CKFinder instance', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute();

			expect( finderMock ).to.have.property( 'files:choose' );
			expect( finderMock ).to.have.property( 'file:choose:resizedImage' );
		} );

		it( 'should insert single chosen image as image widget', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );
			const url = 'foo/bar.jpg';

			command.execute();

			expect( finderMock ).to.have.property( 'files:choose' );
			expect( finderMock ).to.have.property( 'file:choose:resizedImage' );

			mockFinderEvent( 'files:choose', [ mockFinderFile( url ) ] );

			expect( getModelData( model ) )
				.to.equal( `[<image src="${ url }"></image>]<paragraph>foo</paragraph>` );
		} );

		it( 'should insert multiple chosen images as image widget', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );
			const url1 = 'foo/bar1.jpg';
			const url2 = 'foo/bar2.jpg';
			const url3 = 'foo/bar3.jpg';

			command.execute();

			expect( finderMock ).to.have.property( 'files:choose' );
			expect( finderMock ).to.have.property( 'file:choose:resizedImage' );

			mockFinderEvent( 'files:choose', [ mockFinderFile( url1 ), mockFinderFile( url2 ), mockFinderFile( url3 ) ] );

			expect( getModelData( model ) ).to.equal(
				`<image src="${ url1 }"></image><image src="${ url2 }"></image>[<image src="${ url3 }"></image>]<paragraph>foo</paragraph>`
			);
		} );

		it( 'should insert only images from chosen files', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );
			const url1 = 'foo/bar1.jpg';
			const url2 = 'foo/bar2.pdf';
			const url3 = 'foo/bar3.jpg';

			command.execute();

			expect( finderMock ).to.have.property( 'files:choose' );
			expect( finderMock ).to.have.property( 'file:choose:resizedImage' );

			mockFinderEvent( 'files:choose', [ mockFinderFile( url1 ), mockFinderFile( url2, false ), mockFinderFile( url3 ) ] );

			expect( getModelData( model ) ).to.equal(
				`<image src="${ url1 }"></image>[<image src="${ url3 }"></image>]<paragraph>foo</paragraph>`
			);
		} );

		function mockFinderFile( url = 'foo/bar.jpg', isImage = true ) {
			return {
				isImage: () => isImage,
				get: () => url
			};
		}

		function mockFinderEvent( eventName, files ) {
			const evt = {
				data: {
					files: {
						toArray: () => files
					}
				}
			};

			finderMock[ eventName ]( evt );
		}
	} );
} );
