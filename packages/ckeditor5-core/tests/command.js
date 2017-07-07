/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../src/command';
import ModelTestEditor from './_utils/modeltesteditor';

describe( 'Command', () => {
	let editor, command;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				command = new Command( editor );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'sets the editor property', () => {
			expect( command.editor ).to.equal( editor );
		} );

		it( 'sets the state properties', () => {
			expect( command.value ).to.be.undefined;
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'adds a listener which refreshed the command on editor.document#changesDone', () => {
			sinon.spy( command, 'refresh' );

			editor.document.fire( 'changesDone' );

			expect( command.refresh.calledOnce ).to.be.true;
		} );
	} );

	describe( 'value', () => {
		it( 'fires change event', () => {
			const spy = sinon.spy();

			command.on( 'change:value', spy );

			command.value = 1;

			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'fires change event', () => {
			const spy = sinon.spy();

			command.on( 'change:isEnabled', spy );

			command.isEnabled = true;

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'is always falsy when the editor is in read-only mode', () => {
			editor.isReadOnly = false;
			command.isEnabled = true;

			editor.isReadOnly = true;

			// Is false.
			expect( command.isEnabled ).to.false;

			command.refresh();

			// Still false.
			expect( command.isEnabled ).to.false;

			editor.isReadOnly = false;

			// And is back to true.
			expect( command.isEnabled ).to.true;
		} );

		it( 'is observable when is overridden', () => {
			editor.isReadOnly = false;
			command.isEnabled = true;

			editor.bind( 'something' ).to( command, 'isEnabled' );

			expect( editor.something ).to.true;

			editor.isReadOnly = true;

			expect( editor.something ).to.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'is decorated', () => {
			const spy = sinon.spy();

			command.on( 'execute', spy );

			command.isEnabled = true;

			command.execute( 1, 2 );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( [ 1, 2 ] );
		} );

		it( 'is automatically blocked (with low priority listener) if command is disabled', () => {
			const spyExecute = sinon.spy();
			const spyHighest = sinon.spy();
			const spyHigh = sinon.spy();

			class SpyCommand extends Command {
				execute() {
					spyExecute();
				}
			}

			const command = new SpyCommand( editor );

			command.on( 'execute', spyHighest, { priority: 'highest' } );
			command.on( 'execute', spyHigh, { priority: 'high' } );

			command.execute();

			expect( spyExecute.called ).to.be.false;
			expect( spyHighest.calledOnce ).to.be.true;
			expect( spyHigh.called ).to.be.false;
		} );
	} );

	describe( 'refresh()', () => {
		it( 'sets isEnabled to true', () => {
			command.refresh();

			expect( command.isEnabled ).to.be.true;
		} );

		// This is an acceptance test for the ability to override a command's state from outside
		// in a way that at any moment the action can be reverted by just offing the listener and
		// refreshing the command once again.
		it( 'is safely overridable using change:isEnabled', () => {
			command.on( 'change:isEnabled', callback, { priority: 'high' } );
			command.isEnabled = false;
			command.refresh();

			expect( command.isEnabled ).to.be.false;

			command.off( 'change:isEnabled', callback );
			command.refresh();

			expect( command.isEnabled ).to.be.true;

			function callback( evt ) {
				command.isEnabled = false;

				evt.stop();
			}
		} );
	} );
} );
