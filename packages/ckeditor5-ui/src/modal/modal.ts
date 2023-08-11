/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/modal/modal
 */

import { type Editor, Plugin } from '@ckeditor/ckeditor5-core';
import ModalView from './modalview';

import '../../theme/components/modal/modal.css';

export default class Modal extends Plugin {
	public readonly view: ModalView;
	private _onHide: ( ( modal: Modal ) => void ) | undefined;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Modal' as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		/**
		 * TODO
		 */
		this.view = new ModalView( editor.locale );

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
		onShow?: ( modal: Modal ) => void;
		onHide?: ( modal: Modal ) => void;
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
