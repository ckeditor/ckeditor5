/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import AlignmentEditing from '../src/alignmentediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting';
import ListEditing from '@ckeditor/ckeditor5-list/src/listediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import AlignmentCommand from '../src/alignmentcommand';

describe( 'AlignmentEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ AlignmentEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		editor.destroy();
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
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ AlignmentEditing, ImageCaptionEditing, Paragraph, ListEditing, HeadingEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
				} );
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
			expect( model.schema.checkAttribute( [ '$root', 'image', 'caption' ], 'alignment' ) ).to.be.false;
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
		} );

		describe( 'RTL content', () => {
			it( 'adds converters to the data pipeline', () => {
				return VirtualTestEditor
					.create( {
						language: {
							content: 'ar'
						},
						plugins: [ AlignmentEditing, Paragraph ]
					} )
					.then( newEditor => {
						const model = newEditor.model;
						const data = '<p style="text-align:left;">x</p>';

						newEditor.setData( data );

						expect( getModelData( model ) ).to.equal( '<paragraph alignment="left">[]x</paragraph>' );
						expect( newEditor.getData() ).to.equal( '<p style="text-align:left;">x</p>' );

						return newEditor.destroy();
					} );
			} );

			it( 'adds a converter to the view pipeline', () => {
				return VirtualTestEditor
					.create( {
						language: {
							content: 'ar'
						},
						plugins: [ AlignmentEditing, Paragraph ]
					} )
					.then( newEditor => {
						const model = newEditor.model;

						setModelData( model, '<paragraph alignment="left">[]x</paragraph>' );
						expect( newEditor.getData() ).to.equal( '<p style="text-align:left;">x</p>' );

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
		} );

		describe( 'RTL content', () => {
			it( 'adds converters to the data pipeline', () => {
				return VirtualTestEditor
					.create( {
						language: {
							content: 'ar'
						},
						plugins: [ AlignmentEditing, Paragraph ]
					} )
					.then( newEditor => {
						const model = newEditor.model;
						const data = '<p style="text-align:right;">x</p>';

						newEditor.setData( data );

						expect( getModelData( model ) ).to.equal( '<paragraph>[]x</paragraph>' );
						expect( newEditor.getData() ).to.equal( '<p>x</p>' );

						return newEditor.destroy();
					} );
			} );

			it( 'adds a converter to the view pipeline', () => {
				return VirtualTestEditor
					.create( {
						language: {
							content: 'ar'
						},
						plugins: [ AlignmentEditing, Paragraph ]
					} )
					.then( newEditor => {
						const model = newEditor.model;

						setModelData( model, '<paragraph alignment="right">[]x</paragraph>' );
						expect( newEditor.getData() ).to.equal( '<p>x</p>' );

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
					expect( editor.config.get( 'alignment.options' ) ).to.deep.equal( [ 'left', 'right', 'center', 'justify' ] );
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
