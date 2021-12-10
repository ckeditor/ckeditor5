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
		if ( filterText ) {
			filterText = filterText.toLowerCase();
		}

		let commands = Array.from( _getEditorCommands( this.editor ) );

		if ( filterText ) {
			commands = commands.filter( obj => {
				return ( obj.title && obj.title.toLowerCase().includes( filterText ) ) || obj.id.toLowerCase().includes( filterText );
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
	// Proxied commands are the commands that normally just expect have data to be given. However, we want
	// them to show/focus relevant UI elements.
	const componentFactory = editor.ui.componentFactory;
	const proxiedCommands = [ 'insertTable', 'mediaEmbed', 'fontSize' ];
	const proxyExecutors = {};

	for ( const [ commandName ] of editor.commands ) {
		let proxyExecutor = null;
		let uiComponent = null;
		let buttonLikeComponent = null;

		// UI component is used to obtain metadata (like human readable title or an icon).
		if ( componentFactory.has( commandName ) ) {
			uiComponent = componentFactory.create( commandName );

			buttonLikeComponent = uiComponent.buttonView ? uiComponent.buttonView : uiComponent;

			uiComponent = componentFactory.create( commandName );

			// Special handling for proxied commands.
			if ( proxiedCommands.includes( commandName ) ) {
				// Look in classic toolbar.
				if ( editor.ui && editor.ui.view.toolbar ) {
					for ( const toolbarItem of editor.ui.view.toolbar.items ) {
						if ( !proxyExecutor && isTheSameUIItem( uiComponent, toolbarItem ) ) {
							proxyExecutor = () => ( toolbarItem.buttonView || toolbarItem ).fire( 'execute' );

							proxyExecutors[ commandName ] = proxyExecutor;
						}
					}
				}
				// @todo: Look in balloon toolbar and other toolbars.

				// This is a proxy command but no matching button was found (e.g. someone did not add it to a toolbar)
				// we need to ignore it in this case.
				if ( !proxyExecutor ) {
					continue;
				}
			}
		}

		yield {
			id: commandName,
			title: buttonLikeComponent && buttonLikeComponent.label ? buttonLikeComponent.label : null,
			icon: buttonLikeComponent && buttonLikeComponent.icon ? buttonLikeComponent.icon : null,
			proxy: proxyExecutors[ commandName ] || null
		};
	}
}

// Compares two UI items.
function isTheSameUIItem( itemA, itemB ) {
	const buttonA = itemA.buttonView || itemA;
	const buttonB = itemB.buttonView || itemB;

	return buttonA.label === buttonB.label &&
		buttonA.icon === buttonB.icon;
}
