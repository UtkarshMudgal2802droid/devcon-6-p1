export function parseNotice(rawText) {
    // Simple regex-based parsing for messy text
    // e.g. "12345 NDLS 14:30 Heavy rain"
    // Extract train number (5 digits)
    const trainMatch = rawText.match(/\b\d{5}\b/);
    const train = trainMatch ? trainMatch[0] : null;
    // Extract station code (3-4 uppercase letters)
    const stationMatch = rawText.match(/\b[A-Z]{3,4}\b/);
    const station = stationMatch ? stationMatch[0] : null;
    // Extract time (HH:MM)
    const timeMatch = rawText.match(/\b([01]\d|2[0-3]):?([0-5]\d)\b/);
    const expectedTime = timeMatch ? timeMatch[0] : null;
    // Attempt to extract reason
    let reason = undefined;
    const reasonMatch = rawText.match(/reason:?\s*(.*)/i);
    if (reasonMatch && reasonMatch[1]) {
        reason = reasonMatch[1].trim();
    }
    return {
        train,
        station,
        expectedTime,
        reason
    };
}
//# sourceMappingURL=parser.js.map