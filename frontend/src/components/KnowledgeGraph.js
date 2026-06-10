import { graphNodes, graphEdges } from '../data.js';
import { actions } from '../hooks/useGurukul.js';

const typeColors = { text: '#7B68EE', scholar: '#3A9B8C', domain: '#EF9F27', practice: '#D85A30' };
const typeLabels = { text: '📚 Texts', scholar: '🧑🏫 Scholars', domain: '🏛️ Domains', practice: '🧘 Practices' };

export function renderKnowledgeGraphPage(container) {
  let selectedNode = null;
  let searchTerm = '';
  let filterType = 'all';
  let focusGraphNode = null;
  let resetGraphFocus = null;

  if (!document.getElementById('kg-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'kg-styles';
    styleEl.textContent = `
      .kg-wrapper {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 64px);
        height: calc(100dvh - 64px);
        background: var(--bg, #0d0b08);
        color: var(--text, #EDE8D5);
        position: relative;
        overflow: hidden;
      }

      .kg-header-section {
        border-bottom: 1px solid var(--gold-border, rgba(212,175,55,0.15));
        padding: 16px 20px;
        flex-shrink: 0;
        background: rgba(19, 16, 12, 0.95);
      }

      .kg-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
      }

      .kg-title {
        font-family: 'Cinzel', serif;
        color: var(--gold, #D4AF37);
        text-shadow: 0 0 30px rgba(212,175,55,0.15);
        font-size: 22px;
        margin: 0;
      }

      .kg-subtitle {
        color: var(--text-dim, #5C5440);
        letter-spacing: 0.5px;
        font-size: 13px;
        margin: 2px 0 0 0;
      }

      .kg-controls {
        display: flex;
        gap: 8px;
      }

      .kg-search-input {
        border-radius: 8px;
        padding: 8px 14px;
        font-size: 13.5px;
        outline: none;
        width: 180px;
        background: var(--surface, #1e1810);
        border: 1px solid var(--gold-border, rgba(212,175,55,0.15));
        color: var(--text, #EDE8D5);
        font-family: 'Lato', sans-serif;
        transition: all 0.2s;
      }

      .kg-search-input:focus {
        border-color: var(--gold, #D4AF37);
        box-shadow: 0 0 6px rgba(212, 175, 55, 0.15);
      }

      .kg-filter-select {
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 13.5px;
        outline: none;
        cursor: pointer;
        background: var(--surface, #1e1810);
        border: 1px solid var(--gold-border, rgba(212,175,55,0.15));
        color: var(--text, #EDE8D5);
        font-family: 'Lato', sans-serif;
        transition: all 0.2s;
      }

      .kg-filter-select:focus {
        border-color: var(--gold, #D4AF37);
      }

      .kg-body {
        display: flex;
        flex: 1;
        overflow: hidden;
        position: relative;
        height: 100%;
      }

      .kg-canvas-container {
        flex: 1;
        position: relative;
        overflow: hidden;
        background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,175,55,0.03) 0%, var(--bg, #0d0b08) 70%);
      }

      .kg-sidepanel {
        width: 320px;
        border-left: 1px solid var(--gold-border, rgba(212,175,55,0.15));
        background: var(--surface, #13100c);
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        padding: 24px;
        box-sizing: border-box;
        transition: all 0.3s ease;
        overflow: hidden; /* Prevent parent scrollbar */
      }

      .kg-sidepanel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        flex-shrink: 0;
      }

      .kg-sidepanel-body {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding-right: 4px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .kg-sidepanel-body::-webkit-scrollbar { width: 4px; }
      .kg-sidepanel-body::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.15); border-radius: 4px; }

      .kg-sidepanel-footer {
        margin-top: 20px;
        flex-shrink: 0;
      }

      /* Mobile Responsive Overrides */
      @media (max-width: 767px) {
        .kg-header-section {
          padding: 12px 16px;
        }
        .kg-header-row {
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
        }
        .kg-title {
          font-size: 18px;
        }
        .kg-subtitle {
          font-size: 12px;
        }
        .kg-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .kg-search-input, .kg-filter-select {
          width: 100%;
          font-size: 13px;
          padding: 8px 10px;
        }
        .kg-sidepanel {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          top: auto;
          width: 100%;
          height: 55%;
          max-height: 75%;
          border-left: none;
          border-top: 1px solid var(--gold-border, rgba(212,175,55,0.15));
          z-index: 100;
          box-shadow: 0 -8px 24px rgba(0,0,0,0.6);
          background: rgba(20, 16, 12, 0.98);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 20px 20px calc(20px + env(safe-area-inset-bottom, 0px));
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  container.innerHTML = `
    <div class="screen-header">
      <button class="btn btn-ghost" id="kg-back-btn">← Back</button>
      <span class="screen-header-title">Knowledge Graph Explorer</span>
    </div>
    <div class="kg-wrapper">
      <div class="kg-header-section">
        <div class="kg-header-row">
          <div>
            <h2 class="kg-title">Knowledge Graph Explorer</h2>
            <p class="kg-subtitle">Interactive map of India's knowledge traditions</p>
          </div>
          <div class="kg-controls">
            <input id="kg-search" class="kg-search-input" placeholder="🔍 Search nodes…" />
            <select id="kg-filter" class="kg-filter-select">
              <option value="all">All Types</option>
              <option value="text">Texts</option>
              <option value="scholar">Scholars</option>
              <option value="domain">Domains</option>
              <option value="practice">Practices</option>
            </select>
          </div>
        </div>
      </div>

      <div class="kg-body">
        <div class="kg-canvas-container" id="kg-container">
          <svg id="kg-svg" style="width: 100%; height: 100%; touch-action: none;"></svg>
        </div>
        <div id="kg-sidepanel" class="kg-sidepanel" style="display: none;">
          <!-- Filled dynamically -->
        </div>
      </div>
    </div>
  `;

  const svgEl = container.querySelector('#kg-svg');
  const containerEl = container.querySelector('#kg-container');
  const sidePanelEl = container.querySelector('#kg-sidepanel');
  const searchEl = container.querySelector('#kg-search');
  const filterEl = container.querySelector('#kg-filter');

  let updateHighlight = null;

  searchEl.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    if (updateHighlight) updateHighlight(searchTerm, filterType);
  });

  filterEl.addEventListener('change', (e) => {
    filterType = e.target.value;
    if (updateHighlight) updateHighlight(searchTerm, filterType);
  });

  function renderSidePanel(node) {
    if (!node) {
      sidePanelEl.style.display = 'none';
      selectedNode = null;
      if (typeof resetGraphFocus === 'function') resetGraphFocus();
      return;
    }
    sidePanelEl.style.display = 'flex';
    selectedNode = node;
    if (typeof focusGraphNode === 'function') focusGraphNode(node);

    sidePanelEl.innerHTML = `
      <div class="kg-sidepanel-header">
        <div style="padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-family: 'Cinzel', serif; background: ${typeColors[node.type]}18; color: ${typeColors[node.type]};">
          ${node.type}
        </div>
        <button id="kg-close-btn" style="font-size: 24px; color: var(--text-dim); background: none; border: none; cursor: pointer; line-height: 1;">&times;</button>
      </div>

      <div class="kg-sidepanel-body">
        <h3 style="font-family: 'Cinzel', serif; color: var(--gold); text-shadow: 0 0 20px rgba(212,175,55,0.15); font-size: 22px; font-weight: bold; margin: 4px 0 12px 0; line-height: 1.3;">${node.label}</h3>

        <div style="font-size: 14px; display: flex; flex-direction: column; gap: 16px;">
          ${[
          ['Description', node.description],
          ['Time Period', node.period],
          ['Key Contributions', node.contributions],
        ].map(([label, value]) => `
            <div>
              <label style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px; color: var(--text-dim); font-family: 'Cinzel', serif;">${label}</label>
              <p style="color: var(--text-muted); line-height: 1.6; margin: 0; font-size: 13.5px;">${value}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="kg-sidepanel-footer">
        <button id="kg-ask-ai" style="width: 100%; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; transition: all 0.2s; background: linear-gradient(135deg, var(--gold-dim), var(--gold)); color: #0D0B08; border: none; font-family: 'Cinzel', serif; letter-spacing: 0.5px;">
          Ask AI about this ↗
        </button>
      </div>
    `;

    sidePanelEl.querySelector('#kg-close-btn').addEventListener('click', () => {
      renderSidePanel(null);
    });

    sidePanelEl.querySelector('#kg-ask-ai').addEventListener('click', () => {
      // Set the context and go straight to persona selection
      const msg = `Tell me about ${node.label} in Indian Knowledge Systems. What is its significance, history, and relevance today?`;
      actions.setProblem(msg);
      actions.setFromKnowledgeGraph(true);
      actions.goTo('persona');
    });
  }

  container.querySelector('#kg-back-btn').addEventListener('click', () => {
    renderSidePanel(null);
    actions.goTo('landing');
  });

  if (!window.d3) {
    const script = document.createElement('script');
    script.src = 'https://d3js.org/d3.v7.min.js';
    script.onload = () => initGraph();
    document.head.appendChild(script);
  } else {
    initGraph();
  }

  function initGraph() {
    const width = containerEl.clientWidth || 800;
    const height = containerEl.clientHeight || 600;
    const isMobile = width < 768;

    const svg = d3.select(svgEl)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();
    const g = svg.append('g');

    // Create D3 Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 4])
      .on('zoom', (e) => g.attr('transform', e.transform));

    svg.call(zoom);

    // Initial Zoom setup will be dynamically configured at the end of initGraph()

    // Define graph focus panning and centering handlers
    focusGraphNode = (nodeData) => {
      const targetX = nodeData.x || width / 2;
      const targetY = nodeData.y || height / 2;
      const visibleCenterY = isMobile ? height * 0.25 : height / 2;

      // Shift force simulation center so nodes float into visible upper screen area
      simulation.force('center', d3.forceCenter(width / 2, visibleCenterY));
      simulation.alpha(0.3).restart();

      // Pan nodes dynamically (Zoom in slightly on mobile focus for readability)
      const targetScale = isMobile ? 1.1 : d3.zoomTransform(svgEl).k;
      const tx = width / 2 - targetX * targetScale;
      const ty = visibleCenterY - targetY * targetScale;

      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate(tx, ty).scale(targetScale)
      );
    };

    resetGraphFocus = () => {
      // Restore center simulation force
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
      simulation.alpha(0.3).restart();

      // Pan back to middle of viewport (Zoom back out to overview on mobile, or scale 1.0 on desktop)
      if (isMobile) {
        fitGraph(true);
      } else {
        const targetScale = 1.0;
        const tx = (width / 2) * (1 - targetScale);
        const ty = (height / 2) * (1 - targetScale);

        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity.translate(tx, ty).scale(targetScale)
        );
      }
    };

    // Close sidepanel detail view when clicking empty background space of the graph
    svg.on('click', (e) => {
      if (e.target === svgEl || e.target.tagName === 'svg') {
        renderSidePanel(null);
      }
    });

    const nodes = graphNodes.map(d => ({ ...d }));
    const links = graphEdges.map(d => ({ ...d }));

    // Responsive simulation forces (Compact link distance and collision radius on mobile)
    const linkDistance = isMobile ? 110 : 150;
    const chargeStrength = isMobile ? -350 : -500;
    const collideRadius = isMobile ? 52 : 40;

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(linkDistance))
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(collideRadius));

    const link = g.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', 'rgba(212,175,55,0.18)').attr('stroke-width', isMobile ? 2 : 1.5);

    const linkLabel = g.append('g').selectAll('text').data(links).join('text')
      .text(d => d.label).attr('font-size', isMobile ? 11 : 10).attr('fill', 'rgba(154,144,120,0.6)')
      .attr('text-anchor', 'middle').attr('font-family', 'Lato');

    const defs = svg.append('defs');
    Object.entries(typeColors).forEach(([type, color]) => {
      const filter = defs.append('filter').attr('id', `glow-${type}`);
      filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
      filter.append('feMerge').selectAll('feMergeNode').data(['blur', 'SourceGraphic']).join('feMergeNode').attr('in', d => d);
    });

    const node = g.append('g').selectAll('g').data(nodes).join('g').style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e, d) => {
          if (e.sourceEvent) e.sourceEvent.stopPropagation(); // Stop touch event propagation to prevent background panning
          if (!e.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (e, d) => {
          if (e.sourceEvent) e.sourceEvent.stopPropagation();
          d.fx = e.x;
          d.fy = e.y;
        })
        .on('end', (e, d) => {
          if (e.sourceEvent) e.sourceEvent.stopPropagation();
          if (!e.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    node.append('circle')
      .attr('r', d => {
        const baseR = d.type === 'domain' ? 24 : d.type === 'scholar' ? 19 : 17;
        return isMobile ? baseR * 1.25 : baseR;
      })
      .attr('fill', d => typeColors[d.type] + '22')
      .attr('stroke', d => typeColors[d.type])
      .attr('stroke-width', isMobile ? 2.5 : 2)
      .attr('filter', d => `url(#glow-${d.type})`);

    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => {
        const baseDy = d.type === 'domain' ? 38 : 33;
        return isMobile ? baseDy * 1.25 : baseDy;
      })
      .attr('font-size', isMobile ? 14 : 12)
      .attr('font-family', 'Cinzel')
      .attr('fill', 'var(--text)')
      .attr('font-weight', 600)
      .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8)');

    node.on('click', (e, d) => {
      selectedNode = d;
      renderSidePanel(d);
    });

    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      linkLabel.attr('x', d => (d.source.x + d.target.x) / 2).attr('y', d => (d.source.y + d.target.y) / 2);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    updateHighlight = (term, typeMatch) => {
      const q = term.toLowerCase();
      node.each(function (d) {
        const el = d3.select(this);
        const match = !q || d.label.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
        const tm = typeMatch === 'all' || d.type === typeMatch;
        const visible = match && tm;
        el.select('circle').attr('opacity', visible ? 1 : 0.1).attr('stroke-width', visible && q ? 4 : 2);
        el.select('text').attr('opacity', visible ? 1 : 0.1);
      });
      link.attr('opacity', (d) => {
        const sMatch = (!q || d.source.label.toLowerCase().includes(q)) && (typeMatch === 'all' || d.source.type === typeMatch);
        const tMatch = (!q || d.target.label.toLowerCase().includes(q)) && (typeMatch === 'all' || d.target.type === typeMatch);
        return (sMatch && tMatch) ? 1 : 0.1;
      });
      linkLabel.attr('opacity', (d) => {
        const sMatch = (!q || d.source.label.toLowerCase().includes(q)) && (typeMatch === 'all' || d.source.type === typeMatch);
        const tMatch = (!q || d.target.label.toLowerCase().includes(q)) && (typeMatch === 'all' || d.target.type === typeMatch);
        return (sMatch && tMatch) ? 1 : 0.1;
      });
    };

    function fitGraph(transition = false) {
      if (nodes.length === 0) return;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach(d => {
        const baseR = d.type === 'domain' ? 24 : d.type === 'scholar' ? 19 : 17;
        const r = isMobile ? baseR * 1.25 : baseR;
        const labelHeight = isMobile ? 48 + 14 : 38 + 12;
        
        const xMin = d.x - r;
        const xMax = d.x + r;
        const yMin = d.y - r;
        const yMax = d.y + labelHeight;

        if (xMin < minX) minX = xMin;
        if (xMax > maxX) maxX = xMax;
        if (yMin < minY) minY = yMin;
        if (yMax > maxY) maxY = yMax;
      });

      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;

      if (graphWidth <= 0 || graphHeight <= 0) return;

      const padding = 20;
      const paddedWidth = graphWidth + padding * 2;
      const paddedHeight = graphHeight + padding * 2;

      const scaleX = width / paddedWidth;
      const scaleY = height / paddedHeight;
      let scale = Math.min(scaleX, scaleY);

      const minScaleLimit = isMobile ? 0.15 : 0.3;
      scale = Math.max(minScaleLimit, Math.min(4, scale));

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      const tx = width / 2 - centerX * scale;
      const ty = height / 2 - centerY * scale;

      const targetTransform = d3.zoomIdentity.translate(tx, ty).scale(scale);

      if (transition) {
        svg.transition().duration(750).call(zoom.transform, targetTransform);
      } else {
        svg.call(zoom.transform, targetTransform);
      }
    }

    if (isMobile) {
      zoom.scaleExtent([0.15, 4]);
      for (let i = 0; i < 120; ++i) {
        simulation.tick();
      }
      fitGraph(false);
    } else {
      const initialScale = 1.0;
      const initialTransform = d3.zoomIdentity
        .translate((width / 2) * (1 - initialScale), (height / 2) * (1 - initialScale))
        .scale(initialScale);
      svg.call(zoom.transform, initialTransform);
    }
  }
}
