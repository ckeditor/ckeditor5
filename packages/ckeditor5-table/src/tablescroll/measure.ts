/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablescroll/measure
 */

import { getOverlayMountRoot } from '@ckeditor/ckeditor5-utils';

/**
 * Returns a CSS `width` value in pixels, relative to `containerWidth`. Units other than `px` and `%` are measured
 * in the DOM, using the font of `domFontSource`.
 *
 * @internal
 */
export function getWidthInPixels( options: WidthProbeOptions ): number {
	const { width, containerWidth } = options;

	if ( isWidthProbeNeeded( width ) ) {
		return probeWidth( options );
	}

	if ( width.endsWith( '%' ) ) {
		return parseFloat( width ) * containerWidth / 100;
	}

	return parseFloat( width );
}

/**
 * Checks if a CSS `width` value needs to be measured in the DOM to be resolved to pixels, that is, if it is
 * in units other than `px` and `%`.
 *
 * @internal
 */
export function isWidthProbeNeeded( width: string ): boolean {
	return !width.endsWith( 'px' ) && !width.endsWith( '%' );
}

/**
 * Measures a CSS `width` value in pixels using a hidden probe mounted next to the editor's floating UI,
 * sized to `containerWidth` and using the font of `domFontSource`. Returns `0` for a detached `domFontSource`.
 */
function probeWidth( { width, containerWidth, domFontSource }: WidthProbeOptions ): number {
	const mountRoot = getOverlayMountRoot( domFontSource );

	/* v8 ignore if -- @preserve */
	if ( !mountRoot ) {
		return 0;
	}

	const { ownerDocument } = domFontSource;
	const window = ownerDocument.defaultView!;
	const { fontSize, fontFamily } = window.getComputedStyle( domFontSource );

	const container = ownerDocument.createElement( 'div' );
	const probe = ownerDocument.createElement( 'div' );

	// `all: initial` keeps the page styles of `div` elements (e.g. `max-width`, `font-size`) away from the probe.
	Object.assign( container.style, {
		all: 'initial',
		position: 'absolute',
		visibility: 'hidden',
		width: `${ containerWidth }px`,
		fontSize,
		fontFamily
	} );

	Object.assign( probe.style, {
		all: 'initial',
		display: 'block',
		fontSize: 'inherit',
		fontFamily: 'inherit',
		width
	} );

	container.appendChild( probe );
	mountRoot.appendChild( container );

	const measuredWidth = parseFloat( window.getComputedStyle( probe ).width );

	container.remove();

	return measuredWidth;
}

/**
 * Options for resolving a CSS width to pixels, with a probe if needed.
 */
type WidthProbeOptions = {

	/**
	 * The CSS `width` value.
	 */
	width: string;

	/**
	 * The content width of the container, in pixels. Resolves `%`.
	 */
	containerWidth: number;

	/**
	 * The element whose font resolves font-relative units, such as `em`.
	 */
	domFontSource: Element;
};
