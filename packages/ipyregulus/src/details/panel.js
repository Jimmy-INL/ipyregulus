import * as d3 from 'd3';
import './panel.css';

let DEFAULT_WIDTH = 800;
let DEFAULT_HEIGHT = 500;

let PLOT_WIDTH = 100;
let PLOT_HEIGHT = 100;
let PLOT_GAP = 5;

export default function Panel() {
  let margin = {top: 10, right: 30, bottom: 50, left:60},
  width = DEFAULT_WIDTH - margin.left - margin.right,
  height = DEFAULT_HEIGHT - margin.top - margin.bottom;

  let root = null;
  let svg = null;

  let data = null;
  let pts = null;
  let pts_idx = [];
  let values = null;
  let values_idx = [];
  let partitions = {}

  let measure = '';
  let show = [];

  let cols = [];
  let rows = [];
  let plots = [];

  function update_data_model(_) {
    data = _;
    if (data != null) {
      pts = data.get('pts');
      pts_idx = data.get('pts_idx');
      values = data.get('values');
      values_idx = data.get('values_idx');
      partitions = data.get('partitions');
    } else {
      pts = null;
      pts_idx = [];
      values = null;
      values_idx = [];
      partitions = {};
    }
  }

  function update_cols() {
    cols = pts_idx.map( (c,i) => ({id: i, name: c}));
    root.select('.rg_bottom_scroll').style('width', `${cols.length*(PLOT_WIDTH+PLOT_GAP) - PLOT_GAP}px`);
  }

  function update_rows() {
    rows = show.map((r, i) => ({id: i, idx: r}));
    root.select('.rg_right_scroll').style('height', `${rows.length*(PLOT_HEIGHT+PLOT_GAP) - PLOT_GAP}px`);
  }

  function update_plots() {
    plots = [];
    for (let row of rows) {
      let partition = partitions.get(row.id);
      console.log('partition:', partition);
      for (let col of cols) {
         let p = {
           row: row.id,
           col: col.id,
           partition: partition
         }
         plots.push(p);
      }
    }
  }

  function render() {
    render_cols();
    render_rows();
    render_plots();
  }

  function render_cols() {
    let d3cols = root.select('.rg_top').selectAll('.rg_col_header').data(cols, d => d.id);
    d3cols.enter()
      .append('div')
      .classed('rg_col_header', true)
    .merge(d3cols)
      .html(d => d.name);

    d3cols.exit().remove();
  }

  function render_rows() {
      let d3rows = root.select('.rg_left').selectAll('.rg_row_header').data(rows, d => d.id);
      d3rows.enter()
        .append('div')
        .classed('rg_row_header', true)
      .merge(d3rows)
        .html(d => d.id);

      d3rows.exit().remove();
  }

  function render_plots() {
      let d3plots = root.select('.rg_plots').selectAll('.rg_plot').data(plots);
      d3plots.enter()
        .append('div')
        .classed('rg_plot', true)
      .merge(d3plots)
        .style('left', d => `${d.col*(PLOT_WIDTH + PLOT_GAP)}px`)
        .style('top', d => `${d.row*(PLOT_HEIGHT + PLOT_GAP)}px`)
        .call(render_plot)
  }

  function render_plot(selection) {
      selection.each( function(d, i) {
        d3.select(this)
          .html(d => `[${d.row},${d.col}]`);
      });
  }

  function scroll_plots() {
    let left = root.select('.rg_bottom').node().scrollLeft;
    root.select('.rg_top').node().scrollLeft = left;
    root.select('.rg_plots').node().scrollLeft = left;

    let top = root.select('.rg_right').node().scrollTop;
    root.select('.rg_left').node().scrollTop = top;
    root.select('.rg_plots').node().scrollTop = top;
  }


  // let resizeObserver = new ResizeObserver(entries => {
  //       entries.forEach( e => {
  //         console.log('resize:', e.target, e.contentRect.width, e.contentRect.height);
  //       });
  //   }
  // );

  let panel = {
    el(_) {
      root = _;

      root.select('.rg_bottom').on('scroll', scroll_plots);
      root.select('.rg_right').on('scroll', scroll_plots);

      // resizeObserver.observe(root.select('.rg_top').node());
      // resizeObserver.observe(root.select('.rg_left').node());


       // svg = _;
      //
      // let g = svg.append('g')
      //   .attr('transform', `translate(${margin.left},${margin.top})`);

      return this;
    },

    resize() {
      // if (!svg) return;
      //
      // let w = parseInt(svg.style('width')) || DEFAULT_WIDTH;
      // let h = parseInt(svg.style('height')) || DEFAULT_HEIGHT;
      // width =  w -margin.left - margin.right;
      // height = h - margin.top - margin.bottom ;

      render();
      return this;
    },

    data(_) {
      update_data_model(_);
      update_cols();
      update_rows();
      update_plots();
      render();
      return this;
    },

    measure(_) {
      measure = _;
      return this;
    },

    show(_) {
      show = _;
      update_rows();
      update_plots();
      render();
      return this;
    },

    redraw() {
      render();
      return this;
    }
  }

  return panel;
}