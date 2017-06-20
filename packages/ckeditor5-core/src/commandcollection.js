/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/commandcollection
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Collection of commands. Its instance is available in {@link module:core/editor/editor~Editor#commands `editor.commands`}.
 */
export default class CommandCollection {
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
	add( commandName, command ) {
		this._commands.set( commandName, command );
	}

	/**
	 * Retrieves a command from the collection.
	 *
	 * @param {String} commandName The name of the command.
	 * @returns {module:core/command~Command}
	 */
	get( commandName ) {
		return this._commands.get( commandName );
	}

	/**
	 * Executes a command.
	 *
	 * @param {String} commandName The name of the command.
	 */
	execute( commandName, ...args ) {
		const command = this.get( commandName );

		if ( !command ) {
			/**
			 * Command does not exist.
			 *
			 * @error commandcollection-command-not-found
			 * @param {String} commandName Name of the command.
			 */
			throw new CKEditorError( 'commandcollection-command-not-found: Command does not exist.', { commandName } );
		}

		command.execute( ...args );
	}

	/**
	 * Returns iterator of command names.
	 *
	 * @returns {Iterator.<String>}
	 */
	* names() {
		yield* this._commands.keys();
	}

	/**
	 * Returns iterator of command instances.
	 *
	 * @returns {Iterator.<module:core/command~Command>}
	 */
	* commands() {
		yield* this._commands.values();
	}

	/**
	 * Collection iterator.
	 */
	[ Symbol.iterator ]() {
		return this._commands[ Symbol.iterator ]();
	}

	/**
	 * Destroys all collection commands.
	 */
	destroy() {
		for ( const command of this.commands() ) {
			command.destroy();
		}
	}
}
