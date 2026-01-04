import Card from "./Card";
import type { Exercise, MediaPref } from "@/lib/types";

function isYoutube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function youtubeEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${id}`;
    }
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
  } catch {}
  return null;
}

type ImgKind = "start" | "end";
type ImgStatus = "draft" | "approved";

type LooseExerciseImage = {
  kind: ImgKind;
  url?: string | null;
  status?: ImgStatus;
  source?: string | null;
  license?: string | null;
  notes?: string | null;
};

function pickImage(ex: Exercise, kind: ImgKind): LooseExerciseImage | null {
  const images = ((ex as unknown as { images?: LooseExerciseImage[] }).images ?? []) as LooseExerciseImage[];
  return images.find((i) => i.kind === kind) ?? null;
}

function DraftBadge({ status }: { status: ImgStatus }) {
  if (status !== "draft") return null;
  return (
    <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-200">
      Do weryfikacji
    </span>
  );
}

export default function MediaBlock({ ex, pref }: { ex: Exercise; pref: MediaPref }) {
  const wantsImage = pref === "image" || pref === "both";
  const wantsVideo = pref === "video" || pref === "both";

  const startImg = pickImage(ex, "start");
  const endImg = pickImage(ex, "end");

  // fallback na legacy
  const legacyStartUrl = !startImg?.url ? ex.imageUrl ?? null : null;

  const hasAnyImage = Boolean(startImg?.url || endImg?.url || legacyStartUrl);
  const hasVideo = Boolean(ex.videoUrl);

  const embed = ex.videoUrl && isYoutube(ex.videoUrl) ? youtubeEmbed(ex.videoUrl) : null;

  // Placeholder tylko wtedy, gdy nie ma absolutnie nic do pokazania wg preferencji
  const nothingToShow = (!wantsImage || !hasAnyImage) && (!wantsVideo || !hasVideo);

  // statusy: jeśli brak, traktujemy jako draft (bezpieczniej)
  const startStatus: ImgStatus = (startImg?.status ?? (legacyStartUrl ? "draft" : "draft")) as ImgStatus;
  const endStatus: ImgStatus = (endImg?.status ?? "draft") as ImgStatus;

  return (
    <Card title="Wizualizacja">
      <div className="space-y-3">
        {wantsImage && (
          <div className="grid grid-cols-2 gap-2">
            {/* START */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-xs text-white/70">Pozycja startowa</div>
                <DraftBadge status={startStatus} />
              </div>

              {startImg?.url || legacyStartUrl ? (
                // używamy <img>, żeby nie konfigurować domen w next/image
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={(startImg?.url ?? legacyStartUrl) as string}
                  alt={`${ex.name_pl} – start`}
                  className="h-44 w-full rounded-lg border border-white/10 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-44 items-center justify-center rounded-lg border border-white/10 text-xs text-white/60">
                  Brak obrazka
                </div>
              )}
            </div>

            {/* END */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-xs text-white/70">Pozycja końcowa</div>
                <DraftBadge status={endStatus} />
              </div>

              {endImg?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={endImg.url as string}
                  alt={`${ex.name_pl} – koniec`}
                  className="h-44 w-full rounded-lg border border-white/10 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-44 items-center justify-center rounded-lg border border-white/10 text-xs text-white/60">
                  Brak obrazka
                </div>
              )}
            </div>
          </div>
        )}

        {wantsVideo && (
          <div>
            {hasVideo ? (
              embed ? (
                <iframe
                  className="aspect-video w-full rounded-xl border border-white/10"
                  src={embed}
                  title={ex.name_pl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <a className="text-sm" href={ex.videoUrl!} target="_blank" rel="noreferrer">
                  Otwórz wideo
                </a>
              )
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">Brak wideo.</div>
            )}
          </div>
        )}

        {nothingToShow && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
            Brak wizualizacji — dodaj w exerciseCatalog: images[start/end] lub legacy imageUrl / videoUrl.
          </div>
        )}
      </div>
    </Card>
  );
}
