/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/ui/colorinputview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ColorGrid from '@ckeditor/ckeditor5-ui/src/colorgrid/colorgridview';
import removeButtonIcon from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';
import '../../theme/colorinput.css';

/**
 * The color input view class. It allows the user to type in a color (hex, rgb, etc.)
 * or choose it from the configurable color palette with a preview.
 *
 * @private
 * @extends module:ui/view~View
 */
export default class ColorInputView extends View {
	/**
	 * Creates an instance of the color input view.
	 *
	 * @param {module:utils/locale~Locale} locale The locale instance.
	 * @param {Object} options The input options.
	 * @param {module:ui/colorgrid/colorgrid~ColorDefinition} options.colorDefinitions The colors to be displayed
	 * in the palette inside the input's dropdown.
	 * @param {Number} options.columns The number of columns in which the colors will be displayed.
	 */
	constructor( locale, options ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * The value of the input.
		 *
		 * @observable
		 * @member {String} #value
		 * @default ''
		 */
		this.set( 'value', '' );

		/**
		 * The `id` attribute of the input (i.e. to pair with the `<label>` element).
		 *
		 * @observable
		 * @member {String} #id
		 */
		this.set( 'id' );

		/**
		 * Controls whether the input view is in read-only mode.
		 *
		 * @observable
		 * @member {Boolean} #isReadOnly
		 * @default false
		 */
		this.set( 'isReadOnly', false );

		/**
		 * Set to `true` when the field has some error. Usually controlled via
		 * {@link module:ui/labeledinput/labeledinputview~LabeledInputView#errorText}.
		 *
		 * @observable
		 * @member {Boolean} #hasError
		 * @default false
		 */
		this.set( 'hasError', false );

		/**
		 * The `id` of the element describing this field. When the field has
		 * some error, it helps screen readers read the error text.
		 *
		 * @observable
		 * @member {Boolean} #ariaDescribedById
		 */
		this.set( 'ariaDescribedById' );

		/**
		 * A cached reference to the options passed to the constructor.
		 *
		 * @member {Object}
		 */
		this.options = options;

		/**
		 * An instance of the dropdown allowing to select a color from a grid.
		 *
		 * @protected
		 * @member {module:ui/dropdown/dropdown~DropdownView}
		 */
		this._dropdownView = this._createDropdownView( locale );

		/**
		 * An instance of the input allowing the user to type a color value.
		 *
		 * @protected
		 * @member {module:ui/inputtext/inputtextview~InputTextView}
		 */
		this._inputView = this._createInputTextView( locale );

		/**
		 * The flag that indicates whether the user is still typing.
		 * If set to true, it means that the text input field ({@link #_inputView}) still has the focus.
		 * So, we should interrupt the user by replacing the input's value.
		 *
		 * @protected
		 * @member {Boolean}
		 */
		this._stillTyping = false;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-input-color',
					bind.if( 'hasError', 'ck-error' )
				],
				id: bind.to( 'id' ),
				'aria-invalid': bind.if( 'hasError', true ),
				'aria-describedby': bind.to( 'ariaDescribedById' )
			},
			children: [
				this._inputView,
				this._dropdownView
			]
		} );

		this.on( 'change:value', ( evt, name, inputValue ) => this._setInputValue( inputValue ) );
	}

	/**
	 * Focuses the input.
	 */
	focus() {
		this._inputView.focus();
	}

	/**
	 * Creates and configures the {@link #_dropdownView}.
	 *
	 * @private
	 */
	_createDropdownView() {
		const locale = this.locale;
		const t = locale.t;
		const bind = this.bindTemplate;
		const colorGrid = this._createColorGrid( locale );
		const dropdown = createDropdown( locale );
		const colorPreview = new View();
		const removeColorButton = this._createRemoveColorButton( locale );

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
		dropdown.buttonView.tooltip = t( 'Color picker' );

		dropdown.panelPosition = locale.uiLanguageDirection === 'rtl' ? 'se' : 'sw';
		dropdown.panelView.children.add( removeColorButton );
		dropdown.panelView.children.add( colorGrid );
		dropdown.bind( 'isEnabled' ).to( this, 'isReadOnly', value => !value );

		return dropdown;
	}

	/**
	 * Creates and configures an instance of {@link module:ui/inputtext/inputtextview~InputTextView}.
	 *
	 * @private
	 * @returns {module:ui/inputtext/inputtextview~InputTextView} A configured instance to be set as {@link #_inputView}.
	 */
	_createInputTextView() {
		const locale = this.locale;
		const inputView = new InputTextView( locale );

		inputView.extendTemplate( {
			on: {
				blur: inputView.bindTemplate.to( 'blur' )
			}
		} );

		inputView.value = this.value;
		inputView.bind( 'isReadOnly' ).to( this );
		inputView.bind( 'hasError' ).to( this );

		inputView.on( 'input', () => {
			const inputValue = inputView.element.value;
			// Check if the value matches one of our defined colors' label.
			const mappedColor = this.options.colorDefinitions.find( def => inputValue === def.label );

			this._stillTyping = true;
			this.value = mappedColor && mappedColor.color || inputValue;
		} );

		inputView.on( 'blur', () => {
			this._stillTyping = false;
			this._setInputValue( inputView.element.value );
		} );

		inputView.delegate( 'input' ).to( this );

		return inputView;
	}

	/**
	 * Creates and configures the button that clears the color.
	 *
	 * @private
	 */
	_createRemoveColorButton() {
		const locale = this.locale;
		const t = locale.t;
		const removeColorButton = new ButtonView( locale );

		removeColorButton.class = 'ck-input-color__remove-color';
		removeColorButton.withText = true;
		removeColorButton.icon = removeButtonIcon;
		removeColorButton.label = t( 'Remove color' );
		removeColorButton.on( 'execute', () => {
			this.value = '';
			this._dropdownView.isOpen = false;
			this.fire( 'input' );
		} );

		return removeColorButton;
	}

	/**
	 * Creates and configures the color grid inside the {@link #_dropdownView}.
	 *
	 * @private
	 */
	_createColorGrid( locale ) {
		const colorGrid = new ColorGrid( locale, {
			colorDefinitions: this.options.colorDefinitions,
			columns: this.options.columns
		} );

		colorGrid.on( 'execute', ( evtData, data ) => {
			this.value = data.value;
			this._dropdownView.isOpen = false;
			this.fire( 'input' );
		} );
		colorGrid.bind( 'selectedColor' ).to( this, 'value' );

		return colorGrid;
	}

	/**
	 * Sets {@link #_inputView}'s value property to the color value or color label,
	 * if there is one and the user is not typing.
	 *
	 * Handles cases like:
	 *
	 * * Someone picks the color in the grid.
	 * * The color is set from the plugin level.
	 *
	 * @private
	 * @param {String} inputValue Color value to be set.
	 */
	_setInputValue( inputValue ) {
		if ( !this._stillTyping ) {
			// Check if the value matches one of our defined colors.
			const mappedColor = this.options.colorDefinitions.find( def => inputValue === def.color );

			if ( mappedColor ) {
				this._inputView.value = mappedColor.label;
			} else {
				this._inputView.value = inputValue || '';
			}
		}
	}
}
