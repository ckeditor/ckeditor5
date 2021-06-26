/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/ui/findandreplaceformview
 */

import { ButtonView, FocusCycler, LabeledFieldView, createLabeledInputText, View, submitHandler, ViewCollection } from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/findandreplaceform.css';
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import findArrowIcon from '@ckeditor/ckeditor5-ui/theme/icons/dropdown-arrow.svg';

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

		this.set( 'isSearching' );
		this.set( 'searchText', '' );
		this.set( 'replaceText', '' );

		/**
		 * The find input view.
		 *
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		 */
		this.findInputView = this._createInputField( t( 'Find in text' ) );

		/**
		 * The find button view that's visible initially - pre-search.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.findButtonView = this._createButton( t( 'FIND' ), 'ck-button-find' );
		this.findButtonView.on( 'execute', () => {
			this.fire( 'findNext', { searchText: this.searchText } );
		} );

		this.findButtonView.bind( 'isEnabled' ).to( this.findInputView.fieldView, 'isEmpty', value => !value );

		/**
		 * The find previous button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.findPrevButtonView = this._createButton( '', 'ck-button-prev', findArrowIcon );
		this.findPrevButtonView.on( 'execute', () => {
			this.fire( 'findPrev' );
		} );

		/**
		 * The find next button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.findNextButtonView = this._createButton( '', 'ck-button-next', findArrowIcon );
		this.findNextButtonView.on( 'execute', () => {
			this.fire( 'findNext' );
		} );

		/**
		 * The replace button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.replaceButtonView = this._createButton( t( 'REPLACE' ), 'ck-button-replace' );
		this.replaceButtonView.on( 'execute', () => {
			this.fire( 'replace', { searchText: this.searchText, replaceText: this.replaceText } );
		} );

		this.replaceButtonView.bind( 'isEnabled' ).to( this, 'isSearching' );

		/**
		 * The replace all button view.
		 *
		 * @member {module:ui/button/buttonview~ButtonView}
		 */
		this.replaceAllButtonView = this._createButton( t( 'REPLACE ALL' ), 'ck-button-replaceall' );
		this.replaceAllButtonView.on( 'execute', () => {
			this.fire( 'replaceAll', { searchText: this.searchText, replaceText: this.replaceText } );
		} );

		this.replaceAllButtonView.bind( 'isEnabled' ).to( this, 'isSearching' );

		/**
		 * Match case checkbox view
		 *
		 * @member {module:ui/view~View}
		*/
		this.matchCaseCheckbox = this._createCheckbox( 'matchcase', t( 'Match case' ) );

		/**
		 * Whole words only checkbox view
		 *
		 * @member {module:ui/view~View}
		*/
		this.matchWholeWordsCheckbox = this._createCheckbox( 'wholewords', t( 'Whole words only' ) );

		/**
		 * The replace input view.
		 *
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		 */
		this.replaceInputView = this._createInputField( t( 'Replace with' ) );

		/**
		 * Stores gathered views related to find functionality of the feature
		 *
		 * @member {module:ui/view~View}
		 */
		// eslint-disable-next-line max-len
		this.findView = this._createFindView( this.findInputView, this.matchCaseCheckbox, this.matchWholeWordsCheckbox, this.findButtonView, this.findNextButtonView, this.findPrevButtonView );

		/**
		 * Stores gathered views related to replace functionality of the feature
		 *
		 * @member {module:ui/view~View}
		 */
		this.replaceView = this._createReplaceView( this.replaceInputView, this.replaceButtonView, this.replaceAllButtonView );

		this.bind( 'searchText' ).to( this.findInputView.fieldView, 'value' );
		this.bind( 'replaceText' ).to( this.replaceInputView.fieldView, 'value' );

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
			this.findInputView,
			this.matchCaseCheckbox,
			this.matchWholeWordsCheckbox,
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
	 * Collection of views for the 'find' functionality of the feature
	 *
	 * @private
	 * @param {module:ui/labeledfield/labeledfieldview~LabeledFieldView} InputView Find input view.
	 * @param {module:ui/view~View} matchCaseCheckbox Match case checkbox view.
	 * @param {module:ui/view~View} matchWholeWordsCheckbox Whole words only checkbox view.
	 * @param {module:ui/button/buttonview~ButtonView} findButtonView Find button view that's visible initially - pre-search.
	 * @param {module:ui/button/buttonview~ButtonView} findNextButtonView Find next button view.
	 * @param {module:ui/button/buttonview~ButtonView} findPrevButtonView Find previous button view.
	 * @return {module:ui/view~View} The find view instance.
	 */

	_createFindView( InputView, matchCaseCheckbox, matchWholeWordsCheckbox, findButtonView, findNextButtonView, findPrevButtonView ) {
		const findView = new View();

		const bind = this.bindTemplate;
		const t = this.locale.t;

		this.set( 'matchCount', null );
		this.set( 'highlightOffset', null );
		this.set( 'isCounterHidden', true );

		this.bind( 'isCounterHidden' ).to( this, 'matchCount', this, 'highlightOffset', ( matchCount, highlightOffset ) => {
			return matchCount === null || matchCount === 0 ||
				highlightOffset === null || highlightOffset === 0;
		} );

		findView.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-find-form__wrapper',
					'ck-responsive-form',
					bind.if( 'isSearching', 'ck-is-searching' )
					// 'isDisabled'
				],
				tabindex: '-1'
			},
			children: [
				InputView,
				{ tag: 'span',
					attributes: {
						class: [
							'ck-results-found-counter',
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
						matchCaseCheckbox,
						matchWholeWordsCheckbox
					]
				},
				{
					tag: 'div',
					attributes: {
						class: [
							'ck-find-buttons'
						],
						tabindex: '-1'
					},
					children: [
						findButtonView,
						findPrevButtonView,
						findNextButtonView
					]
				}
			]
		} );

		return findView;
	}

	/**
	 * Collection of views for the 'replace' functionality of the feature
	 *
	 * @private
	 * @param {module:ui/labeledfield/labeledfieldview~LabeledFieldView} InputView Replace input view.
	 * @param {module:ui/button/buttonview~ButtonView} replaceButtonView Replace button view.
	 * @param {module:ui/button/buttonview~ButtonView} replaceAllButtonView Replace all button view.
	 * @returns {module:ui/view~View} The replace view instance.
	 */
	_createReplaceView( InputView, replaceButtonView, replaceAllButtonView ) {
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
				InputView,
				{
					tag: 'div',
					attributes: {
						class: [
							'ck-replace-buttons'
						]
					},
					children: [
						replaceAllButtonView,
						replaceButtonView
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
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView} Labeled input view instance.
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
	 * @param {Object} findArrowIcon SVG image for icon usage.
	 * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
	 */
	_createButton( label, className, findArrowIcon ) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon: findArrowIcon,
			withText: true
		} );

		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );

		return button;
	}

	/**
	 * Creates a view for checkboxes.
	 *
	 * @private
	 * @param {String} checkboxId Checkbox id.
	 * @param {String} label The checkbox label.
	 * @returns {module:ui/view~View} The checkbox view instance.
	 */
	_createCheckbox( checkboxId, label ) {
		const checkboxView = new View();

		checkboxView.setTemplate( {
			tag: 'div',
			attributes: {
				class: 'ck-find-checkboxes__box'
			},
			children: [
				{
					tag: 'input',
					attributes: {
						type: 'checkbox',
						id: checkboxId,
						name: label,
						value: label
					}
				},
				{
					tag: 'label',
					attributes: {
						for: checkboxId
					}
				},
				{
					text: label
				}
			]
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
 * @event findPrev
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
