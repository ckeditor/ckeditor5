/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/command
 */

import {
	ObservableMixin,
	type EventInfo,
	type ObservableChangeEvent,
	type DecoratedMethodEvent,
	type ObservableSetEvent
} from '@ckeditor/ckeditor5-utils';

import type Editor from './editor/editor.js';

/**
 * Base class for the CKEditor commands.
 *
 * Commands are the main way to manipulate the editor contents and state. They are mostly used by UI elements (or by other
 * commands) to make changes in the model. Commands are available in every part of the code that has access to
 * the {@link module:core/editor/editor~Editor editor} instance.
 *
 * Instances of registered commands can be retrieved from {@link module:core/editor/editor~Editor#commands `editor.commands`}.
 * The easiest way to execute a command is through {@link module:core/editor/editor~Editor#execute `editor.execute()`}.
 *
 * By default, commands are disabled when the editor is in the {@link module:core/editor/editor~Editor#isReadOnly read-only} mode
 * but commands with the {@link module:core/command~Command#affectsData `affectsData`} flag set to `false` will not be disabled.
 */
export default class Command extends /* #__PURE__ */ ObservableMixin() {
	/**
	 * The editor on which this command will be used.
	 */
	public readonly editor: Editor;

	/**
	 * The value of the command. A given command class should define what it represents for it.
	 *
	 * For example, the `'bold'` command's value indicates whether the selection starts in a bolded text.
	 * And the value of the `'link'` command may be an object with link details.
	 *
	 * It is possible for a command to have no value (e.g. for stateless actions such as `'uploadImage'`).
	 *
	 * A given command class should control this value by overriding the {@link #refresh `refresh()`} method.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: unknown;

	/**
	 * Flag indicating whether a command is enabled or disabled.
	 * A disabled command will do nothing when executed.
	 *
	 * A given command class should control this value by overriding the {@link #refresh `refresh()`} method.
	 *
	 * It is possible to disable a command "from outside" using {@link #forceDisabled} method.
	 *
	 * @observable
	 * @readonly
	 */
	declare public isEnabled: boolean;

	/**
	 * A flag indicating whether a command's `isEnabled` state should be changed depending on where the document
	 * selection is placed.
	 *
	 * By default, it is set to `true`. If the document selection is placed in a
	 * {@link module:engine/model/model~Model#canEditAt non-editable} place (such as non-editable root), the command becomes disabled.
	 *
	 * The flag should be changed to `false` in a concrete command's constructor if the command should not change its `isEnabled`
	 * accordingly to the document selection.
	 */
	protected _isEnabledBasedOnSelection: boolean;

	/**
	 * A flag indicating whether a command execution changes the editor data or not.
	 *
	 * @see #affectsData
	 */
	private _affectsData: boolean;

	/**
	 * Holds identifiers for {@link #forceDisabled} mechanism.
	 */
	private readonly _disableStack: Set<string>;

	/**
	 * Creates a new `Command` instance.
	 *
	 * @param editor The editor on which this command will be used.
	 */
	constructor( editor: Editor ) {
		super();

		this.editor = editor;
		this.set( 'value', undefined );
		this.set( 'isEnabled', false );

		this._affectsData = true;
		this._isEnabledBasedOnSelection = true;
		this._disableStack = new Set();

		this.decorate( 'execute' );

		// By default, every command is refreshed when changes are applied to the model.
		this.listenTo( this.editor.model.document, 'change', () => {
			this.refresh();
		} );

		this.listenTo<ObservableChangeEvent<boolean>>( editor, 'change:isReadOnly', () => {
			this.refresh();
		} );

		// By default, commands are disabled if the selection is in non-editable place or editor is in read-only mode.
		this.on<ObservableSetEvent<boolean>>( 'set:isEnabled', evt => {
			if ( !this.affectsData ) {
				return;
			}

			const selection = editor.model.document.selection;
			const selectionInGraveyard = selection.getFirstPosition()!.root.rootName == '$graveyard';
			const canEditAtSelection = !selectionInGraveyard && editor.model.canEditAt( selection );

			// Disable if editor is read only, or when selection is in a place which cannot be edited.
			//
			// Checking `editor.isReadOnly` is needed for all commands that have `_isEnabledBasedOnSelection == false`.
			// E.g. undo does not base on selection, but affects data and should be disabled when the editor is in read-only mode.
			if ( editor.isReadOnly || this._isEnabledBasedOnSelection && !canEditAtSelection ) {
				evt.return = false;
				evt.stop();
			}
		}, { priority: 'highest' } );

		this.on<CommandExecuteEvent>( 'execute', evt => {
			if ( !this.isEnabled ) {
				evt.stop();
			}
		}, { priority: 'high' } );
	}

	/**
	 * A flag indicating whether a command execution changes the editor data or not.
	 *
	 * Commands with `affectsData` set to `false` will not be automatically disabled in
	 * the {@link module:core/editor/editor~Editor#isReadOnly read-only mode} and
	 * {@glink features/read-only#related-features other editor modes} with restricted user write permissions.
	 *
	 * **Note:** You do not have to set it for your every command. It is `true` by default.
	 *
	 * @default true
	 */
	public get affectsData(): boolean {
		return this._affectsData;
	}

	protected set affectsData( affectsData: boolean ) {
		this._affectsData = affectsData;
	}

	/**
	 * Refreshes the command. The command should update its {@link #isEnabled} and {@link #value} properties
	 * in this method.
	 *
	 * This method is automatically called when
	 * {@link module:engine/model/document~Document#event:change any changes are applied to the document}.
	 */
	public refresh(): void {
		this.isEnabled = true;
	}

	/**
	 * Disables the command.
	 *
	 * Command may be disabled by multiple features or algorithms (at once). When disabling a command, unique id should be passed
	 * (e.g. the feature name). The same identifier should be used when {@link #clearForceDisabled enabling back} the command.
	 * The command becomes enabled only after all features {@link #clearForceDisabled enabled it back}.
	 *
	 * Disabling and enabling a command:
	 *
	 * ```ts
	 * command.isEnabled; // -> true
	 * command.forceDisabled( 'MyFeature' );
	 * command.isEnabled; // -> false
	 * command.clearForceDisabled( 'MyFeature' );
	 * command.isEnabled; // -> true
	 * ```
	 *
	 * Command disabled by multiple features:
	 *
	 * ```ts
	 * command.forceDisabled( 'MyFeature' );
	 * command.forceDisabled( 'OtherFeature' );
	 * command.clearForceDisabled( 'MyFeature' );
	 * command.isEnabled; // -> false
	 * command.clearForceDisabled( 'OtherFeature' );
	 * command.isEnabled; // -> true
	 * ```
	 *
	 * Multiple disabling with the same identifier is redundant:
	 *
	 * ```ts
	 * command.forceDisabled( 'MyFeature' );
	 * command.forceDisabled( 'MyFeature' );
	 * command.clearForceDisabled( 'MyFeature' );
	 * command.isEnabled; // -> true
	 * ```
	 *
	 * **Note:** some commands or algorithms may have more complex logic when it comes to enabling or disabling certain commands,
	 * so the command might be still disabled after {@link #clearForceDisabled} was used.
	 *
	 * @param id Unique identifier for disabling. Use the same id when {@link #clearForceDisabled enabling back} the command.
	 */
	public forceDisabled( id: string ): void {
		this._disableStack.add( id );

		if ( this._disableStack.size == 1 ) {
			this.on<ObservableSetEvent<boolean>>( 'set:isEnabled', forceDisable, { priority: 'highest' } );
			this.isEnabled = false;
		}
	}

	/**
	 * Clears forced disable previously set through {@link #forceDisabled}. See {@link #forceDisabled}.
	 *
	 * @param id Unique identifier, equal to the one passed in {@link #forceDisabled} call.
	 */
	public clearForceDisabled( id: string ): void {
		this._disableStack.delete( id );

		if ( this._disableStack.size == 0 ) {
			this.off( 'set:isEnabled', forceDisable );
			this.refresh();
		}
	}

	/**
	 * Executes the command.
	 *
	 * A command may accept parameters. They will be passed from {@link module:core/editor/editor~Editor#execute `editor.execute()`}
	 * to the command.
	 *
	 * The `execute()` method will automatically abort when the command is disabled ({@link #isEnabled} is `false`).
	 * This behavior is implemented by a high priority listener to the {@link #event:execute} event.
	 *
	 * In order to see how to disable a command from "outside" see the {@link #isEnabled} documentation.
	 *
	 * This method may return a value, which would be forwarded all the way down to the
	 * {@link module:core/editor/editor~Editor#execute `editor.execute()`}.
	 *
	 * @fires execute
	 */
	public execute( ...args: Array<unknown> ): unknown { return undefined; } // eslint-disable-line @typescript-eslint/no-unused-vars

	/**
	 * Destroys the command.
	 */
	public destroy(): void {
		this.stopListening();
	}
}

/**
 * Helper function that forces command to be disabled.
 */
function forceDisable( evt: EventInfo<string, boolean> ) {
	evt.return = false;
	evt.stop();
}

/**
 * Event fired by the {@link module:core/command~Command#execute} method. The command action is a listener to this event so it's
 * possible to change/cancel the behavior of the command by listening to this event.
 *
 * See {@link module:utils/observablemixin~Observable#decorate} for more information and samples.
 *
 * **Note:** This event is fired even if command is disabled. However, it is automatically blocked
 * by a high priority listener in order to prevent command execution.
 *
 * @eventName ~Command#execute
 */
export type CommandExecuteEvent = DecoratedMethodEvent<Command, 'execute'>;
