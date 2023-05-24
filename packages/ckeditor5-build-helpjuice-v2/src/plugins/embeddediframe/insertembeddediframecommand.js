import { Command } from "@ckeditor/ckeditor5-core";

export default class InsertEmbeddedIFrameCommand extends Command {
	execute({ url, height = '500px', width = '100%' }) {
		this.editor.model.change(writer => {
			const embeddedIFrame = writer.createElement('embeddedIFrame', { source: url, height: height, width: width })
			this.editor.model.insertObject(embeddedIFrame);
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), "embeddedIFrame");

		this.isEnabled = allowedIn !== null;
	}
}
