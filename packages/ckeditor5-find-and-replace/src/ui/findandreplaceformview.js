
import { ButtonView, LabeledFieldView, createLabeledInputText, View, submitHandler } from 'ckeditor5/src/ui';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/findandreplaceform.css';
export default class FindAndReplaceFormView extends View {
	constructor( locale ) {
		super( locale );

		const t = locale.t;

		/**
		 * The Find Previous button view.
		 */
		this.findPrevButtonView = this._createButton( t( '<' ), 'ck-button-prev', 'submit' );

		/**
		 * The Find Next button view.
		 */
		this.findNextButtonView = this._createButton( t( '>' ), 'ck-button-next', 'submit' );
		this.findNextButtonView.on( 'execute', () => {
			this.fire( 'findNext', { searchText: this.searchText } );
		} );

		/**
		 * The Replace One button view.
		 */
		this.replaceOneButtonView = this._createButton( t( '?' ), 'ck-button-prev', 'submit' );

		/**
		 * The Replace All button view.
		 */
		this.replaceAllButtonView = this._createButton( t( 'REPLACE' ), 'ck-button-next', 'submit' );
		this.replaceAllButtonView.on( 'execute', () => {
			this.fire( 'replaceAll', { replaceText: this.replaceText, searchText: this.searchText } );
		} );

		/**
		 * The Find input view.
		 */
		this.findInputView = this._createInputField( 'Find', 'Search for something you\'d like to find' );

		/**
		 * The Replace input view.
		 */
		this.replaceInputView = this._createInputField( 'Replace', 'Replace what you\'ve previously selected' );

		/**
		 * Find view config
		 */
		this.findView = this._createFindView( this.findNextButtonView, this.findPrevButtonView, this.findInputView );

		/**
		 * Replace view config
		 */
		this.replaceView = this._createReplaceView( this.replaceAllButtonView, this.replaceOneButtonView, this.replaceInputView );

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-find-and-replace-form__wrapper'
				]
			},

			children: [
				this.findView,
				this.replaceView
			]
		} );
	}

	render() {
		super.render();

		submitHandler( {
			view: this
		} );
	}

	/**
	 * Find view configuration
	 *
	 * @private
	 * @return {module:ui/view~View} The find view instance.
	 */
	_createFindView( NextInputView, PrevInputView, InputView ) {
		const findView = new View();

		findView.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-find-and-replace-form',
					'ck-responsive-form'
				],
				tabindex: '-1'
			},
			children: [
				InputView,
				PrevInputView,
				NextInputView
			]
		} );

		return findView;
	}

	/**
	 * Replace view configuration
	 *
	 * @private
	 * @returns {module:ui/view~View} The replace view instance.
	 */
	_createReplaceView( NextInputView, PrevInputView, InputView ) {
		const replaceView = new View();

		replaceView.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-find-and-replace-form',
					'ck-responsive-form'
				],
				tabindex: '-1'
			},
			children: [
				InputView,
				PrevInputView,
				NextInputView
			]
		} );
		return replaceView;
	}

	/**
	 * Creates a labeled input view.
	 *
	 * @private
	 * @param {String} labelText The input label.
	 * @param {String} infoText The additional information text.
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView} Labeled input view instance.
	 */
	_createInputField( label, infoText ) {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const inputField = labeledInput.fieldView;

		inputField.on( 'input', () => {
			if ( label === 'Find' ) {
				this.searchText = inputField.element.value;
			} else {
				this.replaceText = inputField.element.value;
			}
		} );

		labeledInput.label = label;
		labeledInput.infoText = infoText;
		labeledInput.render();

		return labeledInput;
	}

	/**
	 * Creates a button view.
	 *
	 * @private
	 * @param {String} label The button label.
	 * @param {String} icon The button icon.
	 * @param {String} className The additional button CSS class name.
	 * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
	 */
	_createButton( label, icon, className ) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			withText: true,
			tooltip: true
		} );

		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );

		return button;
	}
}
