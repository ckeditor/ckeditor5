import { isWidget } from 'ckeditor5/src/widget';

export function isEmbeddedIFrameWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'embeddedIFrame' ) && isWidget( viewElement );
}

export function isEmbeddedIFrameElement( element ) {
	return element.name === 'embeddedIFrame';
}
