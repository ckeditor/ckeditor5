/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CommandCollection from '../src/commandcollection';
import Command from '../src/command';
import ModelTestEditor from './_utils/modeltesteditor';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

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

			expect( collection.get( 'foo' ) ).to.equal( command );
		} );
	} );

	describe( 'execute()', () => {
		it( 'executes given method with given attributes', () => {
			const command = new SomeCommand( editor );

			sinon.spy( command, 'execute' );

			collection.add( 'foo', command );

			collection.execute( 'foo', 1, 2 );

			expect( command.execute.calledOnce ).to.be.true;
			expect( command.execute.args[ 0 ] ).to.deep.equal( [ 1, 2 ] );
		} );

		it( 'returns the result of command\'s execute()', () => {
			const command = new SomeCommand( editor );

			const commandResult = { foo: 'bar' };
			sinon.stub( command, 'execute' ).returns( commandResult );

			collection.add( 'foo', command );

			const collectionResult = collection.execute( 'foo' );

			expect( collectionResult, 'collection.execute()' ).to.equal( commandResult );
			expect( collectionResult, 'collection.execute()' ).to.deep.equal( { foo: 'bar' } );
		} );

		it( 'throws an error if command does not exist', () => {
			const command = new SomeCommand( editor );
			collection.add( 'bar', command );

			expectToThrowCKEditorError( () => {
				collection.execute( 'foo' );
			}, /^commandcollection-command-not-found:/, editor );
		} );
	} );

	describe( 'names()', () => {
		it( 'returns iterator', () => {
			const names = collection.names();

			expect( names.next ).to.be.a( 'function' );
		} );

		it( 'returns iterator of command names', () => {
			collection.add( 'foo', new SomeCommand( editor ) );
			collection.add( 'bar', new SomeCommand( editor ) );

			expect( Array.from( collection.names() ) ).to.have.members( [ 'foo', 'bar' ] );
		} );
	} );

	describe( 'commands()', () => {
		it( 'returns iterator', () => {
			const commands = collection.commands();

			expect( commands.next ).to.be.a( 'function' );
		} );

		it( 'returns iterator of commands', () => {
			const c1 = new SomeCommand( editor );
			const c2 = new SomeCommand( editor );

			collection.add( 'foo', c1 );
			collection.add( 'bar', c2 );

			const commandArray = Array.from( collection.commands() );

			expect( commandArray ).to.have.length( 2 );
			expect( commandArray ).to.have.members( [ c1, c2 ] );
		} );
	} );

	describe( 'iterator', () => {
		it( 'exists', () => {
			expect( collection ).to.have.property( Symbol.iterator );
		} );

		it( 'returns iterator of [ name, command ]', () => {
			const c1 = new SomeCommand( editor );
			const c2 = new SomeCommand( editor );

			collection.add( 'foo', c1 );
			collection.add( 'bar', c2 );

			const collectionArray = Array.from( collection );

			expect( collectionArray ).to.have.length( 2 );
			expect( collectionArray.map( pair => pair[ 0 ] ) ).to.have.members( [ 'foo', 'bar' ] );
			expect( collectionArray.map( pair => pair[ 1 ] ) ).to.have.members( [ c1, c2 ] );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy commands', () => {
			const c1 = new SomeCommand( editor );
			const c2 = new SomeCommand( editor );

			sinon.spy( c1, 'destroy' );
			sinon.spy( c2, 'destroy' );

			collection.add( 'foo', c1 );
			collection.add( 'bar', c2 );

			collection.destroy();

			expect( c1.destroy.calledOnce ).to.be.true;
			expect( c2.destroy.calledOnce ).to.be.true;
		} );
	} );
} );
