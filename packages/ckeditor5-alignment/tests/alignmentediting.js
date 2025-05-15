/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import AlignmentEditing from '../src/alignmentediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting.js';
import LegacyListEditing from '@ckeditor/ckeditor5-list/src/legacylist/legacylistediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import AlignmentCommand from '../src/alignmentcommand.js';

describe( 'AlignmentEditing', () => {
	let editor, model;

	beforeEach( async () => {
		editor = await VirtualTestEditor
			.create( {
				plugins: [ AlignmentEditing, Paragraph ]
			} );

		model = editor.model;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( AlignmentEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( AlignmentEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should have pluginName', () => {
		expect( AlignmentEditing.pluginName ).to.equal( 'AlignmentEditing' );
	} );

	it( 'adds alignment command', () => {
		expect( editor.commands.get( 'alignment' ) ).to.be.instanceOf( AlignmentCommand );
	} );

	it( 'allows for alignment in $blocks', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block' ], 'alignment' ) ).to.be.true;
	} );

	it( 'its attribute is marked with a formatting property', () => {
		expect( model.schema.getAttributeProperties( 'alignment' ) ).to.deep.equal( {
			isFormatting: true
		} );
	} );

	describe( 'integration', () => {
		beforeEach( async () => {
			const editor = await VirtualTestEditor
				.create( {
					plugins: [ AlignmentEditing, ImageCaptionEditing, Paragraph, LegacyListEditing, HeadingEditing ]
				} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'is allowed on paragraph', () => {
			expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'alignment' ) ).to.be.true;
		} );

		it( 'is allowed on listItem', () => {
			expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listType' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listIndent' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'alignment' ) ).to.be.true;
		} );

		it( 'is allowed on heading', () => {
			expect( model.schema.checkAttribute( [ '$root', 'heading1' ], 'alignment' ) ).to.be.true;
		} );

		it( 'is disallowed on caption', () => {
			expect( model.schema.checkAttribute( [ '$root', 'imageBlock', 'caption' ], 'alignment' ) ).to.be.false;
		} );
	} );

	describe( 'left alignment', () => {
		describe( 'LTR content', () => {
			it( 'adds converters to the data pipeline', () => {
				const data = '<p style="text-align:left;">x</p>';

				editor.setData( data );

				expect( getModelData( model ) ).to.equal( '<paragraph>[]x</paragraph>' );
				expect( editor.getData() ).to.equal( '<p>x</p>' );
			} );

			it( 'adds a converter to the view pipeline', () => {
				setModelData( model, '<paragraph alignment="left">[]x</paragraph>' );

				expect( editor.getData() ).to.equal( '<p>x</p>' );
			} );

			describe( 'className', () => {
				it( 'adds converters to the data pipeline', async () => {
					const newEditor = await VirtualTestEditor
						.create( {
							plugins: [ AlignmentEditing, Paragraph ],
							alignment: {
								options: [
									{ name: 'left', className: 'foo-left' },
									{ name: 'right', className: 'foo-right' },
									{ name: 'center', className: 'foo-center' },
									{ name: 'justify', className: 'foo-justify' }
								]
							}
						} );
					const model = newEditor.model;
					const data = '<p class="foo-left">x</p>';

					newEditor.setData( data );

					expect( getModelData( model ) ).to.equal( '<paragraph>[]x</paragraph>' );

					return newEditor.destroy();
				} );

				it( 'adds a converter to the view pipeline', async () => {
					const newEditor = await VirtualTestEditor
						.create( {
							plugins: [ AlignmentEditing, Paragraph ],
							alignment: {
								options: [
									{ name: 'left', className: 'foo-left' },
									{ name: 'right', className: 'foo-right' },
									{ name: 'center', className: 'foo-center' },
									{ name: 'justify', className: 'foo-justify' }
								]
							}
						} );
					const model = newEditor.model;

					setModelData( model, '<paragraph alignment="center">[]x</paragraph>' );

					expect( newEditor.getData() ).to.equal( '<p class="foo-center">x</p>' );

					newEditor.execute( 'alignment', { value: 'left' } );

					expect( getModelData( model ) ).to.equal( '<paragraph>[]x</paragraph>' );
					expect( newEditor.getData() ).to.equal( '<p>x</p>' );

					return newEditor.destroy();
				} );
			} );
		} );

		describe( 'RTL content', () => {
			it( 'adds converters to the data pipeline', async () => {
				const newEditor = await VirtualTestEditor
					.create( {
						language: {
							content: 'ar'
						},
						plugins: [ AlignmentEditing, Paragraph ]
					} );
				const model = newEditor.model;
				const data = '<p style="text-align:left;">x</p>';

				newEditor.setData( data );

				expect( getModelData( model ) ).to.equal( '<paragraph alignment="left">[]x</paragraph>' );
				expect( newEditor.getData() ).to.equal( '<p style="text-align:left;">x</p>' );

				return newEditor.destroy();
			} );

			it( 'adds a converter to the view pipeline', async () => {
				const newEditor = await VirtualTestEditor
					.create( {
						language: {
							content: 'ar'
						},
						plugins: [ AlignmentEditing, Paragraph ]
					} );
				const model = newEditor.model;

				setModelData( model, '<paragraph alignment="left">[]x</paragraph>' );
				expect( newEditor.getData() ).to.equal( '<p style="text-align:left;">x</p>' );

				return newEditor.destroy();
			} );

			describe( 'className', () => {
				it( 'adds a converter to the view pipeline', async () => {
					const newEditor = await VirtualTestEditor
						.create( {
							language: {
								content: 'ar'
							},
							plugins: [ AlignmentEditing, Paragraph ],
							alignment: {
								options: [
									{ name: 'left', className: 'foo-left' },
									{ name: 'right', className: 'foo-right' },
									{ name: 'center', className: 'foo-center' },
									{ name: 'justify', className: 'foo-justify' }
								]
							}
						} );
					const model = newEditor.model;

					setModelData( model, '<paragraph>[]x</paragraph>' );

					newEditor.execute( 'alignment', { value: 'left' } );

					expect( getModelData( model ) ).to.equal( '<paragraph alignment="left">[]x</paragraph>' );
					expect( newEditor.getData() ).to.equal( '<p class="foo-left">x</p>' );

					return newEditor.destroy();
				} );

				it( 'adds converters to the data pipeline', async () => {
					const newEditor = await VirtualTestEditor
						.create( {
							language: {
								content: 'ar'
							},
							plugins: [ AlignmentEditing, Paragraph ],
							alignment: {
								options: [
									{ name: 'left', className: 'foo-left' },
									{ name: 'right', className: 'foo-right' },
									{ name: 'center', className: 'foo-center' },
									{ name: 'justify', className: 'foo-justify' }
								]
							}
						} );
					const model = newEditor.model;
					const data = '<p style="text-align:left;">x</p>';

					newEditor.setData( data );

					expect( getModelData( model ) ).to.equal( '<paragraph alignment="left">[]x</paragraph>' );

					return newEditor.destroy();
				} );
			} );
		} );

		it( 'adds a converter to the view pipeline for removing attribute', () => {
			setModelData( model, '<paragraph alignment="center">[]x</paragraph>' );

			expect( editor.getData() ).to.equal( '<p style="text-align:center;">x</p>' );

			editor.execute( 'alignment' );

			expect( editor.getData() ).to.equal( '<p>x</p>' );
		} );
	} );

	describe( 'center alignment', () => {
		it( 'adds converters to the data pipeline', () => {
			const data = '<p style="text-align:center;">x</p>';

			editor.setData( data );

			expect( getModelData( model ) ).to.equal( '<paragraph alignment="center">[]x</paragraph>' );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'adds a converter to the view pipeline', () => {
			setModelData( model, '<paragraph alignment="center">[]x</paragraph>' );

			expect( editor.getData() ).to.equal( '<p style="text-align:center;">x</p>' );
		} );

		it( 'adds a converter to the view pipeline for changing attribute', () => {
			setModelData( model, '<paragraph alignment="right">[]x</paragraph>' );

			expect( editor.getData() ).to.equal( '<p style="text-align:right;">x</p>' );

			editor.execute( 'alignment', { value: 'center' } );

			expect( editor.getData() ).to.equal( '<p style="text-align:center;">x</p>' );
		} );

		describe( 'className', () => {
			it( 'adds a converter to the view pipeline', async () => {
				const newEditor = await VirtualTestEditor
					.create( {
						plugins: [ AlignmentEditing, Paragraph ],
						alignment: {
							options: [
								{ name: 'left', className: 'foo-left' },
								{ name: 'right', className: 'foo-right' },
								{ name: 'center', className: 'foo-center' },
								{ name: 'justify', className: 'foo-justify' }
							]
						}
					} );
				const model = newEditor.model;

				setModelData( model, '<paragraph>[]x</paragraph>' );

				newEditor.execute( 'alignment', { value: 'center' } );

				expect( getModelData( model ) ).to.equal( '<paragraph alignment="center">[]x</paragraph>' );
				expect( newEditor.getData() ).to.equal( '<p class="foo-center">x</p>' );

				return newEditor.destroy();
			} );

			it( 'adds converters to the data pipeline', async () => {
				const newEditor = await VirtualTestEditor
					.create( {
						plugins: [ AlignmentEditing, Paragraph ],
						alignment: {
							options: [
								{ name: 'left', className: 'foo-left' },
								{ name: 'right', className: 'foo-right' },
								{ name: 'center', className: 'foo-center' },
								{ name: 'justify', className: 'foo-justify' }
							]
						}
					} );
				const model = newEditor.model;
				const data = '<p class="foo-center">x</p>';

				newEditor.setData( data );

				expect( getModelData( model ) ).to.equal( '<paragraph alignment="center">[]x</paragraph>' );

				return newEditor.destroy();
			} );
		} );
	} );

	describe( 'right alignment', () => {
		describe( 'LTR content', () => {
			it( 'adds converters to the data pipeline', () => {
				const data = '<p style="text-align:right;">x</p>';

				editor.setData( data );

				expect( getModelData( model ) ).to.equal( '<paragraph alignment="right">[]x</paragraph>' );
				expect( editor.getData() ).to.equal( data );
			} );

			it( 'adds a converter to the view pipeline', () => {
				setModelData( model, '<paragraph alignment="right">[]x</paragraph>' );

				expect( editor.getData() ).to.equal( '<p style="text-align:right;">x</p>' );
			} );

			describe( 'className', () => {
				it( 'adds a converter to the view pipeline', async () => {
					const newEditor = await VirtualTestEditor
						.create( {
							plugins: [ AlignmentEditing, Paragraph ],
							alignment: {
								options: [
									{ name: 'left', className: 'foo-left' },
									{ name: 'right', className: 'foo-right' },
									{ name: 'center', className: 'foo-center' },
									{ name: 'justify', className: 'foo-justify' }
								]
							}
						} );
					const model = newEditor.model;

					setModelData( model, '<paragraph>[]x</paragraph>' );

					newEditor.execute( 'alignment', { value: 'right' } );

					expect( getModelData( model ) ).to.equal( '<paragraph alignment="right">[]x</paragraph>' );
					expect( newEditor.getData() ).to.equal( '<p class="foo-right">x</p>' );

					return newEditor.destroy();
				} );

				it( 'adds converters to the data pipeline', async () => {
					const newEditor = await VirtualTestEditor
						.create( {
							plugins: [ AlignmentEditing, Paragraph ],
							alignment: {
								options: [
									{ name: 'left', className: 'foo-left' },
									{ name: 'right', className: 'foo-right' },
									{ name: 'center', className: 'foo-center' },
									{ name: 'justify', className: 'foo-justify' }
								]
							}
						} );
					const model = newEditor.model;
					const data = '<p class="foo-right">x</p>';

					newEditor.setData( data );

					expect( getModelData( model ) ).to.equal( '<paragraph alignment="right">[]x</paragraph>' );

					return newEditor.destroy();
				} );
			} );
		} );

		describe( 'RTL content', () => {
			it( 'adds converters to the data pipeline', async () => {
				const newEditor = await VirtualTestEditor
					.create( {
						language: {
							content: 'ar'
						},
						plugins: [ AlignmentEditing, Paragraph ]
					} );
				const model = newEditor.model;
				const data = '<p style="text-align:right;">x</p>';

				newEditor.setData( data );

				expect( getModelData( model ) ).to.equal( '<paragraph>[]x</paragraph>' );
				expect( newEditor.getData() ).to.equal( '<p>x</p>' );

				return newEditor.destroy();
			} );

			it( 'adds a converter to the view pipeline', async () => {
				const newEditor = await VirtualTestEditor
					.create( {
						language: {
							content: 'ar'
						},
						plugins: [ AlignmentEditing, Paragraph ]
					} );
				const model = newEditor.model;

				setModelData( model, '<paragraph alignment="right">[]x</paragraph>' );
				expect( newEditor.getData() ).to.equal( '<p>x</p>' );

				return newEditor.destroy();
			} );

			describe( 'className', () => {
				it( 'adds a converter to the view pipeline', async () => {
					const newEditor = await VirtualTestEditor
						.create( {
							language: {
								content: 'ar'
							},
							plugins: [ AlignmentEditing, Paragraph ],
							alignment: {
								options: [
									{ name: 'left', className: 'foo-left' },
									{ name: 'right', className: 'foo-right' },
									{ name: 'center', className: 'foo-center' },
									{ name: 'justify', className: 'foo-justify' }
								]
							}
						} );
					const model = newEditor.model;

					setModelData( model, '<paragraph>[]x</paragraph>' );

					newEditor.execute( 'alignment', { value: 'right' } );

					expect( getModelData( model ) ).to.equal( '<paragraph>[]x</paragraph>' );
					expect( newEditor.getData() ).to.equal( '<p>x</p>' );

					return newEditor.destroy();
				} );

				it( 'adds converters to the data pipeline', async () => {
					const newEditor = await VirtualTestEditor
						.create( {
							language: {
								content: 'ar'
							},
							plugins: [ AlignmentEditing, Paragraph ],
							alignment: {
								options: [
									{ name: 'left', className: 'foo-left' },
									{ name: 'right', className: 'foo-right' },
									{ name: 'center', className: 'foo-center' },
									{ name: 'justify', className: 'foo-justify' }
								]
							}
						} );
					const model = newEditor.model;
					const data = '<p class="foo-right">x</p>';

					newEditor.setData( data );

					expect( getModelData( model ) ).to.equal( '<paragraph>[]x</paragraph>' );

					return newEditor.destroy();
				} );
			} );
		} );
	} );

	describe( 'justify alignment', () => {
		it( 'adds converters to the data pipeline', () => {
			const data = '<p style="text-align:justify;">x</p>';

			editor.setData( data );

			expect( getModelData( model ) ).to.equal( '<paragraph alignment="justify">[]x</paragraph>' );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'adds a converter to the view pipeline', () => {
			setModelData( model, '<paragraph alignment="justify">[]x</paragraph>' );

			expect( editor.getData() ).to.equal( '<p style="text-align:justify;">x</p>' );
		} );

		describe( 'className', () => {
			it( 'adds a converter to the view pipeline', async () => {
				const newEditor = await VirtualTestEditor
					.create( {
						plugins: [ AlignmentEditing, Paragraph ],
						alignment: {
							options: [
								{ name: 'left', className: 'foo-left' },
								{ name: 'right', className: 'foo-right' },
								{ name: 'center', className: 'foo-center' },
								{ name: 'justify', className: 'foo-justify' }
							]
						}
					} );
				const model = newEditor.model;

				setModelData( model, '<paragraph>[]x</paragraph>' );

				newEditor.execute( 'alignment', { value: 'justify' } );

				expect( getModelData( model ) ).to.equal( '<paragraph alignment="justify">[]x</paragraph>' );
				expect( newEditor.getData() ).to.equal( '<p class="foo-justify">x</p>' );

				return newEditor.destroy();
			} );

			it( 'adds converters to the data pipeline', async () => {
				const newEditor = await VirtualTestEditor
					.create( {
						plugins: [ AlignmentEditing, Paragraph ],
						alignment: {
							options: [
								{ name: 'left', className: 'foo-left' },
								{ name: 'right', className: 'foo-right' },
								{ name: 'center', className: 'foo-center' },
								{ name: 'justify', className: 'foo-justify' }
							]
						}
					} );
				const model = newEditor.model;
				const data = '<p class="foo-justify">x</p>';

				newEditor.setData( data );

				expect( getModelData( model ) ).to.equal( '<paragraph alignment="justify">[]x</paragraph>' );

				return newEditor.destroy();
			} );
		} );
	} );

	describe( 'deprecated `align` attribute', () => {
		it( 'should support allowed `align` values in LTR content', () => {
			const data = '<p align="left">A</p>' +
				'<p align="center">B</p>' +
				'<p align="right">C</p>' +
				'<p align="justify">D</p>';

			editor.setData( data );

			const expectedModelData = '<paragraph>[]A</paragraph>' +
				'<paragraph alignment="center">B</paragraph>' +
				'<paragraph alignment="right">C</paragraph>' +
				'<paragraph alignment="justify">D</paragraph>';

			const expectedData = '<p>A</p>' +
				'<p style="text-align:center;">B</p>' +
				'<p style="text-align:right;">C</p>' +
				'<p style="text-align:justify;">D</p>';

			expect( getModelData( model ) ).to.equal( expectedModelData );
			expect( editor.getData() ).to.equal( expectedData );
		} );

		it( 'should support allowed `align` values in RTL content', async () => {
			const newEditor = await VirtualTestEditor
				.create( {
					language: {
						content: 'ar'
					},
					plugins: [ AlignmentEditing, Paragraph ]
				} );
			const model = newEditor.model;
			const data = '<p align="left">A</p>' +
				'<p align="center">B</p>' +
				'<p align="right">C</p>' +
				'<p align="justify">D</p>';

			newEditor.setData( data );

			const expectedModelData = '<paragraph alignment="left">[]A</paragraph>' +
				'<paragraph alignment="center">B</paragraph>' +
				'<paragraph>C</paragraph>' +
				'<paragraph alignment="justify">D</paragraph>';

			const expectedData = '<p style="text-align:left;">A</p>' +
				'<p style="text-align:center;">B</p>' +
				'<p>C</p>' +
				'<p style="text-align:justify;">D</p>';

			expect( getModelData( model ) ).to.equal( expectedModelData );
			expect( newEditor.getData() ).to.equal( expectedData );

			return newEditor.destroy();
		} );

		it( 'should ignore invalid values', () => {
			const data = '<p align="">A</p>' +
				'<p align="not-valid">B</p>';

			editor.setData( data );

			const expectedModelData = '<paragraph>[]A</paragraph>' +
				'<paragraph>B</paragraph>';

			const expectedData = '<p>A</p>' +
				'<p>B</p>';

			expect( getModelData( model ) ).to.equal( expectedModelData );
			expect( editor.getData() ).to.equal( expectedData );
		} );
	} );

	describe( 'should be extensible', () => {
		it( 'converters in the data pipeline', () => {
			blockDefaultConversion( editor.data.downcastDispatcher );
			blockDefaultConversion( editor.editing.downcastDispatcher );

			const data = '<p style="text-align:justify;">x</p>';

			editor.setData( data );

			expect( getModelData( model ) ).to.equal( '<paragraph alignment="justify">[]x</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>x</p>' );

			editor.execute( 'alignment' );

			expect( editor.getData() ).to.equal( '<p>x</p>' );
		} );
	} );

	describe( 'should work with broken styles', () => {
		it( 'should ignore empty style', () => {
			const data = '<p style="text-align:">x</p>';

			editor.setData( data );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]x</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>x</p>' );
		} );

		it( 'should ignore not known style', () => {
			const data = '<p style="text-align:unset;">x</p>';

			editor.setData( data );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]x</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>x</p>' );
		} );
	} );

	describe( 'config', () => {
		describe( 'options', () => {
			describe( 'default value', () => {
				it( 'should be set', () => {
					expect( editor.config.get( 'alignment.options' ) ).to.deep.equal(
						[
							{ name: 'left' },
							{ name: 'right' },
							{ name: 'center' },
							{ name: 'justify' }
						]
					);
				} );
			} );
		} );
	} );
} );

function blockDefaultConversion( dispatcher ) {
	dispatcher.on( 'attribute:alignment', ( evt, data, conversionApi ) => {
		conversionApi.consumable.consume( data.item, evt.name );
	}, { 'priority': 'high' } );
}
