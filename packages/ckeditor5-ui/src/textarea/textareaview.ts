/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/textarea/textareaview
 */

import { Rect, type Locale, toUnit, getBorderWidths, CKEditorError, global } from '@ckeditor/ckeditor5-utils';
import InputBase from '../input/inputbase';

import '../../theme/components/input/input.css';

/**
 * The textarea view class.
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
	 * TODO
	 *
	 * @observable
	 * @default 'both'
	*/
	declare public resize: 'both' | 'horizontal' | 'vertical' | 'none';

	/**
	 * TODO
	 *
	 * @observable
	 * @default null
	 * @internal
	 */
	declare public _height: number | null;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const toPx = toUnit( 'px' );

		this.set( 'minRows', 2 );
		this.set( 'maxRows', 5 );
		this.set( '_height', null );
		this.set( 'resize', 'both' );

		this.on( 'change:minRows', this._validateMinMaxRows.bind( this ) );
		this.on( 'change:maxRows', this._validateMinMaxRows.bind( this ) );

		const bind = this.bindTemplate;

		this.template!.tag = 'textarea';

		this.extendTemplate( {
			attributes: {
				style: {
					height: bind.to( '_height', height => height ? toPx( height ) : null ),
					resize: bind.to( 'resize' )
				},
				rows: bind.to( 'minRows' )
			}
		} );
	}

	/**
	 * TODO
	 */
	public override render(): void {
		super.render();

		this.on( 'input', () => {
			this._updateAutoGrowHeight( true );
		} );

		this.on( 'change:value', () => {
			// The content needs to be updated by the browser after the value is changed. It takes a few ms.
			global.window.requestAnimationFrame( () => this._updateAutoGrowHeight() );
		} );
	}

	/**
	 * TODO
	 */
	public override reset(): void {
		super.reset();

		this._updateAutoGrowHeight();
	}

	/**
	 * TODO
	 */
	private _updateAutoGrowHeight( shouldScroll?: boolean ): void {
		const viewElement = this.element!;
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
	 * TODO
	 */
	private _validateMinMaxRows() {
		if ( this.minRows > this.maxRows ) {
			/**
			 * The minimum number of rows is greater than the maximum number of rows.
			 *
			 * @error ui-textarea-view-min-rows-greater-than-max-rows
			 */
			throw new CKEditorError( 'ui-textarea-view-min-rows-greater-than-max-rows', [ this ] );
		}
	}
}

function getTextareaElementClone( element: HTMLTextAreaElement, value: string ): HTMLTextAreaElement {
	const clone = element.cloneNode() as HTMLTextAreaElement;

	element.parentNode!.insertBefore( clone, element );

	clone.style.position = 'absolute';
	clone.style.top = '-99999px';
	clone.style.left = '-99999px';
	// clone.style.bottom = '10px';
	// clone.style.left = '10px';
	clone.style.height = 'auto';
	clone.style.overflow = 'hidden';
	clone.style.width = element.ownerDocument.defaultView!.getComputedStyle( element ).width;
	clone.tabIndex = -1;
	clone.rows = 1;
	clone.value = value;

	element.parentNode!.insertBefore( clone, element );

	return clone;
}
