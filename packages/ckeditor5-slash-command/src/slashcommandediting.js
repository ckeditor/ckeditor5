/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module slash-command/slashcommandediting
 */

import { Plugin } from 'ckeditor5/src/core';

/**
 * The slash command editing plugin.
 *
 * It registers the {@link module:slash-command/slashcommandcommand~SlashCommandCommand slashCommand} command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SlashCommandEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SlashCommandEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
	}

	/**
	 * Returns a list of commands along with their metadata (like human readable title, description etc).
	 *
	 * @param {String} [filterText] Text used to filter out returned commands.
	 * @returns {Iterable.<Object>}
	 */
	getCommandsInfo( filterText ) {
		let commands = Array.from( _getEditorCommands( this.editor ) );

		if ( filterText ) {
			commands = commands.filter( obj => {
				return ( obj.title && obj.title.includes( filterText ) ) || obj.id.includes( filterText );
			} );
		}

		return new Set( commands );
	}
}

/**
 * Inspects a given `editor` instance in search for commands. Tries to fetch
 * metadata relevant for a given command.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Object}
 */
function* _getEditorCommands( editor ) {
	const componentFactory = editor.ui.componentFactory;
	for ( const [ commandName ] of editor.commands ) {
		let uiComponent = null;

		// UI component is used to obtain metadata (like human readable title or an icon).
		if ( componentFactory.has( commandName ) ) {
			uiComponent = componentFactory.create( commandName );
		}

		yield {
			id: commandName,
			title: uiComponent && uiComponent.label ? uiComponent.label : null,
			icon: uiComponent && uiComponent.icon ? uiComponent.icon : null,
			description: null
		};
	}
}
