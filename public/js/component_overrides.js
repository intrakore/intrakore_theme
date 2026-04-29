// Override Frappe UI Components
frappe.provide("frappe.ui");

// Example: Override Button component
frappe.ui.Button = class CustomButton extends frappe.ui.Button {
    constructor(opts) {
        super(opts);
        // Add custom class
        this.$el.addClass("custom-button");
    }
};

// Override Alert component
frappe.ui.Alert = class CustomAlert extends frappe.ui.Alert {
    show() {
        super.show();
        this.$wrapper.addClass("custom-alert");
    }
};

// Add your other component overrides here