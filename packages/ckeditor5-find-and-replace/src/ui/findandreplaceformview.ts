/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
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

	createDropdown,
	addListToDropdown,
	type DropdownView,
	type Template,
	type InputView
} from 'ckeditor5/src/ui';

import {
	FocusTracker,
	KeystrokeHandler,
	Collection,
	Rect,
	isVisible,
	type Locale
} from 'ckeditor5/src/utils';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/findandreplaceform.css';

// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import previousArrow from '@ckeditor/ckeditor5-ui/theme/icons/previous-arrow.svg';
import { icons } from 'ckeditor5/src/core';

/**
 * The find and replace form view class.
 *
 * See {@link module:find-and-replace/ui/findandreplaceformview~FindAndReplaceFormView}.
 */
export default class FindAndReplaceFormView extends View {
	/**
	 * Stores the number of matched search results.
	 *
	 * @readonly
	 * @observable
	 */
	declare public matchCount: number;

	/**
	 * The offset of currently highlighted search result in {@link #matchCount matched results}.
	 *
	 * @observable
	 */
	declare public readonly highlightOffset: number;

	/**
	 * `true` when the search params (find text, options) has been changed by the user since
	 * the last time find was executed. `false` otherwise.
	 *
	 * @readonly
	 * @observable
	 */
	declare public isDirty: boolean;

	/**
	 * A live object with the aggregated `isEnabled` states of editor commands related to find and
	 * replace. For instance, it may look as follows:
	 *
	 * ```json
	 * {
	 * 	findNext: true,
	 * 	findPrevious: true,
	 * 	replace: false,
	 * 	replaceAll: false
	 * }
	 * ```
	 *
	 * @internal
	 * @observable
	 */
	declare public readonly _areCommandsEnabled: Record<string, boolean>;

	/**
	 * The content of the counter label displaying the index of the current highlighted match
	 * on top of the find input, for instance "3 of 50".
	 *
	 * @internal
	 * @readonly
	 * @observable
	 */
	declare public _resultsCounterText: string;

	/**
	 * The flag reflecting the state of the "Match case" switch button in the search options
	 * dropdown.
	 *
	 * @internal
	 * @readonly
	 * @observable
	 */
	declare public _matchCase: boolean;

	/**
	 * The flag reflecting the state of the "Whole words only" switch button in the search options
	 * dropdown.
	 *
	 * @internal
	 * @readonly
	 * @observable
	 */
	declare public _wholeWordsOnly: boolean;

	/**
	 * This flag is set `true` when some matches were found and the user didn't change the search
	 * params (text to find, options) yet. This is only possible immediately after hitting the "Find" button.
	 * `false` when there were no matches (see {@link #matchCount}) or the user changed the params (see {@link #isDirty}).
	 *
	 * It is used to control the enabled state of the replace UI (input and buttons); replacing text is only possible
	 * if this flag is `true`.
	 *
	 * @internal
	 * @observable
	 */
	declare public readonly _searchResultsFound: boolean;

	/**
	 * The find in text input view that stores the searched string.
	 *
	 * @internal
	 */
	public readonly _findInputView: LabeledFieldView<InputView>;

	/**
	 * The replace input view.
	 */
	private readonly _replaceInputView: LabeledFieldView;

	/**
	 * The find button view that initializes the search process.
	 */
	private readonly _findButtonView: ButtonView;

	/**
	 * The find previous button view.
	 */
	private readonly _findPrevButtonView: ButtonView;

	/**
	 * The find next button view.
	 */
	private readonly _findNextButtonView: ButtonView;

	/**
	 * The find options dropdown.
	 */
	private readonly _optionsDropdown: DropdownView;

	/**
	 * The replace button view.
	 */
	private readonly _replaceButtonView: ButtonView;

	/**
	 * The replace all button view.
	 */
	private readonly _replaceAllButtonView: ButtonView;

	/**
	 * The fieldset aggregating the find UI.
	 */
	private readonly _findFieldsetView: View;

	/**
	 * The fieldset aggregating the replace UI.
	 */
	private readonly _replaceFieldsetView: View;

	/**
	 * Tracks information about the DOM focus in the form.
	 */
	private readonly _focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	private readonly _keystrokes: KeystrokeHandler;

	/**
	 * A collection of views that can be focused in the form.
	 */
	private readonly _focusables: ViewCollection;

	/**
	 * Helps cycling over {@link #_focusables} in the form.
	 */
	private readonly _focusCycler: FocusCycler;

	public declare locale: Locale;

	/**
	 * Creates a view of find and replace form.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		const t = locale.t;

		this.set( 'matchCount', 0 );

		this.set( 'highlightOffset', 0 );

		this.set( 'isDirty', false );

		this.set( '_areCommandsEnabled', {} );

		this.set( '_resultsCounterText', '' );

		this.set( '_matchCase', false );

		this.set( '_wholeWordsOnly', false );

		this.bind( '_searchResultsFound' ).to(
			this, 'matchCount',
			this, 'isDirty',
			( matchCount, isDirty ) => {
				return matchCount > 0 && !isDirty;
			}
		);

		this._findInputView = this._createInputField( t( 'Find in text…' ) );

		this._replaceInputView = this._createInputField( t( 'Replace with…' ) );

		this._findButtonView = this._createButton( {
			label: t( 'Find' ),
			class: 'ck-button-find ck-button-action',
			withText: true
		} );

		this._findPrevButtonView = this._createButton( {
			label: t( 'Previous result' ),
			class: 'ck-button-prev',
			icon: previousArrow,
			keystroke: 'Shift+F3',
			tooltip: true
		} );

		this._findNextButtonView = this._createButton( {
			label: t( 'Next result' ),
			class: 'ck-button-next',
			icon: previousArrow,
			keystroke: 'F3',
			tooltip: true
		} );

		this._optionsDropdown = this._createOptionsDropdown();

		this._replaceButtonView = this._createButton( {
			label: t( 'Replace' ),
			class: 'ck-button-replace',
			withText: true
		} );

		this._replaceAllButtonView = this._createButton( {
			label: t( 'Replace all' ),
			class: 'ck-button-replaceall',
			withText: true
		} );

		this._findFieldsetView = this._createFindFieldset();

		this._replaceFieldsetView = this._createReplaceFieldset();

		this._focusTracker = new FocusTracker();

		this._keystrokes = new KeystrokeHandler();

		this._focusables = new ViewCollection();

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
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		submitHandler( { view: this } );

		this._initFocusCycling();
		this._initKeystrokeHandling();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this._focusTracker.destroy();
		this._keystrokes.destroy();
	}

	/**
	 * Focuses the fist {@link #_focusables} in the form.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Resets the form before re-appearing.
	 *
	 * It clears error messages, hides the match counter and disables the replace feature
	 * until the next hit of the "Find" button.
	 *
	 * **Note**: It does not reset inputs and options, though. This way the form works better in editors with
	 * disappearing toolbar (e.g. BalloonEditor): hiding the toolbar by accident (together with the find and replace UI)
	 * does not require filling the entire form again.
	 */
	public reset(): void {
		this._findInputView.errorText = null;
		this.isDirty = true;
	}

	/**
	 * Returns the value of the find input.
	 */
	private get _textToFind(): string {
		return ( this._findInputView.fieldView.element as HTMLInputElement ).value;
	}

	/**
	 * Returns the value of the replace input.
	 */
	private get _textToReplace() {
		return ( this._replaceInputView.fieldView.element as HTMLInputElement ).value;
	}

	/**
	 * Configures and returns the `<fieldset>` aggregating all find controls.
	 */
	private _createFindFieldset(): View {
		const locale = this.locale;
		const fieldsetView = new View( locale );

		// Typing in the find field invalidates all previous results (the form is "dirty").
		this._findInputView.fieldView.on( 'input', () => {
			this.isDirty = true;
		} );

		this._findButtonView.on( 'execute', this._onFindButtonExecute.bind( this ) );

		// Pressing prev/next buttons fires related event on the form.
		this._findPrevButtonView.delegate( 'execute' ).to( this, 'findPrevious' );
		this._findNextButtonView.delegate( 'execute' ).to( this, 'findNext' );

		// Prev/next buttons will be disabled when related editor command gets disabled.
		this._findPrevButtonView.bind( 'isEnabled' ).to( this, '_areCommandsEnabled', ( { findPrevious } ) => findPrevious );
		this._findNextButtonView.bind( 'isEnabled' ).to( this, '_areCommandsEnabled', ( { findNext } ) => findNext );

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
	 * The action performed when the {@link #_findButtonView} is pressed.
	 */
	private _onFindButtonExecute() {
		// When hitting "Find" in an empty input, an error should be displayed.
		// Also, if the form was "dirty", it should remain so.
		if ( !this._textToFind ) {
			const t = this.t!;

			this._findInputView.errorText = t( 'Text to find must not be empty.' );

			return;
		}

		// Hitting "Find" automatically clears the dirty state.
		this.isDirty = false;

		this.fire<FindNextEvent>( 'findNext', {
			searchText: this._textToFind,
			matchCase: this._matchCase,
			wholeWords: this._wholeWordsOnly
		} );
	}

	/**
	 * Configures an injects the find results counter displaying a "N of M" label of the {@link #_findInputView}.
	 */
	private _injectFindResultsCounter() {
		const locale = this.locale;
		const t = locale.t;
		const bind = this.bindTemplate;
		const resultsCounterView = new View( this.locale );

		this.bind( '_resultsCounterText' ).to( this, 'highlightOffset', this, 'matchCount',
			( highlightOffset, matchCount ) => t( '%0 of %1', [ highlightOffset, matchCount ] )
		);

		resultsCounterView.setTemplate( {
			tag: 'span',
			attributes: {
				class: [
					'ck',
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

		// The whole idea is that when the text of the counter changes, its width also increases/decreases and
		// it consumes more or less space over the input. The input, on the other hand, should adjust it's right
		// padding so its *entire* text always remains visible and available to the user.
		const updateFindInputPadding = () => {
			const inputElement = this._findInputView.fieldView.element;

			// Don't adjust the padding if the input (also: counter) were not rendered or not inserted into DOM yet.
			if ( !inputElement || !isVisible( inputElement ) ) {
				return;
			}

			const counterWidth = new Rect( resultsCounterView.element! ).width;
			const paddingPropertyName = locale.uiLanguageDirection === 'ltr' ? 'paddingRight' : 'paddingLeft';

			if ( !counterWidth ) {
				inputElement.style[ paddingPropertyName ] = '';
			} else {
				inputElement.style[ paddingPropertyName ] = `calc( 2 * var(--ck-spacing-standard) + ${ counterWidth }px )`;
			}
		};

		// Adjust the input padding when the text of the counter changes, for instance "1 of 200" is narrower than "123 of 200".
		// Using "low" priority to let the text be set by the template binding first.
		this.on( 'change:_resultsCounterText', updateFindInputPadding, { priority: 'low' } );

		// Adjust the input padding when the counter shows or hides. When hidden, there should be no padding. When it shows, the
		// padding should be set according to the text of the counter.
		// Using "low" priority to let the text be set by the template binding first.
		this.on( 'change:isDirty', updateFindInputPadding, { priority: 'low' } );

		// Put the counter element next to the <input> in the find field.
		( this._findInputView.template!.children![ 0 ] as Template ).children!.push( resultsCounterView );
	}

	/**
	 * Configures and returns the `<fieldset>` aggregating all replace controls.
	 */
	private _createReplaceFieldset(): View {
		const locale = this.locale;
		const t = locale.t;
		const fieldsetView = new View( this.locale );

		this._replaceButtonView.bind( 'isEnabled' ).to(
			this, '_areCommandsEnabled',
			this, '_searchResultsFound',
			( { replace }, resultsFound ) => replace && resultsFound );

		this._replaceAllButtonView.bind( 'isEnabled' ).to(
			this, '_areCommandsEnabled',
			this, '_searchResultsFound',
			( { replaceAll }, resultsFound ) => replaceAll && resultsFound );

		this._replaceInputView.bind( 'isEnabled' ).to(
			this, '_areCommandsEnabled',
			this, '_searchResultsFound',
			( { replace }, resultsFound ) => replace && resultsFound );

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
				searchText: this._textToFind,
				replaceText: this._textToReplace
			} );
		} );

		this._replaceAllButtonView.on( 'execute', () => {
			this.fire( 'replaceAll', {
				searchText: this._textToFind,
				replaceText: this._textToReplace
			} );

			this.focus();
		} );

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

		return fieldsetView;
	}

	/**
	 * Creates, configures and returns and instance of a dropdown allowing users to narrow
	 * the search criteria down. The dropdown has a list with switch buttons for each option.
	 */
	private _createOptionsDropdown(): DropdownView {
		const locale = this.locale;
		const t = locale.t;
		const dropdownView = createDropdown( this.locale );

		dropdownView.class = 'ck-options-dropdown';

		dropdownView.buttonView.set( {
			withText: false,
			label: t( 'Show options' ),
			icon: icons.cog,
			tooltip: true
		} );

		const matchCaseModel = new Model( {
			withText: true,
			label: t( 'Match case' ),

			// A dummy read-only prop to make it easy to tell which switch was toggled.
			_isMatchCaseSwitch: true
		} );

		const wholeWordsOnlyModel = new Model( {
			withText: true,
			label: t( 'Whole words only' )
		} );

		// Let the switches be controlled by form's observable properties.
		matchCaseModel.bind( 'isOn' ).to( this, '_matchCase' );
		wholeWordsOnlyModel.bind( 'isOn' ).to( this, '_wholeWordsOnly' );

		// Update the state of the form when a switch is toggled.
		dropdownView.on( 'execute', evt => {
			if ( ( evt.source as any )._isMatchCaseSwitch ) {
				this._matchCase = !this._matchCase;
			} else {
				this._wholeWordsOnly = !this._wholeWordsOnly;
			}

			// Toggling a switch makes the form dirty because this changes search criteria
			// just like typing text of the find input.
			this.isDirty = true;
		} );

		addListToDropdown( dropdownView, new Collection( [
			{ type: 'switchbutton', model: matchCaseModel },
			{ type: 'switchbutton', model: wholeWordsOnlyModel }
		] ) );

		return dropdownView;
	}

	/**
	 * Initializes the {@link #_focusables} and {@link #_focusTracker} to allow navigation
	 * using <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> keystrokes in the right order.
	 */
	private _initFocusCycling() {
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
			this._focusTracker.add( v.element! );
		} );
	}

	/**
	 * Initializes the keystroke handling in the form.
	 */
	private _initKeystrokeHandling() {
		const stopPropagation = ( data: Event ) => data.stopPropagation();
		const stopPropagationAndPreventDefault = ( data: Event ) => {
			data.stopPropagation();
			data.preventDefault();
		};

		// Start listening for the keystrokes coming from #element.
		this._keystrokes.listenTo( this.element! );

		// Find the next result upon F3.
		this._keystrokes.set( 'f3', event => {
			stopPropagationAndPreventDefault( event );

			this._findNextButtonView.fire( 'execute' );
		} );

		// Find the previous result upon F3.
		this._keystrokes.set( 'shift+f3', event => {
			stopPropagationAndPreventDefault( event );

			this._findPrevButtonView.fire( 'execute' );
		} );

		// Find or replace upon pressing Enter in the find and replace fields.
		this._keystrokes.set( 'enter', event => {
			const target = event.target;

			if ( target === this._findInputView.fieldView.element ) {
				if ( this._areCommandsEnabled.findNext ) {
					this._findNextButtonView.fire( 'execute' );
				} else {
					this._findButtonView.fire( 'execute' );
				}
				stopPropagationAndPreventDefault( event );
			} else if ( target === this._replaceInputView.fieldView.element && !this.isDirty ) {
				this._replaceButtonView.fire( 'execute' );
				stopPropagationAndPreventDefault( event );
			}
		} );

		// Find previous upon pressing Shift+Enter in the find field.
		this._keystrokes.set( 'shift+enter', event => {
			const target = event.target;

			if ( target !== this._findInputView.fieldView.element ) {
				return;
			}

			if ( this._areCommandsEnabled.findPrevious ) {
				this._findPrevButtonView.fire( 'execute' );
			} else {
				this._findButtonView.fire( 'execute' );
			}

			stopPropagationAndPreventDefault( event );
		} );

		// Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
		// keystroke handler would take over the key management in the URL input.
		// We need to prevent this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
		this._keystrokes.set( 'arrowright', stopPropagation );
		this._keystrokes.set( 'arrowleft', stopPropagation );
		this._keystrokes.set( 'arrowup', stopPropagation );
		this._keystrokes.set( 'arrowdown', stopPropagation );

		// Intercept the `selectstart` event, which is blocked by default because of the default behavior
		// of the DropdownView#panelView. This blocking prevents the native select all on Ctrl+A.
		this.listenTo( this._findInputView.element!, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );

		this.listenTo( this._replaceInputView.element!, 'selectstart', ( evt, domEvt ) => {
			domEvt.stopPropagation();
		}, { priority: 'high' } );
	}

	/**
	 * Creates a button view.
	 *
	 * @param options The properties of the `ButtonView`.
	 * @returns The button view instance.
	 */
	private _createButton( options: object ): ButtonView {
		const button = new ButtonView( this.locale );

		button.set( options );

		return button;
	}

	/**
	 * Creates a labeled input view.
	 *
	 * @param label The input label.
	 * @returns The labeled input view instance.
	 */
	private _createInputField( label: string ): LabeledFieldView<InputView> {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );

		labeledInput.label = label;

		return labeledInput;
	}
}

/**
 * Fired when the find next button is triggered.
 *
 * @eventName ~FindAndReplaceFormView#findNext
 * @param data The event data.
 */
export type FindNextEvent = {
	name: 'findNext';
	args: [ data?: FindNextEventData ];
};

export type FindNextEventData = FindEventBaseData & {
	matchCase: boolean;
	wholeWords: boolean;
};

/**
 * Fired when the find previous button is triggered.
 *
 * @eventName ~FindAndReplaceFormView#findPrevious
 * @param data The event data.
 */
export type FindPreviousEvent = {
	name: 'findPrevious';
	args: [ data?: FindEventBaseData ];
};

/**
 * Base type for all find/replace events.
 */
export type FindEventBaseData = {
	searchText: string;
};

/**
 * Fired when the replace button is triggered.
 *
 * @eventName ~FindAndReplaceFormView#replace
 * @param data The event data.
 */
export type ReplaceEvent = {
	name: 'replace';
	args: [ data: ReplaceEventData ];
};

export type ReplaceEventData = FindEventBaseData & {
	replaceText: string;
};

/**
 * Fired when the replaceAll button is triggered.
 *
 * @eventName ~FindAndReplaceFormView#replaceAll
 * @param data The event data.
 */
export type ReplaceAllEvent = {
	name: 'replaceAll';
	args: [ data: ReplaceEventData ];
};
