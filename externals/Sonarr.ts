import { ExternalApi } from "./ExternalApi.ts";

export interface AlternateTitle {
  title: string;
  sceneSeasonNumber: number;
  seasonNumber?: number;
}

export interface Image {
  coverType: string;
  url: string;
  remoteUrl: string;
}

export interface SeasonStatistics {
  episodeFileCount: number;
  episodeCount: number;
  totalEpisodeCount: number;
  sizeOnDisk: number;
  releaseGroups: string[];
  percentOfEpisodes: number;
  previousAiring?: Date;
}

export interface Season {
  seasonNumber: number;
  monitored: boolean;
  statistics: SeasonStatistics;
}

export interface Ratings {
  votes: number;
  value: number;
}

export interface Statistics {
  seasonCount: number;
  episodeFileCount: number;
  episodeCount: number;
  totalEpisodeCount: number;
  sizeOnDisk: number;
  releaseGroups: string[];
  percentOfEpisodes: number;
}

export interface Series {
  title: string;
  alternateTitles: AlternateTitle[];
  sortTitle: string;
  status: string;
  ended: boolean;
  overview: string;
  previousAiring: Date;
  network: string;
  airTime: string;
  images: Image[];
  seasons: Season[];
  year: number;
  path: string;
  qualityProfileId: number;
  languageProfileId: number;
  seasonFolder: boolean;
  monitored: boolean;
  useSceneNumbering: boolean;
  runtime: number;
  tvdbId: number;
  tvRageId: number;
  tvMazeId: number;
  firstAired: Date;
  seriesType: string;
  cleanTitle: string;
  imdbId: string;
  titleSlug: string;
  rootFolderPath: string;
  certification: string;
  genres: string[];
  tags: string[];
  added: Date;
  ratings: Ratings;
  statistics: Statistics;
  id: number;
}

export interface Language {
  id: number;
  name: string;
}

export interface Quality {
  id: number;
  name: string;
  source: string;
  resolution: number;
}

export interface Revision {
  version: number;
  real: number;
  isRepack: boolean;
}

export interface QualitySetting {
  quality: Quality;
  revision: Revision;
}

export interface SeriesQueue {
  seriesId: number;
  episodeId: number;
  language: Language;
  quality: QualitySetting;
  size: number;
  title: string;
  sizeleft: number;
  timeleft: string;
  estimatedCompletionTime: Date;
  status: string;
  trackedDownloadStatus: string;
  trackedDownloadState: string;
  statusMessages: any[];
  downloadId: string;
  protocol: string;
  downloadClient: string;
  indexer: string;
  outputPath: string;
  id: number;
}

export interface QueueResponse {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  totalRecords: number;
  records: SeriesQueue[];
}

export class SonarrAPI extends ExternalApi {
  private apiToken: string;

  constructor(host: URL, apiToken: string) {
    super(host);
    this.apiToken = apiToken;
  }

  private authenticationHeaders(): Headers {
    const headers = new Headers();
    headers.set("X-Api-Key", this.apiToken);
    return headers;
  }

  public async getSeries(): Promise<Series[]> {
    const response = await this.get<Series[]>("/api/v3/series", {
      headers: this.authenticationHeaders(),
    });

    const mapped = response.map((series) => {
      return {
        ...series,
        added: new Date(series.added),
        previousAiring: new Date(series.previousAiring),
        firstAired: new Date(series.firstAired),
      };
    });
    return mapped;
  }

  public async getQueue(): Promise<SeriesQueue[]> {
    const response = await this.get<QueueResponse>("/api/v3/queue?page=1&pageSize=100", {
      headers: this.authenticationHeaders(),
    });

    // TODO: Add pagination

    const records = response.records.map((queueItem) => {
      return {
        ...queueItem,
        estimatedCompletionTime: new Date(queueItem.estimatedCompletionTime),
      };
    });
    return records;
  }

  public async getLastSeries(limit = 15): Promise<Series[]> {
    const movies = await this.getSeries();
    return movies.reverse().slice(0, limit);
  }
}
