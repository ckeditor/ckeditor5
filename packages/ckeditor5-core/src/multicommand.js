/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import priorities from '@ckeditor/ckeditor5-utils/src/priorities';

import Command from './command';

/**
 * @module core/multicommand
 */

/**
 * A CKEditor command that aggregates other commands.
 *
 * This command is used to proxy multiple commands. The multi-command is enabled when
 * at least one of its registered child commands is enabled.
 * When executing a multi-command the first enabled command with highest priority will be executed.
 *
 *		const multiCommand = new MultiCommand( editor );
 *
 *		const commandFoo = new Command( editor );
 *		const commandBar = new Command( editor );
 *
 *		// Register child commands.
 *		multiCommand.registerChildCommand( commandFoo, 'low' );
 *		multiCommand.registerChildCommand( commandBar, 'high' );
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
		 * Registered child commands definitions.
		 *
		 * @type {Array.<Object>}
		 * @private
		 */
		this._childCommandsDefinitons = [];
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		// Override base command refresh(): the command's state is changed when one of child commands changes states.
	}

	/**
	 * Executes the first enabled command which has the highest priority of all registered child commands.
	 *
	 * @returns {*} The value returned by the {@link module:core/command~Command#execute `command.execute()`}.
	 */
	execute( ...args ) {
		const command = this._getFirstEnabledCommand();

		return !!command && command.execute( args );
	}

	/**
	 * Inserts command definition at correct index by priority so registered commands are always sorted from lowest priority to highest
	 *
	 * @param {Object} newCommandDefinition Object with `command` and `priority` properties
	 * Object
	 * @returns {undefined}
	 * @private
	 */
	_insertCommandDefinitionByPriority( newCommandDefinition ) {
		for ( let i = 0; i <= this._childCommandsDefinitons.length; i++ ) {
			const registeredCommand = this._childCommandsDefinitons[ i ];

			if ( !registeredCommand || priorities.get( registeredCommand.priority ) >= priorities.get( newCommandDefinition.priority ) ) {
				this._childCommandsDefinitons.splice( i, 0, newCommandDefinition );

				break;
			}
		}
	}

	/**
	 * Registers a child command.
	 *
	 * @param {module:core/command~Command} command
	 * @param {String|Number} priority Priority of command. Command with highest priority will be executed over others.
	 */
	registerChildCommand( command, priority = 'normal' ) {
		this._insertCommandDefinitionByPriority( { command, priority } );

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
	 * Returns a first enabled command with highest priority or undefined if none of them is enabled.
	 *
	 * @returns {module:core/command~Command|undefined}
	 * @private
	 */
	_getFirstEnabledCommand() {
		const definitonsWithEnabledCommand = this._childCommandsDefinitons.filter( definition => definition.command.isEnabled );
		const definitionWithHighestPriority = definitonsWithEnabledCommand[ definitonsWithEnabledCommand.length - 1 ];

		return definitionWithHighestPriority && definitionWithHighestPriority.command;
	}
}
