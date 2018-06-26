import React, { Component } from 'react';
import {BarChart, Bar, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';


class SimpleBarChart extends Component {
	render () {
    if(!this.props.data) {
      return  <div/>
    }
    return (
        <BarChart width={1000} height={300} data={this.props.data}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="name"/>
            <YAxis/>
            <Tooltip/>
            <Legend />
            <ReferenceLine y={0} stroke='#000'/>
            <Bar dataKey="score" fill="#82ca9d" />
        </BarChart>
    );
  }
};

export default SimpleBarChart;