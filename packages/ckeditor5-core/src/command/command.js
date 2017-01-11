/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module core/command/command
 */

import ObservableMixin from 'ckeditor5-utils/src/observablemixin';
import mix from 'ckeditor5-utils/src/mix';

/**
 * The base class for CKEditor commands.
 *
 * Commands are main way to manipulate editor contents and state. They are mostly used by UI elements (or by other
 * commands) to make changes in Tree Model. Commands are available in every part of code that has access to
 * {@link module:core/editor/editor~Editor} instance, since they are registered in it and executed through
 * {@link module:core/editor/editor~Editor#execute}.
 * Commands instances are available through {@link module:core/editor/editor~Editor#commands}.
 *
 * This is an abstract base class for all commands.
 *
 * @mixes module:utils/observablemixin~ObservaleMixin
 */
export default class Command {
	/**
	 * Creates a new Command instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor on which this command will be used.
	 */
	constructor( editor ) {
		/**
		 * Editor on which this command will be used.
		 *
		 * @readonly
		 * @member {module:core/editor/editor~Editor} #editor
		 */
		this.editor = editor;

		/**
		 * Flag indicating whether a command is enabled or disabled.
		 * A disabled command should do nothing upon it's execution.
		 *
		 * @observable
		 * @member {Boolean} #isEnabled
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
	 * @fires refreshState
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
	 * @param {*} param Parameter passed to {@link module:core/editor/editor~Editor#execute execute} method of this command.
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
	 * other listeners does not return false on `refreshState` event callbacks. Firing {@link #_enable}
	 * does not guarantee that {@link #isEnabled} will be set to true, as it depends on other listeners.
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
	 * @method #_checkEnabled
	 * @returns {Boolean} `true` if command should be enabled according to
	 * {@link module:engine/model/document~Document#schema}. `false` otherwise.
	 */
}

function disableCallback( evt, data ) {
	data.isEnabled = false;
}

mix( Command, ObservableMixin );

/**
 * Fired whenever command has to have its {@link #isEnabled} property refreshed. Every feature,
 * command or other class which needs to disable command (set `isEnabled` to `false`) should listen to this
 * event.
 *
 * @event refreshState
 * @param {Object} data
 * @param {Boolean} [data.isEnabled=true]
 */
