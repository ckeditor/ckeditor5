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
	 * Returns a list of commands along with their medadata (like human readable title, description etc).
	 *
	 * @param {String} filterText Text used to filter out returned commands.
	 * @returns {Iterable.<Object>}
	 */
	getCommandsInfo( filterText ) {
		let fakeDataProvider = [ {
			id: 'numberedList',
			title: 'Numbered list',
			icon: null,
			description: null
		}, {
			id: 'blockQuote',
			title: 'Block quote',
			icon: null,
			description: null
		}, {
			id: 'indentList',
			title: 'Increase indent',
			icon: null,
			description: null
		} ];

		if ( filterText ) {
			fakeDataProvider = fakeDataProvider.filter( obj => {
				return obj.title.includes( filterText ) || obj.id.includes( filterText );
			} );
		}

		return new Set( fakeDataProvider );
	}
}
