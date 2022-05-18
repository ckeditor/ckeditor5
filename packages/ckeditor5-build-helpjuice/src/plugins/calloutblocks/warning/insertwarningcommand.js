import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertWarningCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			this.editor.model.insertContent(createWarningCallout(writer));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'warning');

		this.isEnabled = allowedIn !== null;
	}
}

function createWarningCallout(writer) {
	const docFrag = writer.createDocumentFragment();

	// CREATE WARNING CALLOUT
	const warningCallout = writer.createElement('warning');
	const warningCalloutBody = writer.createElement('warningBody');

	const warningCalloutTitle = writer.createElement('heading3');
	writer.insertText("Helpjuice Warning Callout Title", warningCalloutTitle);

	const warningCalloutContent = writer.createElement('paragraph');
	writer.insertText("Helpjuice Warning Callout Body", warningCalloutContent);

	const warningDelete = writer.createElement("warningDelete");

	writer.append(warningCalloutTitle, warningCalloutBody);
	writer.append(warningCalloutContent, warningCalloutBody);
	writer.append(warningCalloutBody, warningCallout);
	writer.append(warningDelete, warningCallout);

	// CREATE EMPTY ELEMENT TO BE INSERTED AFTER THE ACCORDION
	const emptyParagraph = writer.createElement("paragraph");

	writer.append(warningCallout, docFrag);
	writer.append(emptyParagraph, docFrag);

	return docFrag;
}
