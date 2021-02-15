/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ImageStyleCommand from '../../src/imagestyle/imagestylecommand';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ImageTypeCommand from '../../src/image/imagetypecommand';

describe( 'ImageStyleCommand', () => {
	const onlyBlock = {
		name: 'onlyBlock',
		title: 'foo',
		icon: 'icon-1',
		modelElement: 'image',
		class: 'image-style-class'
	};
	const onlyInline = {
		name: 'onlyInline',
		title: 'foo',
		icon: 'icon-2',
		modelElement: 'imageInline',
		class: 'image-style-class'
	};
	const anyImage = {
		name: 'anyImage',
		title: 'foo',
		icon: 'icon-3',
		class: 'image-style-class'
	};
	const defaultInline = {
		name: 'defaultInline',
		title: 'foo',
		icon: 'icon-4',
		modelElement: 'imageInline',
		isDefault: true
	};
	const defaultBlock = {
		name: 'defaultBlock',
		title: 'foo',
		icon: 'icon-5',
		modelElement: 'image',
		isDefault: true
	};

	let model, schema, command, editor;

	beforeEach( async () => {
		editor = await ModelTestEditor.create();

		model = editor.model;
		schema = model.schema;
		command = new ImageStyleCommand( editor, [
			anyImage,
			defaultInline, onlyInline,
			defaultBlock, onlyBlock
		] );

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
			allowAttributes: [ 'src' ]
		} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should use parent batch', () => {
		setData( model, '[<image></image>]' );

		model.change( writer => {
			expect( writer.batch.operations ).to.length( 0 );

			command.execute( { value: 'anyImage' } );

			expect( writer.batch.operations ).to.length.above( 0 );
		} );
	} );

	describe( 'constuctor()', () => {
		it( 'should set default arrangements properly if both are provided', () => {
			expect( command._defaultArrangements ).to.eql( {
				image: defaultBlock.name,
				imageInline: defaultInline.name
			} );
		} );

		it( 'should set default arrangements properly if one is missing', () => {
			const command = new ImageStyleCommand( editor, [ defaultBlock ] );

			expect( command._defaultArrangements ).to.eql( {
				image: defaultBlock.name,
				imageInline: false
			} );
		} );

		it( 'should set the supported arrangements properly', () => {
			expect( command._arrangements ).to.eql( new Map( [
				[ onlyBlock.name, onlyBlock ],
				[ onlyInline.name, onlyInline ],
				[ anyImage.name, anyImage ],
				[ defaultInline.name, defaultInline ],
				[ defaultBlock.name, defaultBlock ]
			] ) );
		} );
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
					setData( model, `<p>[<imageInline imageStyle="${ onlyBlock.name }"></imageInline>]</p>` );

					expect( command.value ).to.be.false;
				} );

				it( 'should match the imageStyle attribute if the matched arrangement is valid for inline images', () => {
					setData( model, `<p>[<imageInline imageStyle="${ onlyInline.name }"></imageInline>]</p>` );

					expect( command.value ).to.equal( onlyInline.name );
				} );

				it( 'should match the imageStyle attribute if the matched arrangement is valid for any image type', () => {
					setData( model, `<p>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</p>` );

					expect( command.value ).to.equal( anyImage.name );
				} );
			} );

			describe( 'an imageStyle attribute is not present', () => {
				it( 'should match the proper default arrangment if defined', () => {
					setData( model, '<p>[<imageInline></imageInline>]</p>' );

					expect( command.value ).to.equal( defaultInline.name );
				} );

				it( 'should be false if no default arrangement is provided', async () => {
					const currentCommand = new ImageStyleCommand( editor, [ anyImage ] );
					setData( model, '<p>[<imageInline></imageInline>]</p>' );

					expect( currentCommand.value ).to.equal( false );
				} );
			} );
		} );

		describe( 'a block image is selected', () => {
			describe( 'an imageStyle attribute is present', () => {
				it( 'should be false if the matched arrangement is not valid for the block image', () => {
					setData( model, `[<image imageStyle="${ onlyInline.name }"></image>]` );

					expect( command.value ).to.equal( false );
				} );

				it( 'should match the imageStyle attribute if the matched arrangement is valid for block images', () => {
					setData( model, `[<image imageStyle="${ onlyBlock.name }"></image>]` );

					expect( command.value ).to.equal( onlyBlock.name );
				} );

				it( 'should match the imageStyle attribute if the matched arrangement is valid for any image type', () => {
					setData( model, `[<image imageStyle="${ anyImage.name }"></image>]` );

					expect( command.value ).to.equal( anyImage.name );
				} );
			} );

			describe( 'an imageStyle attribute is not present', () => {
				it( 'should match the proper default arrangment if defined', () => {
					setData( model, '[<image></image>]' );

					expect( command.value ).to.equal( defaultBlock.name );
				} );

				it( 'should be false if no default arrangement is provided', async () => {
					const currentCommand = new ImageStyleCommand( editor, [ anyImage ] );
					setData( model, '[<image></image>]' );

					expect( currentCommand.value ).to.equal( false );
				} );
			} );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be enabled if an inline image is selected', () => {
			setData( model, '<p>[<imageInline></imageInline>]</p>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be enabled if a block image is selected', () => {
			setData( model, '[<image></image>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be disabled if no image is selected', () => {
			setData( model, '[<p></p>]' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be disabled if selection is not directly on the block image', () => {
			setData( model, '[<p></p><image></image>]' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be disabled if selection is not directly on the inline image', () => {
			setData( model, '[<p></p><p><imageInline></imageInline></p>]' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		beforeEach( () => {
			editor.commands.add( 'imageTypeBlock', new ImageTypeCommand( editor, 'image' ) );
			editor.commands.add( 'imageTypeInline', new ImageTypeCommand( editor, 'imageInline' ) );
		} );

		describe( 'converting image type', () => {
			describe( 'on the inline image', () => {
				it( 'should change the image type if the requested type is other than imageInline', () => {
					setData( model, '<p>[<imageInline src="source"></imageInline>]</p>' );
					command.execute( { value: onlyBlock.name } );

					expect( getData( model ) )
						.to.equal( '[<image src="source"></image>]' );
					// TODO: Does not change the image type, not sure why.
				} );

				it( 'should not change the image type if the requested type equals imageInline', () => {
					setData( model, '<p>[<imageInline src="source"></imageInline>]</p>' );
					command.execute( { value: onlyInline.name } );

					expect( getData( model ) )
						.to.equal( `<p>[<imageInline imageStyle="${ onlyInline.name }" src="source"></imageInline>]</p>` );
				} );

				it( 'should not change the image type if the requested type is not specified', () => {
					setData( model, '<p>[<imageInline src="source"></imageInline>]</p>' );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `<p>[<imageInline imageStyle="${ anyImage.name }" src="source"></imageInline>]</p>` );
				} );
			} );

			describe( 'on the block image', () => {
				it( 'should change the image type if the requested type is other than imageBlock', () => {
					setData( model, '[<image src="source"></image>]' );
					command.execute( { value: onlyInline.name } );

					expect( getData( model ) )
						.to.equal( '<p>[<imageInline src="source"></imageInline>]</p>' );
				} );

				it( 'should not change the image type if the requested type equals imageBlock', () => {
					setData( model, '[<image src="source"></image>]' );
					command.execute( { value: onlyBlock.name } );

					expect( getData( model ) )
						.to.equal( `[<image imageStyle="${ onlyBlock.name }" src="source"></image>]` );
				} );

				it( 'should not change the image type if the requested type is not specified', () => {
					setData( model, '[<image src="source"></image>]' );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `[<image imageStyle="${ anyImage.name }" src="source"></image>]` );
				} );
			} );
		} );

		describe( 'converting image arrangement', () => {
			describe( 'on the inline image', () => {
				it( 'should remove the imageStyle attribute if the requested arrangement is set as default', () => {
					setData( model, `<p>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</p>` );
					command.execute( { value: defaultInline.name } );

					expect( getData( model ) )
						.to.equal( '<p>[<imageInline></imageInline>]</p>' );
				} );

				it( 'should set properly the imageStyle attribute if it is present', () => {
					setData( model, `<p>[<imageInline imageStyle="${ onlyInline.name }"></imageInline>]</p>` );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `<p>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</p>` );
				} );

				it( 'should set properly the imageStyle attribute if it is not present', () => {
					setData( model, '<p>[<imageInline></imageInline>]</p>' );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `<p>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</p>` );
				} );

				it( 'should do nothing if requested attribute is already present', () => {
					setData( model, `<p>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</p>` );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `<p>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</p>` );
				} );

				it( 'should set default style if executing it after another style', () => {
					setData( model, '<p>[<imageInline></imageInline>]</p>' );

					expect( command.value ).to.equal( defaultInline.name );

					command.execute( { value: anyImage.name } );

					expect( getData( model ) ).to.equal( `<p>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</p>` );

					command.execute( { value: defaultInline.name } );

					expect( getData( model ) ).to.equal( '<p>[<imageInline></imageInline>]</p>' );
					expect( command.value ).to.equal( defaultInline.name );
				} );
			} );

			describe( 'on the block image', () => {
				it( 'should remove the imageStyle attribute if the requested arrangement is set as default', () => {
					setData( model, `[<image imageStyle="${ anyImage.name }"></image>]` );
					command.execute( { value: defaultBlock.name } );

					expect( getData( model ) )
						.to.equal( '[<image></image>]' );
				} );

				it( 'should set properly the imageStyle attribute if it is present', () => {
					setData( model, `[<image imageStyle="${ onlyBlock.name }"></image>]` );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `[<image imageStyle="${ anyImage.name }"></image>]` );
				} );

				it( 'should set properly the imageStyle attribute if it is not present', () => {
					setData( model, '[<image></image>]' );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `[<image imageStyle="${ anyImage.name }"></image>]` );
				} );

				it( 'should do nothing if requested attribute is already present', () => {
					setData( model, `[<image imageStyle="${ anyImage.name }"></image>]` );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `[<image imageStyle="${ anyImage.name }"></image>]` );
				} );

				it( 'should set default style if executing it after another style', () => {
					setData( model, '[<image></image>]' );

					expect( command.value ).to.equal( defaultBlock.name );

					command.execute( { value: anyImage.name } );

					expect( getData( model ) ).to.equal( `[<image imageStyle="${ anyImage.name }"></image>]` );

					command.execute( { value: defaultBlock.name } );

					expect( getData( model ) ).to.equal( '[<image></image>]' );
					expect( command.value ).to.equal( defaultBlock.name );
				} );
			} );
		} );
	} );
} );
