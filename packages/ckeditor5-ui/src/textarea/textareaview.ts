/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/textarea/textareaview
 */

import { Rect, type Locale, toUnit, getBorderWidths, global, CKEditorError, isVisible, ResizeObserver } from '@ckeditor/ckeditor5-utils';
import InputBase from '../input/inputbase.js';

import '../../theme/components/input/input.css';
import '../../theme/components/textarea/textarea.css';

/**
 * The textarea view class.
 *
 * ```ts
 * const textareaView = new TextareaView();
 *
 * textareaView.minRows = 2;
 * textareaView.maxRows = 10;
 *
 * textareaView.render();
 *
 * document.body.append( textareaView.element );
 * ```
 */
export default class TextareaView extends InputBase<HTMLTextAreaElement> {
	/**
	 * Specifies the visible height of a text area, in lines.
	 *
	 * @observable
	 * @default 2
	 */
	declare public minRows: number;

	/**
	 * Specifies the maximum number of rows.
	 *
	 * @observable
	 * @default 5
	 */
	declare public maxRows: number;

	/**
	 * Specifies the value of HTML attribute that indicates whether the user can resize the element.
	 *
	 * @observable
	 * @default 'none'
	*/
	declare public resize: 'both' | 'horizontal' | 'vertical' | 'none';

	/**
	 * An internal property that stores the current height of the textarea. Used for the DOM binding.
	 *
	 * @observable
	 * @default null
	 * @internal
	 */
	declare public _height: number | null;

	/**
	 * An instance of the resize observer used to detect when the view is visible or not and update
	 * its height if any changes that affect it were made while it was invisible.
	 *
	 * **Note:** Created in {@link #render}.
	 */
	private _resizeObserver: ResizeObserver | null;

	/**
	 * A flag that indicates whether the {@link #_updateAutoGrowHeight} method should be called when the view becomes
	 * visible again. See {@link #_resizeObserver}.
	 */
	private _isUpdateAutoGrowHeightPending: boolean = false;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const toPx = toUnit( 'px' );

		this.set( 'minRows', 2 );
		this.set( 'maxRows', 5 );
		this.set( '_height', null );
		this.set( 'resize', 'none' );
		this._resizeObserver = null;

		this.on( 'change:minRows', this._validateMinMaxRows.bind( this ) );
		this.on( 'change:maxRows', this._validateMinMaxRows.bind( this ) );

		const bind = this.bindTemplate;

		this.template!.tag = 'textarea';

		this.extendTemplate( {
			attributes: {
				class: [ 'ck-textarea' ],
				style: {
					height: bind.to( '_height', height => height ? toPx( height ) : null ),
					resize: bind.to( 'resize' )
				},
				rows: bind.to( 'minRows' )
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		let wasVisible: boolean = false;

		this.on( 'input', () => {
			this._updateAutoGrowHeight( true );
			this.fire<TextareaViewUpdateEvent>( 'update' );
		} );

		this.on( 'change:value', () => {
			// The content needs to be updated by the browser after the value is changed. It takes a few ms.
			global.window.requestAnimationFrame( () => {
				if ( !isVisible( this.element ) ) {
					this._isUpdateAutoGrowHeightPending = true;

					return;
				}

				this._updateAutoGrowHeight();
				this.fire<TextareaViewUpdateEvent>( 'update' );
			} );
		} );

		// It may occur that the Textarea size needs to be updated (e.g. because it's content was changed)
		// when it is not visible or detached from DOM.
		// In such case, we need to detect the moment when it becomes visible again and update its height then.
		// We're using ResizeObserver for that as it is the most reliable way to detect when the element becomes visible.
		// IntersectionObserver didn't work well with the absolute positioned containers.
		this._resizeObserver = new ResizeObserver( this.element!, evt => {
			const isVisible = !!evt.contentRect.width && !!evt.contentRect.height;

			if ( !wasVisible && isVisible && this._isUpdateAutoGrowHeightPending ) {
				// We're wrapping the auto-grow logic in RAF because otherwise there is an error thrown
				// by the browser about recursive calls to the ResizeObserver. It used to happen in unit
				// tests only, though. Since there is no risk of infinite loop here, it can stay here.
				global.window.requestAnimationFrame( () => {
					this._updateAutoGrowHeight();
					this.fire<TextareaViewUpdateEvent>( 'update' );
				} );
			}

			wasVisible = isVisible;
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		if ( this._resizeObserver ) {
			this._resizeObserver.destroy();
		}
	}

	/**
	 * @inheritDoc
	 */
	public override reset(): void {
		super.reset();

		this._updateAutoGrowHeight();
		this.fire<TextareaViewUpdateEvent>( 'update' );
	}

	/**
	 * Updates the {@link #_height} of the view depending on {@link #minRows}, {@link #maxRows}, and the current content size.
	 *
	 * **Note**: This method overrides manual resize done by the user using a handle. It's a known bug.
	 */
	private _updateAutoGrowHeight( shouldScroll?: boolean ): void {
		const viewElement = this.element!;

		if ( !viewElement.offsetParent ) {
			this._isUpdateAutoGrowHeightPending = true;

			return;
		}

		this._isUpdateAutoGrowHeightPending = false;

		const singleLineContentClone = getTextareaElementClone( viewElement, '1' );
		const fullTextValueClone = getTextareaElementClone( viewElement, viewElement.value );
		const singleLineContentStyles = singleLineContentClone.ownerDocument.defaultView!.getComputedStyle( singleLineContentClone );

		const verticalPaddings = parseFloat( singleLineContentStyles.paddingTop ) + parseFloat( singleLineContentStyles.paddingBottom );
		const borders = getBorderWidths( singleLineContentClone );
		const lineHeight = parseFloat( singleLineContentStyles.lineHeight );
		const verticalBorder = borders.top + borders.bottom;

		const singleLineAreaDefaultHeight = new Rect( singleLineContentClone ).height;
		const numberOfLines = Math.round( ( fullTextValueClone.scrollHeight - verticalPaddings ) / lineHeight );

		const maxHeight = this.maxRows * lineHeight + verticalPaddings + verticalBorder;

		// There's a --ck-ui-component-min-height CSS custom property that enforces min height of the component.
		// This min-height is relevant only when there's one line of text. Other than that, we can rely on line-height.
		const minHeight = numberOfLines === 1 ? singleLineAreaDefaultHeight : this.minRows * lineHeight + verticalPaddings + verticalBorder;

		// The size of textarea is controlled by height style instead of rows attribute because event though it is
		// a more complex solution, it is immune to the layout textarea has been rendered in (gird, flex).
		this._height = Math.min(
			Math.max(
				Math.max( numberOfLines, this.minRows ) * lineHeight + verticalPaddings + verticalBorder,
				minHeight
			),
			maxHeight
		);

		if ( shouldScroll ) {
			viewElement.scrollTop = viewElement.scrollHeight;
		}

		singleLineContentClone.remove();
		fullTextValueClone.remove();
	}

	/**
	 * Validates the {@link #minRows} and {@link #maxRows} properties and warns in the console if the configuration is incorrect.
	 */
	private _validateMinMaxRows() {
		if ( this.minRows > this.maxRows ) {
			/**
			 * The minimum number of rows is greater than the maximum number of rows.
			 *
			 * @error ui-textarea-view-min-rows-greater-than-max-rows
			 * @param {module:ui/textarea/textareaview~TextareaView} textareaView The misconfigured textarea view instance.
			 * @param {number} minRows The value of `minRows` property.
			 * @param {number} maxRows The value of `maxRows` property.
			 */
			throw new CKEditorError( 'ui-textarea-view-min-rows-greater-than-max-rows', {
				textareaView: this,
				minRows: this.minRows,
				maxRows: this.maxRows
			} );
		}
	}
}

function getTextareaElementClone( element: HTMLTextAreaElement, value: string ): HTMLTextAreaElement {
	const clone = element.cloneNode() as HTMLTextAreaElement;

	clone.style.position = 'absolute';
	clone.style.top = '-99999px';
	clone.style.left = '-99999px';
	clone.style.height = 'auto';
	clone.style.overflow = 'hidden';
	clone.style.width = element.ownerDocument.defaultView!.getComputedStyle( element ).width;
	clone.tabIndex = -1;
	clone.rows = 1;
	clone.value = value;

	element.parentNode!.insertBefore( clone, element );

	return clone;
}

/**
 * Fired every time the layout of the {@link module:ui/textarea/textareaview~TextareaView} possibly changed as a result
 * of the user input or the value change via {@link module:ui/textarea/textareaview~TextareaView#value}.
 *
 * @eventName ~TextareaView#update
 */
export type TextareaViewUpdateEvent = {
	name: 'update';
	args: [];
};
