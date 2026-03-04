/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module show-blocks/showblockscommand
 */

import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import type { ViewDowncastWriter, ViewRootEditableElement } from '@ckeditor/ckeditor5-engine';

type ShowBlocksLabelDirection = 'ltr' | 'rtl';

const CLASS_NAME = 'ck-show-blocks';

const TEXT_PLACEHOLDER = '__TEXT__';

const SHOW_BLOCKS_LABELS = /* #__PURE__ */ ( () => [
	[ 'address', 'ADDRESS' ],
	[ 'aside', 'ASIDE' ],
	[ 'blockquote', 'BLOCKQUOTE' ],
	[ 'details', 'DETAILS' ],
	[ 'div', 'DIV' ],
	[ 'footer', 'FOOTER' ],
	[ 'h1', 'H1' ],
	[ 'h2', 'H2' ],
	[ 'h3', 'H3' ],
	[ 'h4', 'H4' ],
	[ 'h5', 'H5' ],
	[ 'h6', 'H6' ],
	[ 'header', 'HEADER' ],
	[ 'main', 'MAIN' ],
	[ 'nav', 'NAV' ],
	[ 'pre', 'PRE' ],
	[ 'ol', 'OL' ],
	[ 'ul', 'UL' ],
	[ 'p', 'P' ],
	[ 'section', 'SECTION' ],
	[ 'figcaption', 'FIGCAPTION' ]
] as const )();

const SHOW_BLOCKS_LABEL_SVG_TEMPLATE: Record<ShowBlocksLabelDirection, string> = /* #__PURE__ */ ( () => ( {
	// eslint-disable-next-line @stylistic/max-len
	ltr: `<svg width='120' height='12' xmlns='http://www.w3.org/2000/svg' ><text style='paint-order:stroke fill; clip-path: inset(-3px)' stroke='%23EAEAEA' stroke-width='13' dominant-baseline='middle' fill='black' x='3' y='7' font-size='9px' font-family='Consolas, %22Lucida Console%22, %22Lucida Sans Typewriter%22, %22DejaVu Sans Mono%22, %22Bitstream Vera Sans Mono%22, %22Liberation Mono%22, Monaco, %22Courier New%22, Courier, monospace'>${ TEXT_PLACEHOLDER }</text></svg>`,

	// eslint-disable-next-line @stylistic/max-len
	rtl: `<svg width='120' height='12' xmlns='http://www.w3.org/2000/svg' ><text style='paint-order:stroke fill; clip-path: inset(-3px); transform:translate(-2px, 0)' stroke='%23EAEAEA' stroke-width='13' dominant-baseline='middle' fill='black' x='100%' text-anchor='end' y='7' font-size='9px' font-family='Consolas, %22Lucida Console%22, %22Lucida Sans Typewriter%22, %22DejaVu Sans Mono%22, %22Bitstream Vera Sans Mono%22, %22Liberation Mono%22, Monaco, %22Courier New%22, Courier, monospace'>${ TEXT_PLACEHOLDER }</text></svg>`
} ) )();

/**
 * The show blocks command.
 *
 * Displays the HTML element names for content blocks.
 */
export class ShowBlocksCommand extends Command {
	/**
	 * Flag indicating whether the command is active, i.e. content blocks are displayed.
	 */
	declare public value: boolean;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode.
		this.affectsData = false;

		this.value = false;
	}

	/**
	 * Toggles the visibility of content blocks.
	 */
	public override execute(): void {
		const view = this.editor.editing.view;

		view.change( writer => {
			// Multiroot support.
			for ( const root of view.document.roots ) {
				if ( !root.hasClass( CLASS_NAME ) ) {
					setBlockLabelStyles( writer, root );
					writer.addClass( CLASS_NAME, root );
					this.value = true;
				} else {
					writer.removeClass( CLASS_NAME, root );
					this.value = false;
				}
			}
		} );
	}
}

/**
 * Sets the CSS variables with the block labels as background images on the root element.
 */
function setBlockLabelStyles( writer: ViewDowncastWriter, root: ViewRootEditableElement ): void {
	if ( root.getStyle( '--ck-show-blocks-label-address-ltr' ) ) {
		return;
	}

	for ( const [ key, label ] of SHOW_BLOCKS_LABELS ) {
		writer.setStyle( `--ck-show-blocks-label-${ key }-ltr`, getLabelUrl( label, 'ltr' ), root );
		writer.setStyle( `--ck-show-blocks-label-${ key }-rtl`, getLabelUrl( label, 'rtl' ), root );
	}
}

/**
 * Generates a data URL with an SVG image containing the label text.
 */
function getLabelUrl( label: string, direction: ShowBlocksLabelDirection ): string {
	return `url("data:image/svg+xml;utf8,${ SHOW_BLOCKS_LABEL_SVG_TEMPLATE[ direction ].replace( TEXT_PLACEHOLDER, label ) }")`;
}
