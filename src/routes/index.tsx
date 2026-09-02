import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Clapperboard,
  ExternalLink,
  Film,
  Link as LinkIcon,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fluxo — Vídeos" },
      {
        name: "description",
        content: "Uma biblioteca de vídeos simples, rápida e organizada.",
      },
    ],
  }),
  component: VideoHome,
});

type VideoItem = {
  id: string;
  title: string;
  url: string;
  description: string;
  createdAt: number;
};

const STORAGE_KEY = "fluxo-video-library-v1";

const starterVideos: VideoItem[] = [
  {
    id: "starter-1",
    title: "Seu primeiro vídeo",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Exemplo inicial. Substitua pelo seu próprio conteúdo no painel.",
    createdAt: 1,
  },
];

function getYoutubeId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/watch")) {
        return parsed.searchParams.get("v") ?? "";
      }

      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") {
        return parts[1] ?? "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

function getEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\\./, "");

    const youtubeId = getYoutubeId(url);
    if (youtubeId && (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be")) {
      return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`;
    }

    if (host === "vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    if (host === "dailymotion.com" || host === "dai.ly") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const id = host === "dai.ly" ? parts[0] : parts[1];
      return id ? `https://www.dailymotion.com/embed/video/${id}` : null;
    }

    // For other video-page URLs, try rendering the page inside the player.
    // The destination can still refuse embedding via its own CSP/X-Frame-Options.
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function loadVideos(): VideoItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return starterVideos;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : starterVideos;
  } catch {
    return starterVideos;
  }
}

function saveVideos(videos: VideoItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
}

function VideoPlayer({ video }: { video: VideoItem }) {
  const embed = getEmbedUrl(video.url);

  if (embed) {
    return (
      <iframe
        src={embed}
        title={video.title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  if (isDirectVideo(video.url)) {
    return (
      <video
        src={video.url}
        controls
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
      />
    );
  }

  // Generic video pages are rendered inline when the provider allows iframe embedding.
  if (embed) {
    return (
      <iframe
        src={embed}
        title={video.title}
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <LinkIcon className="size-8 text-primary" />
      <p className="text-sm text-muted-foreground">
        Não foi possível incorporar este endereço como player.
      </p>
      <a
        href={video.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Abrir vídeo <ExternalLink className="size-4" />
      </a>
    </div>
  );
}

function VideoHome() {
  const [videos, setVideos] = useState<VideoItem[]>(starterVideos);
  const [selectedId, setSelectedId] = useState(starterVideos[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const loaded = loadVideos();
    setVideos(loaded);
    setSelectedId(loaded[0]?.id ?? "");
  }, []);

  const selected = videos.find((video) => video.id === selectedId) ?? videos[0];

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return videos;
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(normalized) ||
        video.description.toLowerCase().includes(normalized),
    );
  }, [videos, query]);

  function addVideo(e: React.FormEvent) {
    e.preventDefault();
    const cleanUrl = url.trim();
    const cleanTitle = title.trim();
    if (!cleanUrl || !cleanTitle) return;

    try {
      new URL(cleanUrl);
    } catch {
      return;
    }

    const video: VideoItem = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      url: cleanUrl,
      description: description.trim(),
      createdAt: Date.now(),
    };

    const next = [video, ...videos];
    setVideos(next);
    saveVideos(next);
    setSelectedId(video.id);
    setTitle("");
    setUrl("");
    setDescription("");
    setAdminOpen(false);
  }

  function removeVideo(id: string) {
    const next = videos.filter((video) => video.id !== id);
    setVideos(next);
    saveVideos(next);
    setSelectedId(next[0]?.id ?? "");
  }

  function openAdmin() {
    setAdminOpen(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
          <button
            type="button"
            onDoubleClick={openAdmin}
            className="group flex shrink-0 items-center gap-2 rounded-xl px-1 py-1"
            title="Clique duas vezes para abrir o painel"
            aria-label="Fluxo"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Film className="size-5" />
            </span>
            <span className="text-base font-black tracking-tight">FLUXO</span>
          </button>

          <div className="relative ml-auto w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar vídeos..."
              className="h-10 w-full rounded-xl border border-border bg-secondary pl-9 pr-3 text-sm outline-none transition focus:border-ring"
            />
          </div>

          <button
            type="button"
            onClick={() => setAdminOpen(true)}
            className="hidden shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:flex"
          >
            <Plus className="size-4" />
            Adicionar
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-7">
        {selected ? (
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10">
            <div className="aspect-video bg-black">
              <VideoPlayer video={selected} />
            </div>
            <div className="p-5 md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
                    Assistindo agora
                  </p>
                  <h1 className="text-xl font-bold tracking-tight md:text-2xl">{selected.title}</h1>
                  {selected.description && (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {selected.description}
                    </p>
                  )}
                </div>
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
                >
                  Abrir original <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Clapperboard className="mx-auto size-10 text-muted-foreground" />
            <h1 className="mt-4 text-xl font-bold">Sua biblioteca está vazia</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Abra o painel pelo botão Adicionar e cole o endereço de um vídeo.
            </p>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Biblioteca</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "vídeo disponível" : "vídeos disponíveis"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAdminOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
              aria-label="Adicionar vídeo"
            >
              <Plus className="size-5" />
            </button>
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((video) => {
                const youtubeId = getYoutubeId(video.url);
                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => setSelectedId(video.id)}
                    className="group overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
                  >
                    <div className="relative aspect-video overflow-hidden bg-secondary">
                      {youtubeId ? (
                        <img
                          src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Film className="size-9 text-muted-foreground" />
                        </div>
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
                        <span className="flex size-11 scale-90 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-xl transition group-hover:scale-100 group-hover:opacity-100">
                          <Play className="ml-0.5 size-5 fill-current" />
                        </span>
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-semibold">{video.title}</h3>
                      {video.description && (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Nenhum vídeo encontrado para “{query}”.
            </div>
          )}
        </section>
      </main>

      {adminOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-border bg-card p-5 shadow-2xl md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Painel admin</p>
                <h2 className="mt-1 text-xl font-bold">Adicionar vídeo</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cole um link do YouTube, Vimeo ou um arquivo de vídeo direto.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Fechar painel"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={addVideo} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Título</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ex.: Apresentação do projeto"
                  className="h-11 w-full rounded-xl border border-border bg-secondary px-3.5 text-sm outline-none focus:border-ring"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Link do vídeo</span>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="h-11 w-full rounded-xl border border-border bg-secondary px-3.5 text-sm outline-none focus:border-ring"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Descrição <span className="font-normal">(opcional)</span>
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Uma breve descrição..."
                  className="w-full resize-none rounded-xl border border-border bg-secondary px-3.5 py-3 text-sm outline-none focus:border-ring"
                />
              </label>

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="size-4" />
                Publicar vídeo
              </button>
            </form>

            {videos.length > 0 && (
              <div className="mt-7 border-t border-border pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Vídeos cadastrados</h3>
                  <span className="text-xs text-muted-foreground">{videos.length}</span>
                </div>
                <div className="space-y-2">
                  {videos.map((video) => (
                    <div key={video.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Film className="size-4 text-primary" />
                      </div>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{video.title}</span>
                      <button
                        type="button"
                        onClick={() => removeVideo(video.id)}
                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Excluir ${video.title}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
