/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dialog/dialogactionsview
 */

import {
	FocusTracker,
	KeystrokeHandler,
	type Locale
} from '@ckeditor/ckeditor5-utils';
import type { default as Button, ButtonExecuteEvent } from '../button/button.js';
import ButtonView from '../button/buttonview.js';
import View from '../view.js';
import ViewCollection from '../viewcollection.js';
import FocusCycler, { type FocusableView } from '../focuscycler.js';

import '../../theme/components/dialog/dialogactions.css';

/**
 * A dialog actions view class. It contains button views which are used to execute dialog actions.
 */
export default class DialogActionsView extends View {
	/**
	 * A collection of button views.
	 */
	public readonly children: ViewCollection<FocusableView>;

	/**
	 * A keystroke handler instance.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * A focus cycler instance.
	 */
	public readonly focusCycler: FocusCycler;

	/**
	 * A focus tracker instance.
	 */
	private readonly _focusTracker: FocusTracker;

	/**
	 * A collection of focusable views.
	 */
	private readonly _focusables: ViewCollection<FocusableView>;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.children = this.createCollection<ButtonView>();
		this.keystrokes = new KeystrokeHandler();
		this._focusTracker = new FocusTracker();
		this._focusables = new ViewCollection();
		this.focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this._focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-dialog__actions'
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

		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * Creates the button views based on the given definitions.
	 * Then adds them to the {@link #children} collection and to the focus cycler.
	 */
	public setButtons( definitions: Array<DialogActionButtonDefinition> ): void {
		for ( const definition of definitions ) {
			const button = new ButtonView( this.locale );

			let property: keyof DialogActionButtonDefinition;
			button.on<ButtonExecuteEvent>( 'execute', () => definition.onExecute() );

			if ( definition.onCreate ) {
				definition.onCreate( button );
			}

			for ( property in definition ) {
				if ( property != 'onExecute' && property != 'onCreate' ) {
					button.set( property, definition[ property ] );
				}
			}

			this.children.add( button );
		}

		this._updateFocusCyclableItems();
	}

	/**
	 * @inheritDoc
	 */
	public focus( direction?: 1 | -1 ): void {
		if ( direction === -1 ) {
			this.focusCycler.focusLast();
		} else {
			this.focusCycler.focusFirst();
		}
	}

	/**
	 * Adds all elements from the {@link #children} collection to the {@link #_focusables} collection
	 * and to the {@link #_focusTracker} instance.
	 */
	private _updateFocusCyclableItems() {
		Array.from( this.children ).forEach( v => {
			this._focusables.add( v );
			this._focusTracker.add( v.element! );
		} );
	}
}

/**
 * A dialog action button definition. It is a slightly modified version
 * of the {@link module:ui/button/button~Button} definition.
 */
export type DialogActionButtonDefinition =
	Pick<Button, 'label'> &
	Partial<Pick<Button, 'withText' | 'class' | 'icon'>> &
	{
		onExecute: Function;
		onCreate?: ( button: ButtonView ) => void;
	};
