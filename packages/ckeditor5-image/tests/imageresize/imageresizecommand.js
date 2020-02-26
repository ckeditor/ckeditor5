/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ImageResizeCommand from '../../src/imageresize/imageresizecommand';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageStyleCommand', () => {
	let model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				model = newEditor.model;
				command = new ImageResizeCommand( newEditor );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );

				model.schema.register( 'image', {
					isObject: true,
					isBlock: true,
					allowWhere: '$block',
					allowAttributes: 'width'
				} );
			} );
	} );

	describe( '#isEnabled', () => {
		it( 'is true when image is selected', () => {
			setData( model, '<p>x</p>[<image width="50px"></image>]<p>x</p>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is false when image is not selected', () => {
			setData( model, '<p>x[]</p><image width="50px"></image>' );

			expect( command ).to.have.property( 'isEnabled', false );
		} );

		it( 'is false when more than one image is selected', () => {
			setData( model, '<p>x</p>[<image width="50px"></image><image width="50px"></image>]' );

			expect( command ).to.have.property( 'isEnabled', false );
		} );
	} );

	describe( '#value', () => {
		it( 'is null when image is not selected', () => {
			setData( model, '<p>x[]</p><image width="50px"></image>' );

			expect( command ).to.have.property( 'value', null );
		} );

		it( 'is set to an object with a width property (and height set to null)', () => {
			setData( model, '<p>x</p>[<image width="50px"></image>]<p>x</p>' );

			expect( command ).to.have.deep.property( 'value', { width: '50px', height: null } );
		} );

		it( 'is set to null if image does not have the width set', () => {
			setData( model, '<p>x</p>[<image></image>]<p>x</p>' );

			expect( command ).to.have.property( 'value', null );
		} );
	} );

	describe( 'execute()', () => {
		it( 'sets image width', () => {
			setData( model, '[<image width="50px"></image>]' );

			command.execute( { width: '100%' } );

			expect( getData( model ) ).to.equal( '[<image width="100%"></image>]' );
		} );

		it( 'removes image width when null passed', () => {
			setData( model, '[<image width="50px"></image>]' );

			command.execute( { width: null } );

			expect( getData( model ) ).to.equal( '[<image></image>]' );
			expect( model.document.getRoot().getChild( 0 ).hasAttribute( 'width' ) ).to.be.false;
		} );
	} );
} );
