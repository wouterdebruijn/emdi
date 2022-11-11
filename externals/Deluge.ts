import { ApiError, ExternalApi } from "./ExternalApi.ts";

export interface LastError {
  value: number;
  category: string;
}

export interface Tracker {
  url: string;
  trackerid: string;
  tier: number;
  fail_limit: number;
  source: number;
  verified: boolean;
  message: string;
  last_error: LastError;
  next_announce?: unknown;
  min_announce?: unknown;
  scrape_incomplete: number;
  scrape_complete: number;
  scrape_downloaded: number;
  fails: number;
  updating: boolean;
  start_sent: boolean;
  complete_sent: boolean;
  endpoints: unknown[];
  send_stats: boolean;
}

export interface LastError {
  value: number;
  category: string;
}

export interface File {
  index: number;
  path: string;
  size: number;
  offset: number;
}

export interface OrigFile {
  index: number;
  path: string;
  size: number;
  offset: number;
}

export interface Torrent {
  active_time: number;
  seeding_time: number;
  finished_time: number;
  all_time_download: number;
  storage_mode: string;
  distributed_copies: number;
  download_payload_rate: number;
  file_priorities: number[];
  hash: string;
  auto_managed: boolean;
  is_auto_managed: boolean;
  is_finished: boolean;
  max_connections: number;
  max_download_speed: number;
  max_upload_slots: number;
  max_upload_speed: number;
  message: string;
  move_on_completed_path: string;
  move_on_completed: boolean;
  move_completed_path: string;
  move_completed: boolean;
  next_announce: number;
  num_peers: number;
  num_seeds: number;
  owner: string;
  paused: boolean;
  prioritize_first_last: boolean;
  prioritize_first_last_pieces: boolean;
  sequential_download: boolean;
  progress: number;
  shared: boolean;
  remove_at_ratio: boolean;
  save_path: string;
  download_location: string;
  seeds_peers_ratio: number;
  seed_rank: number;
  state: string;
  stop_at_ratio: boolean;
  stop_ratio: number;
  time_added: number;
  total_done: number;
  total_payload_download: number;
  total_payload_upload: number;
  total_peers: number;
  total_seeds: number;
  total_uploaded: number;
  total_wanted: number;
  total_remaining: number;
  tracker: string;
  tracker_host: string;
  trackers: Tracker[];
  tracker_status: string;
  upload_payload_rate: number;
  comment: string;
  creator: string;
  num_files: number;
  num_pieces: number;
  piece_length: number;
  private: boolean;
  total_size: number;
  eta: number;
  file_progress: number[];
  files: File[];
  orig_files: OrigFile[];
  is_seed: boolean;
  peers: unknown[];
  queue: number;
  ratio: number;
  completed_time: number;
  last_seen_complete: number;
  name: string;
  pieces?: unknown;
  seed_mode: boolean;
  super_seeding: boolean;
  time_since_download: number;
  time_since_upload: number;
  time_since_transfer: number;
  id: string;
}

export interface DelugeTorrentResponse {
  result: Record<string, Torrent>;
  error?: unknown;
  id: number;
}

export class DelugeAPI extends ExternalApi {
  private password: string;

  constructor(host: URL, password: string) {
    super(host);
    this.password = password;
  }

  private async login() {
    const response = await fetch(new URL("/json", this.getBaseURL()), {
      method: "POST",
      body: JSON.stringify({
        method: "auth.login",
        params: [this.password],
        id: 1,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (response) => {
      if (
        response.ok &&
        response.headers.get("Content-Type")?.toLowerCase().includes(
          "application/json",
        )
      ) {
        return response;
      }

      throw new ApiError(response, await response.text());
    });

    const authentication_cookie = response.headers.get("Set-Cookie");
    if (typeof authentication_cookie !== "string") {
      throw new ApiError(response, await response.json());
    }
    return authentication_cookie;
  }

  public async getTorrents(): Promise<Torrent[]> {
    const authentication_cookie = await this.login();

    const response = await this.post<DelugeTorrentResponse>(
      "/json",
      JSON.stringify(
        {
          method: "core.get_torrents_status",
          params: [[], []],
          id: 1,
        },
      ),
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: authentication_cookie,
        },
      },
    );

    const torrents = Object.values(response.result);
    const ids = Object.keys(response.result);

    return torrents.map((torrent, index) => {
      return {
        ...torrent,
        id: ids[index],
      };
    });
  }
}
