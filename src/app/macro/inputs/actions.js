"use server";

import { revalidatePath } from "next/cache";
import { deleteBriefingBySlug, setBriefingReadAt } from "../../../lib/briefings";

export async function deleteEpisodeAction(slug) {
  await deleteBriefingBySlug(slug);
  revalidatePath("/macro/inputs");
}

export async function setEpisodeReadAction(slug, read) {
  await setBriefingReadAt(slug, read);
  revalidatePath("/macro/inputs");
  revalidatePath(`/macro/inputs/${slug}`);
}
