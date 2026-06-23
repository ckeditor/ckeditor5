/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedresize/mediaembedcustomresizeui
 */

import { Plugin, type Editor, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import {
	ContextualBalloon,
	BalloonPanelView,
	clickOutsideHandler,
	CssTransitionDisablerMixin,
	type ViewWithCssTransitionDisabler
} from '@ckeditor/ckeditor5-ui';
import type { DomOptimalPositionOptions } from '@ckeditor/ckeditor5-utils';

import { getSelectedMediaViewWidget } from '../utils.js';
import { getSelectedMediaEmbedWidthInUnits } from './utils/getselectedmediaembedwidthinunits.js';
import { getSelectedMediaEmbedPossibleResizeRange } from './utils/getselectedmediaembedpossibleresizerange.js';

import {
	MediaEmbedCustomResizeFormView,
	type MediaEmbedCustomResizeFormValidatorCallback,
	type MediaEmbedCustomResizeFormViewCancelEvent,
	type MediaEmbedCustomResizeFormViewSubmitEvent
} from './ui/mediaembedcustomresizeformview.js';

/**
 * The custom resize media embed UI plugin.
 *
 * The plugin uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 */
export class MediaEmbedCustomResizeUI extends Plugin {
	/**
	 * The contextual balloon plugin instance.
	 */
	private _balloon?: ContextualBalloon;

	/**
	 * A form used to set the custom resize width.
	 */
	private _form?: MediaEmbedCustomResizeFormView & ViewWithCssTransitionDisabler;

	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependenciesOf<[ ContextualBalloon ]> {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MediaEmbedCustomResizeUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		if ( this._form ) {
			this._form.destroy();
		}
	}

	/**
	 * Creates the {@link module:media-embed/mediaembedresize/ui/mediaembedcustomresizeformview~MediaEmbedCustomResizeFormView} form.
	 */
	private _createForm( unit: string ): void {
		const editor = this.editor;

		this._balloon = this.editor.plugins.get( 'ContextualBalloon' );

		const FormViewClass = CssTransitionDisablerMixin( MediaEmbedCustomResizeFormView );

		this._form = new FormViewClass( editor.locale, unit, getFormValidators( editor ) );

		this._form.render();

		this.listenTo<MediaEmbedCustomResizeFormViewSubmitEvent>( this._form, 'submit', () => {
			if ( this._form!.isValid() ) {
				editor.execute( 'resizeMediaEmbed', {
					width: this._form!.sizeWithUnits
				} );

				this._hideForm( true );
			}
		} );

		this.listenTo( this._form.labeledInput, 'change:errorText', () => {
			editor.ui.update();
		} );

		this.listenTo<MediaEmbedCustomResizeFormViewCancelEvent>( this._form, 'cancel', () => {
			this._hideForm( true );
		} );

		clickOutsideHandler( {
			emitter: this._form,
			activator: () => this._isVisible,
			contextElements: () => [ this._balloon!.view.element! ],
			callback: () => this._hideForm()
		} );
	}

	/**
	 * Shows the {@link #_form} in the {@link #_balloon}.
	 *
	 * @internal
	 */
	public _showForm( unit: string ): void {
		if ( this._isVisible ) {
			return;
		}

		if ( !this._form ) {
			this._createForm( unit );
		}

		const editor = this.editor;
		const labeledInput = this._form!.labeledInput;

		this._form!.disableCssTransitions();
		this._form!.resetFormStatus();

		/* v8 ignore else -- @preserve */
		if ( !this._isInBalloon ) {
			this._balloon!.add( {
				view: this._form!,
				position: getBalloonPositionData( editor )
			} );
		}

		const currentParsedWidth = getSelectedMediaEmbedWidthInUnits( editor, unit );
		const initialInputValue = currentParsedWidth ? currentParsedWidth.value.toFixed( 1 ) : '';
		const possibleRange = getSelectedMediaEmbedPossibleResizeRange( editor, unit );

		labeledInput.fieldView.value = labeledInput.fieldView.element!.value = initialInputValue;

		if ( possibleRange ) {
			Object.assign( labeledInput.fieldView, {
				min: possibleRange.lower.toFixed( 1 ),
				max: Math.ceil( possibleRange.upper ).toFixed( 1 )
			} );
		}

		this._form!.labeledInput.fieldView.select();
		this._form!.enableCssTransitions();
	}

	/**
	 * Removes the {@link #_form} from the {@link #_balloon}.
	 *
	 * @param focusEditable Controls whether the editing view is focused afterwards.
	 */
	private _hideForm( focusEditable: boolean = false ): void {
		if ( !this._isInBalloon ) {
			return;
		}

		if ( this._form!.focusTracker.isFocused ) {
			this._form!.saveButtonView.focus();
		}

		this._balloon!.remove( this._form! );

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}
	}

	/**
	 * Returns `true` when the {@link #_form} is the visible view in the {@link #_balloon}.
	 */
	private get _isVisible(): boolean {
		return !!this._balloon && this._balloon.visibleView === this._form;
	}

	/**
	 * Returns `true` when the {@link #_form} is in the {@link #_balloon}.
	 */
	private get _isInBalloon(): boolean {
		return !!this._balloon && this._balloon.hasView( this._form! );
	}
}

function getBalloonPositionData( editor: Editor ): Partial<DomOptimalPositionOptions> {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;

	return {
		target: editingView.domConverter.mapViewToDom(
			getSelectedMediaViewWidget( editingView.document.selection )!
		) as HTMLElement,
		positions: [
			defaultPositions.northArrowSouth,
			defaultPositions.northArrowSouthWest,
			defaultPositions.northArrowSouthEast,
			defaultPositions.southArrowNorth,
			defaultPositions.southArrowNorthWest,
			defaultPositions.southArrowNorthEast,
			defaultPositions.viewportStickyNorth
		]
	};
}

function getFormValidators( editor: Editor ): Array<MediaEmbedCustomResizeFormValidatorCallback> {
	const t = editor.t;

	return [
		form => {
			if ( form.rawSize!.trim() === '' ) {
				return t( 'The value must not be empty.' );
			}

			if ( form.parsedSize === null ) {
				return t( 'The value should be a plain number.' );
			}
		}
	];
}
