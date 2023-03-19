import { Series } from "../externals/Sonarr.ts";

export function SeriesList(props: { series: Series[] }) {
  return (
    <div class="flex flex-nowrap overflow-x-scroll">
      {props.series.map((series) => <SeriesElement series={series} />)}
    </div>
  );
}

function isNew(date: Date) {
  const threshold = new Date(Date.now() - 86400000); // -24h
  return date > threshold;
}

function SeriesStatus({ series }: { series: Series }) {
  if (typeof series.statistics == "undefined") {
    return <p class="text-gray-500">Unknown</p>;
  }
  
  if (series.statistics.percentOfEpisodes == 100) {
    return <p class="text-green-500">On Emby</p>;
  }

  if (isNew(series.added)) {
    return <p class="text-yellow-500">Searching</p>;
  }

  return <p class="text-red-500">Failed</p>;
}

function SeriesElement({ series }: { series: Series }) {
  return (
    <div class="mt-2 mr-4 bg-gray-800 rounded">
      <div
        class="w-40 h-60 bg-cover rounded-t"
        style={`background-image: url("${series.images[1]?.remoteUrl}");`}
      />
      <div class="left-0 right-0 p-2 text-center">
        <SeriesStatus series={series} />
      </div>
    </div>
  );
}
