// @ts-check

import axios from "axios";
import { CustomError, MissingParamError } from "../common/error.js";

/**
 * WakaTime data fetcher.
 *
 * @param {{username: string, api_domain: string }} props Fetcher props.
 * @returns {Promise<import("./types").WakaTimeData>} WakaTime data response.
 */
const fetchWakatimeStats = async ({ username, api_domain }) => {
  // Allowlist of accepted WakaTime API domains
  const ALLOWED_API_DOMAINS = [
    "wakatime.com",
    "beta.wakatime.com",
    // Add additional allowed domains here if needed
  ];

  if (!username) {
    throw new MissingParamError(["username"]);
  }

  // Pick a safe domain from the allowlist, default to "wakatime.com"
  let chosenDomain = "wakatime.com";
  if (api_domain && typeof api_domain === "string") {
    // Only allow exact matches in the allowlist
    const sanitizedDomain = api_domain.replace(/\/$/gi, "");
    if (ALLOWED_API_DOMAINS.includes(sanitizedDomain)) {
      chosenDomain = sanitizedDomain;
    }
  }

  try {
    const { data } = await axios.get(
      `https://${chosenDomain}/api/v1/users/${encodeURIComponent(username)}/stats?is_including_today=true`,
    );

    return data.data;
  } catch (err) {
    if (err.response && (err.response.status < 200 || err.response.status > 299)) {
      throw new CustomError(
        `Could not resolve to a User with the login of '${username}'`,
        "WAKATIME_USER_NOT_FOUND",
      );
    }
    throw err;
  }
};

export { fetchWakatimeStats };
export default fetchWakatimeStats;
