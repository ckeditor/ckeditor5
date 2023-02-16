/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global DOMParser */

/**
 * @module ui/icon/iconview
 */

import View from '../view';

import '../../theme/components/icon/icon.css';
import type { ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';

/**
 * The icon view class.
 *
 * @extends module:ui/view~View
 */
export default class IconView extends View {
	declare public content: string | undefined;
	declare public viewBox: string;
	declare public fillColor: string;
	declare public isColorInherited: boolean;
	declare public static presentationalAttributeNames: Array<string>;

	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		const bind = this.bindTemplate;

		/**
		 * The SVG source of the icon.
		 *
		 * @observable
		 * @member {String} #content
		 */
		this.set( 'content', '' );

		/**
		 * This attribute specifies the boundaries to which the
		 * icon content should stretch.
		 *
		 * @observable
		 * @default '0 0 20 20'
		 * @member {String} #viewBox
		 */
		this.set( 'viewBox', '0 0 20 20' );

		/**
		 * The fill color of the child `path.ck-icon__fill`.
		 *
		 * @observable
		 * @default ''
		 * @member {String} #fillColor
		 */
		this.set( 'fillColor', '' );

		/**
		 * When set true (default), all parts of the icon inherit the fill color from the CSS `color` property of the
		 * icon's DOM parent.
		 *
		 * This effectively makes the icon monochromatic and allows it to change its fill color dynamically, for instance,
		 * when a {@link module:ui/button/buttonview~ButtonView} displays an icon and it switches between different states
		 * (pushed, hovered, etc.) the icon will follow along.
		 *
		 * **Note**: For the monochromatic icon to render properly, it must be made up of shapes that can be filled
		 * with color instead of, for instance, paths with strokes. Be sure to use the *outline stroke* tool
		 * (the name could be different in your vector graphics editor) before exporting your icon. Also, remove any
		 * excess `fill="..."` attributes that could break the color inheritance.
		 *
		 * **Note**: If you want to preserve the original look of your icon and disable dynamic color inheritance,
		 * set this flag to `false`.
		 *
		 * @observable
		 * @default true
		 * @member {Boolean} #isColorInherited
		 */
		this.set( 'isColorInherited', true );

		this.setTemplate( {
			tag: 'svg',
			ns: 'http://www.w3.org/2000/svg',
			attributes: {
				class: [
					'ck',
					'ck-icon',

					// Exclude icon internals from the CSS reset to allow rich (non-monochromatic) icons
					// (https://github.com/ckeditor/ckeditor5/issues/12599).
					'ck-reset_all-excluded',

					// The class to remove the dynamic color inheritance is toggleable
					// (https://github.com/ckeditor/ckeditor5/issues/12599).
					bind.if( 'isColorInherited', 'ck-icon_inherit-color' )
				],
				viewBox: bind.to( 'viewBox' )
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this._updateXMLContent();
		this._colorFillPaths();

		// This is a hack for lack of innerHTML binding.
		// See: https://github.com/ckeditor/ckeditor5-ui/issues/99.
		this.on<ObservableChangeEvent>( 'change:content', () => {
			this._updateXMLContent();
			this._colorFillPaths();
		} );

		this.on<ObservableChangeEvent>( 'change:fillColor', () => {
			this._colorFillPaths();
		} );
	}

	/**
	 * Updates the {@link #element} with the value of {@link #content}.
	 *
	 * @private
	 */
	private _updateXMLContent() {
		if ( this.content ) {
			const parsed = new DOMParser().parseFromString( this.content.trim(), 'image/svg+xml' );
			const svg = parsed.querySelector( 'svg' )!;
			const viewBox = svg.getAttribute( 'viewBox' );

			if ( viewBox ) {
				this.viewBox = viewBox;
			}

			// Preserve presentational attributes of the <svg> element from the source.
			// They can affect rendering of the entire icon (https://github.com/ckeditor/ckeditor5/issues/12597).
			for ( const { name, value } of Array.from( svg.attributes ) ) {
				if ( IconView.presentationalAttributeNames.includes( name ) ) {
					this.element!.setAttribute( name, value );
				}
			}

			while ( this.element!.firstChild ) {
				this.element!.removeChild( this.element!.firstChild );
			}

			while ( svg.childNodes.length > 0 ) {
				this.element!.appendChild( svg.childNodes[ 0 ] );
			}
		}
	}

	/**
	 * Fills all child `path.ck-icon__fill` with the `#fillColor`.
	 *
	 * @private
	 */
	private _colorFillPaths() {
		if ( this.fillColor ) {
			this.element!.querySelectorAll( '.ck-icon__fill' ).forEach( path => {
				( path as HTMLElement ).style.fill = this.fillColor;
			} );
		}
	}
}

/**
 * A list of presentational attributes that can be set on the `<svg>` element and should be preserved
 * when the icon {@link module:ui/icon/iconview~IconView#content content} is loaded.
 *
 * See the [specification](https://www.w3.org/TR/SVG/styling.html#TermPresentationAttribute) to learn more.
 *
 * @protected
 * @member {Array.<String>} module:ui/icon/iconview~IconView.presentationalAttributeNames
 */
IconView.presentationalAttributeNames = [
	'alignment-baseline', 'baseline-shift', 'clip-path', 'clip-rule', 'color', 'color-interpolation',
	'color-interpolation-filters', 'color-rendering', 'cursor', 'direction', 'display', 'dominant-baseline', 'fill', 'fill-opacity',
	'fill-rule', 'filter', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style',
	'font-variant', 'font-weight', 'image-rendering', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start',
	'mask', 'opacity', 'overflow', 'paint-order', 'pointer-events', 'shape-rendering', 'stop-color', 'stop-opacity', 'stroke',
	'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width',
	'text-anchor', 'text-decoration', 'text-overflow', 'text-rendering', 'transform', 'unicode-bidi', 'vector-effect',
	'visibility', 'white-space', 'word-spacing', 'writing-mode'
];
