/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Command from './command';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

/**
 * @module core/multicommand
 */

export default class MultiCommand extends Command {
	constructor( editor ) {
		super( editor );

		this._childCommands = new Collection();
	}

	refresh() {
		// The command listens to child commands rather then acts on refresh.
		// TODO: check with track changes.
	}

	execute() {
		const { command } = this._getEnabled();

		command.execute();
	}

	registerChildCommand( command ) {
		this._childCommands.add( { command } );

		command.on( 'change:isEnabled', () => this._checkEnabled() );

		this._checkEnabled();
	}

	_checkEnabled() {
		this.isEnabled = !!this._getEnabled();
	}

	_getEnabled() {
		return this._childCommands.find( ( { command } ) => command.isEnabled );
	}
}
