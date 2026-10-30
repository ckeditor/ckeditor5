/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
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
} from '@ckeditor/ckeditor5-ui';
import { FocusTracker, KeystrokeHandler, type Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The view displayed in the insert image dropdown.
 *
 * See {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
 *
 * @internal
 */
export class ImageInsertFormView extends View {
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
				// Navigate form fields backwards using the ArrowUp keystroke.
				focusPrevious: 'arrowup',

				// Navigate form fields forwards using the ArrowDown key.
				focusNext: 'arrowdown'
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
