import { Plugin } from 'ckeditor5/src/core';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { isEmbeddedIFrameElement, isEmbeddedIFrameWidget } from './utils';

function getClosestSelectedEmbeddedIFrameWidget( selection ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isEmbeddedIFrameWidget( viewElement ) ) {
		return viewElement;
	}

	let parent = selection.getFirstPosition().parent;

	while ( parent ) {
		if ( parent.is( 'element' ) && isEmbeddedIFrameWidget( parent ) ) {
			return parent;
		}

		parent = parent.parent;
	}

	return null;
}

export default class EmbeddedIFrameToolbar extends Plugin {
	static get requires() {
		return [ WidgetToolbarRepository ];
	}

	afterInit() {
		const editor = this.editor;
		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

		widgetToolbarRepository.register( 'embeddedIFrame', {
			items: [ 'resizeEmbeddedIFrame' ],
			getRelatedElement: selection => getClosestSelectedEmbeddedIFrameWidget( selection )
		} );

		const sourceEditing = editor.plugins.get( SourceEditing );
		if ( sourceEditing ) {
			// Hide toolbar when source editing is ON
			sourceEditing.on( 'change:isSourceEditingMode', ( _evt, _data, isSourceEditingMode ) => {
				if ( !isSourceEditingMode ) {
					widgetToolbarRepository.clearForceDisabled( 'embeddedIFrame' );
					return;
				}

				const model = this.editor.model;
				const selection = model.document.selection;
				const element = selection.getSelectedElement();

				if ( element && isEmbeddedIFrameElement( element ) ) {
					widgetToolbarRepository.forceDisabled( 'embeddedIFrame' );
				}
			} );
		}
	}
}
