/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import AlignmentEditing from '../src/alignmentediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageCaptionEngine from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionengine';
import ListEngine from '@ckeditor/ckeditor5-list/src/listengine';
import HeadingEngine from '@ckeditor/ckeditor5-heading/src/headingengine';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { eventNameToConsumableType } from '@ckeditor/ckeditor5-engine/src/conversion/model-to-view-converters';

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

	it( 'adds alignment commands', () => {
		expect( editor.commands.get( 'alignLeft' ) ).to.be.instanceOf( AlignmentCommand );
		expect( editor.commands.get( 'alignRight' ) ).to.be.instanceOf( AlignmentCommand );
		expect( editor.commands.get( 'alignCenter' ) ).to.be.instanceOf( AlignmentCommand );
		expect( editor.commands.get( 'alignJustify' ) ).to.be.instanceOf( AlignmentCommand );
	} );

	it( 'allows for alignment in $blocks', () => {
		expect( model.schema.check( { name: '$block', inside: '$root', attributes: 'alignment' } ) ).to.be.true;
	} );

	describe( 'integration', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ AlignmentEditing, ImageCaptionEngine, Paragraph, ListEngine, HeadingEngine ]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
				} );
		} );

		it( 'is allowed on paragraph', () => {
			expect( model.schema.check( { name: 'paragraph', attributes: 'alignment' } ) ).to.be.true;
		} );

		it( 'is allowed on listItem', () => {
			expect( model.schema.check( { name: 'listItem', attributes: [ 'type', 'indent', 'alignment' ] } ) ).to.be.true;
		} );

		it( 'is allowed on heading', () => {
			expect( model.schema.check( { name: 'heading1', attributes: 'alignment' } ) ).to.be.true;
		} );

		it( 'is disallowed on caption', () => {
			expect( model.schema.check( { name: 'caption', attributes: 'alignment' } ) ).to.be.false;
		} );
	} );

	describe( 'alignLeft', () => {
		it( 'adds converters to the data pipeline', () => {
			const data = '<p style="text-align:left;">x</p>';

			editor.setData( data );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]x</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>x</p>' );
		} );

		it( 'adds a converter to the view pipeline for removing attribute', () => {
			setModelData( model, '<paragraph alignment="center">[]x</paragraph>' );

			expect( editor.getData() ).to.equal( '<p style="text-align:center;">x</p>' );

			const command = editor.commands.get( 'alignLeft' );

			command.execute();

			expect( editor.getData() ).to.equal( '<p>x</p>' );
		} );
	} );

	describe( 'alignCenter', () => {
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

			const command = editor.commands.get( 'alignCenter' );

			command.execute();

			expect( editor.getData() ).to.equal( '<p style="text-align:center;">x</p>' );
		} );
	} );

	describe( 'alignRight', () => {
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

	describe( 'alignJustify', () => {
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
			blockDefaultConversion( editor.data.modelToView );
			blockDefaultConversion( editor.editing.modelToView );

			const data = '<p style="text-align:justify;">x</p>';

			editor.setData( data );

			expect( getModelData( model ) ).to.equal( '<paragraph alignment="justify">[]x</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>x</p>' );

			const command = editor.commands.get( 'alignLeft' );
			command.execute();

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
		describe( 'styles', () => {
			describe( 'default value', () => {
				it( 'should be set', () => {
					expect( editor.config.get( 'alignment.styles' ) ).to.deep.equal( [ 'left', 'right', 'center', 'justify' ] );
				} );
			} );

			it( 'should customize commands', () => {
				return VirtualTestEditor
					.create( {
						alignment: { styles: [ 'left', 'right' ] },
						plugins: [ AlignmentEditing, Paragraph ]
					} )
					.then( editor => {
						expect( editor.commands.get( 'alignLeft' ), 'adds alignLeft' ).to.be.instanceof( AlignmentCommand );
						expect( editor.commands.get( 'alignRight' ), 'adds alignLeft' ).to.be.instanceof( AlignmentCommand );
						expect( editor.commands.get( 'alignCenter' ), 'does not add alignCenter' ).to.be.undefined;
						expect( editor.commands.get( 'alignJustify' ), 'does not add alignJustify' ).to.be.undefined;
					} );
			} );
		} );
	} );
} );

function blockDefaultConversion( dispatcher ) {
	dispatcher.on( 'attribute:alignment', ( evt, data, consumable ) => {
		consumable.consume( data.item, eventNameToConsumableType( evt.name ) );
	}, { 'priority': 'high' } );
}
