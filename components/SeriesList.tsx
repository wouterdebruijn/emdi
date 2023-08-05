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

  if (series.isDownloading) {
    return <p class="text-blue-500">Downloading</p>;
  }

  return <p class="text-red-500">Failed</p>;
}

function SeriesPicture({ series }: { series: Series }) {
  const externalUrl = series.images[1]?.remoteUrl;

  if (!externalUrl) {
    return (
      <div class="w-40 h-60 bg-gray-800 rounded-t flex items-center justify-center">
        <p class="text-center text-gray-500">🖼️ ❌ 🔍 😢</p>
      </div>
    );
  }

  return (
    <div
      class="w-40 h-60 bg-cover rounded-t"
      style={`background-image: url("/image?url=${externalUrl}");`}
    />
  );
}

function SeriesElement({ series }: { series: Series }) {
  return (
    <div class="mt-2 mr-4 bg-gray-800 rounded">
      <SeriesPicture series={series} />
      <div class="left-0 right-0 p-2 text-center">
        <SeriesStatus series={series} />
      </div>
    </div>
  );
}
