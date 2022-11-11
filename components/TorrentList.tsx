import { Torrent } from "../externals/Deluge.ts";

export function TorrentList(props: { torrents: Torrent[] }) {
  return (
    <div class="flex">
      {props.torrents.map((torrent) => <TorrentElement torrent={torrent} />)}
    </div>
  );
}

function TorrentElement({ torrent }: { torrent: Torrent }) {
  const lastSeenDate = new Date(torrent.last_seen_complete * 1000);

  return (
    <div class="my-1 p-2 text-white">
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
