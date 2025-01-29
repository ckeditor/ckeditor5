/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import EmojiCommand from '../src/emojicommand.js';

class EmojiPickerFakePlugin {
	static get pluginName() {
		return 'EmojiPicker';
	}

	showUI() {}
}

describe( 'EmojiCommand', () => {
	let editor, command, model;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ EmojiPickerFakePlugin ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new EmojiCommand( editor );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );
				model.schema.register( 'x', {
					inheritAllFrom: '$block',
					disallowChildren: [
						'$text'
					]
				} );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		describe( 'when selection is collapsed', () => {
			it( 'should return true if characters with the attribute can be placed at caret position', () => {
				setData( model, '<p>f[]oo</p>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
				setData( model, '<x>[]</x>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'when selection is not collapsed', () => {
			it( 'should return true if there is at least one node in selection that can have the attribute', () => {
				setData( model, '<p>[foo]</p>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should return false if there are no nodes in selection that can have the attribute', () => {
				setData( model, '[<x></x>]' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( 'execute()', () => {
		let showUIStub;

		beforeEach( () => {
			showUIStub = sinon.stub( editor.plugins.get( 'EmojiPicker' ), 'showUI' );

			setData( model, '<p>[]</p>' );
		} );

		it( 'should open the emoji picker UI when executing a command without a search query', () => {
			command.execute();

			expect( showUIStub.callCount ).to.equal( 1 );
			expect( showUIStub.firstCall.firstArg ).to.equal( '' );
		} );

		it( 'should pass the specified query when executing the command', () => {
			command.execute( 'test query' );

			expect( showUIStub.callCount ).to.equal( 1 );
			expect( showUIStub.firstCall.firstArg ).to.equal( 'test query' );
		} );
	} );
} );
