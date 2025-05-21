---
category: licensing
menu-title: Usage-based billing
meta-title: Usage-based billing | CKEditor 5 Documentation
meta-description: Learn how usage-based billing works in CKEditor 5.
order: 20
modified_at: 2024-11-20
---

# Usage-based billing

Under the Usage-based billing (UBB) model, your costs are based on how frequently you use CKEditor.

<info-box>
	The following information applies exclusively to Cloud-hosted plans. You are not subject to usage-based billing terms if:

	* You use a self-hosted open-source version of CKEditor. However, you must comply with the terms of the open-source license.
	* You have a Custom plan that allows self-hosting.
</info-box>

## Key terms

Familiarizing yourself with these key terms related to usage-based billing will help you choose the right pricing plan for your needs:

### Cloud-hosted

A reliable cloud-based CDN service that hosts CKEditor 5, ensuring it is globally distributed and always close to your users for optimal performance. By choosing this deployment method, you leverage our infrastructure, eliminating the need to manage hosting yourself.

Additionally, you gain access to both standard and premium features, with the added benefit of quick updates, so your CKEditor is always equipped with the latest enhancements, security patches, and new features with little effort on your part.

### Self-hosted

Distribute CKEditor from your own servers using npm packages or ZIP files. This method offers the most flexibility, allowing you to bundle and configure the editor to suit your specific needs. If you plan to use the editor commercially in a self-hosted environment, please [contact our sales team](https://ckeditor.com/contact-sales/#contact-form).

Alternatively, if you prefer to use only the free, open-source version of CKEditor and your project complies with our open-source software license, you can choose to self-host CKEditor on your servers or through any CDN service, without relying on our Cloud services.

### Editor loads

An editor load occurs each time CKEditor is initialized in your application. For example, if 100 users load CKEditor 10 times each, it results in 1,000 editor loads.

The editor initializes as follows:

1. The integrator creates one or more editors on a page, typically using a method like `ClassicEditor.create(sourceElementOrData, configuration)`.
2. Depending on the setup, the editor will either initialize with the selected DOM element or, if provided with data, initialize in a detached mode to be added to the DOM on demand.
3. Upon the `ready` event, the editor sends usage information to the server to confirm the license. [Read more about the license check](#license-check-and-usage-data).

Each individual editor instance on a page is counted as one editor load. For example, if a page contains ten editors, a single refresh of that page will result in ten editor loads.

Several factors can contribute to a high number of editor loads, with one of the most significant being the use of multiple editors on a single page. For example:

* **Content Management Systems (CMS)**: CMS platforms where users frequently edit content across multiple fields (such as title, description, body content) on the same page can lead to a higher count of editor loads.
* **Dynamic form builders**: Applications that allow users to dynamically add and edit form fields with CKEditor embedded in each field will increase the total number of editor loads each time the form is accessed or modified.

By understanding these scenarios, you can better anticipate and manage your editor loads to align with your usage plan.

### License check and usage data

When the editor is ready, a license check request is sent to our server, along with non-personalized data that helps us understand editor usage. This information also assists us when we work on support requests.

The server’s response confirms whether the license is valid. If invalid, the editor will switch to read-only mode.

**Note:** Remember to set correct {@link getting-started/setup/csp Content Security Policy (CSP)} rules to enable usage metering.

## How usage-based billing works

Each pricing plan includes a specific number of editor loads. If you exceed this limit, you can either upgrade to a higher plan or pay for additional editor loads in blocks of 1,000.

<info-box info>
	Please note there are several types of license keys and they may be handled differently in usage-based billing. Refer to the {@link getting-started/licensing/license-key-and-activation#license-key-types License key types} section for details.
</info-box>

### Billing and metering cycles

Your billing cycle depends on the type of subscription plan you have chosen  &ndash; **monthly** or **annual**.

* **Monthly Plans**: If you are on a monthly plan, your billing cycle begins the day after your trial period ends and repeats on the same date each month. For example, if your trial ends on May 15th, your billing cycle starts on May 16th. Your editor load count resets on the 16th of each following month. Any charges for additional editor loads take effect at the start of your next billing cycle.
* **Annual Plans**: If you have chosen an annual plan, your billing cycle starts the day after your trial period ends and continues for 12 months. Editor loads are still calculated and reset on a monthly basis within your annual billing period. For instance, if your trial ends on May 15th, your billing cycle begins on May 16th, and your editor load count resets on the 16th of each month thereafter. If you exceed your monthly editor load limit, additional charges of the standard charging rate per block of 1,000 editor loads will apply. These charges will be conducted monthly if applicable.

Please note that unused editor loads **do not carry over** to the next month, regardless of whether you are on a monthly or annual plan. To manage your costs effectively, we recommend monitoring your editor load usage and adjusting your plan as needed. See the [Managing your usage](#managing-your-usage) section below.

### Exceeding your monthly limit

If you surpass your monthly limit, you will be automatically charged a standard charging rate for every additional block of 1,000 editor loads.

### CKEditor Free plan

If you use our [CKEditor Free plan](https://portal.ckeditor.com/checkout?plan=free) and exceed your allocated editor loads without providing a valid payment method, your editor will switch to read-only mode until the next month. If a valid payment method is provided, a standard charge of standard charging rate per additional block of 1,000 editor loads applies.

### Trial period usage

During {@link getting-started/licensing/license-key-and-activation#license-key-types your 14-day trial}, you have unlimited editor loads and can test both distribution methods: cloud and self-hosted. However, once the trial ends, you must use the method included in your selected plan. For instance, if you tested npm (self-hosted) but are on a cloud plan, you will need to either {@link updating/index#migration-to-cdn migrate your implementation to use cloud} or [contact our sales team](https://ckeditor.com/contact/) to switch to a self-hosted plan.

### Managing your usage

Admins can monitor usage data from the past six months within the CKEditor Usage section of the Customer Portal. Current cycle data is available in the `Customer Portal` → `Subscription` → `Usage statistics`. We recommend keeping an eye on your editor loads and selecting a plan that fits your usage needs while minimizing costs. You will also receive an email notification when you reach 50% and 70% of your monthly editor loads.

If your usage regularly exceeds your plan's limit, we recommend upgrading your plan to avoid additional charges. You can view and upgrade your plan at any time via the Customer Portal.

We advise linking the email address associated with your plan to a group alias, IT, or administrative address (for example, `subscriptions@example.com`) to avoid potential disruptions in case of staff or organizational changes.

### Plan upgrades

If you are on the Essential plan and reach 5,000 editor loads, you will not be automatically upgraded to the Professional plan. Instead, you will be charged a standard charging rate for each additional block of 1,000 editor loads. To avoid these charges, regularly review your editor load count and consider upgrading your plan if needed. Plan upgrades are available anytime in the `Customer Portal` → `Subscription management`.

For plan upgrades, we charge prorated value immediately to enable all needed features after the upgrade.
