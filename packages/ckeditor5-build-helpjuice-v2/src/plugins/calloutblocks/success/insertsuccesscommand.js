import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertSuccessCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			this.editor.model.insertContent(createSuccessCallout(writer));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'success');

		this.isEnabled = allowedIn !== null;
	}
}

function createSuccessCallout(writer) {
	const docFrag = writer.createDocumentFragment()

	// CREATE SUCCESS CALLOUT
	const successCallout = writer.createElement('success');
	const successCalloutBody = writer.createElement('successBody');

	const successCalloutTitle = writer.createElement('heading3');
	writer.insertText("Helpjuice Success Callout Title", successCalloutTitle);

	const successCalloutContent = writer.createElement('paragraph');
	writer.insertText("Helpjuice Success Callout Body", successCalloutContent);

	const successDelete = writer.createElement("successDelete");

	writer.append(successCalloutTitle, successCalloutBody);
	writer.append(successCalloutContent, successCalloutBody);
	writer.append(successCalloutBody, successCallout);
	writer.append(successDelete, successCallout);

	// CREATE EMPTY ELEMENT TO BE INSERTED AFTER THE ACCORDION
	const emptyParagraph = writer.createElement("paragraph");

	writer.append(successCallout, docFrag);
	writer.append(emptyParagraph, docFrag);

	return docFrag;
}
