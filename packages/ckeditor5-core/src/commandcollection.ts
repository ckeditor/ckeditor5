/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/commandcollection
 */

import { CKEditorError } from '@ckeditor/ckeditor5-utils';
import type Command from './command.js';

/**
 * Collection of commands. Its instance is available in {@link module:core/editor/editor~Editor#commands `editor.commands`}.
 */
export default class CommandCollection implements Iterable<[ string, Command ]> {
	/**
	 * Command map.
	 */
	private _commands: Map<string, Command>;

	/**
	 * Creates collection instance.
	 */
	constructor() {
		this._commands = new Map();
	}

	/**
	 * Registers a new command.
	 *
	 * @param commandName The name of the command.
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
	 * @param commandName The name of the command.
	 */
	public get<TName extends string>( commandName: TName ): CommandsMap[ TName ] | undefined {
		return this._commands.get( commandName );
	}

	/**
	 * Executes a command.
	 *
	 * @param commandName The name of the command.
	 * @param commandParams Command parameters.
	 * @returns The value returned by the {@link module:core/command~Command#execute `command.execute()`}.
	 */
	public execute<TName extends string>(
		commandName: TName,
		...commandParams: Parameters<CommandsMap[ TName ][ 'execute' ]>
	): ReturnType<CommandsMap[ TName ][ 'execute' ]> {
		const command = this.get( commandName );

		if ( !command ) {
			/**
			 * Command does not exist.
			 *
			 * @error commandcollection-command-not-found
			 * @param {string} commandName Name of the command.
			 */
			throw new CKEditorError( 'commandcollection-command-not-found', this, { commandName } );
		}

		return command.execute( ...commandParams ) as any;
	}

	/**
	 * Returns iterator of command names.
	 */
	public* names(): IterableIterator<string> {
		yield* this._commands.keys();
	}

	/**
	 * Returns iterator of command instances.
	 */
	public* commands(): IterableIterator<Command> {
		yield* this._commands.values();
	}

	/**
	 * Iterable interface.
	 *
	 * Returns `[ commandName, commandInstance ]` pairs.
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

/**
 * Helper type that maps command names to their types.
 * It is meant to be extended with module augmentation.
 *
 * ```ts
 * class MyCommand extends Command {
 * 	public execute( parameter: A ): B {
 * 		// ...
 * 	}
 * }
 *
 * declare module '@ckeditor/ckeditor5-core' {
 * 	interface CommandsMap {
 * 		myCommand: MyCommand;
 * 	}
 * }
 *
 * // Returns `MyCommand | undefined`.
 * const myCommand = editor.commands.get( 'myCommand' );
 *
 * // Expects `A` type as parameter and returns `B`.
 * const value = editor.commands.execute( 'myCommand', new A() );
 * ```
 */
export interface CommandsMap {
	[ name: string ]: Command;
}
