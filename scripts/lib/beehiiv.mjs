/**
 * beehiiv.mjs - Shared Beehiiv API utilities
 *
 * Fetches all active subscribers with cursor pagination.
 * Requires BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in environment.
 */

const BASE_URL = "https://api.beehiiv.com/v2";

/**
 * Fetch all active Beehiiv subscribers (cursor-paginated, 100/page).
 * Returns array of subscriber objects.
 */
export async function fetchAllSubscribers() {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey) {
    console.error("ERROR: BEEHIIV_API_KEY not found in environment");
    process.exit(1);
  }
  if (!publicationId) {
    console.error("ERROR: BEEHIIV_PUBLICATION_ID not found in environment");
    process.exit(1);
  }

  const subscribers = [];
  let cursor = undefined;
  let page = 0;

  while (true) {
    page++;
    const url = new URL(
      `${BASE_URL}/publications/${publicationId}/subscriptions`
    );
    url.searchParams.set("limit", "100");
    url.searchParams.set("status", "active");
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`ERROR: Beehiiv API ${res.status}: ${body}`);
      process.exit(1);
    }

    const json = await res.json();
    const batch = json.data || [];
    subscribers.push(...batch);

    process.stderr.write(`  Fetched page ${page} (${batch.length} subscribers, ${subscribers.length} total)\r`);

    if (!json.next_cursor || batch.length === 0) {
      break;
    }
    cursor = json.next_cursor;
  }

  process.stderr.write("\n");
  return subscribers;
}
