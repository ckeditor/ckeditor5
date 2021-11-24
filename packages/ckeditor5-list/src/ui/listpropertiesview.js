/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { View, ViewCollection, FocusCycler } from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';
import NumberedListPropertiesView from './numberedlistpropertiesview';

import '../../theme/listproperties.css';

/**
 * TODO
 *
 * @extends module:ui/view~View
 */
export default class ListPropertiesView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale, { shouldRenderNumberedListProperties, enabledProperties, styleButtonViews, styleGridAriaLabel } ) {
		super( locale );

		const cssClasses = [
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
		 * Tracks information about the DOM focus in the view.
		 *
		 * @readonly
		 * @protected
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @protected
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * A collection of views that can be focused in the view.
		 *
		 * @readonly
		 * @protected
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

		if ( styleButtonViews ) {
			this.stylesView = this._createStylesView( styleButtonViews, styleGridAriaLabel );
			this.children.add( this.stylesView );
		}

		if ( shouldRenderNumberedListProperties ) {
			this.numberedPropertiesView = new NumberedListPropertiesView( locale, {
				enabledProperties,
				renderAsCollapsible: !!enabledProperties.styles
			} );
			this.children.add( this.numberedPropertiesView );

			cssClasses.push( 'ck-list-properties_with-numbered-properties' );
		}

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: cssClasses
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

		if ( this.numberedPropertiesView ) {
			for ( const fieldView of this.numberedPropertiesView.focusables ) {
				// Register the view as focusable.
				this.focusables.add( fieldView );

				// Register the view in the focus tracker.
				this.focusTracker.add( fieldView.element );
			}
		}

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );
	}

	focus() {
		this.focusCycler.focusFirst();
	}

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
	 * TODO
	 */
	_createStylesView( styleButtons, styleGridAriaLabel ) {
		// TODO: ListView?
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
}
