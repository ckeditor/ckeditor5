/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/dropdownview
 */

import View from '../view';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import '../../theme/components/dropdown/dropdown.css';

/**
 * The dropdown view class.
 *
 *		const button = new ButtonView( locale );
 *		const panel = new DropdownPanelView( locale );
 *		const dropdown = new DropdownView( locale, button, panel );
 *
 *		panel.element.textContent = 'Content of the panel';
 *		button.set( {
 *			label: 'A dropdown',
 *			withText: true
 *		} );
 *
 *		dropdown.render();
 *
 *		// Will render a dropdown with a panel containing a "Content of the panel" text.
 *		document.body.appendChild( dropdown.element );
 *
 * Also see {@link module:ui/dropdown/utils~createDropdown} to learn about dropdown creation helper.
 *
 * @extends module:ui/view~View
 */
export default class DropdownView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale, buttonView, panelView ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Button of the dropdown view. Clicking the button opens the {@link #panelView}.
		 *
		 * @readonly
		 * @member {module:ui/button/buttonview~ButtonView} #buttonView
		 */
		this.buttonView = buttonView;

		/**
		 * Panel of the dropdown. It opens when the {@link #buttonView} is
		 * {@link module:ui/button/buttonview~ButtonView#event:execute executed} (i.e. clicked).
		 *
		 * Child views can be added to the panel's `children` collection:
		 *
		 *		dropdown.panelView.children.add( childView );
		 *
		 * See {@link module:ui/dropdown/dropdownpanelview~DropdownPanelView#children} and
		 * {@link module:ui/viewcollection~ViewCollection#add}.
		 *
		 * @readonly
		 * @member {module:ui/dropdown/dropdownpanelview~DropdownPanelView} #panelView
		 */
		this.panelView = panelView;

		/**
		 * Controls whether the dropdown view is open, i.e. shows or hides the {@link #panelView panel}.
		 *
		 * @observable
		 * @member {Boolean} #isOpen
		 */
		this.set( 'isOpen', false );

		/**
		 * Controls whether the dropdown is enabled, i.e. it can be clicked and execute an action.
		 *
		 * See {@link module:ui/button/buttonview~ButtonView#isEnabled}.
		 *
		 * @observable
		 * @member {Boolean} #isEnabled
		 */
		this.set( 'isEnabled', true );

		/**
		 * Tracks information about DOM focus in the dropdown.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}. It manages
		 * keystrokes of the dropdown:
		 *
		 * * <kbd>▼</kbd> opens the dropdown,
		 * * <kbd>◀</kbd> and <kbd>Esc</kbd> closes the dropdown.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck-dropdown',
					bind.to( 'isEnabled', isEnabled => isEnabled ? '' : 'ck-disabled' )
				]
			},

			children: [
				buttonView,
				panelView
			]
		} );

		buttonView.extendTemplate( {
			attributes: {
				class: [
					'ck-dropdown__button',
				]
			}
		} );

		/**
		 * The label of the dropdown.
		 *
		 * **Note**: Only supported when dropdown was created using {@link module:ui/dropdown/utils~createDropdown}.
		 *
		 * Also see {@link module:ui/button/buttonview~ButtonView#label}.
		 *
		 * @observable
		 * @member {String} #label
		 */

		/**
		 * Controls whether the dropdown is enabled, i.e. it opens the panel when clicked.
		 *
		 * **Note**: Only supported when dropdown was created using {@link module:ui/dropdown/utils~createDropdown}.
		 *
		 * Also see {@link module:ui/button/buttonview~ButtonView#isEnabled}.
		 *
		 * @observable
		 * @member {Boolean} #isEnabled
		 */

		/**
		 * Controls whether the dropdown is "on". It makes sense when a feature it represents
		 * is currently active.
		 *
		 * **Note**: Only supported when dropdown was created using {@link module:ui/dropdown/utils~createDropdown}.
		 *
		 * Also see {@link module:ui/button/buttonview~ButtonView#isOn}.
		 *
		 * @observable
		 * @member {Boolean} #isOn
		 */

		/**
		 * (Optional) Controls whether the label of the dropdown is visible.
		 *
		 * **Note**: Only supported when dropdown was created using {@link module:ui/dropdown/utils~createDropdown}.
		 *
		 * Also see {@link module:ui/button/buttonview~ButtonView#withText}.
		 *
		 * @observable
		 * @member {Boolean} #withText
		 */

		/**
		 * (Optional) Controls the icon of the dropdown.
		 *
		 * **Note**: Only supported when dropdown was created using {@link module:ui/dropdown/utils~createDropdown}.
		 *
		 * Also see {@link module:ui/button/buttonview~ButtonView#withText}.
		 *
		 * @observable
		 * @member {Boolean} #icon
		 */

		/**
		 * Controls dropdown's toolbar direction.
		 * **Note**: Only supported when dropdown has list view added using {@link module:ui/dropdown/utils~addToolbarToDropdown}.
		 *
		 * @observable
		 * @member {Boolean} #isVertical=false
		 */

		/**
		 * A child {@link module:ui/list/listview~ListView list view} of the dropdown located
		 * in its {@link module:ui/dropdown/dropdownview~DropdownView#panelView panel}.
		 *
		 * **Note**: Only supported when dropdown has list view added using {@link module:ui/dropdown/utils~addListToDropdown}.
		 *
		 * @readonly
		 * @member {module:ui/list/listview~ListView} #listView
		 */

		/**
		 * A child toolbar of the dropdown located in the
		 * {@link module:ui/dropdown/dropdownview~DropdownView#panelView panel}.
		 *
		 * **Note**: Only supported when dropdown has list view added using {@link module:ui/dropdown/utils~addToolbarToDropdown}.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarView} #toolbarView
		 */

		/**
		 * Fired when the toolbar button or list item is executed.
		 *
		 * For {@link #listView} It fires when one of the list items has been
		 * {@link module:ui/list/listitemview~ListItemView#event:execute executed}.
		 *
		 * For {@link #toolbarView} It fires when one of the buttons has been
		 * {@link module:ui/button/buttonview~ButtonView#event:execute executed}.
		 *
		 * **Note**: Only supported when dropdown has list view added using {@link module:ui/dropdown/utils~addListToDropdown}
		 * or {@link module:ui/dropdown/utils~addToolbarToDropdown}.
		 *
		 * @event #execute
		 */
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		// Toggle the the dropdown when it's button has been clicked.
		this.listenTo( this.buttonView, 'select', () => {
			this.isOpen = !this.isOpen;
		} );

		// Toggle the visibility of the panel when the dropdown becomes open.
		this.panelView.bind( 'isVisible' ).to( this, 'isOpen' );

		// Listen for keystrokes coming from within #element.
		this.keystrokes.listenTo( this.element );

		// Register #element in the focus tracker.
		this.focusTracker.add( this.element );

		const closeDropdown = ( data, cancel ) => {
			if ( this.isOpen ) {
				this.buttonView.focus();
				this.isOpen = false;
				cancel();
			}
		};

		// Open the dropdown panel using the arrow down key, just like with return or space.
		this.keystrokes.set( 'arrowdown', ( data, cancel ) => {
			// Don't open if the dropdown is disabled or already open.
			if ( this.buttonView.isEnabled && !this.isOpen ) {
				this.isOpen = true;
				cancel();
			}
		} );

		// Block the right arrow key (until nested dropdowns are implemented).
		this.keystrokes.set( 'arrowright', ( data, cancel ) => {
			if ( this.isOpen ) {
				cancel();
			}
		} );

		// Close the dropdown using the arrow left/escape key.
		this.keystrokes.set( 'arrowleft', closeDropdown );
		this.keystrokes.set( 'esc', closeDropdown );
	}

	/**
	 * Focuses the {@link #buttonView}.
	 */
	focus() {
		this.buttonView.focus();
	}
}
