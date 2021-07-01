/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/ui/findandreplaceformview
 */

import { ButtonView, FocusCycler, LabeledFieldView, createLabeledInputText, View, submitHandler, ViewCollection } from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler, uid } from 'ckeditor5/src/utils';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/findandreplaceform.css';
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import findArrowIcon from '@ckeditor/ckeditor5-ui/theme/icons/dropdown-arrow.svg';
import CheckboxView from '../ui/checkboxview';

/**
 * The find and replace form view controller class.
 *
 * See {@link module:find-and-replace/ui/findandreplaceformview~FindAndReplaceFormView}.
 *
 * @extends module:ui/view~View
 */
export default class FindAndReplaceFormView extends View {
	constructor( locale ) {
		super( locale );

		const t = locale.t;

		/**
		 * Indicates that the form is in active searching state.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #isSearching
		 */
		this.set( 'isSearching' );
		this.set( 'searchText', '' );
		this.set( 'replaceText', '' );

		/**
		 * Stores the number of matched search results.
		 *
		 * @readonly
		 * @observable
		 * @member {Number} #matchCount
		 */
		this.set( 'matchCount', null );

		/**
		 * The offset of currently highlighted search result in {@link #matchCount matched results}.
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #highlightOffset
		 */
		this.set( 'highlightOffset', null );

		/**
		 * Whether the search results counter should be visible.
		 *
		 * @private
		 * @readonly
		 * @observable
		 * @member {Boolean} #isCounterHidden
		 */
		this.set( 'isCounterHidden', true );

		/**
		 * The find in text input view that stores the searched string.
		 *
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		 */
		this.findInputView = this._createInputField( t( 'Find in text…' ) );

		/**
		 * The find button view that initializes the search process.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.findButtonView = this._createButton( t( 'Find' ), 'ck-button-find' );
		this.findButtonView.on( 'execute', () => {
			this.fire( 'findNext', {
				searchText: this.searchText,
				matchCase: this.matchCaseView.isChecked,
				wholeWords: this.matchWholeWordsView.isChecked
			} );
		} );

		/**
		 * The find previous button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.findPrevButtonView = this._createButton( t( 'Previous result' ), 'ck-button-prev', findArrowIcon, false );
		this.findPrevButtonView.on( 'execute', () => {
			this.fire( 'findPrevious' );
		} );

		/**
		 * The find next button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.findNextButtonView = this._createButton( t( 'Next result' ), 'ck-button-next', findArrowIcon, false );
		this.findNextButtonView.on( 'execute', () => {
			this.fire( 'findNext' );
		} );

		/**
		 * The replace button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.replaceButtonView = this._createButton( t( 'Replace' ), 'ck-button-replace' );
		this.replaceButtonView.on( 'execute', () => {
			this.fire( 'replace', { searchText: this.searchText, replaceText: this.replaceText } );
		} );

		/**
		 * The replace all button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.replaceAllButtonView = this._createButton( t( 'Replace all' ), 'ck-button-replaceall' );
		this.replaceAllButtonView.on( 'execute', () => {
			this.fire( 'replaceAll', { searchText: this.searchText, replaceText: this.replaceText } );
		} );

		/**
		 * The match case checkbox view.
		 *
		 * @member {module:find-and-replace/ui/checkboxview~CheckboxView}
		*/
		this.matchCaseView = this._createCheckbox( t( 'Match case' ) );

		/**
		 * The whole words only checkbox view.
		 *
		 * @member {module:find-and-replace/ui/checkboxview~CheckboxView}
		*/
		this.matchWholeWordsView = this._createCheckbox( t( 'Whole words only' ) );

		/**
		 * The replace input view.
		 *
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		 */
		this.replaceInputView = this._createInputField( t( 'Replace with…' ) );

		/**
		 * Stores gathered views related to find functionality of the feature.
		 *
		 * @member {module:ui/view~View}
		 */
		this.findView = this._createFindView();

		/**
		 * Stores gathered views related to replace functionality of the feature.
		 *
		 * @member {module:ui/view~View}
		 */
		this.replaceView = this._createReplaceView();

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

		this.bind( 'searchText' ).to( this.findInputView.fieldView, 'value' );
		this.findButtonView.bind( 'isEnabled' ).to( this.findInputView.fieldView, 'isEmpty', value => !value );
		this.bind( 'replaceText' ).to( this.replaceInputView.fieldView, 'value' );
		this.replaceButtonView.bind( 'isEnabled' ).to( this, 'isSearching' );
		this.replaceAllButtonView.bind( 'isEnabled' ).to( this, 'isSearching' );

		this.bind( 'isCounterHidden' ).to( this, 'matchCount', this, 'highlightOffset', ( matchCount, highlightOffset ) => {
			return matchCount === null || matchCount === 0 ||
				highlightOffset === null || highlightOffset === 0;
		} );

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-find-and-replace-form'
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

		const childViews = [
			this.findInputView,
			this.matchCaseView,
			this.matchWholeWordsView,
			this.findButtonView,
			this.findPrevButtonView,
			this.findNextButtonView,
			this.replaceInputView,
			this.replaceAllButtonView,
			this.replaceButtonView
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
		const stopPropagationAndPreventDefault = data => {
			data.stopPropagation();
			data.preventDefault();
		};

		this.keystrokes.set( 'f3', event => {
			stopPropagationAndPreventDefault( event );

			this.findNextButtonView.fire( 'execute' );
		} );

		this.keystrokes.set( 'shift+f3', event => {
			stopPropagationAndPreventDefault( event );

			this.findPrevButtonView.fire( 'execute' );
		} );

		this.keystrokes.set( 'enter', event => {
			// @todo: this is a bit workaroundish way to handle enter, we should work on views rather than raw DOM elements.
			const target = event.target;

			if ( target.classList.contains( 'ck-input-text' ) ) {
				if (
					target.parentElement.parentElement.parentElement.classList.contains( 'ck-find-form__wrapper' ) &&
					this.findButtonView.isEnabled
				) {
					this.findButtonView.fire( 'execute' );
					stopPropagationAndPreventDefault( event );
				} else if (
					target.parentElement.parentElement.parentElement.classList.contains( 'ck-replace-form__wrapper' ) &&
					this.replaceButtonView.isEnabled
				) {
					this.replaceButtonView.fire( 'execute' );
					stopPropagationAndPreventDefault( event );
				}
			}
		} );

		// Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
		// keystroke handler would take over the key management in the URL input.
		// We need to prevent this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
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
	 * A collection of views for the 'find' functionality of the feature
	 *
	 * @private
	 * @return {module:ui/view~View} The find view instance.
	 */

	_createFindView() {
		const findView = new View();

		const bind = this.bindTemplate;
		const t = this.locale.t;

		findView.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-find-form__wrapper',
					'ck-responsive-form',
					bind.if( 'isSearching', 'ck-is-searching' )
				],
				tabindex: '-1'
			},
			children: [
				this.findInputView,
				{ tag: 'span',
					attributes: {
						class: [
							'ck-results-counter',
							bind.if( 'isCounterHidden', 'ck-hidden' )
						]
					},
					children: [
						{
							text: bind.to( 'highlightOffset' )
						},
						t( ' of ' ),
						{
							text: bind.to( 'matchCount' )
						}
					]
				},
				{
					tag: 'div',
					attributes: {
						class: [ 'ck-find-checkboxes' ]
					},
					children: [
						this.matchCaseView,
						this.matchWholeWordsView
					]
				},
				{
					tag: 'div',
					attributes: {
						class: [
							'ck-find-buttons'
						]
					},
					children: [
						this.findButtonView,
						this.findPrevButtonView,
						this.findNextButtonView
					]
				}
			]
		} );

		return findView;
	}

	/**
	 * A collection of views for the 'replace' functionality of the feature
	 *
	 * @private
	 * @returns {module:ui/view~View} The replace view instance.
	 */
	_createReplaceView() {
		const replaceView = new View();
		const bind = this.bindTemplate;

		replaceView.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-replace-form__wrapper',
					'ck-responsive-form',
					bind.if( 'isSearching', 'ck-is-searching' )
				],
				tabindex: '-1'
			},
			children: [
				this.replaceInputView,
				{
					tag: 'div',
					attributes: {
						class: [
							'ck-replace-buttons'
						]
					},
					children: [
						this.replaceAllButtonView,
						this.replaceButtonView
					]
				}
			]
		} );
		return replaceView;
	}

	/**
	 * Creates a labeled input view.
	 *
	 * @private
	 * @param {String} infoText The input label.
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView} The labeled input view instance.
	 */
	_createInputField( infoText ) {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const inputField = labeledInput.fieldView;

		// @todo: this looks like an upstream UI bug (the fact that InputTextView#value does not get updated).
		inputField.on( 'input', () => {
			inputField.value = inputField.element.value;
		} );

		labeledInput.label = infoText;
		labeledInput.render();

		return labeledInput;
	}

	/**
	 * Creates a button view.
	 *
	 * @private
	 * @param {String} label The button label.
	 * @param {String} className The individual button CSS class name.
	 * @param {String} icon An SVG image of icon to be used in button.
	 * @param {Boolean} withText Whether the text should be shown.
	 * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
	 */
	_createButton( label, className, icon, withText = true ) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			withText
		} );

		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );

		return button;
	}

	/**
	 * Creates a view for the checkboxes.
	 *
	 * @private
	 * @param {String} label The checkbox label.
	 * @returns {module:ui/view~View} The checkbox view instance.
	 */
	_createCheckbox( label ) {
		const checkboxView = new CheckboxView( this.locale );

		checkboxView.set( {
			isVisible: true,
			tooltip: true,
			class: 'ck-find-checkboxes__box',
			id: uid(),
			label
		} );

		return checkboxView;
	}
}

/**
 * Fired when the find next button ({@link #findNextButtonView}) is triggered .
 *
 * @event findNext
 * @param {String} searchText Search text.
 */

/**
 * Fired when the find previous button ({@link #findPrevButtonView}) is triggered.
 *
 * @event findPrevious
 * @param {String} searchText Search text.
 */

/**
 * Fired when the replace button ({@link #replaceButtonView}) is triggered.
 *
 * @event replace
 * @param {String} replaceText Replacement text.
 */

/**
 * Fired when the replaceAll button ({@link #replaceAllButtonView}) is triggered.
 *
 * @event replaceAll
 * @param {String} replaceText Replacement text.
 */
