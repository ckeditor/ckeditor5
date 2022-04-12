import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertSuccessCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			// Insert <success> at the current selection position
			// in a way that will result in creating a valid model structure.
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
	const successCallout = writer.createElement('success');
	const successCalloutBody = writer.createElement('successBody');

	const successCalloutTitle = writer.createElement('heading3');
	writer.insertText("Helpjuice Success Callout Title", successCalloutTitle);

	const successCalloutContent = writer.createElement('paragraph');
	writer.insertText("Helpjuice Success Callout Body", successCalloutContent);

	writer.append(successCalloutTitle, successCalloutBody);
	writer.append(successCalloutContent, successCalloutBody);
	writer.append(successCalloutBody, successCallout);

	return successCallout;
}
