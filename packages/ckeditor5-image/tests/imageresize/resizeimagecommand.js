/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ResizeImageCommand from '../../src/imageresize/resizeimagecommand';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ResizeImageCommand', () => {
	let editor, model, command;

	beforeEach( async () => {
		editor = await ModelTestEditor.create( {
			plugins: [ ImageResizeEditing ]
		} );
		model = editor.model;
		command = new ResizeImageCommand( editor );

		model.schema.register( 'p', { inheritAllFrom: '$block' } );

		model.schema.register( 'imageBlock', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: 'width'
		} );

		model.schema.register( 'caption', {
			allowContentOf: '$block',
			allowIn: 'imageBlock',
			isLimit: true
		} );
	} );

	afterEach( async () => {
		return editor.destroy();
	} );

	describe( '#isEnabled', () => {
		it( 'is true when image is selected', () => {
			setData( model, '<p>x</p>[<imageBlock width="50px"></imageBlock>]<p>x</p>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is true when the selection is inside a block image caption', () => {
			setData( model, '<imageBlock width="50px"><caption>[F]oo</caption></imageBlock>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is false when image is not selected', () => {
			setData( model, '<p>x[]</p><imageBlock width="50px"></imageBlock>' );

			expect( command ).to.have.property( 'isEnabled', false );
		} );

		it( 'is false when more than one image is selected', () => {
			setData( model, '<p>x</p>[<imageBlock width="50px"></imageBlock><imageBlock width="50px"></imageBlock>]' );

			expect( command ).to.have.property( 'isEnabled', false );
		} );
	} );

	describe( '#value', () => {
		it( 'is null when image is not selected', () => {
			setData( model, '<p>x[]</p><imageBlock width="50px"></imageBlock>' );

			expect( command ).to.have.property( 'value', null );
		} );

		it( 'is set to an object with a width property (and height set to null) when a block image is selected', () => {
			setData( model, '<p>x</p>[<imageBlock width="50px"></imageBlock>]<p>x</p>' );

			expect( command ).to.have.deep.property( 'value', { width: '50px', height: null } );
		} );

		it( 'is set to an object with a width property (and height set to null) when the selection is in a block image caption', () => {
			setData( model, '<imageBlock width="50px"><caption>[]Foo</caption></imageBlock>' );

			expect( command ).to.have.deep.property( 'value', { width: '50px', height: null } );
		} );

		it( 'is set to null if image does not have the width set', () => {
			setData( model, '<p>x</p>[<imageBlock></imageBlock>]<p>x</p>' );

			expect( command ).to.have.property( 'value', null );
		} );
	} );

	describe( 'execute()', () => {
		it( 'sets image width', () => {
			setData( model, '[<imageBlock width="50px"></imageBlock>]' );

			command.execute( { width: '100%' } );

			expect( getData( model ) ).to.equal( '[<imageBlock width="100%"></imageBlock>]' );
		} );

		it( 'sets image width when selection is in a block image caption', () => {
			setData( model, '<imageBlock width="50px"><caption>F[o]o</caption></imageBlock>' );

			command.execute( { width: '100%' } );

			expect( getData( model ) ).to.equal( '<imageBlock width="100%"><caption>F[o]o</caption></imageBlock>' );
		} );

		it( 'removes image width when null passed', () => {
			setData( model, '[<imageBlock width="50px"></imageBlock>]' );

			command.execute( { width: null } );

			expect( getData( model ) ).to.equal( '[<imageBlock></imageBlock>]' );
			expect( model.document.getRoot().getChild( 0 ).hasAttribute( 'width' ) ).to.be.false;
		} );
	} );
} );
