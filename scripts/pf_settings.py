from modules import script_callbacks, shared

def on_ui_settings():
    shared.opts.add_option("pf_disableupdateinput", shared.OptionInfo(False, "Prompt Format - Disable Update Input", section=("system", "System")))

script_callbacks.on_ui_settings(on_ui_settings)
