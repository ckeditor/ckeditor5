import View from '@ckeditor/ckeditor5-ui/src/view';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ColorGrid from '@ckeditor/ckeditor5-ui/src/colorgrid/colorgridview';
import '../../theme/colorinputview.css';

export default class ColorInputView extends View {
	constructor( locale, options ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'label' );

		this.set( 'value' );

		this.set( 'id' );

		this.set( 'placeholder' );

		this.set( 'isReadOnly', false );

		this.set( 'errorText', null );

		this.set( 'ariaDescribedById' );

		this._options = options;
		this._dropdownView = this._createDropdownView( locale );
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
				placeholder: bind.to( 'placeholder' ),
				'aria-invalid': bind.if( 'hasError', true ),
				'aria-describedby': bind.to( 'ariaDescribedById' )
			},
			children: [
				this._inputView,
				this._dropdownView
			],
		} );
	}

	focus() {
		this._inputView.focus();
	}

	_createDropdownView( locale ) {
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
		dropdown.bind( 'isReadOnly' ).to( this );
		dropdown.bind( 'isEnabled' ).to( this, 'isReadOnly', value => !value );

		return dropdown;
	}

	_createInputTextView( locale ) {
		const input = new InputTextView( locale );

		input.bind( 'value' ).to( this );
		input.bind( 'isReadOnly' ).to( this );
		input.bind( 'placeholder' ).to( this );
		input.bind( 'hasError' ).to( this, 'errorText', value => !!value );

		input.on( 'input', () => {
			this.value = input.element.value;
		} );

		input.delegate( 'input' ).to( this );

		return input;
	}

	_createRemoveColorButton( locale ) {
		const bind = this.bindTemplate;
		const removeColor = new ButtonView( locale );
		const buttonLabel = new View();

		removeColor.extendTemplate( {
			attributes: {
				class: [
					'ck',
					'ck-dropdown__color-picker-remove-color'
				]
			},
		} );

		buttonLabel.setTemplate( {
			tag: 'span',
			children: [
				'Remove color'
			],
			on: {
				click: bind.to( () => {
					this.value = '';
					this._dropdownView.isOpen = false;
				} )
			}
		} );

		removeColor.children.add( buttonLabel );

		return removeColor;
	}

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
