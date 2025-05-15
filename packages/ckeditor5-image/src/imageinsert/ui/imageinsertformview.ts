/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageinsert/ui/imageinsertformview
 */

import {
	View,
	ViewCollection,
	submitHandler,
	FocusCycler,
	CollapsibleView,
	type FocusableView
} from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';

import '../../../theme/imageinsert.css';

/**
 * The view displayed in the insert image dropdown.
 *
 * See {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
 */
export default class ImageInsertFormView extends View {
	/**
	 * Tracks information about DOM focus in the form.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * A collection of views that can be focused in the form.
	 */
	protected readonly _focusables: ViewCollection<FocusableView>;

	/**
	 * Helps cycling over {@link #_focusables} in the form.
	 */
	protected readonly _focusCycler: FocusCycler;

	/**
	 * A collection of the defined integrations for inserting the images.
	 */
	private readonly children: ViewCollection<FocusableView>;

	/**
	 * Creates a view for the dropdown panel of {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
	 *
	 * @param locale The localization services instance.
	 * @param integrations An integrations object that contains components (or tokens for components) to be shown in the panel view.
	 */
	constructor( locale: Locale, integrations: Array<FocusableView> = [] ) {
		super( locale );

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this._focusables = new ViewCollection();
		this.children = this.createCollection();

		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		for ( const view of integrations ) {
			this.children.add( view );
			this._focusables.add( view );

			if ( view instanceof CollapsibleView ) {
				this._focusables.addMany( view.children );
			}
		}

		this.setTemplate( {
			tag: 'form',

			attributes: {
				class: [
					'ck',
					'ck-image-insert-form'
				],
				tabindex: -1
			},

			children: this.children
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		submitHandler( {
			view: this
		} );

		for ( const view of this._focusables ) {
			this.focusTracker.add( view.element! );
		}

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element! );

		const stopPropagation = ( data: KeyboardEvent ) => data.stopPropagation();

		// Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
		// keystroke handler would take over the key management in the URL input. We need to prevent
		// this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
		this.keystrokes.set( 'arrowright', stopPropagation );
		this.keystrokes.set( 'arrowleft', stopPropagation );
		this.keystrokes.set( 'arrowup', stopPropagation );
		this.keystrokes.set( 'arrowdown', stopPropagation );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Focuses the first {@link #_focusables focusable} in the form.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}
}
