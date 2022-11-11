import { Movie } from "../externals/Radarr.ts";

export function MovieList(props: { movies: Movie[] }) {
  return (
    <div class="flex flex-nowrap overflow-x-scroll">
      {props.movies.map((movie) => <MovieElement movie={movie} />)}
    </div>
  );
}

function isNew(date: Date) {
  const threshold = new Date(Date.now() - 86400000); // -24h
  return date > threshold;
}

function MovieStatus({ movie }: { movie: Movie }) {
  // If we have a file, then the movie is available on Emby
  if (movie.hasFile === true) {
    return <p class="text-green-500">On Emby</p>;
  }

  // If the movies isn't available, we wait for a release.
  if (movie.isAvailable === false) {
    return (
      <p class="text-yellow-500">
        Waiting {movie.physicalRelease.toLocaleDateString()}
      </p>
    );
  }

  // If the movie has only been in radarr for less than 24 hours.
  if (isNew(movie.added)) {
    return <p class="text-yellow-500">Searching</p>;
  }

  // If we don't have a file and the movie is released (metadata) we should have been downloading it.
  return <p class="text-red-500">Failed</p>;
}

function MovieElement({ movie }: { movie: Movie }) {
  return (
    <div class="mt-2 mr-4 bg-gray-800 rounded">
      <div
        class="w-40 h-60 bg-cover rounded-t"
        style={`background-image: url("${movie.images[0]?.remoteUrl}");`}
      />
      <div class="left-0 right-0 p-2 text-center">
        <MovieStatus movie={movie} />
      </div>
    </div>
  );
}
