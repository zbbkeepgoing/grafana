import { DisplayValue } from './displayValue';

export interface YAxis {
  index: number;
  min?: number;
  tickDecimals?: number;
}

export type GraphSeriesValue = number | null;

/** View model projection of a series */
export interface GraphSeriesXY {
  color: string;
  data: GraphSeriesValue[][]; // [x,y][]
  isVisible: boolean;
  label: string;
  yAxis: YAxis;

  info?: DisplayValue[]; // Legend info
}

export interface CreatePlotOverlay {
  (element: JQuery, event: any, plot: { getOptions: () => { events: { manager: any } } }): any;
}
