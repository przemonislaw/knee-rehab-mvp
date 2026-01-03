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

export default function MediaBlock({ ex, pref }: { ex: Exercise; pref: MediaPref }) {
  const wantsImage = pref === "image" || pref === "both";
  const wantsVideo = pref === "video" || pref === "both";

  const hasImage = Boolean(ex.imageUrl);
  const hasVideo = Boolean(ex.videoUrl);

  const embed = ex.videoUrl && isYoutube(ex.videoUrl) ? youtubeEmbed(ex.videoUrl) : null;
  const showPlaceholder = (wantsImage && !hasImage) || (wantsVideo && !hasVideo);

  return (
    <Card title="Wizualizacja">
      <div className="space-y-3">
        {wantsImage && (
          <div>
            {hasImage ? (
              // używamy <img>, żeby nie konfigurować domen w next/image
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ex.imageUrl!} alt={ex.name_pl} className="w-full rounded-xl border border-white/10" />
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Brak obrazka.
              </div>
            )}
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
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Brak wideo.
              </div>
            )}
          </div>
        )}

        {showPlaceholder && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
            Brak wizualizacji — dodaj link w exerciseCatalog (imageUrl / videoUrl).
          </div>
        )}
      </div>
    </Card>
  );
}
