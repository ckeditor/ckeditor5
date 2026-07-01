/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CommandCollection } from '../src/commandcollection.js';
import { Command } from '../src/command.js';
import { ModelTestEditor } from './_utils/modeltesteditor.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

class SomeCommand extends Command {
	execute() {}
}

describe( 'CommandCollection', () => {
	let collection, editor;

	beforeEach( () => {
		collection = new CommandCollection();

		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		collection.destroy();

		return editor.destroy();
	} );

	describe( 'add() and get()', () => {
		it( 'adds and retrieves a command', () => {
			const command = new SomeCommand( editor );

			collection.add( 'foo', command );

			expect( collection.get( 'foo' ) ).toBe( command );
		} );
	} );

	describe( 'execute()', () => {
		it( 'executes given method with given attributes', () => {
			const command = new SomeCommand( editor );

			vi.spyOn( command, 'execute' );

			collection.add( 'foo', command );

			collection.execute( 'foo', 1, 2 );

			expect( command.execute ).toHaveBeenCalledOnce();
			expect( command.execute ).toHaveBeenCalledWith( 1, 2 );
		} );

		it( 'returns the result of command\'s execute()', () => {
			const command = new SomeCommand( editor );

			const commandResult = { foo: 'bar' };
			vi.spyOn( command, 'execute' ).mockReturnValue( commandResult );

			collection.add( 'foo', command );

			const collectionResult = collection.execute( 'foo' );

			expect( collectionResult, 'collection.execute()' ).toBe( commandResult );
			expect( collectionResult, 'collection.execute()' ).toEqual( { foo: 'bar' } );
		} );

		it( 'throws an error if command does not exist', () => {
			const command = new SomeCommand( editor );
			collection.add( 'bar', command );

			expectToThrowCKEditorError( () => {
				collection.execute( 'foo' );
			}, 'commandcollection-command-not-found', editor );
		} );
	} );

	describe( 'names()', () => {
		it( 'returns iterator', () => {
			const names = collection.names();

			expect( typeof names.next ).toBe( 'function' );
		} );

		it( 'returns iterator of command names', () => {
			collection.add( 'foo', new SomeCommand( editor ) );
			collection.add( 'bar', new SomeCommand( editor ) );

			expect( Array.from( collection.names() ) ).toEqual( expect.arrayContaining( [ 'foo', 'bar' ] ) );
		} );
	} );

	describe( 'commands()', () => {
		it( 'returns iterator', () => {
			const commands = collection.commands();

			expect( typeof commands.next ).toBe( 'function' );
		} );

		it( 'returns iterator of commands', () => {
			const c1 = new SomeCommand( editor );
			const c2 = new SomeCommand( editor );

			collection.add( 'foo', c1 );
			collection.add( 'bar', c2 );

			const commandArray = Array.from( collection.commands() );

			expect( commandArray ).toHaveLength( 2 );
			expect( commandArray ).toEqual( expect.arrayContaining( [ c1, c2 ] ) );
		} );
	} );

	describe( 'iterator', () => {
		it( 'exists', () => {
			expect( collection[ Symbol.iterator ] ).toBeDefined();
		} );

		it( 'returns iterator of [ name, command ]', () => {
			const c1 = new SomeCommand( editor );
			const c2 = new SomeCommand( editor );

			collection.add( 'foo', c1 );
			collection.add( 'bar', c2 );

			const collectionArray = Array.from( collection );

			expect( collectionArray ).toHaveLength( 2 );
			expect( collectionArray.map( pair => pair[ 0 ] ) ).toEqual( expect.arrayContaining( [ 'foo', 'bar' ] ) );
			expect( collectionArray.map( pair => pair[ 1 ] ) ).toEqual( expect.arrayContaining( [ c1, c2 ] ) );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy commands', () => {
			const c1 = new SomeCommand( editor );
			const c2 = new SomeCommand( editor );

			vi.spyOn( c1, 'destroy' );
			vi.spyOn( c2, 'destroy' );

			collection.add( 'foo', c1 );
			collection.add( 'bar', c2 );

			collection.destroy();

			expect( c1.destroy ).toHaveBeenCalledOnce();
			expect( c2.destroy ).toHaveBeenCalledOnce();
		} );
	} );
} );
