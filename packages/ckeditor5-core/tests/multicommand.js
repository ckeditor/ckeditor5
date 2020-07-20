/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import MultiCommand from '../src/multicommand';
import ModelTestEditor from './_utils/modeltesteditor';
import Command from '../src/command';

describe( 'MultiCommand', () => {
	let editor, multiCommand;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				multiCommand = new MultiCommand( editor );
			} );
	} );

	afterEach( () => {
		multiCommand.destroy();

		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'is always falsy when no child commands are registered', () => {
			expect( multiCommand.isEnabled ).to.false;

			multiCommand.refresh();

			expect( multiCommand.isEnabled ).to.false;
		} );

		it( 'is set to true if one of registered commands is true', () => {
			expect( multiCommand.isEnabled ).to.false;

			const commandA = new Command( editor );
			const commandB = new Command( editor );

			multiCommand.registerChildCommand( commandA );
			multiCommand.registerChildCommand( commandB );

			expect( multiCommand.isEnabled ).to.false;

			commandA.isEnabled = true;

			expect( multiCommand.isEnabled ).to.be.true;

			commandA.isEnabled = false;

			expect( multiCommand.isEnabled ).to.be.false;

			commandB.isEnabled = true;

			expect( multiCommand.isEnabled ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		it( 'does not call any command if all are disabled', () => {
			const commandA = new Command( editor );
			const commandB = new Command( editor );

			multiCommand.registerChildCommand( commandA );
			multiCommand.registerChildCommand( commandB );

			const spyA = sinon.spy( commandA, 'execute' );
			const spyB = sinon.spy( commandB, 'execute' );

			multiCommand.execute();

			sinon.assert.notCalled( spyA );
			sinon.assert.notCalled( spyB );
		} );

		it( 'executes enabled command', () => {
			const commandA = new Command( editor );
			const commandB = new Command( editor );
			const commandC = new Command( editor );

			multiCommand.registerChildCommand( commandA );
			multiCommand.registerChildCommand( commandB );
			multiCommand.registerChildCommand( commandC );

			const spyA = sinon.spy( commandA, 'execute' );
			const spyB = sinon.spy( commandB, 'execute' );
			const spyC = sinon.spy( commandC, 'execute' );

			commandC.isEnabled = true;

			multiCommand.execute();

			sinon.assert.notCalled( spyA );
			sinon.assert.notCalled( spyB );
			sinon.assert.calledOnce( spyC );
		} );

		it( 'returns the result of command\'s execute()', () => {
			const command = new Command( editor );
			const commandResult = { foo: 'bar' };
			sinon.stub( command, 'execute' ).returns( commandResult );

			multiCommand.registerChildCommand( command );

			command.isEnabled = true;

			const multiCommandResult = multiCommand.execute();

			expect( multiCommandResult, 'multiCommand.execute()' ).to.equal( commandResult );
			expect( multiCommandResult, 'multiCommand.execute()' ).to.deep.equal( { foo: 'bar' } );
		} );

		it( 'executes first registered command if many are enabled', () => {
			const commandA = new Command( editor );
			const commandB = new Command( editor );
			const commandC = new Command( editor );

			multiCommand.registerChildCommand( commandA );
			multiCommand.registerChildCommand( commandB );
			multiCommand.registerChildCommand( commandC );

			const spyA = sinon.spy( commandA, 'execute' );
			const spyB = sinon.spy( commandB, 'execute' );
			const spyC = sinon.spy( commandC, 'execute' );

			commandC.isEnabled = true;
			commandB.isEnabled = true;

			multiCommand.execute();

			sinon.assert.notCalled( spyA );
			sinon.assert.calledOnce( spyB );
			sinon.assert.notCalled( spyC );
		} );
	} );
} );
