import dotenv from "dotenv";

/**
 * Infers the data type signature of an environment variable value.
 */
export function inferType(val) {
  if (val === null || val === undefined || val === "") return "empty";
  const trimmed = val.trim();

  if (/^(true|false|1|0|yes|no)$/i.test(trimmed)) return "boolean";
  if (/^\d+$/.test(trimmed)) return "number";
  if (
    /^https?:\/\/[^\s]+$/i.test(trimmed) ||
    /^(postgres|mysql|mongodb|redis):\/\/[^\s]+$/i.test(trimmed)
  )
    return "url/uri";
  if (
    /^(sk_live|sk_test|ghp_|eyJ|bearer\s)/i.test(trimmed) ||
    trimmed.length > 32
  )
    return "secret/token";

  return "string";
}

/**
 * Compares two raw .env text buffers and categorizes key differences.
 */
export function processEnvDiff(textA, textB) {
  const mapA = dotenv.parse(textA || "");
  const mapB = dotenv.parse(textB || "");

  const keysA = Object.keys(mapA);
  const keysB = Object.keys(mapB);
  const allKeys = Array.from(new Set([...keysA, ...keysB])).sort();

  const results = allKeys.map((key) => {
    const inA = key in mapA;
    const inB = key in mapB;
    const valA = mapA[key] ?? null;
    const valB = mapB[key] ?? null;

    const typeA = inA ? inferType(valA) : null;
    const typeB = inB ? inferType(valB) : null;

    let status = "MATCH";
    if (inA && !inB) status = "MISSING_IN_B";
    else if (!inA && inB) status = "MISSING_IN_A";
    else if (valA === "" || valB === "") status = "EMPTY_VALUE";
    else if (typeA !== typeB) status = "TYPE_MISMATCH";

    return {
      key,
      inA,
      inB,
      valA,
      valB,
      typeA,
      typeB,
      status,
    };
  });

  return {
    results,
    summary: {
      total: allKeys.length,
      missingInB: results.filter((r) => r.status === "MISSING_IN_B").length,
      missingInA: results.filter((r) => r.status === "MISSING_IN_A").length,
      mismatches: results.filter((r) => r.status === "TYPE_MISMATCH").length,
      empty: results.filter((r) => r.status === "EMPTY_VALUE").length,
      matches: results.filter((r) => r.status === "MATCH").length,
    },
  };
}
