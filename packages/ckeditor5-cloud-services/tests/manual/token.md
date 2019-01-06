## Token sample

### Scenario 1

**Actions**
1. Click `Resolve` button to resolve the pending promise with the XHR response.

**Expected result**
* Editor isn't initialized at the start of the scenario.
* After clicking the button the editor initializes with no error in the console.
* The token used in the editor should be visible in the output.

### Scenario 2

**Actions**
1. Restart the page with <kbd>CMD</kbd> + <kbd>R</kbd>
1. Click `Reject` button to reject the pending promise with an error.

**Expected result**
* Editor isn't initialized at the start of the scenario.
* The token is different than the previous token.
* After clicking the button the editor doesn't initialize and there is an error in the output - `Cannot download new token!`.
