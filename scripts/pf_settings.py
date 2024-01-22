from modules import script_callbacks, shared

def on_ui_settings():
    shared.opts.add_option("pf_disableupdateinput", shared.OptionInfo(False, "Prompt Format - Disable Update Input", section=("system", "System")).info("Enable this if you have Extensions, such as [tagcomplete], that subscribe to text editing event."))
    shared.opts.add_option("pf_startinauto", shared.OptionInfo(True, "Prompt Format - Start in Auto Mode", section=("system", "System")))
    shared.opts.add_option("pf_startwithdedupe", shared.OptionInfo(True, "Prompt Format - Start with Remove Duplicates", section=("system", "System")))
    shared.opts.add_option("pf_startwithrmudscr", shared.OptionInfo(False, "Prompt Format - Start with Remove Underscores", section=("system", "System")))

script_callbacks.on_ui_settings(on_ui_settings)
