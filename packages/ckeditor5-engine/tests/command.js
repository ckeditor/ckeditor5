/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/core/editor.js';
import Command from '/ckeditor5/core/command.js';

let element, editor, command;

class CommandWithSchema extends Command {
	constructor( editor, schemaValid ) {
		super( editor );

		this.schemaValid = schemaValid;
	}

	checkSchema() {
		return this.schemaValid;
	}
}

beforeEach( () => {
	element = document.createElement( 'div' );
	document.body.appendChild( element );

	editor = new Editor( element );
	command = new Command( editor );
} );

describe( 'constructor', () => {
	it( 'should create a new command instance, that is enabled and bound to given editor', () => {
		expect( command ).to.have.property( 'editor' ).equal( editor );
		expect( command.isEnabled ).to.be.true;
	} );

	it( 'Command should have execute method', () => {
		expect( command ).to.have.property( 'execute' );

		expect( () => {
			command.execute();
		} ).not.to.throw;
	} );

	it( 'should add listener to its checkEnabled event if checkSchema method is present', () => {
		expect( command.checkSchema ).to.be.undefined;

		command.checkSchema = sinon.spy();
		command.checkEnabled();

		expect( command.checkSchema.called ).to.be.false;

		let newCommand = new CommandWithSchema( editor, true );
		sinon.spy( newCommand, 'checkSchema' );

		newCommand.checkEnabled();

		expect( newCommand.checkSchema.calledOnce ).to.be.true;
	} );
} );

describe( 'checkEnabled', () => {
	it( 'should fire checkEnabled event', () => {
		let spy = sinon.spy();

		command.on( 'checkEnabled', spy );
		command.checkEnabled();

		expect( spy.called ).to.be.true;
	} );

	it( 'should set isEnabled property to the value returned by last event callback', () => {
		command.on( 'checkEnabled', () => {
			return true;
		} );

		command.on( 'checkEnabled', ( evt ) => {
			evt.stop();

			return false;
		} );

		command.on( 'checkEnabled', () => {
			return true;
		} );

		command.checkEnabled();

		expect( command.isEnabled ).to.be.false;
	} );

	it( 'should set isEnabled to false if checkSchema returns false', () => {
		let disabledCommand = new CommandWithSchema( editor, false );

		disabledCommand.checkEnabled();

		expect( disabledCommand.isEnabled ).to.be.false;
	} );
} );

describe( 'disable', () => {
	it( 'should make command disabled', () => {
		command._disable();

		expect( command.isEnabled ).to.be.false;
	} );

	it( 'should not make command disabled if there is a high-priority listener forcing command to be enabled', () => {
		command.on( 'checkEnabled', ( evt ) => {
			evt.stop();

			return true;
		}, command, 1 );

		command._disable();

		expect( command.isEnabled ).to.be.true;
	} );
} );

describe( 'enable', () => {
	it( 'should make command enabled if it was previously disabled by disable()', () => {
		command._disable();
		command._enable();

		expect( command.isEnabled ).to.be.true;
	} );

	it( 'should not make command enabled if there are other listeners disabling it', () => {
		command._disable();

		command.on( 'checkEnabled', ( evt ) => {
			evt.stop();

			return false;
		} );

		command.checkEnabled();
		command._enable();

		expect( command.isEnabled ).to.be.false;
	} );
} );
