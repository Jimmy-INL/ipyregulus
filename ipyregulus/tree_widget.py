"""
    Regulus Tree widget
"""

from ipywidgets import register, widget_serialization
from traitlets import Dict, Instance, Unicode, Undefined, validate
from regulus.topo import RegulusTree
from regulus.tree import Node
from ipyregulus.base import RegulusWidget
from ipyregulus.has_tree import HasTree

def _tree_to_json(value, widget):
    def marshal(node, l):
        l.append(widget._select(node))
        for child in node.children:
            marshal(child, l)
        l.append(None)
        return l

    if value is None or value is Undefined:
        return None
    return marshal(value, [])


@register
class TreeWidget(HasTree, RegulusWidget):
    "A widget represeting a tree"

    _model_name = Unicode('TreeModel').tag(sync=True)

    root = Instance(klass=Node, allow_none=True).tag(sync=True, to_json=_tree_to_json)
    attrs = Dict(allow_null=True).tag(sync=True)

    def __init__(self, tree, select=lambda x:{}, **kwargs):
        self.user_select = select
        # HasTree.__init__(self, tree)
        # RegulusWidget.__init__(self)
        print('TreeWidget.init', tree, **kwargs)
        super().__init__(tree)


    def update(self, change):
        super().update(change)
        self.root = self.tree.root if self.tree is not None else None
        self.attrs = dict()

    def ensure(self, attr):
        if attr not in self.attrs:
            if attr in self.tree:
                self.attrs[attr] = self.tree.retrieve(attr)
                return True
        return False


    @validate('model')
    def _validate_tree(self, proposal):
        """validate the tree"""
        value = proposal['value']
        # TODO: validate
        return value

    def _default_select(self, node):
        return {
            'id': node.id,
            'lvl': node.data.persistence if len(node.children) > 0 else 0,
            'size': node.data.size(),
            'offset': node.offset
            }

    def _select(self, node):
        d = self._default_select(node)
        if node.data is not None:
            d.update(self.user_select(node))
        return d


    def touch(self):
        """inform the widget the tree was mutated"""
        self._notify_trait('root', self.root, self.root)