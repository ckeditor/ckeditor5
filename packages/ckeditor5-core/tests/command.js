/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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

		it( 'sets the affectsData property', () => {
			expect( command ).to.have.property( 'affectsData', true );
		} );

		it( 'adds a listener which refreshes the command on editor.model.Document#event:change', () => {
			sinon.spy( command, 'refresh' );

			editor.model.document.fire( 'change' );

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

		it( 'is falsy when the editor is in read-only mode and command affects data', () => {
			command.affectsData = true;
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

		it( 'doesn\'t depend on the editor read-only mode when command doesn\'t affect data', () => {
			command.affectsData = false;
			editor.isReadOnly = false;
			command.isEnabled = true;

			editor.isReadOnly = true;

			// Is true.
			expect( command.isEnabled ).to.true;

			command.refresh();

			// Still true.
			expect( command.isEnabled ).to.true;

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

		it( 'stops `set` event to force disabled and not affect `change` event', () => {
			const setSpy = sinon.spy();
			const changeSpy = sinon.spy();

			command.isEnabled = true;
			editor.isReadOnly = false;

			command.on( 'set', setSpy );
			command.on( 'change', changeSpy );

			editor.isReadOnly = true;

			sinon.assert.notCalled( setSpy );
			sinon.assert.calledOnce( changeSpy );
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

	describe( 'forceDisabled() / clearForceDisabled()', () => {
		it( 'forceDisabled() should disable the command', () => {
			command.forceDisabled( 'foo' );
			command.isEnabled = true;

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'clearForceDisabled() should enable the command', () => {
			command.forceDisabled( 'foo' );
			command.clearForceDisabled( 'foo' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'clearForceDisabled() used with wrong identifier should not enable the command', () => {
			command.forceDisabled( 'foo' );
			command.clearForceDisabled( 'bar' );
			command.isEnabled = true;

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'using forceDisabled() twice with the same identifier should not have any effect', () => {
			command.forceDisabled( 'foo' );
			command.forceDisabled( 'foo' );
			command.clearForceDisabled( 'foo' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'command is enabled only after all disables were cleared', () => {
			command.forceDisabled( 'foo' );
			command.forceDisabled( 'bar' );
			command.clearForceDisabled( 'foo' );
			command.isEnabled = true;

			expect( command.isEnabled ).to.be.false;

			command.clearForceDisabled( 'bar' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'command should remain disabled if isEnabled has a callback disabling it', () => {
			command.on( 'set:isEnabled', evt => {
				evt.return = false;
				evt.stop();
			} );

			command.forceDisabled( 'foo' );
			command.clearForceDisabled( 'foo' );
			command.isEnabled = true;

			expect( command.isEnabled ).to.be.false;
		} );
	} );
} );
