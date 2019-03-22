/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import RemoveFormatCommand from '../src/removeformatcommand';

import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'RemoveFormatCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new RemoveFormatCommand( newEditor );
				editor.commands.add( 'removeformat', command );

				model.schema.register( 'p', {
					inheritAllFrom: '$block'
				} );
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'is a command', () => {
		expect( RemoveFormatCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'isEnabled', () => {
		it( 'state when in non-formatting markup', () => {
			setData( model, '<p>fo[]o</p>' );

			expect( command ).to.have.property( 'isEnabled', false );
		} );

		it( 'state with collapsed selection in formatting markup', () => {
			setData( model, '<p>f<$text bold="true">o[]o</$text></p>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'state with selection containing formatting in the middle', () => {
			setData( model, '<p>f[oo <$text bold="true">bar</$text> ba]z</p>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'state with partially selected formatting at the start', () => {
			setData( model, '<p><$text bold="true">b[ar</$text> ba]z</p>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'state with partially selected formatting at the end', () => {
			setData( model, '<p>f[oo <$text bold="true">ba]z</$text></p>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );
} );
