import moment from 'moment';
import React, { useState } from 'react';
import { DomainPropType, DomainTuple } from 'victory';
import { VictoryAxisCommonProps } from 'victory-core';
import {
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryLine,
  VictoryZoomContainer,
} from 'victory-native';
import { findMax, findMin, WeightReport } from '../WeightTrackerLogic';

function WeightGraph({ weightReport, getWeights }: WeightGraphProps) {
  type Domain = { x: DomainTuple; y: DomainTuple };

  const nowTime = new Date().getTime();
  const minDate = weightReport.records
    .map(({ x }) => x)
    .concat(Infinity)
    .reduce(findMin);
  const applicableDate = Number.isNaN(minDate) && !isFinite(minDate);
  const yDomain: DomainTuple = [50, 120];

  const initalZoomDomains: Record<string, Domain> = {
    true: {
      x: [
        minDate,
        weightReport.records
          .map(({ x }) => x)
          .concat(0)
          .reduce(findMax),
      ],
      y: yDomain,
    },
    false: {
      x: [moment(new Date()).subtract(14, 'days').valueOf(), nowTime],
      y: yDomain,
    },
  };

  const [zoomDomain, setZoomDomain] = useState<Domain>(
    initalZoomDomains[(!!weightReport.records.length).toString()]
  );

  const axisStyle: VictoryAxisCommonProps['style'] = {
    grid: { stroke: 0 },
    ticks: { display: 'none' },
  };

  const domain: DomainPropType = {
    x: [
      moment(applicableDate ? minDate : nowTime)
        .subtract(360, 'days')
        .valueOf(),
      nowTime,
    ],
    y: yDomain,
  };

  return (
    <VictoryChart
      animate
      theme={VictoryTheme.material}
      containerComponent={
        <VictoryZoomContainer
          zoomDimension="x"
          zoomDomain={zoomDomain}
          onZoomDomainChange={({ x }) => {
            setZoomDomain({ x, y: yDomain });
            getWeights(moment(new Date(x[0])).toDate());
          }}
          allowZoom={false}
        />
      }
    >
      <VictoryAxis
        style={axisStyle}
        tickFormat={(x) => moment(new Date(x)).format('MMM D')}
      />
      <VictoryAxis dependentAxis style={axisStyle} />
      <VictoryLine data={weightReport.records} domain={domain} />
    </VictoryChart>
  );
}

interface WeightGraphProps {
  weightReport: WeightReport;
  getWeights: (date: Date) => void;
}

export default WeightGraph;
