/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/ui/stylepanelview
 */

import {
	FocusCycler,
	View,
	ViewCollection
} from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';
import StyleGroupView from './stylegroupview';

import '../../theme/stylepanel.css';

/**
 * A class representing a panel with available content styles. It renders styles in button grids, grouped
 * in categories.
 *
 * @protected
 * @extends module:ui/view~View
 */
export default class StylePanelView extends View {
	/**
	 * Creates an instance of the {@link module:style/ui/stylegroupview~StyleGroupView} class.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 * @param {Object} styleDefinitions Normalized definitions of the styles.
	 * @param {Array.<module:style/style~StyleDefinition>} styleDefinitions.block Definitions of block styles.
	 * @param {Array.<module:style/style~StyleDefinition>} styleDefinitions.inline Definitions of inline styles.
	 */
	constructor( locale, styleDefinitions ) {
		super( locale );

		const t = locale.t;

		/**
		 * Tracks information about DOM focus in the panel.
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
		 * A collection of panel children.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		/**
		 * A view representing block styles group.
		 *
		 * @readonly
		 * @member {module:style/ui/stylegroupview~StyleGroupView}
		 */
		this.blockStylesGroupView = new StyleGroupView( locale, t( 'Block styles' ), styleDefinitions.block );

		/**
		 * A view representing inline styles group.
		 *
		 * @readonly
		 * @member {module:style/ui/stylegroupview~StyleGroupView}
		 */
		this.inlineStylesGroupView = new StyleGroupView( locale, t( 'Text styles' ), styleDefinitions.inline );

		/**
		 * Array of active style names. They must correspond to the names of styles from
		 * definitions passed to the {@link #constructor}.
		 *
		 * @observable
		 * @readonly
		 * @default []
		 * @member {Array.<String>} #activeStyles
		 */
		this.set( 'activeStyles', [] );

		/**
		 * Array of enabled style names. They must correspond to the names of styles from
		 * definitions passed to the {@link #constructor}.
		 *
		 * @observable
		 * @readonly
		 * @default []
		 * @member {Array.<String>} #enabledStyles
		 */
		this.set( 'enabledStyles', [] );

		/**
		 * A collection of views that can be focused in the panel.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._focusables = new ViewCollection();

		/**
		 * Helps cycling over {@link #_focusables} in the panel.
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
				// Navigate style groups backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
				focusPrevious: [ 'shift + tab' ],

				// Navigate style groups forward using the <kbd>Tab</kbd> key.
				focusNext: [ 'tab' ]
			}
		} );

		if ( styleDefinitions.block.length ) {
			this.children.add( this.blockStylesGroupView );
		}

		if ( styleDefinitions.inline.length ) {
			this.children.add( this.inlineStylesGroupView );
		}

		this.blockStylesGroupView.gridView.delegate( 'execute' ).to( this );
		this.inlineStylesGroupView.gridView.delegate( 'execute' ).to( this );

		this.blockStylesGroupView.gridView.bind( 'activeStyles', 'enabledStyles' ).to( this );
		this.inlineStylesGroupView.gridView.bind( 'activeStyles', 'enabledStyles' ).to( this );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-style-panel'
				]
			},

			children: this.children
		} );

		/**
		 * Fired when a style was selected (clicked) by the user.
		 *
		 * @event execute
		 */
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		// Register the views as focusable.
		this._focusables.add( this.blockStylesGroupView.gridView );
		this._focusables.add( this.inlineStylesGroupView.gridView );

		// Register the views in the focus tracker.
		this.focusTracker.add( this.blockStylesGroupView.gridView.element );
		this.focusTracker.add( this.inlineStylesGroupView.gridView.element );

		this.keystrokes.listenTo( this.element );
	}

	/**
	 * Focuses the first focusable element in the panel.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable element in the panel.
	 */
	focusLast() {
		this._focusCycler.focusLast();
	}
}
