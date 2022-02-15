/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
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
 * TODO
 *
 * @extends module:ui/view~View
 */
export default class StylePanelView extends View {
	/**
	 * @inheritDoc
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
		 * TODO
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		/**
		 * TODO
		 */
		this.blockStylesGroupView = new StyleGroupView( locale, t( 'Block styles' ), styleDefinitions.block );

		/**
		 * TODO
		 */
		this.inlineStylesGroupView = new StyleGroupView( locale, t( 'Inline styles' ), styleDefinitions.inline );

		/**
		 * TODO
		 */
		this.set( {
			activeStyles: [],
			enabledStyles: []
		} );

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
				// Navigate style buttons backwards using the ↑ or ← keystrokes.
				focusPrevious: [ 'arrowup', 'arrowleft' ],

				// Navigate style buttons forward using the Arrow ↓ or → keystrokes.
				focusNext: [ 'arrowdown', 'arrowright' ]
			}
		} );

		if ( styleDefinitions.block.length ) {
			this.children.add( this.blockStylesGroupView );
		}

		if ( styleDefinitions.inline.length ) {
			this.children.add( this.inlineStylesGroupView );
		}

		// TODO docs for #execute.
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
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		const childViews = [
			...this.blockStylesGroupView.gridView.children,
			...this.inlineStylesGroupView.gridView.children
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element );
		} );

		this.keystrokes.listenTo( this.element );
	}

	focus() {
		this._focusCycler.focusFirst();
	}

	focusLast() {
		this._focusCycler.focusLast();
	}
}
