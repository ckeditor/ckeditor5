/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/ui/stylepanelview
 */

import { FocusCycler, View, ViewCollection } from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils';

import StyleGroupView from './stylegroupview';
import type StyleGridView from './stylegridview';
import type { NormalizedStyleDefinitions } from '../styleutils';

import '../../theme/stylepanel.css';

/**
 * A class representing a panel with available content styles. It renders styles in button grids, grouped
 * in categories.
 */
export default class StylePanelView extends View<HTMLDivElement> {
	/**
	 * Tracks information about DOM focus in the panel.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * A collection of panel children.
	 */
	public readonly children: ViewCollection<StyleGroupView>;

	/**
	 * A view representing block styles group.
	 */
	public readonly blockStylesGroupView: StyleGroupView;

	/**
	 * A view representing inline styles group
	 */
	public readonly inlineStylesGroupView: StyleGroupView;

	/**
	 * Array of active style names. They must correspond to the names of styles from
	 * definitions passed to the {@link #constructor}.
	 *
	 * @observable
	 */
	declare public readonly activeStyles: Array<string>;

	/**
	 * Array of enabled style names. They must correspond to the names of styles from
	 * definitions passed to the {@link #constructor}.
	 *
	 * @observable
	 */
	declare public readonly enabledStyles: Array<string>;

	/**
	 * A collection of views that can be focused in the panel.
	 */
	protected readonly _focusables: ViewCollection<StyleGridView>;

	/**
	 * Helps cycling over {@link #_focusables} in the panel.
	 */
	protected readonly _focusCycler: FocusCycler;

	/**
	 * Creates an instance of the {@link module:style/ui/stylegroupview~StyleGroupView} class.
	 *
	 * @param locale The localization services instance.
	 * @param styleDefinitions Normalized definitions of the styles.
	 */
	constructor( locale: Locale, styleDefinitions: NormalizedStyleDefinitions ) {
		super( locale );

		const t = locale.t;

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.children = this.createCollection();
		this.blockStylesGroupView = new StyleGroupView( locale, t( 'Block styles' ), styleDefinitions.block );
		this.inlineStylesGroupView = new StyleGroupView( locale, t( 'Text styles' ), styleDefinitions.inline );

		this.set( 'activeStyles', [] );
		this.set( 'enabledStyles', [] );

		this._focusables = new ViewCollection();

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

		this.blockStylesGroupView.gridView
			.bind( 'activeStyles', 'enabledStyles' )
			.to( this, 'activeStyles', 'enabledStyles' );

		this.inlineStylesGroupView.gridView
			.bind( 'activeStyles', 'enabledStyles' )
			.to( this, 'activeStyles', 'enabledStyles' );

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
	public override render(): void {
		super.render();

		// Register the views as focusable.
		this._focusables.add( this.blockStylesGroupView.gridView );
		this._focusables.add( this.inlineStylesGroupView.gridView );

		// Register the views in the focus tracker.
		this.focusTracker.add( this.blockStylesGroupView.gridView.element! );
		this.focusTracker.add( this.inlineStylesGroupView.gridView.element! );

		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * Focuses the first focusable element in the panel.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable element in the panel.
	 */
	public focusLast(): void {
		this._focusCycler.focusLast();
	}
}

/**
 * Fired when a style was selected (clicked) by the user.
 *
 * @eventName ~StylePanelView#execute
 */
export type StylePanelViewExecuteEvent = {
	name: 'execute';
	args: [];
};
