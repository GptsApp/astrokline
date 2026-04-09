export function hasUsableKlineData(options: {
  hasServerKline: boolean;
  savedResult?: { profile?: unknown } | null;
}) {
  return options.hasServerKline || Boolean(options.savedResult?.profile);
}

export function shouldSaveChartAsSelf(
  klines: ReadonlyArray<{ isSelf: boolean }>
) {
  return !klines.some((kline) => kline.isSelf);
}

export function resolveUpdatedKlineIsSelf(
  existingIsSelf: boolean,
  requestedIsSelf?: boolean
) {
  return existingIsSelf || requestedIsSelf === true;
}