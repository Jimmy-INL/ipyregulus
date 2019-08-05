import {
  DOMWidgetView
} from "@jupyter-widgets/base";

import {
   Message
} from '@phosphor/messaging';

import * as d3 from 'd3';
import Panel from './panel';

import './tree.css';
import template from './tree.html';

export
class TreeView extends DOMWidgetView {
  
  render() {
    this.d3el = d3.select(this.el)
      .classed('rg_tree', true);

    this.d3el.html(template);
    this.panel = Panel().el(d3.select(this.el).select('.view'))
      .on('highlight', d => this.on_highlight(d))
      .on('details', (d, is_on) => this.on_details(d, is_on))
      .on('select', (d, is_on) => this.on_select(d, is_on));

    this.model.on('change:title', this.on_title_changed, this);
    this.model.on('change:field', this.on_field_changed, this);
    this.model.on('change:tree_model',  this.on_tree_changed, this);
    this.model.on('change:attrs', this.on_attrs_changed, this);
    this.model.on('change:show', this.on_show_changed, this);
    this.model.on('change:highlight', this.on_highlight_changed, this);
    this.model.on('change:selected', this.on_selected_changed, this);
    this.model.on('change:details', this.on_details_changed, this);
    this.model.on('change:range', this.on_range_changed, this);


    this.on_title_changed();

    let self = this;
    setTimeout( function() {
        self.panel.resize();
        self.on_attrs_changed();
        self.on_field_changed();
        self.on_tree_changed();
      },
    0);

  }

  processPhosphorMessage(msg:Message) {
    // console.log('Tree phosphor message', msg);
    switch (msg.type) {
      case 'after-attach':
        d3.select(this.el.parentNode).classed('rg_output', true);
        break;
      case 'resize':
        this.panel.resize();
        break;
    }
  }

  // events(): {[e: string]: string} {
  //   // See http://stackoverflow.com/questions/22077023/why-cant-i-indirectly-return-an-object-literal-to-satisfy-an-index-signature-re and https://github.com/Microsoft/TypeScript/pull/7029
  //   return {'click': '_handle_click'};
  // }
  //
  // _handle_click(event) {
  //   event.preventDefault();
  //   this.touch();
  // }



  on_tree_changed() {
    let prev = this.model.previous('tree_model');
    if (prev) {
      prev.off('change:root', this.on_tree_updated, this);
      prev.off('change:attrs', this.on_tree_updated, this);
      prev.off('change:all', this.on_tree_updated, this);
    }
    let current = this.model.get('tree_model');
    if (current) {
      current.on('change:root', this.on_tree_updated, this);
      current.on('change:attrs', this.on_attrs_changed, this);
      current.on('change:all', this.on_tree_updated, this);
    }
    this.on_tree_updated();
  }

  on_title_changed() {
    this.d3el.select('.title').text(this.model.get('title'));
  }

  on_tree_updated() {
    let tree = this.model.get('tree_model');
    this.panel.data( tree && tree.get('root') || null)
      .redraw();
  }

  on_field_changed() {
    let field = this.model.get('field');
    this.d3el.select('.measure').html(field);
    this.panel.attr(field)
      .redraw();
    this.touch();
  }

  on_attrs_changed() {
    let tree = this.model.get('tree_model');
    let tree_attr = tree && tree.get('attrs') || null;
    let attr = {
      ...tree_attr,
      ...this.model.get('attrs'),
    }
    this.panel.attrs(attr).redraw();
  }

  on_show_changed() {
    this.panel.show(this.model.get('show'))
      .redraw();
  }

  on_highlight_changed() {
    this.panel.highlight(this.model.get('highlight'));
  }

  on_selected_changed() {
    this.panel.select(new Set(this.model.get('selected')));
  }

  on_details_changed() {
    this.panel.details(new Set(this.model.get('details')));
  }

  on_range_changed() {
    this.panel.range(this.model.get('range'));
  }
  
  /*
   * events from Panel
   */

  on_highlight(id) {
    this.model.set('highlight', id);
    this.touch();
  }

  on_select(id, is_on) {
    let selected = new Set(this.model.get('selected'))
    if (is_on) {
      selected.add(id);
    } else {
      selected.delete(id);
    }
    this.model.set('selected', selected)
    this.touch();
  }

  on_details(id, is_on) {
    let details = this.model.get('details').concat();
    if (is_on) {
      details.push(id);
    } else {
      details.splice(details.indexOf(id), 1)
    }
    this.model.set('details', details);
    this.touch();
  }

  d3el: any;
  panel: any;
  tree: any;
}
