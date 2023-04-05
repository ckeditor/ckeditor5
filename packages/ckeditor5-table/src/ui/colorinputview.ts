/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/ui/colorinputview
 */

import {
	View,
	InputTextView,
	ButtonView,
	createDropdown,
	ColorGridView,
	FocusCycler,
	ViewCollection,
	type ColorDefinition,
	type DropdownView
} from 'ckeditor5/src/ui';
import { icons } from 'ckeditor5/src/core';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils';

import '../../theme/colorinput.css';

export type ColorInputViewOptions = {
	colorDefinitions: Array<ColorDefinition>;
	columns: number;
	defaultColorValue?: string;
};

/**
 * The color input view class. It allows the user to type in a color (hex, rgb, etc.)
 * or choose it from the configurable color palette with a preview.
 *
 * @internal
 */
export default class ColorInputView extends View {
	/**
	 * The value of the input.
	 *
	 * @observable
	 * @default ''
	 */
	declare public value: string;

	/**
	 * Controls whether the input view is in read-only mode.
	 *
	 * @observable
	 * @default false
	 */
	declare public isReadOnly: boolean;

	/**
	 * An observable flag set to `true` when the input is focused by the user.
	 * `false` otherwise.
	 *
	 * @observable
	 * @default false
	 */
	declare public readonly isFocused: boolean;

	/**
	 * An observable flag set to `true` when the input contains no text.
	 *
	 * @observable
	 * @default true
	 */
	declare public readonly isEmpty: boolean;

	/**
	 * @observable
	 */
	declare public hasError: boolean;

	/**
	 * A cached reference to the options passed to the constructor.
	 */
	public options: ColorInputViewOptions;

	/**
	 * Tracks information about the DOM focus in the view.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * A collection of views that can be focused in the view.
	 */
	protected readonly _focusables: ViewCollection;

	/**
	 * An instance of the dropdown allowing to select a color from a grid.
	 */
	public dropdownView: DropdownView;

	/**
	 * An instance of the input allowing the user to type a color value.
	 */
	public inputView: InputTextView;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * The flag that indicates whether the user is still typing.
	 * If set to true, it means that the text input field ({@link #inputView}) still has the focus.
	 * So, we should interrupt the user by replacing the input's value.
	 */
	protected _stillTyping: boolean;

	/**
	 * Helps cycling over focusable items in the view.
	 */
	protected readonly _focusCycler: FocusCycler;

	/**
	 * Creates an instance of the color input view.
	 *
	 * @param locale The locale instance.
	 * @param options The input options.
	 * @param options.colorDefinitions The colors to be displayed in the palette inside the input's dropdown.
	 * @param options.columns The number of columns in which the colors will be displayed.
	 * @param options.defaultColorValue If specified, the color input view will replace the "Remove color" button with
	 * the "Restore default" button. Instead of clearing the input field, the default color value will be set.
	 */
	constructor( locale: Locale, options: ColorInputViewOptions ) {
		super( locale );

		this.set( 'value', '' );
		this.set( 'isReadOnly', false );
		this.set( 'isFocused', false );
		this.set( 'isEmpty', true );

		this.options = options;
		this.focusTracker = new FocusTracker();
		this._focusables = new ViewCollection();
		this.dropdownView = this._createDropdownView();
		this.inputView = this._createInputTextView();
		this.keystrokes = new KeystrokeHandler();
		this._stillTyping = false;

		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate items backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
				focusPrevious: 'shift + tab',

				// Navigate items forwards using the <kbd>Tab</kbd> key.
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-input-color'
				]
			},
			children: [
				this.dropdownView,
				this.inputView
			]
		} );

		this.on( 'change:value', ( evt, name, inputValue ) => this._setInputValue( inputValue ) );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		// Start listening for the keystrokes coming from the dropdown panel view.
		this.keystrokes.listenTo( this.dropdownView.panelView.element! );
	}

	/**
	 * Focuses the input.
	 */
	public focus(): void {
		this.inputView.focus();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Creates and configures the {@link #dropdownView}.
	 */
	private _createDropdownView() {
		const locale = this.locale!;
		const t = locale.t;
		const bind = this.bindTemplate;
		const colorGrid = this._createColorGrid( locale );
		const dropdown = createDropdown( locale );
		const colorPreview = new View();
		const removeColorButton = this._createRemoveColorButton();

		colorPreview.setTemplate( {
			tag: 'span',
			attributes: {
				class: [
					'ck',
					'ck-input-color__button__preview'
				],
				style: {
					backgroundColor: bind.to( 'value' )
				}
			},
			children: [ {
				tag: 'span',
				attributes: {
					class: [
						'ck',
						'ck-input-color__button__preview__no-color-indicator',
						bind.if( 'value', 'ck-hidden', value => value != '' )
					]
				}
			} ]
		} );

		dropdown.buttonView.extendTemplate( {
			attributes: {
				class: 'ck-input-color__button'
			}
		} );

		dropdown.buttonView.children.add( colorPreview );
		dropdown.buttonView.label = t( 'Color picker' );
		dropdown.buttonView.tooltip = true;

		dropdown.panelPosition = locale.uiLanguageDirection === 'rtl' ? 'se' : 'sw';
		dropdown.panelView.children.add( removeColorButton );
		dropdown.panelView.children.add( colorGrid );
		dropdown.bind( 'isEnabled' ).to( this, 'isReadOnly', value => !value );

		this._focusables.add( removeColorButton );
		this._focusables.add( colorGrid );

		this.focusTracker.add( removeColorButton.element! );
		this.focusTracker.add( colorGrid.element! );

		return dropdown;
	}

	/**
	 * Creates and configures an instance of {@link module:ui/inputtext/inputtextview~InputTextView}.
	 *
	 * @returns A configured instance to be set as {@link #inputView}.
	 */
	private _createInputTextView(): InputTextView {
		const locale = this.locale;
		const inputView = new InputTextView( locale );

		inputView.extendTemplate( {
			on: {
				blur: inputView.bindTemplate.to( 'blur' )
			}
		} );

		inputView.value = this.value;
		inputView.bind( 'isReadOnly', 'hasError' ).to( this );
		this.bind( 'isFocused', 'isEmpty' ).to( inputView );

		inputView.on( 'input', () => {
			const inputValue = inputView.element!.value;
			// Check if the value matches one of our defined colors' label.
			const mappedColor = this.options.colorDefinitions.find( def => inputValue === def.label );

			this._stillTyping = true;
			this.value = mappedColor && mappedColor.color || inputValue;
		} );

		inputView.on( 'blur', () => {
			this._stillTyping = false;
			this._setInputValue( inputView.element!.value );
		} );

		inputView.delegate( 'input' ).to( this );

		return inputView;
	}

	/**
	 * Creates and configures the button that clears the color.
	 */
	private _createRemoveColorButton() {
		const locale = this.locale!;
		const t = locale.t;
		const removeColorButton = new ButtonView( locale );
		const defaultColor = this.options.defaultColorValue || '';
		const removeColorButtonLabel = defaultColor ? t( 'Restore default' ) : t( 'Remove color' );

		removeColorButton.class = 'ck-input-color__remove-color';
		removeColorButton.withText = true;
		removeColorButton.icon = icons.eraser;
		removeColorButton.label = removeColorButtonLabel;
		removeColorButton.on( 'execute', () => {
			this.value = defaultColor;
			this.dropdownView.isOpen = false;
			this.fire( 'input' );
		} );

		return removeColorButton;
	}

	/**
	 * Creates and configures the color grid inside the {@link #dropdownView}.
	 */
	private _createColorGrid( locale: Locale ) {
		const colorGrid = new ColorGridView( locale, {
			colorDefinitions: this.options.colorDefinitions,
			columns: this.options.columns
		} );

		colorGrid.on( 'execute', ( evtData, data ) => {
			this.value = data.value;
			this.dropdownView.isOpen = false;
			this.fire( 'input' );
		} );
		colorGrid.bind( 'selectedColor' ).to( this, 'value' );

		return colorGrid;
	}

	/**
	 * Sets {@link #inputView}'s value property to the color value or color label,
	 * if there is one and the user is not typing.
	 *
	 * Handles cases like:
	 *
	 * * Someone picks the color in the grid.
	 * * The color is set from the plugin level.
	 *
	 * @param inputValue Color value to be set.
	 */
	private _setInputValue( inputValue: string ) {
		if ( !this._stillTyping ) {
			const normalizedInputValue = normalizeColor( inputValue );
			// Check if the value matches one of our defined colors.
			const mappedColor = this.options.colorDefinitions.find( def => normalizedInputValue === normalizeColor( def.color ) );

			if ( mappedColor ) {
				this.inputView.value = mappedColor.label;
			} else {
				this.inputView.value = inputValue || '';
			}
		}
	}
}

/**
 * Normalizes color value, by stripping extensive whitespace.
 * For example., transforms:
 * * `   rgb(  25 50    0 )` to `rgb(25 50 0)`,
 * * "\t  rgb(  25 ,  50,0 )		" to `rgb(25 50 0)`.
 *
 * @param colorString The value to be normalized.
 */
function normalizeColor( colorString: string ): string {
	return colorString
		// Remove any whitespace right after `(` or `,`.
		.replace( /([(,])\s+/g, '$1' )
		// Remove any whitespace at the beginning or right before the end, `)`, `,`, or another whitespace.
		.replace( /^\s+|\s+(?=[),\s]|$)/g, '' )
		// Then, replace `,` or whitespace with a single space.
		.replace( /,|\s/g, ' ' );
}
