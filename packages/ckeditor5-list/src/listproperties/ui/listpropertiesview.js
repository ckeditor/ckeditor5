/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/ui/listpropertiesview
 */

import {
	View,
	ViewCollection,
	FocusCycler,
	SwitchButtonView,
	LabeledFieldView,
	createLabeledInputNumber,
	addKeyboardHandlingForGrid
} from 'ckeditor5/src/ui';
import {
	FocusTracker,
	KeystrokeHandler,
	global
} from 'ckeditor5/src/utils';

import CollapsibleView from './collapsibleview';

import '../../../theme/listproperties.css';

/**
 * The list properties view to be displayed in the list dropdown.
 *
 * Contains a grid of available list styles and, for numbered list, also the list start index and reversed fields.
 *
 * @extends module:ui/view~View
 */
export default class ListPropertiesView extends View {
	/**
	 * Creates an instance of the list properties view.
	 *
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param {Object} options Options of the view.
	 * @param {Object.<String,Boolean>} options.enabledProperties An object containing the configuration of enabled list property names.
	 * Allows conditional rendering the sub-components of the properties view.
	 * @param {Array.<module:ui/button/buttonview~ButtonView>|null} options.styleButtonViews A list of style buttons to be rendered
	 * inside the styles grid. The grid will not be rendered when `enabledProperties` does not include the `'styles'` key.
	 * @param {String} options.styleGridAriaLabel An assistive technologies label set on the grid of styles (if the grid is rendered).
	 */
	constructor( locale, { enabledProperties, styleButtonViews, styleGridAriaLabel } ) {
		super( locale );

		const elementCssClasses = [
			'ck',
			'ck-list-properties'
		];

		/**
		 * A collection of the child views.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		/**
		 * A view that renders the grid of list styles.
		 *
		 * @readonly
		 * @member {module:ui/view~View|null}
		 */
		this.stylesView = null;

		/**
		 * A collapsible view that hosts additional list property fields ({@link #startIndexFieldView} and
		 * {@link #reversedSwitchButtonView}) to visually separate them from the {@link #stylesView grid of styles}.
		 *
		 * **Note**: Only present when:
		 * * the view represents **numbered** list properties,
		 * * and the {@link #stylesView} is rendered,
		 * * and either {@link #startIndexFieldView} or {@link #reversedSwitchButtonView} is rendered.
		 *
		 * @readonly
		 * @member {module:list/ui/collapsibleview~CollapsibleView|null}
		 */
		this.additionalPropertiesCollapsibleView = null;

		/**
		 * A labeled number field allowing the user to set the start index of the list.
		 *
		 * **Note**: Only present when the view represents **numbered** list properties.
		 *
		 * @readonly
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView|null}
		 */
		this.startIndexFieldView = null;

		/**
		 * A switch button allowing the user to make the edited list reversed.
		 *
		 * **Note**: Only present when the view represents **numbered** list properties.
		 *
		 * @readonly
		 * @member {module:ui/button/switchbuttonview~SwitchButtonView|null}
		 */
		this.reversedSwitchButtonView = null;

		/**
		 * Tracks information about the DOM focus in the view.
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
		 * A collection of views that can be focused in the properties view.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.focusables = new ViewCollection();

		/**
		 * Helps cycling over {@link #focusables} in the view.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this.focusCycler = new FocusCycler( {
			focusables: this.focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate #children backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
				focusPrevious: 'shift + tab',

				// Navigate #children forwards using the <kbd>Tab</kbd> key.
				focusNext: 'tab'
			}
		} );

		// The rendering of the styles grid is conditional. When there is no styles grid, the view will render without collapsible
		// for numbered list properties, hence simplifying the layout.
		if ( enabledProperties.styles ) {
			this.stylesView = this._createStylesView( styleButtonViews, styleGridAriaLabel );
			this.children.add( this.stylesView );
		} else {
			elementCssClasses.push( 'ck-list-properties_without-styles' );
		}

		// The rendering of the numbered list property views is also conditional. It only makes sense for the numbered list
		// dropdown. The unordered list does not have such properties.
		if ( enabledProperties.startIndex || enabledProperties.reversed ) {
			this._addNumberedListPropertyViews( enabledProperties, styleButtonViews );

			elementCssClasses.push( 'ck-list-properties_with-numbered-properties' );
		}

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: elementCssClasses
			},
			children: this.children
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		if ( this.stylesView ) {
			this.focusables.add( this.stylesView );
			this.focusTracker.add( this.stylesView.element );

			// Register the collapsible toggle button to the focus system.
			if ( this.startIndexFieldView || this.reversedSwitchButtonView ) {
				this.focusables.add( this.children.last.buttonView );
				this.focusTracker.add( this.children.last.buttonView.element );
			}

			for ( const item of this.stylesView.children ) {
				this.stylesView.focusTracker.add( item.element );
			}

			addKeyboardHandlingForGrid( {
				keystrokeHandler: this.stylesView.keystrokes,
				focusTracker: this.stylesView.focusTracker,
				gridItems: this.stylesView.children,
				// Note: The styles view has a different number of columns depending on whether the other properties
				// are enabled in the dropdown or not (https://github.com/ckeditor/ckeditor5/issues/12340)
				numberOfColumns: () => global.window
					.getComputedStyle( this.stylesView.element )
					.getPropertyValue( 'grid-template-columns' )
					.split( ' ' )
					.length
			} );
		}

		if ( this.startIndexFieldView ) {
			this.focusables.add( this.startIndexFieldView );
			this.focusTracker.add( this.startIndexFieldView.element );

			// Intercept the `selectstart` event, which is blocked by default because of the default behavior
			// of the DropdownView#panelView.
			// TODO: blocking `selectstart` in the #panelView should be configurable per–drop–down instance.
			this.listenTo( this.startIndexFieldView.element, 'selectstart', ( evt, domEvt ) => {
				domEvt.stopPropagation();
			}, { priority: 'high' } );

			const stopPropagation = data => data.stopPropagation();

			// Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
			// keystroke handler would take over the key management in the input. We need to prevent
			// this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
			this.keystrokes.set( 'arrowright', stopPropagation );
			this.keystrokes.set( 'arrowleft', stopPropagation );
			this.keystrokes.set( 'arrowup', stopPropagation );
			this.keystrokes.set( 'arrowdown', stopPropagation );
		}

		if ( this.reversedSwitchButtonView ) {
			this.focusables.add( this.reversedSwitchButtonView );
			this.focusTracker.add( this.reversedSwitchButtonView.element );
		}

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );
	}

	/**
	 * @inheritDoc
	 */
	focus() {
		this.focusCycler.focusFirst();
	}

	/**
	 * @inheritDoc
	 */
	focusLast() {
		this.focusCycler.focusLast();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Creates the list styles grid.
	 *
	 * @protected
	 * @param {Array.<module:ui/button/buttonview~ButtonView>} styleButtons Buttons to be placed in the grid.
	 * @param {String} styleGridAriaLabel The assistive technology label of the grid.
	 * @returns {module:ui/view~View}
	 */
	_createStylesView( styleButtons, styleGridAriaLabel ) {
		const stylesView = new View( this.locale );

		stylesView.children = stylesView.createCollection( this.locale );
		stylesView.children.addMany( styleButtons );

		stylesView.setTemplate( {
			tag: 'div',
			attributes: {
				'aria-label': styleGridAriaLabel,
				class: [
					'ck',
					'ck-list-styles-list'
				]
			},
			children: stylesView.children
		} );

		stylesView.children.delegate( 'execute' ).to( this );

		stylesView.focus = function() {
			this.children.first.focus();
		};

		stylesView.focusTracker = new FocusTracker();
		stylesView.keystrokes = new KeystrokeHandler();

		stylesView.render();

		stylesView.keystrokes.listenTo( stylesView.element );

		return stylesView;
	}

	/**
	 * Renders {@link #startIndexFieldView} and/or {@link #reversedSwitchButtonView} depending on the configuration of the properties view.
	 *
	 * @private
	 * @param {Object.<String,Boolean>} options.enabledProperties An object containing the configuration of enabled list property names
	 * (see {@link #constructor}).
	 */
	_addNumberedListPropertyViews( enabledProperties ) {
		const t = this.locale.t;
		const numberedPropertyViews = [];

		if ( enabledProperties.startIndex ) {
			this.startIndexFieldView = this._createStartIndexField();
			numberedPropertyViews.push( this.startIndexFieldView );
		}

		if ( enabledProperties.reversed ) {
			this.reversedSwitchButtonView = this._createReversedSwitchButton();
			numberedPropertyViews.push( this.reversedSwitchButtonView );
		}

		// When there are some style buttons, pack the numbered list properties into a collapsible to separate them.
		if ( enabledProperties.styles ) {
			this.additionalPropertiesCollapsibleView = new CollapsibleView( this.locale, numberedPropertyViews );

			this.additionalPropertiesCollapsibleView.set( {
				label: t( 'List properties' ),
				isCollapsed: true
			} );

			// Don't enable the collapsible view unless either start index or reversed field is enabled (e.g. when no list is selected).
			this.additionalPropertiesCollapsibleView.buttonView.bind( 'isEnabled' ).toMany(
				numberedPropertyViews, 'isEnabled', ( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled ) );

			// Automatically collapse the additional properties collapsible when either start index or reversed field gets disabled.
			this.additionalPropertiesCollapsibleView.buttonView.on( 'change:isEnabled', ( evt, data, isEnabled ) => {
				if ( !isEnabled ) {
					this.additionalPropertiesCollapsibleView.isCollapsed = true;
				}
			} );

			this.children.add( this.additionalPropertiesCollapsibleView );
		} else {
			this.children.addMany( numberedPropertyViews );
		}
	}

	/**
	 * Creates the list start index labeled field.
	 *
	 * @private
	 * @protected
	 * @returns {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
	 */
	_createStartIndexField() {
		const t = this.locale.t;
		const startIndexFieldView = new LabeledFieldView( this.locale, createLabeledInputNumber );

		startIndexFieldView.set( {
			label: t( 'Start at' ),
			class: 'ck-numbered-list-properties__start-index'
		} );

		startIndexFieldView.fieldView.set( {
			min: 1,
			step: 1,
			value: 1,
			inputMode: 'numeric'
		} );

		startIndexFieldView.fieldView.on( 'input', () => {
			const inputElement = startIndexFieldView.fieldView.element;
			const startIndex = inputElement.valueAsNumber;

			if ( Number.isNaN( startIndex ) ) {
				return;
			}

			if ( !inputElement.checkValidity() ) {
				startIndexFieldView.errorText = t( 'Start index must be greater than 0.' );
			} else {
				this.fire( 'listStart', { startIndex } );
			}
		} );

		return startIndexFieldView;
	}

	/**
	 * Creates the reversed list switch button.
	 *
	 * @private
	 * @protected
	 * @returns {module:ui/button/switchbuttonview~SwitchButtonView}
	 */
	_createReversedSwitchButton() {
		const t = this.locale.t;
		const reversedButtonView = new SwitchButtonView( this.locale );

		reversedButtonView.set( {
			withText: true,
			label: t( 'Reversed order' ),
			class: 'ck-numbered-list-properties__reversed-order'
		} );

		reversedButtonView.delegate( 'execute' ).to( this, 'listReversed' );

		return reversedButtonView;
	}

	/**
	 * Fired when the list start index value has changed via {@link #startIndexFieldView}.
	 *
	 * @event listStart
	 * @param {Object} data
	 * @param {Number} data.startIndex The new start index of the list.
	 */

	/**
	 * Fired when the list order has changed (reversed) via {@link #reversedSwitchButtonView}.
	 *
	 * @event listReversed
	 */
}
