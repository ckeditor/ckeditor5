/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module minimap/minimapiframeview
 */

import { IframeView } from 'ckeditor5/src/ui.js';
import { toUnit, type Locale } from 'ckeditor5/src/utils.js';
import type { MinimapViewOptions } from './minimapview.js';

const toPx = /* #__PURE__ */ toUnit( 'px' );

/**
 * The internal `<iframe>` view that hosts the minimap content.
 *
 * @internal
 */
export default class MinimapIframeView extends IframeView {
	/**
	 * The CSS `top` used to scroll the minimap.
	 *
	 * @readonly
	 */
	declare public top: number;

	/**
	 * The CSS `height` of the iframe.
	 *
	 * @readonly
	 */
	declare public height: number;

	/**
	 * Cached view constructor options for re-use in other methods.
	 */
	private readonly _options: MinimapViewOptions;

	/**
	 * Creates an instance of the internal minimap iframe.
	 */
	constructor( locale: Locale, options: MinimapViewOptions ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'top', 0 );

		this.set( 'height', 0 );

		this._options = options;

		this.extendTemplate( {
			attributes: {
				tabindex: -1,
				'aria-hidden': 'true',
				class: [
					'ck-minimap__iframe'
				],
				style: {
					top: bind.to( 'top', top => toPx( top ) ),
					height: bind.to( 'height', height => toPx( height ) )
				}
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): Promise<unknown> {
		return super.render().then( () => {
			this._prepareDocument();
		} );
	}

	/**
	 * Sets the new height of the iframe.
	 */
	public setHeight( newHeight: number ): void {
		this.height = newHeight;
	}

	/**
	 * Sets the top offset of the iframe to move it around vertically.
	 */
	public setTopOffset( newOffset: number ): void {
		this.top = newOffset;
	}

	/**
	 * Sets the internal structure of the `<iframe>` readying it to display the
	 * minimap element.
	 */
	private _prepareDocument(): void {
		const iframeDocument = this.element!.contentWindow!.document;
		const domRootClone = iframeDocument.adoptNode( this._options.domRootClone );

		const boxStyles = this._options.useSimplePreview ? `
			.ck.ck-editor__editable_inline img {
				filter: contrast( 0 );
			}

			p, li, a, figcaption, span {
				background: hsl(0, 0%, 80%) !important;
				color: hsl(0, 0%, 80%) !important;
			}

			h1, h2, h3, h4 {
				background: hsl(0, 0%, 60%) !important;
				color: hsl(0, 0%, 60%) !important;
			}
		` : '';

		const pageStyles = this._options.pageStyles.map( definition => {
			if ( typeof definition === 'string' ) {
				return `<style>${ definition }</style>`;
			} else {
				return `<link rel="stylesheet" type="text/css" href="${ definition.href }">`;
			}
		} ).join( '\n' );

		const html = `<!DOCTYPE html><html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				${ pageStyles }
				<style>
					html, body {
						margin: 0 !important;
						padding: 0 !important;
					}

					html {
						overflow: hidden;
					}

					body {
						transform: scale( ${ this._options.scaleRatio } );
						transform-origin: 0 0;
						overflow: visible;
					}

					.ck.ck-editor__editable_inline {
						margin: 0 !important;
						border-color: transparent !important;
						outline-color: transparent !important;
						box-shadow: none !important;
					}

					.ck.ck-content {
						background: white;
					}

					${ boxStyles }
				</style>
			</head>
			<body class="${ this._options.extraClasses || '' }"></body>
		</html>`;

		iframeDocument.open();
		iframeDocument.write( html );
		iframeDocument.close();
		iframeDocument.body.appendChild( domRootClone );
	}
}
