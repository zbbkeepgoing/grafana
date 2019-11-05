import { DataFrame, FieldType, parseLabels, KeyValue, CircularDataFrame } from '@grafana/data';
import { Observable } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { LokiLegacyStreamResponse } from './types';
import { finalize, map } from 'rxjs/operators';
import { appendResponseToBufferedData } from './result_transformer';

/**
 * Maps directly to a query in the UI (refId is key)
 */
export interface LiveTarget {
  query: string;
  regexp: string;
  url: string;
  refId: string;
  size: number;
}

/**
 * Cache of websocket streams that can be returned as observable. In case there already is a stream for particular
 * target it is returned and on subscription returns the latest dataFrame.
 */
export class LiveStreams {
  private streams: KeyValue<Observable<DataFrame[]>> = {};

  getStream(target: LiveTarget): Observable<DataFrame[]> {
    let stream = this.streams[target.url];
    if (stream) {
      return stream;
    }

    const data = new CircularDataFrame({ capacity: target.size });
    data.labels = parseLabels(target.query);
    [
      { name: 'ts', type: FieldType.time, config: { title: 'Time' } },
      { name: 'line', type: FieldType.string },
      { name: 'labels', type: FieldType.other },
      { name: 'id', type: FieldType.string },
    ].forEach(f => data.addField(f));

    stream = webSocket(target.url).pipe(
      finalize(() => {
        delete this.streams[target.url];
      }),
      map((response: LokiLegacyStreamResponse) => {
        appendResponseToBufferedData(response, data);
        return [data];
      })
    );
    this.streams[target.url] = stream;

    return stream;
  }
}
