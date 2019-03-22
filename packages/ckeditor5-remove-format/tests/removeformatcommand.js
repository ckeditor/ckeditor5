/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import RemoveFormatCommand from '../src/removeformatcommand';

import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import {
	getData,
	setData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

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
		const expectEnabledPropertyToBe = expectedValue => expect( command ).to.have.property( 'isEnabled', expectedValue );
		const cases = {
			'state when in non-formatting markup': {
				input: '<p>fo[]o</p>',
				assert: () => expectEnabledPropertyToBe( false )
			},

			'state with collapsed selection in formatting markup': {
				input: '<p>f<$text bold="true">o[]o</$text></p>',
				assert: () => expectEnabledPropertyToBe( true )
			},

			'state with selection containing formatting in the middle': {
				input: '<p>f[oo <$text bold="true">bar</$text> ba]z</p>',
				assert: () => expectEnabledPropertyToBe( true )
			},

			'state with partially selected formatting at the start': {
				input: '<p><$text bold="true">b[ar</$text> ba]z</p>',
				assert: () => expectEnabledPropertyToBe( true )
			},

			'state with partially selected formatting at the end': {
				input: '<p>f[oo <$text bold="true">ba]z</$text></p>',
				assert: () => expectEnabledPropertyToBe( true )
			},

			'state with formatted selection alone': {
				input: '<p>fo[]o</p>',
				setDataOptions: {
					selectionAttributes: {
						bold: true
					}
				},
				assert: () => expectEnabledPropertyToBe( true )
			}
		};

		for ( const [ key, testConfig ] of Object.entries( cases ) ) {
			it( key, () => {
				setData( model, testConfig.input, testConfig.setDataOptions );

				testConfig.assert();
			} );
		}
	} );

	describe( 'execute()', () => {
		const cases = {
			'state when in non-formatting markup': {
				input: '<p>fo[]o</p>',
				assert: '<p>fo[]o</p>'
			},

			'state with collapsed selection in formatting markup': {
				input: '<p>f<$text bold="true">o[]o</$text></p>',
				assert: '<p>f<$text bold="true">o[]o</$text></p>'
			},

			'state with selection containing formatting in the middle': {
				input: '<p>f[oo <$text bold="true">bar</$text> ba]z</p>',
				assert: '<p>f[oo bar ba]z</p>'
			},

			'state with partially selected formatting at the start': {
				input: '<p><$text bold="true">b[ar</$text> ba]z</p>',
				assert: '<p><$text bold="true">b</$text>[ar ba]z</p>',
			},

			'state with partially selected formatting at the end': {
				input: '<p>f[oo <$text bold="true">ba]z</$text></p>',
				assert: '<p>f[oo ba]<$text bold="true">z</$text></p>'
			},

			'state with formatted selection alone': {
				input: '<p>fo[]o</p>',
				setDataOptions: {
					selectionAttributes: {
						bold: true
					}
				},
				assert: () => {
					expect( model.document.selection.hasAttribute( 'bold' ) ).to.equal( false );
				}
			}
		};

		for ( const [ key, testConfig ] of Object.entries( cases ) ) {
			it( key, () => {
				setData( model, testConfig.input, testConfig.setDataOptions );

				command.execute();

				if ( typeof testConfig.assert == 'string' ) {
					expect( getData( model ) ).to.equal( testConfig.assert );
				} else {
					testConfig.assert();
				}
			} );
		}
	} );
} );
