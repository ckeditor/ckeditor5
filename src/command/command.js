/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ObservableMixin from '../utils/observablemixin.js';
import mix from '../utils/mix.js';

/**
 * The base class for CKEditor commands.
 *
 * Commands are main way to manipulate editor contents and state. They are mostly used by UI elements (or by other
 * commands) to make changes in Tree Model. Commands are available in every part of code that has access to
 * {@link ckeditor5.Editor} instance, since they are registered in it and executed through {@link ckeditor5.Editor#execute}.
 * Commands instances are available through {@link ckeditor5.Editor#commands}.
 *
 * This is an abstract base class for all commands.
 *
 * @memberOf ckeditor5.command
 * @mixes utils.ObservableMixin
 */
export default class Command {
	/**
	 * Creates a new Command instance.
	 *
	 * @param {ckeditor5.Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		/**
		 * Editor on which this command will be used.
		 *
		 * @readonly
		 * @member {ckeditor5.Editor} ckeditor5.command.Command#editor
		 */
		this.editor = editor;

		/**
		 * Flag indicating whether a command is enabled or disabled.
		 * A disabled command should do nothing upon it's execution.
		 *
		 * @observable
		 * @member {Boolean} ckeditor5.command.Command#isEnabled
		 */
		this.set( 'isEnabled', true );

		// If schema checking function is specified, add it to the `refreshState` listeners.
		// Feature will be disabled if it does not apply to schema requirements.
		if ( this._checkEnabled ) {
			this.on( 'refreshState', ( evt, data ) => {
				data.isEnabled = this._checkEnabled();
			} );
		}
	}

	destroy() {
		this.stopListening();
	}

	/**
	 * Fires `refreshState` event and checks it's resolve value to decide whether command should be enabled or not.
	 * Other parts of code might listen to `refreshState` event on this command and add their callbacks. This
	 * way the responsibility of deciding whether a command should be enabled is shared.
	 *
	 * @fires {@link ckeditor5.command.Command#refreshState refreshState}
	 */
	refreshState() {
		const data = { isEnabled: true };
		this.fire( 'refreshState', data );

		this.isEnabled = data.isEnabled;
	}

	/**
	 * Executes the command if it is enabled.
	 *
	 * @protected
	 * @param {*} param Parameter passed to {@link ckeditor5.command.Command#execute execute} method of this command.
	 */
	_execute( param ) {
		if ( this.isEnabled ) {
			this._doExecute( param );
		}
	}

	/**
	 * Disables the command. This should be used only by the command itself. Other parts of code should add
	 * listeners to `refreshState` event.
	 *
	 * @protected
	 */
	_disable() {
		this.on( 'refreshState', disableCallback );
		this.refreshState();
	}

	/**
	 * Enables the command (internally). This should be used only by the command itself. Command will be enabled if
	 * other listeners does not return false on `refreshState` event callbacks. Firing {@link ckeditor5.command.Command#_enable}
	 * does not guarantee that {@link ckeditor5.command.Command#isEnabled} will be set to true, as it depends on other listeners.
	 *
	 * @protected
	 */
	_enable() {
		this.off( 'refreshState', disableCallback );
		this.refreshState();
	}

	/**
	 * Executes command.
	 * This is an abstract method that should be overwritten in child classes.
	 *
	 * @protected
	 */
	_doExecute() {}

	/**
	 * Checks if a command should be enabled according to its own rules. Mostly it will check schema to see if the command
	 * is allowed to be executed in given position. This method can be defined in child class (but is not obligatory).
	 * If it is defined, it will be added as a callback to `refreshState` event.
	 *
	 * @protected
	 * @method ckeditor5.command.Command#_checkEnabled
	 * @returns {Boolean} `true` if command should be enabled according to {@link engine.model.Document#schema}. `false` otherwise.
	 */
}

function disableCallback( evt, data ) {
	data.isEnabled = false;
}

mix( Command, ObservableMixin );

/**
 * Fired whenever command has to have its {@link ckeditor5.command.Command#isEnabled} property refreshed. Every feature,
 * command or other class which needs to disable command (set `isEnabled` to `false`) should listen to this
 * event.
 *
 * @event ckeditor5.command.Command#refreshState
 * @param {Object} data
 * @param {Boolean} [data.isEnabled=true]
 */
