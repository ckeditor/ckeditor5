/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from '../src/command.js';
import { ModelTestEditor } from './_utils/modeltesteditor.js';

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
		vi.restoreAllMocks();
		command.destroy();

		return editor.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'sets the editor property', () => {
			expect( command.editor ).toBe( editor );
		} );

		it( 'sets the state properties', () => {
			expect( command.value ).toBeUndefined();
			expect( command.isEnabled ).toBe( false );
		} );

		it( 'sets the affectsData property', () => {
			expect( command ).toHaveProperty( 'affectsData', true );
		} );

		it( 'adds a listener which refreshes the command on editor.model.Document#event:change', () => {
			const spy = vi.spyOn( command, 'refresh' );

			editor.model.document.fire( 'change' );

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'value', () => {
		it( 'fires change event', () => {
			const spy = vi.fn();

			command.on( 'change:value', spy );

			command.value = 1;

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'fires change event', () => {
			const spy = vi.fn();

			command.on( 'change:isEnabled', spy );

			command.isEnabled = true;

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'is false when the editor is in read-only mode and command affects data', () => {
			command.affectsData = true;
			command.isEnabled = true;

			editor.enableReadOnlyMode( 'unit-test' );

			// Is false.
			expect( command.isEnabled ).toBe( false );

			command.refresh();

			// Still false.
			expect( command.isEnabled ).toBe( false );

			editor.disableReadOnlyMode( 'unit-test' );

			// And is back to true.
			expect( command.isEnabled ).toBe( true );
		} );

		it( 'doesn\'t depend on the editor read-only mode when command doesn\'t affect data', () => {
			command.affectsData = false;
			command.isEnabled = true;

			editor.enableReadOnlyMode( 'unit-test' );

			// Is true.
			expect( command.isEnabled ).toBe( true );

			command.refresh();

			// Still true.
			expect( command.isEnabled ).toBe( true );

			editor.disableReadOnlyMode( 'unit-test' );

			// And is back to true.
			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should disable command when selection is in non-editable place and `isEnabled` bases on selection', () => {
			command.isEnabled = true;
			command.affectsData = true;
			command._isEnabledBasedOnSelection = true;

			editor.model.document.isReadOnly = true;
			command.refresh();

			expect( command.isEnabled ).toBe( false );
		} );

		it( 'should not disable command when selection is in non-editable place and `isEnabled` bases on selection', () => {
			command.isEnabled = true;
			command.affectsData = true;
			command._isEnabledBasedOnSelection = false;

			editor.model.document.isReadOnly = true;
			command.refresh();

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should disable command if the selection is in graveyard and and `isEnabled` bases on selection', () => {
			command.isEnabled = true;
			command.affectsData = true;
			command._isEnabledBasedOnSelection = true;

			editor.model.change( writer => {
				writer.detachRoot( 'main' );
			} );

			expect( command.isEnabled ).toBe( false );
		} );

		it( 'should not disable command if the selection is in graveyard and and `isEnabled` bases on selection', () => {
			command.isEnabled = true;
			command.affectsData = true;
			command._isEnabledBasedOnSelection = false;

			editor.model.change( writer => {
				writer.detachRoot( 'main' );
			} );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'is observable when is overridden', () => {
			command.isEnabled = true;

			editor.bind( 'something' ).to( command, 'isEnabled' );

			expect( editor.something ).toBe( true );

			editor.enableReadOnlyMode( 'unit-test' );

			expect( editor.something ).toBe( false );
		} );

		it( 'stops `set` event to force disabled and not affect `change` event', () => {
			const setSpy = vi.fn();
			const changeSpy = vi.fn();

			command.isEnabled = true;

			command.on( 'set', setSpy );
			command.on( 'change', changeSpy );

			editor.enableReadOnlyMode( 'unit-test' );

			expect( setSpy ).not.toHaveBeenCalled();
			expect( changeSpy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'execute()', () => {
		it( 'is decorated', () => {
			const spy = vi.fn();

			command.on( 'execute', spy );

			command.isEnabled = true;

			command.execute( 1, 2 );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( [ 1, 2 ] );
		} );

		it( 'is automatically blocked (with low priority listener) if command is disabled', () => {
			const spyExecute = vi.fn();
			const spyHighest = vi.fn();
			const spyHigh = vi.fn();

			class SpyCommand extends Command {
				execute() {
					spyExecute();
				}
			}

			const command = new SpyCommand( editor );

			command.on( 'execute', spyHighest, { priority: 'highest' } );
			command.on( 'execute', spyHigh, { priority: 'high' } );

			command.execute();

			expect( spyExecute ).not.toHaveBeenCalled();
			expect( spyHighest ).toHaveBeenCalledOnce();
			expect( spyHigh ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'refresh()', () => {
		it( 'sets isEnabled to true', () => {
			command.refresh();

			expect( command.isEnabled ).toBe( true );
		} );

		// This is an acceptance test for the ability to override a command's state from outside
		// in a way that at any moment the action can be reverted by just offing the listener and
		// refreshing the command once again.
		it( 'is safely overridable using change:isEnabled', () => {
			command.on( 'change:isEnabled', callback, { priority: 'high' } );
			command.isEnabled = false;
			command.refresh();

			expect( command.isEnabled ).toBe( false );

			command.off( 'change:isEnabled', callback );
			command.refresh();

			expect( command.isEnabled ).toBe( true );

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

			expect( command.isEnabled ).toBe( false );
		} );

		it( 'clearForceDisabled() should enable the command', () => {
			command.forceDisabled( 'foo' );
			command.clearForceDisabled( 'foo' );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'clearForceDisabled() used with wrong identifier should not enable the command', () => {
			command.forceDisabled( 'foo' );
			command.clearForceDisabled( 'bar' );
			command.isEnabled = true;

			expect( command.isEnabled ).toBe( false );
		} );

		it( 'using forceDisabled() twice with the same identifier should not have any effect', () => {
			command.forceDisabled( 'foo' );
			command.forceDisabled( 'foo' );
			command.clearForceDisabled( 'foo' );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'command is enabled only after all disables were cleared', () => {
			command.forceDisabled( 'foo' );
			command.forceDisabled( 'bar' );
			command.clearForceDisabled( 'foo' );
			command.isEnabled = true;

			expect( command.isEnabled ).toBe( false );

			command.clearForceDisabled( 'bar' );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'command should remain disabled if isEnabled has a callback disabling it', () => {
			command.on( 'set:isEnabled', evt => {
				evt.return = false;
				evt.stop();
			} );

			command.forceDisabled( 'foo' );
			command.clearForceDisabled( 'foo' );
			command.isEnabled = true;

			expect( command.isEnabled ).toBe( false );
		} );
	} );
} );
