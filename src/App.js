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
      drawBars();
      generateAxis();
      infoText();
      tooltipAndLegend();
    };
    req.send();

    let data;
    let values = [];

    let xScale;
    let yScale;

    let xAxisScale;
    let yAxisScale;

    let svg = d3.select('svg');

    let color = [
      '#045a8d',
      '#2b8cbe',
      '#74a9cf',
      '#bdc9e1',
      '#f1eef6',
      '#fff7ec',
      '#fee8c8',
      '#fdd49e',
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
        .attr('y', 150)
        .text('');

      textContainer
        .append('text')
        .attr('x', width - 1200)
        .attr('y', height - 760)
        .attr('id', 'description')
        .text(`1753 - 2015: base temperature ${values.baseTemperature}℃`)
        .style('font-size', '1.5em')
        .style('text-align', 'center');
    };

    const drawCanvas = () => {
      svg.attr('width', width);
      svg.attr('height', height);
    };
    const generateScales = () => {
      values.monthlyVariance.forEach((item) => {
        const parsedTime = item.month;
        item.month = new Date(1750, parsedTime - 1);
      });
      const dataYear = values.monthlyVariance.map((item) => {
        return new Date(item.year);
      });
      console.log(dataYear);

      yScale = d3
        .scaleOrdinal()
        .domain(
          extent(values.monthlyVariance, (item) => {
            return item.month;
          })
        )
        .range([padding, height - padding]);

      xScale = d3
        .scaleTime()
        .domain(extent(dataYear))
        .range([padding, width - padding]);

      xAxisScale = d3
        .scaleLinear()
        .domain(extent(dataYear))
        .range([padding, width - padding]);

      yAxisScale = d3
        .scaleTime()
        .domain(
          extent(values.monthlyVariance, (item) => {
            return item.month;
          })
        )
        .range([padding, height - padding]);

      colorScale.domain(
        d3.extent(values.monthlyVariance, (item) => {
          return item.variance;
        })
      );

      return { xScale, yScale, dataYear };
    };
    const tooltipAndLegend = () => {
      const legend = d3.select('svg').append('svg').attr('id', 'legend');
      const legendColors = legend
        .selectAll('#legend')
        .data(color)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
          return 'translate(0,' + (height / 2 - i * 20) + ')';
        });

      // legendColors
      //   .append('rect')
      //   .attr('x', width - 530)
      //   .attr('y', height - 200)
      //   .attr('width', 18)
      //   .attr('height', 18)
      //   .style('fill', color);

      // legendColors
      //   .append('text')
      //   .attr('x', width - 530)
      //   .attr('y', height - 500)
      //   .attr('id', 'legend-sign')
      //   .text((item) => {
      //     if (item) {
      //       return 'Heat';
      //     } else {
      //       return 'Cold';
      //     }
      //   })
      //   .style('font-size', '0.7em');
    };
    const drawBars = () => {
      var barWidth = 15 + 'px';
      var barHeight = 30 + 'px';

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
        .attr('data-year', (item) => {
          return item.year;
        })
        .attr('data-month', (item) => {
          return item.month;
        })
        .attr('data-temp', (item) => {
          return item.variance;
        })
        .attr('width', barWidth)
        .attr('height', barHeight)
        .attr('x', (item) => {
          return xAxisScale(item.year);
        })
        .attr('y', (item) => {
          return yAxisScale(item.month);
        })
        .style('fill', (item) => {
          return colorScale(item.variance);
        })
        .on('mouseover', (event, item) => {
          const [x, y] = pointer(event);
          tooltip.transition().style('visibility', 'visible');
          tooltip
            .html(
              '<p>Year: ' +
                d3.format('d')(item.year) +
                '</p><p>℃ in Month: ' +
                (values.baseTemperature + item.variance).toFixed(2) +
                '</p><p>℃ Differents: ' +
                Math.max(item.variance.toFixed(2)) +
                '</p><p>Month: ' +
                d3.timeFormat('%B')(item.month) +
                '</p>'
            )
            .style('left', x + 80 + 'px')
            .style('top', y - 70 + 'px')
            .style('position', 'absolute');
        })
        .on('mouseout', () => {
          tooltip.transition().style('visibility', 'hidden');
        });
    };
    const formatMonths = d3.timeFormat('%B');
    const generateAxis = () => {
      const xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.format('d'));
      const yAxis = d3.axisLeft(yAxisScale).tickFormat(formatMonths);
      svg
        .append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0, ' + (height - padding) + ')')
        .style('font-size', '18px');

      svg
        .append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ',  0)')
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
      <svg className='App' id='div2'></svg>
    </div>
  );
}
