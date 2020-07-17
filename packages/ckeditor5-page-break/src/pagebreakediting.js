/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module page-break/pagebreakediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PageBreakCommand from './pagebreakcommand';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

import '../theme/pagebreak.css';

/**
 * The page break editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class PageBreakEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'PageBreakEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;

		schema.register( 'pageBreak', {
			isObject: true,
			allowWhere: '$block'
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'pageBreak',
			view: ( modelElement, viewWriter ) => {
				const divElement = viewWriter.createContainerElement( 'div', {
					class: 'page-break',
					// If user has no `.ck-content` styles, it should always break a page during print.
					style: 'page-break-after: always'
				} );

				// For a rationale of using span inside a div see:
				// https://github.com/ckeditor/ckeditor5-page-break/pull/1#discussion_r328934062.
				const spanElement = viewWriter.createContainerElement( 'span', {
					style: 'display: none'
				} );

				viewWriter.insert( viewWriter.createPositionAt( divElement, 0 ), spanElement );

				return divElement;
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'pageBreak',
			view: ( modelElement, viewWriter ) => {
				const label = t( 'Page break' );
				const viewWrapper = viewWriter.createContainerElement( 'div' );
				const viewLabelElement = viewWriter.createContainerElement( 'span' );
				const innerText = viewWriter.createText( t( 'Page break' ) );

				viewWriter.addClass( 'page-break', viewWrapper );
				viewWriter.setCustomProperty( 'pageBreak', true, viewWrapper );

				viewWriter.addClass( 'page-break__label', viewLabelElement );

				viewWriter.insert( viewWriter.createPositionAt( viewWrapper, 0 ), viewLabelElement );
				viewWriter.insert( viewWriter.createPositionAt( viewLabelElement, 0 ), innerText );

				return toPageBreakWidget( viewWrapper, viewWriter, label );
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
						return;
					}

					// The "page break" div accepts only single child or no child at all.
					if ( element.childCount == 1 ) {
						const viewSpan = element.getChild( 0 );

						// The child must be the "span" element that is not displayed and has a space inside.
						if ( !viewSpan.is( 'element', 'span' ) || viewSpan.getStyle( 'display' ) != 'none' || viewSpan.childCount != 1 ) {
							return;
						}

						const text = viewSpan.getChild( 0 );

						if ( !text.is( '$text' ) || text.data !== ' ' ) {
							return;
						}
					} else if ( element.childCount > 1 ) {
						return;
					}

					return { name: true };
				},
				model: 'pageBreak',

				// This conversion must be checked before <br> conversion because some editors use
				// <br style="page-break-before:always"> as a page break marker.
				converterPriority: 'high'
			} );

		editor.commands.add( 'pageBreak', new PageBreakCommand( editor ) );
	}
}

// Converts a given {@link module:engine/view/element~Element} to a page break widget:
// * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to
//   recognize the page break widget element.
// * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
//
//  @param {module:engine/view/element~Element} viewElement
//  @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
//  @param {String} label The element's label.
//  @returns {module:engine/view/element~Element}
function toPageBreakWidget( viewElement, writer, label ) {
	writer.setCustomProperty( 'pageBreak', true, viewElement );

	return toWidget( viewElement, writer, { label } );
}
