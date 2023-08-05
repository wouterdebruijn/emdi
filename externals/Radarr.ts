import { ExternalApi } from "./ExternalApi.ts";

export interface Language {
  id: number;
  name: string;
}

export interface AlternateTitle {
  sourceType: string;
  movieId: number;
  title: string;
  sourceId: number;
  votes: number;
  voteCount: number;
  language: Language;
  id: number;
}

export interface Image {
  coverType: string;
  url: string;
  remoteUrl: string;
}

export interface RatingSite {
  votes: number;
  value: number;
  type: string;
}

export interface Ratings {
  imdb: RatingSite;
  tmdb: RatingSite;
  metacritic: RatingSite;
  rottenTomatoes: RatingSite;
}

export interface Revision {
  version: number;
  real: number;
  isRepack: boolean;
}

export interface Quality {
  quality: {
    id: number;
    name: string;
    source: string;
    resolution: number;
    modifier: string;
  };
  revision: Revision;
}

export interface MediaInfo {
  audioBitrate: number;
  audioChannels: number;
  audioCodec: string;
  audioLanguages: string;
  audioStreamCount: number;
  videoBitDepth: number;
  videoBitrate: number;
  videoCodec: string;
  videoDynamicRangeType: string;
  videoFps: number;
  resolution: string;
  runTime: string;
  scanType: string;
  subtitles: string;
}

export interface MovieFile {
  movieId: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded: Date;
  sceneName: string;
  indexerFlags: number;
  quality: Quality;
  mediaInfo: MediaInfo;
  originalFilePath: string;
  qualityCutoffNotMet: boolean;
  languages: Language[];
  releaseGroup: string;
  edition: string;
  id: number;
}

export interface Collection {
  name: string;
  tmdbId: number;
  images: Image[];
}

export interface Movie {
  title: string;
  originalTitle: string;
  originalLanguage: Language;
  alternateTitles: AlternateTitle[];
  secondaryYearSourceId: number;
  sortTitle: string;
  sizeOnDisk: number;
  status: string;
  overview: string;
  inCinemas: Date;
  physicalRelease: Date;
  digitalRelease: Date;
  images: Image[];
  website: string;
  year: number;
  hasFile: boolean;
  youTubeTrailerId: string;
  studio: string;
  path: string;
  qualityProfileId: number;
  monitored: boolean;
  minimumAvailability: string;
  isAvailable: boolean;
  folderName: string;
  runtime: number;
  cleanTitle: string;
  imdbId: string;
  tmdbId: number;
  titleSlug: string;
  certification: string;
  genres: string[];
  added: Date;
  ratings: Ratings;
  movieFile: MovieFile;
  collection: Collection;
  id: number;
  isDownloading: boolean;
}

export interface MovieQueue {
  movieId: number;
  languages: Language[];
  quality: Quality;
  size: number;
  title: string;
  sizeleft: number;
  timeleft: string;
  estimatedCompletionTime: Date;
  status: string;
  trackedDownloadStatus: string;
  trackedDownloadState: string;
  downloadId: string;
  protocol: string;
  downloadClient: string;
  indexer: string;
  outputPath: string;
  id: number;
}

export class RadarrAPI extends ExternalApi {
  private apiToken: string;

  constructor(radarrHost: URL, apiToken: string) {
    super(radarrHost);
    this.apiToken = apiToken;
  }

  private authenticationHeaders(): Headers {
    const headers = new Headers();
    headers.set("X-Api-Key", this.apiToken);
    return headers;
  }

  public async getMovies(): Promise<Movie[]> {
    const response = await this.get<Movie[]>("/api/v3/movie", {
      headers: this.authenticationHeaders(),
    });

    const queue = await this.getQueue();

    const mapped = response.map((movie) => {
      return {
        ...movie,
        added: new Date(movie.added),
        inCinemas: new Date(movie.inCinemas),
        physicalRelease: new Date(movie.physicalRelease),
        digitalRelease: new Date(movie.digitalRelease),
        isDownloading: queue.some((queueItem) => queueItem.movieId === movie.id),
      };
    });
    return mapped;
  }

  public async getQueue(): Promise<MovieQueue[]> {
    const response = await this.get<MovieQueue[]>("/api/v3/queue/details", {
      headers: this.authenticationHeaders(),
    });

    const mapped = response.map((queueItem) => {
      return {
        ...queueItem,
        estimatedCompletionTime: new Date(queueItem.estimatedCompletionTime),
      };
    });
    return mapped;
  }

  public async getLastMovies(limit = 15): Promise<Movie[]> {
    const movies = await this.getMovies();
    return movies.reverse().slice(0, limit);
  }
}
