/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import IndentBlockCommand from '../src/indentblockcommand';

describe( 'IndentBlockCommand', () => {
	let editor, command, model;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				model.schema.register( 'paragraph', {
					inheritAllFrom: '$block',
					allowAttributes: [ 'indent' ]
				} );
				model.schema.register( 'block', { inheritAllFrom: '$block' } );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'indent', () => {
		describe( 'using classes', () => {
			beforeEach( () => {
				command = new IndentBlockCommand( editor, {
					classes: [
						'indent-1',
						'indent-2',
						'indent-3',
						'indent-4'
					],
					direction: 'forward'
				} );
			} );

			describe( 'isEnabled', () => {
				it( 'should be false in block that does not support indent', () => {
					setData( model, '<block>f[]oo</block>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true in non-indented block', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true in indented block and there are still indentation classes', () => {
					setData( model, '<paragraph indent="indent-2">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true in indented block in last indentation class', () => {
					setData( model, '<paragraph indent="indent-4">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.false;
				} );
			} );

			describe( 'execute()', () => {
				it( 'should set first indent class for non-indented block', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph indent="indent-1">f[]oo</paragraph>' );
				} );

				it( 'should set next indent class for indented block', () => {
					setData( model, '<paragraph indent="indent-2">f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph indent="indent-3">f[]oo</paragraph>' );
				} );
			} );
		} );

		describe( 'using offset', () => {
			beforeEach( () => {
				command = new IndentBlockCommand( editor, {
					offset: 50,
					unit: 'px',
					direction: 'forward'
				} );
			} );

			describe( 'isEnabled', () => {
				it( 'should be false in block that does not support indent', () => {
					setData( model, '<block>f[]oo</block>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true in non-indented block', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true in indented block', () => {
					setData( model, '<paragraph indent="50px">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true in indented block with different unit', () => {
					setData( model, '<paragraph indent="2em">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );
			} );

			describe( 'execute()', () => {} );
		} );
	} );

	describe( 'outdent', () => {
		describe( 'using classes', () => {
			beforeEach( () => {
				command = new IndentBlockCommand( editor, {
					classes: [
						'indent-1',
						'indent-2',
						'indent-3',
						'indent-4'
					],
					direction: 'backward'
				} );
			} );

			describe( 'isEnabled', () => {
				it( 'should be false in block that does not support indent', () => {
					setData( model, '<block>f[]oo</block>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false in non-indented block', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true in indented block and there are still indentation classes', () => {
					setData( model, '<paragraph indent="indent-2">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true in indented block in last indentation class', () => {
					setData( model, '<paragraph indent="indent-4">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );
			} );

			describe( 'execute()', () => {
				it( 'should set previous indent class for indented block', () => {
					setData( model, '<paragraph indent="indent-2">f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph indent="indent-1">f[]oo</paragraph>' );
				} );
			} );
		} );

		describe( 'using offset', () => {
			beforeEach( () => {
				command = new IndentBlockCommand( editor, {
					offset: 50,
					unit: 'px',
					direction: 'backward'
				} );
			} );

			describe( 'isEnabled', () => {
				it( 'should be false in block that does not support indent', () => {
					setData( model, '<block>f[]oo</block>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false in non-indented block', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true in indented block', () => {
					setData( model, '<paragraph indent="50px">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true in indented block with different unit', () => {
					setData( model, '<paragraph indent="2em">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );
			} );

			describe( 'execute()', () => {} );
		} );
	} );
} );
