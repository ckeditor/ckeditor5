/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module remove-format/slashcommandui
 */

import { Plugin } from 'ckeditor5/src/core';
import { SlashCommandEditing } from '.';

import '../theme/slashcommand.css';

/* global document */

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
		// Some commands are registered in afterInit method.
		this.editor.once( 'ready', this._setupListener.bind( this ) );
	}

	_prepareConfig() {
		const editor = this.editor;
		const config = editor.config.get( 'mention.feeds' );

		config.push( {
			marker: '/',
			feed: this._getCommandList.bind( this ),
			itemRenderer: this._customItemRenderer
		} );

		editor.config.set( 'mention.feeds', config );
	}

	_getCommandList( searchString ) {
		const commandsList = Array.from( this.editor.plugins.get( 'SlashCommandEditing' ).getCommandsInfo( searchString ) );

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

					if ( eventData.mention.proxy ) {
						eventData.mention.proxy();
					} else {
						editor.execute( commandName );
					}

					// Default mentions handler should not be triggered.
					event.stop();
				} );
			}
		}, { priority: 'high' } );
	}

	_customItemRenderer( item ) {
		// This should be configurable.
		const layout = 'compact';
		const layoutClass = layout === 'clean' ? 'ck-feed-clean-command-' : 'ck-feed-command-';

		const feedContainer = document.createElement( 'div' );
		feedContainer.classList.add( 'ck-feed-command-entry' );

		if ( item.icon ) {
			const icon = document.createElement( 'span' );

			icon.classList.add( layoutClass + 'icon' );
			icon.innerHTML = item.icon;
			icon.firstChild.style.width = layout === 'clean' ? '30px' : '20px';

			feedContainer.appendChild( icon );
		}

		const commandTitleElement = document.createElement( 'span' );

		commandTitleElement.classList.add( layoutClass + 'title' );
		commandTitleElement.textContent = item.title;

		const commandIdElement = document.createElement( 'span' );

		commandIdElement.classList.add( 'ck-feed-command-id' );
		commandIdElement.textContent = item.id;

		if ( layout == 'clean' ) {
			const div = document.createElement( 'div' );
			div.classList.add( layoutClass + 'container' );

			div.appendChild( commandTitleElement );
			div.appendChild( commandIdElement );

			feedContainer.appendChild( div );
		} else {
			feedContainer.appendChild( commandTitleElement );
			feedContainer.appendChild( commandIdElement );
		}

		return feedContainer;
	}
}
