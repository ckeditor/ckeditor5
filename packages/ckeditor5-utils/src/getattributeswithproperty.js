/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
  * @module utils/getattributeswithproperty
  */

export default function getAttributesWithProperty( model, node, propertyName, propertyValue ) {
	const attributes = {};
	const nodeAttributes = node.getAttributes();

	for ( const [ attributeName, attributeValue ] of nodeAttributes ) {
		const attributeProperties = model.schema.getAttributeProperties( attributeName );
		const isPropertyValueValid = ( !propertyValue || attributeProperties[ propertyName ] === propertyValue );

		if ( attributeProperties[ propertyName ] && isPropertyValueValid ) {
			attributes[ attributeName ] = attributeValue;
		}
	}

	return attributes;
}
