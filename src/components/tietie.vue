<template>
<div id="cy">
</div>
</template>

<script>
import { mapState } from 'vuex'
import cytoscape from 'cytoscape'
import cola from 'cytoscape-cola'
cytoscape.use(cola)

export default {
  props: ['tieties'],
  computed: {
    ...mapState(['face', 'info']),
  },
  data() {
    return { highlightBefore: undefined }
  },
  methods: {
    highlight(node, cy) {
      const toArray = arrayLike => Array(arrayLike.length).fill().map((_, index) => arrayLike[index])
      const mid = node.id()

      if (this.highlightBefore === mid) {
        window.open(`${location.origin}/detail/${mid}`)
      } else if (this.highlightBefore) {
        cy.$id(this.highlightBefore)
          .connectedEdges()
          .removeClass('blue')
          .removeClass('orange')
      }
      toArray(node.connectedEdges())
        .forEach(edge => {
          if (edge.source() === node) {
            edge.addClass('blue')
          } else {
            edge.addClass('orange')
          }
        })
      this.highlightBefore = mid
    }
  },
  mounted() {
    /* beautify ignore:start */
    let vtbs = this.tieties
      |> Object.entries
      |> #.flatMap(([mid, tietie]) => [mid, ...tietie.flatMap(v => v)])
        .map(String)
      |> new Set(#)
      |> [...#]
    let nodes = vtbs.map(mid => ({ data: { id: mid, label: this.info[mid]?.uname || '' } }))
    let directions = this.tieties
      |> Object.entries
      |> #.flatMap(([mid, tietie]) => tietie.flatMap(v => v).map(String).map(tie => [mid, tie]))
        .map(([source, target]) => ({ data: { source, target }}))
    /* beautify ignore:end */
    let styles = vtbs
      .map(mid => [mid, this.face[mid]])
      .filter(([_mid, face]) => face)
      .map(([mid, face]) => ({ selector: `#${mid}`, css: { 'background-image': `${face.replace('http://', 'https://')}@256w_256h` } }))
    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements: [
        ...nodes,
        ...directions,
      ],
      layout: {
        name: 'cose',
        directed: true,
      },
      style: [{
        selector: 'node',
        css: {
          height: 80,
          width: 80,
          'background-fit': 'cover',
          'border-color': '#000',
          'border-width': 3,
          'border-opacity': 0.5,
          content: 'data(label)',
        },
      }, {
        selector: 'edge',
        css: {
          'curve-style': 'bezier',
          width: 6,
          'target-arrow-shape': 'triangle',
        },
      }, {
        selector: '.blue',
        css: {
          'line-color': 'rgb(100,130,255)'
        },
      }, {
        selector: '.orange',
        css: {
          'line-color': 'orange'
        },
      }, ...styles],
    })
    cy.on('click', 'node', e => {
      this.highlight(e.target, cy)
    })
  },
}
</script>

<style scoped>
#cy {
  width: 100%;
  display: block;
  position: absolute;
  height: 100%;
  top: 0;
  right: 0;
}
</style>
