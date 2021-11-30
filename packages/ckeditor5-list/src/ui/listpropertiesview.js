/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
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
	LabeledFieldView
} from 'ckeditor5/src/ui';
import {
	FocusTracker,
	KeystrokeHandler
} from 'ckeditor5/src/utils';

import { createLabeledInputNumber } from './inputnumberview';
import CollapsibleView from './collapsibleview';

import '../../theme/listproperties.css';

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
	 * @param {Object} options Options of the view
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
		 * @member {module:ui/view~View}
		 */
		this.stylesView = null;

		/**
		 * A labeled field allowing the user to set the start index of the list.
		 *
		 * **Note**: Only present when the view represents **numbered** list properties.
		 *
		 * @readonly
		 * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
		 */
		this.startIndexFieldView = null;

		/**
		 * A field allowing the user to make the edited list reversed.
		 *
		 * **Note**: Only present when the view represents **numbered** list properties.
		 *
		 * @readonly
		 * @member {module:ui/button/switchbuttonview~SwitchButtonView}
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
			for ( const styleButtonView of this.stylesView.children ) {
				// Register the view as focusable.
				this.focusables.add( styleButtonView );

				// Register the view in the focus tracker.
				this.focusTracker.add( styleButtonView.element );
			}
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
	 * @param {String} styleGridAriaLabel The accessible technology label of the grid.
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
			const collapsibleView = new CollapsibleView( this.locale, numberedPropertyViews );

			collapsibleView.set( {
				label: t( 'List properties' ),
				isCollapsed: true
			} );

			this.children.add( collapsibleView );
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
			const value = startIndexFieldView.fieldView.element.value;

			if ( value !== '' ) {
				const parsedValue = Number.parseInt( value );

				if ( parsedValue < 1 ) {
					startIndexFieldView.errorText = t( 'Start index must be greater than 0.' );
				} else {
					this.fire( 'listStart', parsedValue );
				}
			}
		} );

		return startIndexFieldView;
	}

	/**
	 * Creates the list reversed switch button.
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
}
