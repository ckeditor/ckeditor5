/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/tablecolumnresizeui
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import {
	ViewModel,
	ContextualBalloon,
	clickOutsideHandler,
	CssTransitionDisablerMixin,
	type ViewWithCssTransitionDisabler,
	type ListDropdownItemDefinition
} from 'ckeditor5/src/ui.js';

import { getBalloonTablePositionData } from '../utils/ui/contextualballoon.js';

import TableColumnResizeCommand from './commands/tablecolumnresizecommand.js';
import TableColumnResizeUtils from './tablecolumnresizeutils.js';

import TableColumnResizeFormView, {
	type TableColumnResizeFormValidatorCallback,
	type TableColumnResizeFormViewCancelEvent,
	type TableColumnResizeFormViewSubmitEvent
} from './ui/tablecolumnresizeformview.js';

/**
 * The resize table column UI plugin.
 *
 * The plugin uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 */
export default class TableColumnResizeUI extends Plugin {
	/**
	 * The contextual balloon plugin instance.
	 */
	private _balloon?: ContextualBalloon;

	/**
	 * A form containing a textarea and buttons, used to change the `alt` text value.
	 */
	private _form?: TableColumnResizeFormView & ViewWithCssTransitionDisabler;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ContextualBalloon, TableColumnResizeUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableColumnResizeUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this.editor.commands.add( 'resizeTableColumn', new TableColumnResizeCommand( this.editor ) );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		// Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
		if ( this._form ) {
			this._form.destroy();
		}
	}

	/**
	 * @internal
	 */
	public _createDropdownEntry(): ListDropdownItemDefinition {
		const editor = this.editor;
		const t = editor.t;

		const command: TableColumnResizeCommand = editor.commands.get( 'resizeTableColumn' )!;
		const model = new ViewModel();

		model.set( {
			label: t( 'Resize column' ),
			withText: true,
			onClick: () => {
				this._showForm();
			}
		} );

		model.bind( 'isEnabled' ).to( command, 'isEnabled' );
		model.bind( 'isOn' ).to( command, 'value', value => !!value );

		return {
			type: 'button',
			model
		};
	}

	/**
	 * Creates the {@link module:table/tablecolumnresize/ui/tablecolumnresizeformview~TableColumnResizeFormView}
	 * form.
	 */
	private _createForm(): void {
		const editor = this.editor;

		this._balloon = this.editor.plugins.get( 'ContextualBalloon' );

		this._form = new ( CssTransitionDisablerMixin( TableColumnResizeFormView ) )( editor.locale, getFormValidators( editor ) );

		// Render the form so its #element is available for clickOutsideHandler.
		this._form.render();

		this.listenTo<TableColumnResizeFormViewSubmitEvent>( this._form, 'submit', () => {
			if ( this._form!.isValid() ) {
				editor.execute( 'resizeTableColumn', {
					newColumnWidth: this._form!.parsedSize!
				} );

				this._hideForm( true );
			}
		} );

		// Update balloon position when form error label is added .
		this.listenTo( this._form.labeledInput, 'change:errorText', () => {
			editor.ui.update();
		} );

		this.listenTo<TableColumnResizeFormViewCancelEvent>( this._form, 'cancel', () => {
			this._hideForm( true );
		} );

		// Close the form on Esc key press.
		this._form.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideForm( true );
			cancel();
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this._form,
			activator: () => this._isVisible,
			contextElements: () => [ this._balloon!.view.element! ],
			callback: () => this._hideForm()
		} );
	}

	/**
	 * Shows the {@link #_form} in the {@link #_balloon}.
	 */
	private _showForm(): void {
		if ( this._isVisible ) {
			return;
		}

		if ( !this._form ) {
			this._createForm();
		}

		const editor = this.editor;
		const command: TableColumnResizeCommand = editor.commands.get( 'resizeTableColumn' )!;
		const labeledInput = this._form!.labeledInput;

		this._form!.disableCssTransitions();
		this._form!.resetFormStatus();

		if ( !this._isInBalloon ) {
			this._balloon!.add( {
				view: this._form!,
				position: getBalloonTablePositionData( editor )
			} );
		}

		// Ensure that command value is always up to date. Column resizing does not trigger command refresh all of the time.
		// In some scenarios like resizing column and then undoing this the plugins are not refreshed and value is outdated.
		command.refresh();

		// Make sure that each time the panel shows up, the field remains in sync with the value of
		// the command. If the user typed in the input, then canceled the balloon (`labeledInput#value`
		// stays unaltered) and re-opened it without changing the value of the command, they would see the
		// old value instead of the actual value of the command.
		const possibleRange = command.possibleRange!;

		labeledInput.fieldView.value = labeledInput.fieldView.element!.value = Math.ceil( possibleRange.current ).toString();
		labeledInput.fieldView.set( {
			min: Math.floor( possibleRange.lower ),
			max: Math.ceil( possibleRange.upper )
		} );

		this._form!.labeledInput.fieldView.select();
		this._form!.enableCssTransitions();
	}

	/**
	 * Removes the {@link #_form} from the {@link #_balloon}.
	 *
	 * @param focusEditable Controls whether the editing view is focused afterwards.
	 */
	private _hideForm( focusEditable: boolean = false ): void {
		if ( !this._isInBalloon ) {
			return;
		}

		// Blur the input element before removing it from DOM to prevent issues in some browsers.
		// See https://github.com/ckeditor/ckeditor5/issues/1501.
		if ( this._form!.focusTracker.isFocused ) {
			this._form!.saveButtonView.focus();
		}

		this._balloon!.remove( this._form! );

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}
	}

	/**
	 * Returns `true` when the {@link #_form} is the visible view in the {@link #_balloon}.
	 */
	private get _isVisible(): boolean {
		return !!this._balloon && this._balloon.visibleView === this._form;
	}

	/**
	 * Returns `true` when the {@link #_form} is in the {@link #_balloon}.
	 */
	private get _isInBalloon(): boolean {
		return !!this._balloon && this._balloon.hasView( this._form! );
	}
}

/**
 * Returns column resize form validation callbacks.
 *
 * @param editor Editor instance.
 */
function getFormValidators( editor: Editor ): Array<TableColumnResizeFormValidatorCallback> {
	const t = editor.t;

	return [
		form => {
			if ( form.rawSize!.trim() === '' ) {
				return t( 'Column width must not be empty.' );
			}

			if ( form.parsedSize === null ) {
				return t( 'Incorrect column width value.' );
			}
		}
	];
}
