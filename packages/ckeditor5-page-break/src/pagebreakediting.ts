/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module page-break/pagebreakediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { toWidget } from 'ckeditor5/src/widget.js';
import type { ViewDowncastWriter, ViewElement } from 'ckeditor5/src/engine.js';

import { PageBreakCommand } from './pagebreakcommand.js';

import '../theme/pagebreak.css';

/**
 * The page break editing feature.
 */
export class PageBreakEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'PageBreakEditing' as const;
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
	public init(): void {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;

		schema.register( 'pageBreak', {
			inheritAllFrom: '$blockObject'
		} );

		conversion.for( 'dataDowncast' ).elementToStructure( {
			model: 'pageBreak',
			view: ( modelElement, { writer } ) => {
				const divElement = writer.createContainerElement( 'div',
					{
						class: 'page-break',
						// If user has no `.ck-content` styles, it should always break a page during print.
						style: 'page-break-after: always'
					},
					// For a rationale of using span inside a div see:
					// https://github.com/ckeditor/ckeditor5-page-break/pull/1#discussion_r328934062.
					writer.createContainerElement( 'span', {
						style: 'display: none'
					} )
				);

				return divElement;
			}
		} );

		conversion.for( 'editingDowncast' ).elementToStructure( {
			model: 'pageBreak',
			view: ( modelElement, { writer } ) => {
				const label = t( 'Page break' );
				const viewWrapper = writer.createContainerElement( 'div' );
				const viewLabelElement = writer.createRawElement(
					'span',
					{ class: 'page-break__label' },
					function( domElement ) {
						domElement.innerText = t( 'Page break' );
					}
				);

				writer.addClass( 'page-break', viewWrapper );
				writer.insert( writer.createPositionAt( viewWrapper, 0 ), viewLabelElement );

				return toPageBreakWidget( viewWrapper, writer, label );
			}
		} );

		conversion.for( 'upcast' )
			.elementToElement( {
				view: element => {
					// For upcast conversion it's enough if we check for element style and verify if it's empty
					// or contains only hidden span element.

					const hasPageBreakBefore = element.getStyle( 'page-break-before' ) == 'always';
					const hasPageBreakAfter = element.getStyle( 'page-break-after' ) == 'always';

					if ( !hasPageBreakBefore && !hasPageBreakAfter ) {
						return null;
					}

					// The "page break" div accepts only single child or no child at all.
					if ( element.childCount == 1 ) {
						const viewSpan = element.getChild( 0 );

						// The child must be the "span" element that is not displayed.
						if ( !viewSpan!.is( 'element', 'span' ) || viewSpan.getStyle( 'display' ) != 'none' ) {
							return null;
						}
					} else if ( element.childCount > 1 ) {
						return null;
					}

					return {
						name: true,

						styles: [
							...( hasPageBreakBefore ? [ 'page-break-before' ] : [] ),
							...( hasPageBreakAfter ? [ 'page-break-after' ] : [] )
						],

						...element.hasClass( 'page-break' ) && {
							classes: [ 'page-break' ]
						}
					};
				},
				model: 'pageBreak',

				// This conversion must be checked before <br> conversion because some editors use
				// <br style="page-break-before:always"> as a page break marker.
				converterPriority: 'high'
			} );

		editor.commands.add( 'pageBreak', new PageBreakCommand( editor ) );
	}
}

/**
 * Converts a given {@link module:engine/view/element~ViewElement} to a page break widget:
 * * Adds a {@link module:engine/view/element~ViewElement#_setCustomProperty custom property} allowing to
 *   recognize the page break widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 */
function toPageBreakWidget( viewElement: ViewElement, writer: ViewDowncastWriter, label: string ): ViewElement {
	writer.setCustomProperty( 'pageBreak', true, viewElement );

	return toWidget( viewElement, writer, { label } );
}
