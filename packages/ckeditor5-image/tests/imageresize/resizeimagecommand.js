/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ResizeImageCommand from '../../src/imageresize/resizeimagecommand';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting';

/* eslint-disable no-undef */

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
			allowAttributes: 'resizedWidth'
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
			setData( model, '<p>x</p>[<imageBlock resizedWidth="50px"></imageBlock>]<p>x</p>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is true when the selection is inside a block image caption', () => {
			setData( model, '<imageBlock resizedWidth="50px"><caption>[F]oo</caption></imageBlock>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is false when image is not selected', () => {
			setData( model, '<p>x[]</p><imageBlock resizedWidth="50px"></imageBlock>' );

			expect( command ).to.have.property( 'isEnabled', false );
		} );

		it( 'is false when more than one image is selected', () => {
			setData( model, '<p>x</p>[<imageBlock resizedWidth="50px"></imageBlock><imageBlock resizedWidth="50px"></imageBlock>]' );

			expect( command ).to.have.property( 'isEnabled', false );
		} );
	} );

	describe( '#value', () => {
		it( 'is null when image is not selected', () => {
			setData( model, '<p>x[]</p><imageBlock resizedWidth="50px"></imageBlock>' );

			expect( command ).to.have.property( 'value', null );
		} );

		it( 'is set to an object with a width property (and height set to null) when a block image is selected', () => {
			setData( model, '<p>x</p>[<imageBlock resizedWidth="50px"></imageBlock>]<p>x</p>' );

			expect( command ).to.have.deep.property( 'value', { width: '50px', height: null } );
		} );

		it( 'is set to an object with a width property (and height set to null) when the selection is in a block image caption', () => {
			setData( model, '<imageBlock resizedWidth="50px"><caption>[]Foo</caption></imageBlock>' );

			expect( command ).to.have.deep.property( 'value', { width: '50px', height: null } );
		} );

		it( 'is set to null if image does not have the resizedWidth set', () => {
			setData( model, '<p>x</p>[<imageBlock></imageBlock>]<p>x</p>' );

			expect( command ).to.have.property( 'value', null );
		} );
	} );

	describe( 'execute()', () => {
		it( 'sets image resizedWidth', () => {
			setData( model, '[<imageBlock resizedWidth="50px"></imageBlock>]' );

			command.execute( { width: '100%' } );

			expect( getData( model ) ).to.equal( '[<imageBlock resizedWidth="100%"></imageBlock>]' );
		} );

		it( 'sets image resizedWidth when selection is in a block image caption', () => {
			setData( model, '<imageBlock resizedWidth="50px"><caption>F[o]o</caption></imageBlock>' );

			command.execute( { width: '100%' } );

			expect( getData( model ) ).to.equal( '<imageBlock resizedWidth="100%"><caption>F[o]o</caption></imageBlock>' );
		} );

		it( 'removes image resizedWidth when null passed', () => {
			setData( model, '[<imageBlock resizedWidth="50px"></imageBlock>]' );

			command.execute( { width: null } );

			expect( getData( model ) ).to.equal( '[<imageBlock></imageBlock>]' );
			expect( model.document.getRoot().getChild( 0 ).hasAttribute( 'resizedWidth' ) ).to.be.false;
		} );

		it( 'removes image resizedHeight', () => {
			setData( model, '[<imageBlock resizedHeight="50px"></imageBlock>]' );

			command.execute( { width: '100%' } );

			expect( getData( model ) ).to.equal( '[<imageBlock resizedWidth="100%"></imageBlock>]' );
			expect( model.document.getRoot().getChild( 0 ).hasAttribute( 'resizedHeight' ) ).to.be.false;
		} );

		describe( 'image width and height attributes', () => {
			let editor, model, command, editorElement;

			beforeEach( async () => {
				editorElement = document.createElement( 'div' );

				document.body.appendChild( editorElement );

				editor = await ClassicTestEditor.create( editorElement, {
					plugins: [ ArticlePluginSet, ImageResizeEditing ],
					image: {
						toolbar: [ 'imageStyle:block' ]
					}
				} );

				model = editor.model;
				command = new ResizeImageCommand( editor );
			} );

			afterEach( async () => {
				editorElement.remove();
				return editor.destroy();
			} );

			it( 'should set width and height when resizedWidth is set (and be undoable in single step)', async () => {
				const initialData = '[<imageBlock src="/assets/sample.png"></imageBlock>]';

				setData( model, initialData );

				command.execute( { width: '100%' } );
				await timeout( 100 );

				expect( getData( model ) ).to.equal(
					'[<imageBlock height="96" resizedWidth="100%" src="/assets/sample.png" width="96"></imageBlock>]'
				);

				editor.execute( 'undo' );

				expect( getData( model ) ).to.equal( initialData );
			} );

			it( 'should set width and height when resizedWidth is removed (and be undoable in single step)', async () => {
				const initialData = '[<imageBlock resizedWidth="50px" src="/assets/sample.png"></imageBlock>]';

				setData( model, initialData );

				command.execute( { width: null } );
				await timeout( 100 );

				expect( getData( model ) ).to.equal( '[<imageBlock height="96" src="/assets/sample.png" width="96"></imageBlock>]' );

				editor.execute( 'undo' );

				expect( getData( model ) ).to.equal( initialData );
			} );
		} );
	} );

	function timeout( ms ) {
		return new Promise( res => setTimeout( res, ms ) );
	}
} );
