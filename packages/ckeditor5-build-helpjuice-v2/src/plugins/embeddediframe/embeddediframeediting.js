import { Plugin } from 'ckeditor5/src/core';
import { Widget, toWidget } from 'ckeditor5/src/widget';
import InsertEmbeddedIFrameCommand from './insertembeddediframecommand';
import ResizeEmbeddedIFrameCommand from './resizeembeddediframecommand';
import ReplaceEmbeddedIFrameWithLinkCommand from './replaceembeddediframewithlinkcommand';

export default class EmbeddedIFrameEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'insertEmbeddedIFrame', new InsertEmbeddedIFrameCommand( this.editor ) );
		this.editor.commands.add( 'resizeEmbeddedIFrame', new ResizeEmbeddedIFrameCommand( this.editor ) );
		this.editor.commands.add( 'replaceEmbeddedIFrameWithLink', new ReplaceEmbeddedIFrameWithLinkCommand( this.editor ) );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'embeddedIFrame', {
			inheritAllFrom: '$blockObject',
			allowAttributes: [ 'source', 'height', 'width' ]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'iframe',
				attributes: {
					'data-embedded-iframe': true
				}
			},
			model: ( viewElement, { writer } ) => {
				const attributes = {
					source: viewElement.getAttribute( 'src' )
				};
				if ( viewElement.hasStyle( 'height' ) ) { attributes.height = viewElement.getStyle( 'height' ); }
				if ( viewElement.hasStyle( 'width' ) ) { attributes.width = viewElement.getStyle( 'width' ); }

				return writer.createElement( 'embeddedIFrame', attributes );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'embeddedIFrame',
			view: ( modelElement, { writer } ) => {
				const element = writer.createRawElement( 'iframe', {
					src: modelElement.getAttribute( 'source' ),
					frameborder: 0,
					'data-embedded-iframe': true
				} );
				if ( modelElement.hasAttribute( 'height' ) ) { writer.setStyle( 'height', modelElement.getAttribute( 'height' ), element ); }
				if ( modelElement.hasAttribute( 'width' ) ) { writer.setStyle( 'width', modelElement.getAttribute( 'width' ), element ); }

				const wrapper = writer.createContainerElement( 'div', {
					class: 'hj-embedded-iframe-container'
				}, [ element ] );
				writer.setCustomProperty( 'embeddedIFrame', true, wrapper );

				return toWidget( wrapper, writer, { label: 'Embedded IFrame' } );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'embeddedIFrame',
			view: ( modelElement, { writer } ) => {
				const element = writer.createEmptyElement( 'iframe', {
					src: modelElement.getAttribute( 'source' ),
					frameborder: 0,
					'data-embedded-iframe': true
				} );
				if ( modelElement.hasAttribute( 'height' ) ) { writer.setStyle( 'height', modelElement.getAttribute( 'height' ), element ); }
				if ( modelElement.hasAttribute( 'width' ) ) { writer.setStyle( 'width', modelElement.getAttribute( 'width' ), element ); }

				return element;
			}
		} );
	}
}
