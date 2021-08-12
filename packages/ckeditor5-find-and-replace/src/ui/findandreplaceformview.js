/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/ui/findandreplaceformview
 */

import {
	View,
	ButtonView,
	FormHeaderView,
	LabeledFieldView,

	Model,
	FocusCycler,
	createLabeledInputText,
	submitHandler,
	ViewCollection,
	injectCssTransitionDisabler,

	createDropdown,
	addListToDropdown
} from 'ckeditor5/src/ui';

import {
	FocusTracker,
	KeystrokeHandler,
	Collection,
	Rect
} from 'ckeditor5/src/utils';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/findandreplaceform.css';

// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import previousArrow from '@ckeditor/ckeditor5-ui/theme/icons/previous-arrow.svg';
import cogIcon from '../../theme/icons/cog.svg';

/**
 * The find and replace form view class.
 *
 * See {@link module:find-and-replace/ui/findandreplaceformview~FindAndReplaceFormView}.
 *
 * @extends module:ui/view~View
 */
export default class FindAndReplaceFormView extends View {
	/**
	 * Creates a view of find and replace form.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 */
	constructor( locale ) {
		super( locale );

		const t = locale.t;

		/**
		 * Stores the number of matched search results.
		 *
		 * @readonly
		 * @observable
		 * @member {Number} #matchCount
		 */
		this.set( 'matchCount', null );

		/**
		 * The offset of currently highlighted search result in {@link #matchCount matched results} or
		 * `null` if there's no highlighted result.
		 *
		 * @readonly
		 * @observable
		 * @member {Number|null} #highlightOffset
		 */
		this.set( 'highlightOffset', null );

		/**
		 * TODO
		 */
		this.set( 'areCommandsEnabled', {} );

		/**
		 * TODO
		 */
		this.set( 'isDirty', false );

		/**
		 * TODO
		 */
		this.set( '_resultsCounterText', '' );

		/**
		 * TODO
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #_matchCase
		 */
		this.set( '_matchCase', false );

		/**
		 * TODO
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #_wholeWordsOnly
		 */
		this.set( '_wholeWordsOnly', false );

		/**
		 * TODO
		 */
		this.bind( '_searchResultsFound' ).to(
			this, 'matchCount',
			this, 'isDirty',
			( matchCount, isDirty ) => {
				return matchCount > 0 && !isDirty;
			}
		);

		/**
		 * The find in text input view that stores the searched string.
		 *
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		 */
		this._findInputView = this._createInputField( t( 'Find in text…' ) );

		/**
		 * The replace input view.
		 *
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		 */
		this._replaceInputView = this._createInputField( t( 'Replace with…' ) );

		/**
		 * The find button view that initializes the search process.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this._findButtonView = this._createButton( {
			label: t( 'Find' ),
			class: 'ck-button-find ck-button-action',
			withText: true
		} );

		/**
		 * The find previous button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this._findPrevButtonView = this._createButton( {
			label: t( 'Previous result' ),
			class: 'ck-button-prev',
			icon: previousArrow,
			tooltip: true
		} );

		/**
		 * The find next button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this._findNextButtonView = this._createButton( {
			label: t( 'Next result' ),
			class: 'ck-button-next',
			icon: previousArrow,
			tooltip: true
		} );

		/**
		 * TODO
		 */
		this._optionsDropdown = this._createOptionsDropdown();

		/**
		 * The replace button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this._replaceButtonView = this._createButton( {
			label: t( 'Replace' ),
			class: 'ck-button-replace',
			withText: true
		} );

		/**
		 * The replace all button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this._replaceAllButtonView = this._createButton( {
			label: t( 'Replace all' ),
			class: 'ck-button-replaceall',
			withText: true
		} );

		/**
		 * TODO
		 */
		this._findFieldsetView = this._createFindFieldset();

		/**
		 * TODO
		 */
		this._replaceFieldsetView = this._createReplaceFieldset();

		/**
		 * Tracks information about the DOM focus in the form.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this._focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this._keystrokes = new KeystrokeHandler();

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
			focusTracker: this._focusTracker,
			keystrokeHandler: this._keystrokes,
			actions: {
				// Navigate form fields backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the <kbd>Tab</kbd> key.
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [
					'ck',
					'ck-find-and-replace-form'
				],

				tabindex: '-1'
			},
			children: [
				new FormHeaderView( locale, {
					label: t( 'Find and replace' )
				} ),
				this._findFieldsetView,
				this._replaceFieldsetView
			]
		} );

		injectCssTransitionDisabler( this );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		submitHandler( { view: this } );

		this._initFocusCycling();
		this._initKeystrokeHandling();
	}

	/**
	 * Focuses the fist {@link #_focusables} in the form.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	/**
	 * TODO
	 */
	reset() {
		this._findInputView.errorText = null;
		this.isDirty = true;
	}

	/**
	 * TODO
	 */
	get textToFind() {
		return this._findInputView.fieldView.element.value;
	}

	/**
	 * TODO
	 */
	get textToReplace() {
		return this._replaceInputView.fieldView.element.value;
	}

	/**
	 * TODO
	 *
	 * @private
	 * @returns
	 */
	_createFindFieldset() {
		const locale = this.locale;
		const fieldsetView = new View( locale );

		this._findInputView.fieldView.on( 'input', () => {
			this.isDirty = true;
		} );

		this._findButtonView.on( 'execute', this._onFindButtonExecute.bind( this ) );

		this._findPrevButtonView.delegate( 'execute' ).to( this, 'findPrevious' );
		this._findNextButtonView.delegate( 'execute' ).to( this, 'findNext' );
		this._findPrevButtonView.bind( 'isEnabled' ).to(
			this, 'areCommandsEnabled',
			( { isFindPreviousCommandEnabled } ) => isFindPreviousCommandEnabled );
		this._findNextButtonView.bind( 'isEnabled' ).to(
			this, 'areCommandsEnabled',
			( { isFindNextCommandEnabled } ) => isFindNextCommandEnabled );
		this._findNextButtonView.keystroke = 'F3';
		this._findPrevButtonView.keystroke = 'Shift+F3';

		this._injectFindResultsCounter();

		fieldsetView.setTemplate( {
			tag: 'fieldset',
			attributes: {
				class: [ 'ck', 'ck-find-and-replace-form__find' ]
			},
			children: [
				this._findInputView,
				this._findButtonView,
				this._findPrevButtonView,
				this._findNextButtonView
			]
		} );

		return fieldsetView;
	}

	/**
	 * TODO
	 */
	_injectFindResultsCounter() {
		const locale = this.locale;
		const t = locale.t;
		const bind = this.bindTemplate;
		const resultsCounterView = new View( locale );

		this.bind( '_resultsCounterText' ).to( this, 'highlightOffset', this, 'matchCount',
			( highlightOffset, matchCount ) => t( '%0 of %1', [ highlightOffset, matchCount ] )
		);

		resultsCounterView.setTemplate( {
			tag: 'span',
			attributes: {
				class: [
					'ck-results-counter',
					// The counter only makes sense when the field text corresponds to search results in the editing.
					bind.if( 'isDirty', 'ck-hidden' )
				]
			},
			children: [
				{
					text: bind.to( '_resultsCounterText' )
				}
			]
		} );

		const updateFindInputPadding = () => {
			const inputElement = this._findInputView.fieldView.element;

			if ( !inputElement ) {
				return;
			}

			const counterWidth = new Rect( resultsCounterView.element ).width;

			if ( !counterWidth ) {
				inputElement.style.paddingRight = null;
			} else {
				inputElement.style.paddingRight = `calc( 2 * var(--ck-spacing-standard) + ${ counterWidth }px )`;
			}
		};

		this.on( 'change:_resultsCounterText', updateFindInputPadding, { priority: 'low' } );
		this.on( 'change:isDirty', updateFindInputPadding, { priority: 'low' } );

		// Put the counter element next to the <input> in the find field.
		this._findInputView.template.children[ 0 ].children.push( resultsCounterView );
	}

	/**
	 * TODO
	 *
	 * @private
	 * @returns TODO
	 */
	_createReplaceFieldset() {
		const locale = this.locale;
		const t = locale.t;
		const fieldsetView = new View( locale );

		fieldsetView.setTemplate( {
			tag: 'fieldset',
			attributes: {
				class: [ 'ck', 'ck-find-and-replace-form__replace' ]
			},
			children: [
				this._replaceInputView,
				this._optionsDropdown,
				this._replaceButtonView,
				this._replaceAllButtonView
			]
		} );

		this._replaceButtonView.bind( 'isEnabled' ).to(
			this, 'areCommandsEnabled',
			this, '_searchResultsFound',
			( { isReplaceCommandEnabled }, resultsFound ) => isReplaceCommandEnabled && resultsFound );

		this._replaceAllButtonView.bind( 'isEnabled' ).to(
			this, 'areCommandsEnabled',
			this, '_searchResultsFound',
			( { isReplaceAllCommandEnabled }, resultsFound ) => isReplaceAllCommandEnabled && resultsFound );

		this._replaceInputView.bind( 'isEnabled' ).to(
			this, 'areCommandsEnabled',
			this, '_searchResultsFound',
			( { isReplaceCommandEnabled }, resultsFound ) => isReplaceCommandEnabled && resultsFound );

		this._replaceInputView.bind( 'infoText' ).to(
			this._replaceInputView, 'isEnabled',
			this._replaceInputView, 'isFocused',
			( isEnabled, isFocused ) => {
				if ( isEnabled || !isFocused ) {
					return '';
				}

				return t( 'Tip: Find some text first in order to replace it.' );
			} );

		this._replaceButtonView.on( 'execute', () => {
			this.fire( 'replace', {
				searchText: this.textToFind,
				replaceText: this.textToReplace
			} );
		} );

		this._replaceAllButtonView.on( 'execute', () => {
			this.fire( 'replaceAll', {
				searchText: this.textToFind,
				replaceText: this.textToReplace
			} );

			this.focus();
		} );

		return fieldsetView;
	}

	/**
	 * TODO
	 *
	 * @private
	 * @returns TODO
	 */
	_createOptionsDropdown() {
		const locale = this.locale;
		const t = locale.t;
		const dropdownView = createDropdown( locale );

		dropdownView.class = 'ck-options-dropdown';

		dropdownView.buttonView.set( {
			withText: false,
			label: t( 'Show options' ),
			icon: cogIcon,
			tooltip: true
		} );

		const matchCaseModel = new Model( {
			withText: true,
			label: t( 'Match case' ),

			// A dummy prop to make it easier to tell which switch was toggled.
			_isMatchCaseSwitch: true
		} );

		const wholeWordsOnlyModel = new Model( {
			withText: true,
			label: t( 'Whole words only' )
		} );

		matchCaseModel.bind( 'isOn' ).to( this, '_matchCase' );
		wholeWordsOnlyModel.bind( 'isOn' ).to( this, '_wholeWordsOnly' );

		// Update the state of the view when a toggle switch is being toggled.
		dropdownView.on( 'execute', evt => {
			if ( evt.source._isMatchCaseSwitch ) {
				this._matchCase = !this._matchCase;
			} else {
				this._wholeWordsOnly = !this._wholeWordsOnly;
			}

			this.isDirty = true;
		} );

		addListToDropdown( dropdownView, new Collection( [
			{ type: 'switchbutton', model: matchCaseModel },
			{ type: 'switchbutton', model: wholeWordsOnlyModel }
		] ) );

		return dropdownView;
	}

	/**
	 * TODO
	 *
	 * @private
	 */
	_initFocusCycling() {
		const childViews = [
			this._findInputView,
			this._findButtonView,
			this._findPrevButtonView,
			this._findNextButtonView,
			this._replaceInputView,
			this._optionsDropdown,
			this._replaceButtonView,
			this._replaceAllButtonView
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this._focusTracker.add( v.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this._keystrokes.listenTo( this.element );
	}

	/**
	 * TODO
	 *
	 * @private
	 */
	_initKeystrokeHandling() {
		const stopPropagation = data => data.stopPropagation();
		const stopPropagationAndPreventDefault = data => {
			data.stopPropagation();
			data.preventDefault();
		};

		this._keystrokes.set( 'f3', event => {
			stopPropagationAndPreventDefault( event );

			this._findNextButtonView.fire( 'execute' );
		} );

		this._keystrokes.set( 'shift+f3', event => {
			stopPropagationAndPreventDefault( event );

			this._findPrevButtonView.fire( 'execute' );
		} );

		this._keystrokes.set( 'enter', event => {
			const target = event.target;

			if ( target === this._findInputView.fieldView.element ) {
				this._findButtonView.fire( 'execute' );
				stopPropagationAndPreventDefault( event );
			} else if ( target === this._replaceInputView.fieldView.element ) {
				this._replaceButtonView.fire( 'execute' );
				stopPropagationAndPreventDefault( event );
			}
		} );

		// Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
		// keystroke handler would take over the key management in the URL input.
		// We need to prevent this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
		this._keystrokes.set( 'arrowright', stopPropagation );
		this._keystrokes.set( 'arrowleft', stopPropagation );
		this._keystrokes.set( 'arrowup', stopPropagation );
		this._keystrokes.set( 'arrowdown', stopPropagation );

		// Intercept the `selectstart` event, which is blocked by default because of the default behavior
		// of the DropdownView#panelView.
		this.listenTo( this._findInputView.element, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
		this.listenTo( this._replaceInputView.element, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
	}

	/**
	 * TODO
	 *
	 * @returns TODO
	 */
	_onFindButtonExecute() {
		if ( !this.textToFind ) {
			const t = this.t;

			this._findInputView.errorText = t( 'Text to find must not be empty.' );

			return;
		}

		this.isDirty = false;

		this.fire( 'findNext', {
			searchText: this.textToFind,
			matchCase: this._matchCase,
			wholeWords: this._wholeWordsOnly
		} );
	}

	/**
	 * Creates a button view.
	 *
	 * @private
	 * @param {Object} options The properties of the `ButtonView`.
	 * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
	 */
	_createButton( options ) {
		const button = new ButtonView( this.locale );

		button.set( options );

		return button;
	}

	/**
	 * Creates a labeled input view.
	 *
	 * @private
	 * @param {String} label The input label.
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView} The labeled input view instance.
	 */
	_createInputField( label ) {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = label;

		return labeledInput;
	}
}

/**
 * Fired when the find next button ({@link #findNextButtonView}) is triggered.
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
