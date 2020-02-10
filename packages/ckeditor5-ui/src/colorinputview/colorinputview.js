import View from '@ckeditor/ckeditor5-ui/src/view';
import LabelView from '../label/labelview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import DropdownButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/dropdownbuttonview';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import DropdownPanelView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownpanelview';
import ColorGrid from '@ckeditor/ckeditor5-ui/src/colorgrid/colorgridview';
import '../../theme/components/colorinputview/colorinputview.css';

export default class ColorInputView extends View {
	// options?
	constructor( locale ) {
		super( locale );

		this.set( 'label' );

		this.set( 'value' );

		this.set( 'id' );

		this.set( 'placeholder' );

		this.set( 'isEnabled', false );

		this.set( 'errorText', null );

		this.set( 'ariaDescribedById' );

		this.dropdownButton = null;

		this.dropdownPanel = null;

		this.colorPicker = this._createTextInputWithDropdown( locale );

		this.label = this._createLabelView( this.id );

		const bind = this.bindTemplate;

		this.on( 'setColor:setValueFromPicker', ( evtData, data ) => {
			this.value = data.value;
			this._toggleColorPicker();
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-input',
					'ck-input-color-picker',
					'ck-labeled-view',
					bind.if( 'hasError', 'ck-error' )
				],
				id: bind.to( 'id' ),
				placeholder: bind.to( 'placeholder' ),
				readonly: bind.to( 'isEnabled', isEnabled => !isEnabled ),
				'aria-invalid': bind.if( 'hasError', true ),
				'aria-describedby': bind.to( 'ariaDescribedById' )
			},
			children: [
				this.label,
				this.colorPicker
			],
		} );
	}

	_createTextInputWithDropdown( locale ) {
		const textInput = this._createInputTextView( locale );
		const dropdown = this._createDropdownView( locale );
		const colorInputPicker = new View();

		colorInputPicker.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-dropdown__color-picker' ]
			},
			children: [
				textInput,
				dropdown,
			]
		} );

		return colorInputPicker;
	}

	_createDropdownView( locale ) {
		const bind = this.bindTemplate;
		const colorGrid = this._createColorGrid();
		const dropdownPanel = new DropdownPanelView( locale );
		const dropdownButton = new DropdownButtonView( locale );
		const colorPreview = new View();
		const removeColorButton = this._createRemoveColorButton( locale );

		colorPreview.setTemplate( {
			tag: 'span',
			attributes: {
				class: [ 'ck', 'ck-dropdown__color-picker-preview' ],
				style: {
					backgroundColor: bind.to( 'value' )
				}
			}
		} );

		dropdownButton.extendTemplate( {
			attributes: {
				class: 'ck-dropdown__color-picker-button'
			},
		} );
		dropdownButton.withArrow = false;
		dropdownButton.children.add( colorPreview );
		dropdownButton.bind( 'isEnabled' ).to( this );

		const dropdown = new DropdownView( locale, dropdownButton, dropdownPanel );

		dropdown.panelView.children.add( removeColorButton );
		dropdown.panelView.children.add( colorGrid );
		dropdown.bind( 'isEnabled' ).to( this );

		this.dropdownButton = dropdownButton;
		this.dropdownPanel = dropdownPanel;

		return dropdown;
	}

	_createInputTextView( locale ) {
		const input = new InputTextView( locale );

		input.bind( 'value' ).to( this );
		input.bind( 'isReadOnly' ).to( this, 'isEnabled', value => !value );
		input.bind( 'placeholder' ).to( this );
		input.bind( 'hasError' ).to( this, 'errorText', value => !!value );

		input.on( 'input', ( evt, input ) => {
			// UX: Make the error text disappear and disable the error indicator as the user
			// starts fixing the errors.
			this.errorText = null;

			this.fire( 'setColor:setInputValue', {
				value: input.target.value
			} );
		} );

		return input;
	}

	_createRemoveColorButton( locale ) {
		const bind = this.bindTemplate;
		const removeColor = new ButtonView( locale );
		const buttonLabel = new View();

		removeColor.extendTemplate( {
			attributes: {
				class: [ 'ck', 'ck-dropdown__color-picker-remove-color' ]
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
					this._toggleColorPicker();
				} )
			}
		} );

		removeColor.children.add( buttonLabel );

		return removeColor;
	}

	_createLabelView( id ) {
		const label = new LabelView();
		label.for = id;
		label.bind( 'text' ).to( this, 'label' );

		return label;
	}

	_createColorGrid( locale ) {
		const options = {
			colorDefinitions: [
				{
					color: 'hsl(0, 0%, 0%)',
					label: 'Black'
				},
				{
					color: 'hsl(0, 0%, 30%)',
					label: 'Dim grey'
				},
				{
					color: 'hsl(0, 0%, 60%)',
					label: 'Grey'
				},
				{
					color: 'hsl(0, 0%, 90%)',
					label: 'Light grey'
				},
				{
					color: 'hsl(0, 0%, 100%)',
					label: 'White',
					hasBorder: true
				},
				{
					color: 'hsl(0, 75%, 60%)',
					label: 'Red'
				},
				{
					color: 'hsl(30, 75%, 60%)',
					label: 'Orange'
				},
				{
					color: 'hsl(60, 75%, 60%)',
					label: 'Yellow'
				},
				{
					color: 'hsl(90, 75%, 60%)',
					label: 'Light green'
				},
				{
					color: 'hsl(120, 75%, 60%)',
					label: 'Green'
				},
				{
					color: 'hsl(150, 75%, 60%)',
					label: 'Aquamarine'
				},
				{
					color: 'hsl(180, 75%, 60%)',
					label: 'Turquoise'
				},
				{
					color: 'hsl(210, 75%, 60%)',
					label: 'Light blue'
				},
				{
					color: 'hsl(240, 75%, 60%)',
					label: 'Blue'
				},
				{
					color: 'hsl(270, 75%, 60%)',
					label: 'Purple'
				}
			],
			columns: 5
		};
		const colorGrid = new ColorGrid( locale, options );
		colorGrid.delegate( 'execute' ).to( this, 'setColor:setValueFromPicker' );
		colorGrid.bind( 'selectedColor' ).to( this, 'value' );

		return colorGrid;
	}

	_toggleColorPicker() {
		this.dropdownButton.fire( 'open' );
	}
}
