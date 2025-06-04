/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import utils from '../../src/imagestyle/utils.js';

describe( 'ImageStyleCommand', () => {
	const {
		inline: defaultInline,
		block: defaultBlock,
		alignLeft: anyImage,
		inline: onlyInline,
		alignCenter: onlyBlock
	} = utils.DEFAULT_OPTIONS;

	let editor, model, command, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );

		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ ArticlePluginSet ],
			image: {
				styles: { options: [ 'block', 'inline', 'alignLeft', 'alignCenter' ] },
				toolbar: [ 'imageStyle:block' ]
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
		setData( model, '[<imageBlock></imageBlock>]' );

		model.change( writer => {
			expect( writer.batch.operations ).to.length( 0 );

			command.execute( { value: anyImage.name } );

			expect( writer.batch.operations ).to.length.above( 0 );
		} );
	} );

	it( 'should undo the whole command action if the image type has changed', () => {
		const initialData = '[<imageBlock src="assets/sample.png"></imageBlock>]';

		setData( model, initialData );

		command.execute( { value: onlyInline.name } );

		expect( getData( model ) ).to.equal( '<paragraph>[<imageInline src="assets/sample.png"></imageInline>]</paragraph>' );

		editor.execute( 'undo' );

		expect( getData( model ) ).to.equal( initialData );
	} );

	describe( 'constructor()', () => {
		it( 'should set default styles\' names properly if both of them are defined in the config', () => {
			expect( command._defaultStyles ).to.deep.equal( {
				imageBlock: defaultBlock.name,
				imageInline: defaultInline.name
			} );
		} );

		it( 'should set default styles\' names properly if one of them is missing in the config', async () => {
			const customElement = document.createElement( 'div' );

			document.body.appendChild( customElement );

			const customEditor = await ClassicTestEditor.create( editorElement, {
				plugins: [ ArticlePluginSet ],
				image: {
					styles: { options: [ 'block', 'alignLeft', 'alignCenter' ] },
					toolbar: [ 'imageStyle:block' ]
				}
			} );

			const customCommand = customEditor.commands.get( 'imageStyle' );

			expect( customCommand._defaultStyles ).to.deep.equal( {
				imageBlock: defaultBlock.name,
				imageInline: false
			} );

			customElement.remove();
			await customEditor.destroy();
		} );

		it( 'should set the supported styles properly', () => {
			expect( command._styles ).to.deep.equal( new Map( [
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
			setData( model, '<paragraph>[]</paragraph><imageBlock></imageBlock>' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false if no image is selected', () => {
			setData( model, '[<media></media>]' );

			expect( command.value ).to.be.false;
		} );

		it( 'should match the imageStyle attribute if a block image is selected', () => {
			setData( model, `[<imageBlock imageStyle="${ anyImage.name }"></imageBlock>]` );

			expect( command.value ).to.equal( anyImage.name );
		} );

		describe( 'when an inline image is selected', () => {
			it( 'should match the imageStyle attribute if it is present', () => {
				setData( model, `<paragraph>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</paragraph>` );

				expect( command.value ).to.equal( anyImage.name );
			} );

			it( 'should match the proper default style if the imageStyle attribute is not present', () => {
				setData( model, '<paragraph>[<imageInline></imageInline>]</paragraph>' );

				expect( command.value ).to.equal( defaultInline.name );
			} );

			it( 'should be false if the imageStyle attribute is not present and no default style is provided', async () => {
				const customElement = document.createElement( 'div' );

				document.body.appendChild( customElement );

				const customEditor = await ClassicTestEditor.create( editorElement, {
					plugins: [ ArticlePluginSet ],
					image: {
						styles: { options: [ 'block', 'alignLeft', 'alignCenter' ] },
						toolbar: [ 'imageStyle:block' ]
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
				setData( model, `[<imageBlock imageStyle="${ anyImage.name }"></imageBlock>]` );

				expect( command.value ).to.equal( anyImage.name );
			} );

			it( 'should match the proper default style if the imageStyle attribute is not present', () => {
				setData( model, '[<imageBlock></imageBlock>]' );

				expect( command.value ).to.equal( defaultBlock.name );
			} );

			it( 'should be false if the imageStyle attribute is not present and no default style is provided', async () => {
				const customElement = document.createElement( 'div' );

				document.body.appendChild( customElement );

				const customEditor = await ClassicTestEditor.create( editorElement, {
					plugins: [ ArticlePluginSet ],
					image: {
						styles: { options: [ 'block', 'alignLeft', 'alignCenter' ] },
						toolbar: [ 'imageStyle:block' ]
					}
				} );

				const currentCommand = customEditor.commands.get( 'imageStyle' );

				setData( model, '[<imageBlock></imageBlock>]' );
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
			setData( model, '[<imageBlock></imageBlock>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be disabled if no image is selected', () => {
			setData( model, '[<paragraph></paragraph>]' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be disabled if selection is not directly on the block image', () => {
			setData( model, '[<paragraph></paragraph><imageBlock></imageBlock>]' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be disabled if selection is not directly on the inline image', () => {
			setData( model, '[<paragraph></paragraph><paragraph><imageInline></imageInline></paragraph>]' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true when the selection is in a block image caption', () => {
			setData( model, '<imageBlock><caption>[]Foo</caption></imageBlock>' );

			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		const imgSrc = 'assets/sample.png';

		describe( 'converting image type', () => {
			describe( 'when an inline image is selected', () => {
				it( 'should change the image type if the requested type is other than imageInline', () => {
					setData( model, `<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` );
					command.execute( { value: onlyBlock.name } );

					expect( getData( model ) )
						.to.equal( `[<imageBlock imageStyle="alignCenter" src="${ imgSrc }"></imageBlock>]` );
				} );

				it( 'should not change the image type if the requested type equals imageInline', () => {
					setData( model, `<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` );
					command.execute( { value: defaultInline.name } );

					expect( getData( model ) )
						.to.equal( `<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` );
				} );

				it( 'should not change the image type if the requested type is not specified', () => {
					setData( model, `<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) ).to.equal(
						`<paragraph>[<imageInline imageStyle="${ anyImage.name }" src="${ imgSrc }"></imageInline>]</paragraph>`
					);
				} );
			} );

			describe( 'when a block image is selected', () => {
				it( 'should change the image type if the requested type is other than imageBlock', () => {
					setData( model, `[<imageBlock src="${ imgSrc }"></imageBlock>]` );
					command.execute( { value: onlyInline.name } );

					expect( getData( model ) )
						.to.equal( `<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` );
				} );

				it( 'should not change the image type if the requested type equals imageBlock', () => {
					setData( model, `[<imageBlock src="${ imgSrc }"><caption></caption></imageBlock>]` );
					command.execute( { value: onlyBlock.name } );

					expect( getData( model ) )
						.to.equal( `[<imageBlock imageStyle="${ onlyBlock.name }" src="${ imgSrc }"><caption></caption></imageBlock>]` );
				} );

				it( 'should not change the image type if the requested type is not specified', () => {
					setData( model, `[<imageBlock src="${ imgSrc }"><caption></caption></imageBlock>]` );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `[<imageBlock imageStyle="${ anyImage.name }" src="${ imgSrc }"><caption></caption></imageBlock>]` );
				} );
			} );

			it( 'should change the image type if the selection is inside a caption', () => {
				setData( model, `<imageBlock src="${ imgSrc }"><caption>[]Foo</caption></imageBlock>` );
				command.execute( { value: onlyInline.name } );

				expect( getData( model ) ).to.equal(
					`<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>`
				);
			} );
		} );

		describe( 'converting image style', () => {
			describe( 'when an inline image is selected', () => {
				it( 'should remove the imageStyle attribute if the requested style is set as default', () => {
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

				it( 'should set default style if no style specified', () => {
					setData( model, '<paragraph>[<imageInline imageStyle="${ anyImage.name }"></imageInline>]</paragraph>' );

					command.execute();

					expect( getData( model ) ).to.equal( '<paragraph>[<imageInline></imageInline>]</paragraph>' );
					expect( command.value ).to.equal( defaultInline.name );
				} );

				it( 'should set width and height when imageStyle is set (and be undoable in single step)', async () => {
					const initialData = '<paragraph>[<imageInline src="/assets/sample.png"></imageInline>]</paragraph>';

					setData( model, initialData );
					command.execute( { value: anyImage.name } );
					await timeout( 100 );

					expect( getData( model ) ).to.equal(
						`<paragraph>[<imageInline height="96" imageStyle="${ anyImage.name }" ` +
							'src="/assets/sample.png" width="96"></imageInline>]</paragraph>'
					);

					editor.execute( 'undo' );

					expect( getData( model ) )
						.to.equal( initialData );
				} );

				it( 'should set width and height when imageStyle is removed (and be undoable in single step)', async () => {
					const initialData =
						`<paragraph>[<imageInline imageStyle="${ anyImage.name }" src="/assets/sample.png"></imageInline>]</paragraph>`;

					setData( model, initialData );
					command.execute( { value: defaultInline.name } );
					await timeout( 100 );

					expect( getData( model ) )
						.to.equal( '<paragraph>[<imageInline height="96" src="/assets/sample.png" width="96"></imageInline>]</paragraph>' );

					editor.execute( 'undo' );

					expect( getData( model ) )
						.to.equal( initialData );
				} );

				it( 'should not set width and height when command `setImageSizes` parameter is false', async () => {
					const initialData = '<paragraph>[<imageInline src="/assets/sample.png"></imageInline>]</paragraph>';

					setData( model, initialData );
					command.execute( { value: anyImage.name, setImageSizes: false } );
					await timeout( 100 );

					expect( getData( model ) ).to.equal(
						`<paragraph>[<imageInline imageStyle="${ anyImage.name }" src="/assets/sample.png"></imageInline>]</paragraph>`
					);
				} );
			} );

			describe( 'when a block image is selected', () => {
				it( 'should remove the imageStyle attribute if the requested style is set as default', () => {
					setData( model, `[<imageBlock imageStyle="${ anyImage.name }"><caption></caption></imageBlock>]` );
					command.execute( { value: defaultBlock.name } );

					expect( getData( model ) )
						.to.equal( '[<imageBlock><caption></caption></imageBlock>]' );
				} );

				it( 'should set properly the imageStyle attribute if it is present', () => {
					setData( model, `[<imageBlock imageStyle="${ onlyBlock.name }"><caption></caption></imageBlock>]` );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `[<imageBlock imageStyle="${ anyImage.name }"><caption></caption></imageBlock>]` );
				} );

				it( 'should set properly the imageStyle attribute if it is not present', () => {
					setData( model, '[<imageBlock><caption></caption></imageBlock>]' );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `[<imageBlock imageStyle="${ anyImage.name }"><caption></caption></imageBlock>]` );
				} );

				it( 'should do nothing if requested attribute is already present', () => {
					setData( model, `[<imageBlock imageStyle="${ anyImage.name }"><caption></caption></imageBlock>]` );
					command.execute( { value: anyImage.name } );

					expect( getData( model ) )
						.to.equal( `[<imageBlock imageStyle="${ anyImage.name }"><caption></caption></imageBlock>]` );
				} );

				it( 'should set default style if executing it after another style', () => {
					setData( model, '[<imageBlock><caption></caption></imageBlock>]' );

					expect( command.value ).to.equal( defaultBlock.name );

					command.execute( { value: anyImage.name } );

					expect( getData( model ) ).to.equal( `[<imageBlock imageStyle="${ anyImage.name }"><caption></caption></imageBlock>]` );

					command.execute( { value: defaultBlock.name } );

					expect( getData( model ) ).to.equal( '[<imageBlock><caption></caption></imageBlock>]' );
					expect( command.value ).to.equal( defaultBlock.name );
				} );

				it( 'should set default style if no style specified', () => {
					setData( model, '[<imageBlock imageStyle="${ anyImage.name }"><caption></caption></imageBlock>]' );

					command.execute();

					expect( getData( model ) ).to.equal( '[<imageBlock><caption></caption></imageBlock>]' );
					expect( command.value ).to.equal( defaultBlock.name );
				} );

				it( 'should set width and height when imageStyle is set (and be undoable in single step)', async () => {
					const initialData = '[<imageBlock src="/assets/sample.png"></imageBlock>]';

					setData( model, initialData );
					command.execute( { value: anyImage.name } );
					await timeout( 100 );

					expect( getData( model ) ).to.equal(
						`[<imageBlock height="96" imageStyle="${ anyImage.name }" src="/assets/sample.png" width="96"></imageBlock>]`
					);

					editor.execute( 'undo' );

					expect( getData( model ) )
						.to.equal( initialData );
				} );

				it( 'should set width and height when imageStyle is removed (and be undoable in single step)', async () => {
					const initialData =
						`[<imageBlock imageStyle="${ anyImage.name }" src="/assets/sample.png"></imageBlock>]`;

					setData( model, initialData );
					command.execute( { value: defaultBlock.name } );
					await timeout( 100 );

					expect( getData( model ) )
						.to.equal( '[<imageBlock height="96" src="/assets/sample.png" width="96"></imageBlock>]' );

					editor.execute( 'undo' );

					expect( getData( model ) )
						.to.equal( initialData );
				} );

				it( 'should not set width and height when command `setImageSizes` parameter is false', async () => {
					const initialData = '[<imageBlock src="/assets/sample.png"></imageBlock>]';

					setData( model, initialData );
					command.execute( { value: anyImage.name, setImageSizes: false } );
					await timeout( 100 );

					expect( getData( model ) ).to.equal(
						`[<imageBlock imageStyle="${ anyImage.name }" src="/assets/sample.png"></imageBlock>]`
					);
				} );
			} );

			it( 'should set the style if the selection is inside a caption', () => {
				setData( model, `<imageBlock imageStyle="${ onlyBlock.name }"><caption>Fo[o]</caption></imageBlock>` );
				command.execute( { value: anyImage.name } );

				expect( getData( model ) )
					.to.equal( `<imageBlock imageStyle="${ anyImage.name }"><caption>Fo[o]</caption></imageBlock>` );
			} );
		} );

		function timeout( ms ) {
			return new Promise( res => setTimeout( res, ms ) );
		}
	} );

	describe( 'shouldConvertImageType()', () => {
		const imgSrc = 'assets/sample.png';

		describe( 'for an inline image', () => {
			it( 'should return true if the requested type is other than imageInline', () => {
				setData( model, `<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` );

				const image = model.document.selection.getSelectedElement();

				expect( command.shouldConvertImageType( onlyBlock.name, image ) ).to.be.true;
			} );

			it( 'should return false if the requested type equals imageInline', () => {
				setData( model, `<paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>` );

				const image = model.document.selection.getSelectedElement();

				expect( command.shouldConvertImageType( defaultInline.name, image ) ).to.be.false;
			} );
		} );

		describe( 'for a block image', () => {
			it( 'should return true if the requested type is other than imageBlock', () => {
				setData( model, `[<imageBlock src="${ imgSrc }"></imageBlock>]` );

				const image = model.document.selection.getSelectedElement();

				expect( command.shouldConvertImageType( onlyInline.name, image ) ).to.be.true;
			} );

			it( 'should return false if the requested type equals imageBlock', () => {
				setData( model, `[<imageBlock src="${ imgSrc }"><caption></caption></imageBlock>]` );

				const image = model.document.selection.getSelectedElement();

				expect( command.shouldConvertImageType( onlyBlock.name, image ) ).to.be.false;
			} );
		} );
	} );
} );
