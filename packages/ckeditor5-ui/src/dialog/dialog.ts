/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dialog/dialog
 */

import { type Editor, Plugin } from '@ckeditor/ckeditor5-core';
import DialogView from './dialogview';

import '../../theme/components/dialog/dialog.css';

export default class Dialog extends Plugin {
	public readonly view: DialogView;
	private _onHide: ( ( dialog: Dialog ) => void ) | undefined;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Dialog' as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		/**
		 * TODO
		 */
		this.view = new DialogView( editor.locale );

		this.view.keystrokes.set( 'Esc', ( data, cancel ) => {
			this.hide();
			cancel();
		} );

		this.view.on( 'close', () => {
			this.hide();
		} );

		editor.ui.view.body.add( this.view );
		editor.ui.focusTracker.add( this.view.element! );
	}

	/**
	 * TODO
	 *
	 * @param childView
	 */
	public show( { onShow, onHide, className, isDraggable = false }: {
		onShow?: ( dialog: Dialog ) => void;
		onHide?: ( dialog: Dialog ) => void;
		className?: string;
		isDraggable: boolean;
	} ): void {
		this.hide();

		this.view.isVisible = true;

		this.view.addContentPart();

		if ( onShow ) {
			onShow( this );
		}

		this.view.className = className;
		this.view.isDraggable = isDraggable;
		this.view.focus();

		this._onHide = onHide;
	}

	/**
	 * TODO
	 */
	public hide(): void {
		this.editor.editing.view.focus();

		this.view.isVisible = false;
		this.view.clear();

		if ( this._onHide ) {
			this._onHide( this );
		}
	}
}
