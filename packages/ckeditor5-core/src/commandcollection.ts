/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/commandcollection
 */

import { CKEditorError } from '@ckeditor/ckeditor5-utils';
import type Command from './command';

/**
 * Collection of commands. Its instance is available in {@link module:core/editor/editor~Editor#commands `editor.commands`}.
 */
export default class CommandCollection implements Iterable<[ string, Command ]> {
	private _commands: Map<string, Command>;

	/**
	 * Creates collection instance.
	 */
	constructor() {
		/**
		 * Command map.
		 *
		 * @private
		 * @member {Map}
		 */
		this._commands = new Map();
	}

	/**
	 * Registers a new command.
	 *
	 * @param {String} commandName The name of the command.
	 * @param {module:core/command~Command} command
	 */
	public add<TName extends string>(
		commandName: TName,
		command: CommandsMap[ TName ]
	): void {
		this._commands.set( commandName, command );
	}

	/**
	 * Retrieves a command from the collection.
	 *
	 * @param {String} commandName The name of the command.
	 * @returns {module:core/command~Command}
	 */
	public get<TName extends string>( commandName: TName ): CommandsMap[ TName ] | undefined {
		return this._commands.get( commandName );
	}

	/**
	 * Executes a command.
	 *
	 * @param {String} commandName The name of the command.
	 * @param {*} [...commandParams] Command parameters.
	 * @returns {*} The value returned by the {@link module:core/command~Command#execute `command.execute()`}.
	 */
	public execute<TName extends string>(
		commandName: TName,
		...args: Parameters<CommandsMap[ TName ][ 'execute' ]>
	): ReturnType<CommandsMap[ TName ][ 'execute' ]> {
		const command = this.get( commandName );

		if ( !command ) {
			/**
			 * Command does not exist.
			 *
			 * @error commandcollection-command-not-found
			 * @param {String} commandName Name of the command.
			 */
			throw new CKEditorError( 'commandcollection-command-not-found', this, { commandName } );
		}

		return command.execute( ...args ) as any;
	}

	/**
	 * Returns iterator of command names.
	 *
	 * @returns {Iterable.<String>}
	 */
	public* names(): IterableIterator<string> {
		yield* this._commands.keys();
	}

	/**
	 * Returns iterator of command instances.
	 *
	 * @returns {Iterable.<module:core/command~Command>}
	 */
	public* commands(): IterableIterator<Command> {
		yield* this._commands.values();
	}

	/**
	 * Iterable interface.
	 *
	 * Returns `[ commandName, commandInstance ]` pairs.
	 *
	 * @returns {Iterator.<Array>}
	 */
	public [ Symbol.iterator ](): Iterator<[ string, Command ]> {
		return this._commands[ Symbol.iterator ]();
	}

	/**
	 * Destroys all collection commands.
	 */
	public destroy(): void {
		for ( const command of this.commands() ) {
			command.destroy();
		}
	}
}

export interface CommandsMap {
	[ name: string ]: Command;
}
