/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ImageStyleCommand from '../../src/imagestyle/imagestylecommand';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageStyleCommand', () => {
	const onlyBlockArrangement = { name: 'onlyBlockStyle', title: 'foo', icon: 'icon-1', modelElement: 'image', isDefault: true };
	const onlyInlineArrangement = { name: 'onlyInlineStyle', title: 'bar', icon: 'icon-2', modelElement: 'imageInline', isDefault: true };
	const anyImageArrangement = { name: 'anyImageStyle', title: 'baz', icon: 'icon-3', class: 'image-style-class' };

	let model, schema, command, editor;

	async function createEditor( availableArrangements ) {
		editor = await ModelTestEditor.create();

		model = editor.model;
		schema = model.schema;
		command = new ImageStyleCommand( editor, availableArrangements );

		schema.register( 'p', { inheritAllFrom: '$block' } );
		schema.register( 'media', { allowWhere: '$block' } );

		schema.register( 'image', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: 'imageStyle'
		} );

		schema.register( 'imageInline', {
			isObject: true,
			isInline: true,
			allowWhere: '$text',
			allowAttributes: [ 'alt', 'src', 'srcset' ]
		} );

		return editor;
	}

	async function destroyEditor( currentEditor ) {
		await currentEditor.destroy();
	}

	beforeEach( async () => {
		editor = await createEditor( [ onlyBlockArrangement, onlyInlineArrangement, anyImageArrangement ] );
	} );

	afterEach( async () => {
		await destroyEditor( editor );
	} );


	describe( 'value', () => {
		it( 'should be false if no element is selected', () => {
			setData( model, '<p>[]</p><image></image>' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false if no image is selected', () => {
			setData( model, '[<media></media>]' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false if the imageStyle attribute does not match any of the defined arrangements', () => {
			setData( model, '[<image imageStyle="foo"></image>]' );

			expect( command.value ).to.be.false;
		} );

		describe( 'an inline image is selected', () => {
			describe( 'an imageStyle attribute is present', () => {
				it( 'should be false if the matched arrangement is not valid for the inline image', () => {
					setData( model, '<p>[<imageInline imageStyle="onlyBlockStyle"></imageInline>]</p>' );

					expect( command.value ).to.be.false;
				} );

				it( 'should match the imageStyle attribute if the matched arrangement is valid for inline images', () => {
					setData( model, '<p>[<imageInline imageStyle="onlyInlineStyle"></imageInline>]</p>' );

					expect( command.value ).to.equal( 'onlyInlineStyle' );
				} );

				it( 'should match the imageStyle attribute if the matched arrangement is valid for any image type', () => {
					setData( model, '<p>[<imageInline imageStyle="anyImageStyle"></imageInline>]</p>' );

					expect( command.value ).to.equal( 'anyImageStyle' );
				} );
			} );

			describe( 'an imageStyle attribute is not present', () => {
				it( 'should match the proper default arrangment if defined', () => {
					setData( model, '<p>[<imageInline></imageInline>]</p>' );

					expect( command.value ).to.equal( 'onlyInlineStyle' );
				} );

				it( 'should be false if no default arrangement is provided', async () => {
					const currentEditor = await createEditor( [ onlyBlockArrangement, anyImageArrangement ] );
					setData( model, '<p>[<imageInline></imageInline>]</p>' );

					expect( command.value ).to.equal( false );
					await currentEditor.destroy();
				} );
			} );
		} );

		describe( 'a block image is selected', () => {
			describe( 'an imageStyle attribute is present', () => {
				it( 'should be false if the matched arrangement is not valid for the block image', () => {
					setData( model, '[<image imageStyle="onlyInlineStyle"></image>]' );

					expect( command.value ).to.be.false;
				} );

				it( 'should match the imageStyle attribute if the matched arrangement is valid for block images', () => {
					setData( model, '[<image imageStyle="onlyBlockStyle"></image>]' );

					expect( command.value ).to.equal( 'onlyBlockStyle' );
				} );

				it( 'should match the imageStyle attribute if the matched arrangement is valid for any image type', () => {
					setData( model, '[<image imageStyle="anyImageStyle"></image>]' );

					expect( command.value ).to.equal( 'anyImageStyle' );
				} );
			} );

			describe( 'an imageStyle attribute is not present', () => {
				it( 'should match the proper default arrangment if defined', () => {
					setData( model, '[<image></image>]' );

					expect( command.value ).to.equal( 'onlyBlockStyle' );
				} );

				it( 'should be false if no default arrangement is provided', async () => {
					const currentEditor = await createEditor( [ onlyInlineArrangement, anyImageArrangement ] );
					setData( model, '[<image></image>]' );

					expect( command.value ).to.equal( false );
					await currentEditor.destroy();
				} );
			} );
		} );
	} );

	describe( 'isEnabled', () => {

	} );

	describe( 'execute()', () => {

	} );

	// it( 'should have defaultStyle property correctly set', () => {
	// 	expect( command.defaultStyle ).to.equal( 'defaultStyle' );
	// } );

	// it( 'should set proper value when executed', () => {
	// 	setData( model, '[<image></image>]' );

	// 	command.execute( { value: 'otherStyle' } );

	// 	expect( getData( model ) ).to.equal( '[<image imageStyle="otherStyle"></image>]' );
	// } );

	// it( 'should do nothing when attribute already present', () => {
	// 	setData( model, '[<image imageStyle="otherStyle"></image>]' );

	// 	command.execute( { value: 'otherStyle' } );

	// 	expect( getData( model ) ).to.equal( '[<image imageStyle="otherStyle"></image>]' );
	// } );

	// it( 'should use parent batch', () => {
	// 	setData( model, '[<image></image>]' );

	// 	model.change( writer => {
	// 		expect( writer.batch.operations ).to.length( 0 );

	// 		command.execute( { value: 'otherStyle' } );

	// 		expect( writer.batch.operations ).to.length.above( 0 );
	// 	} );
	// } );

	// it( 'should be enabled on image element', () => {
	// 	setData( model, '[<image></image>]' );

	// 	expect( command.isEnabled ).to.be.true;
	// } );

	// it( 'should be disabled when not placed on image', () => {
	// 	setData( model, '[<p></p>]' );

	// 	expect( command.isEnabled ).to.be.false;
	// } );

	// it( 'should be disabled when not placed directly on image', () => {
	// 	setData( model, '[<p></p><image></image>]' );

	// 	expect( command.isEnabled ).to.be.false;
	// } );

	// it( 'default style should be active after executing it after another style', () => {
	// 	setData( model, '[<image></image>]' );

	// 	expect( command.value ).to.equal( 'defaultStyle' );

	// 	command.execute( { value: 'otherStyle' } );

	// 	expect( getData( model ) ).to.equal( '[<image imageStyle="otherStyle"></image>]' );

	// 	command.execute( { value: 'defaultStyle' } );

	// 	expect( getData( model ) ).to.equal( '[<image></image>]' );
	// 	expect( command.value ).to.equal( 'defaultStyle' );
	// } );
} );
