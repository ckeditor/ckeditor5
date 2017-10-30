/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import AlignmentEditing from '../src/alignmentediting';
import AlignmentCommand from '../src/alignmentcommand';

import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import Command from '@ckeditor/ckeditor5-core/src/command';

describe( 'AlignmentCommand', () => {
	let editor, doc, command;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ AlignmentEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;

				doc.schema.registerItem( 'paragraph', '$block' );
				doc.schema.registerItem( 'heading', '$block' );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'paragraph' )
					.toElement( 'p' );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'heading' )
					.toElement( 'h' );

				command = editor.commands.get( 'alignLeft' );
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
		it( 'is false when selection is not in aligned block', () => {
			setModelData( doc, '<paragraph>x[]x</paragraph>' );

			expect( command ).to.have.property( 'value', false );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is in a block which can have added alignment', () => {
			setModelData( doc, '<paragraph>x[]x</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'applying right alignment', () => {
			it( 'add alignment to block element', () => {
				setModelData( doc, '<paragraph>x[]x</paragraph>' );

				editor.execute( 'alignRight' );

				expect( getModelData( doc ) ).to.equal(
					'<paragraph alignment="right">x[]x</paragraph>'
				);

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<p style="text-align:right;">x{}x</p>'
				);
			} );
		} );
	} );
} );
