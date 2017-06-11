/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../src/command';
import ModelTestEditor from './_utils/modeltesteditor';

class SomeCommand extends Command {
	execute() {}

	refresh() {}
}

describe( 'Command', () => {
	let editor, command;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				command = new SomeCommand( editor );
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
			expect( command.value ).to.be.null;
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
	} );

	describe( 'execute()', () => {
		it( 'is decorated', () => {
			const spy = sinon.spy();

			command.on( 'execute', spy );

			command.execute( 1, 2 );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( [ 1, 2 ] );
		} );
	} );
} );
