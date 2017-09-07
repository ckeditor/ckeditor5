## Updating editor element when submitting a form

1. Start simple HTTP server located in `ckeditor5-core/tests/_utils/` by calling `node echo-server.js`.
1. Change editor's contents and press `Submit form` button. You should be redirected to a page which echoes POST data.
Check if submitted contents match editor contents.
1. Go back to test page and refresh it. Change editor contents and press `Submit by calling form.submit()` button.
You should be redirected to a page which echoes POST data. Check if submitted contents match editor contents.
