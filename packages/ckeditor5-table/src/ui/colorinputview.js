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
import '../../theme/colorinput.css';

/**
 * The color input view class.
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
	 * @param {module:ui/colorgrid/colorgrid~ColorDefinition} options.colorDefinitions
	 * @param {Number} options.columns
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
		 * The `id` attribute of the input (i.e. to pair with a `<label>` element).
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
		 * The `id` of the element describing this field, e.g. when it has
		 * some error, it helps screen readers read the error text.
		 *
		 * @observable
		 * @member {Boolean} #ariaDescribedById
		 */
		this.set( 'ariaDescribedById' );

		/**
		 * Cached reference to the options passed to the constructor.
		 *
		 * @member {Object}
		 */
		this._options = options;

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
		 * @member {module:ui/dropdown/dropdown~DropdownView}
		 */
		this._inputView = this._createInputTextView( locale );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-input-color-picker',
					bind.if( 'hasError', 'ck-error' )
				],
				id: bind.to( 'id' ),
				'aria-invalid': bind.if( 'hasError', true ),
				'aria-describedby': bind.to( 'ariaDescribedById' )
			},
			children: [
				this._inputView,
				this._dropdownView
			],
		} );
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
					'ck-dropdown__color-picker-preview'
				],
				style: {
					backgroundColor: bind.to( 'value' )
				}
			}
		} );

		dropdown.buttonView.extendTemplate( {
			attributes: {
				class: 'ck-dropdown__color-picker-button'
			},
		} );

		dropdown.buttonView.children.add( colorPreview );

		dropdown.panelPosition = 'sw';
		dropdown.panelView.children.add( removeColorButton );
		dropdown.panelView.children.add( colorGrid );
		dropdown.bind( 'isEnabled' ).to( this, 'isReadOnly', value => !value );

		return dropdown;
	}

	/**
	 * Creates and configures the {@link #_inputView}.
	 *
	 * @private
	 */
	_createInputTextView() {
		const locale = this.locale;
		const input = new InputTextView( locale );

		input.bind( 'value' ).to( this );
		input.bind( 'isReadOnly' ).to( this );
		input.bind( 'hasError' ).to( this );

		input.on( 'input', () => {
			this.value = input.element.value;
		} );

		input.delegate( 'input' ).to( this );

		return input;
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

		removeColorButton.class = 'ck-dropdown__color-picker-remove-color';
		removeColorButton.withText = true;
		removeColorButton.label = t( 'Remove color' );
		removeColorButton.on( 'execute', () => {
			this.value = '';
			this._dropdownView.isOpen = false;
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
			colorDefinitions: this._options.colorDefinitions,
			columns: this._options.columns
		} );

		colorGrid.on( 'execute', ( evtData, data ) => {
			this.value = data.value;
			this._dropdownView.isOpen = false;
			this.fire( 'input' );
		} );

		colorGrid.bind( 'selectedColor' ).to( this, 'value' );

		return colorGrid;
	}
}
