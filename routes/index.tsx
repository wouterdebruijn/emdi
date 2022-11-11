import { Handlers, PageProps } from "https://deno.land/x/fresh@1.1.1/server.ts";
import { Torrent } from "../externals/Deluge.ts";
import { Movie, MovieQueue } from "../externals/Radarr.ts";
import { Series, SeriesQueue } from "../externals/Sonarr.ts";

import { MovieList } from "../components/MovieList.tsx";
import { SeriesList } from "../components/SeriesList.tsx";
import { MovieQueueList } from "../components/MovieQueueList.tsx";
import { SeriesQueueList } from "../components/SeriesQueueList.tsx";

import { services } from "../main.ts";
import { JSXInternal } from "https://esm.sh/v95/preact@10.11.0/src/jsx.d.ts";

function getLatestMovies() {
  return services.radarr.getMovies();
}

function getLatestSeries() {
  return services.sonarr.getSeries();
}

function getCurrentMovieQueue() {
  return services.radarr.getQueue();
}

function getCurrentSeriesQueue() {
  return services.sonarr.getQueue();
}

interface Data {
  movies: Movie[];
  series: Series[];
  radarrQueue: MovieQueue[];
  sonarrQueue: SeriesQueue[];
  limit: number;
}

export const handler: Handlers<Data> = {
  async GET(request, ctx) {
    const movies = await (await getLatestMovies()).reverse();
    const series = await (await getLatestSeries()).reverse();

    const radarrQueue = await getCurrentMovieQueue();
    const sonarrQueue = await getCurrentSeriesQueue();

    const limit = new URL(request.url).searchParams.get("limit") ?? 25;

    return ctx.render({
      movies,
      series,
      radarrQueue,
      sonarrQueue,
      limit: +limit,
    });
  },
};

export default function Home({ data }: PageProps<Data>) {
  let movieQueueList: JSXInternal.Element | null = null;
  let seriesQueueList: JSXInternal.Element | null = null;

  if (data.radarrQueue.length > 0) {
    movieQueueList = (
      <section class="mx-2 m-3">
        <h1 class="text-xl font-bold text-white">Current Movie Queue</h1>
        <MovieQueueList queue={data.radarrQueue} movies={data.movies} />
      </section>
    );
  }

  if (data.sonarrQueue.length > 0) {
    seriesQueueList = (
      <section class="mx-2 m-3">
        <h1 class="text-xl font-bold text-white">Current Series Queue</h1>
        <SeriesQueueList queue={data.sonarrQueue} series={data.series} />
      </section>
    );
  }

  return (
    <div class="bg-gray-900 min-h-screen pb-16">
      <div class="max-w-screen">
        <header class="bg-green-800 flex items-center">
          <img
            src="/logo.svg"
            class="w-16 h-16 mx-2"
            alt="the fresh logo: a sliced lemon dripping with juice"
          />
          <h1 class="font-bold text-white">Emdi - Media Dashboard</h1>
        </header>
      </div>

      <section class="mx-2 m-3">
        <h1 class="text-xl font-bold text-white">Latest Movies</h1>
        <MovieList movies={Array.from(data.movies).slice(0, data.limit)} />
      </section>

      <section class="mx-2 m-3">
        <h1 class="text-xl font-bold text-white">Latest Shows</h1>
        <SeriesList series={Array.from(data.series).slice(0, data.limit)} />
      </section>

      {movieQueueList}

      {seriesQueueList}
    </div>
  );
}
