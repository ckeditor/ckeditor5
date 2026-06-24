/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { MultiCommand } from '../src/multicommand.js';
import { Command } from '../src/command.js';

import { ModelTestEditor } from './_utils/modeltesteditor.js';

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
		vi.restoreAllMocks();
		multiCommand.destroy();
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'is always falsy when no child commands are registered', () => {
			expect( multiCommand.isEnabled ).toBeFalsy();

			multiCommand.refresh();

			expect( multiCommand.isEnabled ).toBeFalsy();
		} );

		it( 'is set to true if one of registered commands is true', () => {
			expect( multiCommand.isEnabled ).toBeFalsy();

			const commandA = new Command( editor );
			const commandB = new Command( editor );

			multiCommand.registerChildCommand( commandA );
			multiCommand.registerChildCommand( commandB );

			expect( multiCommand.isEnabled ).toBeFalsy();

			commandA.isEnabled = true;

			expect( multiCommand.isEnabled ).toBe( true );

			commandA.isEnabled = false;

			expect( multiCommand.isEnabled ).toBe( false );

			commandB.isEnabled = true;

			expect( multiCommand.isEnabled ).toBe( true );
		} );
	} );

	describe( 'execute()', () => {
		it( 'does not call any command if all are disabled', () => {
			const commandA = new Command( editor );
			const commandB = new Command( editor );

			multiCommand.registerChildCommand( commandA );
			multiCommand.registerChildCommand( commandB );

			const spyA = vi.spyOn( commandA, 'execute' );
			const spyB = vi.spyOn( commandB, 'execute' );

			multiCommand.execute();

			expect( spyA ).not.toHaveBeenCalled();
			expect( spyB ).not.toHaveBeenCalled();
		} );

		it( 'executes enabled command', () => {
			const commandA = new Command( editor );
			const commandB = new Command( editor );
			const commandC = new Command( editor );

			multiCommand.registerChildCommand( commandA );
			multiCommand.registerChildCommand( commandB );
			multiCommand.registerChildCommand( commandC );

			const spyA = vi.spyOn( commandA, 'execute' );
			const spyB = vi.spyOn( commandB, 'execute' );
			const spyC = vi.spyOn( commandC, 'execute' );

			commandC.isEnabled = true;

			multiCommand.execute();

			expect( spyA ).not.toHaveBeenCalled();
			expect( spyB ).not.toHaveBeenCalled();
			expect( spyC ).toHaveBeenCalledOnce();
		} );

		it( 'returns the result of command\'s execute()', () => {
			const command = new Command( editor );
			const commandResult = { foo: 'bar' };
			vi.spyOn( command, 'execute' ).mockReturnValue( commandResult );

			multiCommand.registerChildCommand( command );

			command.isEnabled = true;

			const multiCommandResult = multiCommand.execute();

			expect( multiCommandResult, 'multiCommand.execute()' ).toBe( commandResult );
			expect( multiCommandResult, 'multiCommand.execute()' ).toEqual( { foo: 'bar' } );
		} );

		it( 'executes first registered command if many are enabled', () => {
			const commandA = new Command( editor );
			const commandB = new Command( editor );
			const commandC = new Command( editor );

			multiCommand.registerChildCommand( commandA );
			multiCommand.registerChildCommand( commandB );
			multiCommand.registerChildCommand( commandC );

			const spyA = vi.spyOn( commandA, 'execute' );
			const spyB = vi.spyOn( commandB, 'execute' );
			const spyC = vi.spyOn( commandC, 'execute' );

			commandC.isEnabled = true;
			commandB.isEnabled = true;

			multiCommand.execute();

			expect( spyA ).not.toHaveBeenCalled();
			expect( spyB ).toHaveBeenCalledOnce();
			expect( spyC ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'support for command\'s priority', () => {
		it( 'should execute command with higher priority', () => {
			const commandA = new Command( editor );
			const commandB = new Command( editor );

			multiCommand.registerChildCommand( commandB, { priority: 'high' } );
			multiCommand.registerChildCommand( commandA, { priority: 'low' } );

			const spyA = vi.spyOn( commandA, 'execute' );
			const spyB = vi.spyOn( commandB, 'execute' );

			commandA.isEnabled = true;
			commandB.isEnabled = true;

			multiCommand.execute();

			expect( spyA ).not.toHaveBeenCalled();
			expect( spyB ).toHaveBeenCalledOnce();
		} );

		it( 'should execute command with higher priority even if it was registered after command with lower priority', () => {
			const commandA = new Command( editor );
			const commandB = new Command( editor );

			multiCommand.registerChildCommand( commandA, { priority: 'low' } );
			multiCommand.registerChildCommand( commandB, { priority: 'high' } );

			const spyA = vi.spyOn( commandA, 'execute' );
			const spyB = vi.spyOn( commandB, 'execute' );

			commandA.isEnabled = true;
			commandB.isEnabled = true;

			multiCommand.execute();

			expect( spyA ).not.toHaveBeenCalled();
			expect( spyB ).toHaveBeenCalledOnce();
		} );

		it( 'should execute first registered command if all have the same priority', () => {
			const commandA = new Command( editor );
			const commandB = new Command( editor );
			const commandC = new Command( editor );

			multiCommand.registerChildCommand( commandA, { priority: 'normal' } );
			multiCommand.registerChildCommand( commandB, { priority: 'normal' } );
			multiCommand.registerChildCommand( commandC, { priority: 'normal' } );

			const spyA = vi.spyOn( commandA, 'execute' );
			const spyB = vi.spyOn( commandB, 'execute' );
			const spyC = vi.spyOn( commandC, 'execute' );

			commandA.isEnabled = true;
			commandB.isEnabled = true;
			commandC.isEnabled = true;

			multiCommand.execute();

			expect( spyA ).toHaveBeenCalledOnce();
			expect( spyB ).not.toHaveBeenCalled();
			expect( spyC ).not.toHaveBeenCalled();
		} );

		it( 'should execute command with lower priority if commands with higher priority are disabled', () => {
			const commandA = new Command( editor );
			const commandB = new Command( editor );
			const commandC = new Command( editor );

			multiCommand.registerChildCommand( commandA, { priority: 'low' } );
			multiCommand.registerChildCommand( commandB, { priority: 'high' } );
			multiCommand.registerChildCommand( commandC, { priority: 'highest' } );

			const spyA = vi.spyOn( commandA, 'execute' );
			const spyB = vi.spyOn( commandB, 'execute' );
			const spyC = vi.spyOn( commandC, 'execute' );

			commandA.isEnabled = true;

			multiCommand.execute();

			expect( spyA ).toHaveBeenCalledOnce();
			expect( spyB ).not.toHaveBeenCalled();
			expect( spyC ).not.toHaveBeenCalled();
		} );
	} );
} );
