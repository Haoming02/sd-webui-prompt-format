from modules import script_callbacks, shared
import modules.scripts as scripts
import gradio as gr

class Script(scripts.Script):

    def title(self):
        return "Prompt Format"

    def show(self, is_img2img):
        if is_img2img is True:
            return None
        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        if is_img2img is True:
            return None

        if shared.opts.pf_disableupdateinput and shared.opts.pf_disableupdateinput is True:
            gr.Box(elem_id = 'pf-config-true')

        return None

def on_ui_settings():
    shared.opts.add_option("pf_disableupdateinput", shared.OptionInfo(False, "Prompt Format - Disable Update Input", section=("system", "System")))

script_callbacks.on_ui_settings(on_ui_settings)
