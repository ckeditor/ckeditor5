import { Command } from 'ckeditor5/src/core';
import { isEmbeddedIFrameElement } from './utils';

export default class ResizeEmbeddedIFrameCommand extends Command {
	execute( { height, width } ) {
		this.editor.execute( 'insertEmbeddedIFrame', {
			...this.value,
			height,
			width
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const element = selection.getSelectedElement();

		if ( element && isEmbeddedIFrameElement( element ) ) {
			this.value = Object.fromEntries( element.getAttributes() );
			this.isEnabled = true;
		} else {
			this.value = null;
			this.isEnabled = false;
		}
	}
}
