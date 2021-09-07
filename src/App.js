/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

import { pointer } from 'd3-selection';
import { extent, timeMonth } from 'd3';
import * as d3 from 'd3';

export default function App() {
  const [url] = useState(
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
  );
  const [req] = useState(new XMLHttpRequest());

  const width = 1600;
  const height = 800;
  const padding = 90;
  useEffect(() => {
    req.open('GET', url, true);
    req.onload = () => {
      data = JSON.parse(req.responseText);
      values = data.monthlyVariance;
      drawCanvas();
      generateScales();
      drawBars();
      generateAxis();
      infoText();
    };
    req.send();

    let data;
    let values = [];

    let xScale;
    let yScale;

    let xAxisScale;
    let yAxisScale;

    let svg = d3.select('svg');

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
        .attr('x', width - 850)
        .attr('y', height - 560)
        .attr('id', 'title')
        .text('')
        .style('font-size', '1.5em');
    };

    const drawCanvas = () => {
      svg.attr('width', width);
      svg.attr('height', height);
    };
    const generateScales = () => {
      values.forEach((item) => {
        const parsedTime = item.month;
        item.month = new Date(1750, parsedTime -1 );
      });
      const dataYear = values.map((item) => {
        return new Date(item.year);
      });
      console.log(dataYear);

      yScale = d3
        .scaleTime()
        .domain(
          extent(values)
        )
        .range([padding, height -  padding]);

      console.log(yScale);

      xScale = d3
        .scaleLinear()
        .domain(extent(dataYear))
        .range([padding, width - padding]);

      xAxisScale = d3
        .scaleLinear()
        .domain(extent(dataYear))
        .range([padding, width - padding]);

      yAxisScale = d3
        .scaleTime()
        .domain(
          extent(values, (item) => {
            return item.month;
          })
        )
        .range([padding, height - padding]);

      return { xScale, dataYear };
    };

    const drawBars = () => {
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('visibility', 'hidden')
        .style('width', 'auto')
        .style('height', 'auto');

      svg
        .selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('id', 'barOneDeath')
        .attr('width', (width - 2 * padding) / values.length)
        .attr('date', (item) => {
          return item.date;
        })
        .attr('new_deaths', (item) => {
          return item.new_deaths;
        })
        .attr('height', (item) => {
          return yScale(item.new_deaths);
        })
        .attr('x', (item, i) => {
          return xScale(i);
        })
        .attr('y', (item) => {
          return height - padding - yScale(item.new_deaths);
        });
      // .on('mouseover', (event, item) => {
      //   const [x, y] = pointer(event);
      //   tooltip.transition().style('visibility', 'visible');
      //   tooltip
      //     .html(
      //       item.date +
      //         ' - день/месяц <br/> ' +
      //         item.new_deaths +
      //         ' - Новые случаи'
      //     )
      //     .style('left', x[0] + 370 + 'px')
      //     .style('top', y[1] + 470 + 'px');

      //   document.querySelector('#tooltip').setAttribute('date', item.date);
      // })
      // .on('mouseout', () => {
      //   tooltip.transition().style('visibility', 'hidden');
      // });
    };
    const formatMonths = d3.timeFormat('%B');
    const generateAxis = () => {
      const xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.format('d'));
      const yAxisTwo = d3.axisLeft(yAxisScale).tickFormat(formatMonths);
      svg
        .append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0, ' + (height - padding) + ')')
        .style('font-size', '18px');

      svg
        .append('g')
        .call(yAxisTwo)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ',  0)')
        .style('font-size', '18px');
      return { xAxis, svg, yAxisTwo };
    };
  }, []);
  return (
    <div>
      <h2 className='text-center text-4xl p-4'>
        Monthly Global Land-Surface Temperature
      </h2>
      <svg className='App' id='div2'>
        <text x={width - 900} y={height - 20}></text>
      </svg>
    </div>
  );
}
