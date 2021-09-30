/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

import { pointer } from 'd3-selection';
import { extent } from 'd3';
import * as d3 from 'd3';

export default function App() {
  const [url] = useState(
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
  );
  const [req] = useState(new XMLHttpRequest());

  const width = 1800;
  const height = 800;
  const padding = 140;

  useEffect(() => {
    req.open('GET', url, true);
    req.onload = () => {
      data = JSON.parse(req.responseText);
      values = data;
      drawCanvas();
      generateScales();
      drawCell();
      generateAxis();
      infoText();
      Legend();
    };
    req.send();

    let data;
    let values = [];

    let xScale;
    let yScale;

    let svg = d3.select('svg');

    const parseYear = d3.timeParse('%Y');
    const parseMonth = d3.timeParse('%m');
    const formatMonth = d3.timeFormat('%B');
    const formatYear = d3.format('d');

    let color = [
      '#045a8d',
      '#2b8cbe',
      '#74a9cf',
      '#bdc9e1',
      '#fff7ec',
      '#fdbb84',
      '#fc8d59',
      '#ef6548',
      '#d7301f',
      '#b30000',
      '#7f0000',
    ];

    let colorScale = d3.scaleQuantize().range(color);

    const infoText = () => {
      let textContainer = d3
        .select('svg')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      textContainer
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -350)
        .attr('y', 50)
        .text('Months');

      textContainer
        .append('text')
        .attr('x', width - 1200)
        .attr('y', height - 760)
        .attr('id', 'description')
        .text(`1753 - 2015: base temperature ${values.baseTemperature}℃`)
        .style('font-size', '1.5em')
        .style('text-align', 'center')
        .style('text-decoration', 'underline');

      textContainer
        .append('text')
        .attr('x', width - 200)
        .attr('y', height - 50)
        .text('Years');
    };

    const drawCanvas = () => {
      svg.attr('width', width);
      svg.attr('height', height);
    };

    const generateScales = () => {
      const dataYear = values.monthlyVariance.map((item) => {
        return new Date(item.year);
      });

      console.log(dataYear);

      yScale = d3
        .scaleBand()
        .domain([
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ])
        .range([padding, height - padding]);

      xScale = d3
        .scaleTime()
        .domain(extent(dataYear))
        .range([padding, width - padding]);

      colorScale.domain(
        d3.extent(values.monthlyVariance, (item) => {
          return item.variance;
        })
      );

      return { xScale, yScale, dataYear };
    };

    const Legend = () => {
      const legendWidth = 400;
      const legendHeight = 300 / color.length;

      const variance = values.monthlyVariance.map((item) => {
        return item.variance;
      });
      const minTemp = values.baseTemperature + Math.min.apply(null, variance);
      const maxTemp = values.baseTemperature + Math.max.apply(null, variance);

      const threshold = d3
        .scaleThreshold()
        .domain(
          (function (min, max, count) {
            var array = [];
            var step = (max - min) / count;
            var base = min;
            for (var i = 1; i < count; i++) {
              array.push(base + i * step);
            }
            return array;
          })(minTemp, maxTemp, color.length)
        )
        .range(color);

      const xScaleLegend = d3
        .scaleLinear()
        .domain([minTemp, maxTemp])
        .range([0, legendWidth]);

      const xAxisLegend = d3
        .axisBottom(xScaleLegend)
        .tickSize(10, 0)
        .tickValues(threshold.domain())
        .tickFormat(d3.format('.1f'));
      // var padding = {
      //   left: 9 * fontSize,
      //   right: 9 * fontSize,
      //   top: 1 * fontSize,
      //   bottom: 8 * fontSize,
      // };
      const legend = svg.append('g').attr('id', 'legend');

      legend
        .append('g')
        .selectAll('rect')
        .data(
          threshold.range().map((color) => {
            var dataColor = threshold.invertExtent(color);
            if (dataColor[0] === null) {
              dataColor[0] = xScaleLegend.domain()[0];
            }
            if (dataColor[1] === null) {
              dataColor[1] = xScaleLegend.domain()[1];
            }
            return dataColor;
          })
        )
        .enter()
        .append('rect')
        .style('fill', (item) => {
          return threshold(item[0]);
        })
        .attr('x', (item) => {
          return xScaleLegend(item[0] + 18.3);
        })
        .attr('y', 722)
        .attr('width', (item) => {
          return xScaleLegend(item[1]) - xScaleLegend(item[0]);
        })
        .attr('height', legendHeight);

      legend
        .append('g')
        .attr('transform', 'translate(' + 600 + ',' + 750 + ')')
        .call(xAxisLegend);
    };

    const drawCell = () => {
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('visibility', 'hidden')
        .style('width', 'auto')
        .style('height', 'auto');

      svg
        .selectAll('rect')
        .data(values.monthlyVariance)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('data-year', (item) => formatYear(item.year))
        .attr('data-month', (item) => item.month - 1)
        .attr('data-temp', (item) => values.baseTemperature + item.variance)
        .attr('width', 5 + 'px')
        .attr('height', 42 + 'px')
        .attr('x', (item) => xScale(formatYear(item.year)))
        .attr('y', (item) => yScale(formatMonth(parseMonth(item.month))))
        .style('fill', (item) => {
          return colorScale(item.variance);
        })
        .on('mouseover', (event, item) => {
          const [x, y] = pointer(event);
          tooltip
            .transition()
            .style('visibility', 'visible')
            .attr('data-year', item.year)
            .attr('data-temp', item.variance);
          tooltip
            .attr(
              'data-year',
              formatYear(parseYear(values.monthlyVariance.year))
            )
            .style('left', x + 80 + 'px')
            .style('top', y - 70 + 'px')
            .style('position', 'absolute')
            .html(
              '<p>Year: ' +
                formatYear(item.year) +
                '</p><p>℃ in Month: ' +
                (values.baseTemperature + item.variance).toFixed(2) +
                '</p><p>℃ Differents: ' +
                Math.max(item.variance.toFixed(2)) +
                '</p><p>Month: ' +
                formatMonth(parseMonth(item.month)) +
                '</p>'
            );
        })
        .on('mouseout', () => {
          tooltip.transition().style('visibility', 'hidden');
        });
    };

    const generateAxis = () => {
      const xAxis = d3
        .axisBottom(xScale)
        .tickSizeOuter(0)
        .tickSizeInner(3)
        .ticks(12)
        .tickFormat(formatYear)
        .tickSize(10, 1);
      const yAxis = d3.axisLeft(yScale).ticks(12).tickSize(10, 1);
      svg
        .append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height - padding})`)
        .style('font-size', '18px');

      svg
        .append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${padding},  0)`)
        .style('font-size', '18px')
        .style('text-anchor', 'end');
      return { xAxis, svg, yAxis };
    };
  }, []);
  return (
    <div>
      <h2 id='title' style={{ textAlign: 'center' }}>
        Monthly Global Land-Surface Temperature
      </h2>
      <svg className='App' id='div2' style={{ textAlign: 'center' }}></svg>{' '}
    </div>
  );
}
