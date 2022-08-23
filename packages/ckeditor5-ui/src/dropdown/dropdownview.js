/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/dropdownview
 */

import View from '../view';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import { FocusTracker } from '@ckeditor/ckeditor5-utils';

import '../../theme/components/dropdown/dropdown.css';

import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';

/**
 * The dropdown view class. It manages the dropdown button and dropdown panel.
 *
 * In most cases, the easiest way to create a dropdown is by using the {@link module:ui/dropdown/utils~createDropdown}
 * util:
 *
 *		const dropdown = createDropdown( locale );
 *
 *		// Configure dropdown's button properties:
 *		dropdown.buttonView.set( {
 *			label: 'A dropdown',
 *			withText: true
 *		} );
 *
 *		dropdown.render();
 *
 *		dropdown.panelView.element.textContent = 'Content of the panel';
 *
 *		// Will render a dropdown with a panel containing a "Content of the panel" text.
 *		document.body.appendChild( dropdown.element );
 *
 * If you want to add a richer content to the dropdown panel, you can use the {@link module:ui/dropdown/utils~addListToDropdown}
 * and {@link module:ui/dropdown/utils~addToolbarToDropdown} helpers. See more examples in
 * {@link module:ui/dropdown/utils~createDropdown} documentation.
 *
 * If you want to create a completely custom dropdown, then you can compose it manually:
 *
 *		const button = new DropdownButtonView( locale );
 *		const panel = new DropdownPanelView( locale );
 *		const dropdown = new DropdownView( locale, button, panel );
 *
 *		button.set( {
 *			label: 'A dropdown',
 *			withText: true
 *		} );
 *
 *		dropdown.render();
 *
 *		panel.element.textContent = 'Content of the panel';
 *
 *		// Will render a dropdown with a panel containing a "Content of the panel" text.
 *		document.body.appendChild( dropdown.element );
 *
 * However, dropdown created this way will contain little behavior. You will need to implement handlers for actions
 * such as {@link module:ui/bindings/clickoutsidehandler~clickOutsideHandler clicking outside an open dropdown}
 * (which should close it) and support for arrow keys inside the panel. Therefore, unless you really know what
 * you do and you really need to do it, it is recommended to use the {@link module:ui/dropdown/utils~createDropdown} helper.
 *
 * @extends module:ui/view~View
 */
export default class DropdownView extends View {
	/**
	 * Creates an instance of the dropdown.
	 *
	 * Also see {@link #render}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {module:ui/dropdown/button/dropdownbutton~DropdownButton} buttonView
	 * @param {module:ui/dropdown/dropdownpanelview~DropdownPanelView} panelView
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
		 * **Note**: When the dropdown gets open, it will attempt to call `focus()` on the first child of its {@link #panelView}.
		 * See {@link module:ui/dropdown/utils~addToolbarToDropdown}, {@link module:ui/dropdown/utils~addListToDropdown}, and
		 * {@link module:ui/dropdown/utils~focusChildOnDropdownOpen} to learn more about focus management in dropdowns.
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
		 * (Optional) The additional CSS class set on the dropdown {@link #element}.
		 *
		 * @observable
		 * @member {String} #class
		 */
		this.set( 'class' );

		/**
		 * (Optional) The `id` attribute of the dropdown (i.e. to pair with a `<label>` element).
		 *
		 * @observable
		 * @member {String} #id
		 */
		this.set( 'id' );

		/**
		 * The position of the panel, relative to the dropdown.
		 *
		 * **Note**: When `'auto'`, the panel will use one of the remaining positions to stay
		 * in the viewport, visible to the user. The positions correspond directly to
		 * {@link module:ui/dropdown/dropdownview~DropdownView.defaultPanelPositions default panel positions}.
		 *
		 * **Note**: This value has an impact on the
		 * {@link module:ui/dropdown/dropdownpanelview~DropdownPanelView#position} property
		 * each time the panel becomes {@link #isOpen open}.
		 *
		 * @observable
		 * @default 'auto'
		 * @member {'auto'|'s'|'se'|'sw'|'sme'|'smw'|'n'|'ne'|'nw'|'nme'|'nmw'} #panelPosition
		 */
		this.set( 'panelPosition', 'auto' );

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

		/**
		 * Tracks information about the DOM focus in the dropdown.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-dropdown',
					bind.to( 'class' ),
					bind.if( 'isEnabled', 'ck-disabled', value => !value )
				],
				id: bind.to( 'id' ),
				'aria-describedby': bind.to( 'ariaDescribedById' )
			},

			children: [
				buttonView,
				panelView
			]
		} );

		buttonView.extendTemplate( {
			attributes: {
				class: [
					'ck-dropdown__button'
				],
				'data-cke-tooltip-disabled': bind.to( 'isOpen' )
			}
		} );

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
		 * For {@link #listView} It fires when a child of some {@link module:ui/list/listitemview~ListItemView}
		 * fired `execute`.
		 *
		 * For {@link #toolbarView} It fires when one of the buttons has been
		 * {@link module:ui/button/buttonview~ButtonView#event:execute executed}.
		 *
		 * **Note**: Only supported when dropdown has list view added using {@link module:ui/dropdown/utils~addListToDropdown}
		 * or {@link module:ui/dropdown/utils~addToolbarToDropdown}.
		 *
		 * @event execute
		 */
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.focusTracker.add( this.buttonView.element );
		this.focusTracker.add( this.panelView.element );

		// Toggle the dropdown when its button has been clicked.
		this.listenTo( this.buttonView, 'open', () => {
			this.isOpen = !this.isOpen;
		} );

		// Toggle the visibility of the panel when the dropdown becomes open.
		this.panelView.bind( 'isVisible' ).to( this, 'isOpen' );

		// Let the dropdown control the position of the panel. The position must
		// be updated every time the dropdown is open.
		this.on( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen ) {
				return;
			}

			// If "auto", find the best position of the panel to fit into the viewport.
			// Otherwise, simply assign the static position.
			if ( this.panelPosition === 'auto' ) {
				this.panelView.position = DropdownView._getOptimalPosition( {
					element: this.panelView.element,
					target: this.buttonView.element,
					fitInViewport: true,
					positions: this._panelPositions
				} ).name;
			} else {
				this.panelView.position = this.panelPosition;
			}
		} );

		// Listen for keystrokes coming from within #element.
		this.keystrokes.listenTo( this.element );

		const closeDropdown = ( data, cancel ) => {
			if ( this.isOpen ) {
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

	/**
	 * Returns {@link #panelView panel} positions to be used by the
	 * {@link module:utils/dom/position~getOptimalPosition `getOptimalPosition()`}
	 * utility considering the direction of the language the UI of the editor is displayed in.
	 *
	 * @type {module:utils/dom/position~Options#positions}
	 * @private
	 */
	get _panelPositions() {
		const {
			south, north,
			southEast, southWest,
			northEast, northWest,
			southMiddleEast, southMiddleWest,
			northMiddleEast, northMiddleWest
		} = DropdownView.defaultPanelPositions;

		if ( this.locale.uiLanguageDirection !== 'rtl' ) {
			return [
				southEast, southWest, southMiddleEast, southMiddleWest, south,
				northEast, northWest, northMiddleEast, northMiddleWest, north
			];
		} else {
			return [
				southWest, southEast, southMiddleWest, southMiddleEast, south,
				northWest, northEast, northMiddleWest, northMiddleEast, north
			];
		}
	}
}

/**
 * A set of positioning functions used by the dropdown view to determine
 * the optimal position (i.e. fitting into the browser viewport) of its
 * {@link module:ui/dropdown/dropdownview~DropdownView#panelView panel} when
 * {@link module:ui/dropdown/dropdownview~DropdownView#panelPosition} is set to 'auto'`.
 *
 * The available positioning functions are as follow:
 *
 * **South**
 *
 * * `south`
 *
 *			[ Button ]
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *
 * * `southEast`
 *
 *		[ Button ]
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *
 * * `southWest`
 *
 *		         [ Button ]
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *
 * * `southMiddleEast`
 *
 *		  [ Button ]
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *
 * * `southMiddleWest`
 *
 *		       [ Button ]
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *
 * **North**
 *
 * * `north`
 *
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *		    [ Button ]
 *
 * * `northEast`
 *
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *		[ Button ]
 *
 * * `northWest`
 *
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *		         [ Button ]
 *
 * * `northMiddleEast`
 *
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *		  [ Button ]
 *
 * * `northMiddleWest`
 *
 *		+-----------------+
 *		|      Panel      |
 *		+-----------------+
 *		       [ Button ]
 *
 * Positioning functions are compatible with {@link module:utils/dom/position~Position}.
 *
 * The name that position function returns will be reflected in dropdown panel's class that
 * controls its placement. See {@link module:ui/dropdown/dropdownview~DropdownView#panelPosition}
 * to learn more.
 *
 * @member {Object} module:ui/dropdown/dropdownview~DropdownView.defaultPanelPositions
 */
DropdownView.defaultPanelPositions = {
	south: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left - ( panelRect.width - buttonRect.width ) / 2,
			name: 's'
		};
	},
	southEast: buttonRect => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left,
			name: 'se'
		};
	},
	southWest: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left - panelRect.width + buttonRect.width,
			name: 'sw'
		};
	},
	southMiddleEast: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left - ( panelRect.width - buttonRect.width ) / 4,
			name: 'sme'
		};
	},
	southMiddleWest: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left - ( panelRect.width - buttonRect.width ) * 3 / 4,
			name: 'smw'
		};
	},
	north: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left - ( panelRect.width - buttonRect.width ) / 2,
			name: 'n'
		};
	},
	northEast: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left,
			name: 'ne'
		};
	},
	northWest: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left - panelRect.width + buttonRect.width,
			name: 'nw'
		};
	},
	northMiddleEast: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left - ( panelRect.width - buttonRect.width ) / 4,
			name: 'nme'
		};
	},
	northMiddleWest: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left - ( panelRect.width - buttonRect.width ) * 3 / 4,
			name: 'nmw'
		};
	}
};

/**
 * A function used to calculate the optimal position for the dropdown panel.
 *
 * @protected
 * @member {Function} module:ui/dropdown/dropdownview~DropdownView._getOptimalPosition
 */
DropdownView._getOptimalPosition = getOptimalPosition;
