import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-4b')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoAlbersUsa()
// let graticule = d3.geoGraticule()

let path = d3.geoPath().projection(projection)

let opacityScale = d3
  .scaleLinear()
  .domain([0, 80000])
  .range([0, 1])
  .clamp(true)

Promise.all([d3.json(require('./data/counties_with_election_data.topojson'))])

  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(json) {
  // console.log(json[0].objects)

  let counties = topojson.feature(json[0], json[0].objects.us_counties)
  // console.log(counties)

  svg
    .selectAll('.counties')
    .data(counties.features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr('stroke', 'none')
    .attr('fill', 'white')
    .attr('fill', d => {
      // console.log(d.properties)
      let clintonVotes = d.properties.clinton
      let trumpVotes = d.properties.trump
      if (clintonVotes > trumpVotes) {
        return 'purple'
      }
      if (trumpVotes > clintonVotes) {
        return 'green'
      }
      if (!d.properties.state) {
        return 'lightgrey'
      }
    })

    .attr('opacity', function(d) {
      if (d.properties.state) {
        let totalvotes = d.properties.clinton + d.properties.trump
        return opacityScale(totalvotes)
      }
      return 0.3
    })
}
