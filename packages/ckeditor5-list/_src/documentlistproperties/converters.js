/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlistproperties/converters
 */

/**
 * Returns a converter that consumes the `style`, `reversed`, and `start` attributes.
 * In `style`, it searches for the `list-style-type` definition.
 * If not found, the `"default"` value will be used.
 *
 * @protected
 * @param {module:list/documentlistproperties/documentlistpropertiesediting~AttributeStrategy} strategy
 * @returns {Function}
 */
export function listPropertiesUpcastConverter( strategy ) {
	return ( evt, data, conversionApi ) => {
		const { writer, schema, consumable } = conversionApi;

		// If there is no view consumable to consume, set the default attribute value to be able to reconvert nested lists on parent change.
		// So abort converting if attribute was directly consumed.
		if ( consumable.test( data.viewItem, strategy.viewConsumables ) === false ) {
			return;
		}

		if ( !data.modelRange ) {
			Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
		}

		let applied = false;

		for ( const item of data.modelRange.getItems( { shallow: true } ) ) {
			if ( !schema.checkAttribute( item, strategy.attributeName ) ) {
				continue;
			}

			if ( !strategy.appliesToListItem( item ) ) {
				continue;
			}

			// Set list attributes only on same level items, those nested deeper are already handled by the recursive conversion.
			if ( item.hasAttribute( strategy.attributeName ) ) {
				continue;
			}

			writer.setAttribute( strategy.attributeName, strategy.getAttributeOnUpcast( data.viewItem ), item );
			applied = true;
		}

		if ( applied ) {
			consumable.consume( data.viewItem, strategy.viewConsumables );
		}
	};
}
