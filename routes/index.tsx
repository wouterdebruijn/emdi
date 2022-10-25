import { Handlers, PageProps } from "https://deno.land/x/fresh@1.1.1/server.ts";
import { Torrent } from "../externals/Deluge.ts";
import { Movie } from "../externals/Radarr.ts";

import { services } from "../main.ts";

function getLatestMovies() {
  return services.radarr.getLastMovies(20);
}

interface Data {
  movies: Movie[];
  torrents: Torrent[];
}

export const handler: Handlers<Data> = {
  async GET(_, ctx) {
    const movies = await getLatestMovies();
    const torrents = await services.deluge.getTorrents();
    return ctx.render({ movies, torrents });
  },
};

export default function Home({ data }: PageProps<Data>) {
  const movieObjects = data.movies.map((movie) => Movie(movie));
  const torrentObjects = data.torrents.map((torrent) => Torrent(torrent));

  return (
    <div>
      <div class="max-w-screen">
        <header class="bg-green-400 flex items-center">
          <img
            src="/logo.svg"
            class="w-16 h-16 mx-2"
            alt="the fresh logo: a sliced lemon dripping with juice"
          />
          <h1 class="font-bold">Emdi - Media Dashboard</h1>
        </header>
      </div>

      <section class="mx-2 m-3">
        <h1 class="text-xl font-bold">Latest Movies</h1>
        <div class="flex flex-nowrap overflow-x-scroll">
          {movieObjects}
        </div>
      </section>

      <section class="mx-2 m-3">
        <h1 class="text-xl font-bold">Latest Torrents</h1>
        <div class="flex flex-col overflow-x-scroll">
          {torrentObjects}
        </div>
      </section>
    </div>
  );
}

function Movie(movie: Movie) {
  return (
    <div class="flex-none w-48 pr-2">
      <img src={movie.images[0].remoteUrl} />
      <div>
        <h2>{movie.title}</h2>
        <p>{movie.year}</p>
        {movie.hasFile
          ? <p class="text-green-500">Downloaded</p>
          : <p class="text-red-500">Not Downloaded</p>}
        {movie.isAvailable
          ? <p class="text-green-500">Released</p>
          : <p class="text-yellow-500">Not Released</p>}
      </div>
    </div>
  );
}

function Torrent(torrent: Torrent) {
  const lastSeenDate = new Date(torrent.last_seen_complete * 1000);

  return (
    <div>
      <h2 class="font-bold" title={torrent.name}>
        {torrent.name.slice(0, 32)}
      </h2>
      {torrent.state === "Seeding"
        ? <p class="text-green-500">Complete</p>
        : <p class="text-yellow-500">Downloading</p>}
      <p>{torrent.progress}%</p>
      <p>Was available on: {lastSeenDate.toLocaleTimeString()}</p>
    </div>
  );
}
