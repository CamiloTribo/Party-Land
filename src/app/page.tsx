import { Metadata } from "next";
import Game from "~/components/game/Game";
import { AuthGate } from "~/components/game/AuthGate";
import { APP_NAME, APP_DESCRIPTION, APP_OG_IMAGE_URL } from "~/lib/constants";
import { getMiniAppEmbedMetadata } from "~/lib/utils";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: APP_NAME,
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [APP_OG_IMAGE_URL],
    },
    other: {
      "fc:frame": JSON.stringify(getMiniAppEmbedMetadata()),
      "base:app_id": "699eee0074175638d96bf31d",
    },
  };
}

export default function Home() {
  return (
    <AuthGate>
      <Game />
    </AuthGate>
  );
}
