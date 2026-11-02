import type { StaticImageData } from "next/image";
import credits from "./image-credits.json";
import type { ImageKey, SiteImage } from "./types";

import sigiriyaAerial from "@/assets/images/sigiriya-aerial.jpg";
import sigiriyaRock from "@/assets/images/sigiriya-rock.jpg";
import dambullaCave from "@/assets/images/dambulla-cave-temple.jpg";
import kandyTemple from "@/assets/images/kandy-temple-of-the-tooth.jpg";
import kandyPerahera from "@/assets/images/kandy-esala-perahera.jpg";
import ellaTrain from "@/assets/images/ella-nine-arches-train.jpg";
import ellaAerial from "@/assets/images/ella-nine-arches-aerial.jpg";
import teaPlucking from "@/assets/images/tea-plucking-talawakelle.jpg";
import galleLighthouse from "@/assets/images/galle-lighthouse.jpg";
import galleClockTower from "@/assets/images/galle-clock-tower.jpg";
import yalaLeopard from "@/assets/images/yala-leopard.jpg";
import minneriyaElephants from "@/assets/images/minneriya-elephants.jpg";
import safariElephant from "@/assets/images/safari-elephant.jpg";
import mirissaBeach from "@/assets/images/mirissa-beach.jpg";
import mirissaShore from "@/assets/images/mirissa-shore.jpg";

const files: Record<ImageKey, [StaticImageData, string]> = {
  sigiriyaAerial: [sigiriyaAerial, "sigiriya-aerial.jpg"],
  sigiriyaRock: [sigiriyaRock, "sigiriya-rock.jpg"],
  dambullaCave: [dambullaCave, "dambulla-cave-temple.jpg"],
  kandyTemple: [kandyTemple, "kandy-temple-of-the-tooth.jpg"],
  kandyPerahera: [kandyPerahera, "kandy-esala-perahera.jpg"],
  ellaTrain: [ellaTrain, "ella-nine-arches-train.jpg"],
  ellaAerial: [ellaAerial, "ella-nine-arches-aerial.jpg"],
  teaPlucking: [teaPlucking, "tea-plucking-talawakelle.jpg"],
  galleLighthouse: [galleLighthouse, "galle-lighthouse.jpg"],
  galleClockTower: [galleClockTower, "galle-clock-tower.jpg"],
  yalaLeopard: [yalaLeopard, "yala-leopard.jpg"],
  minneriyaElephants: [minneriyaElephants, "minneriya-elephants.jpg"],
  safariElephant: [safariElephant, "safari-elephant.jpg"],
  mirissaBeach: [mirissaBeach, "mirissa-beach.jpg"],
  mirissaShore: [mirissaShore, "mirissa-shore.jpg"],
};

function build(key: ImageKey): SiteImage {
  const [src, file] = files[key];
  const credit = credits.find((c) => c.file === file);
  if (!credit) throw new Error(`Missing credit entry for ${file}`);
  return {
    src,
    alt: credit.alt,
    photographer: credit.photographer,
    profile: credit.profile,
    unsplashUrl: `https://unsplash.com/photos/${credit.unsplashId}`,
    location: credit.location,
  };
}

export const images = Object.fromEntries(
  (Object.keys(files) as ImageKey[]).map((key) => [key, build(key)]),
) as Record<ImageKey, SiteImage>;

export const allImages: SiteImage[] = Object.values(images);
