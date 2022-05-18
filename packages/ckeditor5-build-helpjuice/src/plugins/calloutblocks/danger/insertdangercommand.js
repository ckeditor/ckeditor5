import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertDangerCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			this.editor.model.insertContent(createDangerCallout(writer));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'danger');

		this.isEnabled = allowedIn !== null;
	}
}

function createDangerCallout(writer) {
	const docFrag = writer.createDocumentFragment();

	// CREATE DANGER CALLOUT
	const dangerCallout = writer.createElement('danger');
	const dangerCalloutBody = writer.createElement('dangerBody');

	const dangerCalloutTitle = writer.createElement('heading3');
	writer.insertText("Helpjuice Danger Callout Title", dangerCalloutTitle);

	const dangerCalloutContent = writer.createElement('paragraph');
	writer.insertText("Helpjuice Danger Callout Body", dangerCalloutContent);

	const dangerDelete = writer.createElement("dangerDelete");

	writer.append(dangerCalloutTitle, dangerCalloutBody);
	writer.append(dangerCalloutContent, dangerCalloutBody);
	writer.append(dangerCalloutBody, dangerCallout);
	writer.append(dangerDelete, dangerCallout);

	// CREATE EMPTY PARAGRAPH
	const emptyParagraph = writer.createElement("paragraph");

	writer.append(dangerCallout, docFrag);
	writer.append(emptyParagraph, docFrag);

	return docFrag;
}
