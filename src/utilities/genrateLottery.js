export const generateLotteryOptions = (
    groupStart,
    groupEnd,
    seriesStart,
    seriesEnd,
    numberStart,
    numberEnd
  ) => {
    // Ensure numbers are within 00001-99999 and properly ordered
    [numberStart, numberEnd] = [
      Math.max(1, Math.min(99999, numberStart)),
      Math.max(1, Math.min(99999, numberEnd)),
    ].sort((a, b) => a - b);
  
    return {
      groupOptions: Array.from(
        { length: groupEnd - groupStart + 1 },
        (_, i) => String(groupStart + i)
      ),
      seriesOptions: Array.from(
        { length: seriesEnd.charCodeAt(0) - seriesStart.charCodeAt(0) + 1 },
        (_, i) => String.fromCharCode(seriesStart.charCodeAt(0) + i)
      ).filter((char) => !["I", "O", "F"].includes(char)),
      numberOptions: Array.from({ length: numberEnd - numberStart + 1 }, (_, i) =>
        String(numberStart + i).padStart(5, "0")
      ),
    };
  };