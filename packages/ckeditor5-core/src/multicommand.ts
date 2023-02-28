/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/multicommand
 */

import Command from './command';
import type Editor from './editor/editor';

import {
	insertToPriorityArray,
	type PriorityString,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

/**
 * A CKEditor command that aggregates other commands.
 *
 * This command is used to proxy multiple commands. The multi-command is enabled when
 * at least one of its registered child commands is enabled.
 * When executing a multi-command, the first enabled command with highest priority will be executed.
 *
 * ```ts
 * const multiCommand = new MultiCommand( editor );
 *
 * const commandFoo = new Command( editor );
 * const commandBar = new Command( editor );
 *
 * // Register a child command.
 * multiCommand.registerChildCommand( commandFoo );
 * // Register a child command with a low priority.
 * multiCommand.registerChildCommand( commandBar, { priority: 'low' } );
 *
 * // Enable one of the commands.
 * commandBar.isEnabled = true;
 *
 * multiCommand.execute(); // Will execute commandBar.
 * ```
 */
export default class MultiCommand extends Command {
	/**
	 * Registered child commands definitions.
	 */
	private _childCommandsDefinitions: Array<{ command: Command; priority: PriorityString }> = [];

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		// Override base command refresh(): the command's state is changed when one of child commands changes states.
	}

	/**
	 * Executes the first enabled command which has the highest priority of all registered child commands.
	 *
	 * @returns The value returned by the {@link module:core/command~Command#execute `command.execute()`}.
	 */
	public override execute( ...args: Array<unknown> ): unknown {
		const command = this._getFirstEnabledCommand();

		return !!command && command.execute( args );
	}

	/**
	 * Registers a child command.
	 *
	 * @param options An object with configuration options.
	 * @param options.priority Priority of a command to register.
	 */
	public registerChildCommand(
		command: Command,
		options: { priority?: PriorityString } = {}
	): void {
		insertToPriorityArray( this._childCommandsDefinitions, { command, priority: options.priority || 'normal' } );

		// Change multi-command enabled state when one of registered commands changes state.
		command.on<ObservableChangeEvent<boolean>>( 'change:isEnabled', () => this._checkEnabled() );

		this._checkEnabled();
	}

	/**
	 * Checks if any of child commands is enabled.
	 */
	private _checkEnabled(): void {
		this.isEnabled = !!this._getFirstEnabledCommand();
	}

	/**
	 * Returns a first enabled command with the highest priority or `undefined` if none of them is enabled.
	 */
	private _getFirstEnabledCommand(): Command | undefined {
		const commandDefinition = this._childCommandsDefinitions.find( ( { command } ) => command.isEnabled );

		return commandDefinition && commandDefinition.command;
	}
}
