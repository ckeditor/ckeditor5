
import { ButtonView, FocusCycler, LabeledFieldView, createLabeledInputText, View, submitHandler, ViewCollection } from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';

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
		this.findPrevButtonView.on( 'execute', () => {
			this.fire( 'findPrev', { searchText: this.searchText } );
		} );

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
		this.replaceButtonView = this._createButton( t( '?' ), 'ck-button-prev', 'submit' );
		this.replaceButtonView.on( 'execute', () => {
			this.fire( 'replace', { marker: this.marker, replaceText: this.replaceText } );
		} );

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
		this.replaceView = this._createReplaceView( this.replaceAllButtonView, this.replaceButtonView, this.replaceInputView );

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

		/**
		 * Tracks information about the DOM focus in the form.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * A collection of views that can be focused in the form.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._focusables = new ViewCollection();

		/**
		  * Helps cycling over {@link #_focusables} in the form.
		  *
		  * @readonly
		  * @protected
		  * @member {module:ui/focuscycler~FocusCycler}
		  */
		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the <kbd>Tab</kbd> key.
				focusNext: 'tab'
			}
		} );
	}

	render() {
		super.render();

		submitHandler( {
			view: this
		} );

		const childViews = [
			this.findNextButtonView,
			this.findPrevButtonView,
			this.findInputView,
			this.replaceAllButtonView,
			this.replaceButtonView,
			this.replaceInputView
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );

		const stopPropagation = data => data.stopPropagation();

		// Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
		// keystroke handler would take over the key management in the URL input. We need to prevent
		// this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
		this.keystrokes.set( 'arrowright', stopPropagation );
		this.keystrokes.set( 'arrowleft', stopPropagation );
		this.keystrokes.set( 'arrowup', stopPropagation );
		this.keystrokes.set( 'arrowdown', stopPropagation );

		// Intercept the `selectstart` event, which is blocked by default because of the default behavior
		// of the DropdownView#panelView.
		this.listenTo( this.findInputView.element, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
		this.listenTo( this.replaceInputView.element, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
	}

	/**
	 * Focuses the fist {@link #_focusables} in the form.
	 */
	focus() {
		this._focusCycler.focusFirst();
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
