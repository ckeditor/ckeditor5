/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetextalternative/imagetextalternativeui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import {
	ContextualBalloon,
	clickOutsideHandler,
	CssTransitionDisablerMixin,
	type ViewWithCssTransitionDisabler
} from 'ckeditor5/src/ui.js';

import { getBalloonPositionData } from '../image/ui/utils.js';

import ImageCustomResizeFormView, {
	type ImageCustomResizeFormViewCancelEvent,
	type ImageCustomResizeFormViewSubmitEvent
} from './ui/imagecustomresizeformview.js';

/**
 * The custom resize image UI plugin.
 *
 * The plugin uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 */
export default class ImageCustomResizeUI extends Plugin {
	/**
	 * The contextual balloon plugin instance.
	 */
	private _balloon?: ContextualBalloon;

	/**
	 * A form containing a textarea and buttons, used to change the `alt` text value.
	 */
	private _form?: ImageCustomResizeFormView & ViewWithCssTransitionDisabler;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ContextualBalloon ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageCustomResizeUI' as const;
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
	 * Creates the {@link module:image/imagetextalternative/ui/textalternativeformview~ImageCustomResizeFormView}
	 * form.
	 */
	private _createForm( units: string ): void {
		const editor = this.editor;

		this._balloon = this.editor.plugins.get( 'ContextualBalloon' );

		this._form = new ( CssTransitionDisablerMixin( ImageCustomResizeFormView ) )( editor.locale, units );

		// Render the form so its #element is available for clickOutsideHandler.
		this._form.render();

		this.listenTo<ImageCustomResizeFormViewSubmitEvent>( this._form, 'submit', () => {
			const { value } = this._inputViewElement.element!;

			editor.execute( 'resizeImage', {
				width: `${ Number.parseFloat( value ) }${ units }`
			} );

			this._hideForm( true );
		} );

		this.listenTo<ImageCustomResizeFormViewCancelEvent>( this._form, 'cancel', () => {
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
	 *
	 * @internal
	 */
	public _showForm( units: string ): void {
		if ( this._isVisible ) {
			return;
		}

		if ( !this._form ) {
			this._createForm( units );
		}

		const editor = this.editor;
		const labeledInput = this._form!.labeledInput;
		const command = this.editor.commands.get( 'resizeImage' )!;

		this._form!.disableCssTransitions();

		if ( !this._isInBalloon ) {
			this._balloon!.add( {
				view: this._form!,
				position: getBalloonPositionData( editor )
			} );
		}

		// Make sure that each time the panel shows up, the field remains in sync with the value of
		// the command. If the user typed in the input, then canceled the balloon (`labeledInput#value`
		// stays unaltered) and re-opened it without changing the value of the command, they would see the
		// old value instead of the actual value of the command.
		labeledInput.fieldView.value = labeledInput.fieldView.element!.value = command.value && command.value.width ?
			Number.parseFloat( command.value.width ).toFixed( 1 ) : '';

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

	/**
	 * Returns input field view element rendered by the {@link #_form}.
	 */
	private get _inputViewElement() {
		return this._form!.labeledInput.fieldView!;
	}
}
