/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/slashcommandui
 */

import { Plugin } from 'ckeditor5/src/core';
import { SlashCommandEditing } from '.';

/**
 * The remove format UI plugin. It registers the `'slashCommand'` button which can be
 * used in the toolbar.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SlashCommandUI extends Plugin {
	static get requires() {
		return [ SlashCommandEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SlashCommandUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._prepareConfig();
	}

	afterInit() {
		this._setupListener();
	}

	_prepareConfig() {
		const editor = this.editor;
		const config = editor.config.get( 'mention.feeds' );

		config.push( {
			marker: '/',
			feed: this._getCommandList()
		} );

		editor.config.set( 'mention.feeds', config );
	}

	_getCommandList() {
		const commandsList = Array.from( this.editor.plugins.get( 'SlashCommandEditing' ).getCommandsInfo() );

		commandsList.forEach( entry => {
			entry.id = '/' + entry.id;
		} );

		return commandsList;
	}

	_setupListener() {
		const editor = this.editor;
		const commandList = this._getCommandList();

		editor.commands.get( 'mention' ).on( 'execute', ( event, data ) => {
			const eventData = data[ 0 ];
			const model = editor.model;

			if ( eventData.marker == '/' && commandList.some( command => command.id == eventData.mention.id ) ) {
				const commandName = eventData.mention.id.substr( 1 );

				model.change( writer => {
					const selection = model.document.selection;
					const range = eventData.range || selection.getFirstRange();

					writer.remove( range );

					editor.execute( commandName );

					// Default mentions handler should not be triggered.
					event.stop();
				} );
			}
		}, { priority: 'high' } );
	}
}
