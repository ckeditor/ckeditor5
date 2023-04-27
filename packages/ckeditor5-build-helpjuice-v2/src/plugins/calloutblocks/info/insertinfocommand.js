import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertInfoCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			// Insert <success> at the current selection position
			// in a way that will result in creating a valid model structure.
			this.editor.model.insertContent(createInfoCallout(writer));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'info');

		this.isEnabled = allowedIn !== null;
	}
}

function createInfoCallout(writer) {
	const docFrag = writer.createDocumentFragment();

	// CREATE INFO CALLOUT
	const infoCallout = writer.createElement('info');
	const infoCalloutBody = writer.createElement('infoBody');

	const infoCalloutTitle = writer.createElement('heading3');
	writer.insertText("Helpjuice Info Callout Title", infoCalloutTitle);

	const infoCalloutContent = writer.createElement('paragraph');
	writer.insertText("Helpjuice Info Callout Body", infoCalloutContent);

	const infoDelete = writer.createElement("infoDelete");

	writer.append(infoCalloutTitle, infoCalloutBody);
	writer.append(infoCalloutContent, infoCalloutBody);
	writer.append(infoCalloutBody, infoCallout);
	writer.append(infoDelete, infoCallout);

	// CREATE EMPTY PARAGRAPH
	const emptyParagraph = writer.createElement("paragraph");

	writer.append(infoCallout, docFrag);
	writer.append(emptyParagraph, docFrag);

	return docFrag;
}
