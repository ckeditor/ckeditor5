/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import ResizeImageCommand from '../../src/imageresize/resizeimagecommand.js';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting.js';
import ImageCaptionEditing from '../../src/imagecaption/imagecaptionediting.js';
import Image from '../../src/image.js';
import ImageStyle from '../../src/imagestyle.js';

describe( 'ResizeImageCommand', () => {
	let editor, model, command, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await createEditor();
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	describe( '#isEnabled', () => {
		it( 'is true when image is selected', () => {
			setData( model, '<paragraph>x</paragraph>[<imageBlock resizedWidth="50px"></imageBlock>]<paragraph>x</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is true when the selection is inside a block image caption', () => {
			setData( model, '<imageBlock resizedWidth="50px"><caption>[F]oo</caption></imageBlock>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is false when image is not selected', () => {
			setData( model, '<paragraph>x[]</paragraph><imageBlock resizedWidth="50px"></imageBlock>' );

			expect( command ).to.have.property( 'isEnabled', false );
		} );

		it( 'is false when more than one image is selected', () => {
			setData(
				model,
				'<paragraph>x</paragraph>' +
				'[<imageBlock resizedWidth="50px"></imageBlock>' +
				'<imageBlock resizedWidth="50px"></imageBlock>]'
			);

			expect( command ).to.have.property( 'isEnabled', false );
		} );
	} );

	describe( '#value', () => {
		it( 'is null when image is not selected', () => {
			setData( model, '<paragraph>x[]</paragraph><imageBlock resizedWidth="50px"></imageBlock>' );

			expect( command ).to.have.property( 'value', null );
		} );

		it( 'is set to an object with a width property (and height set to null) when a block image is selected', () => {
			setData( model, '<paragraph>x</paragraph>[<imageBlock resizedWidth="50px"></imageBlock>]<paragraph>x</paragraph>' );

			expect( command ).to.have.deep.property( 'value', { width: '50px', height: null } );
		} );

		it( 'is set to an object with a width property (and height set to null) when the selection is in a block image caption', () => {
			setData( model, '<imageBlock resizedWidth="50px"><caption>[]Foo</caption></imageBlock>' );

			expect( command ).to.have.deep.property( 'value', { width: '50px', height: null } );
		} );

		it( 'is set to null if image does not have the resizedWidth set', () => {
			setData( model, '<paragraph>x</paragraph>[<imageBlock></imageBlock>]<paragraph>x</paragraph>' );

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

	async function createEditor( config ) {
		const editor = await ClassicEditor.create( editorElement, config || {
			plugins: [ Widget, Image, ImageStyle, ImageCaptionEditing, ImageResizeEditing, Paragraph ],
			image: {
				resizeUnit: 'px'
			}
		} );

		model = editor.model;
		command = new ResizeImageCommand( editor );

		return editor;
	}
} );
