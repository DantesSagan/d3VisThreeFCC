import * as d3 from 'd3';
import App from '../App';

export default function IntoText() {
  const { values } = App();
  const width = 1800;
  const height = 800;
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
      .style('text-align', 'center');

    textContainer
      .append('text')
      .attr('x', width - 200)
      .attr('y', height - 50)
      .text('Years');
  };
  return { infoText };
}
