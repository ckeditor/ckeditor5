/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import AlignmentEditing from '../src/alignmentediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import AlignmentCommand from '../src/alignmentcommand';

describe( 'AlignmentEditing', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ AlignmentEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;
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

	it( 'allows for alignment in the $blocks', () => {
		expect( doc.schema.check( { name: '$block', inside: '$root', attributes: 'alignment' } ) ).to.be.true;
	} );

	describe( 'alignLeft', () => {
		it( 'adds converters to the data pipeline', () => {
			const data = '<p style="text-align:left;">x</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph alignment="left">[]x</paragraph>' );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'adds a converter to the view pipeline', () => {
			setModelData( doc, '<paragraph alignment="left">[]x</paragraph>' );

			expect( editor.getData() ).to.equal( '<p style="text-align:left;">x</p>' );
		} );
	} );

	describe( 'should work with broken styles', () => {
		it( 'should ignore empty style', () => {
			const data = '<p style="text-align:">x</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]x</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>x</p>' );
		} );

		it( 'should ignore not known style', () => {
			const data = '<p style="text-align:unset;">x</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]x</paragraph>' );
			expect( editor.getData() ).to.equal( '<p>x</p>' );
		} );
	} );

	describe( 'alignCenter', () => {
		it( 'adds converters to the data pipeline', () => {
			const data = '<p style="text-align:center;">x</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph alignment="center">[]x</paragraph>' );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'adds a converter to the view pipeline', () => {
			setModelData( doc, '<paragraph alignment="center">[]x</paragraph>' );

			expect( editor.getData() ).to.equal( '<p style="text-align:center;">x</p>' );
		} );
	} );

	describe( 'alignRight', () => {
		it( 'adds converters to the data pipeline', () => {
			const data = '<p style="text-align:right;">x</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph alignment="right">[]x</paragraph>' );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'adds a converter to the view pipeline', () => {
			setModelData( doc, '<paragraph alignment="right">[]x</paragraph>' );

			expect( editor.getData() ).to.equal( '<p style="text-align:right;">x</p>' );
		} );
	} );

	describe( 'alignJustify', () => {
		it( 'adds converters to the data pipeline', () => {
			const data = '<p style="text-align:justify;">x</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph alignment="justify">[]x</paragraph>' );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'adds a converter to the view pipeline', () => {
			setModelData( doc, '<paragraph alignment="justify">[]x</paragraph>' );

			expect( editor.getData() ).to.equal( '<p style="text-align:justify;">x</p>' );
		} );
	} );
} );
