/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { IframeView } from 'ckeditor5/src/ui';
import { toUnit } from 'ckeditor5/src/utils';

const toPx = toUnit( 'px' );

/**
 * TODO
 */
export default class MinimapIframeView extends IframeView {
	constructor( locale, options ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'top', 0 );
		this.set( 'height', 0 );

		this._options = options;

		this.extendTemplate( {
			attributes: {
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

	render() {
		return super.render().then( () => {
			this._prepareDocument();
		} );
	}

	_prepareDocument() {
		const iframeDocument = this.element.contentWindow.document;
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

		const html = `<!DOCTYPE html><html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<style>${ this._options.pageStyles }</style>
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
