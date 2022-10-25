import { Handlers, PageProps } from "https://deno.land/x/fresh@1.1.1/server.ts";
import { Torrent } from "../externals/Deluge.ts";
import { Movie, QueueItem } from "../externals/Radarr.ts";

import { services } from "../main.ts";

function getLatestMovies() {
  return services.radarr.getLastMovies(20);
}

function getCurrentQueue() {
  return services.radarr.getQueue();
}

function getCurrentTorrents() {
  return services.deluge.getTorrents();
}

interface Data {
  movies: Movie[];
  torrents: Torrent[];
  radarrQueue: QueueItem[];
}

export const handler: Handlers<Data> = {
  async GET(_, ctx) {
    const movies = await getLatestMovies();
    const torrents = await getCurrentTorrents();
    const radarrQueue = await getCurrentQueue();

    return ctx.render({ movies, torrents, radarrQueue });
  },
};

export default function Home({ data }: PageProps<Data>) {
  const movieObjects = data.movies.map((movie) => Movie(movie));
  const torrentObjects = data.torrents.map((torrent) => Torrent(torrent));
  const radarrQueue = data.radarrQueue.map((item) => QueueItem(item));

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
        <h1 class="text-xl font-bold">Current Queue</h1>
        <div class="flex flex-col overflow-x-scroll">
          {radarrQueue}
        </div>
      </section>

      <section class="mx-2 m-3">
        <h1 class="text-xl font-bold">Current Torrents</h1>
        <div class="flex flex-col overflow-x-scroll">
          {torrentObjects}
        </div>
      </section>
    </div>
  );
}

function Movie(movie: Movie) {
  return (
    <div class="flex-none w-48 pr-2 m-2 border">
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
    <div class="my-1 p-2 border">
      <div>
        <h2 class="font-bold inline" title={torrent.name}>
          {torrent.name.slice(0, 32)}
        </h2>
        <pre class="text-xs inline ml-2">({ torrent.id })</pre>
      </div>
      {torrent.state === "Seeding"
        ? <p class="text-green-500 inline">Complete</p>
        : <p class="text-yellow-500 inline">Downloading</p>}
      <p class="inline pl-1">{torrent.progress.toFixed(2)}%</p>
      <p>Was available on: {lastSeenDate.toLocaleTimeString()}</p>
    </div>
  );
}

function QueueItem(item: QueueItem) {
  const progress = 100 - (item.sizeleft / item.size * 100);

  return (
    <div class="my-1 p-2 border">
      <h2 class="font-bold">{item.title}</h2>
      {item.status === "paused"
        ? <p class="text-yellow-500 inline">Paused</p>
        : <p class="text-green-500 inline">Downloading</p>}
      <p class="inline pl-1">{progress.toFixed(2)}%</p>
    </div>
  );
}
