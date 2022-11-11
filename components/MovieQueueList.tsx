import { Movie, MovieQueue } from "../externals/Radarr.ts";

type MovieQueueExtended = MovieQueue & { image: string };

export function MovieQueueList(
  props: { queue: MovieQueue[]; movies: Movie[] },
) {
  const movieQueue = props.queue.map((item) => {
    const movie = props.movies.find((x) => x.id === item.movieId);
    return {
      ...item,
      image: movie?.images[0].remoteUrl,
    } as MovieQueueExtended;
  });

  return (
    <div class="flex flex-nowrap overflow-x-scroll">
      {movieQueue.map((item) => <MovieQueueElement movie={item} />)}
    </div>
  );
}

function MovieQueueElement({ movie }: { movie: MovieQueueExtended }) {
  const progress = 100 - (movie.sizeleft / movie.size * 100);

  return (
    <div class="mt-2 mr-4 bg-gray-800 rounded text-white">
      <div
        class="w-40 h-60 bg-cover rounded-t"
        style={`background-image: url("${movie.image}");`}
      />
      <div class="left-0 right-0 p-2 text-center">
        {movie.status === "paused"
          ? <p class="text-yellow-500 inline">Paused</p>
          : <p class="text-green-500 inline">Downloading</p>}
        <p class="inline pl-1">{progress.toFixed(2)}%</p>
      </div>
    </div>
  );
}
