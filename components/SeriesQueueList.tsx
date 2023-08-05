import { Series, SeriesQueue } from "../externals/Sonarr.ts";

type SeriesQueueExtended = SeriesQueue & { image: string };

export function SeriesQueueList(
  props: { queue: SeriesQueue[]; series: Series[] },
) {
  const summary = props.queue.reduce((acc, cur) => {
    if (acc.find((x) => x.title === cur.title)) {
      return acc;
    }
    acc.push(cur);
    return acc;
  }, [] as SeriesQueue[]);

  const seriesQueue = summary.map((item) => {
    const series = props.series.find((x) => x.id === item.seriesId);
    return {
      ...item,
      image: series?.images[1].remoteUrl,
    } as SeriesQueueExtended;
  });

  return (
    <div class="flex flex-nowrap overflow-x-scroll">
      {seriesQueue.map((item) => <SeriesQueueElement queueItem={item} />)}
    </div>
  );
}

function SeriesQueueElement({ queueItem }: { queueItem: SeriesQueueExtended }) {
  const progress = 100 - (queueItem.sizeleft / queueItem.size * 100);

  return (
    <div class="mt-2 mr-4 bg-gray-800 rounded text-white">
      <div
        class="w-40 h-60 bg-cover rounded-t"
        style={`background-image: url("${queueItem.image}");`}
      >
      </div>
      <div class="left-0 right-0 p-2 text-center">
        {queueItem.status === "paused"
          ? <p class="text-yellow-500 inline">Paused</p>
          : <p class="text-green-500 inline">Downloading</p>}
        {isNaN(progress)
          ? (
            <p class="inline pl-1">
              0%
            </p>
          )
          : <p class="inline pl-1">{progress.toFixed(0)}%</p>}
      </div>
    </div>
  );
}
