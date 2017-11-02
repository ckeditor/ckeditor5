/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import AlignmentCommand from '../src/alignmentcommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';

describe( 'AlignmentCommand', () => {
	let editor, doc, command, defaultAlignmentCommand;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				doc = newEditor.document;
				command = new AlignmentCommand( newEditor, 'center' );
				defaultAlignmentCommand = new AlignmentCommand( newEditor, 'left' );
				editor = newEditor;

				editor.commands.add( 'alignCenter', command );
				editor.commands.add( 'alignLeft', defaultAlignmentCommand );

				doc.schema.registerItem( 'paragraph', '$block' );

				doc.schema.allow( { name: '$block', inside: '$root', attributes: 'alignment' } );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'is a command', () => {
		expect( AlignmentCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is true when selection is in block with commend type alignment', () => {
			setModelData( doc, '<paragraph alignment="center">x[]x</paragraph>' );

			expect( command ).to.have.property( 'value', true );
		} );

		it( 'is false when selection is not block that has different alignment', () => {
			setModelData( doc, '<paragraph alignment="justify">x[]x</paragraph>' );

			expect( command ).to.have.property( 'value', false );
		} );

		it( 'is true when selection is in block with default alignment', () => {
			setModelData( doc, '<paragraph>x[]x</paragraph>' );

			expect( defaultAlignmentCommand ).to.have.property( 'value', true );
		} );

		it( 'is false when selection is not block that has different alignment', () => {
			setModelData( doc, '<paragraph alignment="justify">x[]x</paragraph>' );

			expect( defaultAlignmentCommand ).to.have.property( 'value', false );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is in a block which can have added alignment', () => {
			setModelData( doc, '<paragraph>x[]x</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'applying alignment', () => {
			it( 'adds alignment to block element', () => {
				setModelData( doc, '<paragraph>x[]x</paragraph>' );

				editor.execute( 'alignCenter' );

				expect( getModelData( doc ) ).to.equal( '<paragraph alignment="center">x[]x</paragraph>' );
			} );

			it( 'should remove alignment from single block element if already has one', () => {
				setModelData( doc, '<paragraph alignment="center">x[]x</paragraph>' );

				editor.execute( 'alignCenter' );

				expect( getModelData( doc ) ).to.equal( '<paragraph>x[]x</paragraph>' );
			} );

			it( 'adds alignment to all selected blocks', () => {
				setModelData( doc, '<paragraph>x[x</paragraph><paragraph>xx</paragraph><paragraph>x]x</paragraph>' );

				editor.execute( 'alignCenter' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph alignment="center">x[x</paragraph>' +
					'<paragraph alignment="center">xx</paragraph>' +
					'<paragraph alignment="center">x]x</paragraph>'
				);
			} );

			it( 'sets alignment on all selected blocks as first block', () => {
				setModelData(
					doc,
					'<paragraph>x[x</paragraph>' +
					'<paragraph >xx</paragraph>' +
					'<paragraph alignment="center">x]x</paragraph>'
				);

				editor.execute( 'alignCenter' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph alignment="center">x[x</paragraph>' +
					'<paragraph alignment="center">xx</paragraph>' +
					'<paragraph alignment="center">x]x</paragraph>'
				);
			} );
		} );

		describe( 'applying default alignment', () => {
			it( 'removes alignment from block element', () => {
				setModelData( doc, '<paragraph alignment="justify">x[]x</paragraph>' );

				editor.execute( 'alignLeft' );

				expect( getModelData( doc ) ).to.equal( '<paragraph>x[]x</paragraph>' );
			} );

			it( 'removes alignment from all selected blocks', () => {
				setModelData( doc,
					'<paragraph alignment="center">x[x</paragraph>' +
					'<paragraph alignment="center">xx</paragraph>' +
					'<paragraph alignment="center">x]x</paragraph>'
				);

				editor.execute( 'alignLeft' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph>x[x</paragraph><paragraph>xx</paragraph><paragraph>x]x</paragraph>'
				);
			} );

			it( 'removes alignment from all selected blocks even if one has not alignment', () => {
				setModelData( doc,
					'<paragraph alignment="center">x[x</paragraph>' +
					'<paragraph>xx</paragraph>' +
					'<paragraph alignment="center">x]x</paragraph>'
				);

				editor.execute( 'alignLeft' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph>x[x</paragraph><paragraph>xx</paragraph><paragraph>x]x</paragraph>'
				);
			} );
		} );
	} );
} );
