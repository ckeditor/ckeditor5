/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Command from './command';

/**
 * @module core/multicommand
 */

/**
 * A CKEditor command that aggregates other commands.
 *
 * This command is used to proxy multiple commands. The multi-command is enabled when
 * at least one of its registered child commands is enabled.
 * When executing a multi-command the first command that is enabled will be executed.
 *
 *		const multiCommand = new MultiCommand( editor );
 *
 *		const commandFoo = new Command( editor );
 *		const commandBar = new Command( editor );
 *
 *		// Register child commands.
 *		multiCommand.registerChildCommand( commandFoo );
 *		multiCommand.registerChildCommand( commandBar );
 *
 *		// Enable one of the commands.
 *		commandBar.isEnabled = true;
 *
 *		multiCommand.execute(); // Will execute commandBar.
 *
 * @extends module:core/command~Command
 */
export default class MultiCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Registered child commands.
		 *
		 * @type {Array.<module:core/command~Command>}
		 * @private
		 */
		this._childCommands = [];
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		// Override base command refresh(): the command's state is changed when one of child commands changes states.
	}

	/**
	 * Executes the first of it registered child commands.
	 *
	 * @returns {*} The value returned by the {@link module:core/command~Command#execute `command.execute()`}.
	 */
	execute( ...args ) {
		const command = this._getFirstEnabledCommand();

		return command.execute( args );
	}

	/**
	 * Registers a child command.
	 *
	 * @param {module:core/command~Command} command
	 */
	registerChildCommand( command ) {
		this._childCommands.push( command );

		// Change multi command enabled state when one of registered commands changes state.
		command.on( 'change:isEnabled', () => this._checkEnabled() );

		this._checkEnabled();
	}

	/**
	 * Checks if any of child commands is enabled.
	 *
	 * @private
	 */
	_checkEnabled() {
		this.isEnabled = !!this._getFirstEnabledCommand();
	}

	/**
	 * Returns a first enabled command or undefined if none of them is enabled.
	 *
	 * @returns {module:core/command~Command|undefined}
	 * @private
	 */
	_getFirstEnabledCommand() {
		return this._childCommands.find( command => command.isEnabled );
	}
}
