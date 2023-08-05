import { Handlers, PageProps } from "https://deno.land/x/fresh@1.1.1/server.ts";
import { Movie } from "../externals/Radarr.ts";
import { Series } from "../externals/Sonarr.ts";

import { MovieList } from "../components/MovieList.tsx";
import { SeriesList } from "../components/SeriesList.tsx";

import { services } from "../main.ts";

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
  limit: number;
}

export const handler: Handlers<Data> = {
  async GET(request, ctx) {
    const movies = await (await getLatestMovies()).reverse();
    const series = await (await getLatestSeries()).reverse();

    const limit = new URL(request.url).searchParams.get("limit") ?? 25;

    return ctx.render({
      movies,
      series,
      limit: +limit,
    });
  },
};

export default function Home({ data }: PageProps<Data>) {
  return (
    <div class="bg-gray-900 min-h-screen pb-16">
      <div class="max-w-screen">
        <header class="bg-green-600 flex items-center">
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
    </div>
  );
}
