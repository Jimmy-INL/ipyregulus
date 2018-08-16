# Copyright (c) University of Utah

from traitlets import Dict, Unicode
from ipywidgets import register, widget_serialization
from .base import RegulusDOMWidget
from .treetrait import TreeTrait

@register
class TreeView(RegulusDOMWidget):
    """"""
    _model_name = Unicode('TreeViewModel').tag(sync=True)
    _view_name = Unicode('TreeView').tag(sync=True)

    title = Unicode('title').tag(sync=True)
    field = Unicode('field').tag(sync=True)
    tree = TreeTrait(allow_none=True).tag(sync=True, **widget_serialization)
    attrs = Dict({}).tag(sync=True)

    @property
    def measure(self):
        return self.field

    @measure.setter
    def measure(self, name):
        if name in self.tree.model.attr:
            self.attrs[name] = self.tree.model.retrieve(name)
            self._notify_trait('attrs', self.attrs, self.attrs)
        # if value not in self.attrs:
        #     if value in self.tree.model.attr:
        #         self.attrs[value] = self.tree.model.attr[value]
        #         self._notify_trait('attrs', self.attrs, self.attrs)
        self.field = name

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.measure = kwargs.get('measure', 'lvl')
