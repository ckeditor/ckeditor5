/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/mapper-helpers
 */

/**
 * Maps view position to model element if view positions is inside inLine element - ie. inline widget.
 *
 *		editor.editing.mapper.on( 'viewToModel', mapViewPositionInsideInlineElement( model ) );
 *
 *
 * It will try to map view offset of selection to an expected model position in order to create consistent selection.
 *
 * If DOM selection starts before inline element then view position offset will be 0 and be considered at it start and thus model position
 * will be placed "after" element to select it:
 *
 * 1. When selection starts before inline widget (offset=0):
 *
 *		+- anchor                +- focus (mapped)
 *		|                        |
 *		<p>f[oo <span class="widget">]widget</span></p>        map to:        <paragraph>f[oo <inline-widget></inline-widget>]</paragraph>
 *
 * 2. When selection start before inline widget (offset=0):
 *
 *		+- focus (mapped)        +- anchor
 *		|                        |
 *		<p><span class="widget">widget[</span> ba]r</p>        map to:        <paragraph>[<inline-widget></inline-widget> ba]r</paragraph>
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
