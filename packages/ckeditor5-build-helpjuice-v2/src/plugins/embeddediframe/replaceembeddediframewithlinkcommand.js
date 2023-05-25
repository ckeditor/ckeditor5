import { Command } from 'ckeditor5/src/core';
import { isEmbeddedIFrameElement } from './utils';

export default class ReplaceEmbeddedIFrameWithLinkCommand extends Command {
	execute( url ) {
		this.editor.model.change( writer => {
			const linkedText = writer.createText( url, { linkHref: url } );
			this.editor.model.insertContent( linkedText, this.editor.model.document.selection );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const element = selection.getSelectedElement();

		this.isEnabled = element && isEmbeddedIFrameElement( element );
	}
}
