/* eslint-disable no-undef */
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import utils from '../../src/imagestyle/utils';

describe( 'ImageStyleCommand', () => {
	const {
		inline: defaultInline,
		full: defaultBlock,
		alignLeft: anyImage,
		inline: onlyInline,
		alignCenter: onlyBlock
	} = utils.DEFAULT_ARRANGEMENTS;

	let editor, model, command, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );

		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ ArticlePluginSet ],
			image: {
				styles: {
					arrangements: [ 'full', 'inline', 'alignLeft', 'alignCenter' ],
					groups: [ { name: 'default', items: [ 'full' ], defaultItem: 'full' } ]
				},
				toolbar: [ 'imageStyle:full' ]
			}
		} );

		model = editor.model;
		command = editor.commands.get( 'imageStyle' );
	} );

	afterEach( async () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should use parent batch', () => {
		setData( model, '[<image></image>]' );

		model.change( writer => {
			expect( writer.batch.operations ).to.length( 0 );

			command.execute( { value: anyImage.name } );

			expect( writer.batch.operations ).to.length.above( 0 );
		} );
	} );

	it( 'should undo the whole command action if the image type has changed', () => {
		const initialData = '[<image src="assets/sample.png"></image>]';

		setData( model, initialData );

		command.execute( { value: onlyInline.name } );

		expect( getData( model ) ).to.equal( '<paragraph>[<imageInline src="assets/sample.png"></imageInline>]</paragraph>' );

		editor.execute( 'undo' );

		expect( getData( model ) ).to.equal( initialData );
	} );

	describe( 'constructor()', () => {
		it( 'should set default arrangement names properly if both of them are defined in the config', () => {
			expect( command._defaultArrangements ).to.deep.equal( {
				image: defaultBlock.name,
				imageInline: defaultInline.name
			} );
		} );

		it( 'should set default arrangements names properly if one of them is missing in the config', async () => {
			const customElement = document.createElement( 'div' );

			document.body.appendChild( customElement );

			const customEditor = await ClassicTestEditor.create( editorElement, {
				plugins: [ ArticlePluginSet ],
				image: {
					styles: {
						arrangements: [ 'full', 'alignLeft', 'alignCenter' ],
						groups: [ { name: 'default', items: [ 'full' ], defaultItem: 'full' } ]
					},
					toolbar: [ 'imageStyle:full' ]
				}
			} );

			const customCommand = customEditor.commands.get( 'imageStyle' );

			expect( customCommand._defaultArrangements ).to.deep.equal( {
				image: defaultBlock.name,
				imageInline: false
			} );

			customElement.remove();
			await customEditor.destroy();
		} );

		it( 'should set the supported arrangements properly', () => {
			expect( command._arrangements ).to.deep.equal( new Map( [
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
			setData( model, '<paragraph>[]</paragraph><image></image>' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false if no image is selected', () => {
			setData( model, '[<media></media>]' );

			expect( command.value ).to.be.false;
		} );

		it( 'should match the imageStyle attribute if a block image is selected', () => {
			setData( model, `[<image imageStyle="${ anyImage.name }"></image>]` );

			expect( command.value ).to.equal( anyImage.name );
		} );

		describe( 'when an inline image is selected', () => {
			it( 'should match the imageStyle attribute if it is present', () => {
				setData( model, `<paragraph>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</paragraph>` );

				expect( command.value ).to.equal( anyImage.name );
			} );

			it( 'should match the proper default arrangement if the imageStyle attribute is not present', () => {
				setData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );

				expect( command.value ).to.equal( defaultInline.name );
			} );

			it( 'should be false if the imageStyle attribute is not present and no default arrangement is provided', async () => {
				const customElement = document.createElement( 'div' );

				document.body.appendChild( customElement );

				const customEditor = await ClassicTestEditor.create( editorElement, {
					plugins: [ ArticlePluginSet ],
					image: {
						styles: {
							arrangements: [ 'full', 'alignLeft', 'alignCenter' ],
							groups: []
						},
						toolbar: [ 'imageStyle:full' ]
					}
				} );

				const currentCommand = customEditor.commands.get( 'imageStyle' );

				setData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );
				expect( currentCommand.value ).to.equal( false );

				customElement.remove();
				await customEditor.destroy();
			} );
		} );

		describe( 'when a block image is selected', () => {
			it( 'should match the imageStyle attribute if it is present', () => {
				setData( model, `[<image imageStyle="${ anyImage.name }"></image>]` );

				expect( command.value ).to.equal( anyImage.name );
			} );

			it( 'should match the proper default arrangement if the imageStyle attribute is not present', () => {
				setData( model, '[<image></image>]' );

				expect( command.value ).to.equal( defaultBlock.name );
			} );

			it( 'should be false if the imageStyle attribute is not present and no default arrangement is provided', async () => {
				const customElement = document.createElement( 'div' );

				document.body.appendChild( customElement );

				const customEditor = await ClassicTestEditor.create( editorElement, {
					plugins: [ ArticlePluginSet ],
					image: {
						styles: {
							arrangements: [ 'full', 'alignLeft', 'alignCenter' ],
							groups: []
						},
						toolbar: [ 'imageStyle:full' ]
					}
				} );

				const currentCommand = customEditor.commands.get( 'imageStyle' );

				setData( model, '[<image></image>]' );
				expect( currentCommand.value ).to.equal( false );

				customElement.remove();
				await customEditor.destroy();
			} );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be enabled if an inline image is selected', () => {
			setData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be enabled if a block image is selected', () => {
			setData( model, '[<image></image>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be disabled if no image is selected', () => {
			setData( model, '[<paragraph></paragraph>]' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be disabled if selection is not directly on the block image', () => {
			setData( model, '[<paragraph></paragraph><image></image>]' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be disabled if selection is not directly on the inline image', () => {
			setData( model, '[<paragraph></paragraph><paragraph><imageInline></imageInline></paragraph>]' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		describe( 'converting image type', () => {
			describe( 'when an inline image is selected', () => {
				it( 'should change the image type if the requested type is other than imageInline', () => {
					setData( model, '<paragraph>[<imageInline src="assets/sample.png"></imageInline>]</paragraph>' );
					command.execute( { value: onlyBlock.name } );

					expect( getData( model ) )
						.to.equal( '[<image imageStyle="alignCenter" src="assets/sample.png"></image>]' );
				} );

				it( 'should not change the image type if the requested type equals imageInline', () => {
					setData( model, '<paragraph>[<imageInline src="assets/sample.png"></imageInline>]</paragraph>' );
					command.execute( { value: defaultInline.name } );

					expect( getData( model ) )
						.to.equal( '<paragraph>[<imageInline src="assets/sample.png"></imageInline>]</paragraph>' );
				} );

				it( 'should not change the image type if the requested type is not specified', () => {
					setData( model, '<paragraph>[<imageInline src="assets/sample.png"></imageInline>]</paragraph>' );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) ).to.equal(
						`<paragraph>[<imageInline imageStyle="${ anyImage.name }" src="assets/sample.png"></imageInline>]</paragraph>`
					);
				} );
			} );

			describe( 'when a block image is selected', () => {
				it( 'should change the image type if the requested type is other than imageBlock', () => {
					setData( model, '[<image src="assets/sample.png"></image>]' );
					command.execute( { value: onlyInline.name } );

					expect( getData( model ) )
						.to.equal( '<paragraph>[<imageInline src="assets/sample.png"></imageInline>]</paragraph>' );
				} );

				it( 'should not change the image type if the requested type equals imageBlock', () => {
					setData( model, '[<image src="assets/sample.png"><caption></caption></image>]' );
					command.execute( { value: onlyBlock.name } );

					expect( getData( model ) )
						.to.equal( `[<image imageStyle="${ onlyBlock.name }" src="assets/sample.png"><caption></caption></image>]` );
				} );

				it( 'should not change the image type if the requested type is not specified', () => {
					setData( model, '[<image src="assets/sample.png"><caption></caption></image>]' );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `[<image imageStyle="${ anyImage.name }" src="assets/sample.png"><caption></caption></image>]` );
				} );
			} );
		} );

		describe( 'converting image arrangement', () => {
			describe( 'when an inline image is selected', () => {
				it( 'should remove the imageStyle attribute if the requested arrangement is set as default', () => {
					setData( model, `<paragraph>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</paragraph>` );
					command.execute( { value: defaultInline.name } );

					expect( getData( model ) )
						.to.equal( '<paragraph>[<imageInline></imageInline>]</paragraph>' );
				} );

				it( 'should set properly the imageStyle attribute if it is present', () => {
					setData( model, `<paragraph>[<imageInline imageStyle="${ onlyInline.name }"></imageInline>]</paragraph>` );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `<paragraph>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</paragraph>` );
				} );

				it( 'should set properly the imageStyle attribute if it is not present', () => {
					setData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `<paragraph>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</paragraph>` );
				} );

				it( 'should do nothing if requested attribute is already present', () => {
					setData( model, `<paragraph>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</paragraph>` );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `<paragraph>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</paragraph>` );
				} );

				it( 'should set default style if executing it after another style', () => {
					setData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );

					expect( command.value ).to.equal( defaultInline.name );

					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `<paragraph>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</paragraph>` );

					command.execute( { value: defaultInline.name } );

					expect( getData( model ) ).to.equal( '<paragraph>[<imageInline></imageInline>]</paragraph>' );
					expect( command.value ).to.equal( defaultInline.name );
				} );
			} );

			describe( 'when a block image is selected', () => {
				it( 'should remove the imageStyle attribute if the requested arrangement is set as default', () => {
					setData( model, `[<image imageStyle="${ anyImage.name }"><caption></caption></image>]` );
					command.execute( { value: defaultBlock.name } );

					expect( getData( model ) )
						.to.equal( '[<image><caption></caption></image>]' );
				} );

				it( 'should set properly the imageStyle attribute if it is present', () => {
					setData( model, `[<image imageStyle="${ onlyBlock.name }"><caption></caption></image>]` );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `[<image imageStyle="${ anyImage.name }"><caption></caption></image>]` );
				} );

				it( 'should set properly the imageStyle attribute if it is not present', () => {
					setData( model, '[<image><caption></caption></image>]' );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `[<image imageStyle="${ anyImage.name }"><caption></caption></image>]` );
				} );

				it( 'should do nothing if requested attribute is already present', () => {
					setData( model, `[<image imageStyle="${ anyImage.name }"><caption></caption></image>]` );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `[<image imageStyle="${ anyImage.name }"><caption></caption></image>]` );
				} );

				it( 'should set default style if executing it after another style', () => {
					setData( model, '[<image><caption></caption></image>]' );

					expect( command.value ).to.equal( defaultBlock.name );

					command.execute( { value: anyImage.name } );

					expect( getData( model ) ).to.equal( `[<image imageStyle="${ anyImage.name }"><caption></caption></image>]` );

					command.execute( { value: defaultBlock.name } );

					expect( getData( model ) ).to.equal( '[<image><caption></caption></image>]' );
					expect( command.value ).to.equal( defaultBlock.name );
				} );
			} );
		} );
	} );
} );
