/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dialog/dialogactionsview
 */

import {
	FocusTracker,
	KeystrokeHandler,
	type Locale
} from '@ckeditor/ckeditor5-utils';
import type { default as Button, ButtonExecuteEvent } from '../button/button';
import ButtonView from '../button/buttonview';
import View from '../view';
import ViewCollection from '../viewcollection';
import FocusCycler from '../focuscycler';

/**
 * TODO
 */
export default class DialogActionsView extends View {
	/**
	 * TODO
	 */
	public readonly children: ViewCollection;

	/**
	 * TODO
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * TODO
	 */
	public readonly focusCycler: FocusCycler;

	/**
	 * TODO
	 */
	private readonly _focusTracker: FocusTracker;

	/**
	 * TODO
	 */
	private readonly _focusables: ViewCollection;

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
	 * TODO
	 */
	public setButtons( definitions: Array<DialogActionButtonDefinition> ): void {
		for ( const definition of definitions ) {
			const button = new ButtonView( this.locale );

			let property: keyof DialogActionButtonDefinition;

			for ( property in definition ) {
				if ( property == 'onExecute' ) {
					button.on<ButtonExecuteEvent>( 'execute', () => definition.onExecute() );
				} else {
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
	 * TODO
	 */
	private _updateFocusCyclableItems() {
		Array.from( this.children ).forEach( v => {
			this._focusables.add( v );
			this._focusTracker.add( v.element! );
		} );
	}
}

/**
 * TODO
 */
export type DialogActionButtonDefinition =
	Pick<Button, 'label'> &
	Partial<Pick<Button, 'withText' | 'class' | 'icon'>> &
	{ onExecute: Function };
