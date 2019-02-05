/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/mapper-helpers
 */

/**
 * Maps view position to model position if view positions is wrongly set inside inline element - ie. inline widget.
 *
 *		editor.editing.mapper.on( 'viewToModel', mapViewPositionInsideInlineElement( model ) );
 *
 * It will try to map view offset of selection to an expected model position in order to create consistent selection.
 *
 * If DOM selection starts before inline element then view position offset will be 0 and be considered at it start and thus model position
 * will be placed "after" element to select it:
 *
 * 1. When selection starts before inline widget (offset=0):
 *
 *		//                           +- view position
 *		//                           |
 *		<p>f[oo <span class="widget">]widget</span></p>
 *
 *		// will map to:
 *
 *		//                                             +- model position
 *		//                                             |
 *		<paragraph>f[oo <inline-widget></inline-widget>]</paragraph>
 *
 * 2. When selection start before inline widget (offset=0):
 *
 *		//                            +- view position
 *		//                            |
 *		<p><span class="widget">widget[</span> ba]r</p>
 *
 *		// will map to:
 *
 *		//         +- model position
 *		//         |
 *		<paragraph>[<inline-widget></inline-widget> ba]r</paragraph>
 *
 * @param {module:engine/model/model~Model} model
 * @return {Function}
 */
export function mapViewPositionInsideInlineElement( model ) {
	const schema = model.schema;

	return ( evt, data ) => {
		const { mapper, viewPosition } = data;

		const viewParent = viewPosition.parent;

		const modelParent = mapper.toModelElement( viewParent );

		if ( modelParent && schema.isInline( modelParent ) ) {
			const isAtStart = viewPosition.offset === 0;

			data.modelPosition = model.createPositionAt( modelParent, isAtStart ? 'after' : 'before' );
		}
	};
}

/**
 * Maps model position to view position if the position set after/before inline element (ie. inline widget).
 *
 *		editor.editing.mapper.on( 'modelToView', mapModelPositionOnInlineElement( model, view ) );
 *
 * This method ensures that selection set on an inline element is set outside surrounding text nodes as by default the position would be set
 * at the end or beginning of a text node that is previous/next to the inline element:
 *
 * Without this mapper helper the selection would set inside text nodes:
 *
 *		//             +-------------------------------+--- model positions
 *		//             \                               |
 *		<paragraph>foo [<inline-widget></inline-widget>]</paragraph>
 *
 *		// will map to:
 *		//     +---------------------+- view positions (inside text nodes)
 *		//     |                     |
 *		<p>foo {<span class="widget">}widget</span></p>
 *
 * With this mapper helper the selection will set outside text nodes:
 *
 *		//     +---------------------+--- view positions (outside text nodes)
 *		//     |                     |
 *		<p>foo [<span class="widget">]widget</span></p>
 *
 * @param {module:engine/model/model~Model} model
 * @param {module:engine/model/model~Model} view
 * @return {Function}
 */
export function mapModelPositionOnInlineElement( model, view ) {
	return ( evt, data ) => {
		if ( data.isPhantom ) {
			return;
		}
		const modelPosition = data.modelPosition;

		const isBeforeNode = modelPosition.stickiness === 'toNext';
		const node = isBeforeNode ? modelPosition.nodeAfter : modelPosition.nodeBefore;

		if ( node && model.schema.isInline( node ) ) {
			const viewElement = data.mapper.toViewElement( node );

			if ( !viewElement ) {
				return;
			}

			data.viewPosition = isBeforeNode ? view.createPositionBefore( viewElement ) : view.createPositionAfter( viewElement );
		}
	};
}
