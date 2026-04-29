app_name = "intrakore_theme"
app_title = "Intrakore Theme"
app_publisher = "Intakore"
app_description = "Custom Themes our clients using our app"
app_email = "support@intrakore.com"
app_license = "mit"


app_include_js = "intrakore_theme.bundle.js"
app_include_css = [
    "/assets/intrakore_theme/css/fonts.css",
    "/assets/intrakore_theme/css/typography.css",
    "/assets/intrakore_theme/css/Button.css",
    "/assets/intrakore_theme/css/Alert.css",
    "/assets/intrakore_theme/css/IconPicker.css",
    "/assets/intrakore_theme/css/List.css",
    "/assets/intrakore_theme/css/Sidebar.css",
    "/assets/intrakore_theme/css/custom.css"
]

# Optional: For website/web portal (if needed)
web_include_js = "intrakore_theme.bundle.js"
web_include_css = "intrakore_theme.bundle.css"
# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "intrakore_theme",
# 		"logo": "/assets/intrakore_theme/logo.png",
# 		"title": "Intrakore Theme",
# 		"route": "/intrakore_theme",
# 		"has_permission": "intrakore_theme.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/intrakore_theme/css/intrakore_theme.css"
# app_include_js = "/assets/intrakore_theme/js/intrakore_theme.js"

# include js, css files in header of web template
# web_include_css = "/assets/intrakore_theme/css/intrakore_theme.css"
# web_include_js = "/assets/intrakore_theme/js/intrakore_theme.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "intrakore_theme/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "intrakore_theme/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# automatically load and sync documents of this doctype from downstream apps
# importable_doctypes = [doctype_1]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "intrakore_theme.utils.jinja_methods",
# 	"filters": "intrakore_theme.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "intrakore_theme.install.before_install"
# after_install = "intrakore_theme.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "intrakore_theme.uninstall.before_uninstall"
# after_uninstall = "intrakore_theme.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "intrakore_theme.utils.before_app_install"
# after_app_install = "intrakore_theme.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "intrakore_theme.utils.before_app_uninstall"
# after_app_uninstall = "intrakore_theme.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "intrakore_theme.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"intrakore_theme.tasks.all"
# 	],
# 	"daily": [
# 		"intrakore_theme.tasks.daily"
# 	],
# 	"hourly": [
# 		"intrakore_theme.tasks.hourly"
# 	],
# 	"weekly": [
# 		"intrakore_theme.tasks.weekly"
# 	],
# 	"monthly": [
# 		"intrakore_theme.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "intrakore_theme.install.before_tests"

# Extend DocType Class
# ------------------------------
#
# Specify custom mixins to extend the standard doctype controller.
# extend_doctype_class = {
# 	"Task": "intrakore_theme.custom.task.CustomTaskMixin"
# }

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "intrakore_theme.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "intrakore_theme.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["intrakore_theme.utils.before_request"]
# after_request = ["intrakore_theme.utils.after_request"]

# Job Events
# ----------
# before_job = ["intrakore_theme.utils.before_job"]
# after_job = ["intrakore_theme.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"intrakore_theme.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# Translation
# ------------
# List of apps whose translatable strings should be excluded from this app's translations.
# ignore_translatable_strings_from = []

