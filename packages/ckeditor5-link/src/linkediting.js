/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/linkediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	downcastAttributeToElement,
	downcastMarkerToHighlight,
	createViewElementFromHighlightDescriptor
} from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import LinkCommand from './linkcommand';
import UnlinkCommand from './unlinkcommand';
import { createLinkElement } from './utils';
import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';
import findLinkRange from './findlinkrange';
import '../theme/link.css';
import DocumentSelection from '@ckeditor/ckeditor5-engine/src/model/documentselection';
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';

/**
 * The link engine feature.
 *
 * It introduces the `linkHref="url"` attribute in the model which renders to the view as a `<a href="url">` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LinkEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow link attribute on all inline nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'linkHref' } );

		editor.conversion.for( 'downcast' )
			.add( downcastAttributeToElement( { model: 'linkHref', view: createLinkElement } ) );

		editor.conversion.for( 'upcast' )
			.add( upcastElementToAttribute( {
				view: {
					name: 'a',
					attribute: {
						href: true
					}
				},
				model: {
					key: 'linkHref',
					value: viewElement => viewElement.getAttribute( 'href' )
				}
			} ) );

		// Create linking commands.
		editor.commands.add( 'link', new LinkCommand( editor ) );
		editor.commands.add( 'unlink', new UnlinkCommand( editor ) );

		// Enable two-step caret movement for `linkHref` attribute.
		bindTwoStepCaretToAttribute( editor.editing.view, editor.model, this, 'linkHref' );

		// Setup highlight over selected link.
		this._setupLinkHighlight();
	}

	/**
	 * Adds highlight over link which has selection inside, together with two-step caret movement indicates whenever
	 * user is typing inside the link.
	 *
	 * @private
	 */
	_setupLinkHighlight() {
		const editor = this.editor;
		const model = this.editor.model;
		const doc = model.document;
		const highlightDescriptor = {
			id: 'linkBoundaries',
			class: 'ck-link_selected',
			priority: 1
		};

		// Convert linkBoundaries marker to view highlight.
		editor.conversion.for( 'editingDowncast' )
			.add( downcastMarkerToHighlight( {
				model: 'linkBoundaries',
				view: highlightDescriptor
			} ) );

		// Create marker over whole link when selection has "linkHref" attribute.
		doc.registerPostFixer( writer => {
			const selection = doc.selection;
			const marker = model.markers.get( 'linkBoundaries' );

			// Create marker over link when selection is inside or remove marker otherwise.
			if ( selection.hasAttribute( 'linkHref' ) ) {
				const modelRange = findLinkRange( selection.getFirstPosition(), selection.getAttribute( 'linkHref' ) );

				if ( !marker || !marker.getRange().isEqual( modelRange ) ) {
					writer.setMarker( 'linkBoundaries', modelRange );
					return true;
				}
			} else if ( marker ) {
				writer.removeMarker( 'linkBoundaries' );
				return true;
			}

			return false;
		} );

		// Custom converter for selection's "linkHref" attribute - when collapsed selection has this attribute it is
		// wrapped with <span> similar to that used by highlighting mechanism. This <span> will be merged together with
		// highlight wrapper. This prevents link splitting When selection is at the beginning or at the end of the link.
		// Without this converter:
		//
		//		<a href="url">{}</a><span class="ck-link_selected"><a href="url">foo</a></span>
		//
		// When converter is applied:
		//
		//		<span class="ck-link_selected"><a href="url">{}foo</a></span>
		editor.editing.downcastDispatcher.on( 'attribute:linkHref', ( evt, data, conversionApi ) => {
			const selection = data.item;

			if ( !( selection instanceof DocumentSelection || selection instanceof ModelSelection ) || !selection.isCollapsed ) {
				return;
			}

			const writer = conversionApi.writer;
			const viewSelection = writer.document.selection;
			const wrapper = createViewElementFromHighlightDescriptor( highlightDescriptor );

			conversionApi.writer.wrap( viewSelection.getFirstRange(), wrapper );
		} );
	}
}
